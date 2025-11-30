# 🖖 Universal MCP Access System

## Overview

A unified, secure, efficient system for accessing all MCP services from both Next.js API routes and Node.js CLI scripts. All credentials are loaded from `~/.zshrc` with proper security, validation, and connection pooling.

## Architecture

### Components

1. **Universal Credential Loader** (`dashboard/lib/mcp/universal-credential-loader.ts`)
   - Loads credentials from `~/.zshrc`
   - Caches credentials per process (efficient)
   - Validates credentials before use
   - Never exposes credentials in errors

2. **Universal Client** (`dashboard/lib/mcp/universal-client.ts`)
   - Connection pooling (singleton pattern)
   - Unified API for all MCP services
   - Automatic retry and error handling
   - Health check utilities

3. **CLI Utilities** (`scripts/lib/mcp-cli-utils.js`)
   - Node.js compatible version
   - Same API as TypeScript version
   - Works in all CLI scripts

4. **Public API** (`dashboard/lib/mcp/index.ts`)
   - Single entry point
   - Convenience wrappers
   - Type-safe exports

## Security Features

### Credential Protection

- ✅ Credentials are **never logged**
- ✅ Errors are **sanitized** (no credential values exposed)
- ✅ Credentials are **cached in memory only** (never persisted)
- ✅ Connection pooling prevents credential re-exposure
- ✅ Validation before use

### Error Sanitization

All errors automatically sanitize sensitive information:

```typescript
// ❌ Bad: Exposes credential
throw new Error(`Failed to connect to ${creds.supabase.url}`);

// ✅ Good: Sanitized
throw new Error('Failed to connect to Supabase');
```

## Efficiency Features

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

- `axios` is only required when calling n8n/OpenRouter
- Supabase client is only created when accessing Supabase

## Usage

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

### Required Credentials

Add these to your `~/.zshrc`:

```bash
# Supabase (Local MCP)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"  # Optional

# n8n (Workflow Engine)
export N8N_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="your-n8n-api-key"
export N8N_OWNER_API_KEY="your-owner-api-key"  # Optional
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

## Migration Guide

### Migrating Existing Code

#### Before (Old Pattern)

```typescript
// ❌ Old: Direct environment variable access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ❌ Old: Manual n8n client creation
const axios = require('axios');
const n8nUrl = process.env.N8N_URL;
const n8nApiKey = process.env.N8N_API_KEY;
const n8n = axios.create({
  baseURL: `${n8nUrl}/api/v1`,
  headers: { 'Authorization': `Bearer ${n8nApiKey}` }
});
```

#### After (New Pattern)

```typescript
// ✅ New: Universal MCP access
import { mcp } from '@/lib/mcp';

const supabase = mcp.supabase();
const n8n = mcp.n8n.client();
await mcp.n8n.webhook('path', { data });
```

### Updated Files

- ✅ `dashboard/app/api/mcp/status/route.ts` - Now uses universal MCP system
- 🔄 `dashboard/lib/n8n-client.js` - Can be migrated to use universal MCP
- 🔄 `scripts/utils/load-crew-credentials.js` - Can be migrated to use universal MCP

## Testing

### Verify Credentials

```typescript
import { getCredentialStatus } from '@/lib/mcp';

const status = getCredentialStatus();
console.log('Loaded:', status.loaded);
console.log('Has Supabase:', status.hasSupabase);
console.log('Has n8n:', status.hasN8n);
console.log('Has OpenRouter:', status.hasOpenRouter);
console.log('Missing:', status.missing);
```

### Health Check

```typescript
import { checkMCPHealth } from '@/lib/mcp';

const health = await checkMCPHealth();
console.log('Supabase:', health.supabase.operational);
console.log('n8n:', health.n8n.operational);
console.log('OpenRouter:', health.openRouter.operational);
```

### Clear Cache

```typescript
import { clearCredentialCache, clearConnectionPools } from '@/lib/mcp';

// Clear credential cache (useful after updating ~/.zshrc)
clearCredentialCache();

// Clear connection pools (useful for testing)
clearConnectionPools();
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

## Benefits

### Security

- ✅ Centralized credential management
- ✅ No credential leakage in logs/errors
- ✅ Validation before use
- ✅ Secure defaults

### Efficiency

- ✅ Connection pooling (reuse connections)
- ✅ Credential caching (parse once per process)
- ✅ Lazy loading (load only what's needed)
- ✅ Reduced file I/O

### Maintainability

- ✅ Single source of truth for credentials
- ✅ Consistent API across all services
- ✅ Type-safe (TypeScript)
- ✅ Easy to test and debug

### Developer Experience

- ✅ Simple API (`mcp.supabase()`, `mcp.n8n.webhook()`)
- ✅ Works in both Next.js and Node.js
- ✅ Automatic validation and error handling
- ✅ Comprehensive documentation

## Crew Review

- **Commander Data**: Architecture and type safety ✅
- **Lieutenant Worf**: Security and validation ✅
- **Chief O'Brien**: Efficiency and connection pooling ✅
- **Lieutenant Commander La Forge**: Infrastructure and reliability ✅

## Next Steps

1. ✅ Universal credential loader created
2. ✅ Universal client created
3. ✅ CLI utilities created
4. ✅ MCP status route migrated
5. 🔄 Migrate remaining n8n client usage
6. 🔄 Migrate remaining credential loaders
7. 🔄 Add comprehensive tests
8. 🔄 Update all documentation

## Files Created

- `dashboard/lib/mcp/universal-credential-loader.ts` - Credential loading
- `dashboard/lib/mcp/universal-client.ts` - Client implementations
- `dashboard/lib/mcp/index.ts` - Public API
- `dashboard/lib/mcp/README.md` - Detailed documentation
- `scripts/lib/mcp-cli-utils.js` - CLI utilities
- `docs/UNIVERSAL_MCP_ACCESS_SYSTEM.md` - This file

## References

- [MCP Status API](./dashboard/app/api/mcp/status/route.ts) - Example usage
- [Universal MCP README](./dashboard/lib/mcp/README.md) - Detailed API docs

