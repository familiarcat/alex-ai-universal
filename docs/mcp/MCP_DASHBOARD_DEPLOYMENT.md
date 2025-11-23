# 🚀 MCP Dashboard Deployment Guide

**Date:** January 21, 2025  
**Target:** mcp.pbradygeorgen.com  
**Status:** ✅ Ready for Deployment

---

## 🎯 Overview

The MCP Dashboard is the central hub for all MCP operations, replacing n8n as the primary interface. It provides:

- **Central Control Hub** - Single entry point for all MCP features
- **System Overview** - Real-time stats and metrics
- **Quick Actions** - Fast access to all features
- **Execution Monitoring** - Real-time workflow execution tracking
- **System Status** - Health monitoring for all services

---

## 📊 Dashboard Features

### Main Dashboard (`/mcp`)

**Components:**
- System stats (workflows, executions, crew, success rate)
- Quick action cards (Create Workflow, Manage, Settings, Errors, Crew)
- Recent executions monitor
- System status indicators
- Navigation to all MCP features

**Stats Displayed:**
- Total workflows (with active count)
- Total executions (with running count)
- Crew members (total and active)
- Success rate (with error count)

**Quick Actions:**
- Create Workflow → `/workflows`
- Manage Workflows → `/workflows/management`
- System Settings → `/settings`
- Error Dashboard → `/errors`
- Crew Coordination → `/workflows` (with crew panel)

---

## 🏗️ Architecture

### Pages Structure

```
/
├── / (root) → Redirects to /mcp
├── /mcp → Main MCP Dashboard
├── /workflows → Workflow Editor
├── /workflows/management → Workflow Management
├── /settings → System Settings
└── /errors → Error Dashboard
```

### API Endpoints

```
/api/mcp/
├── status → System health status
├── workflows/
│   ├── execute → Execute workflows
│   ├── save → Save workflow definitions
│   ├── storage → Workflow CRUD
│   └── executions → Execution history
├── crew/
│   └── roster → Crew member listing
├── settings/
│   ├── GET/POST → Settings management
│   └── test → Connection testing
└── errors/
    ├── GET → List errors
    ├── [id]/resolve → Resolve error
    └── [id]/ignore → Ignore error
```

---

## 🚀 Deployment to mcp.pbradygeorgen.com

### Option 1: Deploy Dashboard to mcp.pbradygeorgen.com

The dashboard is a Next.js application that can be deployed alongside the MCP server.

**Steps:**

1. **Build the Dashboard**
   ```bash
   cd dashboard
   npm run build
   ```

2. **Deploy to EC2**
   - The dashboard can run on the same EC2 instance as the MCP server
   - Use Nginx to route `/` to the Next.js dashboard
   - Route `/api/mcp/*` to the MCP server API

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name mcp.pbradygeorgen.com;

       # Dashboard (Next.js)
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # MCP API
       location /api/mcp/ {
           proxy_pass http://localhost:5679/api/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Option 2: Separate Deployment

Deploy the dashboard separately and configure it to connect to `mcp.pbradygeorgen.com` for API calls.

**Environment Variables:**
```bash
NEXT_PUBLIC_MCP_SERVER_URL=https://mcp.pbradygeorgen.com
MCP_API_KEY=your-api-key
OPENROUTER_API_KEY=your-openrouter-key
```

---

## 🔧 Configuration

### Environment Variables

**Required:**
- `NEXT_PUBLIC_MCP_SERVER_URL` - MCP server URL (default: https://mcp.pbradygeorgen.com)
- `MCP_API_KEY` - MCP server API key
- `OPENROUTER_API_KEY` - OpenRouter API key (for LLM calls)

**Optional:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (for RAG)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### Next.js Configuration

The dashboard uses:
- **Client-side rendering** for interactive components
- **API routes** for backend communication
- **Dynamic imports** for code splitting
- **React Flow** for workflow visualization

---

## 📊 Dashboard Components

### Main Dashboard (`/mcp`)

**Features:**
- Real-time system stats
- Quick action navigation
- Execution monitoring widget
- System status indicators
- Auto-refresh every 30 seconds

**Stats API:**
- `/api/mcp/status` - System health
- `/api/mcp/workflows/storage` - Workflow stats
- `/api/mcp/workflows/executions` - Execution stats

### Workflow Editor (`/workflows`)

**Features:**
- Visual workflow builder (React Flow)
- Node configuration panels
- Crew coordination panel
- Execution monitor
- Save/load workflows

### Workflow Management (`/workflows/management`)

**Features:**
- Workflow list view
- Search and filter
- Bulk operations
- Workflow metadata

### System Settings (`/settings`)

**Features:**
- MCP server configuration
- OpenRouter settings
- Crew preferences
- Notification settings
- Connection testing

### Error Dashboard (`/errors`)

**Features:**
- Error tracking
- Error resolution
- Filter by status
- Detailed error views

---

## 🎯 Usage

### Accessing the Dashboard

1. **Navigate to:** `https://mcp.pbradygeorgen.com/mcp`
2. **Or root:** `https://mcp.pbradygeorgen.com/` (redirects to `/mcp`)

### Quick Start

1. **View System Status** - Check MCP and OpenRouter connectivity
2. **Create Workflow** - Click "Create Workflow" quick action
3. **Monitor Executions** - View recent executions in the monitor widget
4. **Configure Settings** - Set up MCP server and OpenRouter in Settings

---

## 🔒 Security

### API Authentication

All MCP API calls require:
- `X-MCP-API-KEY` header for authentication
- API key stored in environment variables
- Never exposed to client-side code

### CORS Configuration

If deploying separately:
- Configure CORS on MCP server to allow dashboard origin
- Use HTTPS for all connections
- Validate API keys server-side

---

## 📈 Performance

### Optimization

- **Code Splitting** - Dynamic imports for large components
- **Caching** - API responses cached where appropriate
- **Lazy Loading** - Components loaded on demand
- **Real-time Updates** - Efficient polling (30s intervals)

### Monitoring

- Dashboard auto-refreshes stats every 30 seconds
- Execution monitor updates in real-time
- System status checked on page load and refresh

---

## 🐛 Troubleshooting

### Dashboard Not Loading

1. Check Next.js server is running
2. Verify environment variables are set
3. Check browser console for errors
4. Verify API endpoints are accessible

### API Connection Issues

1. Test MCP server: `curl https://mcp.pbradygeorgen.com/healthz`
2. Verify API key in settings
3. Check CORS configuration
4. Review network tab in browser dev tools

### Stats Not Updating

1. Check API endpoints are responding
2. Verify auto-refresh interval
3. Check browser console for errors
4. Manually refresh the page

---

## 📚 Related Documentation

- `docs/MCP_COMPREHENSIVE_DASHBOARD_IMPLEMENTATION_PLAN.md` - Implementation details
- `docs/CREW_UI_UX_DEEP_DIVE_ANALYSIS.md` - UI/UX analysis
- `docs/MCP_REMOTE_SERVER_ARCHITECTURE.md` - MCP server architecture

---

## ✅ Deployment Checklist

- [ ] Build Next.js dashboard (`npm run build`)
- [ ] Configure environment variables
- [ ] Set up Nginx routing (if deploying together)
- [ ] Configure SSL certificate (Let's Encrypt)
- [ ] Test all API endpoints
- [ ] Verify dashboard loads correctly
- [ ] Test workflow creation
- [ ] Test execution monitoring
- [ ] Verify system settings work
- [ ] Test error dashboard

---

**Status:** ✅ Ready for Deployment

**Next Step:** Deploy to mcp.pbradygeorgen.com

