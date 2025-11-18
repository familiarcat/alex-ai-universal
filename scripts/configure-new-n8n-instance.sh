#!/bin/bash

################################################################################
#
# 🚀 CONFIGURE NEW N8N INSTANCE (100% AWS SSM Automated)
#
# Configures the new Terraform-created instance with n8n
#
################################################################################

INSTANCE_ID="i-0afdf313f61f22df0"

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🚀 CONFIGURING N8N VIA AWS SSM (100% Automated!)                   ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "🎯 Target: $INSTANCE_ID"
echo ""

# Create the complete setup script
SETUP_SCRIPT='#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Creating n8n environment file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sudo mkdir -p /opt/n8n
sudo bash -c "cat > /opt/n8n/.env" << ENVEOF
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
WEBHOOK_TUNNEL_URL=
N8N_USER_FOLDER=/home/node/.n8n
EXECUTIONS_MODE=regular
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
ENVEOF

echo "✅ Environment file created"
echo ""
echo "📋 Contents:"
cat /opt/n8n/.env

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Starting n8n Docker container..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:latest

echo ""
echo "⏳ Waiting 10 seconds for n8n to initialize..."
sleep 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verifying n8n is running..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Verifying WEBHOOK_URL environment variables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker exec n8n env | grep -E "(WEBHOOK_URL|N8N_PROTOCOL|N8N_HOST)"

echo ""
echo "✅ SETUP COMPLETE!"
'

# Write setup script to temporary file
SCRIPT_FILE="/tmp/setup-n8n-$$.sh"
echo "$SETUP_SCRIPT" > "$SCRIPT_FILE"

# Upload and execute via SSM
echo "📤 Uploading setup script to instance..."

COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters commands="$(cat $SCRIPT_FILE | base64)" \
  --parameters commands='["echo $(cat /dev/stdin | base64 -d) > /tmp/setup.sh && chmod +x /tmp/setup.sh && /tmp/setup.sh"]' \
  --output text \
  --query 'Command.CommandId' 2>&1)

# Simpler approach: send script directly
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"$SETUP_SCRIPT\"]" \
  --output text \
  --query 'Command.CommandId' 2>&1 | head -1)

echo "   Command ID: $COMMAND_ID"
echo ""

rm -f "$SCRIPT_FILE"

echo "⏳ Waiting 20 seconds for command to complete..."
sleep 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 COMMAND OUTPUT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id "$INSTANCE_ID" \
  --query 'StandardOutputContent' \
  --output text

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

