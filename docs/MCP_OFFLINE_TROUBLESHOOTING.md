# MCP & OpenRouter Offline Troubleshooting

## Issue
Dashboard shows "MCP: OFFLINE" and "OpenRouter: OFFLINE" even though services may be operational.

## Root Cause
Environment variables are not configured in `dashboard/.env.local`. Next.js requires environment variables to be in the dashboard directory, not the root.

## Quick Fix

### Step 1: Create dashboard/.env.local

```bash
cd dashboard
touch .env.local
```

### Step 2: Add Required Variables

Add these to `dashboard/.env.local`:

```bash
# Supabase (Local MCP) - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenRouter - REQUIRED
OPENROUTER_API_KEY=your-openrouter-api-key

# Optional: Remote MCP
NEXT_PUBLIC_MCP_URL=https://mcp.pbradygeorgen.com
MCP_API_KEY=your-mcp-api-key
```

### Step 3: Get Your Credentials

**Supabase:**
1. Go to https://supabase.com
2. Open your project
3. Settings → API
4. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**OpenRouter:**
1. Go to https://openrouter.ai/keys
2. Create or copy your API key → `OPENROUTER_API_KEY`

### Step 4: Restart Next.js Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd dashboard
npm run dev
```

## Verify Configuration

Run the diagnostic script:

```bash
node scripts/diagnose-mcp-status.js
```

This will test:
- ✅ Environment variables are set
- ✅ Supabase connection works
- ✅ OpenRouter connection works

## Expected Results

After setup, the dashboard should show:
- ✅ MCP: ONLINE (if Supabase is configured)
- ✅ OpenRouter: ONLINE (if API key is configured)

## Common Issues

### Issue: OpenRouter shows offline but diagnostic says it's online

**Cause:** Next.js dev server needs to be restarted to load new environment variables.

**Fix:** Stop and restart `npm run dev`

### Issue: Supabase connection fails

**Possible causes:**
1. Invalid credentials - double-check your Supabase URL and anon key
2. `knowledge_base` table doesn't exist - run your Supabase migrations
3. Network/firewall blocking connection

**Fix:** 
- Verify credentials in Supabase dashboard
- Check Supabase project is active (not paused)
- Ensure `knowledge_base` table exists

### Issue: Environment variables not loading

**Cause:** Variables are in wrong location or wrong format

**Fix:**
- Ensure file is `dashboard/.env.local` (not root `.env.local`)
- Ensure no spaces around `=` sign: `KEY=value` not `KEY = value`
- Ensure no quotes unless needed: `KEY=value` not `KEY="value"` (unless value has spaces)

## Automated Setup

Use the setup script for interactive configuration:

```bash
node scripts/setup-dashboard-env.js
```

This will:
1. Check current configuration
2. Prompt for missing variables
3. Create/update `dashboard/.env.local`
4. Provide next steps

## Status API Diagnostics

The status API (`/api/mcp/status`) provides detailed diagnostics:

```bash
curl http://localhost:3000/api/mcp/status | jq
```

This returns:
- Service status (online/offline)
- Configuration status (configured/not configured)
- Error messages for each service
- Detailed diagnostics

## Architecture Notes

**DDD Architecture:**
- **Data Layer:** Supabase (local MCP), OpenRouter API
- **Controller Layer:** `/api/mcp/status` route
- **Client Layer:** Dashboard UI components

**Environment Variable Loading:**
- Next.js loads `.env.local` from the `dashboard/` directory
- Server-side API routes can access all env vars
- Client components can only access `NEXT_PUBLIC_*` vars
- Variables must be set before starting the dev server

## Related Files

- `dashboard/app/api/mcp/status/route.ts` - Status API endpoint
- `dashboard/components/MCPDashboardSection.tsx` - Dashboard UI
- `scripts/diagnose-mcp-status.js` - Diagnostic script
- `scripts/setup-dashboard-env.js` - Setup helper

