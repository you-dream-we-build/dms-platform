# syntax=docker/dockerfile:1
# =============================================================================
# apps/api — NestJS REST API (api.deygalmemorialsociety.com)
# Build context = repo root (needs the whole Nx workspace + lockfile).
#   docker build -f apps/api/Dockerfile -t dms-api .
# bcrypt is a native addon → glibc base (bookworm), not alpine/musl.
# =============================================================================

# ---- Builder: install workspace deps, build the app, then prod-install ------
FROM node:22-bookworm-slim AS builder
WORKDIR /workspace
ENV NX_DAEMON=false

# Toolchain for native addons (bcrypt) in case no prebuilt binary is available.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Install against the lockfile first (cached until dependencies change).
COPY package.json package-lock.json ./
RUN npm ci

# Build the API → dist/apps/api (main.js + generated prod package.json/lockfile).
COPY . .
RUN npx nx build api --skip-nx-cache

# Install ONLY production deps for the built app; compiles bcrypt for this platform.
WORKDIR /workspace/dist/apps/api
RUN npm ci --omit=dev

# ---- Runner: minimal runtime image ------------------------------------------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Run as a non-root user.
RUN groupadd --system nodejs && useradd --system --gid nodejs --home /app nodejs

# App bundle + production node_modules (built above).
COPY --from=builder /workspace/dist/apps/api ./

# Uploads dir. Path is process.cwd()/apps/api/uploads (cwd = /app here), so it
# resolves to /app/apps/api/uploads — mount a named volume there in compose.
RUN mkdir -p /app/apps/api/uploads && chown -R nodejs:nodejs /app

USER nodejs
EXPOSE 3333
# All runtime config (MONGODB_URI, JWT_SECRET, CORS_ORIGINS, PORT) is injected
# at container start via compose env_file / environment — never baked in.
CMD ["node", "main.js"]
