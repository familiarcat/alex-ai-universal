#!/usr/bin/env bash
set -euo pipefail

# Submit a crew observation to the Observation Lounge API
# Defaults:
#   OBS_BASE=http://localhost:3000
#   CREW_OBS_KEY (required for auth) or falls back to "test"
# Usage examples:
#   scripts/submit-crew-observation.sh --crew "Dev Ops" --summary "Local dev up"
#   scripts/submit-crew-observation.sh --crew "Engineering" --summary "Cache fix" \
#       --problems "stale pages; slow revalidate" --suggestions "tagged ISR; cron warmup"

OBS_BASE=${OBS_BASE:-http://localhost:3000}
AUTH_KEY=${CREW_OBS_KEY:-test}

CREW=""
SUMMARY=""
PROBLEMS=""
SUGGESTIONS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --crew) CREW="$2"; shift 2 ;;
    --summary) SUMMARY="$2"; shift 2 ;;
    --problems) PROBLEMS="$2"; shift 2 ;;
    --suggestions) SUGGESTIONS="$2"; shift 2 ;;
    --base) OBS_BASE="$2"; shift 2 ;;
    --key) AUTH_KEY="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$CREW" || -z "$SUMMARY" ]]; then
  echo "Usage: $0 --crew \"Name\" --summary \"Text\" [--problems \"a;b\"] [--suggestions \"x;y\"]" >&2
  exit 1
fi

# Build JSON safely (prefer jq; fallback to node)
JSON_PAYLOAD=""
if command -v jq >/dev/null 2>&1; then
  PROBS_JSON=$(printf '%s' "$PROBLEMS" | awk -F';' '{for(i=1;i<=NF;i++) if(length($i)) printf "%s\"%s\"", (i>1?",":""), $i }')
  SUGG_JSON=$(printf '%s' "$SUGGESTIONS" | awk -F';' '{for(i=1;i<=NF;i++) if(length($i)) printf "%s\"%s\"", (i>1?",":""), $i }')
  JSON_PAYLOAD=$(jq -n --arg crew "$CREW" --arg summary "$SUMMARY" \
    --argjson problems "[${PROBS_JSON}]" --argjson suggestions "[${SUGG_JSON}]" \
    '{crew:$crew, summary:$summary, problems:$problems, suggestions:$suggestions}')
else
  JSON_PAYLOAD=$(CREW_ENV="$CREW" SUMMARY_ENV="$SUMMARY" PROBLEMS_ENV="$PROBLEMS" SUGGESTIONS_ENV="$SUGGESTIONS" node -e '
    const toArr = (s)=> (s||"").split(";").map(v=>v.trim()).filter(Boolean);
    const body = { crew: process.env.CREW_ENV, summary: process.env.SUMMARY_ENV,
      problems: toArr(process.env.PROBLEMS_ENV), suggestions: toArr(process.env.SUGGESTIONS_ENV) };
    process.stdout.write(JSON.stringify(body));
  ')
fi

curl -sS --fail-with-body -X POST "${OBS_BASE%/}/api/crew/observations" \
  -H "Content-Type: application/json" \
  -H "X-Crew-Key: ${AUTH_KEY}" \
  --data-binary "${JSON_PAYLOAD}" || {
    echo ""; echo "⚠️  Request failed" >&2; exit 1;
  }

echo


