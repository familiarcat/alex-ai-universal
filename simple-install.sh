#!/bin/bash

# Alex AI Universal - Simple Install Script
# Minimal installation to get basic functionality working

echo "🚀 Alex AI Universal - Simple Install"
echo "===================================="

# Clean everything
echo "🧹 Cleaning artifacts..."
rm -rf node_modules
find packages -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
rm -f package-lock.json
find packages -name "package-lock.json" -delete 2>/dev/null || true

# Install chalk for test harness
echo "📦 Installing test dependencies..."
npm install chalk@4.1.2

# Try to build core package
echo "🔨 Building core package..."
cd packages/core
if [ -f "package.json" ]; then
    npm install --no-optional
    npm run build 2>/dev/null || echo "Build failed, continuing..."
fi
cd ../..

# Try to build CLI package
echo "🔨 Building CLI package..."
cd packages/cli
if [ -f "package.json" ]; then
    npm install --no-optional
    npm run build 2>/dev/null || echo "Build failed, continuing..."
fi
cd ../..

echo "✅ Simple installation complete!"
echo "🧪 Running test harness..."

# Run test harness
cd test-harness
node run-all-tests.js

