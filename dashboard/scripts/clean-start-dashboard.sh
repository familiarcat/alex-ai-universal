#!/bin/bash
# Clean Start Script for Next.js Dashboard
# Kills all processes on ports 3000-3010 and Next.js instances before starting

set -e

cd "$(dirname "$0")/.."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 CLEAN START - Next.js Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Kill all Next.js processes
echo "1️⃣  Killing all Next.js processes..."
pkill -f "next dev" 2>/dev/null && echo "   ✅ Killed 'next dev' processes" || echo "   ℹ️  No 'next dev' processes found"
pkill -f "next start" 2>/dev/null && echo "   ✅ Killed 'next start' processes" || echo "   ℹ️  No 'next start' processes found"
pkill -f "next-server" 2>/dev/null && echo "   ✅ Killed 'next-server' processes" || echo "   ℹ️  No 'next-server' processes found"
pkill -f "node.*next" 2>/dev/null && echo "   ✅ Killed other Next.js node processes" || echo "   ℹ️  No other Next.js processes found"
echo ""

# Step 2: Kill all processes on ports 3000-3010
echo "2️⃣  Killing all processes on ports 3000-3010..."
KILLED_COUNT=0
for port in {3000..3010}; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    kill -9 $pid 2>/dev/null && echo "   ✅ Killed process on port $port (PID: $pid)" && KILLED_COUNT=$((KILLED_COUNT + 1)) || echo "   ⚠️  Could not kill process on port $port"
  fi
done
if [ $KILLED_COUNT -eq 0 ]; then
  echo "   ℹ️  No processes found on ports 3000-3010"
fi
echo ""

# Step 3: Wait for ports to be fully released
echo "3️⃣  Waiting for ports to be released..."
sleep 2

# Step 4: Verify ports are clear
echo "4️⃣  Verifying ports 3000-3010 are free..."
ALL_CLEAR=true
for port in {3000..3010}; do
  if lsof -ti:$port > /dev/null 2>&1; then
    echo "   ⚠️  Port $port still in use"
    ALL_CLEAR=false
  fi
done
if [ "$ALL_CLEAR" = true ]; then
  echo "   ✅ All ports 3000-3010 are free"
fi
echo ""

# Step 5: Clean build cache
echo "5️⃣  Cleaning build cache..."
rm -rf .next
echo "   ✅ Build cache cleared"
echo ""

# Step 6: Start Next.js
echo "6️⃣  Starting Next.js dashboard..."
echo "   🚀 Running: npm run dev"
echo ""
npm run dev

