#!/usr/bin/env bash
set -euo pipefail

# Orchestrate Figma <-> App token flow.
# 1) Export tokens JSON for all themes
# 2) Serve JSON for URL Sync Provider (optional)
# 3) After you publish in Figma, sync back into the app

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[1/3] Exporting tokens…"
node "$ROOT_DIR/scripts/export-themes-for-figma.js"

echo "[2/3] Starting local server for plugin URL import (Ctrl+C to stop)."
echo "    In Tokens Studio → Settings → Sync Providers → Add → URL (per theme)."
echo "    Use URLs printed below, Pull, then Create/Push Variables → Publish in Figma."
bash "$ROOT_DIR/scripts/figma-export-serve.sh" 8087

# Step 3 runs after you stop the server
echo "[3/3] Syncing published variables back into the app…"
bash "$ROOT_DIR/scripts/figma-sync-all.sh"
echo "Done. You can verify via /api/themes/<theme>/tokens."




