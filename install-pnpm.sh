#!/bin/bash

# Alex AI Universal - PNPM Installation Script
# Optimized for monorepo with multiple packages

echo "🚀 Alex AI Universal - PNPM Installation"
echo "========================================"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm globally..."
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        echo "✅ pnpm installed successfully!"
    else
        echo "❌ Failed to install pnpm. Please install manually: npm install -g pnpm"
        exit 1
    fi
else
    echo "✅ pnpm is already installed"
fi

# Verify pnpm version
echo "📋 PNPM Version: $(pnpm --version)"

# Clean any existing artifacts
echo "🧹 Cleaning existing artifacts..."
rm -rf node_modules
rm -rf packages/*/node_modules
rm -f package-lock.json
rm -f packages/*/package-lock.json
rm -f yarn.lock
rm -f packages/*/yarn.lock
rm -f pnpm-lock.yaml

# Install dependencies
echo "📦 Installing dependencies with pnpm..."
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build packages
echo "🔨 Building packages..."
pnpm run build:all

if [ $? -eq 0 ]; then
    echo "✅ Packages built successfully!"
else
    echo "❌ Failed to build packages"
    exit 1
fi

# Verify installation
echo "🔍 Verifying installation..."
if [ -f "packages/cli/dist/simple-cli.js" ]; then
    echo "✅ CLI built successfully"
else
    echo "❌ CLI build failed"
    exit 1
fi

if [ -f "packages/core/dist/index.js" ]; then
    echo "✅ Core package built successfully"
else
    echo "❌ Core package build failed"
    exit 1
fi

echo ""
echo "🎉 Alex AI Universal installation complete!"
echo "========================================"
echo "Available commands:"
echo "  pnpm run dev          - Start development server"
echo "  pnpm run build        - Build all packages"
echo "  pnpm run test         - Run all tests"
echo "  pnpm run n8n-security - Run N8N security integration"
echo "  npx alexi help        - Show Alex AI CLI help"
echo ""
echo "🚀 Ready for development!"

