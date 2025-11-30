# 🖖 Local Migration Testing Guide

**Mission:** Test hybrid migration system locally while keeping UI connected to DDD framework  
**Status:** Ready for local testing

---

## 🎯 Overview

This guide explains how to test the hybrid migration system locally without deploying to Vercel or AWS, while maintaining full DDD framework connectivity (n8n → MCP → Supabase).

---

## 🚀 Quick Start

### Run Local Test

```bash
./scripts/test-hybrid-migration-local.sh
```

This will:
1. ✅ Test DDD framework connections (n8n, MCP, Supabase)
2. ✅ Validate migration readiness
3. ✅ Configure local environment variables
4. ✅ Start local Next.js dev server
5. ✅ Test local API endpoints
6. ✅ Perform dry-run migration validation

### Run Without Starting Server

```bash
./scripts/test-hybrid-migration-local.sh --no-server
```

Useful for:
- Quick validation checks
- Testing DDD connections only
- Checking prerequisites

---

## 📋 What Gets Tested

### 1. DDD Framework Connections

**Tests:**
- ✅ n8n server accessibility (`$N8N_URL`)
- ✅ MCP server accessibility (`$MCP_URL`)
- ✅ Supabase connectivity (`$SUPABASE_URL`)

**Note:** Some services may not be publicly accessible, which is normal.

### 2. Migration Readiness

**Validates:**
- ✅ Vercel CLI installation
- ✅ AWS CLI installation
- ✅ AWS credentials configuration
- ✅ Git installation
- ✅ Milestone tag existence
- ✅ Dashboard directory structure
- ✅ package.json presence

### 3. Local Environment

**Actions:**
- ✅ Checks for `.env.local` file
- ✅ Creates template if missing
- ✅ Configures DDD environment variables:
  - `NEXT_PUBLIC_N8N_URL`
  - `NEXT_PUBLIC_MCP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Local Dev Server

**Starts:**
- ✅ Next.js dev server on `http://localhost:3000`
- ✅ Background process (non-blocking)
- ✅ Logs to `/tmp/nextjs-dev.log`

**Features:**
- Automatically detects if port 3000 is in use
- Waits for server to be ready
- Provides access URL and log location

### 5. API Endpoint Testing

**Tests:**
- ✅ `/api/health` (if exists)
- ✅ `/api/mcp/status` (DDD connection)
- ✅ `/dashboard` (main page)

### 6. Dry-Run Migration

**Shows:**
- ✅ What Phase 1 would do (Vercel deployment)
- ⚠️ What Phase 2 would do (AWS infrastructure)
- ✅ What Phase 3 would do (Integration testing)

**Note:** This is a DRY RUN - no actual deployment occurs.

---

## 🔧 Local Development Workflow

### Standard Workflow

1. **Start Local Test:**
   ```bash
   ./scripts/test-hybrid-migration-local.sh
   ```

2. **Access Local UI:**
   - Open: `http://localhost:3000`
   - Dashboard should be connected to DDD framework
   - All API endpoints should work

3. **Test DDD Integration:**
   - Navigate to `/dashboard`
   - Check MCP status: `/api/mcp/status`
   - Verify n8n webhooks are accessible
   - Test Supabase connections

4. **Monitor Logs:**
   ```bash
   tail -f /tmp/nextjs-dev.log
   ```

5. **Stop Server (when done):**
   ```bash
   pkill -f 'next dev'
   # or
   lsof -ti:3000 | xargs kill
   ```

### Development Mode

For active development while testing:

1. **Terminal 1 - Keep Test Running:**
   ```bash
   ./scripts/test-hybrid-migration-local.sh
   ```

2. **Terminal 2 - Make Code Changes:**
   - Edit files in `dashboard/`
   - Next.js will hot-reload automatically
   - Changes reflect immediately

3. **Terminal 3 - Monitor Logs:**
   ```bash
   tail -f /tmp/nextjs-dev.log
   ```

---

## 🔍 Validation Checklist

After running the test, verify:

- [ ] DDD connections tested (n8n, MCP, Supabase)
- [ ] All prerequisites validated
- [ ] Local environment configured
- [ ] Dev server started successfully
- [ ] API endpoints responding
- [ ] Dashboard accessible at `http://localhost:3000`
- [ ] DDD framework connections working in UI

---

## 🛠️ Troubleshooting

### Port 3000 Already in Use

**Symptom:**
```
⚠️  Port 3000 already in use
```

**Solution:**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill

# Or use different port
cd dashboard
PORT=3001 npm run dev
```

### DDD Connections Fail

**Symptom:**
```
⚠️  (may be normal if not publicly accessible)
```

**Solutions:**
1. **n8n/MCP not publicly accessible:**
   - This is normal if services are behind firewall
   - Local UI will still work via API routes
   - Test actual connections in the browser

2. **Supabase connection issues:**
   - Verify credentials in `~/.zshrc`
   - Check `.env.local` file
   - Test Supabase URL directly

### Dev Server Won't Start

**Symptom:**
```
⚠️  Server may still be starting
```

**Solutions:**
1. Check logs:
   ```bash
   tail -f /tmp/nextjs-dev.log
   ```

2. Check for errors:
   ```bash
   cd dashboard
   npm run dev
   ```

3. Clear caches:
   ```bash
   rm -rf dashboard/.next
   rm -rf dashboard/node_modules/.cache
   ```

### Missing Prerequisites

**Symptom:**
```
❌ Some prerequisites are missing
```

**Solutions:**
1. **Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **AWS CLI:**
   ```bash
   # macOS
   brew install awscli
   
   # Or download from AWS
   ```

3. **Git:**
   ```bash
   # Usually pre-installed
   git --version
   ```

---

## 📊 Expected Output

### Successful Test

```
🖖 Local Hybrid Migration Testing
   Testing Migration System with Local DDD Framework
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Testing DDD Framework Connections
   Testing n8n (https://n8n.pbradygeorgen.com)... ✅
   Testing MCP (https://mcp.pbradygeorgen.com)... ✅
   Testing Supabase (...)... ✅

✅ Validating Migration Readiness
   Vercel CLI... ✅ (x.x.x)
   AWS CLI... ✅ (x.x.x)
   AWS Credentials... ✅ Configured
   Git... ✅ (x.x.x)
   Milestone Tag... ✅ (63322dd)
   Dashboard Directory... ✅
   Dashboard package.json... ✅

✅ All prerequisites ready

🔐 Testing Local Environment Configuration
   ✅ .env.local exists

🚀 Starting Local Development Server
   ✅ Server started (PID: xxxxx)
   Access at: http://localhost:3000
   Logs: /tmp/nextjs-dev.log

🧪 Testing Local API Endpoints
   GET /api/mcp/status... ✅
   GET /dashboard... ✅

🔍 Dry-Run: Migration Validation
   This would execute:
   1. ✅ Phase 1: Vercel Frontend Deployment
   2. ⚠️  Phase 2: AWS Backend Infrastructure
   3. ✅ Phase 3: Integration Testing

✅ Local Testing Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Summary:
   • DDD Framework: Connected (n8n → MCP → Supabase)
   • Local Dev Server: Running on http://localhost:3000
   • Migration Readiness: Validated
```

---

## 🎯 Next Steps

After successful local testing:

1. **Verify UI Functionality:**
   - Open `http://localhost:3000`
   - Test all dashboard features
   - Verify DDD connections work

2. **When Ready for Migration:**
   ```bash
   ./scripts/hybrid-migration-vercel-aws.sh
   ```

3. **Monitor Migration:**
   - Follow interactive prompts
   - Check state file: `.hybrid-migration-state.json`
   - Review rollback log if needed

---

## 📚 Related Documentation

- **Migration Guide:** `docs/HYBRID_MIGRATION_GUIDE.md`
- **Strategy Document:** `docs/VERCEL_AWS_DEPLOYMENT_STRATEGY.md`
- **DDD Architecture:** `docs/DDD-ARCHITECTURE-COMPLETE.md`

---

**Status:** ✅ Ready for local testing  
**DDD Framework:** Connected and tested  
**Local Server:** Starts automatically

