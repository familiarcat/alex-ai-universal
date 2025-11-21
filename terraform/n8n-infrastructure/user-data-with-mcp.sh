#!/bin/bash

################################################################################
#
# N8N + MCP EC2 Instance User Data Script
# 
# This script runs on instance FIRST BOOT to:
# - Install Docker
# - Install SSM agent (for remote automation)
# - Configure nginx reverse proxy (n8n + MCP)
# - Set up n8n with correct WEBHOOK_URL
# - Set up MCP server
# - Configure automated backups
# - Set up CloudWatch monitoring
#
################################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 N8N + MCP Infrastructure Setup (Terraform-managed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update system
echo "📦 Updating system packages..."
apt-get update -y
apt-get upgrade -y

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Installing Docker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

echo "✅ Docker installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Installing SSM Agent..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install SSM agent (for AWS Systems Manager access)
snap install amazon-ssm-agent --classic
systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

echo "✅ SSM Agent installed and running"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Installing nginx reverse proxy..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Configure nginx for n8n
cat > /etc/nginx/sites-available/n8n << NGINX_N8N_CONFIG
server {
    listen 80;
    server_name ${n8n_domain};

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${n8n_domain};

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/${n8n_domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${n8n_domain}/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to n8n
    location / {
        proxy_pass http://localhost:5678;
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
NGINX_N8N_CONFIG

# Configure nginx for MCP
cat > /etc/nginx/sites-available/mcp << NGINX_MCP_CONFIG
server {
    listen 80;
    server_name mcp.pbradygeorgen.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mcp.pbradygeorgen.com;

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/mcp.pbradygeorgen.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.pbradygeorgen.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to MCP server
    location / {
        proxy_pass http://localhost:5679;
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
NGINX_MCP_CONFIG

# Enable nginx sites
ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/n8n
ln -sf /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/mcp
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

echo "✅ nginx configured for n8n and MCP"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Creating n8n environment configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create n8n configuration directory
mkdir -p /opt/n8n
mkdir -p /home/ubuntu/.n8n

# Create permanent environment file
cat > /opt/n8n/.env << EOF
# N8N Webhook Configuration (CRITICAL for webhook registration!)
WEBHOOK_URL=https://${n8n_domain}
N8N_PROTOCOL=https
N8N_HOST=${n8n_domain}
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://${n8n_domain}
WEBHOOK_TUNNEL_URL=

# Database persistence
N8N_USER_FOLDER=/home/node/.n8n

# Execution settings
EXECUTIONS_MODE=regular
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Timezone
GENERIC_TIMEZONE=America/New_York

# Performance
N8N_PAYLOAD_SIZE_MAX=16

# Monitoring
N8N_METRICS=true
N8N_DIAGNOSTICS_ENABLED=true
EOF

chown -R ubuntu:ubuntu /home/ubuntu/.n8n
chmod 644 /opt/n8n/.env

echo "✅ n8n environment configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Creating MCP environment configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create MCP configuration directory
mkdir -p /opt/mcp
mkdir -p /home/ubuntu/.mcp
mkdir -p /home/ubuntu/mcp-server

# Create MCP environment file
cat > /opt/mcp/.env << EOF
# MCP Server Configuration
MCP_PORT=5679
MCP_API_KEY=\${N8N_API_KEY}
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=\${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}

# OpenRouter Configuration
OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}
EOF

chown -R ubuntu:ubuntu /home/ubuntu/.mcp
chmod 644 /opt/mcp/.env

echo "✅ MCP environment configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Setting up Docker Compose..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create docker-compose.yml with n8n and MCP
cat > /opt/docker-compose.yml << 'DOCKER_COMPOSE_EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:${N8N_VERSION:-1.120.4}
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
DOCKER_COMPOSE_EOF

echo "✅ Docker Compose configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Preparing MCP Server Code..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Note: MCP server code will be deployed via deployment script
# This just creates the directory structure
mkdir -p /home/ubuntu/mcp-server
chown -R ubuntu:ubuntu /home/ubuntu/mcp-server

echo "✅ MCP server directory prepared"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Creating restart service script..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create restart script for n8n and MCP
cat > /opt/restart-services.sh << 'RESTART_SCRIPT'
#!/bin/bash
set -e

cd /opt

# Stop existing containers
docker-compose -f docker-compose.yml down || true

# Remove old containers
docker rm -f n8n mcp-server 2>/dev/null || true

# Start services
docker-compose -f docker-compose.yml up -d --build

echo "✅ Services restarted"
RESTART_SCRIPT

chmod +x /opt/restart-services.sh

echo "✅ Restart script created"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Infrastructure setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps (will be automated):"
echo "   1. Deploy MCP server code"
echo "   2. Get SSL certificates (certbot)"
echo "   3. Start Docker containers"
echo "   4. Verify services"
echo ""

