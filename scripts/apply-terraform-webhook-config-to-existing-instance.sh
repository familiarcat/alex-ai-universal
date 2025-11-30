#!/bin/bash

################################################################################
#
# Apply Terraform WEBHOOK_URL Configuration to Existing Instance
# 
# This script applies the updated Terraform configuration to an existing
# EC2 instance without requiring terraform apply (which would recreate instance)
#
################################################################################

set -e

INSTANCE_ID="${N8N_AWS_INSTANCE_ID:-i-0afdf313f61f22df0}"
REGION="${AWS_REGION:-us-east-2}"
SSH_USER="ubuntu"

echo "🖖 APPLYING TERRAFORM WEBHOOK CONFIG TO EXISTING INSTANCE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Get instance public IP
echo "🔍 Getting EC2 instance public IP..."
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
  echo "❌ Could not get instance IP. Is instance running?"
  exit 1
fi

echo "✅ Instance IP: $PUBLIC_IP"
echo ""

# Use EC2 Instance Connect to inject SSH key
echo "📤 Setting up SSH access via EC2 Instance Connect..."
TEMP_KEY_PATH="$HOME/.ssh/ec2-instance-connect-temp"
TEMP_PUB_KEY_PATH="${TEMP_KEY_PATH}.pub"

if [ ! -f "$TEMP_KEY_PATH" ]; then
  ssh-keygen -t rsa -f "$TEMP_KEY_PATH" -N "" -C "ec2-instance-connect-temp" >/dev/null 2>&1
fi

AVAILABILITY_ZONE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].Placement.AvailabilityZone' \
  --output text)

aws ec2-instance-connect send-ssh-public-key \
  --instance-id "$INSTANCE_ID" \
  --availability-zone "$AVAILABILITY_ZONE" \
  --instance-os-user "$SSH_USER" \
  --ssh-public-key "file://${TEMP_PUB_KEY_PATH}" \
  --region "$REGION" >/dev/null 2>&1

echo "✅ SSH key injected"
echo ""

# Wait for key to be active
sleep 2

# Apply configuration
echo "🚀 Applying WEBHOOK_URL configuration..."
echo ""

REMOTE_SCRIPT=$(cat << 'EOF'
#!/bin/bash
set -e

echo "[EC2] Updating n8n configuration..."

# Ensure .env file has WEBHOOK_URL
if [ ! -f /opt/n8n/.env ]; then
  echo "[EC2] Creating /opt/n8n/.env..."
  sudo mkdir -p /opt/n8n
  sudo tee /opt/n8n/.env >/dev/null <<ENVEOF
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
N8N_USER_FOLDER=/home/node/.n8n
GENERIC_TIMEZONE=America/New_York
N8N_METRICS=true
N8N_DIAGNOSTICS_ENABLED=true
ENVEOF
else
  echo "[EC2] Updating /opt/n8n/.env..."
  if ! sudo grep -q "^WEBHOOK_URL=" /opt/n8n/.env; then
    echo "WEBHOOK_URL=https://n8n.pbradygeorgen.com" | sudo tee -a /opt/n8n/.env >/dev/null
  else
    sudo sed -i 's|^WEBHOOK_URL=.*|WEBHOOK_URL=https://n8n.pbradygeorgen.com|' /opt/n8n/.env
  fi
fi

# Install docker-compose if not present
if ! command -v docker-compose &> /dev/null; then
  echo "[EC2] Installing docker-compose..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Create docker-compose.yml
echo "[EC2] Creating docker-compose.yml..."
sudo tee /opt/n8n/docker-compose.yml >/dev/null <<COMPOSEEOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    env_file:
      - /opt/n8n/.env
    environment:
      - WEBHOOK_URL=https://n8n.pbradygeorgen.com
      - N8N_PROTOCOL=https
      - N8N_HOST=n8n.pbradygeorgen.com
      - N8N_PORT=5678
      - N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
    volumes:
      - /home/ubuntu/.n8n:/home/node/.n8n
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
COMPOSEEOF

# Create restart script
echo "[EC2] Creating restart script..."
sudo tee /usr/local/bin/restart-n8n.sh >/dev/null <<RESTARTEOF
#!/bin/bash
set -e
N8N_DIR="/opt/n8n"
ENV_FILE="/opt/n8n/.env"

if [ ! -f "\$ENV_FILE" ]; then
  echo "❌ Error: \$ENV_FILE not found!"
  exit 1
fi

docker stop n8n 2>/dev/null || true
docker rm n8n 2>/dev/null || true
lsof -ti:5678 | xargs kill -9 2>/dev/null || true
sleep 2

if [ -f "\$N8N_DIR/docker-compose.yml" ]; then
  cd "\$N8N_DIR"
  docker-compose up -d
else
  docker run -d \\
    --name n8n \\
    --restart always \\
    -p 5678:5678 \\
    --env-file "\$ENV_FILE" \\
    -v /home/ubuntu/.n8n:/home/node/.n8n \\
    n8nio/n8n:latest
fi

sleep 10
echo "✅ n8n restarted with WEBHOOK_URL from \$ENV_FILE"
RESTARTEOF

sudo chmod +x /usr/local/bin/restart-n8n.sh

echo "[EC2] ✅ Configuration updated"
echo "[EC2] Restarting n8n with new configuration..."
sudo /usr/local/bin/restart-n8n.sh

echo "[EC2] ✅ Complete!"
EOF
)

# Execute remote script
ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "$REMOTE_SCRIPT"

echo ""
echo "✅ Configuration applied successfully!"
echo ""
echo "🔍 Verifying WEBHOOK_URL..."
sleep 10

# Verify
VERIFY_RESULT=$(ssh -i "$TEMP_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o ConnectTimeout=10 \
  "$SSH_USER@$PUBLIC_IP" \
  "sudo docker exec n8n env | grep WEBHOOK_URL" 2>/dev/null || echo "not found")

if echo "$VERIFY_RESULT" | grep -q "WEBHOOK_URL=https://"; then
  echo "✅ WEBHOOK_URL is set in container:"
  echo "   $VERIFY_RESULT"
else
  echo "⚠️  WEBHOOK_URL verification failed"
  echo "   Result: $VERIFY_RESULT"
fi

echo ""
echo "🎉 Complete! WEBHOOK_URL is now automated in infrastructure."

