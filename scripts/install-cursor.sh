#!/bin/bash

# Alex AI Universal Cursor Extension Installation Script
# Installs the Cursor AI extension for Alex AI

echo "🚀 Installing Alex AI Universal Cursor Extension..."

# Check if Cursor is installed
if ! command -v cursor &> /dev/null; then
    echo "❌ Cursor CLI is not installed. Please install Cursor AI first."
    echo "   Download from: https://cursor.sh/"
    exit 1
fi

# Install the extension
echo "📦 Installing @alex-ai/cursor-extension..."
cursor --install-extension @alex-ai/cursor-extension

# Verify installation
if cursor --list-extensions | grep -q "@alex-ai/cursor-extension"; then
    echo "✅ Alex AI Cursor Extension installed successfully!"
    echo ""
    echo "🎯 Usage:"
    echo "  Use 'Engage Alex AI' in Cursor chat"
    echo "  Alex AI will provide Star Trek crew-based assistance"
    echo "  Zero-artifact guarantee - no files created in your project"
    echo ""
    echo "🖖 Live long and prosper!"
else
    echo "❌ Installation failed. Please try again."
    exit 1
fi
