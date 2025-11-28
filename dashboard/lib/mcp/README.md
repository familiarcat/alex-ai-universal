# 🖖 Universal MCP Access System

Unified, secure, efficient access to all MCP services from both Next.js API routes and Node.js CLI scripts.

## Features

- ✅ **Secure**: Never logs or exposes credentials
- ✅ **Efficient**: Connection pooling, credential caching, lazy loading
- ✅ **Universal**: Works in Next.js (API routes) and Node.js (CLI scripts)
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Validated**: Automatic credential validation
- ✅ **Sanitized**: Error messages never expose sensitive data

## Quick Start

### Next.js API Routes

```typescript
import { mcp } from '@/lib/mcp';

// Get credentials
const creds = mcp.getCredentials();

// Access Supabase (Local MCP)
const supabase = mcp.supabase();
const { data } = await supabase.from('knowledge_base').select('*');

// Trigger n8n webhook
await mcp.n8n.webhook('crew-memory-store', { 
  crew: 'Data',
  memory: '...'
});

// Call OpenRouter
const models = await mcp.openRouter.call('/models', { method: 'GET' });

// Health check
const health = await mcp.health();
```

### Node.js CLI Scripts

```javascript
const { mcp } = require('../../scripts/lib/mcp-cli-utils');

// Get credentials
const creds = mcp.getCredentials();

// Access Supabase
const supabase = mcp.supabase();
const { data } = await supabase.from('knowledge_base').select('*');

// Trigger n8n webhook
await mcp.n8n.webhook('crew-memory-store', { data });

// Call OpenRouter
const models = await mcp.openRouter.call('/models', { method: 'GET' });
```

## Credential Configuration

All credentials are loaded from `~/.zshrc` (with fallback to environment variables).

### Required Credentials

Add these to your `~/.zshrc`:

```bash
# Supabase (Local MCP)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"  # Optional, for admin operations

# n8n (Workflow Engine)
export N8N_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="your-n8n-api-key"
export N8N_OWNER_API_KEY="your-owner-api-key"  # Optional, for owner-level operations
export N8N_WEBHOOK_URL="https://n8n.pbradygeorgen.com/webhook"

# OpenRouter (LLM API)
export OPENROUTER_API_KEY="your-openrouter-api-key"

# Remote MCP Server (Optional)
export MCP_URL="https://mcp.pbradygeorgen.com"
export MCP_API_KEY="your-mcp-api-key"
```

### Priority Order

1. **Process environment variables** (highest priority)
2. **~/.zshrc exports**
3. **Defaults** (for URLs only)

## API Reference

### Credential Management

```typescript
import { 
  getMCPCredentials, 
  getMCPCredentialsSafe, 
  getCredentialStatus,
  validateCredentials 
} from '@/lib/mcp';

// Get credentials (throws if missing)
const creds = getMCPCredentials();

// Get credentials safely (returns null if invalid)
const creds = getMCPCredentialsSafe();

// Get credential status (for diagnostics)
const status = getCredentialStatus();
// Returns: { loaded, hasSupabase, hasN8n, hasOpenRouter, hasRemoteMCP, missing, warnings }

// Validate credentials
const validation = validateCredentials(creds);
// Returns: { isValid, missing, warnings }
```

### Supabase (Local MCP)

```typescript
import { getSupabaseClient } from '@/lib/mcp';

const supabase = getSupabaseClient();

// Standard Supabase operations
const { data, error } = await supabase
  .from('knowledge_base')
  .select('*')
  .limit(10);
```

### n8n (Workflow Engine)

```typescript
import { getN8nClient, triggerN8nWebhook } from '@/lib/mcp';

// Get n8n API client
const n8n = getN8nClient();
const workflows = await n8n.get('/workflows');

// Trigger webhook
await triggerN8nWebhook('crew-memory-store', {
  crew: 'Data',
  memory: '...',
  timestamp: new Date().toISOString()
});
```

### OpenRouter (LLM API)

```typescript
import { callOpenRouter } from '@/lib/mcp';

// List models
const models = await callOpenRouter('/models', { method: 'GET' });

// Chat completion
const response = await callOpenRouter('/chat/completions', {
  method: 'POST',
  body: {
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: 'Hello!' }]
  }
});
```

### Remote MCP Server (Optional)

```typescript
import { callRemoteMCP } from '@/lib/mcp';

const status = await callRemoteMCP('/api/status', { method: 'GET' });
```

### Health Checks

```typescript
import { checkMCPHealth } from '@/lib/mcp';

const health = await checkMCPHealth();
// Returns: {
//   supabase: { operational: boolean, error?: string },
//   n8n: { operational: boolean, error?: string },
//   openRouter: { operational: boolean, error?: string },
//   remoteMCP?: { operational: boolean, error?: string }
// }
```

## Security

### Credential Handling

- ✅ Credentials are **never logged**
- ✅ Errors are **sanitized** (no credential values exposed)
- ✅ Credentials are **cached in memory only** (never persisted)
- ✅ Connection pooling prevents credential re-exposure

### Error Sanitization

All errors are automatically sanitized to prevent credential leakage:

```typescript
// ❌ Bad: Exposes credential
throw new Error(`Failed to connect to ${creds.supabase.url}`);

// ✅ Good: Sanitized
throw new Error('Failed to connect to Supabase');
```

### Validation

Credentials are validated before use:

```typescript
const validation = validateCredentials(creds);
if (!validation.isValid) {
  console.error('Missing:', validation.missing);
  console.warn('Optional:', validation.warnings);
}
```

## Efficiency

### Connection Pooling

Clients are cached per process (singleton pattern):

```typescript
// First call: Creates client
const supabase1 = getSupabaseClient();

// Subsequent calls: Reuses same client
const supabase2 = getSupabaseClient(); // Same instance
```

### Credential Caching

Credentials are parsed once per process:

```typescript
// First call: Parses ~/.zshrc
const creds1 = getMCPCredentials();

// Subsequent calls: Uses cached credentials
const creds2 = getMCPCredentials(); // No file I/O
```

### Lazy Loading

Dependencies are loaded only when needed:

```typescript
// axios is only required when calling n8n/OpenRouter
// Supabase client is only created when accessing Supabase
```

## Troubleshooting

### Credentials Not Found

```bash
# Check ~/.zshrc exists
ls -la ~/.zshrc

# Verify credentials are exported
grep -E "export (SUPABASE|N8N|OPENROUTER)" ~/.zshrc

# Reload shell
source ~/.zshrc
```

### Connection Errors

```typescript
// Check credential status
const status = getCredentialStatus();
console.log('Missing:', status.missing);

// Check health
const health = await checkMCPHealth();
console.log('Supabase:', health.supabase);
console.log('n8n:', health.n8n);
console.log('OpenRouter:', health.openRouter);
```

### Clear Cache

```typescript
import { clearCredentialCache, clearConnectionPools } from '@/lib/mcp';

// Clear credential cache (useful after updating ~/.zshrc)
clearCredentialCache();

// Clear connection pools (useful for testing)
clearConnectionPools();
```

## Architecture

### File Structure

```
dashboard/lib/mcp/
├── index.ts                      # Public API
├── universal-credential-loader.ts # Credential loading
├── universal-client.ts            # Client implementations
└── README.md                      # This file

scripts/lib/
└── mcp-cli-utils.js               # CLI utilities (Node.js)
```

### DDD Architecture

- **Data Layer**: Supabase (Local MCP), Remote MCP Server
- **Controller Layer**: n8n (Workflow Engine)
- **Service Layer**: OpenRouter (LLM API)
- **Access Layer**: This universal MCP system

### Crew Review

- **Commander Data**: Architecture and type safety
- **Lieutenant Worf**: Security and validation
- **Chief O'Brien**: Efficiency and connection pooling
- **Lieutenant Commander La Forge**: Infrastructure and reliability

## Examples

See:
- `dashboard/app/api/mcp/status/route.ts` - Status endpoint using universal MCP
- `scripts/mcp/mcp-store-memory.js` - CLI script using universal MCP
- `dashboard/lib/n8n-client.js` - Legacy n8n client (being migrated)


