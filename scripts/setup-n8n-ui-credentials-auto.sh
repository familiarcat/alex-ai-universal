#!/bin/bash

# Auto-setup for n8n UI credentials
# Accepts credentials via environment variables or prompts

echo "🔐 N8N UI Credentials Setup"
echo "════════════════════════════════════════"
echo ""

# Check if credentials provided via env vars
if [ -n "$N8N_EMAIL" ] && [ -n "$N8N_PASSWORD" ]; then
  echo "✅ Credentials provided via environment variables"
  email="$N8N_EMAIL"
  password="$N8N_PASSWORD"
else
  # Check if already set in ~/.zshrc
  if grep -q "^export N8N_EMAIL=" ~/.zshrc 2>/dev/null; then
    echo "✅ Credentials already found in ~/.zshrc"
    echo "   Using existing credentials"
    source ~/.zshrc
    if [ -n "$N8N_EMAIL" ] && [ -n "$N8N_PASSWORD" ]; then
      echo "✅ Credentials loaded from ~/.zshrc"
      exit 0
    fi
  fi
  
  echo "⚠️  Credentials not found"
  echo ""
  echo "Please provide credentials via one of these methods:"
  echo ""
  echo "Method 1: Environment variables"
  echo "  export N8N_EMAIL='your-email@example.com'"
  echo "  export N8N_PASSWORD='your-password'"
  echo "  bash scripts/setup-n8n-ui-credentials-auto.sh"
  echo ""
  echo "Method 2: Add to ~/.zshrc manually"
  echo "  export N8N_EMAIL='your-email@example.com'"
  echo "  export N8N_PASSWORD='your-password'"
  echo "  source ~/.zshrc"
  echo ""
  echo "Method 3: Run interactive setup"
  echo "  bash scripts/setup-n8n-ui-credentials.sh"
  echo ""
  exit 1
fi

# Remove old entries if they exist
if grep -q "^export N8N_EMAIL=" ~/.zshrc 2>/dev/null; then
  echo "🔄 Updating existing credentials in ~/.zshrc..."
  sed -i.bak '/^export N8N_EMAIL=/d' ~/.zshrc
  sed -i.bak '/^export N8N_PASSWORD=/d' ~/.zshrc
  # Remove comment if it exists
  sed -i.bak '/^# N8N UI Credentials/d' ~/.zshrc
fi

# Add to ~/.zshrc
echo "" >> ~/.zshrc
echo "# N8N UI Credentials (for automation)" >> ~/.zshrc
echo "export N8N_EMAIL=\"$email\"" >> ~/.zshrc
echo "export N8N_PASSWORD=\"$password\"" >> ~/.zshrc

echo "✅ Credentials added to ~/.zshrc"
echo ""
echo "📋 Next: source ~/.zshrc and run the crew-coordinated fix"

