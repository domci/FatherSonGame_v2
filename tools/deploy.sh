#!/bin/sh
# Puts the game and the world server on Cloudflare (M7, ADR 0009).
# Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID. Optional: ADMIN_KEY (parents' page password).
set -e
BUILD="${BUILD:-$(git rev-parse --short HEAD)}"
# The page and the server get the same build id: old pages are told to reload.
VITE_BUILD="$BUILD" bunx vite build
bunx wrangler deploy --var "BUILD:$BUILD"
if [ -n "$ADMIN_KEY" ]; then
  printf '%s' "$ADMIN_KEY" | bunx wrangler secret put ADMIN_KEY
fi
