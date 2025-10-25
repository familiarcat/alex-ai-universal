#!/usr/bin/env bash
set -euo pipefail

# Milestone One-Touch Runner
# - Wraps milestone commit/tag/push
# - Verifies controller access and executions
# - Triggers crew summarizer
#
# Usage examples:
#   bash scripts/milestone-one-touch.sh -s "E2E ready" -f "ingestion ok; executions visible" -n e2e-ready
#   npm run milestone:one-touch -- -s "Title" -f "bullet one; bullet two"

summary=""
features=""
slug=""
branch=""

while getopts ":s:f:n:b:" opt; do
  case "$opt" in
    s) summary="$OPTARG" ;;
    f) features="$OPTARG" ;;
    n) slug="$OPTARG" ;;
    b) branch="$OPTARG" ;;
    :) echo "Option -$OPTARG requires an argument" >&2; exit 1 ;;
    \?) echo "Unknown option -$OPTARG" >&2; exit 1 ;;
  esac
done

if [[ -z "$summary" ]]; then
  echo "❌ Provide -s \"summary\"" >&2; exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Load developer shell env if present (for N8N_* vars)
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" >/dev/null 2>&1 || true
[ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc" >/dev/null 2>&1 || true

N8N_BASE_URL_DEFAULT="https://n8n.pbradygeorgen.com"
export N8N_BASE_URL="${N8N_BASE_URL:-$N8N_BASE_URL_DEFAULT}"
export N8N_API_KEY="${N8N_API_KEY:-}"

echo "[1/4] Milestone push (commit/tag/push + RAG ingest + summary best-effort)"
bash "$ROOT_DIR/scripts/milestone-push.sh" -s "$summary" ${features:+-f "$features"} ${slug:+-n "$slug"} ${branch:+-b "$branch"}

echo "[2/4] Controller API auth check ($N8N_BASE_URL)"
if [[ -n "${N8N_API_KEY}" ]]; then
  if curl -fsS -m 10 -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows" >/dev/null; then
    echo "   ✅ Controller API reachable with API key"
  else
    echo "   ⚠️  Controller API not reachable or unauthorized (continuing): $N8N_BASE_URL" >&2
  fi
else
  echo "   ⚠️  N8N_API_KEY not set; skipping API check"
fi

echo "[3/4] Verify executions list (best-effort)"
if command -v npm >/dev/null 2>&1; then
  N8N_BASE_URL="$N8N_BASE_URL" N8N_API_KEY="$N8N_API_KEY" npm run --silent rag:execs || true
else
  echo "   ⚠️  npm not available; skipping executions verification"
fi

echo "[4/4] Trigger crew summarizer (best-effort)"
node "$ROOT_DIR/scripts/n8n-summarize-milestone.js" --summary "$summary" --features "$features" || true

echo "✅ One-touch milestone flow completed"

exit 0


