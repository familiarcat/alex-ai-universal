#!/bin/bash
# Start both Next.js dev servers for real-time sync demo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DASHBOARD_DIR="$PROJECT_ROOT/dashboard"

echo "🖖 Starting Dev Servers for Real-Time Sync Demo"
echo "================================================"
echo ""

# Kill any existing servers
echo "🧹 Cleaning up existing servers..."
lsof -ti:3000,3001 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
cd "$DASHBOARD_DIR"
rm -rf .next
rm -rf node_modules/.cache
echo "   ✅ Next.js cache cleared"

# Start server on port 3000 (Data Dashboard) - Standard Next.js dev
echo "🚀 Starting Data Dashboard on port 3000..."
cd "$DASHBOARD_DIR"
PORT=3000 N8N_URL=https://n8n.pbradygeorgen.com npm run dev > /tmp/dashboard-3000.log 2>&1 &
DASHBOARD_3000_PID=$!
echo "   ✅ Started (PID: $DASHBOARD_3000_PID)"
echo "   📋 Logs: /tmp/dashboard-3000.log"

# Start server on port 3001 (Templating Dashboard) - Standard Next.js dev  
echo "🚀 Starting Templating Dashboard on port 3001..."
cd "$DASHBOARD_DIR"
PORT=3001 N8N_URL=https://n8n.pbradygeorgen.com npm run dev > /tmp/dashboard-3001.log 2>&1 &
DASHBOARD_3001_PID=$!
echo "   ✅ Started (PID: $DASHBOARD_3001_PID)"
echo "   📋 Logs: /tmp/dashboard-3001.log"
echo "   🔌 Socket.IO: /api/socket"

echo ""
echo "⏳ Servers are starting and compiling..."
echo "   This typically takes 30-60 seconds for first build"
echo ""
echo "💡 To monitor progress, run:"
echo "   npm run dev:servers:monitor"
echo ""
echo "📊 Or check manually:"
echo "   curl http://localhost:3000"
echo "   curl http://localhost:3001"
echo ""

# Save PIDs for later reference
echo "$DASHBOARD_3000_PID" > /tmp/dashboard-3000.pid
echo "$DASHBOARD_3001_PID" > /tmp/dashboard-3001.pid

echo "✅ Both servers started successfully!"
echo "   They will be ready shortly..."

