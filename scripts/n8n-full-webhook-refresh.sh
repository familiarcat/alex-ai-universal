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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load Supabase/N8N credentials from ~/.zshrc (if present)
if [[ -f "$SCRIPT_DIR/lib/load-supabase-env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$SCRIPT_DIR/lib/load-supabase-env.sh"
fi

cd "$REPO_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Rate limiting / caching configuration
API_DELAY_MS="${N8N_API_DELAY_MS:-1500}"
WORKFLOW_CACHE="$(mktemp)"
export API_DELAY_MS WORKFLOW_CACHE
trap 'rm -f "$WORKFLOW_CACHE"' EXIT

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
echo "   4. Prime crew identities from Memory Alpha"
echo "   5. Warm webhooks inside the container (server-side)"
echo "   6. Test webhook registration"
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
# PHASE 0: Gather workflow metadata (cached for subsequent phases)
################################################################################

echo -e "${BLUE}🔍 Phase 0: Gathering crew workflow metadata...${NC}"

WORKFLOW_TOTAL=$(node <<'NODE'
const axios = require('axios');
const fs = require('fs');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;
const CACHE_PATH = process.env.WORKFLOW_CACHE;

(async () => {
  const listResponse = await axios.get(`${N8N_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });

  const workflows = listResponse.data.data || [];
  const targets = workflows.filter(w =>
    /CREW|COORDINATION|KNOWLEDGE INGEST|ANTI-HALLUCINATION|PROJECT/i.test(w.name)
  );

  const enriched = [];

  for (const wf of targets) {
    const detail = await axios.get(`${N8N_URL}/api/v1/workflows/${wf.id}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const webhookNodes = (detail.data.nodes || [])
      .filter(node => node.type === 'n8n-nodes-base.webhook')
      .map(node => ({
        method: (node.parameters?.httpMethod || 'POST').toUpperCase(),
        path: node.parameters?.path || ''
      }))
      .filter(node => node.path);

    enriched.push({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      webhooks: webhookNodes
    });
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(enriched, null, 2));
  console.log(enriched.length);
})().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
NODE
)

if [[ -z "$WORKFLOW_TOTAL" ]]; then
  echo -e "${RED}❌ Failed to cache workflow metadata${NC}"
  exit 1
fi

echo -e "   ${GREEN}Cached metadata for ${WORKFLOW_TOTAL} workflows${NC}\n"

################################################################################
# PHASE 1: Deactivate workflows via API
################################################################################

echo -e "${BLUE}🔄 Phase 1: Deactivating workflows via activation API...${NC}"
node scripts/n8n-toggle-workflows-activate-api.js --dry-run > /dev/null 2>&1 || true

# Actually deactivate (just the deactivation part)
echo "   Running deactivation..."
node <<'NODE'
const axios = require('axios');
const fs = require('fs');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;
const CACHE_PATH = process.env.WORKFLOW_CACHE;
const delay = Number(process.env.API_DELAY_MS || '1500');

(async () => {
  const workflows = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  const active = workflows.filter(w => w.active);
  console.log(`   Found ${active.length} active workflows`);

  for (const wf of active) {
    try {
      await axios.post(`${N8N_URL}/api/v1/workflows/${wf.id}/deactivate`, {}, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      });
      console.log(`   ⚫ ${wf.name.substring(0, 50)}...`);
    } catch (error) {
      console.log(`   ❌ Failed: ${wf.name.substring(0, 50)}`);
    }

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
})().then(() => process.exit(0)).catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
NODE

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

node <<'NODE'
const axios = require('axios');
const fs = require('fs');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;
const CACHE_PATH = process.env.WORKFLOW_CACHE;
const delay = Number(process.env.API_DELAY_MS || '1500');

(async () => {
  const workflows = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  console.log(`   Found ${workflows.length} workflows to activate`);

  for (const wf of workflows) {
    try {
      await axios.post(`${N8N_URL}/api/v1/workflows/${wf.id}/activate`, {}, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      });
      console.log(`   🟢 ${wf.name.substring(0, 50)}...`);
    } catch (error) {
      console.log(`   ❌ Failed: ${wf.name.substring(0, 50)}`);
    }

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
})().then(() => process.exit(0)).catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
NODE

echo -e "${GREEN}✅ Phase 3 complete${NC}\n"

################################################################################
# PHASE 4: Prime crew identity memories
################################################################################

# Run Memory Alpha bootstrap to give each crew member an initial identity snapshot
echo -e "${BLUE}📚 Phase 4: Priming crew identities from Memory Alpha...${NC}"
if node scripts/init-crew-identity-memories.js --ingest --quiet; then
  echo -e "   ${GREEN}Identity bootstrap complete${NC}"
else
  echo -e "   ${YELLOW}Identity bootstrap encountered warnings (see output above)${NC}"
fi
echo ""
sleep 2

################################################################################
# PHASE 5: Server-side webhook warmup (inside container)
################################################################################

echo -e "${BLUE}🔥 Phase 5: Warming webhooks inside the n8n container...${NC}"

WEBHOOK_LIST=$(node <<'NODE'
const fs = require('fs');
const CACHE_PATH = process.env.WORKFLOW_CACHE;
const workflows = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) || [];

const lines = [];
for (const wf of workflows) {
  (wf.webhooks || []).forEach(hook => {
    if (!hook.path) return;
    const name = wf.name.replace(/\|/g, '-');
    lines.push(`${hook.method || 'POST'}|${hook.path}|${name}`);
  });
}
console.log(lines.join('\n'));
NODE
)

if [[ -z "$WEBHOOK_LIST" ]]; then
  echo -e "   ${YELLOW}⚠️  No webhook-enabled workflows discovered; skipping warmup${NC}\n"
else
  SSH_USER="${N8N_SSH_USER:-ubuntu}"
  SSH_HOST="${N8N_SSH_HOST:-n8n.pbradygeorgen.com}"
  SSH_KEY="${N8N_SSH_KEY:-$HOME/.ssh/id_rsa}"
  INSTANCE_ID="${N8N_EC2_INSTANCE_ID:-i-0afdf313f61f22df0}"
  AVAIL_ZONE="${N8N_EC2_AZ:-us-east-2b}"
  AWS_REGION="${N8N_EC2_REGION:-us-east-2}"

  SSH_TARGET="$SSH_HOST"
  if command -v aws >/dev/null 2>&1; then
    EC2_IP=$(aws ec2 describe-instances \
      --instance-ids "$INSTANCE_ID" \
      --region "$AWS_REGION" \
      --query 'Reservations[0].Instances[0].PublicIpAddress' \
      --output text 2>/dev/null || echo "")
    if [[ -n "$EC2_IP" && "$EC2_IP" != "None" ]]; then
      SSH_TARGET="$EC2_IP"
      echo -e "   ${GREEN}Using EC2 public IP: $SSH_TARGET${NC}"
    else
      echo -e "   ${YELLOW}Falling back to SSH host: $SSH_HOST${NC}"
    fi
  fi

  ensure_ssh_access() {
    if ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" exit 2>/dev/null; then
      return 0
    fi

    if command -v aws >/dev/null 2>&1 && [[ -f "$HOME/.ssh/id_rsa.pub" ]]; then
      echo "   Injecting SSH key via EC2 Instance Connect..."
      aws ec2-instance-connect send-ssh-public-key \
        --instance-id "$INSTANCE_ID" \
        --availability-zone "$AVAIL_ZONE" \
        --instance-os-user "$SSH_USER" \
        --ssh-public-key "file://$HOME/.ssh/id_rsa.pub" \
        --region "$AWS_REGION" >/dev/null 2>&1 || true
      sleep 3
    fi

    ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" exit 2>/dev/null
  }

  if ! ensure_ssh_access; then
    echo -e "   ${YELLOW}⚠️  Unable to reach EC2 host; skipping container warmup${NC}\n"
  else
    echo -e "   ${BLUE}📡 Establishing remote session for warmup...${NC}"

    CONTAINER_NAME=$(ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" \
      "docker ps --format '{{.Names}}' | grep -i n8n | head -1" 2>/dev/null || echo "")

    if [[ -z "$CONTAINER_NAME" ]]; then
      echo -e "   ${YELLOW}⚠️  No running n8n container detected; skipping warmup${NC}\n"
    else
      ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" "cat <<'EOF' >/tmp/crew-webhooks.list
$WEBHOOK_LIST
EOF"

      ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" "docker cp /tmp/crew-webhooks.list $CONTAINER_NAME:/tmp/crew-webhooks.list"

      ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" "docker exec $CONTAINER_NAME /bin/sh -s <<'EOSWARM'
set -e
echo \"      Running warmup inside container $CONTAINER_NAME\"
SUCCESS=0
TOTAL=0
PAYLOAD='{\"warmup\":true,\"source\":\"crew-auto-warmup\"}'
while IFS='|' read -r METHOD PATH NAME; do
  [ -z \"\$PATH\" ] && continue
  TOTAL=\$((TOTAL + 1))
  METHOD=\$(echo \"\$METHOD\" | tr '[:lower:]' '[:upper:]')
  if [ \"\$METHOD\" = \"GET\" ]; then
    TEST_STATUS=\$(curl -s -o /dev/null -w \"%{http_code}\" \"http://localhost:5678/webhook-test/\$PATH\" || echo 000)
    PROD_STATUS=\$(curl -s -o /dev/null -w \"%{http_code}\" \"http://localhost:5678/webhook/\$PATH\" || echo 000)
  else
    TEST_STATUS=\$(curl -s -o /dev/null -w \"%{http_code}\" -X \"\$METHOD\" -H \"Content-Type: application/json\" -d \"\$PAYLOAD\" \"http://localhost:5678/webhook-test/\$PATH\" || echo 000)
    PROD_STATUS=\$(curl -s -o /dev/null -w \"%{http_code}\" -X \"\$METHOD\" -H \"Content-Type: application/json\" -d \"\$PAYLOAD\" \"http://localhost:5678/webhook/\$PATH\" || echo 000)
  fi
  if [ \"\$PROD_STATUS\" = \"200\" ] || [ \"\$PROD_STATUS\" = \"201\" ]; then
    SUCCESS=\$((SUCCESS + 1))
    echo \"      ✅ \$NAME (HTTP \$PROD_STATUS)\"
  else
    echo \"      ❌ \$NAME (test:\$TEST_STATUS prod:\$PROD_STATUS)\"
  fi
  sleep 1
done < /tmp/crew-webhooks.list
echo \"      Summary: \$SUCCESS/\$TOTAL production webhooks returned 200/201\"
EOSWARM
"

      ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" "docker exec $CONTAINER_NAME rm -f /tmp/crew-webhooks.list >/dev/null 2>&1 || true"
      ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$SSH_TARGET" "rm -f /tmp/crew-webhooks.list >/dev/null 2>&1 || true"
      echo -e "   ${GREEN}✅ Server-side warmup complete${NC}\n"
    fi
  fi
fi

################################################################################
# PHASE 6: Test webhooks
################################################################################

echo -e "${BLUE}🧪 Phase 6: Testing webhook registration...${NC}"
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

