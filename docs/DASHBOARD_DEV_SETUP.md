# 🖖 Dashboard Development Environment Setup

**Date:** January 24, 2025  
**Status:** Setup Guide

---

## 🚨 Current Issue

The dashboard has corrupted `node_modules` causing:
- `ERR_INVALID_PACKAGE_CONFIG` errors
- Next.js unable to start
- Package.json corruption in dependencies

---

## ✅ Solution

### Option 1: Quick Fix (Recommended)

```bash
# Run setup script
bash scripts/setup-dashboard-dev.sh
```

This will:
1. Clean corrupted cache
2. Reinstall Next.js
3. Start dashboard dev server

### Option 2: Full Reinstall

```bash
cd dashboard
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Option 3: Manual Start (If dependencies are OK)

```bash
cd dashboard
npm run dev
```

---

## 🧪 Testing E2E Integration

Once dashboard is running:

```bash
# Run E2E test
node scripts/test-dashboard-e2e-integration.js

# Or test manually
curl http://localhost:3000/api/health
curl 'http://localhost:3000/api/controller?action=health'
```

---

## 📊 Expected Endpoints

When dashboard is running, these endpoints should be available:

- `http://localhost:3000/` - Dashboard UI
- `http://localhost:3000/api/health` - Health check
- `http://localhost:3000/api/controller?action=health` - Controller health
- `http://localhost:3000/api/controller?action=tools` - List MCP tools
- `http://localhost:3000/api/mcp/status` - MCP status
- `http://localhost:3000/api/agent/engage` - Agent engage (POST)

---

## 🔍 Troubleshooting

### Issue: Package config errors

**Solution:**
```bash
cd dashboard
rm -rf node_modules
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: Dashboard won't start

**Check:**
1. Node.js version (should be >= 18)
2. npm version (should be >= 8)
3. Dependencies installed
4. No syntax errors in code

---

## 🎯 Browser Testing

Once dashboard is running:

1. **Open browser:** http://localhost:3000
2. **Test Controller API:**
   - Open DevTools Console
   - Run: `fetch('/api/controller?action=health').then(r => r.json()).then(console.log)`
3. **Test Content Sync:**
   - Create/edit a project
   - Verify sync works
4. **Test Agent Engage:**
   - Use dashboard UI
   - Verify controller integration

---

**Status:** Setup guide ready  
**Next:** Run `bash scripts/setup-dashboard-dev.sh` to start dashboard

