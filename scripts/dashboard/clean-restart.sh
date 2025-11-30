#!/bin/bash

# 🖖 Clean Restart Script for Next.js Dashboard
# 
# Completely cleans all dev caches and restarts the dashboard server
# Crew: La Forge (Infrastructure) & O'Brien (Pragmatic Solutions)

set -e

DASHBOARD_DIR="dashboard"
PORT=3000

echo "🖖 Clean Restart - Next.js Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Kill existing processes
echo "🔧 Step 1: Stopping existing Next.js processes..."
echo ""

# Kill processes on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   ⚠️  Found process on port 3000, killing..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 1
  echo "   ✅ Port 3000 cleared"
else
  echo "   ✅ Port 3000 is free"
fi

# Kill processes on port 3001
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "   ⚠️  Found process on port 3001, killing..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  sleep 1
  echo "   ✅ Port 3001 cleared"
else
  echo "   ✅ Port 3001 is free"
fi

# Kill any node processes related to Next.js
echo ""
echo "   🔍 Checking for Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 1
echo "   ✅ Next.js processes stopped"
echo ""

# Step 2: Clear all cache directories
echo "🧹 Step 2: Clearing all dev caches..."
echo ""

cd "$DASHBOARD_DIR" || exit 1

# Clear .next directory
if [ -d ".next" ]; then
  echo "   🗑️  Removing .next directory..."
  rm -rf .next
  echo "   ✅ .next cleared"
else
  echo "   ✅ .next doesn't exist"
fi

# Clear node_modules/.cache
if [ -d "node_modules/.cache" ]; then
  echo "   🗑️  Removing node_modules/.cache..."
  rm -rf node_modules/.cache
  echo "   ✅ node_modules/.cache cleared"
else
  echo "   ✅ node_modules/.cache doesn't exist"
fi

# Clear .turbo directory
if [ -d ".turbo" ]; then
  echo "   🗑️  Removing .turbo directory..."
  rm -rf .turbo
  echo "   ✅ .turbo cleared"
else
  echo "   ✅ .turbo doesn't exist"
fi

# Clear .swc directory
if [ -d ".swc" ]; then
  echo "   🗑️  Removing .swc directory..."
  rm -rf .swc
  echo "   ✅ .swc cleared"
else
  echo "   ✅ .swc doesn't exist"
fi

# Clear any lock files that might cause issues
if [ -f ".next.lock" ]; then
  echo "   🗑️  Removing .next.lock..."
  rm -f .next.lock
  echo "   ✅ .next.lock cleared"
fi

echo ""
echo "✅ All caches cleared!"
echo ""

# Step 3: Verify dependencies
echo "📦 Step 3: Verifying dependencies..."
echo ""

if [ ! -d "node_modules" ]; then
  echo "   ⚠️  node_modules not found, installing dependencies..."
  npm install
  echo "   ✅ Dependencies installed"
else
  echo "   ✅ node_modules exists"
  # Check if package.json changed
  if [ "package.json" -nt "node_modules" ]; then
    echo "   ⚠️  package.json newer than node_modules, reinstalling..."
    npm install
    echo "   ✅ Dependencies updated"
  else
    echo "   ✅ Dependencies up to date"
  fi
fi

echo ""

# Step 4: Start dev server
echo "🚀 Step 4: Starting Next.js dev server..."
echo ""
echo "   📍 Starting on port $PORT..."
echo "   🌐 Dashboard will be available at: http://localhost:$PORT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the dev server
npm run dev



