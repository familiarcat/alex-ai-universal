# Webhook Registration Troubleshooting

**Date:** January 20, 2025  
**Issue:** Webhook not registering even after manual UI toggle

## 🔍 Current Situation

- ✅ Workflow is **Active** (confirmed via API)
- ✅ Webhook path is correct: `ingest-knowledge`
- ✅ WEBHOOK_URL is set in container: `https://n8n.pbradygeorgen.com`
- ❌ Webhook still returns **404** after manual toggle

## 🧪 Verification Steps

### 1. Check Workflow Status
```bash
node -e "
const https = require('https');
const { loadCrewCredentials } = require('./scripts/utils/load-crew-credentials');
const creds = loadCrewCredentials();
// ... check workflow active status
"
```

### 2. Check Webhook Path
```bash
# Test both possible paths
curl -X POST https://n8n.pbradygeorgen.com/webhook/ingest-knowledge \
  -H "Content-Type: application/json" -d '{"test": true}'

curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest \
  -H "Content-Type: application/json" -d '{"test": true}'
```

### 3. Verify Container Environment
```bash
# Check WEBHOOK_URL in container
node scripts/restart-n8n-container-ec2.js | grep WEBHOOK_URL
```

## 🔧 Potential Issues

### Issue 1: WEBHOOK_URL Not Being Read

**Symptom:** WEBHOOK_URL is set in container but webhooks don't register

**Check:**
```bash
# On EC2 instance
docker exec n8n env | grep WEBHOOK_URL
```

**Solution:**
- Restart container to ensure env vars are loaded
- Verify docker-compose.yml has WEBHOOK_URL in environment section

### Issue 2: Webhook Registration Timing

**Symptom:** Workflow is active but webhook returns 404

**Possible Causes:**
- n8n needs more time to register webhook (60+ seconds)
- Webhook registration happens asynchronously
- Container restart may be needed

**Solution:**
- Wait 60-90 seconds after toggle
- Check n8n logs: `docker logs n8n | grep -i webhook`
- Restart container if needed

### Issue 3: Multiple Workflows

**Symptom:** Two workflows with similar names

**Check:**
- "Alex AI Knowledge Base RAG Ingestion" (main)
- "Alex AI Knowledge Base RAG Ingestion (Clean)" (duplicate?)

**Solution:**
- Ensure the correct workflow is active
- Check which workflow has the webhook node
- May need to deactivate duplicate

### Issue 4: n8n Version Limitation

**Symptom:** Community Edition webhook registration issues

**Possible Causes:**
- Known Community Edition limitation
- WEBHOOK_URL may not be fully supported
- Webhook registration may require Enterprise features

**Solution:**
- Check n8n version: `docker exec n8n n8n --version`
- Review n8n Community Edition documentation
- Consider if Enterprise Edition is needed

## 🚀 Recommended Actions

### Immediate Actions

1. **Wait Longer**
   ```bash
   # Wait 90 seconds after toggle
   sleep 90
   curl -X POST https://n8n.pbradygeorgen.com/webhook/ingest-knowledge \
     -H "Content-Type: application/json" -d '{"test": true}'
   ```

2. **Check n8n Logs**
   ```bash
   # On EC2
   docker logs n8n | grep -i webhook | tail -20
   ```

3. **Restart Container**
   ```bash
   node scripts/restart-n8n-container-ec2.js
   # Wait 60 seconds
   # Test webhook again
   ```

4. **Verify WEBHOOK_URL in Container**
   ```bash
   # On EC2
   docker exec n8n env | grep WEBHOOK_URL
   # Should show: WEBHOOK_URL=https://n8n.pbradygeorgen.com
   ```

### Advanced Troubleshooting

1. **Check n8n Database**
   ```bash
   # On EC2
   docker exec n8n sqlite3 /home/node/.n8n/database.sqlite \
     "SELECT * FROM webhook_entity WHERE path = 'ingest-knowledge';"
   ```

2. **Check Workflow Execution**
   ```bash
   # Test if workflow can execute at all
   # Use test webhook URL from n8n UI
   ```

3. **Review n8n Configuration**
   ```bash
   # Check n8n settings
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
     https://n8n.pbradygeorgen.com/rest/settings
   ```

## 📋 Checklist

- [ ] Workflow is active (checked via API)
- [ ] WEBHOOK_URL is set in container
- [ ] Waited 60+ seconds after toggle
- [ ] Container restarted after WEBHOOK_URL was set
- [ ] Checked n8n logs for errors
- [ ] Verified correct workflow is active
- [ ] Tested webhook with correct path
- [ ] Checked for duplicate workflows

## 🖖 Crew Analysis

**Chief O'Brien:** "If WEBHOOK_URL is set and workflow is active, but webhook still 404, we need to check n8n logs. Something is blocking registration."

**Commander Data:** "The workflow state is correct. The webhook path is correct. The issue must be in n8n's webhook registration mechanism or timing."

**Lieutenant Commander La Forge:** "Container environment is correct. May need to check n8n's internal webhook registry or restart the container to force re-registration."

---

**Status:** 🔍 Investigating  
**Next Steps:** Check n8n logs, wait longer, verify container restart

