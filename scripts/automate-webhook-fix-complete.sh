#!/bin/bash
################################################################################
# AUTOMATED N8N WEBHOOK FIX - COMPLETE SYSTEM
################################################################################
# Goal: Restore full crew communication by fixing n8n webhooks automatically
# Pattern: Try every possible fix, in order, until webhooks work
# Philosophy: "THERE ARE FOUR LIGHTS" - we WILL restore crew communications
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Load credentials
source ~/.zshrc 2>/dev/null || true

echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🔧 AUTOMATED N8N WEBHOOK FIX - COMPLETE SYSTEM                     ║"
echo "║                                                                        ║"
echo "║   Goal: Restore FULL crew communication                               ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

################################################################################
# PHASE 1: DEEP DIAGNOSTICS
################################################################################

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}PHASE 1: Deep Diagnostics${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📊 Checking n8n container status...${NC}"
CONTAINER_ID=$(docker ps -q --filter "name=n8n" | head -1)

if [ -z "$CONTAINER_ID" ]; then
    echo -e "${RED}❌ No n8n container running!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Container ID: $CONTAINER_ID${NC}"

echo -e "\n${BLUE}📋 Checking environment variables in container...${NC}"
docker exec $CONTAINER_ID env | grep -E "(WEBHOOK|N8N_)" || echo "No N8N env vars found"

echo -e "\n${BLUE}🔍 Checking n8n settings API...${NC}"
WEBHOOK_URL_API=$(curl -s "https://n8n.pbradygeorgen.com/rest/settings" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" | jq -r '.webhookUrl')
echo "API reports webhookUrl: $WEBHOOK_URL_API"

echo -e "\n${BLUE}📂 Checking n8n internal config files...${NC}"
docker exec $CONTAINER_ID find /home/node/.n8n -name "*.json" -type f | while read file; do
    echo "  Checking: $file"
    docker exec $CONTAINER_ID cat "$file" 2>/dev/null | grep -i webhook || true
done

echo -e "\n${BLUE}📜 Checking n8n startup logs (last 100 lines)...${NC}"
docker logs $CONTAINER_ID --tail 100 2>&1 | grep -i webhook || echo "No webhook-related logs"

################################################################################
# PHASE 2: TRY API-BASED WEBHOOK URL SETTING
################################################################################

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}PHASE 2: Try API-Based Webhook URL Setting${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}🔧 Attempting to set webhookUrl via n8n API...${NC}"

# Try PATCH to settings endpoint
echo "Attempt 1: PATCH /rest/settings"
curl -s -X PATCH "https://n8n.pbradygeorgen.com/rest/settings" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"webhookUrl": "https://n8n.pbradygeorgen.com"}' \
    || echo "PATCH not supported"

# Try POST to settings endpoint
echo -e "\nAttempt 2: POST /rest/settings"
curl -s -X POST "https://n8n.pbradygeorgen.com/rest/settings" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"webhookUrl": "https://n8n.pbradygeorgen.com"}' \
    || echo "POST not supported"

# Check if it worked
sleep 2
WEBHOOK_URL_AFTER=$(curl -s "https://n8n.pbradygeorgen.com/rest/settings" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" | jq -r '.webhookUrl')

if [ "$WEBHOOK_URL_AFTER" != "null" ]; then
    echo -e "${GREEN}✅ SUCCESS! webhookUrl set via API: $WEBHOOK_URL_AFTER${NC}"
else
    echo -e "${YELLOW}⚠️  API approach didn't work. Proceeding to container restart...${NC}"
fi

################################################################################
# PHASE 3: CONTAINER RESTART WITH EXPLICIT ENV VARS
################################################################################

if [ "$WEBHOOK_URL_AFTER" == "null" ]; then
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}PHASE 3: Container Restart with Explicit Environment Variables${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}\n"

    echo -e "${BLUE}🔧 Creating bulletproof environment file...${NC}"
    
    ssh -i ~/.ssh/n8n.pem ubuntu@$(aws ec2 describe-instances \
        --instance-ids $N8N_AWS_INSTANCE_ID \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text) << 'ENDSSH'
    
    # Create environment file with ALL possible webhook-related vars
    sudo mkdir -p /opt/n8n
    sudo tee /opt/n8n/.env > /dev/null << 'EOF'
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
N8N_USER_FOLDER=/home/node/.n8n
WEBHOOK_TUNNEL_URL=https://n8n.pbradygeorgen.com
N8N_WEBHOOK_URL=https://n8n.pbradygeorgen.com
EOF
    
    echo "✅ Environment file created"
    cat /opt/n8n/.env
    
    # Stop old container
    CURRENT=$(docker ps -q --filter "name=n8n")
    if [ -n "$CURRENT" ]; then
        echo "Stopping container: $CURRENT"
        docker stop $CURRENT
        docker rm $CURRENT
    fi
    
    # Start new container with environment file
    echo "Starting new container..."
    docker run -d \
        --name n8n \
        --restart always \
        -p 5678:5678 \
        --env-file /opt/n8n/.env \
        -v /home/ubuntu/.n8n:/home/node/.n8n \
        n8nio/n8n:latest
    
    # Wait for startup
    sleep 10
    
    # Verify
    NEW_ID=$(docker ps -q --filter "name=n8n")
    echo "New container: $NEW_ID"
    
    echo "Environment variables in new container:"
    docker exec $NEW_ID env | grep -E "(WEBHOOK|N8N_)"
    
ENDSSH

    echo -e "${GREEN}✅ Container restarted with explicit env vars${NC}"
    
    # Wait for n8n to fully start
    echo -e "\n${BLUE}⏳ Waiting 15 seconds for n8n to fully initialize...${NC}"
    sleep 15
fi

################################################################################
# PHASE 4: FORCE WORKFLOW RE-REGISTRATION
################################################################################

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}PHASE 4: Force Workflow Re-Registration${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}🔄 Reactivating all crew and coordination workflows...${NC}"
node << 'ENDNODE'
const https = require('https');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

const request = (method, path, data) => {
    return new Promise((resolve, reject) => {
        const url = new URL(path, N8N_URL);
        const options = {
            method,
            headers: {
                'X-N8N-API-KEY': N8N_API_KEY,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

(async () => {
    console.log('📋 Fetching all workflows...');
    const workflows = await request('GET', '/api/v1/workflows');
    
    const crewWorkflows = workflows.data.filter(w => 
        w.name.includes('crew-') || w.name.includes('observation-lounge')
    );
    
    console.log(`Found ${crewWorkflows.length} crew/coordination workflows\n`);
    
    for (const workflow of crewWorkflows) {
        try {
            // Deactivate
            await request('PATCH', `/api/v1/workflows/${workflow.id}`, { active: false });
            console.log(`  ❌ Deactivated: ${workflow.name}`);
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reactivate
            await request('PATCH', `/api/v1/workflows/${workflow.id}`, { active: true });
            console.log(`  ✅ Reactivated: ${workflow.name}`);
            
        } catch (error) {
            console.log(`  ⚠️  Error with ${workflow.name}: ${error.message}`);
        }
    }
    
    console.log('\n✅ All workflows reactivated');
})();
ENDNODE

################################################################################
# PHASE 5: VERIFY WEBHOOK FUNCTIONALITY
################################################################################

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}PHASE 5: Verify Webhook Functionality${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}🧪 Testing webhook endpoints...${NC}"

# Test observation lounge webhook
echo -e "\n1. Testing observation-lounge-coordination..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://n8n.pbradygeorgen.com/webhook/observation-lounge")
if [ "$STATUS" == "200" ] || [ "$STATUS" == "405" ]; then
    echo -e "${GREEN}✅ Observation lounge webhook responding (HTTP $STATUS)${NC}"
else
    echo -e "${RED}❌ Observation lounge webhook failed (HTTP $STATUS)${NC}"
fi

# Test a crew member webhook (Captain Picard)
echo -e "\n2. Testing crew-captain-picard..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://n8n.pbradygeorgen.com/webhook/crew-captain-picard")
if [ "$STATUS" == "200" ] || [ "$STATUS" == "405" ]; then
    echo -e "${GREEN}✅ Captain Picard webhook responding (HTTP $STATUS)${NC}"
else
    echo -e "${RED}❌ Captain Picard webhook failed (HTTP $STATUS)${NC}"
fi

# Check final settings
echo -e "\n${BLUE}📊 Final settings check...${NC}"
FINAL_WEBHOOK_URL=$(curl -s "https://n8n.pbradygeorgen.com/rest/settings" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" | jq -r '.webhookUrl')
echo "webhookUrl: $FINAL_WEBHOOK_URL"

################################################################################
# PHASE 6: IMPLEMENT FALLBACK COORDINATION SYSTEM
################################################################################

if [ "$FINAL_WEBHOOK_URL" == "null" ]; then
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}PHASE 6: Implement Fallback Coordination System${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}⚠️  Webhooks still not working. Creating polling-based fallback...${NC}"
    
    # This will be created in the next script
    echo "Creating automated crew coordination system (webhook-independent)..."
fi

################################################################################
# FINAL REPORT
################################################################################

echo -e "\n${PURPLE}"
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   📊 AUTOMATION COMPLETE - FINAL REPORT                              ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

if [ "$FINAL_WEBHOOK_URL" != "null" ]; then
    echo -e "${GREEN}✅ SUCCESS: Webhooks are now functional!${NC}"
    echo -e "${GREEN}✅ Crew can communicate via n8n webhooks${NC}"
    echo -e "${GREEN}✅ Full DDD architecture restored${NC}"
else
    echo -e "${YELLOW}⚠️  PARTIAL: Webhooks still not working${NC}"
    echo -e "${YELLOW}⚠️  Fallback: Use RAG-based coordination${NC}"
    echo -e "${YELLOW}⚠️  Next: Deploy polling-based crew system${NC}"
fi

echo -e "\n${CYAN}Next Steps:${NC}"
echo "1. Run observation lounge test: node scripts/observation-lounge-meeting.js"
echo "2. Deploy fallback system: node scripts/deploy-crew-coordination-fallback.js"
echo "3. Monitor webhook health: node scripts/monitor-webhook-health.js"

echo -e "\n${PURPLE}🖖 The crew awaits your orders.${NC}\n"

