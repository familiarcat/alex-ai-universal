#!/bin/bash

# Simple script to check n8n version on EC2

INSTANCE_ID="${N8N_AWS_INSTANCE_ID:-i-0afdf313f61f22df0}"
REGION="${AWS_REGION:-us-east-2}"
SSH_USER="ubuntu"

echo "🔍 Checking n8n Version on EC2"
echo "════════════════════════════════════════════════"
echo ""

# Get instance IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text 2>/dev/null)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
  echo "❌ Could not get instance IP"
  exit 1
fi

echo "📡 Instance IP: $PUBLIC_IP"
echo ""

# Setup SSH key
TEMP_KEY="$HOME/.ssh/ec2-instance-connect-temp"
TEMP_PUB_KEY="${TEMP_KEY}.pub"

if [ ! -f "$TEMP_KEY" ]; then
  ssh-keygen -t rsa -f "$TEMP_KEY" -N "" -C "ec2-instance-connect-temp" >/dev/null 2>&1
fi

AVAILABILITY_ZONE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].Placement.AvailabilityZone' \
  --output text 2>/dev/null)

aws ec2-instance-connect send-ssh-public-key \
  --instance-id "$INSTANCE_ID" \
  --availability-zone "$AVAILABILITY_ZONE" \
  --instance-os-user "$SSH_USER" \
  --ssh-public-key "file://${TEMP_PUB_KEY}" \
  --region "$REGION" >/dev/null 2>&1

sleep 2

echo "🔍 Checking n8n version..."
echo ""

# Check docker image
echo "1. Docker Image:"
ssh -i "$TEMP_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker inspect n8n | grep -i '\"Image\"' | head -1" 2>/dev/null || echo "   Could not check"

echo ""
echo "2. n8n Version Command:"
ssh -i "$TEMP_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker exec n8n n8n --version 2>/dev/null || sudo docker exec n8n node -e 'try { const pkg = require(\"/home/node/.n8n/package.json\"); console.log(pkg.version); } catch(e) { console.log(\"unknown\"); }' 2>/dev/null" 2>/dev/null || echo "   Could not check"

echo ""
echo "3. Package.json Version:"
ssh -i "$TEMP_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker exec n8n cat /home/node/.n8n/package.json 2>/dev/null | grep '\"version\"' | head -1" 2>/dev/null || echo "   Could not check"

echo ""
echo "✅ Version check complete"

