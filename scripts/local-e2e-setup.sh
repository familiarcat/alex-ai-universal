#!/bin/bash

set -e

echo ""
echo "🛠️  Alex AI - Local E2E Setup (no publish)"
echo "══════════════════════════════════════════"

# Source user credentials (N8N, Supabase, OpenAI, etc.)
if [ -f "$HOME/.zshrc" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.zshrc" >/dev/null 2>&1 || true
fi

cd "$(dirname "$0")/.."

echo "🔗 Linking local packages required by CLI..."

(
  cd packages/universal-extension
  npm install >/dev/null 2>&1 || npm install
  npm link
)

(
  cd packages/cli
  npm install >/dev/null 2>&1 || npm install
  npm link @alex-ai/universal-extension
)

echo "✅ Local linking complete"

echo ""
echo "🔐 Loading credentials and verifying remote integrations..."
npm run -s engage || true

echo ""
echo "✅ Local E2E environment is ready"
echo ""
echo "Next steps:"
echo "  - One-shot:   node bin/alex-ai engage \"your message\""
echo "  - Interactive: node bin/alex-ai chat"
echo ""
echo "Tip: In Cursor chat, after running 'npm run engage', messages will prefer the CLI flow."


