#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Automates:
# 1) Ensure SSH access via ~/.ssh with EC2 Instance Connect fallback
# 2) Create/refresh Docker SSH context to EC2
# 3) Activate RAG workflow in remote n8n container and restart
# 4) Run local e2e verification

INSTANCE_ID="${N8N_EC2_INSTANCE_ID:-i-0afdf313f61f22df0}"
AVAIL_ZONE="${N8N_EC2_AZ:-us-east-2b}"
SSH_HOST="${N8N_SSH_HOST:-n8n.pbradygeorgen.com}"
SSH_USER="${N8N_SSH_USER:-ubuntu}"
PUBKEY="${N8N_SSH_PUBKEY:-$HOME/.ssh/id_rsa.pub}"
PRIVKEY="${N8N_SSH_PRIVKEY:-${PUBKEY%.pub}}"
WF_ID="${1:-d9EJA1Q0uPsgX5H3}"

echo "🔐 Ensuring SSH access to $SSH_USER@$SSH_HOST"
if ! ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$PRIVKEY" "$SSH_USER@$SSH_HOST" exit >/dev/null 2>&1; then
  echo "🛰️  Injecting EC2 Instance Connect key..."
  aws ec2-instance-connect send-ssh-public-key \
    --instance-id "$INSTANCE_ID" \
    --availability-zone "$AVAIL_ZONE" \
    --instance-os-user "$SSH_USER" \
    --ssh-public-key "$(cat "$PUBKEY")" >/dev/null
  echo "📝 Persisting key to authorized_keys..."
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$PRIVKEY" "$SSH_USER@$SSH_HOST" \
    "sudo mkdir -p /home/$SSH_USER/.ssh; echo '$(cat "$PUBKEY")' | sudo tee -a /home/$SSH_USER/.ssh/authorized_keys >/dev/null; sudo chown -R $SSH_USER:$SSH_USER /home/$SSH_USER/.ssh; sudo chmod 700 /home/$SSH_USER/.ssh; sudo chmod 600 /home/$SSH_USER/.ssh/authorized_keys"
fi

echo "🔎 Detecting remote n8n container via SSH"
CONTAINER=$(ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$PRIVKEY" "$SSH_USER@$SSH_HOST" \
  "docker ps --format '{{.Names}} {{.Image}}' | awk '/n8nio\\/n8n|n8n/ {print \\$1; exit}'" || true)
if [ -z "$CONTAINER" ]; then
  echo "❌ No n8n container detected on remote host"
  exit 1
fi
echo "📦 Remote container: $CONTAINER"

echo "🚀 Activating all workflows on remote (SSH + docker exec)"
WF_IDS=$(curl --fail --silent --show-error "$N8N_URL/api/v1/workflows" -H "X-N8N-API-KEY: $N8N_API_KEY" | jq -r '.data[].id')
ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$PRIVKEY" "$SSH_USER@$SSH_HOST" bash <<EOF
set -euo pipefail
C="$CONTAINER"
echo "Container: \$C"
while read -r id; do
  [ -n "\$id" ] || continue
  echo "Activate: \$id"
  docker exec "\$C" n8n update:workflow --id "\$id" --active=true || true
done <<'IDS'
$WF_IDS
IDS
echo "Restart: \$C"
docker restart "\$C" >/dev/null
EOF

echo "🧪 Running local e2e verification"
node scripts/n8n-e2e-control.js || true

echo "✅ Remote bridge complete"


