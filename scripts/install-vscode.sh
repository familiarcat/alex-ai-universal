#!/bin/bash

# Alex AI Universal VSCode Extension Installation Script
# Installs the VSCode extension for Alex AI

echo "🚀 Installing Alex AI Universal VSCode Extension..."

# Check if VSCode is installed
if ! command -v code &> /dev/null; then
    echo "❌ VSCode CLI is not installed. Please install VSCode first."
    echo "   Download from: https://code.visualstudio.com/"
    exit 1
fi

# Install the extension
echo "📦 Installing @alex-ai/vscode extension..."
code --install-extension alex-ai.vscode

# Verify installation
if code --list-extensions | grep -q "alex-ai.vscode"; then
    echo "✅ Alex AI VSCode Extension installed successfully!"
    echo ""
    echo "🎯 Usage:"
    echo "  Ctrl+Shift+P -> 'Alex AI: Engage' - Engage Alex AI"
    echo "  Ctrl+Shift+P -> 'Alex AI: Status' - Check system status"
    echo "  Status bar will show Alex AI indicator"
    echo ""
    echo "🖖 Live long and prosper!"
else
    echo "❌ Installation failed. Please try again."
    exit 1
fi
