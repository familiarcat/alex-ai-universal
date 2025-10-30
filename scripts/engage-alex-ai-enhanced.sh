#!/bin/bash

# Enhanced engage-alex-ai Command
# Automatically loads secrets from ~/.zshrc and initializes Alex AI with full N8N integration

echo "🚀 Alex AI Universal - Enhanced Engagement"
echo "=========================================="

# Load user env (n8n creds, etc.)
if [ -f "$HOME/.zshrc" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.zshrc" >/dev/null 2>&1 || true
fi

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
    echo "🧪 Verifying n8n remote and assigning webhooks (best-effort)..."
    # 1) Quick health (non-fatal)
    if command -v curl >/dev/null 2>&1; then
        curl -s -f "${N8N_URL:-https://n8n.pbradygeorgen.com}/healthz" >/dev/null && echo "   ✅ n8n health OK" || echo "   ⚠️  n8n health probe failed"
    fi

    # 2) Verify API creds
    node scripts/n8n-cli-tools.js test >/dev/null 2>&1 && echo "   ✅ n8n API credentials OK" || echo "   ⚠️  n8n API test failed"

    # 3) Force (re)register critical webhooks (toggle activate + probe)
    node scripts/n8n-force-register-webhooks.js >/dev/null 2>&1 && echo "   🔁 Webhooks toggled & probed" || echo "   ⚠️  Webhook re-register skipped"

    # 4) E2E control (non-blocking)
    npm run -s test:n8n-e2e >/dev/null 2>&1 && echo "   ✅ E2E trigger OK" || echo "   ⚠️  E2E trigger skipped"

    echo "Available commands:"
    echo "  - npx alexi chat          # Start interactive chat"
    echo "  - npx alexi crew          # Show crew members"
    echo "  - npx alexi status        # Check system status"
    echo "  - npx alexi unified-system status  # Check RAG and N8N status"
    echo ""
    echo "N8N agents are now connected for memory collection and sharing!"
    echo "You can now use 'Engage AlexAI' in Cursor AI chat with full N8N integration."
    echo ""
    # Create a lightweight marker for Cursor workflows and remind user about chat routing
    echo "engaged" > .alex-ai-cursor-engaged 2>/dev/null || true
    if [ -f .cursorrules ]; then
        echo "🧭 Cursor is configured to route chat to 'npx alex-ai chat' while engaged."
        echo "   Say 'exit' to stop the chat session."
    else
        echo "ℹ️  Tip: Add a .cursorrules file to prefer routing chat to 'npx alex-ai chat' after engagement."
    fi
else
    echo "❌ Failed to initialize Alex AI. Please check your ~/.zshrc configuration."
    exit 1
fi







