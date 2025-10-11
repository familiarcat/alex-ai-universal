#!/bin/bash

# Setup Live Credentials from ~/.zshrc
# Automatically extracts credentials and creates proper .env file

echo "🔧 Setting up live credentials from ~/.zshrc"
echo "============================================="
echo ""

# Source credentials from zshrc
source ~/.zshrc 2>/dev/null

# Create .env file with live credentials
cat > .env << EOF
# Supabase Configuration (from ~/.zshrc)
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_KEY=${SUPABASE_KEY}
SUPABASE_PROJECT_NAME=${SUPABASE_PROJECT_NAME}
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# N8N Configuration (from ~/.zshrc)
N8N_URL=${N8N_URL}
N8N_BASE_URL=${N8N_BASE_URL}
N8N_API_URL=${N8N_API_URL}
N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
N8N_API_KEY=${N8N_API_KEY}
N8N_COLLABORATION_WEBHOOK=${N8N_COLLABORATION_WEBHOOK}
N8N_SUB_AGENT_WEBHOOK=${N8N_SUB_AGENT_WEBHOOK}

# LLM API Keys (from ~/.zshrc)
OPENAI_API_KEY=${OPENAI_API_KEY}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
GEMINI_API_KEY=${GEMINI_API_KEY}
BITO_API_KEY=${BITO_API_KEY}
CONTINUE_API_KEY=${CONTINUE_API_KEY}

# Crew Configuration
CREW_ENABLED=true
CREW_MEMBER_COUNT=9

# Feature Flags
USE_LIVE_N8N=true
USE_LIVE_SUPABASE=true
ENABLE_RAG_SYNC=true
EOF

echo "✅ Created .env file with live credentials"
echo ""

# Verify credentials were set
if [ -z "$SUPABASE_URL" ]; then
  echo "⚠️  WARNING: SUPABASE_URL not found in ~/.zshrc"
  echo "   Please export it manually or add to ~/.zshrc"
else
  echo "✅ Supabase URL: $SUPABASE_URL"
fi

if [ -z "$N8N_API_KEY" ]; then
  echo "⚠️  WARNING: N8N_API_KEY not found in ~/.zshrc"
  echo "   Please export it manually or add to ~/.zshrc"
else
  echo "✅ N8N API URL: $N8N_API_URL"
fi

echo ""
echo "📊 Credentials configured:"
echo "  - Supabase: ${SUPABASE_PROJECT_NAME:-strange-new-world}"
echo "  - N8N: n8n.pbradygeorgen.com"
echo "  - Crew Members: 9"
echo ""
echo "🔐 Security Note:"
echo "  - .env file is in .gitignore (not committed)"
echo "  - Credentials only in local environment"
echo ""
echo "🚀 Next steps:"
echo "  1. npm run alex-ai:status (test connection)"
echo "  2. npm run demo (run with live integration)"
echo "  3. npm run alex-ai:sync (sync crew knowledge)"
echo ""

