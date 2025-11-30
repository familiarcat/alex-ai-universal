#!/bin/bash

# 🖖 MCP System Diagnostic Script
# Crew Coordination: Data (Analysis) + La Forge (Infrastructure) + O'Brien (Troubleshooting)

echo "🖖 MCP System Diagnostic - Crew Coordination"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the dashboard directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from dashboard directory"
    exit 1
fi

echo "📊 Checking Environment Variables..."
echo ""

# Check Supabase configuration
echo "🔍 Supabase Configuration:"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}  ❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    SUPABASE_MISSING=true
else
    SUPABASE_URL_VAL="${NEXT_PUBLIC_SUPABASE_URL:-$SUPABASE_URL}"
    echo -e "${GREEN}  ✅ NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL_VAL:0:30}...${NC}"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
    SUPABASE_MISSING=true
else
    SUPABASE_KEY_VAL="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}"
    echo -e "${GREEN}  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_KEY_VAL:0:20}...${NC}"
fi

echo ""
echo "🔍 OpenRouter Configuration:"
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo -e "${RED}  ❌ OPENROUTER_API_KEY not set${NC}"
    OPENROUTER_MISSING=true
else
    echo -e "${GREEN}  ✅ OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:0:20}...${NC}"
fi

echo ""
echo "🔍 MCP Configuration:"
if [ -z "$MCP_API_KEY" ] && [ -z "$N8N_API_KEY" ]; then
    echo -e "${YELLOW}  ⚠️  MCP_API_KEY not set (using N8N_API_KEY fallback)${NC}"
else
    MCP_KEY_VAL="${MCP_API_KEY:-$N8N_API_KEY}"
    echo -e "${GREEN}  ✅ MCP_API_KEY: ${MCP_KEY_VAL:0:20}...${NC}"
fi

echo ""
echo "🔍 n8n Configuration:"
if [ -z "$N8N_URL" ] && [ -z "$NEXT_PUBLIC_N8N_URL" ]; then
    echo -e "${YELLOW}  ⚠️  N8N_URL not set (using default: https://n8n.pbradygeorgen.com)${NC}"
else
    N8N_URL_VAL="${N8N_URL:-$NEXT_PUBLIC_N8N_URL}"
    echo -e "${GREEN}  ✅ N8N_URL: $N8N_URL_VAL${NC}"
fi

echo ""
echo "🧪 Testing Connections..."
echo ""

# Test Supabase connection
if [ "$SUPABASE_MISSING" != "true" ] && [ -n "$SUPABASE_URL_VAL" ] && [ -n "$SUPABASE_KEY_VAL" ]; then
    echo "Testing Supabase connection..."
    SUPABASE_TEST=$(curl -s -w "\n%{http_code}" -X GET \
        "${SUPABASE_URL_VAL}/rest/v1/knowledge_base?select=id&limit=1" \
        -H "apikey: ${SUPABASE_KEY_VAL}" \
        -H "Authorization: Bearer ${SUPABASE_KEY_VAL}" \
        --max-time 5 2>&1)
    
    HTTP_CODE=$(echo "$SUPABASE_TEST" | tail -n1)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "406" ]; then
        echo -e "${GREEN}  ✅ Supabase: Connected${NC}"
    else
        echo -e "${RED}  ❌ Supabase: Connection failed (HTTP $HTTP_CODE)${NC}"
    fi
else
    echo -e "${RED}  ❌ Supabase: Cannot test (credentials missing)${NC}"
fi

# Test OpenRouter connection
if [ "$OPENROUTER_MISSING" != "true" ] && [ -n "$OPENROUTER_API_KEY" ]; then
    echo "Testing OpenRouter connection..."
    OPENROUTER_TEST=$(curl -s -w "\n%{http_code}" -X GET \
        "https://openrouter.ai/api/v1/models" \
        -H "Authorization: Bearer ${OPENROUTER_API_KEY}" \
        --max-time 5 2>&1)
    
    HTTP_CODE=$(echo "$OPENROUTER_TEST" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✅ OpenRouter: Connected${NC}"
    else
        echo -e "${RED}  ❌ OpenRouter: Connection failed (HTTP $HTTP_CODE)${NC}"
    fi
else
    echo -e "${RED}  ❌ OpenRouter: Cannot test (API key missing)${NC}"
fi

# Test n8n connection
N8N_URL_VAL="${N8N_URL:-${NEXT_PUBLIC_N8N_URL:-https://n8n.pbradygeorgen.com}}"
echo "Testing n8n connection..."
N8N_TEST=$(curl -s -w "\n%{http_code}" -X GET \
    "${N8N_URL_VAL}/healthz" \
    --max-time 5 2>&1)

HTTP_CODE=$(echo "$N8N_TEST" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}  ✅ n8n: Connected${NC}"
else
    echo -e "${YELLOW}  ⚠️  n8n: Connection failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "📋 Recommendations:"
echo ""

if [ "$SUPABASE_MISSING" = "true" ]; then
    echo -e "${YELLOW}  1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local${NC}"
fi

if [ "$OPENROUTER_MISSING" = "true" ]; then
    echo -e "${YELLOW}  2. Set OPENROUTER_API_KEY in .env.local${NC}"
    echo -e "${BLUE}     Get your API key from: https://openrouter.ai/keys${NC}"
fi

echo ""
echo "✅ Diagnostic complete!"
echo ""
echo "💡 To fix issues:"
echo "   1. Check your .env.local file in the dashboard directory"
echo "   2. Ensure all required environment variables are set"
echo "   3. Restart the Next.js dev server after updating .env.local"
echo ""

