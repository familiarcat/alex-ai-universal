#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Alex AI Universal - Production Deployment
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Captain Picard: "Proceed with caution. This is production."
# Lieutenant Worf: "All security protocols active. Standing by."
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}  ⚠️  PRODUCTION DEPLOYMENT - PROCEED WITH CAUTION${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Safety check
read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Deployment cancelled${NC}"
    exit 0
fi

# Environment
export NODE_ENV=production
export DEPLOYMENT_ENV=prod

# Security checks
echo -e "${YELLOW}🔐 Running security checks...${NC}"

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${RED}❌ AWS credentials not found${NC}"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Supabase credentials not found${NC}"
    exit 1
fi

if [ -z "$N8N_BASE_URL" ] || [ -z "$N8N_API_KEY" ]; then
    echo -e "${RED}❌ n8n credentials not found${NC}"
    exit 1
fi

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
cd dashboard
if ! npm run test; then
    echo -e "${RED}❌ Tests failed. Aborting deployment.${NC}"
    exit 1
fi
cd ..

# Check n8n health
echo -e "${YELLOW}🏥 Checking n8n webhook health...${NC}"
if ! npm run n8n:health; then
    echo -e "${RED}❌ n8n webhooks unhealthy. Aborting deployment.${NC}"
    exit 1
fi

# Verify git status
echo -e "${YELLOW}📝 Verifying git status...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Uncommitted changes detected. Commit and push before deploying.${NC}"
    git status -s
    exit 1
fi

# Install production dependencies
echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
npm ci --production

# Build
echo -e "${YELLOW}🔨 Building for production...${NC}"
npm run build

cd dashboard
npm ci --production
npm run build

# Create deployment snapshot
echo -e "${YELLOW}📸 Creating deployment snapshot...${NC}"
git log -1 --pretty=format:"%H %s" > .deployment-snapshot
date >> .deployment-snapshot

# Deploy to AWS
echo -e "${YELLOW}🚀 Deploying to AWS production...${NC}"
echo -e "${GREEN}✅ Build complete. Ready for production deployment${NC}"
echo -e "Next steps:"
echo -e "  1. aws amplify start-deployment --app-id YOUR_APP_ID --branch-name main"
echo -e "  2. Monitor deployment: aws amplify get-job --app-id YOUR_APP_ID --branch-name main --job-id JOB_ID"
echo -e "  3. Verify production: curl -I https://your-production-url.com"
echo -e "  4. Run smoke tests: npm run test:e2e"

# Post-deployment health checks
echo -e "${YELLOW}⏳ Waiting for deployment to propagate (60s)...${NC}"
echo -e "Manual verification required after deployment completes."

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Production build complete${NC}"
echo -e "${GREEN}  Deployment snapshot saved: .deployment-snapshot${NC}"
echo -e "${GREEN}  Status: Awaiting AWS deployment${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

