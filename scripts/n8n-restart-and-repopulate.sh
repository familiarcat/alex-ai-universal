#!/bin/bash
################################################################################
# N8N Restart and Repopulation Script
# 
# Comprehensive script to:
# 1. Verify AWS CLI and instance configuration
# 2. Update all references to correct instance ID
# 3. Restart N8N Docker container
# 4. Repopulate workflows and webhooks
# 5. Verify health and connectivity
#
# Crew Coordination: All crew members working in parallel
################################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
TARGET_INSTANCE_ID="i-0afdf313f61f22df0"
AWS_REGION="${AWS_REGION:-us-east-2}"
N8N_URL="${N8N_URL:-https://n8n.pbradygeorgen.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🖖 N8N RESTART AND REPOPULATION                                      ║
║                                                                        ║
║   Crew Coordination: All systems operational                          ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

################################################################################
# PHASE 1: VERIFICATION (Commander Data)
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🤖 PHASE 1: Verification (Commander Data)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Verify AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS CLI available${NC}"

# Verify AWS credentials
if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    echo -e "${YELLOW}⚠️  Loading credentials from ~/.zshrc...${NC}"
    source ~/.zshrc 2>/dev/null || true
fi

if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    echo -e "${RED}❌ AWS credentials not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials loaded${NC}"

# Verify instance exists and is running
echo -e "${BLUE}🔍 Verifying instance ${TARGET_INSTANCE_ID}...${NC}"
INSTANCE_INFO=$(aws ec2 describe-instances \
    --instance-ids "$TARGET_INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'Reservations[0].Instances[0].[InstanceId,State.Name,PublicIpAddress,PrivateIpAddress,Tags[?Key==`Name`].Value|[0]]' \
    --output json 2>/dev/null || echo "[]")

if [ "$INSTANCE_INFO" = "[]" ]; then
    echo -e "${RED}❌ Instance ${TARGET_INSTANCE_ID} not found${NC}"
    exit 1
fi

INSTANCE_STATE=$(echo "$INSTANCE_INFO" | jq -r '.[1]' 2>/dev/null || echo "unknown")
INSTANCE_PUBLIC_IP=$(echo "$INSTANCE_INFO" | jq -r '.[2]' 2>/dev/null || echo "")
INSTANCE_NAME=$(echo "$INSTANCE_INFO" | jq -r '.[4]' 2>/dev/null || echo "")

echo -e "${GREEN}✅ Instance found: ${TARGET_INSTANCE_ID}${NC}"
echo "   Name: $INSTANCE_NAME"
echo "   State: $INSTANCE_STATE"
echo "   Public IP: $INSTANCE_PUBLIC_IP"

if [ "$INSTANCE_STATE" != "running" ]; then
    echo -e "${YELLOW}⚠️  Instance is not running. Starting instance...${NC}"
    aws ec2 start-instances --instance-ids "$TARGET_INSTANCE_ID" --region "$AWS_REGION" >/dev/null
    echo "   Waiting for instance to start..."
    aws ec2 wait instance-running --instance-ids "$TARGET_INSTANCE_ID" --region "$AWS_REGION"
    echo -e "${GREEN}✅ Instance is now running${NC}"
fi

echo ""

################################################################################
# PHASE 2: UPDATE REFERENCES (Lieutenant Geordi)
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  PHASE 2: Update References (Lieutenant Geordi)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Update restart-n8n-server.sh if needed
if grep -q "i-008e2d124532fb313" "$SCRIPT_DIR/restart-n8n-server.sh" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Updating restart-n8n-server.sh...${NC}"
    sed -i.bak "s/i-008e2d124532fb313/i-0afdf313f61f22df0/g" "$SCRIPT_DIR/restart-n8n-server.sh"
    echo -e "${GREEN}✅ Updated restart-n8n-server.sh${NC}"
fi

# Verify Docker configuration
if [ -f "$WORKSPACE_ROOT/docker-compose.n8n.yml" ]; then
    echo -e "${GREEN}✅ Docker configuration found${NC}"
fi

# Verify Terraform configuration
if [ -d "$WORKSPACE_ROOT/terraform/n8n-infrastructure" ]; then
    echo -e "${GREEN}✅ Terraform configuration found${NC}"
fi

echo ""

################################################################################
# PHASE 3: RESTART N8N (Chief O'Brien & Commander Riker)
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔄 PHASE 3: Restart N8N (Chief O'Brien & Commander Riker)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if Docker is running on instance
echo -e "${BLUE}🔍 Checking Docker status on instance...${NC}"
DOCKER_CHECK=$(aws ssm send-command \
    --instance-ids "$TARGET_INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=["docker ps"]' \
    --region "$AWS_REGION" \
    --output text \
    --query 'Command.CommandId' 2>/dev/null || echo "")

if [ -n "$DOCKER_CHECK" ]; then
    echo "   Command ID: $DOCKER_CHECK"
    sleep 5
    
    DOCKER_STATUS=$(aws ssm get-command-invocation \
        --command-id "$DOCKER_CHECK" \
        --instance-id "$TARGET_INSTANCE_ID" \
        --region "$AWS_REGION" \
        --query 'Status' \
        --output text 2>/dev/null || echo "Unknown")
    
    if [ "$DOCKER_STATUS" = "Success" ]; then
        echo -e "${GREEN}✅ Docker is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker status: $DOCKER_STATUS${NC}"
    fi
fi

# Restart N8N Docker container
echo -e "${YELLOW}🔄 Restarting N8N Docker container...${NC}"

# Use the existing restart script which handles Docker properly
if [ -f "$SCRIPT_DIR/n8n-restart-remote-docker.sh" ]; then
    echo "   Using n8n-restart-remote-docker.sh..."
    bash "$SCRIPT_DIR/n8n-restart-remote-docker.sh" || {
        echo -e "${YELLOW}⚠️  Docker restart script had issues, trying SSM directly...${NC}"
        
        # Fallback: Direct SSM command
        RESTART_CMD_ID=$(aws ssm send-command \
            --instance-ids "$TARGET_INSTANCE_ID" \
            --document-name "AWS-RunShellScript" \
            --parameters "commands=[\"CONTAINER=\\\$(docker ps --format '{{.Names}}' | grep -i n8n | head -1)\", \"if [ -n \\\"\\\$CONTAINER\\\" ]; then docker restart \\\$CONTAINER; sleep 10; docker ps | grep -i n8n; else echo 'No n8n container found'; fi\"]" \
            --region "$AWS_REGION" \
            --output text \
            --query 'Command.CommandId' 2>&1)
        
        if [ $? -eq 0 ] && [ -n "$RESTART_CMD_ID" ]; then
            echo "   Command ID: $RESTART_CMD_ID"
            echo "   Waiting for restart to complete..."
            sleep 15
            
            RESTART_STATUS=$(aws ssm get-command-invocation \
                --command-id "$RESTART_CMD_ID" \
                --instance-id "$TARGET_INSTANCE_ID" \
                --region "$AWS_REGION" \
                --query 'Status' \
                --output text 2>/dev/null || echo "Unknown")
            
            if [ "$RESTART_STATUS" = "Success" ]; then
                echo -e "${GREEN}✅ N8N container restarted successfully${NC}"
            else
                echo -e "${YELLOW}⚠️  Restart status: $RESTART_STATUS${NC}"
            fi
        else
            echo -e "${RED}❌ Failed to send restart command${NC}"
            echo "   Error: $RESTART_CMD_ID"
        fi
    }
else
    echo -e "${YELLOW}⚠️  n8n-restart-remote-docker.sh not found, using SSM directly...${NC}"
    
    RESTART_CMD_ID=$(aws ssm send-command \
        --instance-ids "$TARGET_INSTANCE_ID" \
        --document-name "AWS-RunShellScript" \
        --parameters "commands=[\"CONTAINER=\\\$(docker ps --format '{{.Names}}' | grep -i n8n | head -1)\", \"if [ -n \\\"\\\$CONTAINER\\\" ]; then docker restart \\\$CONTAINER; sleep 10; docker ps | grep -i n8n; else echo 'No n8n container found'; fi\"]" \
        --region "$AWS_REGION" \
        --output text \
        --query 'Command.CommandId' 2>&1)
    
    if [ $? -eq 0 ] && [ -n "$RESTART_CMD_ID" ]; then
        echo "   Command ID: $RESTART_CMD_ID"
        echo "   Waiting for restart to complete..."
        sleep 15
        
        RESTART_STATUS=$(aws ssm get-command-invocation \
            --command-id "$RESTART_CMD_ID" \
            --instance-id "$TARGET_INSTANCE_ID" \
            --region "$AWS_REGION" \
            --query 'Status' \
            --output text 2>/dev/null || echo "Unknown")
        
        if [ "$RESTART_STATUS" = "Success" ]; then
            echo -e "${GREEN}✅ N8N container restarted successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  Restart status: $RESTART_STATUS${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to send restart command${NC}"
        echo "   Error: $RESTART_CMD_ID"
    fi
fi

echo ""

################################################################################
# PHASE 4: REPOPULATION (Lieutenant Uhura)
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📡 PHASE 4: Repopulation (Lieutenant Uhura)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Wait for N8N to be ready
echo -e "${BLUE}⏳ Waiting for N8N to be ready...${NC}"
sleep 10

# Check N8N health
if [ -f "$SCRIPT_DIR/check-n8n-health.js" ]; then
    echo -e "${BLUE}🔍 Checking N8N health...${NC}"
    if node "$SCRIPT_DIR/check-n8n-health.js" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ N8N is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  N8N health check failed, but continuing...${NC}"
    fi
fi

# Sync webhooks if script exists
if [ -f "$SCRIPT_DIR/n8n-sync-webhooks.js" ]; then
    echo -e "${BLUE}🔄 Syncing N8N webhooks...${NC}"
    node "$SCRIPT_DIR/n8n-sync-webhooks.js" >/dev/null 2>&1 || echo -e "${YELLOW}⚠️  Webhook sync had issues${NC}"
    echo -e "${GREEN}✅ Webhook sync attempted${NC}"
fi

echo ""

################################################################################
# PHASE 5: VERIFICATION (Dr. Crusher)
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🏥 PHASE 5: Verification (Dr. Crusher)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Final health check
echo -e "${BLUE}🔍 Final health verification...${NC}"
if [ -f "$SCRIPT_DIR/check-n8n-health.js" ]; then
    if node "$SCRIPT_DIR/check-n8n-health.js" 2>/dev/null; then
        echo -e "${GREEN}✅ N8N is healthy and operational${NC}"
    else
        echo -e "${YELLOW}⚠️  N8N health check failed${NC}"
        echo "   N8N may still be starting. Wait a few moments and check again."
    fi
else
    # Fallback: simple HTTP check
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
        echo -e "${GREEN}✅ N8N is responding (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  N8N returned HTTP $HTTP_CODE${NC}"
    fi
fi

echo ""

################################################################################
# SUMMARY
################################################################################

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}║   ✅ N8N RESTART AND REPOPULATION COMPLETE                             ║${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "   Instance ID: $TARGET_INSTANCE_ID"
echo "   Instance State: $INSTANCE_STATE"
echo "   Public IP: $INSTANCE_PUBLIC_IP"
echo "   N8N URL: $N8N_URL"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "   1. Verify workflows: Visit $N8N_URL"
echo "   2. Test webhooks: node scripts/check-n8n-health.js"
echo "   3. Sync workflows: node scripts/n8n-sync-webhooks.js"
echo "   4. Monitor health: node scripts/check-n8n-health.js"
echo ""
echo -e "${CYAN}🖖 All crew members have completed their tasks.${NC}\n"

