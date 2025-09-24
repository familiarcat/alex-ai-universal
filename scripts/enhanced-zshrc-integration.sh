#!/bin/bash

# Enhanced Alex AI ~/.zshrc Integration Script
# Automatically loads secrets and enhances dependency connection

echo "🔧 Enhancing Alex AI ~/.zshrc Integration..."
echo "============================================="

# Create secure secrets directory
SECRETS_DIR="$HOME/.alexai-secrets"
mkdir -p "$SECRETS_DIR"

# Create secrets template if it doesn't exist
SECRETS_FILE="$SECRETS_DIR/api-keys.env"
if [ ! -f "$SECRETS_FILE" ]; then
    echo "Creating secrets template file..."
    cat > "$SECRETS_FILE" << 'EOF'
# Alex AI API Keys - Replace with your actual keys
# This file is automatically loaded by ~/.zshrc

# N8N Configuration
N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"
N8N_API_KEY="your_actual_n8n_api_key_here"
N8N_WEBHOOK_URL="https://n8n.pbradygeorgen.com/webhook"

# Supabase Configuration
SUPABASE_URL="your_actual_supabase_url_here"
SUPABASE_ANON_KEY="your_actual_supabase_anon_key_here"

# OpenAI Configuration
OPENAI_API_KEY="your_actual_openai_api_key_here"

# Alex AI Configuration
ALEX_AI_ENABLE_RAG="true"
ALEX_AI_ENABLE_SCRAPING="true"
ALEX_AI_ENABLE_BILATERAL_SYNC="true"
ALEX_AI_LEARNING_RATE="0.1"
ALEX_AI_MAX_EMBEDDINGS="1000"
ALEX_AI_ENCRYPTION_KEY="$(openssl rand -base64 32)"
EOF
    echo "✅ Secrets template created: $SECRETS_FILE"
fi

# Create enhanced ~/.zshrc integration
ENHANCED_CONFIG='
# Alex AI Enhanced Secret Loading System
load_alex_ai_secrets() {
    local secrets_file="$HOME/.alexai-secrets/api-keys.env"
    if [ -f "$secrets_file" ]; then
        # Load secrets securely
        set -a
        source "$secrets_file"
        set +a
        echo "🔐 Alex AI secrets loaded securely"
    else
        echo "⚠️  Alex AI secrets file not found: $secrets_file"
        echo "   Run: alexi setup-secrets"
    fi
}

# Alex AI Auto-Initialization
alex_ai_auto_init() {
    # Check if we are in a project directory
    if [ -f "package.json" ] || [ -f ".alex-ai-config.json" ]; then
        # Check if Alex AI is already initialized
        if [ ! -f ".alex-ai-config.json" ]; then
            echo "🚀 Auto-initializing Alex AI in project..."
            npx alexi unified-system initialize --silent 2>/dev/null || true
        fi
    fi
}

# Alex AI Project Detection
alex_ai_project_detect() {
    if [ -f ".alex-ai-config.json" ]; then
        echo "🤖 Alex AI project detected"
        # Load project-specific configuration
        if command -v jq >/dev/null 2>&1; then
            local project_type=$(jq -r ".projectType // \"unknown\"" .alex-ai-config.json 2>/dev/null)
            echo "   Project type: $project_type"
        fi
    fi
}

# Alex AI Status Check
alex_ai_status() {
    echo "🔍 Alex AI System Status:"
    echo "   N8N API: ${N8N_API_URL:-❌ Not configured}"
    echo "   Supabase: ${SUPABASE_URL:-❌ Not configured}"
    echo "   OpenAI: ${OPENAI_API_KEY:+✅ Configured}"
    echo "   RAG Learning: ${ALEX_AI_ENABLE_RAG:-❌ Disabled}"
    echo "   Bilateral Sync: ${ALEX_AI_ENABLE_BILATERAL_SYNC:-❌ Disabled}"
}

# Alex AI Quick Commands
alias alexi-status="alex_ai_status"
alias alexi-init="npx alexi unified-system initialize"
alias alexi-chat="npx alexi chat"
alias alexi-crew="npx alexi crew"
alias alexi-query="npx alexi unified-system query"

# Load secrets on shell startup
load_alex_ai_secrets

# Auto-initialize Alex AI in projects
alex_ai_project_detect
alex_ai_auto_init
'

# Check if enhanced config already exists in ~/.zshrc
if ! grep -q "Alex AI Enhanced Secret Loading System" ~/.zshrc; then
    echo "Adding enhanced Alex AI configuration to ~/.zshrc..."
    echo "$ENHANCED_CONFIG" >> ~/.zshrc
    echo "✅ Enhanced configuration added to ~/.zshrc"
else
    echo "✅ Enhanced Alex AI configuration already exists in ~/.zshrc"
fi

# Create Alex AI setup command
cat > "$HOME/.alexai-secrets/setup-secrets.sh" << 'EOF'
#!/bin/bash

echo "🔧 Alex AI Secrets Setup"
echo "========================"

SECRETS_FILE="$HOME/.alexai-secrets/api-keys.env"

if [ ! -f "$SECRETS_FILE" ]; then
    echo "❌ Secrets file not found: $SECRETS_FILE"
    exit 1
fi

echo "Please edit the secrets file with your actual API keys:"
echo "File: $SECRETS_FILE"
echo ""
echo "Required keys:"
echo "  - N8N_API_KEY: Your N8N API key"
echo "  - SUPABASE_URL: Your Supabase project URL"
echo "  - SUPABASE_ANON_KEY: Your Supabase anonymous key"
echo "  - OPENAI_API_KEY: Your OpenAI API key"
echo ""
echo "After editing, run: source ~/.zshrc"
echo "Then test with: alexi-status"
EOF

chmod +x "$HOME/.alexai-secrets/setup-secrets.sh"

echo ""
echo "🎉 Enhanced Alex AI ~/.zshrc integration complete!"
echo ""
echo "Next steps:"
echo "1. Edit your secrets file: $SECRETS_FILE"
echo "2. Run: source ~/.zshrc"
echo "3. Test: alexi-status"
echo "4. Initialize in project: alexi-init"
echo ""
echo "Quick commands available:"
echo "  - alexi-status: Check system status"
echo "  - alexi-init: Initialize Alex AI in project"
echo "  - alexi-chat: Start interactive chat"
echo "  - alexi-crew: Show crew members"
echo "  - alexi-query: Query the system"







