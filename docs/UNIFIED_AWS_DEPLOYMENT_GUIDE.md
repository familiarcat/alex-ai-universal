# 🖖 Unified AWS Deployment Guide

**Date:** November 26, 2025  
**Status:** ✅ Complete  
**Crew:** La Forge, Riker, Data, Picard, O'Brien, Quark

---

## 🎯 Overview

Unified deployment system for all Alex AI services to a single AWS EC2 instance:

- **n8n.pbradygeorgen.com** - n8n workflow automation
- **mcp.pbradygeorgen.com** - MCP server
- **projects.pbradygeorgen.com** - Unified dashboard and project management

---

## 🏗️ Architecture

### Single EC2 Instance Deployment

```
EC2 Instance (us-east-2)
├── n8n (Docker) - Port 5678
├── MCP Server (Docker) - Port 5679
└── Dashboard (Docker) - Port 3000

Nginx Reverse Proxy (via Terraform user-data)
├── n8n.pbradygeorgen.com → n8n:5678
├── mcp.pbradygeorgen.com → mcp-server:5679
└── projects.pbradygeorgen.com → dashboard:3000
```

### DNS Configuration

All three domains point to the same Elastic IP:
- `n8n.pbradygeorgen.com` → EC2 Elastic IP
- `mcp.pbradygeorgen.com` → EC2 Elastic IP
- `projects.pbradygeorgen.com` → EC2 Elastic IP

---

## 📋 Prerequisites

1. **AWS CLI** installed and configured
2. **Terraform** installed
3. **Credentials in ~/.zshrc:**
   - `AWS_PROFILE` (default: AmplifyUser)
   - `AWS_DEFAULT_REGION` (default: us-east-2)
   - `N8N_API_KEY`
   - `MCP_API_KEY` (optional, falls back to N8N_API_KEY)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENROUTER_API_KEY`

---

## 🚀 Deployment Steps

### 1. Deploy Infrastructure (First Time)

```bash
cd terraform/n8n-infrastructure

# Initialize Terraform
terraform init

# Review changes
terraform plan

# Apply infrastructure
terraform apply
```

This creates:
- EC2 instance with Elastic IP
- Security groups
- Route 53 DNS records for all three domains
- IAM roles and policies

### 2. Deploy Services

```bash
# From project root
./scripts/deployment/deploy-unified-aws.sh
```

This script:
1. Loads credentials from `~/.zshrc`
2. Finds the EC2 instance
3. Creates deployment package
4. Uploads to EC2
5. Executes deployment script
6. Starts all services via Docker Compose

### 3. Verify Deployment

```bash
# Check n8n
curl https://n8n.pbradygeorgen.com/healthz

# Check MCP
curl https://mcp.pbradygeorgen.com/healthz

# Check Dashboard
curl https://projects.pbradygeorgen.com/api/health
```

---

## 📁 File Structure

### Local Structure (Aligned with Deployment)

```
alex-ai-universal/
├── docker-compose.unified.yml    # Unified compose for all services
├── mcp-server/
│   ├── Dockerfile
│   └── server.js
├── projects/
│   └── dashboard/
│       ├── Dockerfile
│       └── ...
├── terraform/
│   └── n8n-infrastructure/
│       ├── main.tf
│       ├── mcp-dns.tf
│       ├── projects-dns.tf       # NEW: Projects DNS
│       └── ...
└── scripts/
    └── deployment/
        ├── deploy-unified-aws.sh  # Unified deployment script
        └── unified-aws-deployment-coordination.js
```

### EC2 Instance Structure

```
/home/ubuntu/
├── alex-ai-universal/
│   ├── docker-compose.yml        # Copied from docker-compose.unified.yml
│   ├── mcp-server/
│   └── projects/
│       └── dashboard/
├── .n8n/                          # n8n data
├── .mcp/                          # MCP data
└── .dashboard/                    # Dashboard data

/opt/
├── n8n/.env
├── mcp/.env
└── dashboard/.env
```

---

## 🔧 Configuration

### Environment Variables

Loaded from `~/.zshrc` and passed to containers:

**n8n:**
- `N8N_VERSION=1.120.4`
- `N8N_DOMAIN=n8n.pbradygeorgen.com`
- `N8N_API_KEY`

**MCP:**
- `MCP_PORT=5679`
- `MCP_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`

**Dashboard:**
- `NODE_ENV=production`
- `PORT=3000`
- `NEXT_PUBLIC_MCP_URL=https://mcp.pbradygeorgen.com`
- `NEXT_PUBLIC_N8N_URL=https://n8n.pbradygeorgen.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔄 Updates and Redeployment

### Update Single Service

```bash
# Edit service code locally
# Then redeploy
./scripts/deployment/deploy-unified-aws.sh
```

### Update Infrastructure

```bash
cd terraform/n8n-infrastructure
terraform plan
terraform apply
```

---

## 🖖 Crew Coordination

### La Forge (Infrastructure)
- Docker and Terraform alignment
- Unified deployment structure
- Service orchestration

### Riker (Execution)
- Deployment workflow
- Script automation
- Process coordination

### Data (Configuration)
- Configuration analysis
- Environment variable management
- Service integration

### Picard (Architecture)
- Strategic deployment design
- Domain organization
- System integration

### O'Brien (Implementation)
- Pragmatic deployment scripts
- Troubleshooting
- Quick fixes

### Quark (Cost Optimization)
- Resource allocation
- Cost monitoring
- Efficiency optimization

---

## ✅ Benefits

1. **Single Instance** - All services on one EC2 instance
2. **Unified Deployment** - One script deploys everything
3. **Cost Effective** - Shared infrastructure
4. **Easy Updates** - Simple redeployment process
5. **Aligned Structure** - Local matches deployment
6. **Credential Management** - Uses ~/.zshrc automatically

---

## 🔍 Troubleshooting

### Services Not Starting

```bash
# SSH to instance (or use SSM)
aws ssm start-session --target <instance-id> --profile AmplifyUser

# Check logs
cd /home/ubuntu/alex-ai-universal
sudo docker-compose logs

# Restart services
sudo docker-compose restart
```

### DNS Not Resolving

```bash
# Check Route 53 records
aws route53 list-resource-record-sets \
    --hosted-zone-id <zone-id> \
    --profile AmplifyUser

# Verify Elastic IP
aws ec2 describe-addresses --profile AmplifyUser
```

### Credentials Missing

```bash
# Verify ~/.zshrc has all required variables
grep -E "(AWS_PROFILE|N8N_API_KEY|SUPABASE)" ~/.zshrc
```

---

**Status:** ✅ Ready for Deployment  
**Last Updated:** November 26, 2025

