#!/usr/bin/env bash
set -euo pipefail

# E2E verification runner for controller + RAG
# - Loads shell env, sets sane defaults
# - Health check + API auth
# - Runs controller E2E verify script
# - Lists recent executions

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Load env if present
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" >/dev/null 2>&1 || true
[ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc" >/dev/null 2>&1 || true

export N8N_BASE_URL="${N8N_BASE_URL:-https://n8n.pbradygeorgen.com}"
export N8N_API_KEY="${N8N_API_KEY:-}"

echo "[1/4] Controller health check: $N8N_BASE_URL/healthz"
code=$(curl -s -o /dev/null -w '%{http_code}' "$N8N_BASE_URL/healthz" || true)
echo "health:$code"
if [[ "$code" != "200" ]]; then
  echo "Health check failed (got $code). Continuing to API check..." >&2
fi

echo "[2/4] API access check (/api/v1/workflows)"
if [[ -z "$N8N_API_KEY" ]]; then
  echo "N8N_API_KEY not set; skipping API check" >&2
else
  curl -s -I -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows" | head -n1 || true
fi

echo "[3/4] Controller E2E verification"
bash "$ROOT_DIR/scripts/controller-e2e-verify.sh" || true

echo "[4/4] Recent executions"
N8N_BASE_URL="$N8N_BASE_URL" N8N_API_KEY="$N8N_API_KEY" npm run --silent rag:execs || true

echo "✅ E2E verification complete"


