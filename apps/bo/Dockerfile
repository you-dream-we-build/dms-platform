# syntax=docker/dockerfile:1
# =============================================================================
# apps/bo — Vite + React backoffice SPA (bo.deygalmemorialsociety.com)
# Build context = repo root.
#   docker build -f apps/bo/Dockerfile \
#     --build-arg VITE_API_BASE_URL=https://api.deygalmemorialsociety.com/api \
#     -t dms-bo .
#
# VITE_API_BASE_URL is BAKED IN at build time (inlined into the static bundle)
# → it MUST be a build arg, and the resulting image is environment-specific.
# The runtime image is just nginx serving static files.
# =============================================================================

# ---- Builder ----------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /workspace
ENV NX_DAEMON=false

# Build-time API base URL (Vite reads VITE_* from process.env — validated).
ARG VITE_API_BASE_URL=http://localhost:3333/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Emits static assets to dist/apps/bo (index.html + assets/).
RUN npx nx build bo --skip-nx-cache

# ---- Runner: nginx static server --------------------------------------------
FROM nginx:1.27-alpine AS runner
COPY apps/bo/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist/apps/bo /usr/share/nginx/html
EXPOSE 80
# nginx:alpine's default CMD runs nginx in the foreground.
