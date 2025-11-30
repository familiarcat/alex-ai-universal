#!/usr/bin/env bash
set -euo pipefail

# Ship Preflight Health Check
# - Gathers repo, runtime, port, and n8n health info
# - Writes JSON report to deployment-reports/ship-health-YYYY-MM-DDTHHMMSS.json
# - Optional: --free-ports (kills 3000–3010)

FREE_PORTS=false
for arg in "$@"; do
  case "$arg" in
    --free-ports) FREE_PORTS=true ;;
  esac
done

timestamp=$(date -u +%Y-%m-%dT%H%M%SZ)
repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ -z "$repo_root" ]]; then
  echo "{}"; exit 0
fi
cd "$repo_root"

branch=$(git rev-parse --abbrev-ref HEAD)
commit=$(git rev-parse HEAD)
remote=$(git remote get-url origin 2>/dev/null || echo "")
status_dirty=false
if ! git diff --quiet || ! git diff --cached --quiet; then status_dirty=true; fi

# Ahead/behind if tracking
ahead=0; behind=0
upstream=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || true)
if [[ -n "$upstream" ]]; then
  ahead=$(git rev-list --left-right --count "$upstream"...HEAD | awk '{print $2}')
  behind=$(git rev-list --left-right --count "$upstream"...HEAD | awk '{print $1}')
fi

node_v=$(node -v 2>/dev/null || echo "")
npm_v=$(npm -v 2>/dev/null || echo "")

# Ports 3000–3010
ports_json="["
first=true
for p in $(seq 3000 3010); do
  pids=$(lsof -t -i tcp:$p 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    for pid in $pids; do
      cmd=$(ps -o comm= -p $pid 2>/dev/null || echo "")
      [[ "$first" == true ]] || ports_json+=" ,"
      ports_json+="{\"port\":$p,\"pid\":$pid,\"cmd\":\"${cmd//\"/\\\"}\"}"
      first=false
      if [[ "$FREE_PORTS" == true ]]; then kill -9 "$pid" >/dev/null 2>&1 || true; fi
    done
  fi
done
ports_json+="]"

# n8n health (best-effort)
set +u
[[ -f "$HOME/.zshrc" ]] && source "$HOME/.zshrc" >/dev/null 2>&1 || true
set -u
n8n_url=${N8N_URL:-${N8N_BASE_URL:-}}
n8n_health="unknown"
if [[ -n "$n8n_url" ]]; then
  if curl -s -f "$n8n_url/healthz" >/dev/null; then n8n_health="ok"; else n8n_health="down"; fi
fi

mkdir -p deployment-reports
out="deployment-reports/ship-health-${timestamp}.json"

{
  echo "{"
  echo "  \"timestamp\": \"$timestamp\","
  echo "  \"repo\": {"
  echo "    \"root\": \"${repo_root//\"/\\\"}\","
  echo "    \"branch\": \"${branch//\"/\\\"}\","
  echo "    \"commit\": \"$commit\","
  echo "    \"remote\": \"${remote//\"/\\\"}\","
  echo "    \"status_dirty\": $status_dirty,"
  echo "    \"ahead\": $ahead, \"behind\": $behind"
  echo "  },"
  echo "  \"runtime\": { \"node\": \"$node_v\", \"npm\": \"$npm_v\" },"
  echo "  \"ports\": $ports_json,"
  echo "  \"n8n\": { \"url\": \"${n8n_url//\"/\\\"}\", \"health\": \"$n8n_health\" }"
  echo "}"
} > "$out"

echo "✅ Ship preflight report -> $out"



