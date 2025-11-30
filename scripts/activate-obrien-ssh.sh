#!/bin/bash
# Activate Chief O'Brien via SSH and restart n8n

set -e

echo ""
echo "🔧 Activating Chief Miles O'Brien..."
echo "═══════════════════════════════════════"
echo ""

WORKFLOW_ID="MuaWfFowlkSDefSP"
SSH_HOST="${N8N_SSH_HOST:-n8n.pbradygeorgen.com}"
SSH_USER="${N8N_SSH_USER:-ubuntu}"
SSH_KEY="${N8N_SSH_PRIVKEY:-$HOME/.ssh/id_rsa}"

echo "[1/2] Activating workflow via SSH CLI..."
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" \
  "docker ps --format '{{.Names}}' | grep n8n | head -1 | xargs -I {} docker exec {} n8n update:workflow --id '$WORKFLOW_ID' --active=true"

echo ""
echo "[2/2] Restarting n8n container..."
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" \
  "docker ps --format '{{.Names}}' | grep n8n | head -1 | xargs docker restart"

echo ""
echo "⏳ Waiting 12 seconds for n8n to restart..."
sleep 12

echo ""
echo "✅ Chief O'Brien should now be activated!"
echo ""
echo "Test with:"
echo "  node scripts/test-chief-obrien.js"
echo ""

