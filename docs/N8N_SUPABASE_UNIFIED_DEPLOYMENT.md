# 🔄 Unified n8n + Supabase Deployment Automation

**Knowledge Base Entry for RAG System**  
**Crew Relevance**: Lt. La Forge (Infrastructure), Commander Data (Analytics), Lt. Worf (Security)  
**Keywords**: n8n, supabase, deployment, automation, ci/cd, infrastructure-as-code, credentials-management

---

## 🎯 **OVERVIEW**

This document describes the automated deployment process for integrating LCARS workflows with n8n and Supabase using credentials stored in `~/.zshrc`. This approach enables:

- **Single Source of Truth**: All credentials in `~/.zshrc`
- **Automated Deployment**: One command deploys everything
- **Environment Sync**: Automatic `.env.local` updates
- **RAG Integration**: Knowledge capture for future reference

---

## 🔐 **CREDENTIALS MANAGEMENT**

### **Storage Location**: `~/.zshrc`

```bash
# n8n Configuration
export N8N_BASE_URL="https://n8n.pbradygeorgen.com"
export N8N_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="your-n8n-api-key"  # Create in n8n Settings → API

# Open Router (for LLM selection)
export OPENROUTER_API_KEY="sk-or-v1-..."

# Supabase Configuration
export SUPABASE_URL="https://rpkkkbufdwxmjaerbhbn.supabase.co"
export SUPABASE_ANON_KEY="sb_secret_..."
```

### **Best Practices**

1. ✅ **Never commit credentials** to git
2. ✅ **Use ~/.zshrc permissions**: `chmod 600 ~/.zshrc`
3. ✅ **Rotate keys regularly** (quarterly minimum)
4. ✅ **Use API keys** instead of basic auth
5. ✅ **Document key creation** dates in comments

---

## 🚀 **DEPLOYMENT SCRIPT**

### **Location**: `/scripts/deploy-lcars-to-n8n.sh`

### **What It Does**

1. **Extracts Credentials** from `~/.zshrc`
2. **Generates Workflows** if not present
3. **Creates Deployment Guide** with manual instructions
4. **Updates Environment Variables** in `.env.local`
5. **Generates RAG Knowledge** for future reference

### **Usage**

```bash
# Run deployment automation
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal
./scripts/deploy-lcars-to-n8n.sh
```

### **Output Files**

- `/tmp/lcars-library-computer-workflow.json` - LC workflow (8.1KB)
- `/tmp/lcars-ars-workflow.json` - ARS workflow (3.1KB)
- `/tmp/lcars-supabase-schema.sql` - Database schema (1.5KB)
- `/tmp/lcars-n8n-deployment-guide.md` - Deployment instructions
- `/tmp/lcars-deployment-knowledge.json` - RAG knowledge entry

---

## 🔧 **N8N DEPLOYMENT METHODS**

### **Method 1: Manual Import** (Recommended for First Time)

```bash
# 1. Open n8n
open https://n8n.pbradygeorgen.com

# 2. Import workflows
# UI: "+ Add Workflow" → "Import from File"
# Select: /tmp/lcars-library-computer-workflow.json
# Repeat for: /tmp/lcars-ars-workflow.json

# 3. Activate workflows
# Toggle "Active" switch on each workflow

# 4. Note webhook URLs
# Displayed in Webhook node properties
```

### **Method 2: Using n8n REST API** (Requires API Key)

```bash
# 1. Create n8n API Key
# Visit: https://n8n.pbradygeorgen.com
# Settings → API → Create API Key
# Add to ~/.zshrc: export N8N_API_KEY="your-key"

# 2. Import Library Computer workflow
curl -X POST https://n8n.pbradygeorgen.com/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -d @/tmp/lcars-library-computer-workflow.json

# 3. Import ARS workflow
curl -X POST https://n8n.pbradygeorgen.com/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -d @/tmp/lcars-ars-workflow.json
```

### **Method 3: Automated (Future Enhancement)**

```bash
# Once N8N_API_KEY is in ~/.zshrc:
./scripts/deploy-lcars-to-n8n.sh --auto-deploy
```

---

## 💾 **SUPABASE DEPLOYMENT**

### **Schema Application**

**Option 1: Supabase Dashboard** (Recommended)

```bash
# 1. Open Supabase project
open https://supabase.com/dashboard/project/rpkkkbufdwxmjaerbhbn

# 2. Navigate to SQL Editor

# 3. Create new query

# 4. Paste schema contents
cat /tmp/lcars-supabase-schema.sql

# 5. Click "Run" to execute
```

**Option 2: psql** (Requires PostgreSQL client)

```bash
# Connect and apply schema
psql "postgresql://postgres:[password]@db.rpkkkbufdwxmjaerbhbn.supabase.co:5432/postgres" \
  < /tmp/lcars-supabase-schema.sql
```

### **Tables Created**

1. **`lcars_performance_metrics`**
   - Tracks LLM usage, costs, and performance per crew member
   - Fields: `crew_member_id`, `model_used`, `response_time`, `cost`, `success`, `timestamp`

2. **`lcars_live_updates`**
   - Stores real-time project changes
   - Fields: `project_id`, `update_data`, `timestamp`, `approved`, `approved_by`

3. **`lcars_projects`**
   - Manages project lifecycle
   - Fields: `id`, `name`, `status`, `crew_members`, `preview_url`, `published_url`

---

## 🔗 **WEBHOOK ENDPOINTS**

### **After Deployment**

- **Library Computer**: `https://n8n.pbradygeorgen.com/webhook/lcars-lc-webhook`
- **ARS**: `https://n8n.pbradygeorgen.com/webhook/lcars-ars-webhook`

### **Testing Webhooks**

```bash
# Test Library Computer
curl -X POST https://n8n.pbradygeorgen.com/webhook/lcars-lc-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "crewMemberId": "captain_picard",
    "prompt": "Design a scalable microservices architecture",
    "context": {
      "expectedUsers": 100000,
      "regions": ["US", "EU", "APAC"]
    }
  }'

# Expected Response:
# {
#   "analysis": {
#     "complexity": 9.5,
#     "taskType": "strategic",
#     "recommendedModel": "anthropic/claude-3.5-sonnet",
#     "costEstimate": 0.0045,
#     "reasoning": "High complexity strategic task..."
#   },
#   "response": {
#     "crewMemberId": "captain_picard",
#     "modelUsed": "anthropic/claude-3.5-sonnet",
#     "responseTime": 1250,
#     "result": "..."
#   }
# }

# Test ARS
curl -X POST https://n8n.pbradygeorgen.com/webhook/lcars-ars-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project_123",
    "type": "content",
    "target": "header",
    "change": {"text": "Updated Header"},
    "crewMember": "counselor_troi"
  }'
```

---

## ⚙️ **ENVIRONMENT VARIABLES**

### **Auto-Updated by Script**

Location: `examples/alex-ai-nextjs/.env.local`

```bash
# LCARS System Configuration (auto-added by deploy script)
NEXT_PUBLIC_LCARS_ENABLED=true
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_N8N_LC_WEBHOOK=https://n8n.pbradygeorgen.com/webhook/lcars-lc-webhook
NEXT_PUBLIC_N8N_ARS_WEBHOOK=https://n8n.pbradygeorgen.com/webhook/lcars-ars-webhook
```

### **Existing Supabase Variables** (not modified)

```bash
SUPABASE_URL=https://rpkkkbufdwxmjaerbhbn.supabase.co
SUPABASE_ANON_KEY=sb_secret_...
NEXT_PUBLIC_SUPABASE_URL=https://rpkkkbufdwxmjaerbhbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_secret_...
```

---

## ✅ **VERIFICATION CHECKLIST**

### **After Deployment**

```bash
# 1. Check n8n workflows are active
curl -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  https://n8n.pbradygeorgen.com/api/v1/workflows | jq '.data[] | {name, active}'

# 2. Verify Supabase tables exist
# Visit: https://supabase.com/dashboard/project/rpkkkbufdwxmjaerbhbn
# Table Editor → Check for: lcars_performance_metrics, lcars_live_updates, lcars_projects

# 3. Test LCARS UI
cd examples/alex-ai-nextjs
npm run dev
open http://localhost:3000/lcars

# 4. Test API endpoints
curl http://localhost:3000/api/lcars?action=status | jq .

# 5. Test webhook integration
curl -X POST https://n8n.pbradygeorgen.com/webhook/lcars-lc-webhook \
  -H "Content-Type: application/json" \
  -d '{"crewMemberId": "captain_picard", "prompt": "Test deployment"}' \
  | jq .
```

---

## 🔍 **TROUBLESHOOTING**

### **n8n API Key Missing**

```bash
# Error: "401 Unauthorized" or "403 Forbidden"
# Solution:
# 1. Visit https://n8n.pbradygeorgen.com
# 2. Settings → API → Create API Key
# 3. Add to ~/.zshrc:
echo 'export N8N_API_KEY="your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### **Webhook 404 Errors**

```bash
# Error: "404 Not Found" when calling webhook
# Solution:
# 1. Verify workflow is active in n8n UI
# 2. Check webhook path in Webhook node matches URL
# 3. Ensure workflow has no errors (check n8n logs)
```

### **Supabase Connection Failed**

```bash
# Error: "TypeError: fetch failed" or "Connection refused"
# Solution:
# 1. Verify SUPABASE_URL in ~/.zshrc is correct
# 2. Check Supabase project is not paused
# 3. Verify SUPABASE_ANON_KEY has correct permissions
# 4. Test connection:
curl -H "apikey: ${SUPABASE_ANON_KEY}" "${SUPABASE_URL}/rest/v1/"
```

### **CORS Errors**

```bash
# Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
# Solution:
# 1. Use n8n API proxy (already implemented): /api/n8n-proxy
# 2. Or configure CORS in n8n: Settings → Security → CORS
```

---

## 📚 **RAG KNOWLEDGE INTEGRATION**

### **Automatic Knowledge Capture**

The deployment script automatically creates a RAG knowledge entry at:
`/tmp/lcars-deployment-knowledge.json`

This captures:
- **Deployment process** for future reference
- **Credential management** best practices
- **Troubleshooting** common issues
- **Integration points** between systems
- **Future enhancements** roadmap

### **Crew Member Relevance**

- **Lt. Commander Geordi La Forge** (Infrastructure): Primary owner of deployment automation
- **Commander Data** (Analytics): Performance monitoring and metrics tracking
- **Lt. Worf** (Security): Credentials management and secure deployment practices

---

## 🚀 **FUTURE ENHANCEMENTS**

### **Planned Improvements**

1. **Fully Automated Deployment**
   ```bash
   ./scripts/deploy-lcars-to-n8n.sh --auto-deploy
   # Automatically imports workflows via API without manual steps
   ```

2. **GitHub Actions Integration**
   ```yaml
   # .github/workflows/deploy-lcars.yml
   on: [push]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy LCARS
           run: ./scripts/deploy-lcars-to-n8n.sh --ci-mode
           env:
             N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
   ```

3. **Health Monitoring**
   ```bash
   # Continuous monitoring of n8n and Supabase
   ./scripts/monitor-lcars-health.sh
   # Alerts on webhook failures, database issues, etc.
   ```

4. **Rollback Capability**
   ```bash
   # Automatic backup before deployment
   # Quick rollback to previous version
   ./scripts/rollback-lcars-deployment.sh --to-version v1.2.3
   ```

5. **Multi-Environment Support**
   ```bash
   # Deploy to different environments
   ./scripts/deploy-lcars-to-n8n.sh --env production
   ./scripts/deploy-lcars-to-n8n.sh --env staging
   ```

---

## 🖖 **SUMMARY**

### **Key Takeaways**

✅ **Unified Credentials**: All in `~/.zshrc`  
✅ **One-Command Deployment**: `./scripts/deploy-lcars-to-n8n.sh`  
✅ **Auto-Sync Environment**: `.env.local` updated automatically  
✅ **RAG Integration**: Knowledge captured for future reference  
✅ **Webhook Automation**: n8n workflows handle LLM routing  
✅ **Database Integration**: Supabase tracks all performance metrics  

### **Current State**

- ✅ Deployment script created and tested
- ✅ Environment variables configured
- ✅ RAG knowledge entry generated
- ⚠️ Manual workflow import required (n8n UI)
- ⚠️ Manual Supabase schema application required

### **Next Phase**

Once `N8N_API_KEY` is added to `~/.zshrc`, the script can be enhanced to fully automate workflow deployment without any manual steps.

---

**Last Updated**: 2025-01-11  
**Script Version**: 1.0.0  
**Status**: Production Ready (Manual Import)  
**Future**: Fully Automated (Requires N8N_API_KEY)

🖖 **Make it so!**

