#!/bin/bash

# Alex AI Universal Installation Script
# Installs Alex AI across all supported platforms

echo "🚀 Alex AI Universal Installation"
echo "================================="
echo ""

# Check system requirements
echo "🔍 Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Installation options
echo "🎯 Installation Options:"
echo "1. NPX CLI only (recommended for quick start)"
echo "2. VSCode Extension"
echo "3. Cursor Extension"
echo "4. All platforms"
echo ""

read -p "Select installation option (1-4): " choice

case $choice in
    1)
        echo "📦 Installing NPX CLI..."
        npm install -g @alex-ai/cli
        echo "✅ NPX CLI installed successfully!"
        echo ""
        echo "🎯 Usage:"
        echo "  npx alex-ai engage [message]"
        echo "  npx alex-ai chat"
        echo "  npx alex-ai status"
        ;;
    2)
        echo "📦 Installing VSCode Extension..."
        if command -v code &> /dev/null; then
            code --install-extension alex-ai.vscode
            echo "✅ VSCode Extension installed successfully!"
            echo ""
            echo "🎯 Usage:"
            echo "  Ctrl+Shift+P -> 'Alex AI: Engage'"
            echo "  Ctrl+Shift+P -> 'Alex AI: Status'"
        else
            echo "❌ VSCode CLI not found. Please install VSCode first."
        fi
        ;;
    3)
        echo "📦 Installing Cursor Extension..."
        if command -v cursor &> /dev/null; then
            cursor --install-extension @alex-ai/cursor-extension
            echo "✅ Cursor Extension installed successfully!"
            echo ""
            echo "🎯 Usage:"
            echo "  Use 'Engage Alex AI' in Cursor chat"
        else
            echo "❌ Cursor CLI not found. Please install Cursor AI first."
        fi
        ;;
    4)
        echo "📦 Installing all platforms..."
        
        # Install NPX CLI
        npm install -g @alex-ai/cli
        echo "✅ NPX CLI installed"
        
        # Install VSCode Extension
        if command -v code &> /dev/null; then
            code --install-extension alex-ai.vscode
            echo "✅ VSCode Extension installed"
        else
            echo "⚠️  VSCode not found, skipping VSCode extension"
        fi
        
        # Install Cursor Extension
        if command -v cursor &> /dev/null; then
            cursor --install-extension @alex-ai/cursor-extension
            echo "✅ Cursor Extension installed"
        else
            echo "⚠️  Cursor not found, skipping Cursor extension"
        fi
        
        echo ""
        echo "🎯 All platforms installed successfully!"
        ;;
    *)
        echo "❌ Invalid option. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🖖 Alex AI Universal is ready! Live long and prosper!"
echo ""
echo "📚 Documentation: https://github.com/alex-ai-universal/alex-ai-universal"
echo "🐛 Issues: https://github.com/alex-ai-universal/alex-ai-universal/issues"
echo "⭐ Star us: https://github.com/alex-ai-universal/alex-ai-universal"
