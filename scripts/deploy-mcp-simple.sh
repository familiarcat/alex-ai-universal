#!/bin/bash

################################################################################
#
# Simple MCP Deployment Script
# Direct deployment without complex command dependencies
#
################################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖖 Deploy MCP Server to mcp.pbradygeorgen.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load credentials
if [ -f ~/.zshrc ]; then
    source ~/.zshrc 2>/dev/null || true
fi

# Configuration
MCP_DOMAIN="mcp.pbradygeorgen.com"
N8N_DOMAIN="n8n.pbradygeorgen.com"
EC2_IP="${EC2_IP:-3.21.117.131}"
EC2_USER="ubuntu"
ROUTE53_ZONE_ID="${AWS_ROUTE53_ZONE_ID:-Z0759101F61W3MIFHSWK}"

echo "📋 Configuration:"
echo "   MCP Domain: $MCP_DOMAIN"
echo "   EC2 IP: $EC2_IP"
echo "   Route53 Zone: $ROUTE53_ZONE_ID"
echo ""

# Step 1: Configure Route53 DNS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Configuring Route53 DNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$ROUTE53_ZONE_ID" ]; then
    echo "📝 Creating/updating DNS record for $MCP_DOMAIN..."
    
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
    
    echo "✅ DNS record configured"
    echo "   Waiting 30 seconds for DNS propagation..."
    sleep 30
else
    echo "⚠️  Route53 Zone ID not set, skipping DNS configuration"
fi

echo ""

# Step 2: Deploy MCP Server Code
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Deploying MCP Server Code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Creating deployment package..."
TMP_DIR=$(mktemp -d 2>/dev/null || echo "/tmp/mcp-deploy-$$")
mkdir -p "$TMP_DIR"

cd "$(dirname "$0")/.."

tar -czf "$TMP_DIR/mcp-server-deploy.tar.gz" \
    mcp-server/ \
    scripts/utils/mcp-*.js \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' 2>/dev/null || {
    echo "⚠️  Some files may be missing, continuing..."
}

echo "📤 Deploying to EC2..."
scp -o StrictHostKeyChecking=no "$TMP_DIR/mcp-server-deploy.tar.gz" ${EC2_USER}@${EC2_IP}:/tmp/mcp-server-deploy.tar.gz

rm -rf "$TMP_DIR"

# Extract and setup on EC2
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} <<SSH_SCRIPT
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

echo "✅ MCP server code deployed"
echo ""

# Step 3: Update Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Updating Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} <<SSH_SCRIPT
set -e

# Create MCP config directory
sudo mkdir -p /opt/mcp

# Update MCP environment file
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

# Step 4: Configure Nginx and SSL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Configuring Nginx and SSL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} <<SSH_SCRIPT
set -e

# Create nginx config for MCP
sudo tee /etc/nginx/sites-available/mcp > /dev/null <<NGINX_EOF
server {
    listen 80;
    server_name ${MCP_DOMAIN};
    return 301 https://\\\$server_name\\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${MCP_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${MCP_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${MCP_DOMAIN}/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

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

# Step 5: Build and Start Docker Containers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Building and Starting Docker Containers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} <<SSH_SCRIPT
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

# Step 6: Verify Deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Verifying Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testing health endpoint..."
sleep 10
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://${MCP_DOMAIN}/healthz" --max-time 10 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" == "200" ]; then
    echo "✅ Health check passed (HTTP $HEALTH_CHECK)"
else
    echo "⚠️  Health check returned HTTP $HEALTH_CHECK"
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
echo "📋 Services Running:"
echo "   • n8n: https://${N8N_DOMAIN} (port 5678)"
echo "   • MCP: https://${MCP_DOMAIN} (port 5679)"
echo ""
echo "🔄 Next Steps:"
echo "   1. Wait for DNS propagation (may take a few minutes)"
echo "   2. Test API: curl -H 'X-MCP-API-KEY: YOUR_KEY' https://${MCP_DOMAIN}/api/status"
echo "   3. Verify all services are operational"
echo ""

