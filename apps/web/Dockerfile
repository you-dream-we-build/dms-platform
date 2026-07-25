# syntax=docker/dockerfile:1
# =============================================================================
# apps/web — Next.js 16 public site (deygalmemorialsociety.com)
# Build context = repo root.
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.deygalmemorialsociety.com/api \
#     -t dms-web .
#
# NEXT_PUBLIC_API_URL is BAKED IN at build time (inlined into the browser bundle
# and next.config.js image remotePatterns) → it MUST be a build arg, and the
# resulting image is environment-specific.
# =============================================================================

# ---- Builder ----------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /workspace
ENV NX_DAEMON=false

# Build-time public API URL (defaults to local dev if not supplied).
ARG NEXT_PUBLIC_API_URL=http://localhost:3333/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Produces dist/apps/web/.next/standalone (self-contained server + node_modules).
RUN npx nx build web --skip-nx-cache

# ---- Runner: minimal standalone server --------------------------------------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

RUN groupadd --system nodejs && useradd --system --gid nodejs --home /app nodejs

# Standalone bundle: entry at apps/web/server.js, node_modules + compiled server
# under dist/apps/web/.next (chdir(apps/web); distDir = ../../dist/apps/web/.next).
COPY --from=builder /workspace/dist/apps/web/.next/standalone ./
# Static assets and public/ are NOT included in standalone — graft them back in
# at the paths the server resolves them from (validated against a live run).
COPY --from=builder /workspace/dist/apps/web/.next/static ./dist/apps/web/.next/static
COPY --from=builder /workspace/dist/apps/web/public ./apps/web/public

RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
