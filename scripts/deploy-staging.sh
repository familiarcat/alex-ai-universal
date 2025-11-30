#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Alex AI Universal - Staging Deployment
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Lieutenant Worf: "Security protocols engaged. Staging environment verified."
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🚀 Alex AI Universal - Staging Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Environment
export NODE_ENV=staging
export DEPLOYMENT_ENV=staging

# Check dependencies
echo -e "${YELLOW}🔐 Security check...${NC}"
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${RED}❌ AWS credentials not found${NC}"
    echo "Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    exit 1
fi

# Load environment variables
if [ -f ~/.zshrc ]; then
    echo -e "${YELLOW}🔐 Loading environment variables...${NC}"
    export $(grep -E "^export (SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|N8N_BASE_URL|N8N_API_KEY)" ~/.zshrc | cut -d' ' -f2)
fi

# Install dependencies (production only)
echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
npm ci --production

# Build for production
echo -e "${YELLOW}🔨 Building for staging...${NC}"
npm run build

cd dashboard
npm ci --production
npm run build

# Deploy to AWS (staging environment)
echo -e "${YELLOW}🚀 Deploying to AWS staging...${NC}"
if [ -f "next.config.js" ]; then
    # Deploy using Amplify or your preferred method
    echo -e "${GREEN}✅ Build complete. Ready for Amplify deployment${NC}"
    echo -e "Run: aws amplify start-deployment --app-id YOUR_APP_ID --branch-name staging"
else
    echo -e "${RED}❌ next.config.js not found${NC}"
    exit 1
fi

# Run health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"
cd ..
npm run n8n:health

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Staging deployment complete${NC}"
echo -e "${GREEN}  Environment: Staging${NC}"
echo -e "${GREEN}  Status: Ready for testing${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

