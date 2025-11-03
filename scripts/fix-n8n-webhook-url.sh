#!/bin/bash

##############################################################################
# FIX N8N WEBHOOK_URL - Simple Automated Configuration
#
# Connects to EC2, sets WEBHOOK_URL, restarts n8n
# Uses credentials from ~/.zshrc
#
# Crew: Chief O'Brien (pragmatic automation)
##############################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX N8N WEBHOOK URL ON EC2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load N8N_API_KEY from ~/.zshrc
N8N_API_KEY=$(grep 'export N8N_API_KEY=' ~/.zshrc | cut -d'"' -f2)

if [ -z "$N8N_API_KEY" ]; then
  echo "❌ N8N_API_KEY not found in ~/.zshrc"
  exit 1
fi

echo "✅ Loaded N8N_API_KEY from ~/.zshrc"
echo ""

# SSH configuration
SSH_KEY="$HOME/.ssh/AlexKeyPair.pem"
SSH_USER="ubuntu"
SSH_HOST="n8n.pbradygeorgen.com"
WEBHOOK_URL="https://n8n.pbradygeorgen.com"

echo "📋 Configuration:"
echo "   SSH Key: $SSH_KEY"
echo "   SSH Host: $SSH_USER@$SSH_HOST"
echo "   Webhook URL: $WEBHOOK_URL"
echo ""

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "echo '✅ SSH connection works'" 2>/dev/null; then
  echo "❌ SSH connection failed!"
  echo ""
  echo "Please check:"
  echo "  • SSH key exists: $SSH_KEY"
  echo "  • EC2 instance is running"
  echo "  • Security group allows SSH from your IP"
  exit 1
fi

echo ""
echo "🚀 Configuring n8n on EC2..."
echo ""

# Run remote commands
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" bash << 'REMOTECMD'
echo "[remote] Checking if /opt/n8n/.env exists..."
if [ ! -f /opt/n8n/.env ]; then
  echo "[remote] /opt/n8n/.env not found! Creating it..."
  sudo mkdir -p /opt/n8n
  sudo tee /opt/n8n/.env >/dev/null <<ENVEOF
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_ENDPOINT_WEBHOOK=webhook
N8N_ENDPOINT_WEBHOOK_TEST=webhook-test
N8N_ENABLE_API=true
GENERIC_TIMEZONE=UTC
ENVEOF
  echo "[remote] ✅ Created /opt/n8n/.env"
else
  echo "[remote] /opt/n8n/.env exists, checking WEBHOOK_URL..."
  if ! sudo grep -q "^WEBHOOK_URL=" /opt/n8n/.env; then
    echo "[remote] WEBHOOK_URL missing! Adding it..."
    echo "WEBHOOK_URL=https://n8n.pbradygeorgen.com" | sudo tee -a /opt/n8n/.env
  else
    echo "[remote] WEBHOOK_URL exists, updating it..."
    sudo sed -i 's|^WEBHOOK_URL=.*|WEBHOOK_URL=https://n8n.pbradygeorgen.com|' /opt/n8n/.env
  fi
  echo "[remote] ✅ WEBHOOK_URL configured"
fi

echo ""
echo "[remote] Current /opt/n8n/.env contents:"
sudo cat /opt/n8n/.env
echo ""

echo "[remote] Restarting n8n..."
if sudo systemctl restart n8n 2>/dev/null; then
  echo "[remote] ✅ Restarted via systemd"
elif sudo docker restart n8n 2>/dev/null; then
  echo "[remote] ✅ Restarted via Docker"
else
  echo "[remote] ⚠️  Could not restart n8n automatically"
  echo "[remote] Please restart manually"
fi

echo ""
echo "[remote] Waiting 5 seconds for n8n to start..."
sleep 5
echo "[remote] ✅ Configuration complete!"
REMOTECMD

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ N8N CONFIGURATION UPDATED ON EC2!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
