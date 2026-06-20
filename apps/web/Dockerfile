# ---- Subtext web image ----
# Builds the React/Vite SPA and serves it with nginx. nginx also reverse-proxies
# /trpc and /health to the API server, so the browser talks to one origin
# (no CORS) and the cluster only needs one ingress backend.

FROM node:22-bookworm-slim AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm@11.8.0
WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter "@subtext/web..." --ignore-scripts \
  && pnpm rebuild --filter "@subtext/web" esbuild

COPY packages/shared packages/shared
COPY apps/web apps/web
# Empty API URL => the client calls a relative /trpc, which nginx proxies.
ENV VITE_API_URL=""
RUN pnpm --filter @subtext/web build

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
# The official nginx image runs envsubst over /etc/nginx/templates/*.template
# at startup. Scope substitution to SERVER_UPSTREAM so nginx's own $host/$uri
# variables are left intact.
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV NGINX_ENVSUBST_FILTER="SERVER_UPSTREAM"
# Upstream the API proxy points at; override per environment.
ENV SERVER_UPSTREAM="server:3000"
EXPOSE 80
