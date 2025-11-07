#!/bin/bash
################################################################################
# N8N WORKFLOW TOGGLE VIA SSH - Force Webhook Registration
################################################################################
# Purpose: Toggle n8n workflows using CLI commands directly in Docker container
# Why: n8n API has validation issues; CLI commands bypass this
# Use Cases:
#   - After adding/updating workflows
#   - When webhooks show 404 errors
#   - After n8n container restart
#
# Philosophy: "When the API fails, go direct to the source" - Chief O'Brien
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
║   🔄 N8N WORKFLOW TOGGLE VIA SSH                                      ║
║                                                                        ║
║   "When the high-tech solution fails, use the wrench." - O'Brien      ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Load environment variables
export N8N_URL=$(grep 'export N8N_URL=' ~/.zshrc 2>/dev/null | tail -1 | cut -d'=' -f2- | tr -d '"' || echo "https://n8n.pbradygeorgen.com")
export N8N_API_KEY=$(grep 'export N8N_API_KEY=' ~/.zshrc 2>/dev/null | tail -1 | cut -d'=' -f2- | tr -d '"' || echo "")

# EC2 Configuration
INSTANCE_ID="${N8N_EC2_INSTANCE_ID:-i-0afdf313f61f22df0}"
SSH_HOST="${N8N_SSH_HOST:-n8n.pbradygeorgen.com}"
SSH_USER="${N8N_SSH_USER:-ubuntu}"
SSH_KEY="${N8N_SSH_KEY:-$HOME/.ssh/id_rsa}"
CONTAINER_NAME="${N8N_CONTAINER_NAME:-n8n}"

# Get actual EC2 public IP
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

echo ""

################################################################################
# Step 1: Get workflow IDs from n8n API
################################################################################

echo -e "${BLUE}🔍 Step 1: Fetching crew workflow IDs from n8n API...${NC}"

WORKFLOW_IDS=$(curl -s "${N8N_URL}/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" | \
  jq -r '.data[] | select(.name | test("CREW|COORDINATION")) | .id' 2>/dev/null || echo "")

if [ -z "$WORKFLOW_IDS" ]; then
  echo -e "${RED}❌ Failed to fetch workflow IDs${NC}"
  exit 1
fi

WORKFLOW_COUNT=$(echo "$WORKFLOW_IDS" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Found $WORKFLOW_COUNT crew/coordination workflows${NC}\n"

################################################################################
# Step 2: Toggle workflows OFF via SSH
################################################################################

echo -e "${BLUE}🔄 Step 2: Toggling workflows OFF (via n8n CLI)...${NC}"

ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" bash << EOF
set -e

echo "$WORKFLOW_IDS" | while read -r wf_id; do
  if [ -n "\$wf_id" ]; then
    echo "   ⚫ Deactivating: \$wf_id"
    docker exec $CONTAINER_NAME n8n update:workflow --id="\$wf_id" --active=false 2>/dev/null || echo "      ⚠️  Failed (may already be inactive)"
    sleep 0.5
  fi
done
EOF

echo -e "${GREEN}✅ All workflows deactivated${NC}\n"

################################################################################
# Step 3: Wait for webhook unregistration
################################################################################

echo -e "${BLUE}⏳ Step 3: Waiting 3 seconds for webhook unregistration...${NC}"
sleep 3

################################################################################
# Step 4: Toggle workflows ON via SSH
################################################################################

echo -e "${BLUE}🔄 Step 4: Toggling workflows ON (via n8n CLI)...${NC}"

ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" bash << EOF
set -e

echo "$WORKFLOW_IDS" | while read -r wf_id; do
  if [ -n "\$wf_id" ]; then
    echo "   🟢 Activating: \$wf_id"
    docker exec $CONTAINER_NAME n8n update:workflow --id="\$wf_id" --active=true 2>/dev/null || echo "      ❌ Failed"
    sleep 0.5
  fi
done
EOF

echo -e "${GREEN}✅ All workflows activated${NC}\n"

################################################################################
# Step 5: Wait for webhook registration
################################################################################

echo -e "${BLUE}⏳ Step 5: Waiting 5 seconds for webhook registration...${NC}"
sleep 5

################################################################################
# Step 6: Test webhooks
################################################################################

echo -e "${BLUE}🧪 Step 6: Testing webhook registration...${NC}"

# Test a few key webhooks
test_webhook() {
  local name=$1
  local path=$2
  local status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query":"health check"}' \
    "https://$SSH_HOST$path" 2>/dev/null || echo "000")
  
  if [ "$status" = "200" ] || [ "$status" = "201" ]; then
    echo -e "   ${GREEN}✅ $name (HTTP $status)${NC}"
    return 0
  else
    echo -e "   ${RED}❌ $name (HTTP $status)${NC}"
    return 1
  fi
}

SUCCESS_COUNT=0
TOTAL_TESTS=4

test_webhook "Captain Picard     " "/webhook/crew-captain-jean-luc-picard" && ((SUCCESS_COUNT++)) || true
test_webhook "Commander Data     " "/webhook/crew-commander-data" && ((SUCCESS_COUNT++)) || true
test_webhook "Geordi La Forge    " "/webhook/crew-geordi-la-forge" && ((SUCCESS_COUNT++)) || true
test_webhook "Observation Lounge " "/webhook/observation-lounge" && ((SUCCESS_COUNT++)) || true

echo ""

################################################################################
# Summary
################################################################################

if [ $SUCCESS_COUNT -eq $TOTAL_TESTS ]; then
  echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║                                                                        ║${NC}"
  echo -e "${CYAN}║   ✅ SUCCESS! ALL WEBHOOKS REGISTERED                                 ║${NC}"
  echo -e "${CYAN}║                                                                        ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Workflows Toggled: $WORKFLOW_COUNT"
  echo "Webhooks Working: $SUCCESS_COUNT/$TOTAL_TESTS"
  echo ""
  echo -e "${GREEN}🎉 Crew webhooks are operational!${NC}"
  echo ""
  echo "Next steps:"
  echo "   1. Test all crew webhooks: npm run rag:verify"
  echo "   2. Monitor webhook health: node scripts/monitor-webhook-health.js"
else
  echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║                                                                        ║${NC}"
  echo -e "${YELLOW}║   ⚠️  PARTIAL SUCCESS - SOME WEBHOOKS STILL NOT WORKING              ║${NC}"
  echo -e "${YELLOW}║                                                                        ║${NC}"
  echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Workflows Toggled: $WORKFLOW_COUNT"
  echo "Webhooks Working: $SUCCESS_COUNT/$TOTAL_TESTS"
  echo ""
  echo -e "${YELLOW}⚠️  Some webhooks still not registered${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "   1. Wait 30 seconds and run again: npm run n8n:toggle-ssh"
  echo "   2. Check n8n logs: ssh $SSH_USER@$SSH_TARGET 'docker logs $CONTAINER_NAME --tail 50'"
  echo "   3. Manual UI toggle: https://$SSH_HOST"
fi

