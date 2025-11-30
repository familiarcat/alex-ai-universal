#!/bin/bash
# Alex AI Testing Environment Test Script

echo "🧪 Running Alex AI Tests..."

# Test NPM packages
echo "📦 Testing NPM packages..."
cd test-projects/react-test-project
npm test

# Test VS Code extension
echo "🔌 Testing VS Code extension..."
code --version

# Test Cursor AI extension
echo "🎯 Testing Cursor AI extension..."
cursor --version

echo "✅ All tests completed!"
