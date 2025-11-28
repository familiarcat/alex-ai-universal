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

echo ""
echo "⏳ Waiting for servers to be ready (checking every 2 seconds)..."
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
  if [ $((WAIT_COUNT % 10)) -eq 0 ]; then
    echo "   ⏳ Still waiting... (${WAIT_COUNT}s/${MAX_WAIT}s)"
  fi
done

# Open browser tabs
if $PORT_3000_READY || $PORT_3001_READY; then
  echo ""
  echo "🌐 Opening browser tabs..."
  echo ""
  
  if command -v open > /dev/null; then
    # macOS
    if $PORT_3000_READY; then
      echo "   📊 Opening Data Dashboard..."
      open -a "Google Chrome" "http://localhost:3000/dashboard" 2>/dev/null || \
      open -a "Safari" "http://localhost:3000/dashboard" 2>/dev/null || \
      open "http://localhost:3000/dashboard" 2>/dev/null
      sleep 1
    fi
    
    if $PORT_3001_READY; then
      echo "   🚀 Opening Templating Dashboard..."
      open -a "Google Chrome" "http://localhost:3001/dashboard" 2>/dev/null || \
      open -a "Safari" "http://localhost:3001/dashboard" 2>/dev/null || \
      open "http://localhost:3001/dashboard" 2>/dev/null
      sleep 1
    fi
    
    echo "   🔗 Opening MCP Status..."
    open -a "Google Chrome" "http://localhost:3000/api/mcp/status" 2>/dev/null || \
    open -a "Safari" "http://localhost:3000/api/mcp/status" 2>/dev/null || \
    open "http://localhost:3000/api/mcp/status" 2>/dev/null
  else
    echo "   ⚠️  'open' command not available. Please open manually:"
    if $PORT_3000_READY; then
      echo "      • Data Dashboard: http://localhost:3000/dashboard"
    fi
    if $PORT_3001_READY; then
      echo "      • Templating Dashboard: http://localhost:3001/dashboard"
    fi
    echo "      • MCP Status: http://localhost:3000/api/mcp/status"
  fi
fi

echo ""
echo "✅ Both servers started successfully!"
echo ""
echo "   📊 Running Environments:"
echo "      • Data Dashboard: http://localhost:3000/dashboard"
echo "      • Templating Dashboard: http://localhost:3001/dashboard"
echo "      • MCP Status: http://localhost:3000/api/mcp/status"
echo ""
echo "   📋 Log Files:"
echo "      • Port 3000: /tmp/dashboard-3000.log"
echo "      • Port 3001: /tmp/dashboard-3001.log"
echo ""
echo "   💡 To view logs in real-time:"
echo "      tail -f /tmp/dashboard-3000.log"
echo "      tail -f /tmp/dashboard-3001.log"
echo ""
echo "   🛑 To stop servers:"
echo "      lsof -ti:3000,3001 | xargs kill -9"
echo ""

