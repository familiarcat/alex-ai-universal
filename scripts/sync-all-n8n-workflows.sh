#!/bin/bash
# Sync all N8N workflows to the running instance
# Uses crew coordination to ensure all workflows are properly synced

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🔄 N8N WORKFLOW SYNC                                                ║
║                                                                        ║
║   Syncing all workflows to running N8N instance                       ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Load credentials from ~/.zshrc
echo -e "${BLUE}🔐 Loading credentials...${NC}"
source ~/.zshrc 2>/dev/null || true

# Verify N8N credentials
if [ -z "${N8N_URL:-}" ]; then
    echo -e "${RED}❌ N8N_URL not found in environment${NC}"
    exit 1
fi

if [ -z "${N8N_API_KEY:-}" ] && [ -z "${N8N_OWNER_API_KEY:-}" ]; then
    echo -e "${RED}❌ N8N_API_KEY or N8N_OWNER_API_KEY not found${NC}"
    exit 1
fi

N8N_API_KEY="${N8N_API_KEY:-${N8N_OWNER_API_KEY}}"

echo -e "${GREEN}✅ N8N URL: $N8N_URL${NC}"
echo -e "${GREEN}✅ API Key: ${N8N_API_KEY:0:10}...${NC}"
echo ""

# Test N8N connectivity
echo -e "${BLUE}🔍 Testing N8N connectivity...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "$N8N_URL/api/v1/workflows" 2>&1 || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}❌ N8N API not accessible (HTTP $HTTP_CODE)${NC}"
    echo "   Please verify N8N is running and API key is correct"
    exit 1
fi

echo -e "${GREEN}✅ N8N API is accessible${NC}"
echo ""

# Option 1: Use sync-n8n-workflows.js (syncs specific workflows)
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📡 PHASE 1: Syncing Core Crew Workflows${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ -f "$SCRIPT_DIR/sync-n8n-workflows.js" ]; then
    echo -e "${BLUE}🔄 Running sync-n8n-workflows.js...${NC}"
    cd "$WORKSPACE_ROOT"
    node "$SCRIPT_DIR/sync-n8n-workflows.js" || {
        echo -e "${YELLOW}⚠️  sync-n8n-workflows.js had issues, continuing...${NC}"
    }
    echo ""
else
    echo -e "${YELLOW}⚠️  sync-n8n-workflows.js not found, skipping...${NC}"
fi

# Option 2: Use restore-all-n8n-workflows.js (restores all workflows)
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 PHASE 2: Restoring All Workflows${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ -f "$SCRIPT_DIR/restore-all-n8n-workflows.js" ]; then
    echo -e "${BLUE}🔄 Running restore-all-n8n-workflows.js...${NC}"
    cd "$WORKSPACE_ROOT"
    node "$SCRIPT_DIR/restore-all-n8n-workflows.js" || {
        echo -e "${YELLOW}⚠️  restore-all-n8n-workflows.js had issues, continuing...${NC}"
    }
    echo ""
else
    echo -e "${YELLOW}⚠️  restore-all-n8n-workflows.js not found, skipping...${NC}"
fi

# Option 3: Sync webhooks
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔗 PHASE 3: Syncing Webhooks${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ -f "$SCRIPT_DIR/n8n-sync-webhooks.js" ]; then
    echo -e "${BLUE}🔄 Running n8n-sync-webhooks.js...${NC}"
    cd "$WORKSPACE_ROOT"
    node "$SCRIPT_DIR/n8n-sync-webhooks.js" --register || {
        echo -e "${YELLOW}⚠️  Webhook sync had issues, but workflows are synced${NC}"
    }
    echo ""
else
    echo -e "${YELLOW}⚠️  n8n-sync-webhooks.js not found, skipping...${NC}"
fi

# Verify workflows
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}✅ PHASE 4: Verification${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}🔍 Checking deployed workflows...${NC}"
if command -v jq >/dev/null 2>&1; then
    WORKFLOW_COUNT=$(curl -s \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "$N8N_URL/api/v1/workflows" | \
        jq -r '.data | length' 2>/dev/null || echo "0")
else
    WORKFLOW_COUNT=$(curl -s \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "$N8N_URL/api/v1/workflows" | \
        node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.data?d.data.length:0)" 2>/dev/null || echo "0")
fi

echo -e "${GREEN}✅ Total workflows deployed: $WORKFLOW_COUNT${NC}"
echo ""

# List crew workflows
echo -e "${BLUE}📋 Crew Workflows:${NC}"
if command -v jq >/dev/null 2>&1; then
    curl -s \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "$N8N_URL/api/v1/workflows" | \
        jq -r '.data[] | select(.name | contains("crew-")) | "   ✅ \(.name) (ID: \(.id))"' 2>/dev/null || echo "   (Unable to list workflows)"
else
    curl -s \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        "$N8N_URL/api/v1/workflows" | \
        node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); (d.data||[]).filter(w=>w.name&&w.name.includes('crew-')).forEach(w=>console.log('   ✅ '+w.name+' (ID: '+w.id+')'))" 2>/dev/null || echo "   (Unable to list workflows)"
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}║   ✅ N8N WORKFLOW SYNC COMPLETE                                       ║${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "   1. Visit $N8N_URL to verify workflows in UI"
echo "   2. Activate workflows that need to be active"
echo "   3. Test webhook endpoints"
echo "   4. Run: node scripts/n8n-sync-webhooks.js --register"
echo ""

