#!/usr/bin/env bash

##############################################################################
# 🖖 OpenRouter Automation Setup
# 
# One-time setup script to enable fully automated OpenRouter key management
# and crew-optimized LLM calls via MCP.
# 
# Crew: Chief O'Brien ("Let's automate this properly")
##############################################################################

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖖 OPENROUTER AUTOMATION SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Provisioning Key exists
PROVISIONING_KEY=$(grep "export OPENROUTER_PROVISIONING_KEY" "$HOME/.zshrc" 2>/dev/null | cut -d'"' -f2 | head -1 | tr -d ' ')

if [ -n "$PROVISIONING_KEY" ]; then
  echo "✅ Provisioning API Key found in ~/.zshrc"
  echo ""
  echo "🤖 Running automated key creation..."
  echo ""
  
  # Run automated key creation
  node scripts/automate-openrouter-key.js --create --update-zshrc
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Automated setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Reload environment: source ~/.zshrc"
    echo "   2. Verify key: npm run openrouter:verify"
    echo "   3. Test MCP: node lib/mcp-crew-memories-server.js"
    echo ""
    exit 0
  else
    echo ""
    echo "⚠️  Automated key creation failed"
    echo "   Falling back to manual setup..."
    echo ""
  fi
fi

# Manual setup flow
echo "📋 ONE-TIME MANUAL SETUP REQUIRED"
echo ""
echo "Step 1: Get Provisioning API Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Opening OpenRouter Settings..."
echo "   URL: https://openrouter.ai/settings/keys"
echo ""

# Open in browser
open "https://openrouter.ai/settings/keys" 2>/dev/null || xdg-open "https://openrouter.ai/settings/keys" 2>/dev/null || echo "   Please open: https://openrouter.ai/settings/keys"

sleep 2

echo "2. In the left sidebar, click 'Provisioning Keys'"
echo ""
echo "3. Click 'Create Provisioning Key' button"
echo ""
echo "4. Name it: 'Alex AI - Automated Management'"
echo ""
echo "5. Copy the key (starts with sk-or-v1-...)"
echo ""
echo ""
read -p "Press Enter when you have copied the Provisioning Key..."

echo ""
echo "Step 2: Add Provisioning Key to ~/.zshrc"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Paste your Provisioning Key here:"
read -p "OPENROUTER_PROVISIONING_KEY: " PROV_KEY

if [ -z "$PROV_KEY" ]; then
  echo "❌ No key provided. Exiting."
  exit 1
fi

# Add to ~/.zshrc
if ! grep -q "export OPENROUTER_PROVISIONING_KEY" "$HOME/.zshrc" 2>/dev/null; then
  echo "" >> "$HOME/.zshrc"
  echo "# OpenRouter Provisioning API Key (for automated key management)" >> "$HOME/.zshrc"
  echo "export OPENROUTER_PROVISIONING_KEY=\"$PROV_KEY\"" >> "$HOME/.zshrc"
  echo ""
  echo "✅ Added Provisioning Key to ~/.zshrc"
else
  echo "⚠️  Provisioning Key already exists in ~/.zshrc"
  echo "   Skipping addition..."
fi

echo ""
echo "Step 3: Create Regular API Key Automatically"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Reload environment
source "$HOME/.zshrc" 2>/dev/null || true

# Create regular API key
echo "🤖 Creating regular API key automatically..."
node scripts/automate-openrouter-key.js --create --update-zshrc

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Setup complete!"
  echo ""
  echo "📋 Final steps:"
  echo "   1. Reload environment: source ~/.zshrc"
  echo "   2. Verify: npm run openrouter:verify"
  echo ""
  echo "🎉 All crew members now have automated, optimized LLM access!"
  echo ""
else
  echo ""
  echo "⚠️  Automated key creation failed"
  echo "   You can create a key manually:"
  echo "   npm run openrouter:get-key"
  echo ""
fi

