# 🤖 OpenRouter Automation Setup Guide

Complete guide to set up **fully automated** OpenRouter API key management and crew-optimized LLM calls via MCP.

## 🎯 What This Enables

✅ **Automated Key Management**: Keys created/rotated automatically via Provisioning API  
✅ **Crew-Optimized LLM Calls**: Each crew member gets the best model for their task  
✅ **Cost Optimization**: Automatic selection of most cost-effective model  
✅ **MCP Integration**: All crew members can make optimized LLM calls through MCP  
✅ **Zero Manual Steps**: After initial setup, everything is automated

## 📋 One-Time Manual Setup (5 minutes)

### Step 1: Get Provisioning API Key

1. **Visit OpenRouter Provisioning Keys:**
   ```
   https://openrouter.ai/settings/keys
   ```

2. **Click "Provisioning Keys" in the left sidebar** (you can see it in the UI)

3. **Click "Create Provisioning Key"**

4. **Name it**: `Alex AI - Automated Management`

5. **Copy the key** (starts with `sk-or-v1-...`)

### Step 2: Add Provisioning Key to ~/.zshrc

```bash
# Open ~/.zshrc
nano ~/.zshrc
# or
code ~/.zshrc

# Add this line:
export OPENROUTER_PROVISIONING_KEY="sk-or-v1-your-provisioning-key-here"

# Save and reload
source ~/.zshrc
```

### Step 3: Run Automated Setup

```bash
# This will:
# 1. Create a regular API key automatically
# 2. Add it to ~/.zshrc
# 3. Verify it works
npm run openrouter:create
```

**Expected Output:**
```
✅ Provisioning key found
✅ Created new API key: Alex AI - Auto-generated
   Key: sk-or-v1-...
✅ Updated ~/.zshrc
💡 Run: source ~/.zshrc
💡 Then verify: node scripts/verify-openrouter-key.js
```

### Step 4: Verify Everything Works

```bash
# Reload environment
source ~/.zshrc

# Verify API key
npm run openrouter:verify

# Test MCP integration
node lib/mcp-crew-memories-server.js
```

## 🚀 How It Works

### Automated Key Management

The system uses OpenRouter's **Provisioning API** to:

1. **List existing keys** - Checks if you already have a valid key
2. **Create new keys** - Automatically generates keys when needed
3. **Update ~/.zshrc** - Automatically adds keys to your environment
4. **Rotate keys** - Can create new keys and deprecate old ones

**Scripts:**
- `npm run openrouter:automate` - List/create keys manually
- `npm run openrouter:create` - Create and auto-update (recommended)

### Crew-Optimized LLM Calls

Each crew member gets the **optimal model** based on:

1. **Crew Member Specialization**
   - Picard → Claude 3.5 Sonnet (strategic planning)
   - Data → Claude 3.5 Sonnet (complex analysis)
   - O'Brien → Claude 3 Haiku (quick, cost-effective)
   - Quark → Gemini Pro (business optimization)

2. **Task Complexity**
   - Low complexity → Cost-effective models (Haiku, Mini)
   - High complexity → High-performance models (Sonnet, GPT-4o)

3. **Cost Optimization**
   - Automatically selects most cost-effective model
   - Respects budget constraints
   - Estimates costs before making calls

### MCP Integration

All crew members can now make optimized LLM calls through MCP:

**Available MCP Tools:**

1. **`optimize_openrouter_model`**
   - Selects optimal model for a crew member's task
   - Returns model selection with cost estimates

2. **`call_openrouter_llm`**
   - Makes an optimized LLM call
   - Automatically selects best model
   - Returns response with cost tracking

**Example Usage (in Cursor AI chat):**

```
User: "Have Data analyze this code for performance issues"

AI: [Uses MCP tool: call_openrouter_llm]
    - Crew Member: data
    - Task Type: complex_analysis
    - Auto-selects: Claude 3.5 Sonnet
    - Makes optimized call
    - Returns analysis with cost tracking
```

## 🔧 Configuration

### Model Selection Logic

The optimizer uses these factors:

1. **Task Affinity Scores** (0-1)
   - Strategic planning → Claude Sonnet: 0.98
   - Code generation → Claude Sonnet: 0.92, Llama: 0.90
   - Quick analysis → Haiku: 0.95, Mini: 0.90

2. **Complexity Multipliers**
   - Low: 0.9 (prefer cheaper models)
   - Medium: 1.0 (balanced)
   - High: 1.1 (prefer powerful models)

3. **Cost Efficiency Bonus**
   - Lower cost = higher bonus
   - Balances performance vs cost

4. **Crew Member Alignment**
   - +0.15 bonus if model matches crew specialization

### Customizing Model Selection

Edit `scripts/utils/mcp-openrouter-optimizer.js`:

```javascript
const OPENROUTER_MODELS = {
  'anthropic/claude-3.5-sonnet': {
    // ... your customizations
    crewMember: ['picard', 'data'], // Add crew members
    bestFor: ['strategic_planning'], // Add task types
  }
};
```

## 📊 Cost Tracking

Every LLM call includes:

- **Model selected** - Which model was used
- **Estimated cost** - Cost before the call
- **Actual cost** - Cost from usage data (if available)
- **Token usage** - Input/output tokens
- **Optimization confidence** - How confident the selection was

## 🛠️ Troubleshooting

### Error: "OPENROUTER_PROVISIONING_KEY not found"

**Solution:**
1. Get Provisioning Key from OpenRouter
2. Add to `~/.zshrc`: `export OPENROUTER_PROVISIONING_KEY="..."`
3. Run: `source ~/.zshrc`

### Error: "OPENROUTER_API_KEY not found"

**Solution:**
```bash
# Create key automatically
npm run openrouter:create

# Or manually
npm run openrouter:get-key
```

### Error: "User not found" (401)

**Solution:**
- Your API key is invalid/expired
- Run: `npm run openrouter:create` to generate a new one

### MCP Tools Not Available

**Solution:**
1. Ensure MCP server is running
2. Check `.cursor/mcp-config.json` includes the server
3. Restart Cursor AI

## 🎯 Best Practices

1. **Use Provisioning API for Production**
   - Enables automatic key rotation
   - Better security
   - Easier CI/CD integration

2. **Monitor Costs**
   - Check OpenRouter dashboard regularly
   - Review cost estimates before large operations
   - Use budget constraints for expensive tasks

3. **Let the Optimizer Choose**
   - Don't manually specify models unless necessary
   - The optimizer learns from crew patterns
   - Trust the cost/performance balance

4. **Cache Model Selections**
   - MCP caches model selections for efficiency
   - Similar tasks reuse optimal models
   - Reduces API calls and improves speed

## 🖖 Crew Integration

All crew members now have access to optimized LLM calls:

- **Picard**: Strategic analysis with Claude Sonnet
- **Data**: Complex analysis with Claude Sonnet
- **Riker**: Operations with balanced models
- **La Forge**: Code generation with Claude Sonnet
- **Worf**: Security reviews with GPT-4o Mini
- **Troi**: User experience with GPT-4o
- **Crusher**: Health monitoring with GPT-4o Mini
- **Uhura**: Communication with GPT-4o
- **Quark**: Business optimization with Gemini Pro
- **O'Brien**: Quick fixes with Claude Haiku

Each crew member automatically gets the best model for their specialization!

## 📚 Related Documentation

- [OpenRouter Key Management](./OPENROUTER_KEY_MANAGEMENT.md)
- [MCP Crew Memories Migration](./mcp/MCP_CREW_MEMORIES_MIGRATION.md)
- [Secure Credential Loading](./SECURE_CREDENTIAL_LOADING.md)

## ✅ Verification Checklist

- [ ] Provisioning API key in `~/.zshrc`
- [ ] Regular API key created and in `~/.zshrc`
- [ ] `npm run openrouter:verify` passes
- [ ] MCP server includes OpenRouter tools
- [ ] Test crew LLM call works
- [ ] Cost tracking visible in responses

---

**🎉 Once setup is complete, all crew members have automated, optimized LLM access!**

