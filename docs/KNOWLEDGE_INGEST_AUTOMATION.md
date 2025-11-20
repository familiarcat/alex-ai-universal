# Knowledge Ingest Workflow Automation

## Overview

The "Knowledge Ingest" workflow is now automatically included in all webhook automation processes. This ensures that the RAG (Retrieval-Augmented Generation) system is always ready to receive milestone pushes and crew memories.

## Integration Points

### 1. Workflow Activation Scripts

#### `scripts/activate-all-n8n-workflows.js`
- **Priority**: Knowledge Ingest workflow is activated FIRST
- **Wait Time**: 3 seconds after activation for webhook registration
- **Behavior**: All other workflows activate after Knowledge Ingest

#### `scripts/activate-knowledge-ingest-workflow.js` (NEW)
- **Purpose**: Dedicated script for Knowledge Ingest activation
- **Features**:
  - Finds Knowledge Ingest workflow by name or ID
  - Activates the workflow
  - Verifies webhook registration
  - Can be called independently

### 2. Webhook Registration Scripts

#### `scripts/force-webhook-reregistration.js`
- **Priority**: Knowledge Ingest webhook is checked FIRST
- **Wait Time**: 5 seconds after re-activation (longer than other workflows)
- **Behavior**: Knowledge Ingest is processed before other workflows

### 3. Master Activation Script

#### `scripts/update-and-activate-all-workflows.js`
- **Sequence**:
  1. Activates Knowledge Ingest workflow first (with verification)
  2. Activates all other workflows
  3. Forces webhook re-registration (prioritizing Knowledge Ingest)

## Workflow Identification

The scripts identify the Knowledge Ingest workflow by:
- **Name**: Contains "Knowledge Ingest" or "knowledge-ingest" (case-insensitive)
- **ID**: `Ffdgv5Zd8hGeHJGe` (if known)
- **Webhook Path**: `/webhook/knowledge-ingest`

## Usage

### Activate Knowledge Ingest Only
```bash
node scripts/activate-knowledge-ingest-workflow.js
```

### Activate All Workflows (Knowledge Ingest prioritized)
```bash
node scripts/activate-all-n8n-workflows.js
```

### Force Webhook Re-registration (Knowledge Ingest prioritized)
```bash
node scripts/force-webhook-reregistration.js
```

### Complete Workflow Activation (includes Knowledge Ingest)
```bash
node scripts/update-and-activate-all-workflows.js <api-key>
```

## Benefits

1. **Reliability**: Knowledge Ingest is always activated first, ensuring RAG system is ready
2. **Priority**: Longer wait times ensure webhook registration completes
3. **Verification**: Dedicated script verifies webhook is actually registered
4. **Automation**: No manual intervention needed for Knowledge Ingest activation

## Integration with Milestone Push

The `scripts/push-milestone-to-rag.js` script automatically:
1. Pushes milestone to GitHub
2. Attempts to push to RAG via Knowledge Ingest webhook
3. Saves payload locally if webhook is inactive

When automation scripts run, they ensure Knowledge Ingest is active, so subsequent milestone pushes will succeed.

## Troubleshooting

If Knowledge Ingest webhook is not registering:

1. **Check workflow is active**:
   ```bash
   node scripts/activate-knowledge-ingest-workflow.js
   ```

2. **Force re-registration**:
   ```bash
   node scripts/force-webhook-reregistration.js
   ```

3. **Verify webhook manually**:
   ```bash
   curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

4. **Check n8n UI**: Ensure workflow is active and webhook node is configured correctly

## Related Scripts

- `scripts/push-milestone-to-rag.js` - Pushes milestones to RAG via Knowledge Ingest
- `scripts/activate-all-n8n-workflows.js` - Activates all workflows (prioritizes Knowledge Ingest)
- `scripts/force-webhook-reregistration.js` - Forces webhook re-registration (prioritizes Knowledge Ingest)
- `scripts/update-and-activate-all-workflows.js` - Master activation script

## Notes

- Knowledge Ingest workflow ID: `Ffdgv5Zd8hGeHJGe` (if known)
- Webhook path: `/webhook/knowledge-ingest`
- Wait times are longer for Knowledge Ingest to ensure proper registration
- All automation scripts now include Knowledge Ingest in their processes

