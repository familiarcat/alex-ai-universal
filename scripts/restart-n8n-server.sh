#!/bin/bash
# N8N Server Restart Script
# 
# Commander Riker's recommendation: One-command restart script
# Chief O'Brien's recommendation: Simple, tested restart procedure
# 
# Uses AWS SSM to securely restart N8N server

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
INSTANCE_ID="${N8N_INSTANCE_ID:-i-008e2d124532fb313}"
RESTART_METHOD="${RESTART_METHOD:-pm2}" # pm2 or systemd

echo -e "${YELLOW}🔄 Restarting N8N Server...${NC}"
echo "   Instance ID: $INSTANCE_ID"
echo "   Method: $RESTART_METHOD"
echo ""

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI.${NC}"
    exit 1
fi

# Check if instance is running
echo "🔍 Checking instance status..."
INSTANCE_STATE=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --query 'Reservations[0].Instances[0].State.Name' --output text 2>/dev/null || echo "unknown")

if [ "$INSTANCE_STATE" != "running" ]; then
    echo -e "${RED}❌ Instance is not running. Current state: $INSTANCE_STATE${NC}"
    echo "   Please start the instance first: aws ec2 start-instances --instance-ids $INSTANCE_ID"
    exit 1
fi

echo -e "${GREEN}✅ Instance is running${NC}"
echo ""

# Restart N8N via SSM
echo "🔄 Executing restart command via SSM..."

if [ "$RESTART_METHOD" = "pm2" ]; then
    RESTART_CMD="pm2 restart n8n || pm2 start n8n"
else
    RESTART_CMD="sudo systemctl restart n8n || sudo systemctl start n8n"
fi

# Execute restart command
SSM_OUTPUT=$(aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[\"$RESTART_CMD\", \"sleep 5\", \"pm2 status n8n || systemctl status n8n\"]" \
    --output text \
    --query 'Command.CommandId' 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to send SSM command${NC}"
    echo "   Error: $SSM_OUTPUT"
    exit 1
fi

COMMAND_ID=$(echo "$SSM_OUTPUT" | head -1)
echo "   Command ID: $COMMAND_ID"
echo ""

# Wait for command to complete
echo "⏳ Waiting for restart to complete..."
sleep 10

# Check command status
COMMAND_STATUS=$(aws ssm get-command-invocation \
    --command-id "$COMMAND_ID" \
    --instance-id "$INSTANCE_ID" \
    --query 'Status' \
    --output text 2>/dev/null || echo "Unknown")

if [ "$COMMAND_STATUS" = "Success" ]; then
    echo -e "${GREEN}✅ N8N server restart command executed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Command status: $COMMAND_STATUS${NC}"
    echo "   Check command output: aws ssm get-command-invocation --command-id $COMMAND_ID --instance-id $INSTANCE_ID"
fi

echo ""
echo "🔍 Verifying N8N health..."
sleep 5

# Check health
if node scripts/check-n8n-health.js >/dev/null 2>&1; then
    echo -e "${GREEN}✅ N8N server is healthy after restart${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  N8N health check failed. Server may still be starting...${NC}"
    echo "   Wait a few moments and check: node scripts/check-n8n-health.js"
    exit 1
fi

