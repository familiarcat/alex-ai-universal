#!/bin/bash

# Secure setup for n8n UI credentials
# Adds N8N_EMAIL and N8N_PASSWORD to ~/.zshrc

echo "🔐 N8N UI Credentials Setup"
echo "════════════════════════════════════════"
echo ""

# Check if already set
if grep -q "^export N8N_EMAIL=" ~/.zshrc 2>/dev/null; then
  echo "⚠️  N8N_EMAIL already set in ~/.zshrc"
  read -p "   Overwrite? (y/N): " overwrite
  if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
    echo "   Skipping..."
    exit 0
  fi
  # Remove old entries
  sed -i.bak '/^export N8N_EMAIL=/d' ~/.zshrc
  sed -i.bak '/^export N8N_PASSWORD=/d' ~/.zshrc
fi

# Prompt for email
read -p "Enter n8n email: " email
if [ -z "$email" ]; then
  echo "❌ Email required"
  exit 1
fi

# Prompt for password (hidden)
read -sp "Enter n8n password: " password
echo ""
if [ -z "$password" ]; then
  echo "❌ Password required"
  exit 1
fi

# Add to ~/.zshrc
echo "" >> ~/.zshrc
echo "# N8N UI Credentials (for automation)" >> ~/.zshrc
echo "export N8N_EMAIL=\"$email\"" >> ~/.zshrc
echo "export N8N_PASSWORD=\"$password\"" >> ~/.zshrc

echo ""
echo "✅ Credentials added to ~/.zshrc"
echo ""
echo "📋 Next steps:"
echo "   1. Run: source ~/.zshrc"
echo "   2. Run: node scripts/crew-coordinated-n8n-webhook-fix.js"
echo ""

