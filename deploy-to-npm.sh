#!/bin/bash

# Alex AI Universal - NPM Deployment Script
# Execute this script after completing NPM login

echo "🚀 Alex AI Universal - NPM Deployment"
echo "====================================="
echo ""

# Check if user is logged in to NPM
echo "🔍 Checking NPM authentication..."
if npm whoami > /dev/null 2>&1; then
    echo "✅ NPM authentication verified"
    NPM_USER=$(npm whoami)
    echo "   Logged in as: $NPM_USER"
else
    echo "❌ NPM authentication required"
    echo "   Please run: npm login"
    echo "   Then run this script again"
    exit 1
fi

echo ""

# Verify package.json configuration
echo "🔍 Verifying package configuration..."
if grep -q '"private": true' package.json; then
    echo "✅ Private package configuration confirmed"
else
    echo "❌ Package not configured as private"
    echo "   Please check package.json configuration"
    exit 1
fi

if grep -q '"access": "restricted"' package.json; then
    echo "✅ Restricted access configuration confirmed"
else
    echo "❌ Access not set to restricted"
    echo "   Please check package.json configuration"
    exit 1
fi

echo ""

# Run final build
echo "🔨 Running final build..."
if npm run build; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    echo "   Please fix build errors before deploying"
    exit 1
fi

echo ""

# Run dry-run to verify package
echo "🧪 Running deployment dry-run..."
if npm publish --dry-run > /dev/null 2>&1; then
    echo "✅ Dry-run successful - package ready for deployment"
else
    echo "❌ Dry-run failed"
    echo "   Please check package configuration"
    exit 1
fi

echo ""

# Deploy to NPM
echo "🚀 Deploying to NPM..."
echo "   Package: alexi@1.0.0"
echo "   Access: restricted (private)"
echo "   Registry: https://registry.npmjs.org/"
echo ""

if npm publish --access restricted; then
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "========================="
    echo ""
    echo "✅ Package published: alexi@1.0.0"
    echo "✅ Access: Private (restricted)"
    echo "✅ Registry: https://registry.npmjs.org/"
    echo ""
    echo "📦 Installation Commands:"
    echo "   NPX: npx alexi@latest"
    echo "   Global: npm install -g alexi"
    echo "   Local: npm install alexi"
    echo ""
    echo "🔗 Package URL: https://www.npmjs.com/package/alexi"
    echo ""
    echo "🧪 Test Installation:"
    echo "   npm install alexi"
    echo "   npx alexi@latest --version"
    echo "   npx alexi@latest --help"
    echo ""
    echo "🖖 Alex AI Universal is now live!"
    echo "   Ready to revolutionize development workflows!"
else
    echo "❌ DEPLOYMENT FAILED!"
    echo "===================="
    echo ""
    echo "Please check the error messages above and try again."
    echo "Common issues:"
    echo "  - Package name already exists"
    echo "  - Version number conflict"
    echo "  - Authentication issues"
    echo "  - Network connectivity"
    echo ""
    echo "To retry:"
    echo "  1. Fix any issues"
    echo "  2. Run: npm run build"
    echo "  3. Run: npm publish --access restricted"
    exit 1
fi







