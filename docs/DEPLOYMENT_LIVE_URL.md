# 🖖 Three-Tier Dashboard - Live Deployment Guide

## 🚀 Automated Deployment

**Script**: `scripts/deploy-dashboard-live.sh`

**Technologies**:
- AWS CLI (S3 + CloudFront)
- Terraform (Infrastructure - optional)
- Docker (Containerization - fallback)

---

## 📋 Prerequisites

### **Required:**
1. **AWS CLI** installed and configured
   ```bash
   brew install awscli
   aws configure --profile AmplifyUser
   ```

2. **AWS Credentials** in `~/.zshrc`:
   ```bash
   export AWS_ACCESS_KEY_ID="your-key"
   export AWS_SECRET_ACCESS_KEY="your-secret"
   export AWS_REGION="us-east-2"
   export AWS_PROFILE="AmplifyUser"
   ```

3. **Docker** (optional, for containerized deployment):
   ```bash
   brew install docker
   ```

4. **Terraform** (optional, for infrastructure management):
   ```bash
   brew install terraform
   ```

---

## 🎯 Quick Start

### **Deploy to Live URL:**

```bash
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal
./scripts/deploy-dashboard-live.sh
```

### **What It Does:**

1. ✅ **Verifies Prerequisites** - AWS CLI, Docker, credentials
2. ✅ **Builds Dashboard** - Next.js production build
3. ✅ **Creates S3 Bucket** - Static website hosting
4. ✅ **Uploads Files** - Optimized with caching headers
5. ✅ **Configures CloudFront** - CDN for global distribution
6. ✅ **Provides Live URLs** - Immediate access for testing

---

## 🌐 Deployment URLs

After deployment, you'll get:

### **Primary URL (CloudFront CDN):**
```
https://[cloudfront-domain].cloudfront.net
```
- ✅ Global CDN
- ✅ HTTPS enabled
- ✅ Fast worldwide access
- ⏳ Takes 10-15 minutes to fully deploy

### **Direct S3 URL (Immediate):**
```
http://[bucket-name].s3-website.[region].amazonaws.com
```
- ✅ Available immediately
- ✅ No wait time
- ⚠️  HTTP only (no HTTPS)

---

## 📊 Deployment Information

Deployment details are saved to:
```
.deployment-info.json
```

Contains:
- S3 bucket name
- CloudFront distribution ID
- CloudFront domain
- Timestamp
- AWS region

---

## 🔧 Manual Steps (If Needed)

### **Option 1: Route 53 DNS (Custom Domain)**

If you want `dashboard.n8n.pbradygeorgen.com`:

1. **Get CloudFront domain** from `.deployment-info.json`
2. **Create Route 53 record**:
   ```bash
   aws route53 change-resource-record-sets \
     --hosted-zone-id [ZONE_ID] \
     --change-batch file://route53-change.json
   ```

3. **Update CloudFront** with custom domain

### **Option 2: Docker Deployment (EC2)**

For containerized deployment on existing EC2:

```bash
cd dashboard
docker build -t alex-ai-dashboard .
docker run -d -p 3000:3000 alex-ai-dashboard
```

Then configure nginx reverse proxy on EC2.

### **Option 3: Terraform Infrastructure**

For complete infrastructure as code:

```bash
cd terraform/n8n-infrastructure
terraform init
terraform plan
terraform apply
```

---

## 💰 Cost Estimate

**Low Traffic (< 10GB/month)**:
- S3 Storage: ~$0.23/month (10GB)
- CloudFront: ~$0.85/month (10GB transfer)
- **Total: ~$1-2/month**

**Medium Traffic (50GB/month)**:
- S3 Storage: ~$1.15/month
- CloudFront: ~$4.25/month
- **Total: ~$5-6/month**

**High Traffic (500GB/month)**:
- S3 Storage: ~$11.50/month
- CloudFront: ~$42.50/month
- **Total: ~$50-60/month**

---

## 🧪 Testing

### **Test Live Deployment:**

1. **Open CloudFront URL** in browser
2. **Verify three-tier routing**:
   - `/dashboard` → Tier 1 (Main)
   - `/dashboard/projects/[id]` → Tier 2 (Project)
   - `/projects/[id]` → Tier 3 (Published)
3. **Check RBAC** - Verify access control
4. **Test sync** - Verify state synchronization

### **Health Check:**

```bash
curl -I https://[cloudfront-domain].cloudfront.net
```

Should return `200 OK`.

---

## 🔄 Updates & Redeployment

### **Redeploy After Changes:**

```bash
./scripts/deploy-dashboard-live.sh
```

The script will:
- Rebuild dashboard
- Upload to same S3 bucket
- Invalidate CloudFront cache
- Update deployment info

### **Cache Invalidation:**

CloudFront cache is automatically invalidated on deployment.

For manual invalidation:
```bash
aws cloudfront create-invalidation \
  --distribution-id [DIST_ID] \
  --paths "/*" \
  --profile AmplifyUser
```

---

## 🚨 Troubleshooting

### **Issue: AWS Credentials Not Found**

**Solution:**
```bash
# Add to ~/.zshrc
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-2"
export AWS_PROFILE="AmplifyUser"

# Reload
source ~/.zshrc
```

### **Issue: S3 Bucket Already Exists**

**Solution:** Script handles this automatically. Bucket names include timestamp.

### **Issue: CloudFront Takes Too Long**

**Solution:** Use S3 direct URL for immediate testing. CloudFront typically takes 10-15 minutes.

### **Issue: Build Fails**

**Solution:**
```bash
cd dashboard
rm -rf .next node_modules
npm install
npm run build
```

---

## 📝 Notes

- **Static Export**: Script automatically enables static export if needed
- **Caching**: HTML files have no-cache, assets have long cache
- **HTTPS**: CloudFront provides free SSL certificate
- **Cost**: Free tier available for S3 (5GB) and CloudFront (50GB)

---

## ✅ Success Criteria

Deployment is successful when:
- ✅ Script completes without errors
- ✅ CloudFront URL returns 200 OK
- ✅ Dashboard loads in browser
- ✅ Three-tier routing works
- ✅ RBAC permissions function
- ✅ State sync operates correctly

---

**Status**: 🟢 **Ready for Deployment**

**Command**: `./scripts/deploy-dashboard-live.sh`

---

*Generated by: Crew Coordination System*  
*Mission: Live Dashboard Deployment*

