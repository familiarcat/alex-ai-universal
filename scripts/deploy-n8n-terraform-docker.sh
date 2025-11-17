#!/bin/bash
# Deploy N8N Infrastructure with Terraform + Docker
# 
# Uses:
# - Terraform for infrastructure provisioning
# - Docker for N8N deployment
# - AWS CLI with credentials from ~/.zshrc
# - Secrets workflow integration
#
# Commander Data's recommendation: Infrastructure as Code with Docker
# Geordi's recommendation: Use existing Terraform + Docker setup

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="$WORKSPACE_ROOT/terraform/n8n-infrastructure"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 N8N Infrastructure Deployment${NC}"
echo -e "${CYAN}   Terraform + Docker + AWS CLI (from ~/.zshrc)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Load credentials from ~/.zshrc
echo -e "${YELLOW}🔐 Loading credentials from ~/.zshrc...${NC}"
source ~/.zshrc 2>/dev/null || true

# Verify AWS credentials
if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    echo -e "${RED}❌ AWS credentials not found in environment${NC}"
    echo "   Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are in ~/.zshrc"
    exit 1
fi

if [ -z "${AWS_REGION:-}" ]; then
    AWS_REGION="us-east-2"
    echo -e "${YELLOW}⚠️  AWS_REGION not set, defaulting to: $AWS_REGION${NC}"
fi

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_REGION

echo -e "${GREEN}✅ AWS credentials loaded${NC}"
echo "   Region: $AWS_REGION"
echo ""

# Verify Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform not found. Please install Terraform.${NC}"
    echo "   Visit: https://www.terraform.io/downloads"
    exit 1
fi

# Verify AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI.${NC}"
    echo "   Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Verify Docker is installed (for local testing)
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found locally (optional for local testing)${NC}"
fi

echo -e "${GREEN}✅ Prerequisites verified${NC}"
echo ""

# Check if terraform.tfvars exists
if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
    echo -e "${YELLOW}⚠️  terraform.tfvars not found${NC}"
    echo "   Creating from backup template..."
    
    # Use backup terraform.tfvars if available
    if [ -f "$WORKSPACE_ROOT/.backup-ec2-emergency/infrastructure/terraform.tfvars" ]; then
        cp "$WORKSPACE_ROOT/.backup-ec2-emergency/infrastructure/terraform.tfvars" "$TERRAFORM_DIR/terraform.tfvars"
        echo -e "${GREEN}✅ Created terraform.tfvars from backup${NC}"
    else
        echo -e "${RED}❌ No terraform.tfvars template found${NC}"
        echo "   Please create terraform.tfvars in $TERRAFORM_DIR"
        exit 1
    fi
fi

# Navigate to Terraform directory
cd "$TERRAFORM_DIR"

echo -e "${BLUE}📋 Terraform Configuration:${NC}"
echo "   Directory: $TERRAFORM_DIR"
echo "   Region: $AWS_REGION"
echo ""

# Initialize Terraform
echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
terraform init -upgrade

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Terraform initialization failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Terraform initialized${NC}"
echo ""

# Plan deployment
echo -e "${YELLOW}📊 Planning Terraform deployment...${NC}"
terraform plan -out=tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Terraform plan failed${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  Review the plan above${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "Apply Terraform changes? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}⚠️  Deployment cancelled${NC}"
    exit 0
fi

# Apply Terraform
echo -e "${YELLOW}🚀 Applying Terraform changes...${NC}"
terraform apply tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Terraform apply failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Terraform deployment complete${NC}"
echo ""

# Get instance details
echo -e "${BLUE}📊 Retrieving instance information...${NC}"
INSTANCE_ID=$(terraform output -raw instance_id 2>/dev/null || echo "")
EIP=$(terraform output -raw elastic_ip 2>/dev/null || echo "")

if [ -z "$INSTANCE_ID" ]; then
    echo -e "${YELLOW}⚠️  Could not retrieve instance ID from Terraform output${NC}"
    echo "   Querying AWS directly..."
    INSTANCE_ID=$(aws ec2 describe-instances \
        --region "$AWS_REGION" \
        --filters "Name=tag:Name,Values=alex-ai-n8n-server" "Name=instance-state-name,Values=running,stopped" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text 2>/dev/null || echo "")
fi

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
    echo -e "${RED}❌ Could not find N8N instance${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Instance found: $INSTANCE_ID${NC}"
echo ""

# Check instance state
INSTANCE_STATE=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].State.Name' \
    --output text)

echo -e "${BLUE}📊 Instance Status:${NC}"
echo "   Instance ID: $INSTANCE_ID"
echo "   State: $INSTANCE_STATE"
echo ""

if [ "$INSTANCE_STATE" = "stopped" ]; then
    echo -e "${YELLOW}⚠️  Instance is stopped. Starting instance...${NC}"
    aws ec2 start-instances --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"
    
    echo "   Waiting for instance to start..."
    aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"
    
    echo -e "${GREEN}✅ Instance started${NC}"
    echo ""
    
    # Wait for SSM agent to be ready
    echo "   Waiting for SSM agent to be ready..."
    sleep 30
fi

# Verify N8N is running via SSM
echo -e "${BLUE}🔍 Checking N8N Docker container status...${NC}"
N8N_STATUS=$(aws ssm send-command \
    --region "$AWS_REGION" \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[\"docker ps --filter name=n8n --format '{{.Status}}'\"]" \
    --output text \
    --query 'Command.CommandId' 2>/dev/null || echo "")

if [ -n "$N8N_STATUS" ]; then
    echo "   Command ID: $N8N_STATUS"
    sleep 5
    
    COMMAND_OUTPUT=$(aws ssm get-command-invocation \
        --region "$AWS_REGION" \
        --command-id "$N8N_STATUS" \
        --instance-id "$INSTANCE_ID" \
        --query 'StandardOutputContent' \
        --output text 2>/dev/null || echo "")
    
    if echo "$COMMAND_OUTPUT" | grep -q "Up"; then
        echo -e "${GREEN}✅ N8N container is running${NC}"
    else
        echo -e "${YELLOW}⚠️  N8N container status: $COMMAND_OUTPUT${NC}"
        echo "   Container may still be starting..."
    fi
else
    echo -e "${YELLOW}⚠️  Could not check N8N status via SSM${NC}"
fi

echo ""

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# Get domain from terraform.tfvars
N8N_DOMAIN=$(grep -E "^n8n_domain\s*=" terraform.tfvars | cut -d'"' -f2 || echo "n8n.pbradygeorgen.com")

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Infrastructure Details:${NC}"
echo "   Instance ID: $INSTANCE_ID"
echo "   Public IP: $PUBLIC_IP"
echo "   Domain: $N8N_DOMAIN"
echo "   Region: $AWS_REGION"
echo ""
echo -e "${BLUE}🌐 Access N8N:${NC}"
echo "   URL: https://$N8N_DOMAIN"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "   1. Wait 2-3 minutes for N8N to fully start"
echo "   2. Verify N8N is accessible: curl -I https://$N8N_DOMAIN"
echo "   3. Check health: node $WORKSPACE_ROOT/scripts/check-n8n-health.js"
echo "   4. Set up SSL certificate (if not done):"
echo "      aws ssm send-command --instance-ids $INSTANCE_ID \\"
echo "        --document-name 'AWS-RunShellScript' \\"
echo "        --parameters 'commands=[\"sudo certbot --nginx -d $N8N_DOMAIN --non-interactive --agree-tos --email your-email@example.com\"]'"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "   Restart N8N: $WORKSPACE_ROOT/scripts/restart-n8n-server.sh"
echo "   Check Health: $WORKSPACE_ROOT/scripts/check-n8n-health.js"
echo "   View Logs: aws ssm send-command --instance-ids $INSTANCE_ID \\"
echo "              --document-name 'AWS-RunShellScript' \\"
echo "              --parameters 'commands=[\"docker logs n8n --tail 50\"]'"
echo ""
echo -e "${GREEN}✅ All done!${NC}"

