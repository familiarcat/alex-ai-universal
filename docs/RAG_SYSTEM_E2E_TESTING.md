# RAG System End-to-End Testing Guide

**Date:** January 20, 2025  
**Purpose:** Comprehensive testing of RAG system operational status  
**Edition:** Community Edition compatible

## 🧪 Test Suites

### 1. RAG System E2E Test Suite
**Script:** `scripts/test-rag-system-e2e.js`

**Purpose:** Complete end-to-end verification of RAG system

**Tests:**
1. **Community Edition WEBHOOK_URL Configuration**
   - Verifies WEBHOOK_URL is working (even if settings API shows null)
   - Tests webhook endpoint directly (real test)
   - Community Edition compatible

2. **Knowledge Ingest Workflow Status**
   - Checks workflow exists
   - Verifies workflow is active
   - Reports workflow ID

3. **Supabase Connectivity**
   - Tests Supabase API connection
   - Verifies credentials are configured

4. **End-to-End Ingestion Flow**
   - Sends test payload to Knowledge Ingest webhook
   - Verifies ingestion succeeds
   - Tests complete flow: Client → n8n → Supabase

5. **Knowledge Query Functionality**
   - Tests query webhook
   - Verifies query endpoint is operational

**Usage:**
```bash
node scripts/test-rag-system-e2e.js
```

**Requirements:**
- Valid N8N API key in `~/.zshrc`
- SUPABASE_URL configured (optional, for connectivity test)

### 2. Enhanced Knowledge Workflows Harness
**Script:** `scripts/test-knowledge-workflows-harness.js` (enhanced)

**Enhancements:**
- Priority workflow detection (Knowledge Ingest prioritized)
- Longer wait times for priority workflows
- Community Edition WEBHOOK_URL awareness
- Better error reporting

**Usage:**
```bash
node scripts/test-knowledge-workflows-harness.js
```

### 3. Community Edition WEBHOOK_URL Fix
**Script:** `scripts/community-edition-webhook-url-fix.js`

**Purpose:** Verify and diagnose WEBHOOK_URL configuration for Community Edition

**Usage:**
```bash
node scripts/community-edition-webhook-url-fix.js
```

## 📊 Test Results

### Successful Test Output
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 RAG SYSTEM END-TO-END TEST SUITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Test 1: Community Edition WEBHOOK_URL Configuration
   ⚠️  Settings API shows webhookUrl: null
   💡 This is EXPECTED for Community Edition
   ✅ Webhook is registered! (Status: 200)

🔍 Test 2: Knowledge Ingest Workflow Status
   ✅ Workflow found: Knowledge Ingest (Crew Memories => Supabase RAG)
   ✅ Active: true

🔍 Test 3: Supabase Connectivity
   ✅ Supabase API is reachable (Status: 200)

🔍 Test 4: End-to-End Ingestion Flow
   ✅ Ingestion successful! (Status: 200)

🔍 Test 5: Knowledge Query Functionality
   ✅ Query successful! (Status: 200)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TEST RESULTS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Test 1: Community Edition WEBHOOK_URL Configuration
   Status: PASSED

✅ Test 2: Knowledge Ingest Workflow Status
   Status: PASSED

✅ Test 3: Supabase Connectivity
   Status: PASSED

✅ Test 4: End-to-End Ingestion Flow
   Status: PASSED

✅ Test 5: Knowledge Query Functionality
   Status: PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 5 | Passed: 5 | Failed: 0 | Warnings: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 All critical tests passed! RAG system is operational.
```

### Failed Test Output
```
❌ Test 1: Community Edition WEBHOOK_URL Configuration
   Status: FAILED
   Webhook endpoint test: ❌ 404 - Webhook not registered
      Note: WEBHOOK_URL may not be set correctly or container needs restart

💡 Recommendations:

   • Community Edition WEBHOOK_URL Configuration:
     - Restart n8n container on EC2
     - Verify WEBHOOK_URL in /opt/n8n/.env
     - Run: cd /opt/n8n && docker-compose restart n8n
```

## 🔄 Testing Workflow

### Daily Health Check
```bash
# Run E2E test suite
node scripts/test-rag-system-e2e.js

# If failures, run recovery
node scripts/community-edition-webhook-url-fix.js
node scripts/crew-automated-webhook-registration.js
```

### Before Milestone Push
```bash
# Verify RAG system is operational
node scripts/test-rag-system-e2e.js

# If tests pass, proceed with milestone push
node scripts/push-milestone-to-rag.js MILESTONE_*.md
```

### After Container Restart
```bash
# Wait for n8n to initialize
sleep 30

# Run E2E tests
node scripts/test-rag-system-e2e.js

# If webhooks not registered, force re-registration
node scripts/force-webhook-reregistration.js
```

## 🎯 Success Criteria

RAG system is operational when:

1. ✅ WEBHOOK_URL is working (webhook returns 200/401/405, not 404)
2. ✅ Knowledge Ingest workflow is active
3. ✅ Supabase is reachable (if configured)
4. ✅ End-to-end ingestion succeeds
5. ✅ Query functionality works

**Note:** Settings API showing `null` is OK for Community Edition - test webhooks directly!

## 🔧 Troubleshooting

### All Tests Fail
1. Check n8n container is running: `docker ps | grep n8n`
2. Verify WEBHOOK_URL in container: `docker exec n8n env | grep WEBHOOK_URL`
3. Restart n8n container: `cd /opt/n8n && docker-compose restart n8n`
4. Wait 30 seconds and retest

### Webhook Tests Fail (404)
1. Verify workflow is active in n8n UI
2. Check WEBHOOK_URL is set correctly
3. Force webhook re-registration: `node scripts/force-webhook-reregistration.js`
4. Wait 30 seconds and retest

### Ingestion Test Fails
1. Check Knowledge Ingest workflow is active
2. Verify Supabase credentials in n8n workflow
3. Check n8n execution logs for errors
4. Test webhook directly: `curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest ...`

## 📁 Test Reports

Test reports are saved to:
```
.backup-ec2-emergency/rag-e2e-test-{timestamp}.json
```

Reports include:
- Test results for each component
- Detailed error messages
- Recommendations for fixes
- Timestamp and configuration

## 🖖 Crew Integration

The test suite integrates with crew coordination:

- **Commander Data:** Analyzes test results and identifies patterns
- **Lieutenant Commander La Forge:** Verifies infrastructure configuration
- **Chief O'Brien:** Provides pragmatic fixes for failures
- **Commander Riker:** Executes recovery procedures

## 🔄 Continuous Testing

### Automated Testing
```bash
# Add to cron for daily health checks
0 9 * * * cd /path/to/project && node scripts/test-rag-system-e2e.js >> /var/log/rag-health.log 2>&1
```

### CI/CD Integration
```yaml
# Example GitHub Actions
- name: Test RAG System
  run: node scripts/test-rag-system-e2e.js
  
- name: Recover if Failed
  if: failure()
  run: |
    node scripts/community-edition-webhook-url-fix.js
    node scripts/crew-automated-webhook-registration.js
    node scripts/test-rag-system-e2e.js
```

---

**Status:** ✅ Test suite operational  
**Next Action:** Run `node scripts/test-rag-system-e2e.js` to verify RAG system

