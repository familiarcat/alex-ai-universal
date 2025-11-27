#!/bin/bash
# Start Dev Environment with Browser Tabs
# Ensures DDD workflow connections and opens all environments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DASHBOARD_DIR="$PROJECT_ROOT/dashboard"

echo "🖖 Starting Dev Environment with DDD Workflow"
echo "=============================================="
echo ""

# Kill any existing servers
echo "🧹 Cleaning up existing servers..."
lsof -ti:3000,3001 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
cd "$DASHBOARD_DIR"
rm -rf .next .next-3000 .next-3001 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
echo "   ✅ Next.js cache cleared"

# Start server on port 3000 (Main Dashboard)
echo "🚀 Starting Main Dashboard on port 3000..."
cd "$DASHBOARD_DIR"
PORT=3000 N8N_URL=https://n8n.pbradygeorgen.com npm run dev > /tmp/dashboard-3000.log 2>&1 &
DASHBOARD_3000_PID=$!
echo "   ✅ Started (PID: $DASHBOARD_3000_PID)"
echo "   📋 Logs: /tmp/dashboard-3000.log"

# Start server on port 3001 (Live Server)
echo "🚀 Starting Live Server on port 3001..."
cd "$DASHBOARD_DIR"
PORT=3001 N8N_URL=https://n8n.pbradygeorgen.com npm run dev > /tmp/dashboard-3001.log 2>&1 &
DASHBOARD_3001_PID=$!
echo "   ✅ Started (PID: $DASHBOARD_3001_PID)"
echo "   📋 Logs: /tmp/dashboard-3001.log"

# Save PIDs
echo "$DASHBOARD_3000_PID" > /tmp/dashboard-3000.pid
echo "$DASHBOARD_3001_PID" > /tmp/dashboard-3001.pid

echo ""
echo "⏳ Waiting for servers to be ready..."
echo "   This typically takes 30-60 seconds for first build"
echo ""

# Wait for servers to be ready
MAX_WAIT=120
WAIT_COUNT=0
PORT_3000_READY=false
PORT_3001_READY=false

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  # Check port 3000
  if ! $PORT_3000_READY; then
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
      PORT_3000_READY=true
      echo "   ✅ Port 3000 is ready!"
    fi
  fi

  # Check port 3001
  if ! $PORT_3001_READY; then
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
      PORT_3001_READY=true
      echo "   ✅ Port 3001 is ready!"
    fi
  fi

  # If both are ready, break
  if $PORT_3000_READY && $PORT_3001_READY; then
    break
  fi

  sleep 2
  WAIT_COUNT=$((WAIT_COUNT + 2))
  echo "   ⏳ Waiting... (${WAIT_COUNT}s/${MAX_WAIT}s)"
done

if ! $PORT_3000_READY || ! $PORT_3001_READY; then
  echo ""
  echo "⚠️  Warning: Some servers may not be fully ready"
  echo "   Port 3000: $([ "$PORT_3000_READY" = true ] && echo '✅ Ready' || echo '❌ Not ready')"
  echo "   Port 3001: $([ "$PORT_3001_READY" = true ] && echo '✅ Ready' || echo '❌ Not ready')"
  echo "   Continuing anyway..."
fi

echo ""
echo "🌐 Opening browser tabs for all environments..."
echo ""

# Open browser tabs
if command -v open > /dev/null; then
  # macOS
  echo "   📊 Opening Main Dashboard (port 3000)..."
  open -a "Google Chrome" "http://localhost:3000/dashboard" 2>/dev/null || \
  open -a "Safari" "http://localhost:3000/dashboard" 2>/dev/null || \
  open "http://localhost:3000/dashboard" 2>/dev/null
  
  sleep 1
  
  echo "   🚀 Opening Live Server (port 3001)..."
  open -a "Google Chrome" "http://localhost:3001/dashboard" 2>/dev/null || \
  open -a "Safari" "http://localhost:3001/dashboard" 2>/dev/null || \
  open "http://localhost:3001/dashboard" 2>/dev/null
  
  sleep 1
  
  echo "   🔗 Opening DDD Workflow Status..."
  open -a "Google Chrome" "http://localhost:3000/api/mcp/status" 2>/dev/null || \
  open -a "Safari" "http://localhost:3000/api/mcp/status" 2>/dev/null || \
  open "http://localhost:3000/api/mcp/status" 2>/dev/null
  
elif command -v xdg-open > /dev/null; then
  # Linux
  xdg-open "http://localhost:3000/dashboard" 2>/dev/null &
  sleep 1
  xdg-open "http://localhost:3001/dashboard" 2>/dev/null &
  sleep 1
  xdg-open "http://localhost:3000/api/mcp/status" 2>/dev/null &
elif command -v start > /dev/null; then
  # Windows
  start "http://localhost:3000/dashboard"
  timeout /t 1 >nul
  start "http://localhost:3001/dashboard"
  timeout /t 1 >nul
  start "http://localhost:3000/api/mcp/status"
fi

echo ""
echo "✅ Dev environment started!"
echo ""
echo "📊 Running Environments:"
echo "   • Main Dashboard: http://localhost:3000/dashboard"
echo "   • Live Server:    http://localhost:3001/dashboard"
echo "   • DDD Status:     http://localhost:3000/api/mcp/status"
echo ""
echo "🔌 DDD Workflow Connections:"
echo "   • n8n: https://n8n.pbradygeorgen.com"
echo "   • Supabase: Live instance (from env)"
echo "   • MCP: https://mcp.pbradygeorgen.com (fallback)"
echo ""
echo "💡 To stop servers:"
echo "   lsof -ti:3000,3001 | xargs kill -9"
echo ""

