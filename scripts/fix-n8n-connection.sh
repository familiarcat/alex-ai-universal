#!/bin/bash

# Alex AI N8N Connection Fix Script
# Run this script to fix N8N connection issues

echo "🔧 Fixing Alex AI N8N Connection Issues..."
echo "=========================================="

# Check if ~/.zshrc exists
if [ ! -f ~/.zshrc ]; then
    echo "Creating ~/.zshrc file..."
    touch ~/.zshrc
fi

# Add N8N configuration to ~/.zshrc
echo "Adding N8N configuration to ~/.zshrc..."

# Check if configuration already exists
if ! grep -q "N8N_API_URL" ~/.zshrc; then
    echo "" >> ~/.zshrc
    echo "# Alex AI N8N Configuration" >> ~/.zshrc
    echo "export N8N_API_URL=\"https://n8n.pbradygeorgen.com/api/v1\"" >> ~/.zshrc
    echo "export N8N_API_KEY=\"YOUR_N8N_API_KEY_HERE\"" >> ~/.zshrc
    echo "export N8N_WEBHOOK_URL=\"https://n8n.pbradygeorgen.com/webhook\"" >> ~/.zshrc
    echo "export SUPABASE_URL=\"YOUR_SUPABASE_URL_HERE\"" >> ~/.zshrc
    echo "export SUPABASE_ANON_KEY=\"YOUR_SUPABASE_ANON_KEY_HERE\"" >> ~/.zshrc
    echo "export OPENAI_API_KEY=\"YOUR_OPENAI_API_KEY_HERE\"" >> ~/.zshrc
    echo "export ALEX_AI_ENABLE_RAG=\"true\"" >> ~/.zshrc
    echo "export ALEX_AI_ENABLE_SCRAPING=\"true\"" >> ~/.zshrc
    echo "export ALEX_AI_ENABLE_BILATERAL_SYNC=\"true\"" >> ~/.zshrc
    echo "export ALEX_AI_LEARNING_RATE=\"0.1\"" >> ~/.zshrc
    echo "export ALEX_AI_MAX_EMBEDDINGS=\"1000\"" >> ~/.zshrc
    echo "export ALEX_AI_ENCRYPTION_KEY=\"$(openssl rand -base64 32)\"" >> ~/.zshrc
    echo "✅ Configuration added to ~/.zshrc"
else
    echo "✅ N8N configuration already exists in ~/.zshrc"
fi

# Reload ~/.zshrc
echo "Reloading ~/.zshrc..."
source ~/.zshrc

# Initialize Alex AI in current project
echo "Initializing Alex AI in current project..."
npx alexi unified-system initialize

echo "🎉 Fix script completed!"
echo ""
echo "Next steps:"
echo "1. Edit ~/.zshrc and replace placeholder values with your actual API keys"
echo "2. Run: source ~/.zshrc"
echo "3. Run: npx alexi unified-system status"
echo "4. Test: npx alexi unified-system query 'Test N8N connection'"





