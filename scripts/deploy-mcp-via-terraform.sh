#!/bin/bash

################################################################################
#
# Deploy MCP Server via Terraform and Docker
# 
# Complete deployment using Terraform infrastructure and Docker Compose
# Integrates with existing credentials and CLI/API systems
#
################################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖖 Deploy MCP Server via Terraform and Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load credentials (extract only export statements)
if [ -f ~/.zshrc ]; then
    export $(grep -E '^export [A-Z_]+=' ~/.zshrc | sed 's/export //' | xargs) 2>/dev/null || true
fi

# Configuration
MCP_DOMAIN="mcp.pbradygeorgen.com"
N8N_DOMAIN="${N8N_DOMAIN:-n8n.pbradygeorgen.com}"
EC2_HOST="${EC2_HOST:-n8n.pbradygeorgen.com}"
EC2_USER="${EC2_USER:-ubuntu}"
# Get Route53 Zone ID from various sources
ROUTE53_ZONE_ID="${AWS_ROUTE53_ZONE_ID}"

if [ -z "$ROUTE53_ZONE_ID" ]; then
    # Try to get from terraform.tfvars
    if [ -f "terraform/n8n-infrastructure/terraform.tfvars" ]; then
        ROUTE53_ZONE_ID=$(grep -E '^route53_zone_id\s*=' terraform/n8n-infrastructure/terraform.tfvars | sed 's/.*= *"\(.*\)".*/\1/' | tr -d ' ' | head -1)
    fi
fi

# Check required variables
REQUIRED_VARS=("AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "N8N_API_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   • %s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "💡 Set these in ~/.zshrc and run: source ~/.zshrc"
    exit 1
fi

if [ -z "$ROUTE53_ZONE_ID" ]; then
    echo "⚠️  Route53 Zone ID not found. Will attempt to get from Terraform state..."
    echo "   If DNS configuration fails, set AWS_ROUTE53_ZONE_ID in ~/.zshrc"
    echo ""
fi

echo "📋 Configuration:"
echo "   MCP Domain: $MCP_DOMAIN"
echo "   N8N Domain: $N8N_DOMAIN"
echo "   EC2 Host: $EC2_HOST"
echo "   Route53 Zone: $ROUTE53_ZONE_ID"
echo ""

# Step 1: Get EC2 instance IP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Getting EC2 Instance Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try multiple methods to get EC2 IP
EC2_IP=""

# Method 1: AWS CLI with tag filter
if [ -z "$EC2_IP" ]; then
    EC2_IP=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=alex-ai-n8n-server" "Name=instance-state-name,Values=running" \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text 2>/dev/null || echo "")
fi

# Method 2: Get from n8n domain DNS
if [ -z "$EC2_IP" ] || [ "$EC2_IP" == "None" ]; then
    echo "⚠️  Could not get EC2 IP from tags, trying DNS lookup..."
    EC2_IP=$(host $N8N_DOMAIN 2>/dev/null | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | head -1 || echo "")
fi

# Method 3: Get from Route53
if [ -z "$EC2_IP" ] && [ -n "$ROUTE53_ZONE_ID" ]; then
    echo "⚠️  Could not get EC2 IP from DNS, trying Route53..."
    EC2_IP=$(aws route53 list-resource-record-sets \
        --hosted-zone-id "$ROUTE53_ZONE_ID" \
        --query "ResourceRecordSets[?Name=='${N8N_DOMAIN}.'].[ResourceRecords[0].Value]" \
        --output text 2>/dev/null || echo "")
fi

# Method 4: Use EC2_HOST directly if it's an IP
if [ -z "$EC2_IP" ]; then
    if echo "$EC2_HOST" | grep -qE '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'; then
        EC2_IP="$EC2_HOST"
    fi
fi

if [ -z "$EC2_IP" ] || [ "$EC2_IP" == "None" ]; then
    echo "❌ Could not determine EC2 IP address"
    echo "   Please set EC2_IP environment variable or ensure AWS CLI is configured"
    echo "   Example: export EC2_IP=1.2.3.4"
    exit 1
fi

echo "✅ EC2 IP: $EC2_IP"
echo ""

# Step 2: Configure Route53 DNS for MCP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Configuring Route53 DNS for MCP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$ROUTE53_ZONE_ID" ]; then
    echo "⚠️  Route53 Zone ID not available, skipping DNS configuration"
    echo "   DNS will need to be configured manually or via Terraform"
    echo ""
else
    # Check if record exists
    EXISTING_RECORD=$(aws route53 list-resource-record-sets \
        --hosted-zone-id "$ROUTE53_ZONE_ID" \
        --query "ResourceRecordSets[?Name=='${MCP_DOMAIN}.']" \
        --output json 2>/dev/null || echo "[]")

    if echo "$EXISTING_RECORD" | grep -q "${MCP_DOMAIN}"; then
        echo "⚠️  DNS record already exists, updating..."
        
        aws route53 change-resource-record-sets \
            --hosted-zone-id "$ROUTE53_ZONE_ID" \
            --change-batch "{
                \"Changes\": [{
                    \"Action\": \"UPSERT\",
                    \"ResourceRecordSet\": {
                        \"Name\": \"${MCP_DOMAIN}\",
                        \"Type\": \"A\",
                        \"TTL\": 300,
                        \"ResourceRecords\": [{\"Value\": \"${EC2_IP}\"}]
                    }
                }]
            }" > /dev/null
        
        echo "✅ DNS record updated"
    else
        echo "📝 Creating new DNS record..."
        
        aws route53 change-resource-record-sets \
            --hosted-zone-id "$ROUTE53_ZONE_ID" \
            --change-batch "{
                \"Changes\": [{
                    \"Action\": \"CREATE\",
                    \"ResourceRecordSet\": {
                        \"Name\": \"${MCP_DOMAIN}\",
                        \"Type\": \"A\",
                        \"TTL\": 300,
                        \"ResourceRecords\": [{\"Value\": \"${EC2_IP}\"}]
                    }
                }]
            }" > /dev/null
        
        echo "✅ DNS record created"
    fi

    echo "   Waiting for DNS propagation (30 seconds)..."
    sleep 30
    echo ""
fi

# Step 3: Deploy MCP Server Code to EC2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Deploying MCP Server Code to EC2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
TMP_DIR=$(mktemp -d)
DEPLOY_PACKAGE="$TMP_DIR/mcp-server-deploy.tar.gz"

tar -czf "$DEPLOY_PACKAGE" \
    mcp-server/ \
    scripts/utils/mcp-*.js \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' 2>/dev/null || {
    echo "⚠️  Some files may be missing, continuing..."
}

echo "✅ Deployment package created"
echo ""

# Deploy via SSH
echo "📤 Deploying to EC2..."
scp -o StrictHostKeyChecking=no "$DEPLOY_PACKAGE" ${EC2_USER}@${EC2_HOST}:/tmp/mcp-server-deploy.tar.gz

# Cleanup temp file
rm -rf "$TMP_DIR"

# Extract and setup on EC2
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} <<SSH_SCRIPT
set -e

echo "📦 Extracting MCP server code..."
cd /home/ubuntu
mkdir -p mcp-server
tar -xzf /tmp/mcp-server-deploy.tar.gz -C /home/ubuntu/

# Install dependencies
echo "📦 Installing dependencies..."
cd mcp-server
npm install --production

# Set permissions
chown -R ubuntu:ubuntu /home/ubuntu/mcp-server
chown -R ubuntu:ubuntu /home/ubuntu/.mcp

echo "✅ MCP server code deployed"
SSH_SCRIPT

echo "✅ MCP server code deployed to EC2"
echo ""

# Step 4: Update Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Updating Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} <<SSH_SCRIPT
set -e

# Update MCP environment file with actual credentials
sudo tee /opt/mcp/.env > /dev/null <<ENV_EOF
MCP_PORT=5679
MCP_API_KEY=${N8N_API_KEY}
NODE_ENV=production
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
ENV_EOF

echo "✅ Environment variables updated"
SSH_SCRIPT

echo "✅ Environment variables configured"
echo ""

# Step 5: Configure Nginx and SSL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Configuring Nginx and SSL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} <<SSH_SCRIPT
set -e

# Create nginx config for MCP (if not already created by user-data)
sudo tee /etc/nginx/sites-available/mcp > /dev/null <<NGINX_EOF
server {
    listen 80;
    server_name ${MCP_DOMAIN};
    return 301 https://\\\$server_name\\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${MCP_DOMAIN};

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/${MCP_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${MCP_DOMAIN}/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to MCP server
    location / {
        proxy_pass http://localhost:5679;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINX_EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/mcp

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Get SSL certificate
echo "🔐 Obtaining SSL certificate..."
sudo certbot --nginx -d ${MCP_DOMAIN} --non-interactive --agree-tos --email admin@pbradygeorgen.com --redirect || {
    echo "⚠️  SSL certificate may already exist or certbot failed"
}

# Reload nginx after SSL
sudo systemctl reload nginx

echo "✅ Nginx configured for MCP"
SSH_SCRIPT

echo "✅ Nginx and SSL configured"
echo ""

# Step 6: Build and Start Docker Containers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Building and Starting Docker Containers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} <<SSH_SCRIPT
set -e

cd /opt

# Update docker-compose.yml to include MCP
sudo tee docker-compose.yml > /dev/null <<COMPOSE_EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:1.120.4
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    env_file:
      - /opt/n8n/.env
    environment:
      - WEBHOOK_URL=https://${N8N_DOMAIN}
    volumes:
      - /home/ubuntu/.n8n:/home/node/.n8n
    networks:
      - alex-ai-network

  mcp-server:
    build:
      context: /home/ubuntu/mcp-server
      dockerfile: Dockerfile
    container_name: mcp-server
    restart: always
    ports:
      - "5679:5679"
    env_file:
      - /opt/mcp/.env
    environment:
      - MCP_PORT=5679
      - MCP_API_KEY=${N8N_API_KEY}
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    volumes:
      - /home/ubuntu/.mcp:/app/data
      - /home/ubuntu/mcp-server:/app/mcp-server
    networks:
      - alex-ai-network
    depends_on:
      - n8n

networks:
  alex-ai-network:
    driver: bridge
COMPOSE_EOF

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.yml down || true
docker rm -f n8n mcp-server 2>/dev/null || true

# Build and start
echo "🔨 Building MCP server container..."
docker-compose -f docker-compose.yml build mcp-server

echo "🚀 Starting containers..."
docker-compose -f docker-compose.yml up -d

# Wait for containers to be healthy
echo "⏳ Waiting for containers to start..."
sleep 15

# Check container status
echo "📊 Container status:"
docker ps | grep -E "n8n|mcp-server" || echo "⚠️  Containers may not be running"

echo "✅ Docker containers started"
SSH_SCRIPT

echo "✅ Docker containers built and started"
echo ""

# Step 7: Verify Deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Verifying Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testing health endpoint..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://${MCP_DOMAIN}/healthz" --max-time 10 || echo "000")

if [ "$HEALTH_CHECK" == "200" ]; then
    echo "✅ Health check passed (HTTP $HEALTH_CHECK)"
else
    echo "⚠️  Health check returned HTTP $HEALTH_CHECK"
    echo "   This may be normal if DNS hasn't fully propagated yet"
fi

echo ""
echo "🔍 Testing API status endpoint..."
API_STATUS=$(curl -s -H "X-MCP-API-KEY: ${N8N_API_KEY}" \
    "https://${MCP_DOMAIN}/api/status" \
    --max-time 10 2>/dev/null || echo "{}")

if echo "$API_STATUS" | grep -q "operational"; then
    echo "✅ API status check passed"
    echo "$API_STATUS" | jq '.' 2>/dev/null || echo "$API_STATUS"
else
    echo "⚠️  API status check failed or DNS not propagated"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MCP Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 MCP Server URL: https://${MCP_DOMAIN}"
echo "📡 API Endpoint: https://${MCP_DOMAIN}/api"
echo "🔐 API Key: Use N8N_API_KEY from ~/.zshrc"
echo ""
echo "📋 Services Running:"
echo "   • n8n: https://${N8N_DOMAIN} (port 5678)"
echo "   • MCP: https://${MCP_DOMAIN} (port 5679)"
echo ""
echo "🔄 Next Steps:"
echo "   1. Wait for DNS propagation (may take a few minutes)"
echo "   2. Test API: curl -H 'X-MCP-API-KEY: YOUR_KEY' https://${MCP_DOMAIN}/api/status"
echo "   3. Verify all services are operational"
echo ""

