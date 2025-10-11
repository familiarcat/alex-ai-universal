#!/bin/bash

# Start All Alex AI Servers and Open in Browser
# Launches: Dashboard, Next.js UI, and optionally Live Preview

echo "🚀 Starting Alex AI Multi-Project Symphony Platform"
echo "======================================================"
echo ""

# Function to wait for server
wait_for_server() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo "⏳ Waiting for $name (port $port)..."
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    echo "⚠️  $name did not start in time"
    return 1
}

# Kill any existing servers
echo "🧹 Cleaning up existing servers..."
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ Ports cleared"
echo ""

# Start Dashboard Server (Port 3001)
echo "🖖 Starting Crew Management Dashboard (Port 3001)..."
cd examples/demo-project
node src/dashboard-server.js > /tmp/dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo $DASHBOARD_PID > /tmp/dashboard.pid
cd ../..
echo "   PID: $DASHBOARD_PID"
echo "   Log: /tmp/dashboard.log"
echo ""

# Wait for dashboard
sleep 3
if wait_for_server 3001 "Dashboard"; then
    echo ""
else
    echo "❌ Dashboard failed to start. Check /tmp/dashboard.log"
    exit 1
fi

# Start Next.js Dev Server (Port 3000)
echo "⚛️  Starting Next.js UI (Port 3000)..."
cd examples/alex-ai-nextjs
npm run dev > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo $NEXTJS_PID > /tmp/nextjs.pid
cd ../..
echo "   PID: $NEXTJS_PID"
echo "   Log: /tmp/nextjs.log"
echo ""

# Wait for Next.js
echo "⏳ Waiting for Next.js to compile..."
sleep 10

# Summary
echo ""
echo "✨ ═══════════════════════════════════════════════════"
echo "   ALL SERVERS RUNNING!"
echo "═══════════════════════════════════════════════════ ✨"
echo ""
echo "🖖 Dashboard (Crew Management):"
echo "   URL: http://localhost:3001"
echo "   PID: $DASHBOARD_PID"
echo "   Features:"
echo "     • 11 AI Crew Members"
echo "     • Multi-Project Management"
echo "     • Real-time WebSocket"
echo "     • 8 REST APIs"
echo ""
echo "⚛️  Next.js UI (Interactive Interface):"
echo "   URL: http://localhost:3000"
echo "   PID: $NEXTJS_PID"
echo "   Features:"
echo "     • Crew RAG Query"
echo "     • N8N Integration"
echo "     • LCARS Interface"
echo "     • Knowledge Capture"
echo ""
echo "📊 Quick Commands:"
echo "   Test APIs:    bash test-dashboard-api.sh"
echo "   Check Crew:   npm run crew:roster"
echo "   View Logs:    tail -f /tmp/dashboard.log"
echo "   View Next.js: tail -f /tmp/nextjs.log"
echo ""
echo "🛑 To Stop All Servers:"
echo "   kill $DASHBOARD_PID $NEXTJS_PID"
echo "   OR: lsof -ti:3000,3001 | xargs kill"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# Open in browser
echo "🌐 Opening servers in your default browser..."
sleep 2

# Open Dashboard
open http://localhost:3001 &
sleep 1

# Open Next.js UI
open http://localhost:3000 &
sleep 1

# Open specific pages
open http://localhost:3000/crew-rag-query &
sleep 1

open http://localhost:3000/lcars &

echo ""
echo "✅ All servers started and browsers opened!"
echo ""
echo "🎭 Welcome to the Alex AI Multi-Project Symphony! 🎼"
echo ""
echo "Press Ctrl+C to stop monitoring (servers will keep running)"
echo "Or run: kill $DASHBOARD_PID $NEXTJS_PID"
echo ""

# Keep script running to show logs
echo "📊 Monitoring servers (Ctrl+C to exit)..."
echo ""
tail -f /tmp/dashboard.log /tmp/nextjs.log

