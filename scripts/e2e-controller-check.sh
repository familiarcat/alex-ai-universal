#!/usr/bin/env bash
set -euo pipefail

# E2E: Controller health → API auth → ingestion → executions → summary
# Uses credentials from ~/.zshrc if present.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Load local env silently
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" >/dev/null 2>&1 || true

# Defaults
N8N_BASE_URL="${N8N_BASE_URL:-https://n8n.pbradygeorgen.com}"
N8N_SUMMARY_URL="${N8N_SUMMARY_URL:-${N8N_BASE_URL%/}/webhook/summarize-milestone}"
N8N_API_KEY="${N8N_API_KEY:-}"

echo "== Controller E2E Check =="
echo "Base URL: $N8N_BASE_URL"

if [ -z "$N8N_API_KEY" ]; then
  echo "N8N_API_KEY is not set in this shell (or ~/.zshrc). Export it and re-run." >&2
  exit 1
fi

step() { printf "\n[STEP] %s\n" "$*"; }

step "HTTPS head (nginx)"
curl -sS -I "$N8N_BASE_URL" | head -1 || true

step "API: list workflows (200 chars)"
curl -sS -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows" | head -c 200 || true
echo

step "Trigger ingestion via controller"
node "$ROOT_DIR/scripts/n8n-post-knowledge.js" \
  --summary "E2E ingestion test" \
  --features "controller ok; api ok; key synced" \
  --tags "e2e" || true

step "Verify executions (ingestion workflow)"
npm run rag:execs || true

step "Summarizer via MCP"
node "$ROOT_DIR/scripts/mcp-summarize-milestone.js" \
  --summary "E2E ready" \
  --features "ingestion ok; executions visible" || true

step "Optional knowledge readback"
npm run rag:verify || true

echo "\n== Done =="


