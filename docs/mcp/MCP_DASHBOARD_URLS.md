# 🌐 MCP Dashboard URLs Reference

**Date:** January 21, 2025  
**Purpose:** Quick reference for accessing MCP Dashboard locally and in production

---

## 🏠 Local Development URLs

### Main Dashboard
- **Primary Dashboard:** `http://localhost:3000/mcp`
- **Root (Redirects):** `http://localhost:3000/`

### Workflow Pages
- **Workflow Editor:** `http://localhost:3000/workflows`
- **Workflow Management:** `http://localhost:3000/workflows/management`

### System Pages
- **System Settings:** `http://localhost:3000/settings`
- **Error Dashboard:** `http://localhost:3000/errors`

### API Endpoints (Local)
- **System Status:** `http://localhost:3000/api/mcp/status`
- **Workflow Storage:** `http://localhost:3000/api/mcp/workflows/storage`
- **Workflow Execution:** `http://localhost:3000/api/mcp/workflows/execute`
- **Execution History:** `http://localhost:3000/api/mcp/workflows/executions`
- **Crew Roster:** `http://localhost:3000/api/mcp/crew/roster`
- **Settings:** `http://localhost:3000/api/mcp/settings`
- **Error List:** `http://localhost:3000/api/mcp/errors`

---

## ☁️ Cloud Deployment URLs

### Main Dashboard
- **Primary Dashboard:** `https://mcp.pbradygeorgen.com/mcp`
- **Root (Redirects):** `https://mcp.pbradygeorgen.com/`

### Workflow Pages
- **Workflow Editor:** `https://mcp.pbradygeorgen.com/workflows`
- **Workflow Management:** `https://mcp.pbradygeorgen.com/workflows/management`

### System Pages
- **System Settings:** `https://mcp.pbradygeorgen.com/settings`
- **Error Dashboard:** `https://mcp.pbradygeorgen.com/errors`

### API Endpoints (Cloud)
- **System Status:** `https://mcp.pbradygeorgen.com/api/mcp/status`
- **Workflow Storage:** `https://mcp.pbradygeorgen.com/api/mcp/workflows/storage`
- **Workflow Execution:** `https://mcp.pbradygeorgen.com/api/mcp/workflows/execute`
- **Execution History:** `https://mcp.pbradygeorgen.com/api/mcp/workflows/executions`
- **Crew Roster:** `https://mcp.pbradygeorgen.com/api/mcp/crew/roster`
- **Settings:** `https://mcp.pbradygeorgen.com/api/mcp/settings`
- **Error List:** `https://mcp.pbradygeorgen.com/api/mcp/errors`

### MCP Server API (Direct)
- **Health Check:** `https://mcp.pbradygeorgen.com:5679/healthz`
- **MCP API Base:** `https://mcp.pbradygeorgen.com:5679/api/`

---

## 🧪 Testing URLs

### Local Testing

**Start Development Server:**
```bash
cd dashboard
npm run dev
```

**Access:**
- Dashboard: `http://localhost:3000/mcp`
- Workflow Editor: `http://localhost:3000/workflows`
- Settings: `http://localhost:3000/settings`

**Test API Endpoints:**
```bash
# System Status
curl http://localhost:3000/api/mcp/status

# Crew Roster
curl http://localhost:3000/api/mcp/crew/roster

# Workflow List
curl http://localhost:3000/api/mcp/workflows/storage
```

### Cloud Testing

**Access:**
- Dashboard: `https://mcp.pbradygeorgen.com/mcp`
- Workflow Editor: `https://mcp.pbradygeorgen.com/workflows`
- Settings: `https://mcp.pbradygeorgen.com/settings`

**Test API Endpoints:**
```bash
# System Status
curl https://mcp.pbradygeorgen.com/api/mcp/status

# Crew Roster (requires API key)
curl -H "X-MCP-API-KEY: your-api-key" \
  https://mcp.pbradygeorgen.com/api/mcp/crew/roster

# MCP Server Health
curl https://mcp.pbradygeorgen.com:5679/healthz
```

---

## 🔧 Development Workflow

### Local Development

1. **Start Dashboard:**
   ```bash
   cd dashboard
   npm run dev
   ```

2. **Access Dashboard:**
   - Open browser: `http://localhost:3000/mcp`

3. **Configure MCP Server:**
   - Go to Settings: `http://localhost:3000/settings`
   - Set MCP Server URL: `https://mcp.pbradygeorgen.com`
   - Enter API key
   - Test connection

4. **Test Workflows:**
   - Create workflow: `http://localhost:3000/workflows`
   - Manage workflows: `http://localhost:3000/workflows/management`

### Production Testing

1. **Access Dashboard:**
   - Open browser: `https://mcp.pbradygeorgen.com/mcp`

2. **Verify Services:**
   - Check system status indicators
   - Verify MCP server connection
   - Verify OpenRouter connection

3. **Test Features:**
   - Create and execute workflow
   - Monitor executions
   - Check error dashboard
   - Update settings

---

## 📊 Quick Reference Table

| Feature | Local URL | Cloud URL |
|---------|----------|-----------|
| **Main Dashboard** | `http://localhost:3000/mcp` | `https://mcp.pbradygeorgen.com/mcp` |
| **Workflow Editor** | `http://localhost:3000/workflows` | `https://mcp.pbradygeorgen.com/workflows` |
| **Workflow Management** | `http://localhost:3000/workflows/management` | `https://mcp.pbradygeorgen.com/workflows/management` |
| **System Settings** | `http://localhost:3000/settings` | `https://mcp.pbradygeorgen.com/settings` |
| **Error Dashboard** | `http://localhost:3000/errors` | `https://mcp.pbradygeorgen.com/errors` |
| **API Status** | `http://localhost:3000/api/mcp/status` | `https://mcp.pbradygeorgen.com/api/mcp/status` |
| **MCP Server Health** | N/A (local) | `https://mcp.pbradygeorgen.com:5679/healthz` |

---

## 🚀 Deployment Notes

### Port Configuration

**Local Development:**
- Dashboard: `localhost:3000` (Next.js default)
- MCP Server: `localhost:5679` (if running locally)

**Cloud Deployment:**
- Dashboard: `mcp.pbradygeorgen.com:443` (HTTPS)
- MCP Server: `mcp.pbradygeorgen.com:5679` (HTTPS)

### Environment Variables

**Local (.env.local):**
```bash
NEXT_PUBLIC_MCP_SERVER_URL=https://mcp.pbradygeorgen.com
MCP_API_KEY=your-api-key
OPENROUTER_API_KEY=your-openrouter-key
```

**Production:**
- Set in deployment environment
- Never commit to repository
- Use secure secret management

---

## ✅ Quick Start

### Local Development
1. `cd dashboard`
2. `npm run dev`
3. Open `http://localhost:3000/mcp`

### Production Access
1. Open `https://mcp.pbradygeorgen.com/mcp`
2. Configure settings if needed
3. Start using the dashboard!

---

**Status:** ✅ URLs Documented

**Last Updated:** January 21, 2025

