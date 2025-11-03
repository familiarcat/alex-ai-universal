#!/bin/bash

################################################################################
#
# 🎯 AWS CONSOLE BROWSER TERMINAL COMMANDS
#
# Copy/paste these commands into the AWS Console EC2 Instance Connect terminal
#
# Steps:
# 1. Go to AWS Console → EC2 → Instances
# 2. Select instance i-0afdf313f61f22df0
# 3. Click "Connect" button
# 4. Choose "EC2 Instance Connect" tab
# 5. Click "Connect" (opens browser terminal)
# 6. Paste commands below
#
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 N8N WEBHOOK_URL FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check current n8n container
echo "📦 STEP 1: Checking current n8n container..."
echo ""

CONTAINER_ID=$(docker ps -q --filter "ancestor=n8nio/n8n:latest")

if [ -n "$CONTAINER_ID" ]; then
  echo "✅ Container running: $CONTAINER_ID"
  echo ""
  echo "Current environment:"
  docker inspect "$CONTAINER_ID" | grep -A 5 "WEBHOOK_URL"
else
  echo "❌ No n8n container running!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Stop current container
echo "🛑 STEP 2: Stopping current n8n container..."
echo ""

if [ -n "$CONTAINER_ID" ]; then
  docker stop "$CONTAINER_ID"
  echo "✅ Container stopped"
else
  echo "ℹ️  No container to stop"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Start n8n with correct environment variables
echo "🚀 STEP 3: Starting n8n with WEBHOOK_URL..."
echo ""

docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  -e WEBHOOK_URL="https://n8n.pbradygeorgen.com" \
  -e N8N_PROTOCOL="https" \
  -e N8N_HOST="n8n.pbradygeorgen.com" \
  -e N8N_PORT="5678" \
  -e N8N_EDITOR_BASE_URL="https://n8n.pbradygeorgen.com" \
  -e WEBHOOK_TUNNEL_URL="" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n:latest

echo ""
echo "✅ n8n started with correct environment!"
echo ""

# Step 4: Verify
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 STEP 4: Verifying configuration..."
echo ""

sleep 5

NEW_CONTAINER_ID=$(docker ps -q --filter "name=n8n")

if [ -n "$NEW_CONTAINER_ID" ]; then
  echo "✅ New container running: $NEW_CONTAINER_ID"
  echo ""
  echo "Environment verification:"
  docker exec "$NEW_CONTAINER_ID" env | grep -E "(WEBHOOK_URL|N8N_PROTOCOL|N8N_HOST)"
else
  echo "❌ Container failed to start!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ COMPLETE!"
echo ""
echo "🎯 Next steps:"
echo "   1. Wait 30 seconds for n8n to initialize"
echo "   2. Open https://n8n.pbradygeorgen.com in browser"
echo "   3. Go to any workflow with a webhook"
echo "   4. Click 'Finish update' button (forces re-validation)"
echo "   5. Webhooks should now register! 🎉"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

