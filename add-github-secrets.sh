#!/bin/bash

# GitHub Secrets Setup Script
# Helps you copy credentials to GitHub repository secrets

echo "🔐 GitHub Secrets Setup Helper"
echo "==============================="
echo ""
echo "This script will help you copy secrets to your clipboard"
echo "for adding to GitHub repository secrets."
echo ""

# Source environment
if [ -f .env ]; then
  source .env
else
  echo "❌ .env file not found. Run ./setup-credentials.sh first"
  exit 1
fi

echo "📋 Follow these steps for each secret:"
echo ""
echo "1. Go to: https://github.com/YOUR-USERNAME/alex-ai-universal/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Run the command below to copy the secret to clipboard"
echo "4. Paste into GitHub"
echo ""
echo "Press Enter to continue..."
read

# Function to copy secret
copy_secret() {
  local name=$1
  local value=$2
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 Secret: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if [ -z "$value" ]; then
    echo "⚠️  WARNING: Value is empty or not set"
    echo "   Check your .env file or ~/.zshrc"
    return
  fi
  
  echo "$value" | pbcopy
  echo "✅ Copied to clipboard!"
  echo ""
  echo "In GitHub:"
  echo "  Name: $name"
  echo "  Value: [pasted from clipboard]"
  echo ""
  echo "Press Enter when added to GitHub..."
  read
}

# Add all secrets
copy_secret "SUPABASE_URL" "$SUPABASE_URL"
copy_secret "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
copy_secret "SUPABASE_KEY" "$SUPABASE_KEY"
copy_secret "N8N_API_KEY" "$N8N_API_KEY"
copy_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
copy_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"

echo ""
echo "🎉 All secrets ready for GitHub!"
echo ""
echo "✅ Checklist:"
echo "  □ SUPABASE_URL"
echo "  □ SUPABASE_ANON_KEY"
echo "  □ SUPABASE_KEY"
echo "  □ N8N_API_KEY"
echo "  □ OPENAI_API_KEY"
echo "  □ ANTHROPIC_API_KEY"
echo ""
echo "📊 Verify in GitHub:"
echo "  https://github.com/YOUR-USERNAME/alex-ai-universal/settings/secrets/actions"
echo ""
echo "🚀 After adding secrets, trigger the workflow:"
echo "  git add .github/workflows/alex-ai-integration.yml"
echo "  git commit -m 'feat: Add Alex AI integration workflow'"
echo "  git push"
echo ""

