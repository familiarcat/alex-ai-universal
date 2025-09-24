#!/bin/bash

# Alex AI Universal - Quick Install Script
# Fallback solution when pnpm doesn't work

echo "🚀 Alex AI Universal - Quick Install"
echo "=================================="

# Clean everything
echo "🧹 Cleaning all artifacts..."
rm -rf node_modules
find packages -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
rm -f package-lock.json
find packages -name "package-lock.json" -delete 2>/dev/null || true
rm -f pnpm-lock.yaml yarn.lock

# Remove pnpm configuration
rm -f pnpm-workspace.yaml .npmrc

echo "✅ Cleanup complete!"

# Install with npm
echo "📦 Installing with npm..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ npm install failed, trying individual packages..."
    
    # Try individual package installation
    echo "📦 Installing core package..."
    cd packages/core
    npm install
    npm run build
    cd ../..
    
    echo "📦 Installing CLI package..."
    cd packages/cli
    npm install
    npm run build
    cd ../..
    
    echo "✅ Individual packages installed!"
fi

# Test installation
echo "🔍 Testing installation..."
if [ -f "packages/cli/dist/simple-cli.js" ]; then
    echo "✅ CLI built successfully"
    echo "🎉 Installation complete!"
    echo "Test with: npx alexi help"
else
    echo "❌ Installation may have issues"
    echo "Try running: npm run build"
fi




