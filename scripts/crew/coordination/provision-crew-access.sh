#!/usr/bin/env bash
set -euo pipefail

# Provision a crew member with full controller (n8n) admin access.
# - Writes exports to ~/.zshrc (idempotent) or prints a one-time env snippet
# - Optionally pulls N8N_API_KEY from AWS Secrets Manager
#
# Usage:
#   scripts/provision-crew-access.sh --url https://n8n.pbradygeorgen.com --key ABC123
#   scripts/provision-crew-access.sh --url https://n8n.pbradygeorgen.com \
#       --aws-secret arn:aws:secretsmanager:REGION:ACCT:secret:N8N_API_KEY

URL=""
KEY=""
AWS_SECRET=""
APPEND_RC=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url) URL="$2"; shift 2 ;;
    --key) KEY="$2"; shift 2 ;;
    --aws-secret) AWS_SECRET="$2"; shift 2 ;;
    --no-rc) APPEND_RC=0; shift 1 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$URL" ]]; then
  URL="https://n8n.pbradygeorgen.com"
fi

if [[ -z "$KEY" && -n "$AWS_SECRET" ]]; then
  if command -v aws >/dev/null 2>&1; then
    KEY=$(aws secretsmanager get-secret-value --secret-id "$AWS_SECRET" --query 'SecretString' --output text 2>/dev/null || true)
  fi
fi

if [[ -z "$KEY" ]]; then
  echo "N8N_API_KEY is required. Provide --key or --aws-secret." >&2
  echo "You can still export for the current shell:"
  echo "  export N8N_BASE_URL=$URL"
  echo "  export N8N_API_KEY=YOUR_KEY"
  exit 1
fi

if [[ $APPEND_RC -eq 1 ]]; then
  RC_FILE="$HOME/.zshrc"
  touch "$RC_FILE"
  grep -q "^export N8N_BASE_URL=\"$URL\"$" "$RC_FILE" 2>/dev/null || echo "export N8N_BASE_URL=\"$URL\"" >> "$RC_FILE"
  # Replace existing N8N_API_KEY export if present, else append
  if grep -q '^export N8N_API_KEY=' "$RC_FILE"; then
    sed -i '' -E "s|^export N8N_API_KEY=.*$|export N8N_API_KEY=\"$KEY\"|" "$RC_FILE"
  else
    echo "export N8N_API_KEY=\"$KEY\"" >> "$RC_FILE"
  fi
  echo "✅ Wrote N8N_BASE_URL and N8N_API_KEY to $RC_FILE"
  echo "   Have the crew member: source $RC_FILE"
else
  echo "export N8N_BASE_URL=\"$URL\""
  echo "export N8N_API_KEY=\"$KEY\""
fi

echo "Verifying controller access..."
if curl -fsS -m 10 -H "X-N8N-API-KEY: $KEY" "$URL/api/v1/workflows" >/dev/null; then
  echo "✅ Controller API reachable"
else
  echo "⚠️  Could not reach controller API at $URL (continuing)" >&2
fi

echo "Done. Crew member now has full controller access."


