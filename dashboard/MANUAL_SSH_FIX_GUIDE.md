# 🔧 Manual SSH Fix Guide

## Current Status
- SSH authentication failing
- Need to add public key to server

## Quick Fix Steps

### Option 1: SSH Copy ID (Easiest)
```bash
ssh-copy-id -i ~/.ssh/n8n.pem.pub ubuntu@n8n.pbradygeorgen.com
```

### Option 2: Manual Key Addition
```bash
# 1. Get public key
ssh-keygen -y -f ~/.ssh/n8n.pem > ~/.ssh/n8n.pem.pub

# 2. Copy to server manually
scp ~/.ssh/n8n.pem.pub ubuntu@n8n.pbradygeorgen.com:/tmp/

# 3. Add to authorized_keys
ssh ubuntu@n8n.pbradygeorgen.com
mkdir -p ~/.ssh
cat /tmp/n8n.pem.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Option 3: Use Existing Key
```bash
# If you have access via other means, add the key:
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDALZk9sJZVUVcz0pHzsELGRtup3sA/owNhkvlhofPlD2FVGJypo17CJ5dqQGmcD9jDlZjjbmfDWK5eQjVOx6xx/IAOOX55M2PO4wWcUIcWKJcP5sNNnXIvGsIVn7yBHbmyyKLfJdQQrOFUM5R//lFZbBcIMz5sLGli6/NgGtBhTbPpN8N96vhi3qI8NbAUmvl1emJkJBlcekNtK9+QqlSXrZLg+1pSrFBVYaTcrk2xAnPSxT69wS/FDJWSwPOb4mhndADELyCbp2N/+PO6k6SEMGOnL2NegKnNIWcU99J7yQ/CvIsnraUS6xdEL4ftCr3XAHdvlKN2lR76jnuEjWw7" >> ~/.ssh/authorized_keys
```

## After SSH Fix
Run: `./scripts/automated-nginx-deploy.sh`
