# 🔑 OpenRouter API Key Management

Complete guide for getting, verifying, and automating OpenRouter API keys for Alex AI.

## 🎯 Quick Start

### Option 1: Manual (2 minutes)

```bash
# Run the helper script
bash scripts/get-openrouter-key.sh
```

This will:
1. Open https://openrouter.ai/keys in your browser
2. Guide you through copying your API key
3. Show you how to add it to `~/.zshrc`

### Option 2: Automated (Requires Provisioning Key)

```bash
# First, get a Provisioning API Key (one-time setup)
# Visit: https://openrouter.ai/docs/features/provisioning-api-keys
# Add to ~/.zshrc: export OPENROUTER_PROVISIONING_KEY="..."

# Then automate everything
node scripts/automate-openrouter-key.js --create --update-zshrc
```

## 📋 Manual Process

### Step 1: Get Your API Key

1. Visit: https://openrouter.ai/keys
2. Sign in with your OpenRouter account
3. If you have an existing key:
   - Click "Show" to reveal it
   - Copy the key (starts with `sk-or-v1-...`)
4. If you need a new key:
   - Click "Create Key" button
   - Give it a name (e.g., "Alex AI")
   - Copy the generated key

### Step 2: Add to ~/.zshrc

```bash
# Open ~/.zshrc in your editor
nano ~/.zshrc
# or
code ~/.zshrc

# Add this line:
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"

# Save and reload
source ~/.zshrc
```

### Step 3: Verify

```bash
node scripts/verify-openrouter-key.js
```

You should see:
```
✅ API Key is VALID and working!
```

## 🤖 Automated Management (Provisioning API)

OpenRouter provides a **Provisioning API** that allows programmatic key management. This enables:

- ✅ Automatic key creation
- ✅ Key rotation
- ✅ Listing existing keys
- ✅ Automatic ~/.zshrc updates

### Setup Provisioning API (One-Time)

1. **Get Provisioning Key:**
   - Visit: https://openrouter.ai/docs/features/provisioning-api-keys
   - Click "Create New Key"
   - **Important:** Provisioning keys are separate from regular API keys
   - They can only manage keys, not make API calls

2. **Add to ~/.zshrc:**
   ```bash
   export OPENROUTER_PROVISIONING_KEY="your-provisioning-key-here"
   source ~/.zshrc
   ```

### Automated Commands

#### List Existing Keys
```bash
node scripts/automate-openrouter-key.js --list
```

#### Create New Key
```bash
node scripts/automate-openrouter-key.js --create
```

#### Create and Auto-Update ~/.zshrc
```bash
node scripts/automate-openrouter-key.js --create --update-zshrc
```

#### Create with Custom Name
```bash
node scripts/automate-openrouter-key.js --create --name "Alex AI Production Key" --update-zshrc
```

### How It Works

The automation script:
1. Reads `OPENROUTER_PROVISIONING_KEY` from `~/.zshrc`
2. Uses OpenRouter Provisioning API to:
   - List existing keys
   - Create new keys
   - Get key details
3. Optionally updates `~/.zshrc` automatically
4. Provides clear feedback and error messages

## 🔍 Verification

### Verify API Key Works

```bash
node scripts/verify-openrouter-key.js
```

**Expected Output:**
```
✅ API Key found (length: 73)
   Format: ✅ Valid format
   Preview: sk-or-v1-c...

🧪 Testing API key with OpenRouter...

✅ API Key is VALID and working!
   Response: test
```

### Verify in Milestone Push

When you run milestone pushes, the summarization will automatically test the key:

```bash
bash scripts/milestones/milestone-push.sh -s "Test" -n "test"
```

If the key is valid, you'll see:
```
SUMMARY_OK
[Summary text here]
```

If invalid:
```
SUMMARY_SKIPPED Invalid OpenRouter API key
💡 To enable milestone summarization:
   1. Get API key from https://openrouter.ai/keys
   ...
```

## 🛠️ Troubleshooting

### Error: "User not found" (401)

**Problem:** API key is invalid or expired.

**Solution:**
1. Get a new key: `bash scripts/get-openrouter-key.sh`
2. Update `~/.zshrc`
3. Verify: `node scripts/verify-openrouter-key.js`

### Error: "OPENROUTER_API_KEY not found"

**Problem:** Key not in `~/.zshrc` or not sourced.

**Solution:**
```bash
# Check if key exists
grep OPENROUTER_API_KEY ~/.zshrc

# If missing, add it
echo 'export OPENROUTER_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc
```

### Error: "OPENROUTER_PROVISIONING_KEY not found"

**Problem:** Trying to use automation without provisioning key.

**Solution:**
- Use manual process: `bash scripts/get-openrouter-key.sh`
- Or set up provisioning key (see "Automated Management" above)

### Key Format Validation

The verification script checks:
- ✅ Key exists
- ✅ Format starts with `sk-or-v1-` or `sk-`
- ✅ Key length is reasonable
- ✅ Key actually works with OpenRouter API

## 📚 Related Documentation

- [OpenRouter Provisioning API Docs](https://openrouter.ai/docs/features/provisioning-api-keys)
- [OpenRouter API Reference](https://openrouter.ai/docs/api-reference)
- [Secure Credential Loading](./SECURE_CREDENTIAL_LOADING.md)

## 🎯 Best Practices

1. **Use Provisioning API for Production:**
   - Enables automatic key rotation
   - Better security (keys can be rotated without manual steps)
   - Easier CI/CD integration

2. **Store Keys Securely:**
   - Never commit keys to git
   - Use `~/.zshrc` for local development
   - Use secrets manager for production

3. **Verify After Changes:**
   - Always run `verify-openrouter-key.js` after updating keys
   - Test milestone push to ensure summarization works

4. **Key Naming:**
   - Use descriptive names: "Alex AI - Production", "Alex AI - Development"
   - Makes it easier to identify keys in OpenRouter dashboard

## 🖖 Crew Notes

- **Chief O'Brien:** "Simple solutions are usually the best solutions. Use the helper script."
- **Commander Data:** "The Provisioning API provides optimal efficiency for key management."
- **Captain Picard:** "Make it so. Verify your keys before critical operations."

