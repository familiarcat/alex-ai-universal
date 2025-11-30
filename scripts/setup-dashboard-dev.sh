#!/bin/bash
# Setup Dashboard Development Environment
# Fixes node_modules corruption and starts dashboard

set -e

echo "🖖 Setting up Dashboard Development Environment"
echo "================================================"
echo ""

cd "$(dirname "$0")/../dashboard" || exit 1

echo "📦 Step 1: Cleaning corrupted node_modules..."
rm -rf node_modules/.cache .next node_modules/next/dist/compiled 2>/dev/null || true
echo "   ✅ Cache cleared"

echo ""
echo "📦 Step 2: Reinstalling Next.js dependencies..."
npm install next@latest --save 2>&1 | tail -5 || {
  echo "   ⚠️  Partial reinstall, continuing..."
}

echo ""
echo "📦 Step 3: Verifying installation..."
if node -e "require('next')" 2>/dev/null; then
  echo "   ✅ Next.js is working"
else
  echo "   ⚠️  Next.js may need full reinstall"
  echo "   💡 Run: cd dashboard && rm -rf node_modules && npm install"
fi

echo ""
echo "🚀 Step 4: Starting dashboard..."
echo "   Dashboard will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev

