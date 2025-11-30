#!/bin/bash
# Diagnostic script for Next.js dashboard startup issues

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 NEXT.JS DASHBOARD DIAGNOSTIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")/.."

# Check Node.js version
echo "📋 Node.js Version:"
node --version
echo ""

# Check npm version
echo "📋 npm Version:"
npm --version
echo ""

# Check if node_modules exists
echo "📋 Dependencies:"
if [ -d "node_modules" ]; then
  echo "✅ node_modules exists"
  echo "   Size: $(du -sh node_modules | cut -f1)"
else
  echo "⚠️  node_modules missing - run: npm install"
fi
echo ""

# Check for .next directory
echo "📋 Build Cache:"
if [ -d ".next" ]; then
  echo "✅ .next directory exists"
  echo "   Size: $(du -sh .next | cut -f1)"
  echo "   ⚠️  Consider removing if having issues: rm -rf .next"
else
  echo "ℹ️  No .next directory (will be created on first build)"
fi
echo ""

# Check port 3000
echo "📋 Port 3000 Status:"
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "⚠️  Port 3000 is in use"
  echo "   Process: $(lsof -ti:3000 | xargs ps -p | tail -1)"
  echo "   Kill with: pkill -f 'next dev'"
else
  echo "✅ Port 3000 is available"
fi
echo ""

# Check TypeScript configuration
echo "📋 TypeScript Check:"
if [ -f "tsconfig.json" ]; then
  echo "✅ tsconfig.json exists"
  if command -v tsc > /dev/null 2>&1; then
    echo "   Running type check (first 20 errors)..."
    npx tsc --noEmit 2>&1 | head -20 || echo "   ⚠️  Type errors found (see above)"
  else
    echo "   ℹ️  TypeScript compiler not found globally"
  fi
else
  echo "⚠️  tsconfig.json missing"
fi
echo ""

# Check Next.js configuration
echo "📋 Next.js Configuration:"
if [ -f "next.config.js" ]; then
  echo "✅ next.config.js exists"
  # Check for common issues
  if grep -q "output.*export" next.config.js; then
    echo "   ⚠️  Static export enabled - may cause issues in dev mode"
  fi
else
  echo "⚠️  next.config.js missing"
fi
echo ""

# Check environment variables
echo "📋 Environment Variables:"
if [ -f ".env.local" ] || [ -f ".env" ]; then
  echo "✅ Environment file found"
  [ -f ".env.local" ] && echo "   - .env.local"
  [ -f ".env" ] && echo "   - .env"
else
  echo "ℹ️  No .env files found (may need for auth)"
fi
echo ""

# Check for common problematic files
echo "📋 Common Issues Check:"
ISSUES=0

# Check middleware
if [ -f "middleware.ts" ]; then
  if grep -q "auth()" middleware.ts 2>/dev/null; then
    if ! grep -q "GOOGLE_CLIENT_ID\|NEXTAUTH" .env.local .env 2>/dev/null; then
      echo "   ⚠️  Middleware uses auth() but no auth env vars found"
      ISSUES=$((ISSUES + 1))
    fi
  fi
fi

# Check for circular dependencies in key files
if [ -f "app/layout.tsx" ] && [ -f "lib/state-manager.tsx" ]; then
  echo "   ✅ Key files exist"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ISSUES -gt 0 ]; then
  echo "⚠️  Found $ISSUES potential issue(s)"
  echo ""
  echo "🔧 RECOMMENDED FIXES:"
  echo ""
  echo "1. Clean build cache:"
  echo "   rm -rf .next"
  echo ""
  echo "2. Reinstall dependencies:"
  echo "   rm -rf node_modules package-lock.json"
  echo "   npm install"
  echo ""
  echo "3. Kill any existing Next.js processes:"
  echo "   pkill -f 'next dev'"
  echo ""
  echo "4. Start fresh:"
  echo "   npm run dev"
  echo ""
else
  echo "✅ No obvious issues detected"
  echo ""
  echo "🔧 If dashboard still won't start, try:"
  echo "   1. rm -rf .next && npm run dev"
  echo "   2. Check terminal output for specific errors"
  echo "   3. Check browser console for runtime errors"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

