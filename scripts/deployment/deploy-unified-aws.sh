#!/bin/bash
# 🖖 Unified AWS Deployment Script
# Deploys all services (n8n, MCP, Dashboard) to AWS EC2
# Uses credentials from ~/.zshrc and AWS CLI

set -e

echo "🖖 Unified Alex AI AWS Deployment"
echo "=================================="
echo ""

# Load credentials from ~/.zshrc
echo "🔐 Loading credentials from ~/.zshrc..."
export AWS_PROFILE="${AWS_PROFILE:-AmplifyUser}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-2}"

# Extract credentials
if [ -f ~/.zshrc ]; then
  export N8N_API_KEY="$(grep 'export N8N_API_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' | head -1)"
  export MCP_API_KEY="$(grep 'export MCP_API_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' | head -1)"
  export SUPABASE_URL="$(grep 'export SUPABASE_URL=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' | head -1)"
  export SUPABASE_ANON_KEY="$(grep 'export SUPABASE_ANON_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' | head -1)"
  export SUPABASE_SERVICE_ROLE_KEY="$(grep 'export SUPABASE_SERVICE_ROLE_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' | head -1)"
  export OPENROUTER_API_KEY="$(grep 'export OPENROUTER_API_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' | head -1)"
fi

# Configuration
PROJECT_NAME="alex-ai"  # Must match terraform/n8n-infrastructure variables.tf default
DOMAINS=("n8n.pbradygeorgen.com" "mcp.pbradygeorgen.com" "projects.pbradygeorgen.com")

echo "📊 Deployment Configuration:"
echo "   AWS Profile: ${AWS_PROFILE}"
echo "   AWS Region: ${AWS_DEFAULT_REGION}"
echo "   Domains: ${DOMAINS[*]}"
echo ""

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity --profile ${AWS_PROFILE} || {
    echo "❌ AWS credentials not found or invalid"
    exit 1
}
echo "✅ AWS credentials validated"
echo ""

# Get EC2 instance ID from Terraform output
echo "🔍 Finding EC2 instance..."
INSTANCE_ID=$(aws ec2 describe-instances \
    --profile ${AWS_PROFILE} \
    --filters "Name=tag:Name,Values=${PROJECT_NAME}-n8n-server" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text)

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" == "None" ]; then
    echo "❌ EC2 instance not found. Please deploy infrastructure first:"
    echo "   cd terraform/n8n-infrastructure && terraform apply"
    exit 1
fi

echo "✅ Found EC2 instance: ${INSTANCE_ID}"
echo ""

# Get instance public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --profile ${AWS_PROFILE} \
    --instance-ids ${INSTANCE_ID} \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "📡 Instance Public IP: ${PUBLIC_IP}"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
DEPLOY_DIR=$(mktemp -d)
trap "rm -rf ${DEPLOY_DIR}" EXIT

# Copy necessary files
cp docker-compose.unified.yml ${DEPLOY_DIR}/docker-compose.yml
cp -r mcp-server ${DEPLOY_DIR}/
cp -r projects/dashboard ${DEPLOY_DIR}/dashboard 2>/dev/null || cp -r dashboard ${DEPLOY_DIR}/dashboard 2>/dev/null || echo "⚠️  Dashboard directory not found, will need manual setup"

# Create .env files template
mkdir -p ${DEPLOY_DIR}/env
cat > ${DEPLOY_DIR}/env/n8n.env <<EOF
N8N_VERSION=1.120.4
N8N_DOMAIN=n8n.pbradygeorgen.com
N8N_API_KEY=${N8N_API_KEY}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
EOF

cat > ${DEPLOY_DIR}/env/mcp.env <<EOF
MCP_PORT=5679
MCP_API_KEY=${MCP_API_KEY:-${N8N_API_KEY}}
NODE_ENV=production
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
EOF

cat > ${DEPLOY_DIR}/env/dashboard.env <<EOF
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_MCP_URL=https://mcp.pbradygeorgen.com
NEXT_PUBLIC_N8N_URL=https://n8n.pbradygeorgen.com
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOF

# Create deployment script
cat > ${DEPLOY_DIR}/deploy.sh <<'DEPLOYSCRIPT'
#!/bin/bash
set -e

echo "🚀 Deploying unified services..."

# Create directories
sudo mkdir -p /opt/n8n /opt/mcp /opt/dashboard
sudo mkdir -p /home/ubuntu/.n8n /home/ubuntu/.mcp /home/ubuntu/.dashboard
sudo mkdir -p /home/ubuntu/alex-ai-universal

# Copy .env files
sudo cp env/n8n.env /opt/n8n/.env
sudo cp env/mcp.env /opt/mcp/.env
sudo cp env/dashboard.env /opt/dashboard/.env

# Copy application files
sudo cp -r mcp-server /home/ubuntu/alex-ai-universal/
if [ -d dashboard ]; then
    sudo cp -r dashboard /home/ubuntu/alex-ai-universal/projects/
fi

# Copy docker-compose
sudo cp docker-compose.yml /home/ubuntu/alex-ai-universal/

# Set permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/.n8n
sudo chown -R ubuntu:ubuntu /home/ubuntu/.mcp
sudo chown -R ubuntu:ubuntu /home/ubuntu/.dashboard
sudo chown -R ubuntu:ubuntu /home/ubuntu/alex-ai-universal

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Stop existing containers
cd /home/ubuntu/alex-ai-universal
if [ -f docker-compose.yml ]; then
    sudo docker-compose down || true
fi

# Start services
echo "🚀 Starting unified services..."
sudo docker-compose up -d --build

echo "✅ Deployment complete!"
echo ""
echo "Services:"
echo "  - n8n: https://n8n.pbradygeorgen.com"
echo "  - MCP: https://mcp.pbradygeorgen.com"
echo "  - Dashboard: https://projects.pbradygeorgen.com"
DEPLOYSCRIPT

chmod +x ${DEPLOY_DIR}/deploy.sh

# Create tarball
cd ${DEPLOY_DIR}
tar -czf deployment.tar.gz *
cd - > /dev/null

echo "✅ Deployment package created"
echo ""

# Upload to EC2 via SSM
echo "📤 Uploading deployment package to EC2..."
aws ssm send-command \
    --profile ${AWS_PROFILE} \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[
        'cd /tmp',
        'rm -rf deployment*',
        'echo \"Waiting for upload...\"'
    ]" \
    --output text > /dev/null

# Wait a moment
sleep 2

# Copy files via SCP (if SSH key available) or use SSM
echo "📤 Transferring files..."
# Try SCP first, fallback to SSM
if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/id_ed25519 ]; then
    scp -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no ${DEPLOY_DIR}/deployment.tar.gz ubuntu@${PUBLIC_IP}:/tmp/ 2>/dev/null || \
    scp -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no ${DEPLOY_DIR}/deployment.tar.gz ubuntu@${PUBLIC_IP}:/tmp/ 2>/dev/null || {
        echo "⚠️  SCP failed, using SSM..."
        # Use SSM to transfer (requires AWS Systems Manager)
        aws ssm send-command \
            --profile ${AWS_PROFILE} \
            --instance-ids ${INSTANCE_ID} \
            --document-name "AWS-RunShellScript" \
            --parameters "commands=[
                'cd /tmp && base64 -d <<\"EOF\" | tar -xzf -',
                \"$(base64 < ${DEPLOY_DIR}/deployment.tar.gz)\",
                'EOF'
            ]" \
            --output text > /dev/null
    }
else
    echo "⚠️  No SSH key found, using SSM..."
    # Use SSM to transfer
    aws ssm send-command \
        --profile ${AWS_PROFILE} \
        --instance-ids ${INSTANCE_ID} \
        --document-name "AWS-RunShellScript" \
        --parameters "commands=[
            'cd /tmp && base64 -d <<\"EOF\" | tar -xzf -',
            \"$(base64 < ${DEPLOY_DIR}/deployment.tar.gz)\",
            'EOF'
        ]" \
        --output text > /dev/null
fi

echo "✅ Files transferred"
echo ""

# Execute deployment
echo "🚀 Executing deployment on EC2..."
aws ssm send-command \
    --profile ${AWS_PROFILE} \
    --instance-ids ${INSTANCE_ID} \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[
        'cd /tmp',
        'tar -xzf deployment.tar.gz',
        'sudo bash deploy.sh'
    ]" \
    --output text

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Services will be available at:"
echo "   - n8n: https://n8n.pbradygeorgen.com"
echo "   - MCP: https://mcp.pbradygeorgen.com"
echo "   - Dashboard: https://projects.pbradygeorgen.com"
echo ""
echo "🔍 Check deployment status:"
echo "   aws ssm list-command-invocations --instance-id ${INSTANCE_ID} --profile ${AWS_PROFILE}"

