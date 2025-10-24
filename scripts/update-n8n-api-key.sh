#!/usr/bin/env bash
set -euo pipefail

# Update the remote n8n API key in /opt/n8n/.env and restart the service
# Uses local env N8N_API_KEY (falls back to ~/.zshrc), SSH to ubuntu@n8n.pbradygeorgen.com

[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" >/dev/null 2>&1 || true

HOST="${N8N_SSH_HOST:-n8n.pbradygeorgen.com}"
USER="${N8N_SSH_USER:-ubuntu}"
PORT="${N8N_SSH_PORT:-22}"
KEY="${N8N_SSH_KEY:-}"

if [ -z "${N8N_API_KEY:-}" ]; then
  echo "N8N_API_KEY not set in this shell; export it or put it in ~/.zshrc" >&2
  exit 1
fi

if [ -z "$KEY" ]; then
  for k in "$HOME/.ssh/AlexKeyPair.pem" "$HOME/.ssh/id_rsa" "$HOME/.ssh/id_ed25519" "$HOME/.ssh/n8n.pem"; do
    [ -f "$k" ] && KEY="$k" && break
  done
fi

[ -n "$KEY" ] || { echo "No SSH key found for remote host" >&2; exit 1; }

echo "Updating API key on $USER@$HOST using $KEY ..."

# Build a small updater script with the literal key embedded safely
TMP=$(mktemp)
cat > "$TMP" <<EOS
set -e
sudo sed -i 's|^N8N_API_KEY=.*$|N8N_API_KEY=${N8N_API_KEY}|' /opt/n8n/.env
sudo systemctl restart n8n
sudo docker exec n8n printenv N8N_API_KEY
EOS

scp -o StrictHostKeyChecking=no -i "$KEY" -P "$PORT" "$TMP" "$USER@$HOST:/tmp/n8n-key-update.sh" >/dev/null
rm -f "$TMP"
ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i "$KEY" -p "$PORT" "$USER@$HOST" "bash -lc 'bash /tmp/n8n-key-update.sh && rm -f /tmp/n8n-key-update.sh'"

echo "Done."


