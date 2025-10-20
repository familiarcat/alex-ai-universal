#!/usr/bin/env bash
set -euo pipefail

# Watcher: re-export tokens and run figma-sync-all.sh when theme defs change.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THEME_DEF="$ROOT_DIR/universal-theme-system/theme-definitions.js"

echo "Watching $THEME_DEF for changes… (Ctrl+C to stop)"

hash fswatch >/dev/null 2>&1 || { echo "Please install fswatch (brew install fswatch)"; exit 1; }

fswatch -o "$THEME_DEF" | while read -r _; do
  echo "Change detected. Re-exporting all tokens and syncing…"
  node "$ROOT_DIR/scripts/export-themes-for-figma.js" >/dev/null || true
  bash "$ROOT_DIR/scripts/figma-sync-all.sh" || true
  echo "Cycle complete."
done




