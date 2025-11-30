# Crew-Coordinated Webhook Automation Solution

## Overview

The crew has developed a comprehensive automated webhook registration system that uses n8n configuration from `~/.zshrc` to automatically activate workflows and register webhooks.

## Solution Components

### 1. Enhanced Project Type Detector
**File:** `scripts/enhanced-project-type-detector.js`

**Purpose:** Detects project type with hierarchical tiers:
- **Tier 1:** Category (framework, application, library, tool, monorepo)
- **Tier 2:** Technology (nextjs, react, vue, etc.)
- **Tier 3:** Language (typescript, javascript, python, etc.)

**Features:**
- Monorepo detection
- Framework vs library distinction
- Confidence scoring
- Package manager detection

**Usage:**
```bash
node scripts/enhanced-project-type-detector.js
```

### 2. Crew-Automated Webhook Registration
**File:** `scripts/crew-automated-webhook-registration.js`

**Purpose:** Automatically activates workflows and registers webhooks using n8n configuration from `~/.zshrc`.

**Crew Coordination:**
- **Commander Data:** Analyzes workflow structure and webhook patterns
- **Commander Riker:** Executes tactical activation sequence
- **Lieutenant Commander La Forge:** Monitors infrastructure health
- **Chief O'Brien:** Implements pragmatic re-registration strategy
- **Lieutenant Worf:** Validates security and authentication

**Features:**
- Automatic credential loading from `~/.zshrc`
- Workflow activation with priority handling (Knowledge Ingest first)
- Webhook registration verification
- Progress indicators and detailed logging
- Comprehensive error handling
- Final verification report

**Usage:**
```bash
node scripts/crew-automated-webhook-registration.js
```

## Configuration

### Required Environment Variables in `~/.zshrc`

```bash
# N8N Configuration
export N8N_OWNER_API_KEY="your-api-key-here"
export N8N_API_KEY="your-api-key-here"  # Fallback
export N8N_BASE_URL="https://n8n.pbradygeorgen.com"
```

The script automatically loads these credentials using `loadCrewCredentials()` from `scripts/utils/load-crew-credentials.js`.

## Workflow

### Step 1: Verify Connectivity
- Tests n8n API connection
- Validates API key authentication
- Reports connection status

### Step 2: Fetch Workflows
- Retrieves all workflows from n8n instance
- Handles different API response formats
- Reports workflow count

### Step 3: Identify Webhook Workflows
- Analyzes each workflow structure
- Extracts webhook nodes
- Identifies workflows with webhooks
- Prioritizes Knowledge Ingest workflow

### Step 4: Activate & Register
- Activates inactive workflows
- Forces re-registration for active workflows with unregistered webhooks
- Waits appropriate time for webhook registration
- Uses Chief O'Brien's pragmatic deactivate/reactivate strategy

### Step 5: Final Verification
- Tests all webhook endpoints
- Reports registration status
- Provides comprehensive summary

## Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖖 CREW-COORDINATED AUTOMATED WEBHOOK REGISTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Commander Data: Analyzing n8n configuration...
   Base URL: https://n8n.pbradygeorgen.com
   API Key: eyJhbGciOiJIUzI1NiIs...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: Verifying n8n Connectivity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Commander Riker: Testing API connection...
   ✅ n8n API is reachable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: Fetching Workflows
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Commander Data: Fetching workflow list...
   ✅ Found 12 workflows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: Identifying Webhook Workflows
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Commander Data: Analyzing workflow structure...
   [████████████████████████████████] 100% (12/12)
   ✅ Found 8 workflows with webhooks
   🎯 Prioritized Knowledge Ingest workflow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: Activating Workflows & Registering Webhooks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Commander Riker: Executing activation sequence...
🔧 Chief O'Brien: Implementing pragmatic re-registration strategy...

🎯 Knowledge Ingest (Crew Memories => Supabase RAG)
   ✅ Activated
   Waiting 5s for webhook registration...   ✅ Wait complete

🔧 Project Content Store
   ✅ Activated
   Waiting 2s for webhook registration...   ✅ Wait complete

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5: Final Webhook Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Lieutenant Commander La Forge: Verifying infrastructure health...
🛡️  Lieutenant Worf: Validating security...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FINAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Workflows:
   ✅ Activated: 5
   ⏭️  Already active: 3
   ❌ Failed: 0

Webhooks:
   ✅ Registered: 12/12
   ❌ Unregistered: 0/12

🎉 All webhooks successfully registered!

🖖 Crew coordination complete. All systems operational.
```

## Troubleshooting

### API Unauthorized Error
**Symptom:** `❌ API unauthorized - check API key permissions`

**Solution:**
1. Verify API key in `~/.zshrc`:
   ```bash
   grep N8N_API_KEY ~/.zshrc
   ```
2. Ensure API key has owner permissions
3. Regenerate API key in n8n UI if needed
4. Reload shell configuration:
   ```bash
   source ~/.zshrc
   ```

### Webhooks Not Registering
**Symptom:** Webhooks return 404 after activation

**Solution:**
1. Verify `WEBHOOK_URL` is set on n8n instance
2. Check n8n instance is accessible
3. Ensure workflows are actually active in n8n UI
4. Wait longer for webhook registration (increase wait time in script)

### Workflows Not Found
**Symptom:** `Found 0 workflows`

**Solution:**
1. Verify n8n instance is running
2. Check API key has read permissions
3. Verify workflows exist in n8n UI
4. Check network connectivity to n8n instance

## Integration with Existing Scripts

This solution integrates with:
- `scripts/force-webhook-reregistration.js` - Forced re-registration
- `scripts/activate-all-n8n-workflows.js` - Workflow activation
- `scripts/test-knowledge-workflows-harness.js` - Testing harness

## Best Practices

1. **Always verify API key** before running automation
2. **Prioritize Knowledge Ingest** workflow for RAG system
3. **Wait appropriate time** for webhook registration (5s for priority, 2s for others)
4. **Verify final status** before considering automation complete
5. **Use progress indicators** for long-running operations

## Future Enhancements

- [ ] Retry logic for failed webhook registrations
- [ ] Webhook health monitoring
- [ ] Automatic retry on webhook failure
- [ ] Integration with n8n webhook testing
- [ ] Dashboard for webhook status

## Crew Recommendations

**Commander Data:** "The hierarchical detection system provides precise project categorization, enabling context-aware automation."

**Commander Riker:** "The tactical activation sequence ensures all workflows are properly activated with appropriate prioritization."

**Chief O'Brien:** "The pragmatic re-registration strategy handles edge cases where webhooks don't register on first activation."

**Lieutenant Worf:** "Security validation ensures API keys are properly authenticated before any operations."

**Lieutenant Commander La Forge:** "Infrastructure health monitoring provides visibility into the webhook registration process."

