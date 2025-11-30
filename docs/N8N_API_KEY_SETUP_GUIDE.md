# 🔑 N8N API Key Setup Guide

## Where to Get the API Key

### Step 1: Access n8n UI
1. Open your n8n instance in a browser:
   ```
   https://n8n.pbradygeorgen.com
   ```

2. Log in with your n8n account credentials

### Step 2: Generate API Key
1. Click on your **user icon** (top right corner)
2. Navigate to **Settings** → **API**
3. Click **"Create API Key"** button
4. **Copy the generated API key immediately** (you won't be able to see it again!)

   ⚠️ **Important**: The API key is only shown once. If you lose it, you'll need to create a new one.

### Step 3: Choose Key Type
- **`N8N_OWNER_API_KEY`** (Recommended): Full access to all workflows, including creation, deletion, and activation
- **`N8N_API_KEY`**: Standard API access (may have limited permissions for workflow management)

For workflow restoration and management, use **`N8N_OWNER_API_KEY`**.

---

## Where to Store the API Key

### Location: `~/.zshrc`

All scripts in this project read API keys from your `~/.zshrc` file. This ensures:
- ✅ Credentials are not committed to git
- ✅ Available to all automation scripts
- ✅ Persists across terminal sessions

### Step 1: Open `~/.zshrc`
```bash
nano ~/.zshrc
# or
code ~/.zshrc
# or
vim ~/.zshrc
```

### Step 2: Add the API Key
Add one of these lines (preferably the owner key):

```bash
# Preferred: Owner-level API key (full permissions)
export N8N_OWNER_API_KEY="your-api-key-here"

# Alternative: Standard API key
export N8N_API_KEY="your-api-key-here"
```

**Example:**
```bash
export N8N_OWNER_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA"
```

### Step 3: Reload Your Shell
```bash
source ~/.zshrc
```

Or simply open a new terminal window.

---

## Verification

### Test API Access
Run this command to verify your API key works:

```bash
curl -s "https://n8n.pbradygeorgen.com/api/v1/workflows" \
  -H "X-N8N-API-KEY: $(grep 'export N8N_OWNER_API_KEY=' ~/.zshrc | cut -d'"' -f2)"
```

**Expected Response:**
- ✅ `200 OK` with workflow list: API key is working
- ❌ `401 Unauthorized`: API key is invalid or expired
- ❌ `404 Not Found`: API endpoint issue

### Test with Script
```bash
node scripts/list-all-n8n-workflows.js
```

If successful, you'll see a list of workflows. If you get "unauthorized", check:
1. API key is correctly copied (no extra spaces)
2. API key is in `~/.zshrc` with correct variable name
3. You've run `source ~/.zshrc` or opened a new terminal

---

## Troubleshooting

### Issue: "unauthorized" Error

**Possible Causes:**
1. **API key expired or invalid**: Generate a new one in n8n UI
2. **Wrong variable name**: Scripts prefer `N8N_OWNER_API_KEY` over `N8N_API_KEY`
3. **Key not loaded**: Run `source ~/.zshrc` or restart terminal
4. **Insufficient permissions**: Use `N8N_OWNER_API_KEY` instead of `N8N_API_KEY`

**Solution:**
```bash
# Check if key exists
grep N8N_OWNER_API_KEY ~/.zshrc

# If missing, add it:
echo 'export N8N_OWNER_API_KEY="your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### Issue: Script Can't Find API Key

**Check:**
```bash
# Verify key is in ~/.zshrc
grep -E "N8N_(OWNER_)?API_KEY" ~/.zshrc

# Test if it's loaded
echo $N8N_OWNER_API_KEY
```

**Fix:**
- Ensure the export statement is on its own line
- No spaces around the `=` sign
- Key is wrapped in quotes: `"key-here"`

---

## Security Best Practices

1. **Never commit API keys to git**
   - ✅ Store in `~/.zshrc` (not tracked by git)
   - ❌ Don't add to `.env` files that might be committed
   - ❌ Don't hardcode in scripts

2. **Use Owner Key Only When Needed**
   - `N8N_OWNER_API_KEY`: Full access (use for workflow management)
   - `N8N_API_KEY`: Limited access (use for read-only operations)

3. **Rotate Keys Periodically**
   - Generate new keys every 90 days
   - Revoke old keys in n8n UI: Settings → API → Delete old key

4. **Backup `~/.zshrc`**
   ```bash
   cp ~/.zshrc ~/.zshrc.backup
   ```

---

## Quick Reference

| Variable | Purpose | Permissions |
|----------|---------|-------------|
| `N8N_OWNER_API_KEY` | Full workflow management | Create, read, update, delete, activate workflows |
| `N8N_API_KEY` | Standard API access | Read workflows, execute workflows (may be limited) |

**Storage Location:** `~/.zshrc`

**Format:**
```bash
export N8N_OWNER_API_KEY="your-key-here"
```

**Where to Get It:**
1. Open: `https://n8n.pbradygeorgen.com`
2. Go to: Settings → API
3. Click: "Create API Key"
4. Copy the key

---

## Related Scripts

These scripts use the API key from `~/.zshrc`:
- `scripts/emergency-restore-workflows.js`
- `scripts/restore-all-n8n-workflows.js`
- `scripts/activate-all-n8n-workflows.js`
- `scripts/list-all-n8n-workflows.js`
- `scripts/force-webhook-reregistration.js`

All scripts automatically load credentials using `scripts/utils/load-crew-credentials.js`.

