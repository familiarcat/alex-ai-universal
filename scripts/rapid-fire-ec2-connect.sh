#!/bin/bash

##############################################################################
# RAPID-FIRE EC2 INSTANCE CONNECT
#
# Chief O'Brien's rapid execution strategy:
# 1. Inject temporary SSH key via AWS API
# 2. IMMEDIATELY connect and execute commands (within 60-second window)
# 3. No waiting, no delays - strike while the iron is hot!
##############################################################################

set -e

# Load credentials
export AWS_ACCESS_KEY_ID=$(grep 'export AWS_ACCESS_KEY_ID=' ~/.zshrc | cut -d'=' -f2)
export AWS_SECRET_ACCESS_KEY=$(grep 'export AWS_SECRET_ACCESS_KEY=' ~/.zshrc | cut -d'=' -f2)
export AWS_REGION=us-east-2
INSTANCE_ID=i-0afdf313f61f22df0

echo "👷 CHIEF O'BRIEN: Rapid-fire EC2 access attempt!"
echo ""

# Generate temporary SSH key if not exists
if [ ! -f ~/.ssh/ec2-instance-connect-temp ]; then
  echo "🔑 Generating temporary SSH key..."
  ssh-keygen -t rsa -f ~/.ssh/ec2-instance-connect-temp -N "" -C "ec2-instance-connect-temp"
fi

echo "📤 Injecting temporary SSH public key (60-second window)..."
aws ec2-instance-connect send-ssh-public-key \
  --instance-id $INSTANCE_ID \
  --availability-zone us-east-2b \
  --instance-os-user ubuntu \
  --ssh-public-key file://$HOME/.ssh/ec2-instance-connect-temp.pub

echo "✅ Key injected!"
echo ""

# Get current public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "🚀 Connecting IMMEDIATELY to $PUBLIC_IP (60-second window)..."
echo ""

# Connect and execute commands in one shot (within 60-second window)
ssh -i ~/.ssh/ec2-instance-connect-temp \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o ConnectTimeout=10 \
  ubuntu@$PUBLIC_IP \
  'sudo sed -i "/^WEBHOOK_URL=/d" /opt/n8n/.env && echo "WEBHOOK_URL=https://n8n.pbradygeorgen.com" | sudo tee -a /opt/n8n/.env && echo "" && echo "Updated /opt/n8n/.env:" && sudo cat /opt/n8n/.env && echo "" && sudo systemctl restart n8n && echo "✅ n8n restarting..." && sleep 10 && echo "✅ Configuration complete!"'

if [ $? -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 SUCCESS! Commands executed on EC2!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo ""
  echo "❌ Connection failed within 60-second window"
  echo "   The temporary key expired or connection was refused"
  exit 1
fi

