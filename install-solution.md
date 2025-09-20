# Alex AI Universal - Installation Solution

## Problem Analysis
- PNPM installation is getting canceled/hanging
- Need working solution for both local testing and deployment
- Monorepo structure with multiple packages

## Recommended Solutions

### Option 1: NPM with Lerna (Recommended)
```bash
# Clean everything
rm -rf node_modules packages/*/node_modules
rm -f package-lock.json packages/*/package-lock.json
rm -f pnpm-lock.yaml yarn.lock

# Install with npm
npm install

# Build with lerna
npx lerna run build
```

### Option 2: Yarn Workspaces
```bash
# Install yarn globally
npm install -g yarn

# Clean everything
rm -rf node_modules packages/*/node_modules
rm -f package-lock.json packages/*/package-lock.json
rm -f pnpm-lock.yaml

# Install with yarn
yarn install

# Build with yarn
yarn build
```

### Option 3: Individual Package Installation
```bash
# Install core package first
cd packages/core
npm install
npm run build

# Install CLI package
cd ../cli
npm install
npm run build

# Install other packages as needed
```

## Quick Fix Script
```bash
#!/bin/bash
echo "🚀 Alex AI Universal - Quick Install"
echo "=================================="

# Clean everything
echo "🧹 Cleaning artifacts..."
rm -rf node_modules packages/*/node_modules
rm -f package-lock.json packages/*/package-lock.json
rm -f pnpm-lock.yaml yarn.lock

# Install with npm
echo "📦 Installing with npm..."
npm install

# Build packages
echo "🔨 Building packages..."
npx lerna run build

echo "✅ Installation complete!"
echo "Test with: npx alexi help"
```

## Deployment Considerations
- Use npm for consistency
- Ensure all packages are built before deployment
- Test locally before deploying
- Use lerna for monorepo management
