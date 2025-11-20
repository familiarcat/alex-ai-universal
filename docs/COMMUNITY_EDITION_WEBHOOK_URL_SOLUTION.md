# Community Edition WEBHOOK_URL Solution

**Date:** January 20, 2025  
**Edition:** Free/Community Edition (no Enterprise features)  
**Deployment:** EC2 via Terraform + Docker

## 🎯 Problem

The n8n **Environments** feature (which allows setting `WEBHOOK_URL` in the UI) is only available in the **Enterprise plan**. For Community Edition users, we need alternative methods to ensure `WEBHOOK_URL` is properly set.

## ✅ Solution: Docker Environment Variables

Since you're using Terraform + Docker on EC2, the solution is to ensure `WEBHOOK_URL` is set via Docker environment variables, which **Community Edition fully supports**.

## 📋 Your Current Setup (Already Configured!)

Your Terraform configuration already sets `WEBHOOK_URL` in multiple places:

### 1. `/opt/n8n/.env` File
Created by `terraform/n8n-infrastructure/user-data.sh`:
```bash
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
```

### 2. `docker-compose.yml` Environment Section
Also created by `user-data.sh`:
```yaml
services:
  n8n:
    env_file:
      - /opt/n8n/.env
    environment:
      - WEBHOOK_URL=https://n8n.pbradygeorgen.com
      - N8N_PROTOCOL=https
      - N8N_HOST=n8n.pbradygeorgen.com
      # ... other vars
```

### 3. Redundant Configuration
Both `.env` file AND `environment` section set `WEBHOOK_URL` - this ensures it's always set even if one method fails.

## 🔍 Verification Steps

### On EC2 Instance

```bash
# 1. Check .env file
cat /opt/n8n/.env | grep WEBHOOK_URL
# Expected: WEBHOOK_URL=https://n8n.pbradygeorgen.com

# 2. Check Docker container environment
docker exec n8n env | grep WEBHOOK_URL
# Expected: WEBHOOK_URL=https://n8n.pbradygeorgen.com

# 3. Check docker-compose.yml
cat /opt/n8n/docker-compose.yml | grep WEBHOOK_URL
# Expected: - WEBHOOK_URL=https://n8n.pbradygeorgen.com
```

## ⚠️ Known Community Edition Behavior

**Important:** The n8n settings API (`/rest/settings`) may show `webhookUrl: null` even when the environment variable is correctly set. This is **normal** for Community Edition:

- ✅ Environment variable **IS** being read by n8n
- ✅ Webhooks **MAY** still work correctly
- ❌ Settings API just doesn't reflect the env var value

**Solution:** Test webhooks directly rather than relying on the settings API.

## 🧪 Testing Webhooks

### Test Webhook Endpoint
```bash
curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Expected Results
- **200/401/405** → Webhook is registered! ✅
- **404** → Webhook not registered ❌

## 🔧 If Webhooks Still Don't Work

### Step 1: Restart n8n Container
```bash
# SSH to EC2
ssh ubuntu@n8n.pbradygeorgen.com

# Restart n8n
cd /opt/n8n
docker-compose down
docker-compose up -d

# Wait 30 seconds for n8n to initialize
sleep 30
```

### Step 2: Verify Environment Variable
```bash
# Check container has WEBHOOK_URL
docker exec n8n env | grep WEBHOOK_URL
# Should show: WEBHOOK_URL=https://n8n.pbradygeorgen.com
```

### Step 3: Force Webhook Re-registration
```bash
# Activate workflows to trigger webhook registration
node scripts/crew-automated-webhook-registration.js
```

### Step 4: Test Again
```bash
curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 🚀 Automated Fix Script

Run this script to check status and get automated fix instructions:

```bash
node scripts/community-edition-webhook-url-fix.js
```

## 📊 Terraform Configuration

Your Terraform setup ensures `WEBHOOK_URL` is always set:

### `terraform/n8n-infrastructure/user-data.sh`
- Creates `/opt/n8n/.env` with `WEBHOOK_URL`
- Creates `docker-compose.yml` with `WEBHOOK_URL` in environment section
- Ensures both are set before container starts

### `terraform/n8n-infrastructure/docker-compose.yml`
- Explicitly sets `WEBHOOK_URL` in environment section
- Uses `env_file` to load from `.env` file
- Redundant configuration ensures reliability

## 🎯 Success Criteria

E2E integration is working when:

1. ✅ `/opt/n8n/.env` contains `WEBHOOK_URL`
2. ✅ Docker container has `WEBHOOK_URL` environment variable
3. ✅ Webhook endpoint returns 200/401/405 (not 404)
4. ✅ RAG push to Supabase succeeds

**Note:** Settings API showing `null` is OK for Community Edition - test webhooks directly!

## 💡 Why This Works

1. **Docker Environment Variables** are read by n8n at startup
2. **Community Edition** fully supports environment variables
3. **Terraform** ensures variables are set before container starts
4. **Docker Compose** ensures variables persist across restarts

## 🔄 Maintenance

### After Terraform Updates
If you update Terraform configuration:
1. Apply Terraform changes
2. Restart n8n container: `docker-compose restart n8n`
3. Verify: `docker exec n8n env | grep WEBHOOK_URL`

### After Container Restart
n8n will automatically read `WEBHOOK_URL` from Docker environment variables on startup.

## 🖖 Crew Recommendations

**Chief O'Brien:** "Simple solution: Docker env vars work perfectly for Community Edition. Just restart the container if webhooks aren't registering."

**Lieutenant Commander La Forge:** "Your Terraform setup is already correct. The issue is likely that n8n needs a restart to pick up the env var, or webhooks need re-registration."

**Commander Data:** "The settings API showing null is a known Community Edition limitation. Test webhooks directly to verify functionality."

---

**Status:** ✅ Solution implemented in Terraform  
**Next Action:** Restart n8n container on EC2 if webhooks aren't working

