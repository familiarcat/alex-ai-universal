# 🔄 n8n to MCP Workflow Translation Guide

**Date:** January 21, 2025  
**Status:** ✅ Complete - 50 Workflows Translated

---

## 📊 Translation Summary

### Statistics
- **Total n8n Workflows:** 52
- **Active Workflows:** 50
- **Converted to MCP:** 50
- **Total Webhook Execution Points:** 48

### Output Location
All translated workflows are saved in: `workflows/translated-from-n8n/`

---

## 🔄 Translation Process

### What Was Translated

1. **Workflow Structure**
   - Workflow metadata (name, description, version)
   - Node definitions and connections
   - Active/inactive status

2. **Node Types**
   - n8n nodes → MCP node types
   - Parameters preserved (sensitive data redacted)
   - Position and layout maintained

3. **Webhook Execution Points**
   - All webhook paths identified
   - MCP execution endpoints documented
   - Execution methods documented

### Node Type Mapping

| n8n Node Type | MCP Node Type | Notes |
|--------------|---------------|-------|
| `n8n-nodes-base.webhook` | `mcp.webhook` | Webhook triggers |
| `n8n-nodes-base.httpRequest` | `mcp.http` | HTTP requests |
| `n8n-nodes-base.function` | `mcp.transform` | Data transformation |
| `n8n-nodes-base.code` | `mcp.transform` | Code execution |
| `n8n-nodes-base.supabase` | `mcp.database` | Database operations |
| `n8n-nodes-base.postgres` | `mcp.database` | PostgreSQL operations |
| `n8n-nodes-base.if` | `mcp.logic` | Conditional logic |
| `n8n-nodes-base.set` | `mcp.transform` | Data setting |
| `n8n-nodes-base.respondToWebhook` | `mcp.response` | Webhook responses |
| `n8n-nodes-base.executeCommand` | `mcp.execute` | Command execution |

---

## 📍 Webhook Execution in MCP

### Execution Methods

#### Method 1: Direct Webhook Execution

Execute a webhook directly via MCP API:

```bash
curl -X POST https://mcp.pbradygeorgen.com/api/workflows/execute \
  -H "X-MCP-API-KEY: [API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookPath": "/webhook/knowledge-ingest",
    "method": "POST",
    "payload": {
      "session_id": "test-123",
      "title": "Test Document",
      "content": "Test content"
    }
  }'
```

#### Method 2: Workflow Execution

Execute a workflow that contains webhooks:

```bash
curl -X POST https://mcp.pbradygeorgen.com/api/workflows/execute \
  -H "X-MCP-API-KEY: [API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "mcp-c0HYTqTFtktCE3Fk",
    "input": {
      "session_id": "test-123",
      "title": "Test Document"
    }
  }'
```

### Key Webhook Execution Points

All webhook paths from n8n are preserved in MCP. Common webhooks include:

- `/webhook/knowledge-ingest` - RAG knowledge ingestion
- `/webhook/knowledge-query` - RAG knowledge query
- `/webhook/crew-*` - Crew member workflows
- `/webhook/project-content-*` - Project content management
- `/webhook/observation-lounge` - Crew coordination
- `/webhook/anti-hallucination` - Anti-hallucination detection

### Webhook Path Mapping

| n8n Webhook Path | MCP Execution Endpoint |
|-----------------|------------------------|
| `/webhook/knowledge-ingest` | `/api/workflows/execute?webhook=knowledge-ingest` |
| `/webhook/knowledge-query` | `/api/workflows/execute?webhook=knowledge-query` |
| `/webhook/crew-*` | `/api/workflows/execute?webhook=crew-*` |
| `/webhook/project-content-*` | `/api/workflows/execute?webhook=project-content-*` |

---

## 🔧 Differences Between n8n and MCP

### Authentication

**n8n:**
- Uses `X-N8N-API-KEY` header
- API key from n8n instance

**MCP:**
- Uses `X-MCP-API-KEY` header
- API key from MCP server

### Webhook Registration

**n8n:**
- Webhooks must be registered (known issue)
- Requires workflow to be active
- Production URLs only work when workflow is active

**MCP:**
- Webhooks execute directly via API
- No registration required
- Always available when workflow exists

### Workflow Execution

**n8n:**
- Execute via webhook trigger
- Execute via API (workflow ID)
- Execute via UI

**MCP:**
- Execute via API (webhook path or workflow ID)
- Execute via dashboard UI
- Direct API calls

---

## 📚 Translation Files

### Individual Workflows
Each workflow is saved as: `workflows/translated-from-n8n/mcp-[workflow-id].json`

### Documentation Files
- `WEBHOOK_EXECUTION_POINTS.md` - Complete webhook execution documentation
- `TRANSLATION_SUMMARY.json` - Translation statistics and summary

---

## ✅ Next Steps

1. **Review Translated Workflows**
   - Check each workflow for accuracy
   - Verify node connections
   - Test webhook execution points

2. **Test Webhook Execution**
   - Test each webhook via MCP API
   - Verify authentication
   - Check response format

3. **Deploy to MCP**
   - Import workflows to MCP system
   - Activate workflows
   - Test end-to-end

4. **Update Integration Points**
   - Update code that calls n8n webhooks
   - Change to MCP API endpoints
   - Update authentication headers

---

## 🎯 Key Advantages of MCP

1. **No Webhook Registration Issues**
   - Webhooks execute directly
   - No registration required
   - Always available

2. **Better API Integration**
   - RESTful API design
   - Consistent authentication
   - Better error handling

3. **Enhanced Features**
   - Crew coordination
   - Cost optimization
   - Vector search
   - Better monitoring

---

## 📝 Notes

- All sensitive data (passwords, API keys) has been redacted in translated workflows
- Original workflow IDs are preserved in metadata
- Webhook paths are preserved exactly as in n8n
- Node positions and connections are maintained

---

**Status:** ✅ Translation Complete - Ready for Deployment

