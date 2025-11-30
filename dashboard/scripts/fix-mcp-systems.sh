#!/bin/bash

# 🖖 MCP System Fix Script - Crew Coordination
# Crew: Data (Analysis) + La Forge (Infrastructure) + O'Brien (Troubleshooting) + Riker (Tactical)

echo "🖖 MCP System Fix - Crew Coordination"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the dashboard directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from dashboard directory${NC}"
    exit 1
fi

echo "📋 Step 1: Verifying Environment Variables..."
echo ""

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo -e "${BLUE}📄 Found .env.local, loading variables...${NC}"
    set -a
    source .env.local
    set +a
fi

# Check required variables
MISSING_VARS=()

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -z "$SUPABASE_URL" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_URL")
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [ -z "$SUPABASE_ANON_KEY" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    MISSING_VARS+=("OPENROUTER_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}   - $var${NC}"
    done
    echo ""
    echo -e "${YELLOW}💡 Please add these to your .env.local file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required environment variables are set${NC}"
echo ""

echo "📋 Step 2: Testing Connections..."
echo ""

# Test Supabase
SUPABASE_URL_VAL="${NEXT_PUBLIC_SUPABASE_URL:-$SUPABASE_URL}"
SUPABASE_KEY_VAL="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}"

echo "Testing Supabase..."
SUPABASE_TEST=$(curl -s -w "\n%{http_code}" -X GET \
    "${SUPABASE_URL_VAL}/rest/v1/knowledge_base?select=id&limit=1" \
    -H "apikey: ${SUPABASE_KEY_VAL}" \
    -H "Authorization: Bearer ${SUPABASE_KEY_VAL}" \
    --max-time 5 2>&1)

HTTP_CODE=$(echo "$SUPABASE_TEST" | tail -n1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "406" ]; then
    echo -e "${GREEN}  ✅ Supabase: Connected${NC}"
    SUPABASE_OK=true
else
    echo -e "${RED}  ❌ Supabase: Connection failed (HTTP $HTTP_CODE)${NC}"
    SUPABASE_OK=false
fi

# Test OpenRouter
echo "Testing OpenRouter..."
OPENROUTER_TEST=$(curl -s -w "\n%{http_code}" -X GET \
    "https://openrouter.ai/api/v1/models" \
    -H "Authorization: Bearer ${OPENROUTER_API_KEY}" \
    --max-time 5 2>&1)

HTTP_CODE=$(echo "$OPENROUTER_TEST" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}  ✅ OpenRouter: Connected${NC}"
    OPENROUTER_OK=true
else
    echo -e "${RED}  ❌ OpenRouter: Connection failed (HTTP $HTTP_CODE)${NC}"
    OPENROUTER_OK=false
fi

echo ""

if [ "$SUPABASE_OK" = "true" ] && [ "$OPENROUTER_OK" = "true" ]; then
    echo -e "${GREEN}✅ All systems are operational!${NC}"
    echo ""
    echo "📋 Step 3: Restarting Next.js Server..."
    echo ""
    echo -e "${YELLOW}⚠️  The Next.js dev server needs to be restarted to pick up environment variables${NC}"
    echo ""
    echo "To restart:"
    echo "  1. Stop the current dev server (Ctrl+C)"
    echo "  2. Run: npm run dev"
    echo ""
    echo "Or if using the restart script:"
    echo "  npm run restart:dev"
    echo ""
    echo -e "${BLUE}💡 After restarting, check http://localhost:3000/mcp/status${NC}"
else
    echo -e "${RED}❌ Some systems are not operational${NC}"
    echo ""
    echo "Please check:"
    if [ "$SUPABASE_OK" = "false" ]; then
        echo "  - Supabase credentials in .env.local"
        echo "  - Supabase project status at https://supabase.com/dashboard"
    fi
    if [ "$OPENROUTER_OK" = "false" ]; then
        echo "  - OpenRouter API key in .env.local"
        echo "  - API key validity at https://openrouter.ai/keys"
    fi
fi

echo ""
echo "✅ Fix script complete!"

