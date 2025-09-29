#!/bin/bash

# Alex AI Universal NPX Installation Script
# Installs Alex AI CLI globally for NPX usage

echo "🚀 Installing Alex AI Universal CLI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install globally via NPX
echo "📦 Installing @alex-ai/cli globally..."
npm install -g @alex-ai/cli

# Verify installation
if command -v alex-ai &> /dev/null; then
    echo "✅ Alex AI CLI installed successfully!"
    echo ""
    echo "🎯 Usage:"
    echo "  npx alex-ai engage [message]  - Engage Alex AI with a message"
    echo "  npx alex-ai chat              - Start interactive chat"
    echo "  npx alex-ai status            - Check system status"
    echo ""
    echo "🖖 Live long and prosper!"
else
    echo "❌ Installation failed. Please try again."
    exit 1
fi
