#!/bin/bash

##############################################################################
# N8N WEBHOOK FIX - Commands to Run on EC2 Instance
#
# Copy/paste these commands into AWS Console browser terminal
# Once connected to i-0afdf313f61f22df0
#
# Crew: Chief O'Brien (pragmatic fix), Lt. Worf (security)
##############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 N8N WEBHOOK CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if /opt/n8n/.env exists
echo "📋 Step 1: Checking n8n environment file..."
if [ -f /opt/n8n/.env ]; then
  echo "✅ /opt/n8n/.env exists"
  echo ""
  echo "Current contents:"
  sudo cat /opt/n8n/.env
else
  echo "⚠️  /opt/n8n/.env does NOT exist!"
  echo "Creating it now..."
  sudo mkdir -p /opt/n8n
  sudo tee /opt/n8n/.env >/dev/null <<'NEWENV'
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_ENDPOINT_WEBHOOK=webhook
N8N_ENDPOINT_WEBHOOK_TEST=webhook-test
N8N_ENABLE_API=true
GENERIC_TIMEZONE=UTC
NEWENV
  echo "✅ Created /opt/n8n/.env"
fi

echo ""

# Step 2: Ensure WEBHOOK_URL is set correctly
echo "📋 Step 2: Ensuring WEBHOOK_URL is set..."
if sudo grep -q "^WEBHOOK_URL=https://n8n.pbradygeorgen.com" /opt/n8n/.env; then
  echo "✅ WEBHOOK_URL already correct"
else
  echo "Updating WEBHOOK_URL..."
  # Remove old WEBHOOK_URL lines
  sudo sed -i '/^WEBHOOK_URL=/d' /opt/n8n/.env
  # Add new WEBHOOK_URL
  echo 'WEBHOOK_URL=https://n8n.pbradygeorgen.com' | sudo tee -a /opt/n8n/.env
  echo "✅ WEBHOOK_URL updated"
fi

echo ""
echo "Final /opt/n8n/.env:"
sudo cat /opt/n8n/.env

echo ""

# Step 3: Restart n8n
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Step 3: Restarting n8n..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if sudo systemctl restart n8n 2>/dev/null; then
  echo "✅ n8n restarted via systemd"
  echo ""
  echo "Status:"
  sudo systemctl status n8n --no-pager | head -15
elif sudo docker restart n8n 2>/dev/null; then
  echo "✅ n8n restarted via Docker"
  echo ""
  echo "Container status:"
  sudo docker ps | grep n8n
else
  echo "⚠️  Could not detect n8n service"
  echo "Try manually:"
  echo "  sudo systemctl restart n8n"
  echo "  OR"
  echo "  sudo docker restart n8n"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏳ Waiting 10 seconds for n8n to initialize..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 10

echo ""
echo "✅ Configuration complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEP: Test webhooks from your local machine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run this command locally:"
echo ""
echo "  curl https://n8n.pbradygeorgen.com/webhook/knowledge-ingest"
echo ""
echo "Expected if WORKING:"
echo "  • NOT 404!"
echo "  • Might be 405 (webhook exists, wrong HTTP method)"
echo "  • Or 400 (webhook exists, needs POST with payload)"
echo ""
echo "If still 404:"
echo "  • Wait 30 more seconds and try again"
echo "  • Check n8n logs: sudo journalctl -u n8n -n 50"
echo ""

# BONUS: Install SSM agent for future automation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 BONUS: Enable Future Automation (Optional, Worf-Approved)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "While you're connected, install SSM agent for future CLI automation:"
echo ""
echo "  sudo snap install amazon-ssm-agent --classic"
echo "  sudo systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service"
echo "  sudo systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service"
echo ""
echo "Then attach SSM IAM role via AWS Console:"
echo "  EC2 → Instance → Actions → Security → Modify IAM role"
echo "  Choose role with: AmazonSSMManagedInstanceCore policy"
echo ""
echo "After this, ALL our automation scripts will work! 🚀"
echo ""

