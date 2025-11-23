# MCP Service Architecture and Access

**Date:** January 20, 2025  
**Status:** 📋 Documentation  
**Purpose:** Explain where MCP processes are stored and how to access them in the same scope as n8n services

## 📍 Where MCP Processes Are Stored

### Storage Location

**MCP Services are stored as Node.js modules in:**
```
scripts/utils/
├── mcp-workflow-service.js       # Workflow orchestration
├── mcp-memory-storage.js         # Memory storage (Supabase)
├── mcp-context-cache.js          # Context caching
├── mcp-openrouter-optimizer.js   # LLM optimization
├── mcp-scheduler.js              # Workflow scheduling
├── mcp-workflow-orchestrator.js  # Advanced orchestration
└── mcp-monitoring.js             # Execution monitoring
```

**MCP TypeScript Services:**
```
src/domains/context-management/
└── mcp-context-service.ts        # TypeScript context service
```

### Access Pattern

MCP services use a **singleton pattern** with getter functions:

```javascript
// Access MCP services
const { getMCPWorkflowService } = require('./scripts/utils/mcp-workflow-service');
const { getMCPMemoryStorage } = require('./scripts/utils/mcp-memory-storage');
const { getMCPCache } = require('./scripts/utils/mcp-context-cache');
```

## 🔄 Comparison: n8n vs MCP Access

### n8n Services (HTTP-based)

**Location:** Remote server (n8n.pbradygeorgen.com)  
**Access:** HTTP API calls via `N8NClient`

```typescript
// n8n access pattern
import { N8NClient } from './src/domains/workflow-orchestration/infrastructure/n8n-client';

const client = new N8NClient({
  url: 'https://n8n.pbradygeorgen.com',
  apiKey: process.env.N8N_API_KEY
});

// HTTP call
await client.executeWorkflow(workflowId, data);
```

**Storage:** Remote server (EC2 instance)

### MCP Services (Module-based)

**Location:** Local Node.js modules (`scripts/utils/`)  
**Access:** Direct function calls via singleton getters

```javascript
// MCP access pattern
const { getMCPWorkflowService } = require('./scripts/utils/mcp-workflow-service');

const service = getMCPWorkflowService();
service.initialize();

// Direct function call
await service.executeWorkflow(workflow);
```

**Storage:** Local filesystem (Node.js modules)

## 🎯 Unified Service Accessor

To access both n8n and MCP services in the same scope, create a unified service accessor:

### Option 1: Unified Service Wrapper

```javascript
// scripts/utils/unified-service-accessor.js
const { getMCPWorkflowService } = require('./mcp-workflow-service');
const { getMCPMemoryStorage } = require('./mcp-memory-storage');
const { N8NClient } = require('../../src/domains/workflow-orchestration/infrastructure/n8n-client');

class UnifiedServiceAccessor {
  constructor() {
    this.mcpWorkflow = null;
    this.mcpMemory = null;
    this.n8nClient = null;
  }

  // Initialize MCP services
  initializeMCP() {
    this.mcpWorkflow = getMCPWorkflowService();
    this.mcpWorkflow.initialize();
    
    this.mcpMemory = getMCPMemoryStorage();
    this.mcpMemory.initialize();
    
    return true;
  }

  // Initialize n8n client
  initializeN8N(config) {
    this.n8nClient = new N8NClient(config);
    return true;
  }

  // Unified workflow execution (prefers MCP, falls back to n8n)
  async executeWorkflow(workflow, options = {}) {
    if (options.useMCP !== false) {
      // Use MCP
      return await this.mcpWorkflow.executeWorkflow(workflow);
    } else {
      // Use n8n
      return await this.n8nClient.executeWorkflow(workflow.id, workflow.data);
    }
  }

  // Unified memory storage (prefers MCP, falls back to n8n)
  async storeMemory(memoryData, options = {}) {
    if (options.useMCP !== false) {
      // Use MCP
      return await this.mcpMemory.storeMemory(memoryData);
    } else {
      // Use n8n webhook
      return await this.n8nClient.triggerWebhook('knowledge-ingest', memoryData);
    }
  }
}

let instance = null;
function getUnifiedServiceAccessor() {
  if (!instance) {
    instance = new UnifiedServiceAccessor();
  }
  return instance;
}

module.exports = { getUnifiedServiceAccessor };
```

### Option 2: Service Registry Pattern

```javascript
// scripts/utils/service-registry.js
class ServiceRegistry {
  constructor() {
    this.services = {
      mcp: {},
      n8n: {}
    };
  }

  registerMCP(name, service) {
    this.services.mcp[name] = service;
  }

  registerN8N(name, service) {
    this.services.n8n[name] = service;
  }

  getMCP(name) {
    return this.services.mcp[name];
  }

  getN8N(name) {
    return this.services.n8n[name];
  }

  // Get service with fallback
  getService(name, prefer = 'mcp') {
    if (prefer === 'mcp' && this.services.mcp[name]) {
      return this.services.mcp[name];
    }
    if (prefer === 'n8n' && this.services.n8n[name]) {
      return this.services.n8n[name];
    }
    // Fallback
    return this.services.mcp[name] || this.services.n8n[name];
  }
}

const registry = new ServiceRegistry();

// Register MCP services
const { getMCPWorkflowService } = require('./mcp-workflow-service');
const { getMCPMemoryStorage } = require('./mcp-memory-storage');
registry.registerMCP('workflow', getMCPWorkflowService());
registry.registerMCP('memory', getMCPMemoryStorage());

// Register n8n services
const { N8NClient } = require('../../src/domains/workflow-orchestration/infrastructure/n8n-client');
registry.registerN8N('client', new N8NClient({
  url: process.env.N8N_BASE_URL,
  apiKey: process.env.N8N_API_KEY
}));

module.exports = registry;
```

## 📋 Usage Examples

### Example 1: Access Both Services

```javascript
const { getUnifiedServiceAccessor } = require('./scripts/utils/unified-service-accessor');

const services = getUnifiedServiceAccessor();
services.initializeMCP();
services.initializeN8N({
  url: process.env.N8N_BASE_URL,
  apiKey: process.env.N8N_API_KEY
});

// Use MCP
await services.executeWorkflow(workflow, { useMCP: true });

// Use n8n
await services.executeWorkflow(workflow, { useMCP: false });
```

### Example 2: Service Registry

```javascript
const registry = require('./scripts/utils/service-registry');

// Get MCP workflow service
const mcpWorkflow = registry.getMCP('workflow');

// Get n8n client
const n8nClient = registry.getN8N('client');

// Get with fallback (prefers MCP)
const workflowService = registry.getService('workflow', 'mcp');
```

### Example 3: In Dashboard API Routes

```typescript
// dashboard/app/api/workflows/execute/route.ts
import { getUnifiedServiceAccessor } from '@/../../scripts/utils/unified-service-accessor';

export async function POST(request: NextRequest) {
  const services = getUnifiedServiceAccessor();
  services.initializeMCP();
  
  const workflow = await request.json();
  
  // Execute via MCP (preferred)
  const result = await services.executeWorkflow(workflow, { useMCP: true });
  
  return NextResponse.json(result);
}
```

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  (Dashboard, API Routes, Scripts)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│           Unified Service Accessor                       │
│  (Provides unified interface to both systems)           │
└──────┬──────────────────────────────┬───────────────────┘
       │                              │
       ▼                              ▼
┌──────────────┐            ┌─────────────────┐
│  MCP Services│            │   n8n Services  │
│  (Local)     │            │   (Remote)      │
├──────────────┤            ├─────────────────┤
│ • Workflow   │            │ • HTTP Client  │
│ • Memory     │            │ • Webhooks      │
│ • Context    │            │ • Workflows     │
│ • Scheduler  │            │ • API Calls     │
│ • Monitoring │            │                 │
└──────────────┘            └─────────────────┘
       │                              │
       ▼                              ▼
┌──────────────┐            ┌─────────────────┐
│  Local Files │            │  EC2 Server     │
│  scripts/    │            │  n8n.pbrady...  │
└──────────────┘            └─────────────────┘
```

## 🔑 Key Differences

| Aspect | n8n Services | MCP Services |
|--------|--------------|--------------|
| **Storage** | Remote server (EC2) | Local filesystem |
| **Access** | HTTP API calls | Direct function calls |
| **Location** | `n8n.pbradygeorgen.com` | `scripts/utils/` |
| **Pattern** | Client instance | Singleton getter |
| **Dependencies** | Network connection | Node.js modules |
| **Performance** | Network latency | Direct execution |
| **Reliability** | Depends on server | Local, always available |

## 💡 Best Practices

1. **Prefer MCP for new code** - More reliable, faster, no network dependency
2. **Use n8n for legacy workflows** - Until fully migrated
3. **Unified accessor** - Provides consistent interface
4. **Fallback pattern** - MCP first, n8n as fallback
5. **Service registry** - Centralized service management

## 🚀 Next Steps

1. Create unified service accessor
2. Update existing code to use unified accessor
3. Migrate remaining n8n dependencies to MCP
4. Deprecate n8n services once migration complete

---

**Status:** 📋 Documentation Complete  
**Next Action:** Implement unified service accessor

