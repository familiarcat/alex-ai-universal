#!/usr/bin/env bash
set -euo pipefail

# If not running in zsh, re-invoke via zsh so sourcing ~/.zshrc works (zstyle etc.)
if [ -z "${ZSH_VERSION:-}" ] && command -v zsh >/dev/null 2>&1; then
  exec /bin/zsh -lc "ZDOTDIR=\"$HOME\" '$PWD/${BASH_SOURCE[0]}' $*"
fi

# Source ~/.zshrc so N8N_* envs are available
if [ -f "$HOME/.zshrc" ]; then
  set +u
  . "$HOME/.zshrc"
  set -u
fi

WEBHOOK_URL="${N8N_COLLAB_COMPLETE_WEBHOOK:-${N8N_COLLABORATION_WEBHOOK:-}}"
if [ -z "$WEBHOOK_URL" ]; then
  if [ -n "${N8N_BASE_URL:-}" ]; then
    WEBHOOK_URL="${N8N_BASE_URL%/}/webhook/collaboration-complete"
  else
    echo "No N8N webhook URL found; set N8N_COLLAB_COMPLETE_WEBHOOK or N8N_BASE_URL" >&2
    exit 1
  fi
fi

PLAN_ID="${1:-NEXT16_PREP_$(date +%Y-%m-%d)}"
DOC_PATH="${2:-docs/N8N_WEBHOOK_STATUS_AND_NEXT16_PREP.md}"
if [ ! -f "$DOC_PATH" ]; then
  echo "Document not found: $DOC_PATH" >&2
  exit 1
fi

CONTENT=$(cat "$DOC_PATH")
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

PAYLOAD=$(cat <<JSON
{
  "collaboration_result": {
    "plan_id": "$PLAN_ID",
    "timestamp": "$NOW",
    "model": "notes",
    "budgets": {},
    "findings": [
      {
        "topic": "n8n webhook status and next16 prep",
        "content": $(jq -Rs . <<< "$CONTENT"),
        "cost_cents_estimate": 0,
        "shared_by": ["Uhura","La Forge","Data"]
      }
    ]
  },
  "crew_memories": [
    {"crew_member":"Lieutenant Uhura","topic":"n8n webhook status","content": $(jq -Rs . <<< "$CONTENT"),"model":"notes","plan_id":"$PLAN_ID","timestamp":"$NOW"},
    {"crew_member":"Lieutenant Commander Geordi La Forge","topic":"Next.js 16 prep","content": $(jq -Rs . <<< "$CONTENT"),"model":"notes","plan_id":"$PLAN_ID","timestamp":"$NOW"},
    {"crew_member":"Commander Data","topic":"migration risks and routing","content": $(jq -Rs . <<< "$CONTENT"),"model":"notes","plan_id":"$PLAN_ID","timestamp":"$NOW"}
  ]
}
JSON
)

echo "POST $WEBHOOK_URL"
HTTP_CODE=$(curl -sS -o /tmp/n8n_post_out.json -w "%{http_code}" -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD") || true

echo "HTTP $HTTP_CODE"
cat /tmp/n8n_post_out.json || true

if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "201" ] && [ "$HTTP_CODE" != "202" ]; then
  echo "\nNote: If this endpoint is not registered for POST, activate the workflow at /webhook/collaboration-complete or use GET summary mode." >&2
  exit 2
fi

echo "\nOK: Collaboration notes posted via POST."


