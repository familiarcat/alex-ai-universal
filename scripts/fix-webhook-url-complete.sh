#!/bin/bash

################################################################################
#
# 🔧 COMPLETE WEBHOOK_URL FIX
#
# This script:
# 1. Checks if WEBHOOK_URL is set in n8n via API
# 2. If not, generates commands for AWS Console
# 3. Provides permanent fix using docker-compose
#
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🔧 COMPLETE WEBHOOK_URL FIX + AUTOMATION                            ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Extract credentials from ~/.zshrc
N8N_URL=$(grep 'export N8N_URL=' ~/.zshrc | cut -d'"' -f2)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 STEP 1: Checking current WEBHOOK_URL status via API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check n8n settings
WEBHOOK_STATUS=$(curl -s "$N8N_URL/api/v1/settings" | jq -r '.settings.WEBHOOK_URL')

echo "🎯 Target: $N8N_URL"
echo "📊 Current WEBHOOK_URL: ${WEBHOOK_STATUS:-null}"
echo ""

if [ "$WEBHOOK_STATUS" = "null" ] || [ -z "$WEBHOOK_STATUS" ]; then
  echo "❌ WEBHOOK_URL is NULL or not set!"
  echo ""
  echo "This is why webhooks return 404 errors."
  echo ""
else
  echo "✅ WEBHOOK_URL is set correctly!"
  echo ""
  echo "If webhooks are still 404, try re-validating workflows:"
  echo "   node scripts/force-webhook-revalidation.js"
  echo ""
  exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 STEP 2: Generating fix commands for AWS Console..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create a temporary file with the fix commands
cat > /tmp/n8n-webhook-fix-commands.sh << 'REMOTE_SCRIPT'
#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 N8N WEBHOOK_URL PERMANENT FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check current container
echo "📦 Step 1: Checking current n8n container..."
echo ""

CURRENT_CONTAINER=$(docker ps -q --filter "name=n8n")

if [ -n "$CURRENT_CONTAINER" ]; then
  echo "✅ Found container: $CURRENT_CONTAINER"
  echo ""
  echo "Current WEBHOOK_URL:"
  docker exec "$CURRENT_CONTAINER" env | grep -E "(WEBHOOK_URL|N8N_PROTOCOL|N8N_HOST)" || echo "   ❌ Not set!"
  echo ""
else
  echo "❌ No n8n container running!"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Create permanent environment file
echo "📝 Step 2: Creating permanent environment file..."
echo ""

sudo mkdir -p /opt/n8n
sudo tee /opt/n8n/.env > /dev/null << 'ENV'
# N8N Webhook Configuration
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
WEBHOOK_TUNNEL_URL=

# Database persistence
N8N_USER_FOLDER=/home/node/.n8n
ENV

echo "✅ Created /opt/n8n/.env"
echo ""

# Step 3: Stop old container
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🛑 Step 3: Stopping old container..."
echo ""

if [ -n "$CURRENT_CONTAINER" ]; then
  docker stop "$CURRENT_CONTAINER"
  docker rm "$CURRENT_CONTAINER"
  echo "✅ Old container removed"
else
  echo "ℹ️  No container to remove"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Start new container with env file
echo "🚀 Step 4: Starting n8n with environment file..."
echo ""

docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:latest

NEW_CONTAINER=$(docker ps -q --filter "name=n8n")

if [ -n "$NEW_CONTAINER" ]; then
  echo "✅ New container started: $NEW_CONTAINER"
else
  echo "❌ Failed to start container!"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Verify
echo "🔍 Step 5: Verifying WEBHOOK_URL is set..."
echo ""

sleep 5

echo "Environment variables:"
docker exec "$NEW_CONTAINER" env | grep -E "(WEBHOOK_URL|N8N_PROTOCOL|N8N_HOST)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ COMPLETE!"
echo ""
echo "🎯 Benefits of this approach:"
echo "   • Uses --env-file (persistent config)"
echo "   • Environment file stored at /opt/n8n/.env"
echo "   • Survives container restarts"
echo "   • Easy to update (edit /opt/n8n/.env)"
echo ""
echo "⏳ Wait 30 seconds for n8n to initialize, then test webhooks!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REMOTE_SCRIPT

echo "✅ Created fix script: /tmp/n8n-webhook-fix-commands.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 NEXT STEPS:"
echo ""
echo "1. Open AWS Console EC2 Instance Connect:"
echo "   https://console.aws.amazon.com/ec2/v2/home?region=us-east-2#ConnectToInstance:instanceId=i-0afdf313f61f22df0"
echo ""
echo "2. Click 'Connect' to open browser terminal"
echo ""
echo "3. Paste the following commands:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat /tmp/n8n-webhook-fix-commands.sh
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Or simply run:"
echo "   bash /tmp/n8n-webhook-fix-commands.sh"
echo ""
echo "This fix is PERMANENT using --env-file! 🎉"
echo ""

