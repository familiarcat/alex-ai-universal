# MCP Automated Deployment Guide

**Date:** January 20, 2025  
**Status:** ✅ Automation Complete  
**Target:** mcp.pbradygeorgen.com

## 🎯 Overview

Complete automation for deploying MCP server to `mcp.pbradygeorgen.com` on the same EC2 instance as n8n.

## 🚀 Quick Start

### Prerequisites

1. **AWS Credentials** in `~/.zshrc`:
   ```bash
   export AWS_ACCESS_KEY_ID="your-key"
   export AWS_SECRET_ACCESS_KEY="your-secret"
   export AWS_ROUTE53_ZONE_ID="your-zone-id"
   ```

2. **SSH Access** to EC2:
   ```bash
   # Ensure SSH key is configured
   ssh ubuntu@n8n.pbradygeorgen.com
   ```

3. **Required Tools**:
   - AWS CLI
   - SSH client
   - curl (for verification)

### Deployment

```bash
# Run automated deployment
./scripts/automate-mcp-deployment.sh
```

This script automates:
1. ✅ Route53 DNS configuration
2. ✅ Nginx reverse proxy setup
3. ✅ SSL certificate (Let's Encrypt)
4. ✅ Docker Compose configuration
5. ✅ MCP server build and deployment
6. ✅ Health check verification

### Post-Deployment

```bash
# Update client to use remote MCP by default
node scripts/update-unified-service-for-remote-mcp.js
```

## 📋 What Gets Deployed

### DNS Configuration
- **Domain:** `mcp.pbradygeorgen.com`
- **Type:** A record
- **Target:** EC2 Elastic IP
- **TTL:** 300 seconds

### Nginx Configuration
- **HTTP → HTTPS redirect**
- **SSL/TLS** via Let's Encrypt
- **Reverse proxy** to port 5679
- **Security headers** (HSTS, X-Frame-Options, etc.)
- **Long timeout** for workflows (300s)

### Docker Configuration
- **Container:** `mcp-server`
- **Port:** 5679 (internal), 443 (external via nginx)
- **Network:** `alex-ai-network` (shared with n8n)
- **Restart:** Always
- **Health check:** `/healthz` endpoint

### Environment Variables
- `MCP_PORT=5679`
- `MCP_API_KEY=${N8N_API_KEY}`
- `NODE_ENV=production`

## 🔍 Verification

### Health Check
```bash
curl https://mcp.pbradygeorgen.com/healthz
```

Expected response:
```json
{"status":"ok","timestamp":"2025-01-20T..."}
```

### API Status
```bash
curl -H "X-MCP-API-KEY: YOUR_KEY" \
     https://mcp.pbradygeorgen.com/api/status
```

Expected response:
```json
{
  "status": "operational",
  "services": {
    "workflow": true,
    "memory": true,
    "cache": true,
    ...
  }
}
```

### Test Workflow Execution
```bash
curl -X POST \
     -H "X-MCP-API-KEY: YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"test","steps":[]}' \
     https://mcp.pbradygeorgen.com/api/workflows/execute
```

## 🛠️ Manual Steps (If Automation Fails)

### 1. DNS Configuration
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id $AWS_ROUTE53_ZONE_ID \
  --change-batch file://dns-change.json
```

### 2. Nginx Configuration
```bash
# SSH to EC2
ssh ubuntu@n8n.pbradygeorgen.com

# Create nginx config
sudo nano /etc/nginx/sites-available/mcp
# (Copy config from script)

# Enable site
sudo ln -s /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/mcp
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d mcp.pbradygeorgen.com
```

### 3. Docker Deployment
```bash
# SSH to EC2
ssh ubuntu@n8n.pbradygeorgen.com

# Create environment file
sudo mkdir -p /opt/mcp
sudo tee /opt/mcp/.env > /dev/null <<EOF
MCP_PORT=5679
MCP_API_KEY=${N8N_API_KEY}
NODE_ENV=production
EOF

# Update docker-compose.yml
sudo nano /opt/docker-compose.yml
# (Add mcp-server service)

# Build and start
cd /opt
sudo docker-compose up -d --build mcp-server
```

## 🔧 Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
dig mcp.pbradygeorgen.com

# Wait up to 5 minutes for propagation
```

### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

### Container Not Starting
```bash
# Check logs
sudo docker logs mcp-server

# Check container status
sudo docker ps -a | grep mcp-server
```

### Nginx Errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

## 📊 Architecture

```
Internet
   │
   ▼
mcp.pbradygeorgen.com (Route53 DNS)
   │
   ▼
EC2 Instance (Elastic IP)
   │
   ├── nginx (Port 443 → 5679)
   │
   └── Docker Network (alex-ai-network)
       ├── n8n (Port 5678)
       └── mcp-server (Port 5679)
```

## 🔐 Security

- ✅ HTTPS only (HTTP redirects to HTTPS)
- ✅ API key authentication
- ✅ Rate limiting (100 req/15min)
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Firewall rules (only 80, 443, 22 open)

## 📈 Monitoring

### Health Checks
- **Endpoint:** `/healthz`
- **Interval:** 30s (Docker healthcheck)
- **Timeout:** 10s

### Logs
```bash
# Container logs
sudo docker logs mcp-server

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🚀 Next Steps

After successful deployment:

1. ✅ Update unified service accessor to use remote MCP
2. ✅ Test all API endpoints
3. ✅ Monitor for 24 hours
4. ✅ Update documentation
5. ✅ Decommission local MCP (optional)

---

**Status:** ✅ Automation Complete  
**Next Action:** Run deployment script

