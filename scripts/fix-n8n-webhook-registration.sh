#!/bin/bash

################################################################################
# Fix n8n Webhook Registration
# 
# Removes deprecated N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN env var
# and restarts n8n container to fix webhook registration issues.
################################################################################

set -e

# Configuration
INSTANCE_ID="i-0afdf313f61f22df0"
AVAILABILITY_ZONE="us-east-2b"
REGION="us-east-2"
SSH_USER="ubuntu"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 FIXING N8N WEBHOOK REGISTRATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Get instance IP
echo -e "${YELLOW}🔍 Getting EC2 instance IP...${NC}"
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text 2>/dev/null)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
  echo -e "${RED}❌ Could not get instance IP${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Instance IP: $PUBLIC_IP${NC}\n"

# Use EC2 Instance Connect
TEMP_KEY_PATH="$HOME/.ssh/ec2-instance-connect-temp"
TEMP_PUB_KEY_PATH="${TEMP_KEY_PATH}.pub"

if [ ! -f "$TEMP_KEY_PATH" ]; then
  echo -e "${YELLOW}🔑 Generating temporary SSH key...${NC}"
  ssh-keygen -t rsa -f "$TEMP_KEY_PATH" -N "" -C "ec2-instance-connect-temp" >/dev/null 2>&1
fi

# Inject key
echo -e "${YELLOW}📤 Injecting SSH key via EC2 Instance Connect...${NC}"
aws ec2-instance-connect send-ssh-public-key \
  --instance-id "$INSTANCE_ID" \
  --availability-zone "$AVAILABILITY_ZONE" \
  --instance-os-user "$SSH_USER" \
  --ssh-public-key "file://${TEMP_PUB_KEY_PATH}" \
  --region "$REGION" >/dev/null 2>&1

sleep 2

# Step 1: Backup .env file
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1️⃣  BACKING UP .ENV FILE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo cp /opt/n8n/.env /opt/n8n/.env.backup-$(date +%Y%m%d-%H%M%S) && echo '✅ Backup created'"

# Step 2: Remove deprecated env var
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2️⃣  REMOVING DEPRECATED ENV VAR${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Removing N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN from .env...${NC}"

ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo sed -i '/N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN/d' /opt/n8n/.env && echo '✅ Deprecated env var removed'"

# Verify removal
echo -e "\n${YELLOW}Verifying removal...${NC}"
ENV_CHECK=$(ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo grep -c 'N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN' /opt/n8n/.env || echo '0'")

if [ "$ENV_CHECK" == "0" ]; then
  echo -e "${GREEN}✅ Deprecated env var successfully removed${NC}\n"
else
  echo -e "${RED}⚠️  Warning: Env var may still exist (count: $ENV_CHECK)${NC}\n"
fi

# Step 3: Update docker-compose.yml if it exists
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3️⃣  UPDATING DOCKER-COMPOSE.YML${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "if [ -f /opt/n8n/docker-compose.yml ]; then sudo sed -i '/N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN/d' /opt/n8n/docker-compose.yml && echo '✅ Updated docker-compose.yml'; else echo '⚠️  docker-compose.yml not found (using docker run)'; fi"

# Step 4: Restart n8n container
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4️⃣  RESTARTING N8N CONTAINER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Stopping n8n container...${NC}"
ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker stop n8n 2>/dev/null || echo 'Container not running'"

echo -e "\n${YELLOW}Removing n8n container...${NC}"
ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker rm n8n 2>/dev/null || echo 'Container not found'"

echo -e "\n${YELLOW}Starting n8n container with updated .env...${NC}"
ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "cd /opt/n8n && if [ -f docker-compose.yml ]; then sudo docker-compose up -d; else sudo docker run -d --name n8n --restart always -p 5678:5678 --env-file /opt/n8n/.env -v /home/ubuntu/.n8n:/home/node/.n8n n8nio/n8n:latest; fi"

echo -e "\n${GREEN}✅ Container restart initiated${NC}"

# Step 5: Wait for n8n to initialize
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5️⃣  WAITING FOR N8N TO INITIALIZE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Waiting 30 seconds for n8n to start...${NC}"
sleep 30

echo -e "\n${YELLOW}Checking container status...${NC}"
CONTAINER_STATUS=$(ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker ps --filter name=n8n --format '{{.Status}}' 2>/dev/null || echo 'not running'")

echo -e "   Container status: ${CONTAINER_STATUS}"

if [[ "$CONTAINER_STATUS" == *"Up"* ]]; then
  echo -e "${GREEN}✅ Container is running${NC}\n"
else
  echo -e "${RED}⚠️  Container may not be running properly${NC}\n"
fi

# Step 6: Verify environment variables
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6️⃣  VERIFYING ENVIRONMENT VARIABLES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Checking WEBHOOK_URL in container...${NC}"
WEBHOOK_URL=$(ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker exec n8n env | grep '^WEBHOOK_URL=' | cut -d'=' -f2 || echo 'not found'")

echo -e "   WEBHOOK_URL: ${WEBHOOK_URL}"

DEPRECATED_VAR=$(ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker exec n8n env | grep 'N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN' || echo 'not found'")

if [[ "$DEPRECATED_VAR" == *"not found"* ]]; then
  echo -e "${GREEN}✅ Deprecated env var not found in container${NC}\n"
else
  echo -e "${RED}⚠️  Deprecated env var still present: ${DEPRECATED_VAR}${NC}\n"
fi

# Final summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 FIX SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}✅ Completed:${NC}"
echo -e "   • Backup created"
echo -e "   • Deprecated env var removed from .env"
echo -e "   • docker-compose.yml updated (if exists)"
echo -e "   • Container restarted"
echo -e "   • Environment verified\n"

echo -e "${YELLOW}⏳ Next Steps:${NC}"
echo -e "   1. Wait 60 seconds for n8n to fully initialize"
echo -e "   2. Activate workflows to trigger webhook registration"
echo -e "   3. Test webhook: curl -X POST https://n8n.pbradygeorgen.com/webhook/ingest-knowledge"
echo -e "   4. Run: node scripts/force-webhook-reregistration.js\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

