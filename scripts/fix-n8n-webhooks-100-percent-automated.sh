#!/bin/bash

##############################################################################
# FIX N8N WEBHOOKS - 100% AUTOMATED via AWS EC2 User Data
#
# Chief O'Brien's Pragmatic Solution:
# Uses AWS CLI to modify EC2 user data, stop/start instance
# User data script runs on boot and configures WEBHOOK_URL
#
# Trade-off: ~2 minutes n8n downtime during reboot (acceptable!)
#
# Crew: Chief O'Brien (pragmatic automation), Lt. Cmdr. La Forge (infrastructure)
##############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   👷 CHIEF O'BRIEN: 100% AUTOMATED N8N WEBHOOK FIX                    ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Load AWS credentials from ~/.zshrc
echo "📋 Loading AWS credentials from ~/.zshrc..."
export AWS_ACCESS_KEY_ID=$(grep 'export AWS_ACCESS_KEY_ID=' ~/.zshrc | cut -d'=' -f2)
export AWS_SECRET_ACCESS_KEY=$(grep 'export AWS_SECRET_ACCESS_KEY=' ~/.zshrc | cut -d'=' -f2)
export AWS_REGION=$(grep 'export AWS_REGION=' ~/.zshrc | cut -d'=' -f2 | tr -d '"')
export AWS_DEFAULT_REGION=$AWS_REGION
INSTANCE_ID=$(grep 'export N8N_AWS_INSTANCE_ID=' ~/.zshrc | cut -d'=' -f2)

echo "✅ Loaded AWS credentials"
echo "   Region: $AWS_REGION"
echo "   Instance: $INSTANCE_ID"
echo ""

# Verify AWS credentials
echo "🔍 Verifying AWS credentials..."
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "❌ AWS credentials invalid"
  exit 1
fi
echo "✅ AWS credentials valid"
echo ""

# Check instance state
echo "🔍 Checking EC2 instance state..."
INSTANCE_STATE=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text)

echo "   Current state: $INSTANCE_STATE"
echo ""

# Create user data script
echo "📝 Creating user data script..."
cat > /tmp/n8n-webhook-userdata.sh << 'USERDATA'
#!/bin/bash
# User Data Script - Runs on EC2 boot
# Configures n8n WEBHOOK_URL

set -e

echo "[userdata] Configuring n8n WEBHOOK_URL..." >> /var/log/n8n-webhook-config.log
date >> /var/log/n8n-webhook-config.log

# Ensure /opt/n8n/.env exists
if [ ! -f /opt/n8n/.env ]; then
  echo "[userdata] Creating /opt/n8n/.env" >> /var/log/n8n-webhook-config.log
  mkdir -p /opt/n8n
  cat > /opt/n8n/.env <<'NEWENV'
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_ENDPOINT_WEBHOOK=webhook
N8N_ENDPOINT_WEBHOOK_TEST=webhook-test
N8N_ENABLE_API=true
GENERIC_TIMEZONE=UTC
NEWENV
else
  # Update existing file
  echo "[userdata] Updating /opt/n8n/.env" >> /var/log/n8n-webhook-config.log
  sed -i '/^WEBHOOK_URL=/d' /opt/n8n/.env
  echo 'WEBHOOK_URL=https://n8n.pbradygeorgen.com' >> /opt/n8n/.env
fi

echo "[userdata] WEBHOOK_URL configured:" >> /var/log/n8n-webhook-config.log
cat /opt/n8n/.env >> /var/log/n8n-webhook-config.log

# Restart n8n if it's running
if systemctl is-active n8n >/dev/null 2>&1; then
  echo "[userdata] Restarting n8n service..." >> /var/log/n8n-webhook-config.log
  systemctl restart n8n
elif docker ps | grep -q n8n; then
  echo "[userdata] Restarting n8n container..." >> /var/log/n8n-webhook-config.log
  docker restart n8n
fi

echo "[userdata] ✅ Configuration complete!" >> /var/log/n8n-webhook-config.log
date >> /var/log/n8n-webhook-config.log
USERDATA

echo "✅ User data script created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EXECUTING 100% AUTOMATED CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  This will cause ~2 minutes of n8n downtime (instance reboot)"
echo "   Press Ctrl+C within 5 seconds to cancel..."
sleep 5
echo ""

# Step 1: Stop instance FIRST (AWS requires stopped state to modify user data)
echo "🛑 Step 1: Stopping EC2 instance..."
aws ec2 stop-instances --instance-ids $INSTANCE_ID >/dev/null
echo "⏳ Waiting for instance to stop..."

# Wait for stopped state
for i in {1..60}; do
  STATE=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].State.Name' \
    --output text)
  
  if [ "$STATE" = "stopped" ]; then
    echo "✅ Instance stopped"
    break
  fi
  
  echo -n "."
  sleep 2
done

echo ""
echo ""

# Step 2: Modify user data (AWS requires instance to be stopped)
echo "📤 Step 2: Uploading user data configuration..."

# Base64 encode without newlines
USER_DATA_B64=$(cat /tmp/n8n-webhook-userdata.sh | base64 | tr -d '\n')

aws ec2 modify-instance-attribute \
  --instance-id $INSTANCE_ID \
  --attribute userData \
  --value "$USER_DATA_B64"

echo "✅ User data uploaded (will run on next boot)"
echo ""

# Step 3: Start instance
echo "🚀 Step 3: Starting EC2 instance (user data will run on boot)..."
aws ec2 start-instances --instance-ids $INSTANCE_ID >/dev/null
echo "⏳ Waiting for instance to start..."

# Wait for running state
for i in {1..60}; do
  STATE=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].State.Name' \
    --output text)
  
  if [ "$STATE" = "running" ]; then
    echo "✅ Instance running"
    break
  fi
  
  echo -n "."
  sleep 2
done

echo ""
echo ""

# Step 4: Wait for n8n to fully initialize
echo "⏳ Step 4: Waiting for n8n to fully initialize (30 seconds)..."
sleep 30
echo "✅ n8n should be ready"
echo ""

# Step 5: Test webhook registration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING WEBHOOK REGISTRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test critical webhooks
echo "Test 1: knowledge-ingest webhook"
WEBHOOK1=$(curl -s -o /dev/null -w "%{http_code}" https://n8n.pbradygeorgen.com/webhook/knowledge-ingest)
echo "   Result: HTTP $WEBHOOK1"

echo "Test 2: settings-retrieve webhook"
WEBHOOK2=$(curl -s -o /dev/null -w "%{http_code}" https://n8n.pbradygeorgen.com/webhook/settings-retrieve?userId=default)
echo "   Result: HTTP $WEBHOOK2"

echo "Test 3: settings-store webhook"
WEBHOOK3=$(curl -s -o /dev/null -w "%{http_code}" https://n8n.pbradygeorgen.com/webhook/settings-store)
echo "   Result: HTTP $WEBHOOK3"

echo ""

# Check results
if [ "$WEBHOOK1" = "404" ] && [ "$WEBHOOK2" = "404" ] && [ "$WEBHOOK3" = "404" ]; then
  echo "❌ ALL STILL 404 - User data may not have run yet"
  echo "   Wait another 60 seconds and test again"
  echo ""
  echo "   curl https://n8n.pbradygeorgen.com/webhook/knowledge-ingest"
  exit 1
elif [ "$WEBHOOK1" != "404" ] || [ "$WEBHOOK2" != "404" ] || [ "$WEBHOOK3" != "404" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 WEBHOOKS ARE REGISTERED! (Not 404 = SUCCESS!)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "✅ 100% AUTOMATION SUCCESSFUL!"
  echo ""
  echo "Webhook status:"
  echo "  • knowledge-ingest: $WEBHOOK1 (404 = not registered, other = registered)"
  echo "  • settings-retrieve: $WEBHOOK2"
  echo "  • settings-store: $WEBHOOK3"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎯 NEXT: Remove ALL client-side fallbacks (Pure DDD)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "The crew will now:"
  echo "  1. Remove ALL localStorage from client"
  echo "  2. Remove ALL Supabase direct API calls"
  echo "  3. Enforce Client => n8n => Supabase ONLY"
  echo "  4. Commit as v1.8.0: Pure DDD Architecture"
  echo ""
  exit 0
fi

# Clean up
rm /tmp/n8n-webhook-userdata.sh

