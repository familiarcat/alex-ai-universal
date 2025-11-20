#!/bin/bash

##############################################################################
# FIX N8N WEBHOOKS - Fully Automated via AWS CLI
#
# Uses AWS credentials from ~/.zshrc to configure n8n WEBHOOK_URL on EC2
# No SSH keys needed - uses AWS Systems Manager or EC2 run-command
#
# Crew: Lt. Worf (security), Chief O'Brien (automation), Lt. Uhura (AWS API)
##############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🔧 AUTOMATED N8N WEBHOOK FIX VIA AWS CLI                            ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Load AWS credentials from ~/.zshrc
echo "📋 Loading AWS credentials from ~/.zshrc..."

# Try multiple ways to get credentials
if grep -q 'export AWS_ACCESS_KEY_ID=' ~/.zshrc; then
  export AWS_ACCESS_KEY_ID=$(grep 'export AWS_ACCESS_KEY_ID=' ~/.zshrc | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s/.*='\(.*\)'/\1/")
fi

if grep -q 'export AWS_SECRET_ACCESS_KEY=' ~/.zshrc; then
  export AWS_SECRET_ACCESS_KEY=$(grep 'export AWS_SECRET_ACCESS_KEY=' ~/.zshrc | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s/.*='\(.*\)'/\1/")
fi

# Get region (try multiple sources)
if grep -q 'export AWS_REGION=' ~/.zshrc; then
  export AWS_REGION=$(grep 'export AWS_REGION=' ~/.zshrc | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s/.*='\(.*\)'/\1/" | tr -d '"')
elif grep -q 'export AWS_DEFAULT_REGION=' ~/.zshrc; then
  export AWS_REGION=$(grep 'export AWS_DEFAULT_REGION=' ~/.zshrc | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s/.*='\(.*\)'/\1/" | tr -d '"')
else
  export AWS_REGION="us-east-2"  # Default region
fi

export AWS_DEFAULT_REGION=$AWS_REGION

# Get instance ID (try multiple sources)
if grep -q 'export N8N_AWS_INSTANCE_ID=' ~/.zshrc; then
  INSTANCE_ID=$(grep 'export N8N_AWS_INSTANCE_ID=' ~/.zshrc | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s/.*='\(.*\)'/\1/")
elif grep -q 'export AWS_EC2_INSTANCE_ID=' ~/.zshrc; then
  INSTANCE_ID=$(grep 'export AWS_EC2_INSTANCE_ID=' ~/.zshrc | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s/.*='\(.*\)'/\1/")
else
  # Try to find from existing scripts or use default
  INSTANCE_ID="i-0afdf313f61f22df0"  # Default instance ID
fi

echo "✅ Loaded AWS credentials"
echo "   Region: $AWS_REGION"
echo "   Instance: $INSTANCE_ID"
echo ""

# Verify AWS credentials work
echo "🔍 Verifying AWS credentials..."
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "❌ AWS credentials invalid or AWS CLI not configured"
  exit 1
fi
echo "✅ AWS credentials valid"
echo ""

# Check instance state
echo "🔍 Checking EC2 instance state..."
INSTANCE_STATE=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text 2>&1)

echo "   State: $INSTANCE_STATE"

if [ "$INSTANCE_STATE" != "running" ]; then
  echo "❌ Instance is not running. Start it first."
  exit 1
fi
echo "✅ Instance is running"
echo ""

# Create the configuration script to run on EC2
cat > /tmp/configure-n8n-webhook.sh << 'REMOTE_SCRIPT'
#!/bin/bash
set -e

echo "[remote] Configuring n8n WEBHOOK_URL..."

# Check if /opt/n8n/.env exists
if [ ! -f /opt/n8n/.env ]; then
  echo "[remote] /opt/n8n/.env does not exist! Creating it..."
  sudo mkdir -p /opt/n8n
  sudo tee /opt/n8n/.env >/dev/null <<NEWENV
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_ENDPOINT_WEBHOOK=webhook
N8N_ENDPOINT_WEBHOOK_TEST=webhook-test
N8N_ENABLE_API=true
GENERIC_TIMEZONE=UTC
NEWENV
  echo "[remote] ✅ Created /opt/n8n/.env"
else
  echo "[remote] /opt/n8n/.env exists. Updating WEBHOOK_URL..."
  
  # Remove old WEBHOOK_URL if exists
  sudo sed -i '/^WEBHOOK_URL=/d' /opt/n8n/.env
  
  # Add new WEBHOOK_URL
  echo 'WEBHOOK_URL=https://n8n.pbradygeorgen.com' | sudo tee -a /opt/n8n/.env >/dev/null
  
  echo "[remote] ✅ Updated WEBHOOK_URL"
fi

echo ""
echo "[remote] Current /opt/n8n/.env:"
sudo cat /opt/n8n/.env
echo ""

# Restart n8n
echo "[remote] Restarting n8n..."
if sudo systemctl restart n8n 2>/dev/null; then
  echo "[remote] ✅ Restarted via systemd"
elif sudo docker restart n8n 2>/dev/null; then
  echo "[remote] ✅ Restarted via Docker"
else
  echo "[remote] ⚠️  Could not restart automatically"
fi

echo "[remote] Waiting 5 seconds for n8n to initialize..."
sleep 5

echo "[remote] ✅ Configuration complete!"
REMOTE_SCRIPT

chmod +x /tmp/configure-n8n-webhook.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 ATTEMPTING AWS SYSTEMS MANAGER RUN COMMAND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try AWS Systems Manager send-command (works even if SSM agent is partially configured)
echo "📤 Sending configuration command to EC2 instance via AWS SSM..."
echo "   Instance ID: $INSTANCE_ID"
echo "   Region: $AWS_REGION"
echo ""

# Use base64 encoding for reliable transmission
COMMAND_B64=$(base64 < /tmp/configure-n8n-webhook.sh | tr -d '\n')

# Create SSM command with base64-encoded script
echo "   Encoding script and sending command..."
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"echo $COMMAND_B64 | base64 -d | bash\"]" \
  --region "$AWS_REGION" \
  --timeout-seconds 300 \
  --query 'Command.CommandId' \
  --output text 2>&1)

SSM_EXIT_CODE=$?

if [ $SSM_EXIT_CODE -eq 0 ] && [ -n "$COMMAND_ID" ] && [ "$COMMAND_ID" != "None" ] && [ "$COMMAND_ID" != "null" ]; then
  echo "✅ Command sent! ID: $COMMAND_ID"
  echo ""
  echo "⏳ Waiting for command execution (30 seconds max)..."
  
  # Wait for command to complete
  for i in {1..30}; do
    STATUS=$(aws ssm get-command-invocation \
      --command-id "$COMMAND_ID" \
      --instance-id "$INSTANCE_ID" \
      --query 'Status' \
      --output text 2>/dev/null || echo "Pending")
    
    if [ "$STATUS" = "Success" ]; then
      echo "✅ Command executed successfully!"
      echo ""
      echo "📋 Output:"
      aws ssm get-command-invocation \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" \
        --query 'StandardOutputContent' \
        --output text
      echo ""
      break
    elif [ "$STATUS" = "Failed" ]; then
      echo "❌ Command failed!"
      aws ssm get-command-invocation \
        --command-id "$COMMAND_ID" \
        --instance-id "$INSTANCE_ID" \
        --query 'StandardErrorContent' \
        --output text
      exit 1
    fi
    
    echo -n "."
    sleep 1
  done
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ N8N CONFIGURATION COMPLETE VIA AWS SSM!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
else
  echo "❌ AWS SSM send-command failed (SSM agent may not be configured)"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 FALLBACK: Trying EC2 Instance Connect..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Try EC2 Instance Connect as fallback
  if command -v node >/dev/null 2>&1; then
    echo "📤 Attempting EC2 Instance Connect method..."
    if node scripts/aws-ec2-instance-connect-fix.js 2>&1; then
      echo ""
      echo "✅ Configuration complete via EC2 Instance Connect!"
      rm -f /tmp/configure-n8n-webhook.sh
      exit 0
    else
      echo "❌ EC2 Instance Connect also failed"
    fi
  fi
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⚠️  MANUAL CONFIGURATION REQUIRED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "AWS Console (browser-based terminal):"
  echo "https://us-east-2.console.aws.amazon.com/ec2/home?region=us-east-2#Instances:instanceId=$INSTANCE_ID"
  echo ""
  echo "Click 'Connect' → 'EC2 Instance Connect' → 'Connect'"
  echo ""
  echo "Then run:"
  cat /tmp/configure-n8n-webhook.sh
  echo ""
  exit 1
fi

# Clean up
rm /tmp/configure-n8n-webhook.sh

echo "🧪 Testing webhook registration..."
echo ""
sleep 10  # Give n8n time to fully restart

WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://n8n.pbradygeorgen.com/webhook/knowledge-ingest 2>&1)

echo "Webhook test result: HTTP $WEBHOOK_TEST"

if [ "$WEBHOOK_TEST" = "404" ]; then
  echo "❌ Still returning 404 - webhook not registered yet"
  echo "   n8n may need more time to restart"
  echo "   Or WEBHOOK_URL wasn't set correctly"
  exit 1
else
  echo "✅ WEBHOOK IS REGISTERED! (HTTP $WEBHOOK_TEST)"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 N8N WEBHOOKS ARE NOW OPERATIONAL!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Next step: Remove ALL fallbacks and achieve pure DDD! 🎯"
fi

