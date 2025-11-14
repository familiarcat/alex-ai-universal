#!/usr/bin/env bash
set -eo pipefail

KEY=${KEY:-$HOME/.ssh/AlexKeyPair.pem}
HOST=${HOST:-ec2-3-150-192-186.us-east-2.compute.amazonaws.com}
USER=${USER:-ubuntu}
REMOTE_PATH=${REMOTE_PATH:-/home/${USER}/alex-ai-universal}
REMOTE_ENV_FILE=${REMOTE_ENV_FILE:-/etc/n8n/env.d/50-supabase.env}
REMOTE_DOTENV=${REMOTE_DOTENV:-/home/${USER}/.n8n/.env}

ENV_EXPORTS=$(node scripts/apply-supabase-secrets.js --format exports 2>/tmp/apply-secrets-warn.log)
ENV_PLAIN=$(node scripts/apply-supabase-secrets.js --format plain 2>>/tmp/apply-secrets-warn.log | grep '=' || true)
WARNINGS=$(cat /tmp/apply-secrets-warn.log || true)
rm -f /tmp/apply-secrets-warn.log

if [ -z "$ENV_PLAIN" ]; then
  echo "No Supabase secrets retrieved; aborting." >&2
  if [ -n "$WARNINGS" ]; then
    echo "$WARNINGS" >&2
  fi
  exit 1
fi

EXPORTS_B64=$(printf '%s' "$ENV_EXPORTS" | base64 | tr -d '\n')
PLAIN_B64=$(printf '%s' "$ENV_PLAIN" | base64 | tr -d '\n')

ssh -i "$KEY" -o StrictHostKeyChecking=no "$USER@$HOST" "
  set -eo pipefail
  EXPORTS=\\$(printf '%s' '$EXPORTS_B64' | base64 -d)
  PLAIN=\\$(printf '%s' '$PLAIN_B64' | base64 -d)
  sudo mkdir -p \\$(dirname $REMOTE_ENV_FILE)
  printf '%s\\n' "\\$EXPORTS" | sudo tee $REMOTE_ENV_FILE >/dev/null
  mkdir -p \\$(dirname $REMOTE_DOTENV)
  sudo touch $REMOTE_DOTENV
  printf '%s\\n' "\\$PLAIN" | while IFS= read -r line; do
    [ -z "\\$line" ] && continue
    key=\\${line%%=*}
    value=\\${line#*=}
    sudo sed -i "/^\\$key=/d" $REMOTE_DOTENV
    printf '%s\\n' "\\$key=\\$value" | sudo tee -a $REMOTE_DOTENV >/dev/null
  done
  cd $REMOTE_PATH 2>/dev/null && git pull --ff-only || true
  if command -v docker >/dev/null 2>&1; then
    sudo docker restart n8n || true
  fi
"

if [ -n "$WARNINGS" ]; then
  echo "$WARNINGS" >&2
fi
