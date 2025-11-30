#!/usr/bin/env bash
set -euo pipefail

# Local wrapper to configure remote EC2 n8n and run E2E verification

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" >/dev/null 2>&1 || true

REMOTE_HOST="${REMOTE_HOST:-n8n.pbradygeorgen.com}"
SSH_USER="${SSH_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/AlexKeyPair.pem}"
N8N_API_KEY="${N8N_API_KEY:-}"   # required

if [ -z "$N8N_API_KEY" ]; then
  echo "N8N_API_KEY is required (export it in your shell or ~/.zshrc)" >&2
  exit 1
fi
if [ ! -f "$SSH_KEY" ]; then
  for k in "$HOME/.ssh/id_rsa" "$HOME/.ssh/id_ed25519" "$HOME/.ssh/n8n.pem"; do [ -f "$k" ] && SSH_KEY="$k" && break; done
fi
[ -f "$SSH_KEY" ] || { echo "SSH key not found" >&2; exit 1; }

echo "[local] Pushing remote setup script and applying config..."
scp -o StrictHostKeyChecking=no -i "$SSH_KEY" "$ROOT_DIR/scripts/ec2-n8n-remote-setup.sh" "$SSH_USER@$REMOTE_HOST:/tmp/ec2-n8n-remote-setup.sh" >/dev/null
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$REMOTE_HOST" "bash -lc 'N8N_API_KEY=$N8N_API_KEY N8N_HOST=$REMOTE_HOST bash /tmp/ec2-n8n-remote-setup.sh'"

echo "[local] Running E2E verification..."
export N8N_BASE_URL="https://$REMOTE_HOST"
export N8N_SUMMARY_URL="$N8N_BASE_URL/webhook/summarize-milestone"
bash "$ROOT_DIR/scripts/e2e-controller-check.sh"

echo "[local] Done"


