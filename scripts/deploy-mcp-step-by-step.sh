#!/bin/bash

# Step-by-step MCP deployment with progress tracking

set -e

MCP_DOMAIN="mcp.pbradygeorgen.com"
EC2_IP="3.21.117.131"
EC2_USER="ubuntu"
ROUTE53_ZONE_ID="Z0759101F61W3MIFHSWK"

echo "🚀 Starting MCP deployment to $MCP_DOMAIN"
echo ""

# Step 1: DNS
echo "[1/6] Configuring DNS..."
aws route53 change-resource-record-sets \
    --hosted-zone-id "$ROUTE53_ZONE_ID" \
    --change-batch "{\"Changes\":[{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"${MCP_DOMAIN}\",\"Type\":\"A\",\"TTL\":300,\"ResourceRecords\":[{\"Value\":\"${EC2_IP}\"}]}}]}" \
    > /dev/null 2>&1
echo "✅ DNS configured"
sleep 5

# Step 2: Deploy code
echo "[2/6] Deploying MCP server code..."
cd "$(dirname "$0")/.."
tar -czf /tmp/mcp-deploy.tar.gz mcp-server/ scripts/utils/mcp-*.js --exclude='node_modules' --exclude='.git' 2>/dev/null
scp -o StrictHostKeyChecking=no /tmp/mcp-deploy.tar.gz ${EC2_USER}@${EC2_IP}:/tmp/
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "cd /home/ubuntu && mkdir -p mcp-server && tar -xzf /tmp/mcp-deploy.tar.gz -C /home/ubuntu/ && cd mcp-server && npm install --production"
echo "✅ Code deployed"

# Step 3: Environment
echo "[3/6] Setting environment variables..."
source ~/.zshrc 2>/dev/null || true
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "sudo mkdir -p /opt/mcp && sudo tee /opt/mcp/.env > /dev/null <<EOF
MCP_PORT=5679
MCP_API_KEY=${N8N_API_KEY}
NODE_ENV=production
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
EOF"
echo "✅ Environment configured"

# Step 4: Nginx
echo "[4/6] Configuring Nginx..."
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "sudo tee /etc/nginx/sites-available/mcp > /dev/null <<'NGINX'
server {
    listen 80;
    server_name ${MCP_DOMAIN};
    return 301 https://\$server_name\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name ${MCP_DOMAIN};
    ssl_certificate /etc/letsencrypt/live/${MCP_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${MCP_DOMAIN}/privkey.pem;
    add_header Strict-Transport-Security \"max-age=31536000\" always;
    location / {
        proxy_pass http://localhost:5679;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/mcp && sudo nginx -t && sudo systemctl reload nginx"
echo "✅ Nginx configured"

# Step 5: SSL
echo "[5/6] Obtaining SSL certificate..."
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "sudo certbot --nginx -d ${MCP_DOMAIN} --non-interactive --agree-tos --email admin@pbradygeorgen.com --redirect || true && sudo systemctl reload nginx"
echo "✅ SSL configured"

# Step 6: Docker
echo "[6/6] Starting Docker containers..."
source ~/.zshrc 2>/dev/null || true
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "cd /opt && sudo tee docker-compose.yml > /dev/null <<'COMPOSE'
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:1.120.4
    container_name: n8n
    restart: always
    ports: [\"5678:5678\"]
    env_file: [/opt/n8n/.env]
    volumes: [/home/ubuntu/.n8n:/home/node/.n8n]
    networks: [alex-ai-network]
  mcp-server:
    build:
      context: /home/ubuntu/mcp-server
      dockerfile: Dockerfile
    container_name: mcp-server
    restart: always
    ports: [\"5679:5679\"]
    env_file: [/opt/mcp/.env]
    environment:
      MCP_PORT: 5679
      MCP_API_KEY: ${N8N_API_KEY}
      NODE_ENV: production
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
    volumes: [/home/ubuntu/.mcp:/app/data]
    networks: [alex-ai-network]
    depends_on: [n8n]
networks:
  alex-ai-network:
    driver: bridge
COMPOSE
docker-compose -f docker-compose.yml down || true
docker-compose -f docker-compose.yml build mcp-server
docker-compose -f docker-compose.yml up -d"
echo "✅ Docker containers started"

echo ""
echo "✅ Deployment complete! MCP available at https://${MCP_DOMAIN}"
echo "   Test: curl https://${MCP_DOMAIN}/healthz"

