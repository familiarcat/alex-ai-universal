#!/bin/bash
# Run Dashboard Locally - With Dependency Check
# 
# Checks for missing dependencies and installs them, then runs dashboard

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DASHBOARD_DIR="$PROJECT_ROOT/dashboard"

cd "$DASHBOARD_DIR"

echo "🖖 Alex AI Dashboard - Local Testing"
echo "===================================="
echo ""

# Check for missing dependencies
echo "📦 Checking dependencies..."
MISSING_DEPS=()

if ! npm list @dnd-kit/core > /dev/null 2>&1; then
  MISSING_DEPS+=("@dnd-kit/core")
fi

if ! npm list @dnd-kit/sortable > /dev/null 2>&1; then
  MISSING_DEPS+=("@dnd-kit/sortable")
fi

if ! npm list @dnd-kit/utilities > /dev/null 2>&1; then
  MISSING_DEPS+=("@dnd-kit/utilities")
fi

if ! npm list mermaid > /dev/null 2>&1; then
  MISSING_DEPS+=("mermaid")
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo "⚠️  Missing dependencies detected:"
  printf '   • %s\n' "${MISSING_DEPS[@]}"
  echo ""
  echo "📥 Installing missing dependencies..."
  npm install "${MISSING_DEPS[@]}"
  echo "✅ Dependencies installed"
else
  echo "✅ All dependencies present"
fi

echo ""

# Check port availability
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "⚠️  Port $PORT is in use"
  echo "   Killing existing process..."
  lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
  sleep 2
fi

echo "🚀 Starting dashboard in dev mode..."
echo "   URL: http://localhost:$PORT"
echo "   Press Ctrl+C to stop"
echo ""

# Set environment variables
export N8N_URL="${N8N_URL:-https://n8n.pbradygeorgen.com}"
export NEXT_PUBLIC_N8N_URL="${NEXT_PUBLIC_N8N_URL:-https://n8n.pbradygeorgen.com}"

# Run in dev mode (more forgiving than build)
npm run dev

