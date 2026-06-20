# ---- Subtext API server image ----
# Builds the server + shared subtree and runs it with tsx (on-the-fly TS),
# which keeps workspace package resolution simple and avoids a separate build.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# openssl + ca-certificates are required by the Prisma engines.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm@11.8.0
WORKDIR /repo

# ---- deps: install only the server subtree (shared + server) ----
FROM base AS deps
# Manifests first for layer caching. All workspace manifests are needed so the
# frozen lockfile validates, but `--filter` keeps us from pulling in the web app.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
# --ignore-scripts: skip the server's `postinstall: prisma generate` here (the
# schema isn't in this cache-friendly layer yet); we generate it in the build
# stage. Then rebuild esbuild so tsx works at runtime.
RUN pnpm install --frozen-lockfile --filter "@subtext/server..." --ignore-scripts \
  && pnpm rebuild --filter "@subtext/server" esbuild

# ---- build: generate the Prisma client against the chosen provider ----
FROM deps AS build
COPY packages/shared packages/shared
COPY apps/server apps/server
# Default to PostgreSQL for container/k8s deployments. Pass
# --build-arg DATABASE_PROVIDER=sqlite for a file-backed single-pod deploy.
ARG DATABASE_PROVIDER=postgresql
RUN sed -i "s/provider = \"sqlite\"/provider = \"${DATABASE_PROVIDER}\"/" \
      apps/server/prisma/schema.prisma \
  && pnpm --filter @subtext/server db:generate

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/server
EXPOSE 3000
ENTRYPOINT ["sh", "/repo/apps/server/docker-entrypoint.sh"]
