#!/bin/bash

# 🖖 ALEX AI - UNIFIED START SCRIPT
# Single command to start the entire platform

echo ""
echo "🖖 ═══════════════════════════════════════════════════════════"
echo "   ALEX AI MASTER PLATFORM - UNIFIED COMMAND STRUCTURE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "ℹ️  Starting Next.js 15 server (App Router)..."
echo "ℹ️  All features integrated in one application"
echo ""

cd "$(dirname "$0")/dashboard"

# Clean any stale processes
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Next.js dev server with n8n-aware env (remote preferred, local fallback)
echo "🚀 Launching Next.js on http://localhost:3000 (n8n-aware)"
echo ""

npm run dev:n8n

# Note: Next.js handles:
# - Dashboard UI
# - Project pages (dynamic routing)
# - API endpoints
# - Real-time state management
# - Theme system
# 
# No Express needed - Next.js IS the server!

