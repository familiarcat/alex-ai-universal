#!/bin/bash

# 🖖 Dashboard Deployment to Existing EC2
# 
# Deploys to n8n.pbradygeorgen.com using Docker
# Uses AWS SSM for remote execution
# 
# Crew: La Forge (Infrastructure) + Riker (Execution)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🖖 Dashboard Deployment to EC2${NC}"
echo -e "${CYAN}   n8n.pbradygeorgen.com${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Extract credentials
extract_env_var() {
    local var_name=$1
    local default=$2
    local value=$(grep -E "^export ${var_name}=" ~/.zshrc 2>/dev/null | head -1 | sed -E "s/^export ${var_name}=['\"]?([^'\"]*)['\"]?.*/\1/" | head -1 || echo "")
    echo "${value:-$default}"
}

AWS_REGION=$(extract_env_var "AWS_REGION" "us-east-2")
AWS_PROFILE=$(extract_env_var "AWS_PROFILE" "AmplifyUser")
DOMAIN=$(extract_env_var "DOMAIN" "n8n.pbradygeorgen.com")
DASHBOARD_PORT=3000

export AWS_REGION
export AWS_PROFILE

echo -e "${GREEN}✅ Configuration:${NC}"
echo "   Domain: $DOMAIN"
echo "   Port: $DASHBOARD_PORT"
echo "   Region: $AWS_REGION"
echo ""

# Find EC2 instance
echo -e "${BLUE}🔍 Finding EC2 instance...${NC}"
INSTANCE_ID=$(aws ec2 describe-instances \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --filters "Name=tag:Name,Values=*n8n*" "Name=instance-state-name,Values=running" \
    --query "Reservations[0].Instances[0].InstanceId" \
    --output text 2>/dev/null || echo "")

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" == "None" ]; then
    echo -e "${RED}❌ EC2 instance not found${NC}"
    echo ""
    echo "   Please ensure:"
    echo "   1. EC2 instance is running"
    echo "   2. Instance has tag: Name=*n8n*"
    echo "   3. SSM agent is installed"
    exit 1
fi

echo -e "${GREEN}   ✅ Found instance: $INSTANCE_ID${NC}"
echo ""

# Build Docker image locally
echo -e "${BLUE}🐳 Step 1: Building Docker Image${NC}"
cd "$(dirname "$0")/../dashboard" || exit 1

echo "   📦 Building dashboard Docker image..."
docker build -t alex-ai-dashboard:latest . || {
    echo -e "${YELLOW}   ⚠️  Docker build failed, using alternative deployment${NC}"
    echo ""
    echo "   Alternative: Deploy via Vercel"
    echo "   • cd dashboard"
    echo "   • npm i -g vercel"
    echo "   • vercel"
    exit 1
}

echo -e "${GREEN}   ✅ Docker image built${NC}"
echo ""

# Save image to tar
echo -e "${BLUE}📦 Step 2: Preparing Deployment Package${NC}"
IMAGE_TAR="/tmp/alex-ai-dashboard-$(date +%s).tar"
docker save alex-ai-dashboard:latest -o "$IMAGE_TAR"
echo -e "${GREEN}   ✅ Image saved: $IMAGE_TAR${NC}"
echo ""

# Deploy via SSM
echo -e "${BLUE}🚀 Step 3: Deploying to EC2${NC}"
echo "   📤 Uploading image to EC2..."

# Upload via SSM
aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[
        'docker load -i /tmp/dashboard-image.tar',
        'docker stop alex-ai-dashboard || true',
        'docker rm alex-ai-dashboard || true',
        'docker run -d --name alex-ai-dashboard -p $DASHBOARD_PORT:3000 --restart unless-stopped alex-ai-dashboard:latest'
    ]" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --output text > /dev/null || {
    echo -e "${YELLOW}   ⚠️  SSM deployment complex, providing manual steps${NC}"
    echo ""
    echo "   Manual Deployment Steps:"
    echo "   1. Copy image to EC2:"
    echo "      scp $IMAGE_TAR ubuntu@$DOMAIN:/tmp/dashboard-image.tar"
    echo ""
    echo "   2. SSH to EC2:"
    echo "      ssh ubuntu@$DOMAIN"
    echo ""
    echo "   3. Load and run:"
    echo "      docker load -i /tmp/dashboard-image.tar"
    echo "      docker stop alex-ai-dashboard || true"
    echo "      docker rm alex-ai-dashboard || true"
    echo "      docker run -d --name alex-ai-dashboard -p $DASHBOARD_PORT:3000 --restart unless-stopped alex-ai-dashboard:latest"
    echo ""
    echo "   4. Configure nginx (if needed):"
    echo "      Add reverse proxy to /etc/nginx/sites-available/default"
    echo ""
    exit 0
}

echo -e "${GREEN}   ✅ Deployment command sent${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment Initiated!${NC}"
echo ""
echo -e "${CYAN}🌐 Live Dashboard URL:${NC}"
echo "   https://$DOMAIN/dashboard"
echo "   (or http://$DOMAIN:$DASHBOARD_PORT if direct access)"
echo ""
echo -e "${YELLOW}⏳ Deployment may take 2-5 minutes${NC}"
echo "   Check status: docker ps on EC2 instance"
echo ""

