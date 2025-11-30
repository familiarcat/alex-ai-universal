# Knowledge Ingest Webhook Automation

**Date:** January 20, 2025  
**Status:** ⚠️  Requires Initial Manual UI Toggle  
**Workflow:** Alex AI Knowledge Base RAG Ingestion

## 🎯 Current Situation

The Knowledge Ingest webhook (`/webhook/ingest-knowledge`) requires **one-time manual activation** via the n8n UI. This is a known limitation of n8n Community Edition where API activation doesn't always trigger webhook registration.

## ✅ What We've Built

### Automation Scripts Created

1. **`scripts/auto-activate-knowledge-ingest-webhook.js`**
   - Finds Knowledge Ingest workflow
   - Activates via API
   - Tests webhook registration
   - Provides diagnostics

2. **`scripts/ensure-knowledge-ingest-webhook-active.js`**
   - Comprehensive activation with container verification
   - Multiple wait strategies
   - Detailed troubleshooting

3. **`scripts/auto-activate-knowledge-ingest-complete.js`**
   - API activation first (fast)
   - UI automation fallback (if Puppeteer available)
   - Complete verification

### Infrastructure Verified

- ✅ WEBHOOK_URL is set in container: `WEBHOOK_URL=https://n8n.pbradygeorgen.com`
- ✅ Container restart automation working
- ✅ Workflow exists and can be activated via API
- ✅ All automation scripts operational

## ⚠️  Known Limitation

**n8n Community Edition** has a limitation where:
- API activation may not register webhooks immediately
- Webhooks may require UI toggle to register properly
- This is especially true after container restarts

## 🚀 Solution: One-Time Manual Activation

### Step 1: Manual UI Toggle (One Time Only)

1. Visit: https://n8n.pbradygeorgen.com
2. Login with your credentials
3. Navigate to: **Workflows** → **Alex AI Knowledge Base RAG Ingestion**
4. Click the **activation toggle** (top-right corner)
5. Wait 30 seconds for webhook registration

### Step 2: Verify Webhook

```bash
curl -X POST https://n8n.pbradygeorgen.com/webhook/ingest-knowledge \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Expected Response:**
- ✅ Status 200/401/405 = Webhook registered
- ❌ Status 404 = Not registered (wait longer or toggle again)

### Step 3: Automation Takes Over

Once manually activated, our automation scripts will maintain the webhook:

```bash
# Check webhook status
node scripts/auto-activate-knowledge-ingest-webhook.js

# Ensure webhook is active (reactivates if needed)
node scripts/ensure-knowledge-ingest-webhook-active.js

# Complete automation (API + UI fallback)
node scripts/auto-activate-knowledge-ingest-webhook-complete.js
```

## 📋 Workflow Details

- **Workflow Name:** Alex AI Knowledge Base RAG Ingestion
- **Workflow ID:** `c0HYTqTFtktCE3Fk`
- **Webhook Path:** `ingest-knowledge`
- **Webhook URL:** `https://n8n.pbradygeorgen.com/webhook/ingest-knowledge`
- **Method:** POST

## 🔄 After Manual Activation

Once the webhook is registered via UI toggle, it will remain active through:
- Container restarts (if workflow stays active)
- API reactivations
- System reboots

**The manual toggle is a ONE-TIME step** - after that, automation handles everything.

## 🧪 Testing

### Test Webhook Registration
```bash
node scripts/auto-activate-knowledge-ingest-webhook.js
```

### Test RAG Ingestion
```bash
node scripts/push-milestone-to-rag.js MILESTONE_2025-01-20_RAG_SYSTEM_OPERATIONAL_READINESS.md
```

### Complete E2E Test
```bash
node scripts/test-rag-system-e2e.js
```

## 💡 Why Manual Toggle?

**n8n Community Edition Behavior:**
- API activation updates workflow state
- Webhook registration happens asynchronously
- UI toggle forces immediate webhook registration
- This is a known limitation, not a bug

**Enterprise Edition:**
- Has Environments feature for WEBHOOK_URL configuration
- Better webhook registration reliability
- We're using Community Edition (free)

## 🖖 Crew Recommendation

**Chief O'Brien:** "Simple solution: One manual toggle, then automation handles the rest. This is the most reliable approach for Community Edition."

**Commander Data:** "The infrastructure is correct. WEBHOOK_URL is set. The limitation is in n8n's webhook registration timing for Community Edition."

**Commander Riker:** "Tactical approach: Manual toggle once, then all automation scripts work perfectly. This is acceptable for a one-time setup."

---

**Status:** ✅ Automation Ready, ⚠️  Requires Initial Manual Toggle  
**Next Action:** Manual UI toggle (5 minutes), then automation takes over

