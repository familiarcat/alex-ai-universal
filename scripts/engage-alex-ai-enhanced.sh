#!/bin/bash

# Enhanced engage-alex-ai Command
# Automatically loads secrets from ~/.zshrc and initializes Alex AI with full N8N integration

echo "🚀 Alex AI Universal - Enhanced Engagement"
echo "=========================================="

# Check if we're in a project directory
if [ ! -f "package.json" ] && [ ! -f ".alex-ai-config.json" ]; then
    echo "⚠️  No project detected. Creating Alex AI configuration..."
fi

# Load secrets and initialize Alex AI
echo "🔐 Auto-loading secrets from ~/.zshrc..."
node /Users/bradygeorgen/Documents/workspace/alex-ai-universal/scripts/alex-ai-with-secrets.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Alex AI Universal is now ready!"
    echo ""
    echo "Available commands:"
    echo "  - npx alexi chat          # Start interactive chat"
    echo "  - npx alexi crew          # Show crew members"
    echo "  - npx alexi status        # Check system status"
    echo "  - npx alexi unified-system status  # Check RAG and N8N status"
    echo ""
    echo "N8N agents are now connected for memory collection and sharing!"
    echo "You can now use 'Engage AlexAI' in Cursor AI chat with full N8N integration."
else
    echo "❌ Failed to initialize Alex AI. Please check your ~/.zshrc configuration."
    exit 1
fi



