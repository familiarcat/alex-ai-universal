#!/bin/bash

################################################################################
# Execute RAG Webhook Diagnostics on EC2
# 
# Runs the diagnostic commands on the EC2 instance to investigate
# why the webhook isn't registering.
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
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 EXECUTING RAG WEBHOOK DIAGNOSTICS${NC}"
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

# Execute diagnostic commands
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1️⃣  CHECKING N8N LOGS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "docker logs n8n 2>&1 | grep -i webhook | tail -50" || echo "No webhook-related logs found"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2️⃣  VERIFYING N8N VERSION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "docker exec n8n n8n --version 2>&1 || echo 'Could not get version'"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3️⃣  CHECKING N8N DATABASE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if sqlite3 is available
ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "docker exec n8n sh -c 'if command -v sqlite3 >/dev/null 2>&1; then sqlite3 /home/node/.n8n/database.sqlite \"SELECT * FROM webhook_entity WHERE path LIKE \\\"%ingest-knowledge%\\\" LIMIT 10;\" 2>&1; else echo \"sqlite3 not available in container - checking from host...\"; fi'"

# Try from host if container doesn't have sqlite3
echo -e "\n${YELLOW}Trying from host (if sqlite3 available)...${NC}"
ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "if command -v sqlite3 >/dev/null 2>&1; then sudo sqlite3 /home/ubuntu/.n8n/database.sqlite \"SELECT * FROM webhook_entity WHERE path LIKE '%ingest-knowledge%' LIMIT 10;\" 2>&1 || echo 'Database query failed'; else echo 'sqlite3 not available on host'; fi"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4️⃣  CHECKING CONTAINER STATUS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "docker ps --filter name=n8n --format '{{.Names}} - {{.Status}}' && echo '' && docker exec n8n env | grep -E '(WEBHOOK_URL|N8N_)' | head -10"

echo -e "\n${GREEN}✅ Diagnostics complete${NC}\n"

