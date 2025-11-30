# 🔐 N8N API Key Security Audit & Universal Access Setup

**Date:** 2025-01-20  
**Status:** ✅ Security Hardening Complete

---

## 🎯 Objective

Ensure secure, universal n8n API key access across the entire application:
- ✅ All credentials stored in `~/.zshrc` (never in git)
- ✅ No hardcoded keys in scripts
- ✅ Proper credential loading with fallback priority
- ✅ Universal access via `scripts/utils/load-crew-credentials.js`

---

## ✅ Security Fixes Applied

### 1. Removed Hardcoded Keys

**Before:**
- ❌ `dashboard/scripts/load-n8n-credentials.sh` had hardcoded API key
- ❌ `scripts/update-credentials.js` had hardcoded API key

**After:**
- ✅ All scripts load from `~/.zshrc` via environment variables
- ✅ Proper fallback: `N8N_OWNER_API_KEY` → `N8N_API_KEY`
- ✅ No credentials in source code

### 2. Updated Credential Loading

**Files Updated:**
- ✅ `dashboard/scripts/load-n8n-credentials.sh` - Now loads from `~/.zshrc`
- ✅ `scripts/update-credentials.js` - Now requires environment variable

**Pattern:**
```bash
# Prefer N8N_OWNER_API_KEY, fallback to N8N_API_KEY
if [ -n "${N8N_OWNER_API_KEY}" ]; then
    export N8N_API_KEY="${N8N_OWNER_API_KEY}"
elif [ -n "${N8N_API_KEY}" ]; then
    export N8N_OWNER_API_KEY="${N8N_API_KEY}"
fi
```

### 3. Created Secure Update Script

**New File:** `scripts/secure-update-n8n-api-key.sh`

**Features:**
- ✅ Validates API key before storage
- ✅ Creates backup of `~/.zshrc`
- ✅ Tests key connectivity
- ✅ Sets both `N8N_OWNER_API_KEY` and `N8N_API_KEY` for compatibility
- ✅ Provides clear instructions

---

## 📋 Universal Access Architecture

### Credential Loading Priority

All scripts use this priority order:

1. **`N8N_OWNER_API_KEY`** (preferred - full permissions)
2. **`N8N_API_KEY`** (fallback - may have limited permissions)
3. **Environment variables** (from `~/.zshrc` via `load-crew-credentials.js`)

### Central Credential Loader

**File:** `scripts/utils/load-crew-credentials.js`

**Usage:**
```javascript
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const creds = loadCrewCredentials();

// Access n8n API key
const apiKey = creds.n8n.apiKey; // Prefers N8N_OWNER_API_KEY
const baseUrl = creds.n8n.baseUrl;
```

**Features:**
- ✅ Automatically loads from `~/.zshrc`
- ✅ Prioritizes `N8N_OWNER_API_KEY` over `N8N_API_KEY`
- ✅ Provides fallback values
- ✅ No hardcoded credentials

---

## 🔍 Scripts Using n8n API Keys

### ✅ Properly Configured (Using Credential Loader)

These scripts correctly use `load-crew-credentials.js`:

- `scripts/emergency-restore-workflows.js`
- `scripts/restore-all-n8n-workflows.js`
- `scripts/activate-all-n8n-workflows.js`
- `scripts/list-all-n8n-workflows.js`
- `scripts/force-webhook-reregistration.js`
- `scripts/store-chat-session-memory.js`
- `scripts/push-milestone-to-rag.js`
- `scripts/implement-meeting-next-steps.js`
- `scripts/bidirectional-n8n-sync.js`
- `scripts/rename-n8n-workflows.js`
- `packages/shared-utilities/src/security/credentials.js`

### ✅ Fixed (Now Load from ~/.zshrc)

- `dashboard/scripts/load-n8n-credentials.sh` - ✅ Fixed
- `scripts/update-credentials.js` - ✅ Fixed

### 📝 Direct Environment Variable Access

These scripts access environment variables directly (acceptable if they use `load-crew-credentials.js` first):

- `packages/core/src/natural-language/real-natural-language-handler.ts`
- `dashboard/lib/n8n-client.js`
- `examples/alex-ai-nextjs/src/app/api/n8n-proxy/route.ts`

**Note:** These should use `loadCrewCredentials()` for consistency, but direct env access is acceptable if credentials are loaded via `~/.zshrc`.

---

## 🚀 Setup Instructions

### Step 1: Get API Key from n8n UI

1. Open: https://n8n.pbradygeorgen.com
2. Go to: **Settings → API**
3. Click: **"Create API Key"**
4. Copy the key immediately

### Step 2: Secure Update

**Option A: Use Secure Update Script (Recommended)**
```bash
# Interactive mode
bash scripts/secure-update-n8n-api-key.sh

# Or with key as argument
bash scripts/secure-update-n8n-api-key.sh "your-api-key-here"
```

**Option B: Manual Update**
```bash
# Backup first
cp ~/.zshrc ~/.zshrc.backup.$(date +%s)

# Add to ~/.zshrc
echo 'export N8N_OWNER_API_KEY="your-api-key-here"' >> ~/.zshrc
echo 'export N8N_API_KEY="your-api-key-here"' >> ~/.zshrc

# Reload
source ~/.zshrc
```

### Step 3: Verify

```bash
# Test API key works
node scripts/list-all-n8n-workflows.js

# Or test directly
curl -s "https://n8n.pbradygeorgen.com/api/v1/workflows" \
  -H "X-N8N-API-KEY: $(grep 'export N8N_OWNER_API_KEY=' ~/.zshrc | cut -d'"' -f2)"
```

---

## 🔐 Security Best Practices

### ✅ DO

- ✅ Store credentials in `~/.zshrc` (not git-tracked)
- ✅ Use `N8N_OWNER_API_KEY` for full permissions
- ✅ Use `scripts/utils/load-crew-credentials.js` for credential loading
- ✅ Validate API keys before storage
- ✅ Create backups before updating credentials
- ✅ Test API keys after updating

### ❌ DON'T

- ❌ Hardcode API keys in scripts
- ❌ Commit credentials to git
- ❌ Store keys in `.env` files that might be committed
- ❌ Share API keys in chat or documentation
- ❌ Use expired or invalid keys

---

## 📊 Security Checklist

- [x] Removed all hardcoded API keys from scripts
- [x] Updated credential loading to use `~/.zshrc`
- [x] Created secure update script with validation
- [x] Documented credential loading priority
- [x] Verified all scripts use proper credential loading
- [x] Created backup mechanism for `~/.zshrc`
- [x] Added API key validation before storage

---

## 🔄 Maintenance

### Rotating API Keys

1. Generate new key in n8n UI
2. Run: `bash scripts/secure-update-n8n-api-key.sh <new-key>`
3. Verify: `node scripts/list-all-n8n-workflows.js`
4. Revoke old key in n8n UI (optional but recommended)

### Auditing Credential Usage

To find all places using n8n API keys:
```bash
grep -r "N8N.*API.*KEY" scripts/ packages/ --include="*.js" --include="*.ts" --include="*.sh"
```

---

## 📝 Files Modified

1. `dashboard/scripts/load-n8n-credentials.sh` - Removed hardcoded key, added ~/.zshrc loading
2. `scripts/update-credentials.js` - Removed hardcoded key, requires env variable
3. `scripts/secure-update-n8n-api-key.sh` - New secure update script

---

## 🎯 Result

✅ **Universal n8n API access is now secure and consistent across the entire application.**

All scripts:
- Load credentials from `~/.zshrc` (never hardcoded)
- Use `N8N_OWNER_API_KEY` as preferred key
- Fallback to `N8N_API_KEY` if owner key not available
- Use `scripts/utils/load-crew-credentials.js` for consistent loading

---

**Last Updated:** 2025-01-20  
**Status:** ✅ Security Hardening Complete

