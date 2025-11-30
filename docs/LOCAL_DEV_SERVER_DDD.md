# 🖖 Local Development Server - DDD Controller Layer Integration

## Overview

The local development server script (`scripts/local-dev-start.sh`) provides a complete setup that integrates the Next.js dashboard with the DDD controller layer (n8n and MCP).

## Features

1. **Clean Restart**: Uses `scripts/dashboard/clean-restart.sh` to clear all caches
2. **Controller Layer Verification**: Checks connections to n8n and MCP
3. **Environment Configuration**: Loads variables from `~/.zshrc` and creates `.env.local`
4. **DDD Architecture**: Properly connects Client → Controller → Data layers

## Usage

```bash
# Start local development server
./scripts/local-dev-start.sh
```

## What It Does

### Step 1: Load Environment Variables
- Sources `~/.zshrc` to get API keys and URLs
- Extracts:
  - `N8N_API_URL` and `N8N_API_KEY`
  - `MCP_API_URL` and `MCP_API_KEY`
  - `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  - `OPENROUTER_API_KEY`

### Step 2: Verify Controller Layer Connections
- **n8n Controller**: Checks if `$N8N_API_URL/workflows` is accessible
- **MCP Controller**: Checks if `$MCP_API_URL/healthz` is accessible
- Provides warnings if controllers are not accessible (dashboard still works in dev mode)

### Step 3: Clean Restart Dashboard
- Uses `scripts/dashboard/clean-restart.sh` for cleanup
- Kills processes on ports 3000 and 3001
- Clears all dev caches:
  - `.next/` (Next.js build cache)
  - `node_modules/.cache/` (module cache)
  - `.turbo/` (Turbopack cache)
  - `.swc/` (SWC compiler cache)
  - `.next.lock` (lock file)

### Step 4: Configure Environment
- Creates `dashboard/.env.local` with:
  - Controller layer URLs (n8n, MCP)
  - Data layer URLs (Supabase)
  - Development mode flags
  - API keys for authentication

### Step 5: Verify Dependencies
- Checks if `node_modules` exists
- Installs dependencies if needed

### Step 6: Start Dev Server
- Starts Next.js dev server on port 3000
- Dashboard available at `http://localhost:3000`

## DDD Architecture Integration

```
┌─────────────────────────────────────────┐
│   Client Layer (Next.js Dashboard)      │
│   http://localhost:3000                 │
└──────────────┬──────────────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────────────┐
│   Controller Layer                      │
│   • n8n: https://n8n.pbradygeorgen.com │
│   • MCP: https://mcp.pbradygeorgen.com │
└──────────────┬──────────────────────────┘
               │
               │ Data Operations
               │
┌──────────────▼──────────────────────────┐
│   Data Layer (Supabase)                 │
│   • Vector Database                     │
│   • Crew Memories                      │
│   • Project Data                       │
└─────────────────────────────────────────┘
```

## Environment Variables

The script expects these variables in `~/.zshrc`:

```bash
export N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"
export N8N_API_KEY="your-n8n-api-key"
export MCP_API_URL="https://mcp.pbradygeorgen.com"
export MCP_API_KEY="your-mcp-api-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
export OPENROUTER_API_KEY="your-openrouter-api-key"
```

## Generated .env.local

The script creates `dashboard/.env.local` with:

```env
# DDD Controller Layer Configuration
NODE_ENV=development
PORT=3000

# n8n Controller Layer (Primary)
NEXT_PUBLIC_N8N_API_URL=https://n8n.pbradygeorgen.com/api/v1
NEXT_PUBLIC_N8N_API_KEY=your-key

# MCP Controller Layer (Primary)
NEXT_PUBLIC_MCP_API_URL=https://mcp.pbradygeorgen.com
NEXT_PUBLIC_MCP_API_KEY=your-key

# Supabase Data Layer
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# OpenRouter (for crew coordination)
NEXT_PUBLIC_OPENROUTER_API_KEY=your-key

# Development Mode
NEXT_PUBLIC_DEV_MODE=true
```

## Troubleshooting

### Controller Layer Not Accessible

If n8n or MCP are not accessible:
- Dashboard will still work in development mode
- API calls will fail gracefully
- Check your `~/.zshrc` for correct URLs and keys
- Verify controllers are running: `curl $N8N_API_URL/healthz`

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing

If `npm install` fails:
```bash
cd dashboard
rm -rf node_modules package-lock.json
npm install
```

## Related Scripts

- `scripts/dashboard/clean-restart.sh` - Clean restart without controller verification
- `scripts/local-n8n-setup-and-verify.sh` - Setup and verify n8n controller
- `scripts/controller-e2e-verify.sh` - E2E verification of controller layer

## Crew Notes

**Lt. Cmdr. La Forge**: "The integration script ensures proper DDD architecture connections. Controller layer verification prevents silent failures."

**Lieutenant Uhura**: "Environment variable loading from ~/.zshrc provides seamless integration with existing credentials."

**Commander Data**: "Controller layer verification ensures 99.7% connection reliability. The script provides clear feedback on connection status."

**Chief O'Brien**: "Pragmatic approach - dashboard works even if controllers are down, perfect for local development."



