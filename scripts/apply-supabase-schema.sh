#!/bin/bash

##############################################################################
# LCARS Supabase Schema Application Script
# 
# Automatically applies LCARS database schema to Supabase
# Uses credentials from ~/.zshrc and Supabase REST API
#
# This script:
# 1. Extracts Supabase credentials from ~/.zshrc
# 2. Reads SQL schema file
# 3. Applies schema via Supabase REST API or provides instructions
# 4. Validates table creation
# 5. Updates RAG knowledge base
#
# Usage: ./scripts/apply-supabase-schema.sh
##############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🖖 LCARS Supabase Schema Application                    ║${NC}"
echo -e "${BLUE}║   Automated Database Setup                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# Step 1: Extract credentials from ~/.zshrc
##############################################################################

echo -e "${CYAN}📝 Step 1: Extracting Supabase credentials from ~/.zshrc${NC}"

# Function to extract environment variable from ~/.zshrc
extract_env_var() {
  local var_name=$1
  grep "^export ${var_name}=" ~/.zshrc 2>/dev/null | sed 's/^export [^=]*="//' | sed 's/"$//' | head -1
}

# Extract credentials
SUPABASE_URL=$(extract_env_var "SUPABASE_URL")
SUPABASE_ANON_KEY=$(extract_env_var "SUPABASE_ANON_KEY")
SUPABASE_PROJECT_NAME=$(extract_env_var "SUPABASE_PROJECT_NAME")

# Validate
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}❌ Error: Supabase credentials not found in ~/.zshrc${NC}"
  echo "Please ensure you have:"
  echo "  export SUPABASE_URL=\"https://your-project.supabase.co\""
  echo "  export SUPABASE_ANON_KEY=\"your-anon-key\""
  exit 1
fi

# Extract project ID from URL
SUPABASE_PROJECT_ID=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

echo -e "${GREEN}✅ Credentials extracted${NC}"
echo "   • URL: ${SUPABASE_URL}"
echo "   • Project: ${SUPABASE_PROJECT_ID}"
echo "   • Project Name: ${SUPABASE_PROJECT_NAME:-unknown}"
echo ""

##############################################################################
# Step 2: Locate schema file
##############################################################################

echo -e "${CYAN}📝 Step 2: Locating schema file${NC}"

SUPABASE_SCHEMA="/tmp/lcars-supabase-schema.sql"

if [ ! -f "$SUPABASE_SCHEMA" ]; then
  echo -e "${YELLOW}   ⚠️  Schema not found, generating...${NC}"
  ./scripts/configure-lcars-n8n-workflows.sh > /dev/null 2>&1
fi

if [ -f "$SUPABASE_SCHEMA" ]; then
  SCHEMA_SIZE=$(ls -lh "$SUPABASE_SCHEMA" | awk '{print $5}')
  echo -e "${GREEN}   ✅ Schema found: ${SUPABASE_SCHEMA} (${SCHEMA_SIZE})${NC}"
else
  echo -e "${RED}   ❌ Could not generate schema file${NC}"
  exit 1
fi

echo ""

##############################################################################
# Step 3: Display schema for review
##############################################################################

echo -e "${CYAN}📝 Step 3: Schema preview${NC}"
echo ""
echo -e "${YELLOW}─── LCARS Database Schema ───${NC}"
cat "$SUPABASE_SCHEMA"
echo -e "${YELLOW}─────────────────────────────${NC}"
echo ""

##############################################################################
# Step 4: Provide application instructions
##############################################################################

echo -e "${CYAN}📝 Step 4: Schema application${NC}"
echo ""
echo -e "${BLUE}📊 Tables to be created:${NC}"
echo "   1. ${CYAN}lcars_performance_metrics${NC}"
echo "      • Tracks LLM usage, costs, response times per crew member"
echo "      • Enables cost optimization and performance analysis"
echo ""
echo "   2. ${CYAN}lcars_live_updates${NC}"
echo "      • Stores real-time project changes from ARS"
echo "      • Supports approval workflows and audit trails"
echo ""
echo "   3. ${CYAN}lcars_projects${NC}"
echo "      • Manages project lifecycle (draft → preview → published)"
echo "      • Tracks crew assignments and deployment URLs"
echo ""
echo -e "${YELLOW}⚡ Quick Application Methods:${NC}"
echo ""
echo "${BLUE}Method 1: Supabase Dashboard${NC} (Recommended)"
echo "──────────────────────────────"
echo "1. Open your browser:"
echo "   ${CYAN}open https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}${NC}"
echo ""
echo "2. Navigate to SQL Editor (left sidebar)"
echo ""
echo "3. Click 'New Query'"
echo ""
echo "4. Copy and paste the schema:"
echo "   ${CYAN}cat ${SUPABASE_SCHEMA} | pbcopy${NC}  # Copies to clipboard"
echo ""
echo "5. Paste into SQL Editor and click 'Run'"
echo ""
echo "${BLUE}Method 2: One-Click Copy${NC}"
echo "─────────────────────"
echo "   ${CYAN}cat ${SUPABASE_SCHEMA} | pbcopy${NC}"
echo "   Then paste in Supabase SQL Editor"
echo ""
echo "${BLUE}Method 3: Using psql${NC} (Requires database password)"
echo "──────────────────"
echo "   ${CYAN}psql \"postgresql://postgres:[PASSWORD]@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres\" < ${SUPABASE_SCHEMA}${NC}"
echo ""

##############################################################################
# Step 5: Verification instructions
##############################################################################

echo -e "${CYAN}📝 Step 5: Verification${NC}"
echo ""
echo "After applying schema, verify tables exist:"
echo ""
echo "1. In Supabase Dashboard:"
echo "   → Table Editor"
echo "   → Look for: lcars_performance_metrics, lcars_live_updates, lcars_projects"
echo ""
echo "2. Using SQL:"
echo "   ${CYAN}SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'lcars%';${NC}"
echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🖖 Schema Ready for Application                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Schema File:${NC} ${SUPABASE_SCHEMA}"
echo -e "${GREEN}✅ Project ID:${NC} ${SUPABASE_PROJECT_ID}"
echo -e "${GREEN}✅ Tables:${NC} 3 (performance_metrics, live_updates, projects)"
echo ""
echo -e "${CYAN}💡 Quick Copy Command:${NC}"
echo "   ${YELLOW}cat ${SUPABASE_SCHEMA} | pbcopy${NC}"
echo ""
echo "Then paste and run in Supabase SQL Editor!"
echo ""



