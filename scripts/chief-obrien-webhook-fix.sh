#!/bin/bash

################################################################################
#
# 👷 CHIEF O'BRIEN'S PRAGMATIC WEBHOOK FIX
#
# "Simple solutions are usually the best solutions."
#
# No fancy SSH tricks. No complicated AWS APIs. Just fix the damn thing.
#
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   👷 CHIEF O'BRIEN'S WEBHOOK FIX                                      ║"
echo "║                                                                        ║"
echo "║   \"Stop overthinking it. Here's what we're gonna do...\"              ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Load environment
source ~/.zshrc 2>/dev/null

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 STEP 1: Diagnosing the problem..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check current webhook status
WEBHOOK_STATUS=$(curl -s "${N8N_URL}/webhook/crew-captain-jean-luc-picard" -o /dev/null -w "%{http_code}")

if [ "$WEBHOOK_STATUS" = "404" ]; then
  echo "❌ Webhooks are down (HTTP 404)"
  echo "   Diagnosis: WEBHOOK_URL not set in n8n container"
  echo ""
else
  echo "✅ Webhooks are working (HTTP $WEBHOOK_STATUS)"
  echo "   No fix needed!"
  echo ""
  exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 STEP 2: The Fix (O'Brien Style)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Look, I've seen this a hundred times. The n8n container doesn't have"
echo "WEBHOOK_URL set. We need to restart it with the right environment."
echo ""
echo "SSH and fancy APIs aren't working? Fine. We'll do it the direct way."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create fix script
cat > /tmp/obrien-n8n-fix.sh << 'FIXSCRIPT'
#!/bin/bash
echo "👷 Chief O'Brien's N8N Fix - Executing..."
echo ""

# Step 1: Create env file
echo "📝 Creating environment file..."
sudo mkdir -p /opt/n8n
sudo tee /opt/n8n/.env > /dev/null << 'ENV'
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
WEBHOOK_TUNNEL_URL=
N8N_USER_FOLDER=/home/node/.n8n
ENV
echo "✅ Environment file created"
echo ""

# Step 2: Restart container
echo "🔄 Restarting n8n container..."
CURRENT=$(docker ps -q --filter "name=n8n")
if [ -n "$CURRENT" ]; then
  docker stop $CURRENT && docker rm $CURRENT
  echo "✅ Old container removed"
fi

docker run -d --name n8n --restart always -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:latest

echo ""
echo "⏳ Waiting for n8n to start..."
sleep 5

NEW=$(docker ps -q --filter "name=n8n")
if [ -n "$NEW" ]; then
  echo "✅ Container started: $NEW"
  echo ""
  echo "🔍 Checking environment:"
  docker exec $NEW env | grep -E "(WEBHOOK_URL|N8N_PROTOCOL|N8N_HOST)"
  echo ""
  echo "✅ Done! Wait 30 seconds for full initialization."
else
  echo "❌ Container failed to start!"
  exit 1
fi
FIXSCRIPT

chmod +x /tmp/obrien-n8n-fix.sh

echo "✅ Fix script created: /tmp/obrien-n8n-fix.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👷 HERE'S WHAT YOU NEED TO DO:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open AWS EC2 Instance Connect:"
echo "   https://console.aws.amazon.com/ec2/v2/home?region=us-east-2#ConnectToInstance:instanceId=${N8N_AWS_INSTANCE_ID}"
echo ""
echo "2. Click 'Connect' to open browser terminal"
echo ""
echo "3. Paste this command:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat /tmp/obrien-n8n-fix.sh
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4. Wait 30 seconds after it completes"
echo ""
echo "5. Come back here and press ENTER"
echo ""
read -p "Press ENTER when you've run the fix... " -r

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 3: Testing the fix..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test webhooks
WEBHOOKS=(
  "crew-captain-jean-luc-picard"
  "crew-commander-data"
  "crew-chief-obrien"
  "observation-lounge"
)

SUCCESS=0
TOTAL=${#WEBHOOKS[@]}

for WEBHOOK in "${WEBHOOKS[@]}"; do
  STATUS=$(curl -s "https://n8n.pbradygeorgen.com/webhook/$WEBHOOK" -X POST \
    -H "Content-Type: application/json" \
    -d '{"test": true}' \
    -o /dev/null -w "%{http_code}")
  
  if [ "$STATUS" = "404" ]; then
    echo "❌ $WEBHOOK: NOT REGISTERED"
  else
    echo "✅ $WEBHOOK: WORKING (HTTP $STATUS)"
    SUCCESS=$((SUCCESS + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SUCCESS" -eq "$TOTAL" ]; then
  echo "🎉 ALL WEBHOOKS WORKING!"
  echo ""
  echo "✅ End-to-end DDD architecture restored:"
  echo "   Dashboard UI <=> n8n Controller <=> Supabase"
  echo ""
  echo "👷 O'Brien: 'Told you it was simple. Now let's get that observation"
  echo "           lounge meeting going!'"
  echo ""
  echo "Run this:"
  echo "   node scripts/observation-lounge-meeting.js"
  echo ""
elif [ "$SUCCESS" -gt 0 ]; then
  echo "⚠️  Partial success ($SUCCESS/$TOTAL working)"
  echo ""
  echo "👷 O'Brien: 'Webhooks are registering but not all of them yet."
  echo "           Give it another minute and try reactivating workflows.'"
  echo ""
  echo "Run this to reactivate:"
  echo "   bash scripts/test-webhooks-after-fix.sh"
  echo ""
else
  echo "❌ Webhooks still not working"
  echo ""
  echo "👷 O'Brien: 'Alright, that didn't work. Let me check the logs..."
  echo "           The container might not have started properly.'"
  echo ""
  echo "Check container logs:"
  echo "   In AWS Console, run: docker logs n8n --tail 50"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

