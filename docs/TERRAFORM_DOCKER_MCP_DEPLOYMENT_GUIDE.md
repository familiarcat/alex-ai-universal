# Terraform + Docker MCP Deployment Guide

**Date:** January 20, 2025  
**Status:** ✅ Complete  
**Purpose:** Complete guide for deploying MCP server to `mcp.pbradygeorgen.com` using Terraform and Docker

## 🎯 Overview

This guide provides step-by-step instructions for deploying the MCP server to `mcp.pbradygeorgen.com` using:
- **Terraform** for infrastructure provisioning
- **Docker Compose** for container orchestration
- **Nginx** for reverse proxy and SSL
- **Route53** for DNS management

## 📋 Prerequisites

### Required Credentials

Set these in `~/.zshrc`:

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_ROUTE53_ZONE_ID="your-zone-id"  # Optional, can be auto-detected
export N8N_API_KEY="your-n8n-api-key"
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-supabase-key"
export OPENROUTER_API_KEY="your-openrouter-key"
```

Then run:
```bash
source ~/.zshrc
```

### Required Tools

- AWS CLI configured
- Terraform installed
- Docker installed (for local testing)
- SSH access to EC2 instance

## 🚀 Deployment Methods

### Method 1: Automated Deployment Script (Recommended)

**Single command deployment:**

```bash
./scripts/deploy-mcp-via-terraform.sh
```

**What it does:**
1. Gets EC2 instance IP
2. Configures Route53 DNS for `mcp.pbradygeorgen.com`
3. Deploys MCP server code to EC2
4. Updates environment variables
5. Configures Nginx and SSL
6. Builds and starts Docker containers
7. Verifies deployment

### Method 2: Terraform Apply (Infrastructure First)

**Step 1: Apply Terraform Infrastructure**

```bash
cd terraform/n8n-infrastructure
terraform init
terraform plan
terraform apply
```

This will:
- Create/update EC2 instance
- Configure security groups
- Set up Route53 DNS for both n8n and MCP
- Run user-data script to install Docker, nginx, etc.

**Step 2: Deploy MCP Server Code**

```bash
./scripts/deploy-mcp-via-terraform.sh
```

### Method 3: Manual Deployment

If you prefer manual control:

**1. Get EC2 Instance IP**

```bash
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=alex-ai-n8n-server" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text
```

**2. Configure Route53 DNS**

```bash
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_ZONE_ID \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "mcp.pbradygeorgen.com",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [{"Value": "YOUR_EC2_IP"}]
            }
        }]
    }'
```

**3. Deploy MCP Server Code**

```bash
# Create deployment package
tar -czf mcp-server-deploy.tar.gz \
    mcp-server/ \
    scripts/utils/mcp-*.js \
    --exclude='node_modules' \
    --exclude='.git'

# Copy to EC2
scp mcp-server-deploy.tar.gz ubuntu@n8n.pbradygeorgen.com:/tmp/

# SSH and extract
ssh ubuntu@n8n.pbradygeorgen.com << 'EOF'
cd /home/ubuntu
tar -xzf /tmp/mcp-server-deploy.tar.gz
cd mcp-server
npm install --production
EOF
```

**4. Configure Environment Variables**

```bash
ssh ubuntu@n8n.pbradygeorgen.com << EOF
sudo tee /opt/mcp/.env > /dev/null << ENV_EOF
MCP_PORT=5679
MCP_API_KEY=${N8N_API_KEY}
NODE_ENV=production
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
ENV_EOF
EOF
```

**5. Configure Nginx**

```bash
ssh ubuntu@n8n.pbradygeorgen.com << 'EOF'
sudo tee /etc/nginx/sites-available/mcp > /dev/null << NGINX_EOF
server {
    listen 80;
    server_name mcp.pbradygeorgen.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mcp.pbradygeorgen.com;

    ssl_certificate /etc/letsencrypt/live/mcp.pbradygeorgen.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.pbradygeorgen.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:5679;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINX_EOF

sudo ln -sf /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/mcp
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d mcp.pbradygeorgen.com --non-interactive --agree-tos --email admin@pbradygeorgen.com --redirect
sudo systemctl reload nginx
EOF
```

**6. Build and Start Docker Containers**

```bash
ssh ubuntu@n8n.pbradygeorgen.com << 'EOF'
cd /opt

# Update docker-compose.yml
sudo tee docker-compose.yml > /dev/null << COMPOSE_EOF
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
      - WEBHOOK_URL=https://n8n.pbradygeorgen.com
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

# Build and start
docker-compose -f docker-compose.yml build mcp-server
docker-compose -f docker-compose.yml up -d
EOF
```

## 🔍 Verification

### Health Check

```bash
curl https://mcp.pbradygeorgen.com/healthz
```

Expected: `200 OK`

### API Status

```bash
curl -H "X-MCP-API-KEY: YOUR_API_KEY" \
    https://mcp.pbradygeorgen.com/api/status
```

Expected: JSON response with operational status

### Container Status

```bash
ssh ubuntu@n8n.pbradygeorgen.com "docker ps | grep -E 'n8n|mcp-server'"
```

Expected: Both containers running

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Route53 DNS                                  │
│  • n8n.pbradygeorgen.com → EC2 IP                        │
│  • mcp.pbradygeorgen.com → EC2 IP                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              EC2 Instance (Ubuntu)                       │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Nginx Reverse Proxy                 │   │
│  │  • Port 443 (SSL)                                │   │
│  │  • Routes to n8n (5678) or MCP (5679)            │   │
│  └──────────────┬──────────────────┬────────────────┘   │
│                 │                  │                      │
│                 ▼                  ▼                      │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  n8n Container   │  │  MCP Container   │            │
│  │  Port: 5678      │  │  Port: 5679      │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Docker Compose                           │   │
│  │  • Orchestrates both containers                   │   │
│  │  • Shared network: alex-ai-network                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Files

### Terraform Files

- `terraform/n8n-infrastructure/main.tf` - Main infrastructure
- `terraform/n8n-infrastructure/mcp-dns.tf` - MCP DNS configuration
- `terraform/n8n-infrastructure/user-data-with-mcp.sh` - Instance setup
- `terraform/n8n-infrastructure/docker-compose-with-mcp.yml` - Docker Compose config

### Docker Files

- `mcp-server/Dockerfile` - MCP container image
- `mcp-server/docker-compose.yml` - Local development
- `/opt/docker-compose.yml` - Production (on EC2)

### Environment Files

- `/opt/n8n/.env` - n8n configuration
- `/opt/mcp/.env` - MCP configuration

## 🛠️ Troubleshooting

### DNS Not Resolving

```bash
# Check Route53 record
aws route53 list-resource-record-sets \
    --hosted-zone-id YOUR_ZONE_ID \
    --query "ResourceRecordSets[?Name=='mcp.pbradygeorgen.com.']"

# Check DNS propagation
nslookup mcp.pbradygeorgen.com
```

### Container Not Starting

```bash
# Check logs
ssh ubuntu@n8n.pbradygeorgen.com "docker logs mcp-server"

# Check environment
ssh ubuntu@n8n.pbradygeorgen.com "cat /opt/mcp/.env"
```

### SSL Certificate Issues

```bash
# Renew certificate
ssh ubuntu@n8n.pbradygeorgen.com \
    "sudo certbot renew --nginx --non-interactive"
```

### Port Conflicts

```bash
# Check what's using port 5679
ssh ubuntu@n8n.pbradygeorgen.com "sudo lsof -i :5679"
```

## 📈 Monitoring

### CloudWatch Metrics

- CPU utilization
- Memory usage
- Disk usage
- Container health

### Logs

```bash
# View MCP logs
ssh ubuntu@n8n.pbradygeorgen.com "docker logs -f mcp-server"

# View nginx logs
ssh ubuntu@n8n.pbradygeorgen.com "sudo tail -f /var/log/nginx/access.log"
```

## ✅ Post-Deployment Checklist

- [ ] DNS resolves correctly
- [ ] SSL certificate obtained
- [ ] Health check passes
- [ ] API status endpoint works
- [ ] Both containers running
- [ ] Environment variables set
- [ ] Nginx configured correctly
- [ ] Firewall rules allow traffic
- [ ] Monitoring configured

## 🎯 Next Steps

1. ✅ Verify deployment
2. ✅ Test API endpoints
3. ✅ Update client to use remote MCP
4. ✅ Monitor for 24-48 hours
5. ✅ Decommission n8n (when ready)

---

**Status:** ✅ Deployment Guide Complete  
**Next Action:** Run deployment script

