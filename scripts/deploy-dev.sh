#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Alex AI Universal - Development Deployment
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Chief O'Brien: "Simple, pragmatic, gets the job done."
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🔧 Alex AI Universal - Development Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Environment
export NODE_ENV=development
export DEPLOYMENT_ENV=dev

# Kill any existing processes on dev ports
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
bash scripts/kill-ports.sh 3000 3001 5173 || true

# Check dependencies
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm 8+"
    exit 1
fi

# Load environment variables
if [ -f ~/.zshrc ]; then
    echo -e "${YELLOW}🔐 Loading environment variables from ~/.zshrc...${NC}"
    export $(grep -E "^export (SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ANON_KEY|N8N_BASE_URL|N8N_API_KEY)" ~/.zshrc | cut -d' ' -f2)
fi

# Verify critical env vars
if [ -z "$SUPABASE_URL" ] || [ -z "$N8N_BASE_URL" ]; then
    echo -e "${YELLOW}⚠️  Warning: Missing Supabase or n8n environment variables${NC}"
    echo -e "Please set them in ~/.zshrc or .env files"
fi

# Install/update dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Build packages
echo -e "${YELLOW}🔨 Building packages...${NC}"
npm run build

# Start dashboard in development mode
echo -e "${GREEN}✅ Starting development server...${NC}"
echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Dashboard: http://localhost:3000${NC}"
echo -e "${GREEN}  Environment: Development${NC}"
echo -e "${GREEN}  Hot Reload: Enabled${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e ""

cd dashboard
npm run dev

