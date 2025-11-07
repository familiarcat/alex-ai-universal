#!/bin/bash
################################################################################
# N8N FULL WEBHOOK REFRESH - GUARANTEED WEBHOOK REGISTRATION
################################################################################
# Purpose: Complete webhook refresh using discovered activation API + restart
# Approach:
#   1. Deactivate all workflows via API (unregister webhooks)
#   2. Restart n8n container (clear memory cache)
#   3. Activate all workflows via API (fresh registration)
#   4. Verify webhooks are working
#
# Why this works:
#   - API properly updates workflow state in database
#   - Restart clears n8n's in-memory webhook cache
#   - On startup, n8n reads active workflows and registers webhooks
#
# Philosophy: "Combine all approaches for guaranteed success" - Captain Picard
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🎯 N8N FULL WEBHOOK REFRESH - GUARANTEED REGISTRATION              ║
║                                                                        ║
║   "Leave nothing to chance. Plan, Execute, Verify." - Picard          ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

START_TIME=$(date +%s)

echo -e "${BLUE}📋 This script will:${NC}"
echo "   1. Deactivate all crew workflows (via API)"
echo "   2. Restart n8n Docker container (clear cache)"
echo "   3. Activate all crew workflows (via API)"
echo "   4. Test webhook registration"
echo ""
echo -e "${YELLOW}⏱️  Expected duration: ~1 minute${NC}"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi
echo ""

################################################################################
# PHASE 1: Deactivate workflows via API
################################################################################

echo -e "${BLUE}🔄 Phase 1: Deactivating workflows via activation API...${NC}"
cd "$(dirname "$0")/.."
node scripts/n8n-toggle-workflows-activate-api.js --dry-run > /dev/null 2>&1 || true

# Actually deactivate (just the deactivation part)
echo "   Running deactivation..."
node -e "
const axios = require('axios');
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

async function deactivateAll() {
  const response = await axios.get(\`\${N8N_URL}/api/v1/workflows\`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  const crewWorkflows = response.data.data.filter(w => 
    w.name.includes('CREW') || w.name.includes('COORDINATION')
  ).filter(w => w.active);
  
  console.log(\`   Found \${crewWorkflows.length} active workflows\`);
  
  for (const wf of crewWorkflows) {
    try {
      await axios.post(
        \`\${N8N_URL}/api/v1/workflows/\${wf.id}/deactivate\`,
        {},
        { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
      );
      console.log(\`   ⚫ \${wf.name.substring(0, 50)}...\`);
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.log(\`   ❌ Failed: \${wf.name.substring(0, 50)}\`);
    }
  }
}

deactivateAll().catch(console.error);
"

echo -e "${GREEN}✅ Phase 1 complete${NC}\n"
sleep 2

################################################################################
# PHASE 2: Restart n8n container
################################################################################

echo -e "${BLUE}🔄 Phase 2: Restarting n8n container...${NC}"
npm run n8n:restart

echo -e "${GREEN}✅ Phase 2 complete${NC}\n"
sleep 3

################################################################################
# PHASE 3: Activate workflows via API
################################################################################

echo -e "${BLUE}🔄 Phase 3: Activating workflows via activation API...${NC}"

node -e "
const axios = require('axios');
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

async function activateAll() {
  const response = await axios.get(\`\${N8N_URL}/api/v1/workflows\`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  const crewWorkflows = response.data.data.filter(w => 
    w.name.includes('CREW') || w.name.includes('COORDINATION')
  );
  
  console.log(\`   Found \${crewWorkflows.length} workflows to activate\`);
  
  for (const wf of crewWorkflows) {
    try {
      await axios.post(
        \`\${N8N_URL}/api/v1/workflows/\${wf.id}/activate\`,
        {},
        { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
      );
      console.log(\`   🟢 \${wf.name.substring(0, 50)}...\`);
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.log(\`   ❌ Failed: \${wf.name.substring(0, 50)}\`);
    }
  }
}

activateAll().catch(console.error);
"

echo -e "${GREEN}✅ Phase 3 complete${NC}\n"

################################################################################
# PHASE 4: Test webhooks
################################################################################

echo -e "${BLUE}🧪 Phase 4: Testing webhook registration...${NC}"
echo "   Waiting 5 seconds for webhooks to register..."
sleep 5

# Test webhooks
SUCCESS=0
TOTAL=4

test_webhook() {
  local name=$1
  local path=$2
  local status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query":"health check"}' \
    "https://n8n.pbradygeorgen.com$path" 2>/dev/null || echo "000")
  
  if [ "$status" = "200" ] || [ "$status" = "201" ]; then
    echo -e "   ${GREEN}✅ $name (HTTP $status)${NC}"
    return 0
  else
    echo -e "   ${RED}❌ $name (HTTP $status)${NC}"
    return 1
  fi
}

test_webhook "Captain Picard     " "/webhook/crew-captain-jean-luc-picard" && ((SUCCESS++)) || true
test_webhook "Commander Data     " "/webhook/crew-commander-data" && ((SUCCESS++)) || true
test_webhook "Geordi La Forge    " "/webhook/crew-geordi-la-forge" && ((SUCCESS++)) || true
test_webhook "Observation Lounge " "/webhook/observation-lounge" && ((SUCCESS++)) || true

echo ""

################################################################################
# SUMMARY
################################################################################

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $SUCCESS -eq $TOTAL ]; then
  echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║                                                                        ║${NC}"
  echo -e "${CYAN}║   ✅ SUCCESS! ALL WEBHOOKS REGISTERED AND WORKING                     ║${NC}"
  echo -e "${CYAN}║                                                                        ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Webhooks Working: $SUCCESS/$TOTAL"
  echo "Duration: ${DURATION}s"
  echo ""
  echo -e "${GREEN}🎉 All crew webhooks are operational!${NC}"
  echo ""
  echo "Next steps:"
  echo "   1. Test all crew: npm run rag:verify"
  echo "   2. Call from Alex AI chat: npm run n8n:full-refresh"
  echo "   3. Use after adding new workflows"
else
  echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║                                                                        ║${NC}"
  echo -e "${YELLOW}║   ⚠️  PARTIAL SUCCESS - SOME WEBHOOKS NOT WORKING                    ║${NC}"
  echo -e "${YELLOW}║                                                                        ║${NC}"
  echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Webhooks Working: $SUCCESS/$TOTAL"
  echo "Duration: ${DURATION}s"
  echo ""
  echo -e "${YELLOW}⚠️  Some webhooks still not registered${NC}"
  echo ""
  echo "This may indicate a deeper issue. Try:"
  echo "   1. Check n8n logs: ssh ubuntu@n8n.pbradygeorgen.com 'docker logs n8n --tail 100'"
  echo "   2. Verify WEBHOOK_URL env var in container"
  echo "   3. Manual UI toggle as last resort"
fi

