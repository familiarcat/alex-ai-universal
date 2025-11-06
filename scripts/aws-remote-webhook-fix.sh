#!/bin/bash

################################################################################
#
# 🚀 AWS REMOTE WEBHOOK FIX
#
# Uses AWS SSM to execute webhook fix commands on remote EC2 instance
#
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🚀 AWS REMOTE N8N WEBHOOK FIX                                       ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Load credentials from ~/.zshrc
source ~/.zshrc

echo "📊 Configuration:"
echo "   Instance ID: $N8N_AWS_INSTANCE_ID"
echo "   Region: $AWS_REGION"
echo "   AWS Profile: $AWS_PROFILE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 STEP 1: Creating permanent environment file on EC2..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

aws ssm send-command \
  --instance-ids "$N8N_AWS_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "sudo mkdir -p /opt/n8n",
    "sudo tee /opt/n8n/.env > /dev/null <<EOF
# N8N Webhook Configuration
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
WEBHOOK_TUNNEL_URL=

# Database persistence
N8N_USER_FOLDER=/home/node/.n8n
EOF",
    "echo Environment file created",
    "cat /opt/n8n/.env"
  ]' \
  --region "$AWS_REGION" \
  --output text \
  --query 'Command.CommandId'

COMMAND_ID_1=$?

echo "✅ Environment file creation command sent"
echo ""
sleep 5

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 STEP 2: Restarting n8n container with new environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$N8N_AWS_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo Stopping old n8n container...",
    "CURRENT_CONTAINER=$(docker ps -q --filter \"name=n8n\")",
    "if [ -n \"$CURRENT_CONTAINER\" ]; then docker stop $CURRENT_CONTAINER && docker rm $CURRENT_CONTAINER; echo Old container removed; else echo No container to remove; fi",
    "echo Starting new n8n container with environment file...",
    "docker run -d --name n8n --restart always -p 5678:5678 --env-file /opt/n8n/.env -v /home/ubuntu/.n8n:/home/node/.n8n n8nio/n8n:latest",
    "sleep 5",
    "NEW_CONTAINER=$(docker ps -q --filter \"name=n8n\")",
    "if [ -n \"$NEW_CONTAINER\" ]; then echo New container started: $NEW_CONTAINER; else echo Failed to start container; exit 1; fi",
    "echo Verifying WEBHOOK_URL...",
    "docker exec $NEW_CONTAINER env | grep -E \"(WEBHOOK_URL|N8N_PROTOCOL|N8N_HOST)\" || echo Environment variables not found",
    "echo Container startup complete"
  ]' \
  --region "$AWS_REGION" \
  --output text \
  --query 'Command.CommandId')

echo "✅ Container restart command sent"
echo "   Command ID: $COMMAND_ID"
echo ""

echo "⏳ Waiting for commands to execute (15 seconds)..."
sleep 15

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 STEP 3: Checking command results..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id "$N8N_AWS_INSTANCE_ID" \
  --region "$AWS_REGION" \
  --query 'StandardOutputContent' \
  --output text

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 4: Testing webhook registration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏳ Waiting 10 seconds for n8n to fully initialize..."
sleep 10

echo "Testing critical webhooks..."
echo ""

WEBHOOKS=(
  "crew-captain-jean-luc-picard"
  "crew-commander-data"
  "crew-commander-william-riker"
  "observation-lounge"
  "knowledge-ingest"
)

SUCCESS_COUNT=0
TOTAL=${#WEBHOOKS[@]}

for WEBHOOK in "${WEBHOOKS[@]}"; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://n8n.pbradygeorgen.com/webhook/$WEBHOOK" -X POST -H "Content-Type: application/json" -d '{"test": true}')
  
  if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ /webhook/$WEBHOOK: HTTP $HTTP_STATUS (NOT REGISTERED)"
  else
    echo "✅ /webhook/$WEBHOOK: HTTP $HTTP_STATUS (REGISTERED)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 RESULT: $SUCCESS_COUNT/$TOTAL webhooks registered"
echo ""

if [ "$SUCCESS_COUNT" -eq "$TOTAL" ]; then
  echo "🎉 ALL WEBHOOKS WORKING!"
  echo ""
  echo "✅ Observation lounge is now operational!"
  echo ""
  echo "Run this to test:"
  echo "   node scripts/observation-lounge-meeting.js"
  echo ""
elif [ "$SUCCESS_COUNT" -gt 0 ]; then
  echo "⚠️  Partial success. Webhooks need workflow reactivation."
  echo ""
  echo "Run this to reactivate all workflows:"
  echo "   bash scripts/test-webhooks-after-fix.sh"
  echo ""
else
  echo "❌ Webhooks still not registered."
  echo ""
  echo "May need manual intervention. Check n8n logs:"
  echo "   aws ssm send-command --instance-ids $N8N_AWS_INSTANCE_ID --document-name \"AWS-RunShellScript\" --parameters 'commands=[\"docker logs n8n --tail 50\"]' --region $AWS_REGION"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

