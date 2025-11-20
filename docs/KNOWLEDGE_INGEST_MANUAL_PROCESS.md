# Knowledge Ingest Webhook - Manual Process Documentation

**Date:** January 20, 2025  
**Process:** Manual UI Toggle (Most Reliable Method)

## 📋 Exact Process (As Demonstrated)

Based on the UI screenshots showing the successful activation process:

### Step-by-Step Manual Process

1. **Navigate to n8n Workflows**
   - Visit: https://n8n.pbradygeorgen.com
   - Go to: **Workflows** section

2. **Locate Knowledge Ingest Workflow**
   - Find: **"Alex AI Knowledge Base RAG Ingestion"**
   - Note: There may be a duplicate "(Clean)" version - use the main one

3. **Deactivate Workflow (Toggle OFF)**
   - Click the **toggle switch** on the workflow card
   - Wait for status to change to **"Inactive"**
   - Toggle should show: White circle on left (OFF position)

4. **Wait for Deactivation**
   - Wait 3-5 seconds for the deactivation to complete
   - Status should show: **"Inactive"** in grey text

5. **Activate Workflow (Toggle ON)**
   - Click the **toggle switch** again
   - Wait for status to change to **"Active"**
   - Toggle should show: White circle on right (ON position)
   - Status should show: **"Active"** in green text

6. **Wait for Webhook Registration**
   - Wait **30 seconds** for webhook to register
   - This is critical - webhooks register asynchronously

7. **Verify Webhook**
   ```bash
   curl -X POST https://n8n.pbradygeorgen.com/webhook/ingest-knowledge \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
   - ✅ Status 200/401/405 = Webhook registered
   - ❌ Status 404 = Not registered (wait longer or retry)

## 🎯 Why Manual UI Toggle Works

**n8n Community Edition Behavior:**
- UI toggle triggers immediate webhook registration
- API activation may not trigger webhook registration immediately
- This is a known limitation of the Community Edition

**The UI toggle does something the API doesn't:**
- Forces immediate webhook registration
- Updates internal webhook registry
- Triggers webhook endpoint creation

## 🤖 Automation Attempts

We've created multiple automation scripts that replicate this process:

### Scripts Created

1. **`scripts/activate-knowledge-ingest-exact-process.js`**
   - Replicates the exact deactivate/reactivate process
   - Uses API calls to match manual steps
   - ⚠️  Still doesn't register webhook (API limitation)

2. **`scripts/auto-activate-knowledge-ingest-complete.js`**
   - Tries API first, then UI automation fallback
   - Requires Puppeteer for UI automation

3. **`scripts/ensure-knowledge-ingest-webhook-active.js`**
   - Comprehensive activation with verification
   - Multiple wait strategies

### Current Status

- ✅ **API Activation:** Works (workflow becomes active)
- ❌ **Webhook Registration:** Doesn't work via API
- ✅ **UI Toggle:** Works reliably (webhook registers)

## 💡 Recommended Approach

### For Initial Setup (One Time)

**Use Manual UI Toggle:**
1. Follow the exact process above
2. Verify webhook is registered
3. Once registered, it stays active

### For Ongoing Automation

**After manual activation, automation works:**
- Workflow stays active through container restarts
- API can reactivate if workflow becomes inactive
- Webhook remains registered once initially set up

## 🔄 After Manual Activation

Once the webhook is registered via UI toggle:

### Automation Scripts Work

```bash
# Check webhook status
node scripts/auto-activate-knowledge-ingest-webhook.js

# Ensure workflow is active
node scripts/ensure-knowledge-ingest-webhook-active.js

# Test RAG ingestion
node scripts/push-milestone-to-rag.js MILESTONE_FILE.md
```

### Webhook Persistence

- ✅ Webhook stays registered through container restarts
- ✅ Webhook stays registered if workflow stays active
- ⚠️  If workflow becomes inactive, may need UI toggle again

## 📊 Workflow Details

- **Workflow Name:** Alex AI Knowledge Base RAG Ingestion
- **Workflow ID:** `c0HYTqTFtktCE3Fk`
- **Webhook Path:** `ingest-knowledge`
- **Webhook URL:** `https://n8n.pbradygeorgen.com/webhook/ingest-knowledge`
- **Method:** POST

## 🖖 Crew Analysis

**Chief O'Brien:** "The manual UI toggle is the most reliable method. Once done, automation handles the rest. Simple and effective."

**Commander Data:** "The API activation updates workflow state but doesn't trigger webhook registration. The UI toggle does something additional that the API doesn't expose."

**Lieutenant Commander La Forge:** "This is a known n8n Community Edition limitation. The infrastructure is correct - WEBHOOK_URL is set. The limitation is in the webhook registration mechanism."

---

**Status:** ✅ Process Documented, ⚠️  Requires Manual UI Toggle  
**Frequency:** One-time setup, then automation takes over

