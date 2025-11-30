#!/bin/bash
# Fix Dashboard Dependencies
# Resolves corrupted node_modules issues

set -e

echo "🖖 Fixing Dashboard Dependencies"
echo "================================="
echo ""

DASHBOARD_DIR="/Users/bradygeorgen/Documents/workspace/alex-ai-universal/dashboard"

cd "$DASHBOARD_DIR" || {
  echo "❌ Dashboard directory not found"
  exit 1
}

echo "📦 Step 1: Stopping any running dashboard processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo ""
echo "📦 Step 2: Removing corrupted node_modules..."
rm -rf node_modules package-lock.json .next

echo ""
echo "📦 Step 3: Reinstalling dependencies..."
npm install

echo ""
echo "📦 Step 4: Verifying Next.js..."
if node -e "require('next')" 2>/dev/null; then
  echo "   ✅ Next.js is working"
else
  echo "   ❌ Next.js still has issues"
  echo "   💡 Try: npm install next@latest --save"
  exit 1
fi

echo ""
echo "✅ Dependencies fixed!"
echo ""
echo "🚀 To start dashboard:"
echo "   cd dashboard && npm run dev"
echo ""

