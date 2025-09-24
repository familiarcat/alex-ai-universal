# 🚀 N8N Integration Guide for Alex AI Universal

**Version:** 1.0  
**Last Updated:** January 18, 2025  
**Purpose:** Comprehensive guide for N8N workflow management and bi-directional sync

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [N8N API Reference](#n8n-api-reference)
3. [Bi-Directional Sync System](#bi-directional-sync-system)
4. [Workflow Organization Schema](#workflow-organization-schema)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Integration Patterns](#integration-patterns)
7. [Best Practices](#best-practices)

---

## 🎯 **Overview**

Alex AI Universal integrates with N8N for workflow automation, crew coordination, and anti-hallucination systems. This guide provides comprehensive documentation for managing N8N workflows, bi-directional synchronization, and troubleshooting common issues.

### **Key Components:**
- **Bi-directional Sync System:** Keeps local and remote workflows synchronized
- **Workflow Organization:** Professional naming schema and categorization
- **Crew Integration:** 9 specialized AI crew members with unique workflows
- **Anti-Hallucination System:** Multi-layered hallucination prevention
- **OpenRouter Integration:** Dynamic LLM optimization

---

## 🔌 **N8N API Reference**

### **Authentication**
```bash
# Environment Variables (from ~/.zshrc)
export N8N_BASE_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="your-api-key-here"
```

### **Core Endpoints**

#### **1. List Workflows**
```bash
GET /api/v1/workflows
Headers: X-N8N-API-KEY: your-api-key
```

#### **2. Get Specific Workflow**
```bash
GET /api/v1/workflows/{workflowId}
Headers: X-N8N-API-KEY: your-api-key
```

#### **3. Create Workflow**
```bash
POST /api/v1/workflows
Headers: X-N8N-API-KEY: your-api-key
Content-Type: application/json

{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {}
}
```

#### **4. Update Workflow**
```bash
PUT /api/v1/workflows/{workflowId}
Headers: X-N8N-API-KEY: your-api-key
Content-Type: application/json

{
  "name": "Updated Name",
  "nodes": [...],
  "connections": {...},
  "settings": {}
}
```

#### **5. Activate/Deactivate Workflow**
```bash
POST /api/v1/workflows/{workflowId}/activate
Headers: X-N8N-API-KEY: your-api-key
Content-Type: application/json

{
  "active": true
}
```

#### **6. Get Executions**
```bash
GET /api/v1/executions?workflowId={workflowId}&limit=10
Headers: X-N8N-API-KEY: your-api-key
```

### **Common Response Formats**

#### **Workflow Object**
```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "active": true,
  "nodes": [...],
  "connections": {...},
  "settings": {},
  "createdAt": "2025-01-18T00:00:00.000Z",
  "updatedAt": "2025-01-18T00:00:00.000Z"
}
```

#### **Execution Object**
```json
{
  "id": "execution-id",
  "workflowId": "workflow-id",
  "startedAt": "2025-01-18T00:00:00.000Z",
  "stoppedAt": "2025-01-18T00:00:01.000Z",
  "finished": true,
  "mode": "webhook",
  "data": {...}
}
```

---

## 🔄 **Bi-Directional Sync System**

### **Overview**
The bi-directional sync system maintains consistency between local workflow files and the N8N instance, ensuring that changes in either location are properly synchronized.

### **Sync Commands**

#### **Full Sync**
```bash
node scripts/bidirectional-n8n-sync.js sync
```

#### **Download Only (Remote → Local)**
```bash
node scripts/bidirectional-n8n-sync.js download
```

#### **Upload Only (Local → Remote)**
```bash
node scripts/bidirectional-n8n-sync.js upload
```

#### **Status Check**
```bash
node scripts/bidirectional-n8n-sync.js status
```

### **Sync Process**

1. **Load Local Workflows:** Scans category-based directories
2. **Load Remote Workflows:** Fetches from N8N API
3. **Compare Workflows:** Identifies differences by name and timestamp
4. **Sync Operations:**
   - **Upload:** Local changes → Remote
   - **Download:** Remote changes → Local
   - **Update:** Merge differences
5. **Generate Report:** Detailed sync results

### **Workflow Categories**

```
packages/core/src/
├── crew-workflows/          # Individual crew member workflows
├── system-workflows/        # System-level coordination
├── coordination-workflows/  # Crew collaboration
├── anti-hallucination-workflows/  # Hallucination prevention
├── project-workflows/       # Project-specific workflows
└── utility-workflows/       # Generic utility workflows
```

---

## 🏗️ **Workflow Organization Schema**

### **Naming Convention**
```
{CATEGORY} - {NAME} - {DESCRIPTION} - {VERSION} - Production
```

### **Categories**

#### **CREW Workflows**
- **Captain Jean-Luc Picard:** Strategic Leadership
- **Commander Data:** Android Analytics
- **Commander William Riker:** Tactical Execution
- **Counselor Deanna Troi:** User Experience
- **Dr. Beverly Crusher:** Health & Diagnostics
- **Lieutenant Commander Geordi La Forge:** Infrastructure
- **Lieutenant Uhura:** Communications & I/O
- **Lieutenant Worf:** Security & Compliance
- **Quark:** Business Intelligence & Budget Optimization

#### **SYSTEM Workflows**
- **Mission Control:** Core system coordination
- **Enhanced Mission Control:** Advanced coordination
- **OpenRouter Agent Coordination:** LLM optimization

#### **COORDINATION Workflows**
- **Democratic Collaboration:** Crew decision-making
- **Observation Lounge:** Crew stand-up meetings

#### **ANTI-HALLUCINATION Workflows**
- **Crew Detection:** Hallucination detection system
- **HTTP Handler:** Fallback HTTP-based system
- **Monitoring Dashboard:** Real-time monitoring

#### **PROJECT Workflows**
- **Alex AI - Job Opportunities:** Job matching system
- **Alex AI - MCP Enhancement:** MCP integration
- **Alex AI - Crew Integration:** Crew coordination
- **Alex AI - Resume Analysis:** Resume processing
- **Alex AI - Contact Management:** Contact handling

#### **UTILITY Workflows**
- **AI Controller:** Generic AI operations
- **Crew Management:** Crew administration
- **Generic Sub-workflow:** Reusable components

---

## 🔧 **Troubleshooting Guide**

### **Common Issues**

#### **1. "Unrecognized node type" Error**
**Problem:** Workflow fails to activate due to missing node types
**Solution:**
```bash
# Check for problematic nodes
node scripts/check-openrouter-workflows.js

# Fix by converting to HTTP requests
node scripts/fix-anti-hallucination-workflow.js
```

#### **2. Bi-Directional Sync Not Working**
**Problem:** Local and remote workflows out of sync
**Solution:**
```bash
# Diagnose sync issues
node scripts/diagnose-sync-issues.js

# Force download of remote workflows
node scripts/bidirectional-n8n-sync.js download

# Force upload of local workflows
node scripts/bidirectional-n8n-sync.js upload
```

#### **3. Workflow Connections Not Displaying**
**Problem:** N8N UI shows disconnected nodes
**Solution:**
```bash
# Fix Quark workflow connections
node scripts/fix-quark-ui-connections.js

# Refresh workflow UI
node scripts/refresh-quark-workflow-ui.js
```

#### **4. Empty Response from Workflows**
**Problem:** Webhooks return empty responses
**Solution:**
```bash
# Debug workflow execution
node scripts/debug-quark-workflow.js

# Test execution flow
node scripts/test-quark-execution-flow.js

# Verify data flow
node scripts/test-quark-data-flow.js
```

### **Debug Commands**

#### **Check Workflow Status**
```bash
node scripts/debug-quark-workflow.js
```

#### **Verify Execution Flow**
```bash
node scripts/verify-quark-execution.js
```

#### **Test Data Flow**
```bash
node scripts/test-quark-data-flow.js
```

#### **Check OpenRouter Integration**
```bash
node scripts/check-openrouter-workflows.js
```

---

## 🔗 **Integration Patterns**

### **OpenRouter Integration**

#### **HTTP Request Pattern**
```json
{
  "url": "https://api.openrouter.ai/api/v1/chat/completions",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_OPENROUTER_API_KEY",
    "Content-Type": "application/json"
  },
  "body": {
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [
      {
        "role": "user",
        "content": "{{ $json.prompt }}"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

#### **Dynamic Model Selection**
```javascript
// Function node for model optimization
const businessContext = $input.first().json.businessContext;
const complexity = businessContext.complexity;
const domain = businessContext.domain;

let model = 'anthropic/claude-3.5-sonnet'; // Default

if (domain === 'financial' && complexity === 'high') {
  model = 'openai/gpt-4-turbo';
} else if (domain === 'technical') {
  model = 'anthropic/claude-3-opus';
}

return { model, businessContext };
```

### **Supabase Integration**

#### **Memory Retrieval Pattern**
```json
{
  "url": "https://rpkkkbufdwxmjaerbhbn.supabase.co/rest/v1/crew_memories",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    "apikey": "YOUR_SUPABASE_ANON_KEY"
  },
  "params": {
    "crew_member": "eq.{{ $json.crewMember }}",
    "select": "*",
    "order": "created_at.desc",
    "limit": "10"
  }
}
```

#### **Memory Storage Pattern**
```json
{
  "url": "https://rpkkkbufdwxmjaerbhbn.supabase.co/rest/v1/crew_memories",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY",
    "apikey": "YOUR_SUPABASE_ANON_KEY",
    "Content-Type": "application/json"
  },
  "body": {
    "crew_member": "{{ $json.crewMember }}",
    "memory_type": "interaction",
    "content": "{{ $json.response }}",
    "context": "{{ $json.businessContext }}",
    "timestamp": "{{ new Date().toISOString() }}"
  }
}
```

### **Webhook Integration**

#### **Webhook Trigger Pattern**
```json
{
  "httpMethod": "POST",
  "path": "crew-{{ $json.crewMember.toLowerCase() }}",
  "responseMode": "responseNode",
  "options": {}
}
```

#### **Response Pattern**
```json
{
  "respondWith": "json",
  "responseBody": "={{ { \"crew_member\": \"{{ $json.crewMember }}\", \"response\": $json.choices[0].message.content, \"timestamp\": new Date().toISOString() } }}",
  "options": {}
}
```

---

## 📚 **Best Practices**

### **Workflow Design**

1. **Modular Architecture:** Break complex workflows into smaller, reusable components
2. **Error Handling:** Include error handling nodes for robust operation
3. **Logging:** Add logging nodes for debugging and monitoring
4. **Validation:** Validate input data before processing
5. **Rate Limiting:** Implement rate limiting for API calls

### **Naming Conventions**

1. **Descriptive Names:** Use clear, descriptive names for workflows and nodes
2. **Consistent Formatting:** Follow the established naming schema
3. **Version Control:** Include version information in workflow names
4. **Category Prefixes:** Use category prefixes for easy organization

### **Performance Optimization**

1. **Parallel Processing:** Use parallel branches for independent operations
2. **Caching:** Implement caching for frequently accessed data
3. **Resource Management:** Monitor and optimize resource usage
4. **Batch Processing:** Group similar operations together

### **Security Considerations**

1. **API Keys:** Store API keys securely in N8N credentials
2. **Input Validation:** Validate all input data
3. **Access Control:** Implement proper access controls
4. **Audit Logging:** Log all workflow executions

### **Maintenance**

1. **Regular Sync:** Run bi-directional sync regularly
2. **Monitor Performance:** Track workflow performance metrics
3. **Update Dependencies:** Keep N8N and node types updated
4. **Backup Workflows:** Maintain backups of critical workflows

---

## 🎯 **Quick Reference**

### **Essential Commands**
```bash
# Sync workflows
node scripts/bidirectional-n8n-sync.js sync

# Check workflow status
node scripts/debug-quark-workflow.js

# Fix connection issues
node scripts/fix-quark-ui-connections.js

# Diagnose problems
node scripts/diagnose-sync-issues.js
```

### **Important URLs**
- **N8N Instance:** https://n8n.pbradygeorgen.com
- **API Documentation:** https://docs.n8n.io/api/
- **Community Forum:** https://community.n8n.io/

### **Environment Variables**
```bash
export N8N_BASE_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="your-api-key"
export OPENROUTER_API_KEY="your-openrouter-key"
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-key"
```

---

## 🚀 **Conclusion**

This guide provides comprehensive documentation for managing N8N workflows in the Alex AI Universal system. By following these patterns and best practices, you can maintain a robust, scalable workflow automation system that integrates seamlessly with your AI crew and anti-hallucination systems.

For additional support or questions, refer to the troubleshooting section or consult the N8N community documentation.

---

**Last Updated:** January 18, 2025  
**Version:** 1.0  
**Maintainer:** Alex AI Universal Development Team
