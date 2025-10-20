#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[1/4] Ensuring FIGMA_WEBHOOK_SECRET exists…"
"$ROOT_DIR/scripts/ensure-figma-webhook-secret.sh"

echo "[2/4] Exporting Tokens Studio JSON for all themes…"
node "$ROOT_DIR/scripts/export-themes-for-figma.js"

echo "[3/4] Serving tokens for Tokens Studio URL Sync (Ctrl+C to continue)…"
echo "    In Tokens Studio → Settings → Sync Providers → URL."
echo "    Use the URLs printed by the server (default port 8087)."
"$ROOT_DIR/scripts/figma-export-serve.sh" 8087 || true

echo "[4/4] Syncing published Figma Variables back into app overrides…"
"$ROOT_DIR/scripts/figma-sync-all.sh"

echo "Done. Verify via /api/themes/<theme>/tokens."


