#!/bin/bash

################################################################################
#
# Automated MCP Deployment to mcp.pbradygeorgen.com
# 
# This script automates the complete deployment of MCP server to EC2:
# 1. DNS configuration (Route53)
# 2. Nginx configuration
# 3. SSL certificate (Let's Encrypt)
# 4. Docker Compose update
# 5. MCP server deployment
#
################################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖖 Automated MCP Deployment to mcp.pbradygeorgen.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load credentials (extract only export statements)
if [ -f ~/.zshrc ]; then
    export $(grep -E '^export [A-Z_]+=' ~/.zshrc | sed 's/export //' | xargs) 2>/dev/null || true
fi

# Configuration
MCP_DOMAIN="${MCP_DOMAIN:-mcp.pbradygeorgen.com}"
MCP_PORT="${MCP_PORT:-5679}"
EC2_HOST="${EC2_HOST:-n8n.pbradygeorgen.com}"
EC2_USER="${EC2_USER:-ubuntu}"
ROUTE53_ZONE_ID="${ROUTE53_ZONE_ID:-${AWS_ROUTE53_ZONE_ID}}"

# Check required variables
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in ~/.zshrc"
    exit 1
fi

if [ -z "$ROUTE53_ZONE_ID" ]; then
    echo "❌ Route53 Zone ID not found. Set AWS_ROUTE53_ZONE_ID in ~/.zshrc"
    exit 1
fi

echo "📋 Configuration:"
echo "   Domain: $MCP_DOMAIN"
echo "   Port: $MCP_PORT"
echo "   EC2 Host: $EC2_HOST"
echo "   EC2 User: $EC2_USER"
echo ""

# Step 1: Get EC2 instance IP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Getting EC2 Instance IP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EC2_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=alex-ai-n8n-server" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text 2>/dev/null || echo "")

if [ -z "$EC2_IP" ] || [ "$EC2_IP" == "None" ]; then
    echo "⚠️  Could not get EC2 IP from tags, trying Elastic IP..."
    EC2_IP=$(dig +short $EC2_HOST | head -1)
fi

if [ -z "$EC2_IP" ]; then
    echo "❌ Could not determine EC2 IP address"
    exit 1
fi

echo "✅ EC2 IP: $EC2_IP"
echo ""

# Step 2: Configure Route53 DNS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Configuring Route53 DNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if record exists
EXISTING_RECORD=$(aws route53 list-resource-record-sets \
    --hosted-zone-id "$ROUTE53_ZONE_ID" \
    --query "ResourceRecordSets[?Name=='${MCP_DOMAIN}.']" \
    --output json 2>/dev/null || echo "[]")

if [ "$EXISTING_RECORD" != "[]" ]; then
    echo "⚠️  DNS record already exists, updating..."
    
    # Update existing record
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
    
    # Create new record
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

# Step 3: Deploy nginx configuration and SSL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Deploying Nginx Configuration and SSL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create nginx config
NGINX_CONFIG=$(cat <<EOF
server {
    listen 80;
    server_name ${MCP_DOMAIN};
    return 301 https://\$server_name\$request_uri;
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
        proxy_pass http://localhost:${MCP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Increase timeouts for long-running workflows
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF
)

# Deploy via SSH
echo "📤 Deploying nginx configuration..."
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} <<SSH_SCRIPT
set -e

# Create nginx config
sudo tee /etc/nginx/sites-available/mcp > /dev/null <<'NGINX_EOF'
${NGINX_CONFIG}
NGINX_EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/mcp

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d ${MCP_DOMAIN} --non-interactive --agree-tos --email admin@pbradygeorgen.com || true

# Reload nginx again after SSL
sudo systemctl reload nginx

echo "✅ Nginx configured for ${MCP_DOMAIN}"
SSH_SCRIPT

echo "✅ Nginx configuration deployed"
echo ""

# Step 4: Deploy Docker Compose configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Deploying Docker Compose Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create docker-compose config with MCP
DOCKER_COMPOSE=$(cat <<'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:${N8N_VERSION:-latest}
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    env_file:
      - /opt/n8n/.env
    environment:
      - WEBHOOK_URL=https://${N8N_DOMAIN:-n8n.pbradygeorgen.com}
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
    volumes:
      - /home/ubuntu/.mcp:/app/data
    networks:
      - alex-ai-network

networks:
  alex-ai-network:
    driver: bridge
EOF
)

# Deploy via SSH
echo "📤 Deploying Docker Compose configuration..."
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} <<SSH_SCRIPT
set -e

# Create MCP environment file
sudo mkdir -p /opt/mcp
sudo tee /opt/mcp/.env > /dev/null <<ENV_EOF
MCP_PORT=5679
MCP_API_KEY=\${N8N_API_KEY}
NODE_ENV=production
ENV_EOF

# Create docker-compose with MCP
sudo tee /opt/docker-compose.yml > /dev/null <<'COMPOSE_EOF'
${DOCKER_COMPOSE}
COMPOSE_EOF

echo "✅ Docker Compose configuration created"
SSH_SCRIPT

echo "✅ Docker Compose configuration deployed"
echo ""

# Step 5: Build and deploy MCP server
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Building and Deploying MCP Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf /tmp/mcp-server-deploy.tar.gz \
    mcp-server/ \
    scripts/utils/mcp-*.js \
    --exclude='node_modules' \
    --exclude='.git' 2>/dev/null || true

# Deploy via SSH
echo "📤 Deploying MCP server code..."
scp -o StrictHostKeyChecking=no /tmp/mcp-server-deploy.tar.gz ${EC2_USER}@${EC2_HOST}:/tmp/

ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} <<SSH_SCRIPT
set -e

# Extract deployment package
cd /home/ubuntu
mkdir -p mcp-server
tar -xzf /tmp/mcp-server-deploy.tar.gz -C /home/ubuntu/

# Install dependencies
cd mcp-server
npm install --production

# Build and start Docker container
cd /opt
sudo docker-compose -f docker-compose.yml up -d --build mcp-server

# Wait for container to be healthy
sleep 10

# Check container status
sudo docker ps | grep mcp-server || echo "⚠️  Container may not be running"

echo "✅ MCP server deployed"
SSH_SCRIPT

echo "✅ MCP server deployment complete"
echo ""

# Step 6: Verify deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Verifying Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testing health endpoint..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://${MCP_DOMAIN}/healthz" || echo "000")

if [ "$HEALTH_CHECK" == "200" ]; then
    echo "✅ Health check passed (HTTP $HEALTH_CHECK)"
else
    echo "⚠️  Health check failed (HTTP $HEALTH_CHECK)"
    echo "   This may be normal if DNS hasn't fully propagated yet"
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
echo "📋 Next Steps:"
echo "   1. Wait for DNS propagation (may take a few minutes)"
echo "   2. Test API: curl -H 'X-MCP-API-KEY: YOUR_KEY' https://${MCP_DOMAIN}/api/status"
echo "   3. Update unified-service-accessor.js to use remote MCP"
echo ""

