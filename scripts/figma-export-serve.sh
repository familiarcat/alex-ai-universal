#!/usr/bin/env bash
set -euo pipefail

# Serve the Tokens Studio export folder over HTTP so the plugin can use URL Sync Provider.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPORT_DIR="$ROOT_DIR/examples/demo-project/universal-theme-system/figma-export"
PORT=${1:-8087}

if [ ! -d "$EXPORT_DIR" ]; then
  echo "Export directory not found: $EXPORT_DIR" >&2
  exit 1
fi

echo "Serving $EXPORT_DIR on http://localhost:$PORT"
echo "Sample URLs:"
for f in "$EXPORT_DIR"/*.tokens.json; do
  [ -e "$f" ] || continue
  name=$(basename "$f")
  echo "  - http://localhost:$PORT/$name"
done

cd "$EXPORT_DIR"
python3 -m http.server "$PORT"




