#!/bin/bash

# Build script for Alex AI VS Code Extension
# Compiles all TypeScript files to JavaScript

set -e

echo "🖖 Building Alex AI VS Code Extension"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
mkdir -p dist/src

# Compile all TypeScript files
echo "📦 Compiling TypeScript files..."
npx tsc \
  src/extension.ts \
  src/api-client.ts \
  src/context-gatherer.ts \
  src/chat-webview.ts \
  src/mcp-integration.ts \
  src/rag-integration.ts \
  src/providerTree.ts \
  --outDir dist/src \
  --module commonjs \
  --target es2020 \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck \
  --rootDir src \
  --sourceMap

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📊 Build Summary:"
    echo "  - Main entry: dist/src/extension.js"
    echo "  - Total files: $(find dist/src -name "*.js" -type f | wc -l | xargs)"
    echo "  - Total size: $(du -sh dist | cut -f1)"
    echo ""
    echo "🚀 Extension ready for testing!"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

