# Knowledge Workflows Testing Harness

## Overview

Comprehensive testing harness to verify all knowledge-related workflows are operational after deactivation/reactivation cycles. The harness tests webhook registration, ingestion, query, and other RAG operations.

## Test Scripts

### 1. `scripts/test-knowledge-webhooks-only.js`
**Purpose**: Tests webhook endpoints directly without API authentication

**Features**:
- Tests webhook registration (404 check)
- Tests actual workflow operations
- No API key required
- Fast execution

**Usage**:
```bash
node scripts/test-knowledge-webhooks-only.js
```

**Tests**:
- Knowledge Ingest (`/webhook/knowledge-ingest`)
- Knowledge Query (`/webhook/knowledge-query`)
- Knowledge Embed (`/webhook/knowledge-embed`)
- Knowledge Archive (`/webhook/knowledge-archive`)

### 2. `scripts/test-knowledge-workflows-harness.js`
**Purpose**: Full workflow testing with API integration

**Features**:
- Checks workflow existence via API
- Verifies workflow activation status
- Activates inactive workflows
- Tests webhook registration
- Tests workflow operations

**Usage**:
```bash
node scripts/test-knowledge-workflows-harness.js
```

**Requirements**:
- Valid N8N API key in `~/.zshrc`

## Workflow Status

Based on n8n UI, the following workflows should exist:

1. **Knowledge Ingest (Crew Memories → Supabase RAG)**
   - Webhook: `/webhook/knowledge-ingest`
   - Status: Active (but webhook may not be registered)

2. **Knowledge Query (RAG READ - Hybrid Search)**
   - Webhook: `/webhook/knowledge-query`
   - Status: Active (but webhook may not be registered)

3. **Knowledge Embed (Generate AI Embeddings)**
   - Webhook: `/webhook/knowledge-embed`
   - Status: Active (but webhook may not be registered)

4. **Knowledge Archive (RAG DELETE - Soft Delete)**
   - Webhook: `/webhook/knowledge-archive`
   - Status: Active (but webhook may not be registered)

## Common Issues

### Webhooks Returning 404

**Symptom**: All webhooks return 404 even though workflows show as "Active" in UI

**Causes**:
1. Workflows were deactivated and reactivated, but webhooks didn't re-register
2. WEBHOOK_URL not set correctly in n8n environment
3. n8n needs time to register webhooks after activation

**Solutions**:

1. **Force Webhook Re-registration**:
   ```bash
   node scripts/force-webhook-reregistration.js
   ```

2. **Activate Knowledge Ingest Specifically**:
   ```bash
   node scripts/activate-knowledge-ingest-workflow.js
   ```

3. **Toggle Workflows in UI**:
   - Go to n8n UI
   - Toggle each workflow OFF then ON
   - Wait 30-60 seconds for webhook registration

4. **Check WEBHOOK_URL**:
   ```bash
   # Verify WEBHOOK_URL is set in n8n container
   # Should be: https://n8n.pbradygeorgen.com
   ```

## Testing Workflow

### Step 1: Verify Workflows Exist
Check n8n UI to confirm workflows are visible and active.

### Step 2: Test Webhooks
```bash
node scripts/test-knowledge-webhooks-only.js
```

### Step 3: If Webhooks Fail, Force Re-registration
```bash
node scripts/force-webhook-reregistration.js
```

### Step 4: Wait and Retest
```bash
# Wait 30 seconds
sleep 30

# Retest
node scripts/test-knowledge-webhooks-only.js
```

### Step 5: Test Individual Operations
```bash
# Test ingestion
node scripts/test-chat-ingestion.js

# Test milestone push
node scripts/push-milestone-to-rag.js MILESTONE_*.md
```

## Expected Results

### Successful Test
```
✅ Knowledge Ingest
   Registered: ✅
   Operational: ✅
   Status: 200

✅ Knowledge Query
   Registered: ✅
   Operational: ✅
   Status: 200
```

### Failed Test
```
❌ Knowledge Ingest
   Registered: ❌
   Status: 404
   Error: Webhook returned 404 - workflow may be inactive
```

## Automation Integration

The testing harness can be integrated into CI/CD pipelines:

```bash
# In CI/CD script
node scripts/test-knowledge-webhooks-only.js
if [ $? -ne 0 ]; then
  echo "Webhook tests failed - attempting recovery..."
  node scripts/force-webhook-reregistration.js
  sleep 30
  node scripts/test-knowledge-webhooks-only.js
fi
```

## Monitoring

Regular testing ensures workflows remain operational:

```bash
# Daily health check
0 9 * * * cd /path/to/project && node scripts/test-knowledge-webhooks-only.js
```

## Related Scripts

- `scripts/activate-knowledge-ingest-workflow.js` - Activate Knowledge Ingest
- `scripts/force-webhook-reregistration.js` - Force webhook re-registration
- `scripts/test-chat-ingestion.js` - Test ingestion with chat content
- `scripts/push-milestone-to-rag.js` - Push milestones to RAG

## Troubleshooting

### All Webhooks Return 404
1. Check workflows are active in n8n UI
2. Verify WEBHOOK_URL is set correctly
3. Toggle workflows OFF then ON
4. Wait 30-60 seconds
5. Run test again

### Some Webhooks Work, Others Don't
1. Check individual workflow configurations
2. Verify webhook paths match expected values
3. Check n8n execution logs for errors
4. Test each webhook individually

### API Authentication Fails
- Use `test-knowledge-webhooks-only.js` instead
- It doesn't require API authentication
- Tests webhooks directly

