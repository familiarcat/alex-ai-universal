#!/bin/bash
# Complete Dev Server Restart with Crew Error Monitoring
# Kills all processes, cleans caches, starts fresh, monitors for errors

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DASHBOARD_DIR="$PROJECT_ROOT/dashboard"

echo "🖖 Complete Dev Server Restart - Crew Error Monitoring"
echo "======================================================"
echo ""

# Step 1: Kill all existing processes
echo "🧹 Step 1: Killing all existing dev servers..."
lsof -ti:3000,3001,3002,3003,3004,3006 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 3
echo "   ✅ All processes killed"

# Step 2: Clean all caches
echo ""
echo "🧹 Step 2: Cleaning all caches..."
cd "$DASHBOARD_DIR"

# Remove Next.js build directories
rm -rf .next .next-3000 .next-3001 .next-3002 .next-3003 .next-3004 .next-3006 2>/dev/null || true

# Remove node_modules cache
rm -rf node_modules/.cache 2>/dev/null || true

# Remove TypeScript cache
rm -rf .tsbuildinfo 2>/dev/null || true

# Remove any lock files that might cause issues
# (Don't remove package-lock.json, just clear caches)

echo "   ✅ All caches cleared"

# Step 3: Verify clean state
echo ""
echo "🔍 Step 3: Verifying clean state..."
if lsof -ti:3000,3001 2>/dev/null | grep -q .; then
  echo "   ⚠️  Warning: Some processes still running on ports 3000/3001"
  lsof -ti:3000,3001 2>/dev/null | xargs kill -9 2>/dev/null || true
  sleep 2
fi
echo "   ✅ Ports 3000 and 3001 are free"

# Step 4: Start Main Dashboard (Port 3000)
echo ""
echo "🚀 Step 4: Starting Main Dashboard on port 3000..."
cd "$DASHBOARD_DIR"
PORT=3000 N8N_URL=https://n8n.pbradygeorgen.com npm run dev > /tmp/dashboard-3000-restart.log 2>&1 &
DASHBOARD_3000_PID=$!
echo "   ✅ Started (PID: $DASHBOARD_3000_PID)"
echo "   📋 Logs: /tmp/dashboard-3000-restart.log"

# Step 5: Start Live Server (Port 3001)
echo ""
echo "🚀 Step 5: Starting Live Server on port 3001..."
cd "$DASHBOARD_DIR"
PORT=3001 N8N_URL=https://n8n.pbradygeorgen.com npm run dev > /tmp/dashboard-3001-restart.log 2>&1 &
DASHBOARD_3001_PID=$!
echo "   ✅ Started (PID: $DASHBOARD_3001_PID)"
echo "   📋 Logs: /tmp/dashboard-3001-restart.log"

# Save PIDs
echo "$DASHBOARD_3000_PID" > /tmp/dashboard-3000.pid
echo "$DASHBOARD_3001_PID" > /tmp/dashboard-3001.pid

# Step 6: Monitor startup and errors
echo ""
echo "⏳ Step 6: Monitoring startup (watching for errors)..."
echo "   This will take 30-60 seconds for first build"
echo ""

MAX_WAIT=120
WAIT_COUNT=0
PORT_3000_READY=false
PORT_3001_READY=false
ERRORS_FOUND=false

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  # Check for errors in logs
  if [ -f /tmp/dashboard-3000-restart.log ]; then
    ERROR_COUNT_3000=$(grep -i "error\|failed\|fatal" /tmp/dashboard-3000-restart.log 2>/dev/null | wc -l | tr -d ' ')
    if [ "$ERROR_COUNT_3000" -gt 0 ] && [ "$ERROR_COUNT_3000" != "0" ]; then
      if [ "$ERRORS_FOUND" = false ]; then
        echo "   ⚠️  Errors detected in port 3000 logs:"
        grep -i "error\|failed\|fatal" /tmp/dashboard-3000-restart.log 2>/dev/null | tail -3 | sed 's/^/      /'
        ERRORS_FOUND=true
      fi
    fi
  fi
  
  if [ -f /tmp/dashboard-3001-restart.log ]; then
    ERROR_COUNT_3001=$(grep -i "error\|failed\|fatal" /tmp/dashboard-3001-restart.log 2>/dev/null | wc -l | tr -d ' ')
    if [ "$ERROR_COUNT_3001" -gt 0 ] && [ "$ERROR_COUNT_3001" != "0" ]; then
      if [ "$ERRORS_FOUND" = false ]; then
        echo "   ⚠️  Errors detected in port 3001 logs:"
        grep -i "error\|failed\|fatal" /tmp/dashboard-3001-restart.log 2>/dev/null | tail -3 | sed 's/^/      /'
        ERRORS_FOUND=true
      fi
    fi
  fi

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

# Step 7: Error Analysis
echo ""
echo "🔍 Step 7: Crew Error Analysis..."
echo ""

if [ "$ERRORS_FOUND" = true ]; then
  echo "   ⚠️  ERRORS DETECTED - Crew Review Required"
  echo ""
  echo "   📋 Port 3000 Errors:"
  if [ -f /tmp/dashboard-3000-restart.log ]; then
    grep -i "error\|failed\|fatal" /tmp/dashboard-3000-restart.log 2>/dev/null | tail -5 | sed 's/^/      /' || echo "      (No errors found)"
  fi
  echo ""
  echo "   📋 Port 3001 Errors:"
  if [ -f /tmp/dashboard-3001-restart.log ]; then
    grep -i "error\|failed\|fatal" /tmp/dashboard-3001-restart.log 2>/dev/null | tail -5 | sed 's/^/      /' || echo "      (No errors found)"
  fi
  echo ""
  echo "   💡 Full logs available at:"
  echo "      /tmp/dashboard-3000-restart.log"
  echo "      /tmp/dashboard-3001-restart.log"
else
  echo "   ✅ No errors detected in startup logs"
fi

# Step 8: Status Summary
echo ""
echo "📊 Step 8: Server Status Summary"
echo "=================================="
echo ""
echo "   Port 3000 (Main Dashboard):"
echo "      Status: $([ "$PORT_3000_READY" = true ] && echo '✅ Ready' || echo '❌ Not ready')"
echo "      PID: $DASHBOARD_3000_PID"
echo "      URL: http://localhost:3000/dashboard"
echo ""
echo "   Port 3001 (Live Server):"
echo "      Status: $([ "$PORT_3001_READY" = true ] && echo '✅ Ready' || echo '❌ Not ready')"
echo "      PID: $DASHBOARD_3001_PID"
echo "      URL: http://localhost:3001/dashboard"
echo ""

# Step 9: Open Browser Tabs
if $PORT_3000_READY || $PORT_3001_READY; then
  echo "🌐 Step 9: Opening browser tabs..."
  echo ""
  
  if command -v open > /dev/null; then
    # macOS
    if $PORT_3000_READY; then
      echo "   📊 Opening Main Dashboard..."
      open -a "Google Chrome" "http://localhost:3000/dashboard" 2>/dev/null || \
      open -a "Safari" "http://localhost:3000/dashboard" 2>/dev/null || \
      open "http://localhost:3000/dashboard" 2>/dev/null
      sleep 1
    fi
    
    if $PORT_3001_READY; then
      echo "   🚀 Opening Live Server..."
      open -a "Google Chrome" "http://localhost:3001/dashboard" 2>/dev/null || \
      open -a "Safari" "http://localhost:3001/dashboard" 2>/dev/null || \
      open "http://localhost:3001/dashboard" 2>/dev/null
      sleep 1
    fi
    
    echo "   🔗 Opening DDD Status (Public)..."
    open -a "Google Chrome" "http://localhost:3000/api/mcp/status" 2>/dev/null || \
    open -a "Safari" "http://localhost:3000/api/mcp/status" 2>/dev/null || \
    open "http://localhost:3000/api/mcp/status" 2>/dev/null
  fi
fi

# Step 10: Final Summary
echo ""
echo "✅ Complete Dev Server Restart - Summary"
echo "========================================="
echo ""
echo "   🖖 Crew Error Monitoring:"
if [ "$ERRORS_FOUND" = true ]; then
  echo "      ⚠️  ERRORS DETECTED - Review logs above"
else
  echo "      ✅ No errors detected"
fi
echo ""
echo "   📊 Running Environments:"
echo "      • Main Dashboard: http://localhost:3000/dashboard"
echo "      • Live Server:    http://localhost:3001/dashboard"
echo "      • Public Status:  http://localhost:3000/api/mcp/status"
echo ""
echo "   🔌 DDD Workflow Connections:"
echo "      • n8n: https://n8n.pbradygeorgen.com"
echo "      • Supabase: Live instance (from env)"
echo "      • MCP: https://mcp.pbradygeorgen.com (fallback)"
echo ""
echo "   📋 Log Files:"
echo "      • Port 3000: /tmp/dashboard-3000-restart.log"
echo "      • Port 3001: /tmp/dashboard-3001-restart.log"
echo ""
echo "   💡 To view logs in real-time:"
echo "      tail -f /tmp/dashboard-3000-restart.log"
echo "      tail -f /tmp/dashboard-3001-restart.log"
echo ""
echo "   🛑 To stop servers:"
echo "      lsof -ti:3000,3001 | xargs kill -9"
echo ""

