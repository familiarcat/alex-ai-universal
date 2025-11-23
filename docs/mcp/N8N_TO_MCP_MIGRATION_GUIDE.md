# N8N to MCP Migration Guide

**Date:** January 20, 2025  
**Status:** ✅ Complete  
**Purpose:** Comprehensive guide for migrating all n8n workflows to MCP architecture

## 🎯 Migration Overview

This guide ensures **100% workflow migration** from n8n to MCP, leaving no workflows behind.

## 📋 Migration Process

### Step 1: Inventory All N8N Workflows

**Script:** `scripts/migrate-n8n-workflows-to-mcp.js`

```bash
node scripts/migrate-n8n-workflows-to-mcp.js
```

**What it does:**
- Fetches all workflows from n8n API
- Lists total count
- Identifies workflow types

### Step 2: Convert N8N to MCP Format

**Conversion Mapping:**

| N8N Node Type | MCP Node Type | Notes |
|---------------|---------------|-------|
| HTTP Request | `workflowExecute` | API calls |
| Webhook | `workflowExecute` | Webhook triggers |
| Supabase | `supabaseQuery` / `supabaseInsert` | Database operations |
| OpenAI/LLM | `llmCall` | AI operations |
| Memory/Store | `memoryStore` | Memory operations |
| Others | `transform` | Data transformation |

**Conversion Logic:**
- N8N nodes → MCP steps
- N8N connections → MCP `next` array
- N8N parameters → MCP `config`
- Preserves metadata (original ID, name, etc.)

### Step 3: Migrate to MCP

**Process:**
1. Convert each workflow
2. Store in MCP workflow service
3. Save to `workflows/migrated/` directory
4. Verify migration

### Step 4: Verification

**Checks:**
- ✅ All workflows converted
- ✅ All workflows stored in MCP
- ✅ All workflows saved to disk
- ✅ Migration report generated

## 🔄 Workflow Mapping

### Critical Workflows (Must Migrate)

1. **Knowledge Ingest** → `memoryStore` workflow
2. **Knowledge Query** → `memoryQuery` workflow
3. **Project Content Store** → `supabaseInsert` workflow
4. **Project Content Retrieve** → `supabaseQuery` workflow
5. **Crew Coordination** → `llmCall` workflow
6. **Crew Memory Storage** → `memoryStore` workflow

### Standard Workflows

- All other n8n workflows → Converted to equivalent MCP workflows
- Preserved in `workflows/migrated/` directory
- Metadata includes original n8n ID for reference

## 📊 Migration Report

After migration, a report is generated at:
`workflows/migration-report.json`

**Report Structure:**
```json
{
  "timestamp": "2025-01-20T...",
  "totalWorkflows": 52,
  "migrated": [...],
  "failed": [...],
  "skipped": [...],
  "summary": {
    "total": 52,
    "migrated": 50,
    "failed": 2,
    "successRate": "96.2%"
  }
}
```

## 🛠️ Manual Migration (If Needed)

### For Failed Workflows

1. **Identify Failed Workflow:**
   ```bash
   # Check migration report
   cat workflows/migration-report.json | jq '.failed'
   ```

2. **Manual Conversion:**
   - Review n8n workflow structure
   - Map nodes to MCP node types
   - Create MCP workflow manually
   - Test execution

3. **Re-run Migration:**
   ```bash
   # Re-run for specific workflow
   node scripts/migrate-n8n-workflows-to-mcp.js
   ```

## ✅ Post-Migration Checklist

- [ ] All workflows migrated
- [ ] Migration report reviewed
- [ ] Failed workflows addressed
- [ ] MCP workflows tested
- [ ] n8n workflows backed up
- [ ] Documentation updated
- [ ] Team notified

## 🔍 Verification Commands

### Check Migrated Workflows

```bash
# List all migrated workflows
ls -la workflows/migrated/

# View migration report
cat workflows/migration-report.json | jq '.summary'

# Test MCP workflow
node scripts/mcp-execute-workflow.js workflows/migrated/[workflow-name].json
```

### Compare N8N vs MCP

```bash
# Count n8n workflows
node scripts/list-all-n8n-workflows.js | jq '.workflows | length'

# Count migrated workflows
ls workflows/migrated/*.json | wc -l
```

## 🚨 Troubleshooting

### Workflow Conversion Fails

**Issue:** Node type not recognized  
**Solution:** Add mapping in `convertN8NToMCP()` function

### MCP Storage Fails

**Issue:** MCP service not initialized  
**Solution:** Ensure MCP services are running and credentials are set

### Missing Workflows

**Issue:** Some workflows not in migration report  
**Solution:** Check n8n API access, verify all workflows are active

## 📈 Success Metrics

- **Target:** 100% migration success rate
- **Acceptable:** 95%+ migration success rate
- **Action Required:** < 95% success rate

## 🎯 Next Steps After Migration

1. ✅ Verify all workflows migrated
2. ✅ Test critical workflows
3. ✅ Update client code to use MCP
4. ✅ Monitor for 24-48 hours
5. ✅ Decommission n8n (when ready)

---

**Status:** ✅ Migration Guide Complete  
**Next Action:** Run migration script

