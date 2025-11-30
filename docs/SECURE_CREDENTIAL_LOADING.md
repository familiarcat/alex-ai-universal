# Secure Credential Loading System

**Date:** November 23, 2025  
**Status:** ✅ Operational  
**Purpose:** Unified, secure credential loading from ~/.zshrc across all Alex AI scripts

## 🎯 Mission

Provide a secure, consistent way to load credentials from `~/.zshrc` across all Alex AI scripts, eliminating duplicate credential loading code and ensuring security best practices.

## 🔐 Security Features

### ✅ Best Practices
- **Never logs secrets** - Credentials are never exposed in logs
- **Priority system** - `process.env` takes precedence over `~/.zshrc` (most secure)
- **Graceful fallback** - Falls back to `~/.zshrc` for local development
- **Error handling** - Silently handles file system errors
- **Caching** - 1-minute cache to avoid repeated file reads

### 🛡️ Security Guarantees
- Credentials are never logged or exposed
- File system errors don't expose sensitive information
- Process.env (most secure) always takes priority
- ~/.zshrc is only used as fallback for local dev

## 📋 Usage

### Basic Usage

```javascript
const { getCredential, loadCredentials } = require('./scripts/utils/secure-credential-loader');

// Get a specific credential
const apiKey = getCredential('OPENROUTER_API_KEY');

// Load multiple credentials
const creds = loadCredentials(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
```

### Service-Specific Helpers

```javascript
const { 
  loadSupabaseCredentials,
  loadOpenRouterCredentials,
  loadN8NCredentials 
} = require('./scripts/utils/secure-credential-loader');

// Supabase
const supabase = loadSupabaseCredentials();
// { url, serviceKey, anonKey }

// OpenRouter
const apiKey = loadOpenRouterCredentials();

// n8n
const n8n = loadN8NCredentials();
// { baseUrl, apiKey, ownerApiKey }
```

### Verify Credentials

```javascript
const { verifyCredentials } = require('./scripts/utils/secure-credential-loader');

const result = verifyCredentials(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
if (!result.valid) {
  console.error(`Missing credentials: ${result.missing.join(', ')}`);
}
```

## 🔄 Priority System

1. **process.env** (Highest Priority)
   - Most secure
   - Used in production
   - Set by deployment systems

2. **~/.zshrc** (Fallback)
   - For local development
   - Automatically loaded
   - Cached for 1 minute

## 📝 Supported Formats

The loader supports multiple `~/.zshrc` formats:

```bash
# Quoted values
export SUPABASE_URL="https://example.supabase.co"
export SUPABASE_URL='https://example.supabase.co'

# Unquoted values
export OPENROUTER_API_KEY=sk-or-v1-abc123

# With comments
export N8N_API_KEY=key123  # This is a comment
```

## 🔧 Implementation Details

### Caching
- Credentials from `~/.zshrc` are cached for 1 minute
- Reduces file system reads
- Cache is automatically invalidated after TTL

### Error Handling
- File system errors are silently caught
- Missing files return empty credentials
- Parsing errors don't expose sensitive data

### Auto-Population
- Credentials loaded from `~/.zshrc` are automatically added to `process.env`
- Ensures downstream libraries can access credentials
- Maintains compatibility with existing code

## 📊 Migration Status

### ✅ Updated Scripts
- `scripts/mcp-summarize-milestone.js` - Uses secure loader
- `scripts/crew/coordination/load-crew-memories.js` - Uses secure loader
- `lib/mcp-crew-memories-server.js` - Uses secure loader

### 🔄 Migration Pattern

**Before:**
```javascript
// Inline credential loading (duplicated everywhere)
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const match = zshrc.match(/export\s+KEY=["']?([^"'\s]+)["']?/);
const value = match ? match[1] : process.env.KEY;
```

**After:**
```javascript
// Unified secure loader
const { getCredential } = require('./scripts/utils/secure-credential-loader');
const value = getCredential('KEY');
```

## 🖖 Benefits

### Security
- ✅ Never logs secrets
- ✅ Process.env priority (most secure)
- ✅ Graceful error handling

### Consistency
- ✅ Single source of truth
- ✅ Same behavior across all scripts
- ✅ Standardized interface

### Developer Experience
- ✅ Simple API
- ✅ Automatic ~/.zshrc loading
- ✅ No manual credential management

### Performance
- ✅ 1-minute caching
- ✅ Reduced file system reads
- ✅ Efficient parsing

## 🚀 Next Steps

1. ✅ Secure credential loader created
2. ✅ Core scripts migrated
3. ⏳ Migrate remaining scripts (gradual)
4. ⏳ Update documentation as scripts migrate

---

**Status:** ✅ Operational  
**Security:** ✅ Best practices enforced  
**Backward Compatibility:** ✅ Maintained

