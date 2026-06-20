#!/bin/sh
# Subtext server entrypoint: sync the DB schema, optionally seed, then start.
set -e

cd /repo/apps/server
BIN=/repo/apps/server/node_modules/.bin

echo "[subtext] Applying database schema (prisma db push)…"
"$BIN/prisma" db push \
  --schema /repo/apps/server/prisma/schema.prisma \
  --skip-generate \
  --accept-data-loss

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "[subtext] Seeding demo data…"
  "$BIN/tsx" prisma/seed.ts || echo "[subtext] Seed step failed (continuing)."
fi

echo "[subtext] Starting server on :${PORT:-3000}…"
exec "$BIN/tsx" src/index.ts
