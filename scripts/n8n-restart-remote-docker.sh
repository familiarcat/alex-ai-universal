#!/bin/bash
################################################################################
# N8N REMOTE DOCKER RESTART - Force Webhook Registration
################################################################################
# Purpose: Restart n8n Docker container on EC2 to force webhook re-registration
# Use Cases:
#   - After adding/updating workflows
#   - When webhooks show 404 errors
#   - After bulk workflow imports
#   - When workflows are active but webhooks aren't registered
#
# Philosophy: "Turn it off and on again" - Chief O'Brien's favorite technique
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🔄 N8N REMOTE DOCKER RESTART                                        ║
║                                                                        ║
║   "Have you tried turning it off and on again?" - Chief O'Brien       ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Load environment variables
# Note: .zshrc may have zsh-specific syntax, so we extract just the exports we need
export N8N_URL=$(grep 'export N8N_URL=' ~/.zshrc 2>/dev/null | tail -1 | cut -d'=' -f2- | tr -d '"' || echo "https://n8n.pbradygeorgen.com")
export N8N_API_KEY=$(grep 'export N8N_API_KEY=' ~/.zshrc 2>/dev/null | tail -1 | cut -d'=' -f2- | tr -d '"' || echo "")
export AWS_ACCESS_KEY_ID=$(grep 'export AWS_ACCESS_KEY_ID=' ~/.zshrc 2>/dev/null | tail -1 | cut -d'=' -f2- | tr -d '"' || echo "")
export AWS_SECRET_ACCESS_KEY=$(grep 'export AWS_SECRET_ACCESS_KEY=' ~/.zshrc 2>/dev/null | tail -1 | cut -d'=' -f2- | tr -d '"' || echo "")

# EC2 Configuration
INSTANCE_ID="${N8N_EC2_INSTANCE_ID:-i-0afdf313f61f22df0}"
AVAIL_ZONE="${N8N_EC2_AZ:-us-east-2b}"
SSH_HOST="${N8N_SSH_HOST:-n8n.pbradygeorgen.com}"
SSH_USER="${N8N_SSH_USER:-ubuntu}"
SSH_KEY="${N8N_SSH_KEY:-$HOME/.ssh/id_rsa}"
CONTAINER_NAME="${N8N_CONTAINER_NAME:-n8n}"

# Get actual EC2 public IP (more reliable than DNS)
echo -e "${BLUE}🔍 Fetching EC2 public IP...${NC}"
EC2_PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region us-east-2 \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text 2>/dev/null || echo "")

if [ -n "$EC2_PUBLIC_IP" ] && [ "$EC2_PUBLIC_IP" != "None" ]; then
  SSH_TARGET="$EC2_PUBLIC_IP"
  echo -e "${GREEN}✅ Using direct IP: $EC2_PUBLIC_IP${NC}"
else
  SSH_TARGET="$SSH_HOST"
  echo -e "${YELLOW}⚠️  Using hostname: $SSH_HOST${NC}"
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Instance ID: $INSTANCE_ID"
echo "   SSH Target: $SSH_TARGET"
echo "   SSH User: $SSH_USER"
echo "   Container: $CONTAINER_NAME"
echo ""

################################################################################
# STEP 1: Ensure SSH Access
################################################################################

echo -e "${BLUE}🔐 Step 1: Ensuring SSH access...${NC}"

if ! ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" exit 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Direct SSH failed, trying EC2 Instance Connect...${NC}"
  
  if [ -f "$HOME/.ssh/id_rsa.pub" ]; then
    echo "   Injecting temporary SSH key..."
    aws ec2-instance-connect send-ssh-public-key \
      --instance-id "$INSTANCE_ID" \
      --availability-zone "$AVAIL_ZONE" \
      --instance-os-user "$SSH_USER" \
      --ssh-public-key "file://$HOME/.ssh/id_rsa.pub" \
      --region us-east-2
    
    echo "   Waiting 3s for key propagation..."
    sleep 3
  fi
fi

# Final SSH check (try a few times)
SSH_SUCCESS=false
for attempt in {1..3}; do
  if ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" exit 2>/dev/null; then
    SSH_SUCCESS=true
    break
  fi
  echo "   Retry $attempt/3..."
  sleep 2
done

if [ "$SSH_SUCCESS" = "false" ]; then
  echo -e "${RED}❌ Cannot establish SSH connection to EC2 instance${NC}"
  echo "   The EC2 instance might be stopped or the security group might be blocking SSH."
  echo "   Try: aws ec2 describe-instances --instance-ids $INSTANCE_ID"
  exit 1
fi

echo -e "${GREEN}✅ SSH connection established${NC}\n"

################################################################################
# STEP 2: Detect N8N Container
################################################################################

echo -e "${BLUE}🔍 Step 2: Detecting n8n container...${NC}"

ACTUAL_CONTAINER=$(ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" \
  "docker ps --format '{{.Names}}' | grep -i n8n | head -1" 2>/dev/null || echo "")

if [ -z "$ACTUAL_CONTAINER" ]; then
  echo -e "${RED}❌ No n8n container found running on EC2${NC}"
  echo "   Listing all containers:"
  ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" "docker ps"
  exit 1
fi

echo -e "${GREEN}✅ Found container: $ACTUAL_CONTAINER${NC}\n"

################################################################################
# STEP 3: Check Current Status
################################################################################

echo -e "${BLUE}📊 Step 3: Checking current status...${NC}"

ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" << EOF
echo "   Container: \$(docker ps --filter name=$ACTUAL_CONTAINER --format '{{.Names}}')"
echo "   Status: \$(docker ps --filter name=$ACTUAL_CONTAINER --format '{{.Status}}')"
echo "   Uptime: \$(docker ps --filter name=$ACTUAL_CONTAINER --format '{{.RunningFor}}')"
EOF

echo ""

################################################################################
# STEP 4: Restart Container
################################################################################

echo -e "${YELLOW}🔄 Step 4: Restarting n8n container...${NC}"
echo "   This will take 10-15 seconds..."
echo ""

START_TIME=$(date +%s)

ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" << EOF
set -e
echo "   🛑 Stopping container..."
docker restart $ACTUAL_CONTAINER

echo "   ⏳ Waiting for n8n to be ready..."
sleep 5

# Wait for n8n to respond (max 30 seconds)
for i in {1..30}; do
  if docker exec $ACTUAL_CONTAINER wget -q -O- http://localhost:5678/healthz 2>/dev/null | grep -q "ok"; then
    echo "   ✅ N8N is healthy and responding"
    break
  fi
  sleep 1
done

echo "   📊 Container restarted successfully"
EOF

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${GREEN}✅ Container restart complete (${DURATION}s)${NC}\n"

################################################################################
# STEP 5: Verify Webhooks
################################################################################

echo -e "${BLUE}🧪 Step 5: Verifying webhook registration...${NC}"
echo "   Waiting 5s for webhook registration..."
sleep 5

# Test a sample webhook
WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"health check"}' \
  "https://$SSH_HOST/webhook/crew-captain-jean-luc-picard" 2>/dev/null || echo "000")

if [ "$WEBHOOK_TEST" = "200" ] || [ "$WEBHOOK_TEST" = "201" ]; then
  echo -e "${GREEN}✅ Webhooks are responding (HTTP $WEBHOOK_TEST)${NC}"
elif [ "$WEBHOOK_TEST" = "404" ]; then
  echo -e "${YELLOW}⚠️  Webhooks still showing 404${NC}"
  echo "   💡 You may need to manually toggle workflows in the n8n UI"
  echo "   Visit: https://$SSH_HOST"
else
  echo -e "${YELLOW}⚠️  Webhook test returned HTTP $WEBHOOK_TEST${NC}"
fi

echo ""

################################################################################
# SUMMARY
################################################################################

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}║   ✅ N8N RESTART COMPLETE                                             ║${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Container: $ACTUAL_CONTAINER"
echo "Duration: ${DURATION}s"
echo "Webhook Test: HTTP $WEBHOOK_TEST"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "   1. Test crew webhooks: npm run rag:verify"
echo "   2. If webhooks still 404, toggle workflows in UI: https://$SSH_HOST"
echo "   3. Check webhook health: node scripts/monitor-webhook-health.js"
echo ""

