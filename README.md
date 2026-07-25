# DMS Platform

**Degyal Memorial Society** — an educational-support nonprofit platform. An [Nx](https://nx.dev) monorepo with three deployable apps and one shared library, deployed to a single OCI VM with Docker, an nginx reverse proxy (automatic TLS), and a GitOps release flow driven by GitHub Actions.

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Repository layout](#repository-layout)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Docker images](#docker-images)
- [CI: build & push (`main` branch)](#ci-build--push-main-branch)
- [CD: GitOps deployment (`gitops` branch)](#cd-gitops-deployment-gitops-branch)
- [Secrets: OCI Vault + instance principal](#secrets-oci-vault--instance-principal)
- [Domains & TLS](#domains--tls)
- [One-time setup checklist](#one-time-setup-checklist)
- [Notable fixes & gotchas](#notable-fixes--gotchas)
- [Nx reference](#nx-reference)

---

## Architecture overview

Three apps share one domain family. All traffic terminates at an nginx reverse proxy on the VM, which routes by hostname and manages Let's Encrypt certificates automatically.

| App | Stack | Container port | Public domain | Role |
|-----|-------|:---:|---------------|------|
| `apps/web` | Next.js 16 (App Router, React 19), standalone server | 3000 | `deygalmemorialsociety.com` | Public site — read-only students/donors + public student registration |
| `apps/bo` | Vite + React 19 SPA (static, served by nginx) | 80 | `bo.deygalmemorialsociety.com` | Authenticated admin backoffice (JWT) — CRUD over students/donors |
| `apps/api` | NestJS 11 + Express, Mongoose | 3333 | `api.deygalmemorialsociety.com` | REST API (all routes under `/api`), Swagger at `/api/docs`, image uploads |
| `libs/shared` | TypeScript types (`@dms-platform/shared`) | — | — | Canonical `Student`/`Donor`/`Admin`/`ApiResponse` types |

```
                          Internet
                             │
                 ┌───────────┴───────────┐
                 │   nginx-proxy (:443)   │  ← Let's Encrypt via acme-companion
                 └───────────┬───────────┘
        ┌────────────────────┼────────────────────┐
        │                    │                     │
  dms.sumedhsakya      api-dms.sumedhsakya    bo-dms.sumedhsakya
        │                    │                     │
   ┌────▼────┐          ┌────▼────┐           ┌────▼────┐
   │  web    │          │   api   │           │   bo    │
   │ :3000   │          │ :3333   │           │  :80    │
   └─────────┘          └────┬────┘           └─────────┘
                             │  ├─ MongoDB Atlas (external)
                             │  └─ uploads volume (/app/apps/api/uploads)
```

- **Database:** MongoDB **Atlas** (external managed cluster — not containerized). The VM's egress IP must be on the Atlas allowlist.
- **Host:** a single **OCI** VM, **aarch64/arm64**, ~1 vCPU / 6 GB RAM, sized for ~20–30 users.
- **Registry:** GitHub Container Registry (**GHCR**), private.

---

## Repository layout

```
apps/
  api/        NestJS API      — Dockerfile, .env.sample
  web/        Next.js site    — Dockerfile, .env.sample, next.config.js (standalone)
  bo/         Vite SPA        — Dockerfile, nginx.conf, .env.sample
  *-e2e/      Playwright e2e projects
libs/
  shared/     shared TS types (@dms-platform/shared)
.github/workflows/
  build.yml            orchestrator: detect changes → build → bump gitops tags
  _build-image.yml     reusable: build + push one image to GHCR
.dockerignore
```

The **runtime stack** (`docker-compose.yml`, `image-tags.env`, `deploy.yml`) is maintained on a separate **`gitops` branch** of this same repo — see [CD](#cd-gitops-deployment-gitops-branch).

---

## Local development

### Prerequisites

- Node.js 20+ (CI/Docker builds use Node 22)
- npm (repo uses `package-lock.json`; run `npm ci`)
- A MongoDB connection string (local `mongod` or an Atlas dev cluster)

### Install & run

```sh
npm ci

npm run dev        # web  (Next.js) on :3000  — alias dev:web
npm run dev:api    # api  (NestJS)  on :3333
npm run dev:bo     # bo   (Vite)    on :4201
npm run dev:all    # api + bo together (parallel)
```

Per-project Nx targets:

```sh
npx nx build <api|web|bo>          # production build
npx nx lint  <project>             # eslint
npx nx test  <api|bo|shared>       # jest (api) / vitest (bo, shared)
npm run seed                       # seed Mongo with samples + default admin
```

`npm run seed` creates a default superadmin (`admin@dms.org` / `Admin@123`) plus sample data — only when each collection is empty (idempotent).

---

## Environment variables

There is a critical split between **build-time** and **runtime** config.

### `apps/api` — all **runtime** (injected at container start)

See [`apps/api/.env.sample`](apps/api/.env.sample).

| Variable | Purpose | Example (prod) |
|----------|---------|----------------|
| `MONGODB_URI` | Atlas connection string | `mongodb+srv://…/dms-platform` |
| `JWT_SECRET` | JWT signing secret (long, random) | `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `PORT` | Listen port | `3333` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://deygalmemorialsociety.com,https://bo.deygalmemorialsociety.com` |

These are **never baked into the image**. In production they come from OCI Vault (see [Secrets](#secrets-oci-vault--instance-principal)).

### `apps/web` & `apps/bo` — **build-time** (baked into the bundle)

See [`apps/web/.env.sample`](apps/web/.env.sample) and [`apps/bo/.env.sample`](apps/bo/.env.sample).

| App | Variable | Notes |
|-----|----------|-------|
| web | `NEXT_PUBLIC_API_URL` | Inlined by `next build`; also drives `next.config.js` image `remotePatterns`. Prod: `https://api.deygalmemorialsociety.com/api` |
| bo | `VITE_API_BASE_URL` | Inlined by Vite into the static bundle. Prod: `https://api.deygalmemorialsociety.com/api` |

> ⚠️ Because these are compiled in, the **web and bo images are environment-specific** and must receive the value as a **Docker build arg** (the CI passes them from repo variables `WEB_API_URL` / `BO_API_URL`, defaulting to the production API URL). The **api image is environment-agnostic** — same image runs anywhere; only its runtime env changes.

---

## Docker images

Each app has a multi-stage Dockerfile built from the **repo root** context (the whole Nx workspace + lockfile are needed).

| Image | Dockerfile | Runtime base | Notes |
|-------|-----------|--------------|-------|
| `dms-api` | [`apps/api/Dockerfile`](apps/api/Dockerfile) | `node:22-bookworm-slim` | glibc base (the `bcrypt` native addon has no musl prebuilds); non-root; prod-only deps; uploads at `/app/apps/api/uploads` |
| `dms-web` | [`apps/web/Dockerfile`](apps/web/Dockerfile) | `node:22-bookworm-slim` | Next.js **standalone** server (small, low-RAM); `ARG NEXT_PUBLIC_API_URL`; non-root |
| `dms-bo` | [`apps/bo/Dockerfile`](apps/bo/Dockerfile) | `nginx:1.27-alpine` | static SPA; `ARG VITE_API_BASE_URL`; SPA fallback via [`apps/bo/nginx.conf`](apps/bo/nginx.conf) |

[`.dockerignore`](.dockerignore) keeps the build context small (excludes `node_modules`, `dist`, `.git`, `.env*`, `apps/api/uploads`, …); dependencies are reinstalled from `package-lock.json` inside the image.

### Build locally

```sh
docker build -f apps/api/Dockerfile -t dms-api:dev .

docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.deygalmemorialsociety.com/api \
  -t dms-web:dev .

docker build -f apps/bo/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://api.deygalmemorialsociety.com/api \
  -t dms-bo:dev .
```

### Design notes

- **Standalone Next.js:** the web runtime image contains only the traced server + `node_modules`. `static/` and `public/` are grafted back to the paths the server resolves (`dist/apps/web/.next/static`, `apps/web/public`). Entry: `node apps/web/server.js`.
- **Uploads persistence:** the api writes uploads to `process.cwd()/apps/api/uploads` → `/app/apps/api/uploads` in the container. Compose mounts a **named volume** there so images survive redeploys.

---

## CI: build & push (`main` branch)

Workflow: [`.github/workflows/build.yml`](.github/workflows/build.yml) + reusable [`_build-image.yml`](.github/workflows/_build-image.yml).

### What happens

1. **Detect changes** (`dorny/paths-filter`) on push to `main`:
   - `apps/api/**` → build **api**; `apps/web/**` → **web**; `apps/bo/**` → **bo**.
   - Any **non-app** change to `package.json`, `package-lock.json`, `tsconfig*.json`, `nx.json`, `libs/**`, or a root `*.ts` → rebuild **all three** (shared inputs affect every image). App-local `.ts` changes still build only that app.
   - `workflow_dispatch` with `build_all: true` forces all three.
2. **Build & push** each changed image on a **`ubuntu-24.04-arm`** hosted runner → **native `linux/arm64`** (matches the aarch64 VM; no QEMU). GHA layer caching speeds rebuilds.
   - Tag = **short commit SHA** → `ghcr.io/<owner>/dms-<app>:<sha7>` (the "app-hash" scheme: app in the image name, hash in the tag).
3. **Bump** (`bump` job): writes the new tag(s) into `image-tags.env` on the **`gitops`** branch (`API_IMAGE_TAG` / `WEB_IMAGE_TAG` / `BO_IMAGE_TAG`) and pushes.

### The trigger chain

```
push to main ──▶ build.yml ──▶ GHCR (arm64 image) ──▶ commit image-tags.env on gitops ──▶ deploy.yml
```

> ⚠️ **Anti-recursion gotcha:** a commit pushed with the default `GITHUB_TOKEN` does **not** trigger another workflow. The bump therefore pushes with a **fine-grained PAT (`GITOPS_PAT`)** so the deploy workflow actually fires.

### Required GitHub configuration

| Kind | Name | Purpose |
|------|------|---------|
| Secret | `GITOPS_PAT` | Fine-grained PAT, **Contents: read+write** on this repo → lets the bump push to `gitops` and trigger deploy |
| Secret | `SSH_HOST`, `SSH_USER`, `SSH_KEY` (+ `SSH_PORT`?) | VM access for the deploy workflow |
| Variable (optional) | `WEB_API_URL`, `BO_API_URL` | Override the baked API URL (default: `https://api.deygalmemorialsociety.com/api`) |
| Repo setting | Settings → Actions → Workflow permissions | Allow `GITHUB_TOKEN` package write (GHCR push) |

> **Private-repo note:** GitHub-hosted **arm64** runners are free for *public* repos; for *private* repos they require a paid plan / billing enabled. If a run can't find the runner, either enable billing, make the repo public, or fall back to QEMU on `ubuntu-latest`.

---

## CD: GitOps deployment (`gitops` branch)

The runtime topology is declarative and lives on an **orphan `gitops` branch** of this repo (kept separate from application code so tag bumps don't touch `main`). Its contents:

- `docker-compose.yml` — the full stack: `nginx-proxy`, `acme-companion`, `api`, `web`, `bo`, the uploads volume.
- `image-tags.env` — the per-image SHA tags, updated by CI. Compose interpolates them: `image: ghcr.io/<owner>/dms-api:${API_IMAGE_TAG}`.
- `deploy.yml` — GitHub Actions workflow that deploys to the VM on any push to `gitops`.

### Deploy flow

```
push to gitops (tag bump) ──▶ deploy.yml
   1. checkout gitops
   2. scp docker-compose.yml + image-tags.env → VM:/opt/dms
   3. ssh VM:
        a. fetch secrets from OCI Vault (instance principal) → apps/api/.env
        b. docker login ghcr.io   (pull token from OCI Vault)
        c. docker compose --env-file image-tags.env pull
        d. docker compose --env-file image-tags.env up -d
```

The VM only needs Docker + the OCI CLI; it holds **no long-lived credentials** (see below).

---

## Secrets: OCI Vault + instance principal

Application secrets are stored in **OCI Vault** (Oracle Cloud's managed secret service), and the VM authenticates to it using an **instance principal** — an identity granted to the VM itself via IAM — so **no API keys or tokens are stored on the VM or in GitHub**.

- **What's stored:** a single OCI secret holding the full `apps/api/.env` body (`MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS`, …), plus a GHCR **read** token (for pulling private images).
- **How the VM reads it:**
  1. The VM is a member of an IAM **dynamic group** (matched by OCID/compartment).
  2. A **policy** grants that dynamic group `read` on the secret(s).
  3. At deploy time the VM runs the OCI CLI with `--auth instance_principal`, fetches the secret bundle, base64-decodes it, and writes `apps/api/.env` (which compose loads via `env_file`).

This supersedes the earlier HCP Vault Secrets plan; because the VM already lives in OCI, instance principals remove the need for any stored service-principal credential.

---

## Domains & TLS

Handled inside the compose stack by [`nginx-proxy`](https://github.com/nginx-proxy/nginx-proxy) + [`acme-companion`](https://github.com/nginx-proxy/acme-companion): each app container declares `VIRTUAL_HOST` and `LETSENCRYPT_HOST`, and certificates are issued and auto-renewed from Let's Encrypt with no hand-written nginx config.

| Domain | → service |
|--------|-----------|
| `deygalmemorialsociety.com` | web |
| `api.deygalmemorialsociety.com` | api |
| `bo.deygalmemorialsociety.com` | bo |

**DNS:** point all three A records at the VM's public IP. **Firewall:** open 80 + 443 on the VM (and the OCI security list / NSG).

---

## One-time setup checklist

1. **GitHub secrets/vars:** `GITOPS_PAT`, `SSH_HOST/USER/KEY`, optional `WEB_API_URL`/`BO_API_URL`; allow `GITHUB_TOKEN` package write.
2. **`gitops` branch:** create the orphan branch with `docker-compose.yml`, `image-tags.env`, `deploy.yml`.
3. **OCI:** create the Vault + secret (the api `.env` body), a dynamic group for the VM, and a policy granting secret read.
4. **VM:** install Docker + Compose + OCI CLI; open ports 80/443; create `/opt/dms`.
5. **MongoDB Atlas:** add the VM egress IP to the allowlist.
6. **DNS:** A records for the three domains → VM IP.

---

## Notable fixes & gotchas

Two pre-existing bugs blocked *any* production build (dev `nx serve` masked them via SWC's leniency); both are fixed:

1. **`apps/web/next.config.js`** — `remotePatterns[].protocol` was typed `string` but Next 16 requires the literal `'http' | 'https'`, so `next build` failed. Fixed with a JSDoc cast; also added `output: 'standalone'` for the lean Docker runtime.
2. **`package-lock.json` out of sync** — `@types/multer` was in `package.json` (for the upload feature) but never installed into the lockfile, so `npm ci` (used by Docker/CI) failed. Synced.

Other things to remember:
- **arm64 everywhere** — images are `linux/arm64` to match the OCI VM. Don't build/pull amd64.
- **Baked build args** — changing the API URL for web/bo requires a **rebuild**, not just a restart.
- **Uploads** live on a named volume; don't `docker compose down -v` in production or you'll delete uploaded images.

---

## Nx reference

```sh
npx nx graph                       # visualize the project graph
npx nx show project web --web      # list a project's targets
npm run clean                      # nx reset (clear cache)
```

Learn more: [Nx docs](https://nx.dev).
