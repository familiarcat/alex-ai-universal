# RAG Webhook Diagnostic Findings

**Date:** January 20, 2025  
**Status:** ⚠️  Persistent Issue - Webhook Registration Failing  
**n8n Version:** 1.120.4

## 🔍 Diagnostic Results

### ✅ What We Verified

1. **Infrastructure**
   - ✅ WEBHOOK_URL set correctly: `https://n8n.pbradygeorgen.com`
   - ✅ Container environment variables correct
   - ✅ Container status: Healthy
   - ✅ n8n version: 1.120.4

2. **Workflow**
   - ✅ Workflow exists: "Alex AI Knowledge Base RAG Ingestion"
   - ✅ Workflow ID: `c0HYTqTFtktCE3Fk`
   - ✅ Workflow is ACTIVE
   - ✅ Webhook node exists and is ENABLED
   - ✅ Webhook path configured: `ingest-knowledge`
   - ✅ Webhook method: POST

3. **Database**
   - ✅ Database accessible
   - ✅ `webhook_entity` table exists
   - ❌ **NO webhook entry for workflow `c0HYTqTFtktCE3Fk`**
   - ✅ Other workflows have webhook entries (but also not working)

### ❌ Critical Finding

**The workflow has NO webhook entry in the database**, even though:
- Workflow is active
- Webhook node is enabled
- Infrastructure is correct

This indicates n8n is **not registering webhooks** when workflows are activated.

## 📊 Database Schema

```sql
CREATE TABLE "webhook_entity" (
  "workflowId" varchar(36) NOT NULL,
  "webhookPath" varchar NOT NULL,
  "method" varchar NOT NULL,
  "node" varchar NOT NULL,
  "webhookId" varchar,
  "pathLength" integer,
  PRIMARY KEY ("webhookPath", "method")
);
```

**Expected Entry (Missing):**
- `workflowId`: `c0HYTqTFtktCE3Fk`
- `webhookPath`: Should be `{workflowId}/webhook/ingest-knowledge` or similar
- `method`: `POST`

## 🔧 Attempted Solutions

1. ✅ API activation/deactivation
2. ✅ UI automation toggle
3. ✅ Database cleanup + reactivation
4. ✅ Extended wait times (90+ seconds)
5. ❌ **All failed to register webhook**

## 💡 Root Cause Hypothesis

**n8n Community Edition Webhook Registration Bug**

Even with correct configuration, n8n 1.120.4 is not registering webhooks when workflows are activated. Possible causes:

1. **Environment Variable Issue**
   - `N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN` is deprecated
   - May be interfering with registration

2. **n8n Version Bug**
   - Version 1.120.4 may have webhook registration issues
   - May need upgrade/downgrade

3. **Container State**
   - Webhook registration may require container restart
   - In-memory webhook registry may be out of sync

## 🚀 Recommended Next Steps

### Immediate Actions

1. **Restart n8n Container**
   ```bash
   # On EC2
   docker restart n8n
   # Wait 60 seconds
   # Then activate workflow
   ```

2. **Remove Deprecated Environment Variable**
   ```bash
   # On EC2
   # Edit /opt/n8n/.env
   # Remove: N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN=true
   # Restart container
   ```

3. **Check n8n Logs After Restart**
   ```bash
   docker logs n8n | grep -i "webhook.*register" | tail -20
   ```

### Long-Term Solutions

1. **Upgrade n8n Version**
   - Check for webhook registration fixes in newer versions
   - Test in staging first

2. **Alternative Architecture**
   - Use HTTP Request node instead of webhook
   - Poll-based approach
   - Direct Supabase integration

3. **Consider Enterprise Edition**
   - Better API support
   - More reliable webhook management

## 📋 Scripts Created

1. `scripts/execute-rag-webhook-diagnostics.sh` - Full diagnostic suite
2. `scripts/check-n8n-database-schema.js` - Database inspection
3. `scripts/force-webhook-registration-via-database.js` - Database cleanup + reactivation
4. `scripts/ensure-rag-webhook-with-ui-fallback.js` - API + UI automation
5. `scripts/final-rag-webhook-activation.js` - Comprehensive activation

All scripts are ready and will work once webhook registration issue is resolved.

---

**Status:** ⚠️  Requires n8n Container Restart or Version Upgrade  
**Next Action:** Restart n8n container and verify webhook registration

