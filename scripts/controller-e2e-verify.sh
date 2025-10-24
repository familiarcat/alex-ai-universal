#!/usr/bin/env bash
set -euo pipefail

# End-to-end controller verification:
# 1) Sync API key to EC2 n8n via SSH and restart service
# 2) Verify controller executions (RAG ingestion)
# 3) Optionally call milestone summarizer

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Load local env
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" >/dev/null 2>&1 || true

N8N_HOST_DEFAULT="https://n8n.pbradygeorgen.com"
N8N_BASE_URL="${N8N_BASE_URL:-$N8N_HOST_DEFAULT}"
N8N_API_KEY="${N8N_API_KEY:-}"   # required
SUMMARY_URL_DEFAULT="${N8N_BASE_URL%/}/webhook/summarize-milestone"
N8N_SUMMARY_URL="${N8N_SUMMARY_URL:-$SUMMARY_URL_DEFAULT}"

if [ -z "$N8N_API_KEY" ]; then
  echo "N8N_API_KEY is not set. Export it in your shell or ~/.zshrc and rerun." >&2
  exit 1
fi

echo "[1/3] Syncing API key to controller and restarting n8n..."
chmod +x "$ROOT_DIR/scripts/update-n8n-api-key.sh"
N8N_API_KEY="$N8N_API_KEY" "$ROOT_DIR/scripts/update-n8n-api-key.sh"

echo "[2/3] Verifying controller executions (RAG ingestion)..."
export N8N_BASE_URL
export N8N_API_KEY
npm run rag:execs || true

echo "[3/3] Requesting crew summary via controller (best-effort)..."
export N8N_SUMMARY_URL
node "$ROOT_DIR/scripts/n8n-summarize-milestone.js" --summary "Controller E2E verify" --features "API key synced; executions listed" || true

echo "Done."


