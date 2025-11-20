# N8N Container Restart Guide

**Date:** January 20, 2025  
**Purpose:** Restart n8n container on EC2 to load WEBHOOK_URL  
**Method:** Automated via EC2 Instance Connect or AWS SSM

## 🚀 Quick Restart

### Single Command
```bash
node scripts/restart-n8n-container-ec2.js
```

This script:
1. ✅ Connects to EC2 via Instance Connect or SSM
2. ✅ Restarts n8n container using docker-compose
3. ✅ Verifies WEBHOOK_URL is loaded
4. ✅ Tests webhooks after restart
5. ✅ Provides next steps if webhooks need re-registration

## 📋 What the Script Does

### Step 1: Connect to EC2
- Uses EC2 Instance Connect (preferred)
- Falls back to AWS SSM if Instance Connect fails
- No permanent SSH keys required

### Step 2: Restart Container
```bash
cd /opt/n8n
docker-compose restart n8n
```

**Why docker-compose:**
- Automatically uses `--env-file /opt/n8n/.env`
- Ensures WEBHOOK_URL is loaded from environment file
- Maintains all configuration

### Step 3: Verify WEBHOOK_URL
```bash
docker exec n8n env | grep WEBHOOK_URL
# Expected: WEBHOOK_URL=https://n8n.pbradygeorgen.com
```

### Step 4: Test Webhooks
- Waits 30 seconds for n8n initialization
- Tests Knowledge Ingest webhook
- Reports registration status

## 🔧 Alternative Methods

### Method 1: Direct SSH (if you have SSH access)
```bash
ssh ubuntu@n8n.pbradygeorgen.com
cd /opt/n8n
docker-compose restart n8n
sleep 30
docker exec n8n env | grep WEBHOOK_URL
```

### Method 2: AWS SSM (if SSM agent is running)
```bash
aws ssm send-command \
  --instance-ids i-0afdf313f61f22df0 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cd /opt/n8n", "docker-compose restart n8n", "sleep 30", "docker exec n8n env | grep WEBHOOK_URL"]' \
  --region us-east-2
```

### Method 3: Using Existing Scripts
```bash
# Using restart script with env file
node scripts/restart-n8n-docker-with-env.js

# Using remote Docker restart
bash scripts/n8n-restart-remote-docker.sh
```

## ⚠️ After Restart: Webhook Re-registration

Even after restart, webhooks may need re-registration:

```bash
# Wait 60 seconds for webhook registration
sleep 60

# Force webhook re-registration
node scripts/force-webhook-reregistration.js

# Or use crew-automated script
node scripts/crew-automated-webhook-registration.js
```

## 🧪 Verify System is Operational

After restart and webhook re-registration:

```bash
# Run E2E test suite
node scripts/test-rag-system-e2e.js

# Expected: All tests pass
```

## 📊 Expected Results

### Successful Restart
```
✅ Container restart command executed
✅ WEBHOOK_URL is set in container
✅ Webhook is registered! (Status: 200)
🎉 n8n container restarted and webhooks are registered!
```

### Webhooks Need Re-registration
```
✅ Container restart command executed
✅ WEBHOOK_URL is set in container
⚠️  Webhook still not registered (404)
💡 Next steps: Run force-webhook-reregistration.js
```

## 🔄 Complete Workflow

### Full Restart + Webhook Registration
```bash
# 1. Restart container
node scripts/restart-n8n-container-ec2.js

# 2. Wait for webhook registration (if needed)
sleep 60

# 3. Force re-registration if webhooks still 404
node scripts/force-webhook-reregistration.js

# 4. Verify system is operational
node scripts/test-rag-system-e2e.js
```

## 🖖 Crew Recommendations

**Chief O'Brien:** "Simple solution: One command restarts everything. If webhooks don't register, run the re-registration script."

**Lieutenant Commander La Forge:** "docker-compose restart ensures --env-file is always used. This is the most reliable method."

**Commander Riker:** "Automated restart script handles all the complexity. Just run it and verify."

---

**Status:** ✅ Restart script operational  
**Usage:** `node scripts/restart-n8n-container-ec2.js`

