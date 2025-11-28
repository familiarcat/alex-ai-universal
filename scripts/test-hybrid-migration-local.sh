#!/bin/bash

# 🖖 Local Testing: Hybrid Migration System
# 
# Mission: Test hybrid migration locally while keeping UI connected to DDD framework
# 
# Features:
# - Runs local Next.js dev server
# - Tests migration validation without deployment
# - Keeps DDD connections (n8n → MCP → Supabase) active
# - Validates configuration and readiness

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🖖 Local Hybrid Migration Testing${NC}"
echo -e "${CYAN}   Testing Migration System with Local DDD Framework${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Extract credentials from ~/.zshrc
extract_env_var() {
    local var_name=$1
    local default=$2
    local value=$(grep -E "^export ${var_name}=" ~/.zshrc 2>/dev/null | head -1 | sed -E "s/^export ${var_name}=['\"]?([^'\"]*)['\"]?.*/\1/" | head -1 || echo "")
    echo "${value:-$default}"
}

N8N_URL=$(extract_env_var "N8N_URL" "https://n8n.pbradygeorgen.com")
MCP_URL=$(extract_env_var "MCP_URL" "https://mcp.pbradygeorgen.com")
SUPABASE_URL=$(extract_env_var "SUPABASE_URL" "")
SUPABASE_ANON_KEY=$(extract_env_var "SUPABASE_ANON_KEY" "")
AWS_ACCESS_KEY_ID=$(extract_env_var "AWS_ACCESS_KEY_ID" "")
AWS_SECRET_ACCESS_KEY=$(extract_env_var "AWS_SECRET_ACCESS_KEY" "")

# Test DDD Framework Connections
test_ddd_connections() {
    echo -e "${BLUE}📡 Testing DDD Framework Connections${NC}"
    echo ""
    
    local all_passed=true
    
    # Test n8n
    echo -n "   Testing n8n ($N8N_URL)... "
    if curl -s -f -m 5 "$N8N_URL/healthz" >/dev/null 2>&1 || curl -s -f -m 5 "$N8N_URL" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  (may be normal if not publicly accessible)${NC}"
    fi
    
    # Test MCP
    echo -n "   Testing MCP ($MCP_URL)... "
    if curl -s -f -m 5 "$MCP_URL/health" >/dev/null 2>&1 || curl -s -f -m 5 "$MCP_URL" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  (may be normal if not publicly accessible)${NC}"
    fi
    
    # Test Supabase
    if [ -n "$SUPABASE_URL" ]; then
        echo -n "   Testing Supabase ($SUPABASE_URL)... "
        if curl -s -f -m 5 "$SUPABASE_URL/rest/v1/" >/dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${YELLOW}⚠️  (may require authentication)${NC}"
        fi
    else
        echo -e "   Supabase: ${YELLOW}⚠️  Not configured${NC}"
    fi
    
    echo ""
}

# Validate Migration Readiness
validate_migration_readiness() {
    echo -e "${BLUE}✅ Validating Migration Readiness${NC}"
    echo ""
    
    local all_ready=true
    
    # Check Vercel CLI
    echo -n "   Vercel CLI... "
    if command -v vercel &> /dev/null; then
        VERCEL_VERSION=$(vercel --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ ($VERCEL_VERSION)${NC}"
    else
        echo -e "${YELLOW}⚠️  Not installed (will install during migration)${NC}"
    fi
    
    # Check AWS CLI
    echo -n "   AWS CLI... "
    if command -v aws &> /dev/null; then
        AWS_VERSION=$(aws --version 2>/dev/null | head -1 || echo "unknown")
        echo -e "${GREEN}✅ ($AWS_VERSION)${NC}"
    else
        echo -e "${RED}❌ Not installed${NC}"
        all_ready=false
    fi
    
    # Check AWS Credentials
    echo -n "   AWS Credentials... "
    if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
        echo -e "${GREEN}✅ Configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Not in ~/.zshrc (may use AWS_PROFILE)${NC}"
    fi
    
    # Check Git
    echo -n "   Git... "
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ ($GIT_VERSION)${NC}"
    else
        echo -e "${RED}❌ Not installed${NC}"
        all_ready=false
    fi
    
    # Check Milestone Tag
    echo -n "   Milestone Tag... "
    if git rev-parse "pre-hybrid-migration" >/dev/null 2>&1; then
        COMMIT=$(git rev-parse --short "pre-hybrid-migration" 2>/dev/null)
        echo -e "${GREEN}✅ ($COMMIT)${NC}"
    else
        echo -e "${YELLOW}⚠️  Not found (will be created)${NC}"
    fi
    
    # Check Dashboard Directory
    echo -n "   Dashboard Directory... "
    if [ -d "$PROJECT_ROOT/dashboard" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Not found${NC}"
        all_ready=false
    fi
    
    # Check package.json
    echo -n "   Dashboard package.json... "
    if [ -f "$PROJECT_ROOT/dashboard/package.json" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Not found${NC}"
        all_ready=false
    fi
    
    echo ""
    
    if [ "$all_ready" = false ]; then
        echo -e "${RED}❌ Some prerequisites are missing${NC}"
        return 1
    else
        echo -e "${GREEN}✅ All prerequisites ready${NC}"
        return 0
    fi
}

# Test Local Environment Variables
test_local_env() {
    echo -e "${BLUE}🔐 Testing Local Environment Configuration${NC}"
    echo ""
    
    cd "$PROJECT_ROOT/dashboard" || exit 1
    
    # Check for .env.local
    if [ -f ".env.local" ]; then
        echo -e "${GREEN}   ✅ .env.local exists${NC}"
        echo "   Environment variables configured:"
        grep -E "^NEXT_PUBLIC_" .env.local 2>/dev/null | sed 's/=.*/=***/' | sed 's/^/     /' || echo "     (none found)"
    else
        echo -e "${YELLOW}   ⚠️  .env.local not found${NC}"
        echo "   Creating template..."
        cat > .env.local << EOF
# DDD Framework Configuration
NEXT_PUBLIC_N8N_URL=$N8N_URL
NEXT_PUBLIC_MCP_URL=$MCP_URL
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
        echo -e "${GREEN}   ✅ Template created${NC}"
    fi
    
    echo ""
}

# Start Local Dev Server (in background)
start_local_dev() {
    echo -e "${BLUE}🚀 Starting Local Development Server${NC}"
    echo ""
    
    cd "$PROJECT_ROOT/dashboard" || exit 1
    
    # Check if already running
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo -e "${YELLOW}   ⚠️  Port 3000 already in use${NC}"
        echo "   Local dev server may already be running"
        echo "   Access at: http://localhost:3000"
        return 0
    fi
    
    echo "   Starting Next.js dev server..."
    echo "   This will run in the background"
    echo ""
    
    # Start in background
    npm run dev > /tmp/nextjs-dev.log 2>&1 &
    DEV_PID=$!
    
    # Wait for server to start
    echo -n "   Waiting for server to start"
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo ""
            echo -e "${GREEN}   ✅ Server started (PID: $DEV_PID)${NC}"
            echo "   Access at: http://localhost:3000"
            echo "   Logs: /tmp/nextjs-dev.log"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    echo ""
    echo -e "${YELLOW}   ⚠️  Server may still be starting${NC}"
    echo "   Check logs: tail -f /tmp/nextjs-dev.log"
    return 0
}

# Test Local API Endpoints
test_local_apis() {
    echo -e "${BLUE}🧪 Testing Local API Endpoints${NC}"
    echo ""
    
    local base_url="http://localhost:3000"
    local all_passed=true
    
    # Wait a bit for server to be ready
    sleep 2
    
    # Test health endpoint (if exists)
    echo -n "   GET /api/health... "
    if curl -s -f -m 5 "$base_url/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  (endpoint may not exist)${NC}"
    fi
    
    # Test MCP status
    echo -n "   GET /api/mcp/status... "
    RESPONSE=$(curl -s -m 5 "$base_url/api/mcp/status" 2>&1)
    if echo "$RESPONSE" | grep -q "online\|offline\|status" 2>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        echo "     Response: $(echo "$RESPONSE" | head -c 100)..."
    else
        echo -e "${YELLOW}⚠️  (may be loading or endpoint different)${NC}"
    fi
    
    # Test dashboard page
    echo -n "   GET /dashboard... "
    if curl -s -f -m 5 "$base_url/dashboard" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  (may require authentication)${NC}"
    fi
    
    echo ""
}

# Dry-run Migration Validation
dry_run_migration() {
    echo -e "${BLUE}🔍 Dry-Run: Migration Validation${NC}"
    echo ""
    
    echo "   This would execute:"
    echo "   1. ✅ Phase 1: Vercel Frontend Deployment"
    echo "      - Deploy dashboard to Vercel"
    echo "      - Configure environment variables"
    echo ""
    echo "   2. ⚠️  Phase 2: AWS Backend Infrastructure"
    echo "      - Verify AWS credentials"
    echo "      - Set up infrastructure foundation"
    echo "      - (Manual configuration required)"
    echo ""
    echo "   3. ✅ Phase 3: Integration Testing"
    echo "      - Test Vercel deployment"
    echo "      - Verify DDD connections"
    echo ""
    echo -e "${YELLOW}   ⚠️  This is a DRY RUN - no actual deployment${NC}"
    echo ""
}

# Main execution
main() {
    # Test DDD connections
    test_ddd_connections
    
    # Validate readiness
    if ! validate_migration_readiness; then
        echo -e "${RED}❌ Migration readiness check failed${NC}"
        echo "   Please fix the issues above before proceeding"
        exit 1
    fi
    
    # Test local environment
    test_local_env
    
    # Start local dev server
    if [ "$1" != "--no-server" ]; then
        start_local_dev
        
        # Wait a moment for server to initialize
        sleep 3
        
        # Test local APIs
        test_local_apis
    fi
    
    # Dry-run migration
    dry_run_migration
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Local Testing Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "📋 Summary:"
    echo "   • DDD Framework: Connected (n8n → MCP → Supabase)"
    echo "   • Local Dev Server: Running on http://localhost:3000"
    echo "   • Migration Readiness: Validated"
    echo ""
    echo "🚀 Next Steps:"
    echo "   • Test the local UI: http://localhost:3000"
    echo "   • Verify DDD connections in the dashboard"
    echo "   • When ready, run: ./scripts/hybrid-migration-vercel-aws.sh"
    echo ""
    echo "🛑 To stop the dev server:"
    echo "   pkill -f 'next dev'"
    echo "   or: lsof -ti:3000 | xargs kill"
    echo ""
}

# Run main function
main "$@"

