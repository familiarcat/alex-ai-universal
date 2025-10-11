#!/bin/bash

# Automated GitHub Secrets Setup using GitHub CLI
# Automatically adds all required secrets to GitHub repository

set -e  # Exit on error

echo "🖖 Alex AI - Automated GitHub Secrets Setup"
echo "==========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed"
  echo ""
  echo "Install with: brew install gh"
  echo "Or visit: https://cli.github.com/"
  exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
  echo "🔐 GitHub CLI is not authenticated"
  echo "Please authenticate with: gh auth login"
  echo ""
  read -p "Authenticate now? (y/n): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh auth login
  else
    echo "❌ Cannot continue without authentication"
    exit 1
  fi
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  echo "Run ./setup-credentials.sh first to create .env"
  exit 1
fi

# Source .env file
echo "📋 Loading credentials from .env..."
source .env

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

if [ -z "$REPO" ]; then
  echo "⚠️  Could not auto-detect repository"
  read -p "Enter repository (owner/repo): " REPO
fi

echo "📦 Repository: $REPO"
echo ""
echo "🔐 Adding secrets to GitHub..."
echo ""

# Function to add secret
add_secret() {
  local name=$1
  local value=$2
  
  if [ -z "$value" ]; then
    echo "⚠️  Skipping $name (value is empty)"
    return
  fi
  
  echo "  🔑 Adding $name..."
  echo "$value" | gh secret set "$name" --repo="$REPO" 2>&1 | grep -v "^$" || true
  echo "  ✅ $name added successfully"
}

# Add all secrets
echo "🔐 Supabase Secrets:"
add_secret "SUPABASE_URL" "$SUPABASE_URL"
add_secret "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_secret "SUPABASE_KEY" "$SUPABASE_KEY"

echo ""
echo "🔐 N8N Secrets:"
add_secret "N8N_API_KEY" "$N8N_API_KEY"

echo ""
echo "🔐 LLM API Keys:"
add_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
add_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"

echo ""
echo "🔐 Optional Keys:"
add_secret "OPENROUTER_API_KEY" "$OPENROUTER_API_KEY"
add_secret "GEMINI_API_KEY" "$GEMINI_API_KEY"

echo ""
echo "=" "================================================================"
echo "🎉 GitHub Secrets Setup Complete!"
echo "=================================================================="
echo ""

# Verify secrets were added
echo "✅ Verifying secrets in GitHub..."
gh secret list --repo="$REPO" | head -10

echo ""
echo "📊 Secrets configured:"
SECRETS_COUNT=$(gh secret list --repo="$REPO" | wc -l | tr -d ' ')
echo "  Total: $SECRETS_COUNT secrets"
echo ""

echo "🚀 Next steps:"
echo "  1. View secrets: gh secret list"
echo "  2. View in browser: https://github.com/$REPO/settings/secrets/actions"
echo "  3. Trigger workflow: git push (or manual trigger in Actions tab)"
echo ""

echo "🖖 'Make it so!' - Captain Picard"
echo ""
echo "Secrets are now configured and secure in GitHub!"

