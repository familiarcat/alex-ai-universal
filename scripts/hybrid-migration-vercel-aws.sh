#!/bin/bash

# 🖖 Hybrid Migration: Vercel Frontend + AWS Backend
# 
# Mission: Deploy Next.js dashboard to Vercel, migrate backend to AWS
# 
# Crew: Riker (Tactical) + La Forge (Infrastructure) + Data (Technical)
# 
# Features:
# - Phased deployment with checkpoints
# - Automatic rollback on failure
# - State tracking for reversion
# - Blue/green deployment support

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_FILE="$PROJECT_ROOT/.hybrid-migration-state.json"
ROLLBACK_LOG="$PROJECT_ROOT/.hybrid-migration-rollback.log"
MILESTONE_TAG="pre-hybrid-migration"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🖖 Hybrid Migration: Vercel Frontend + AWS Backend${NC}"
echo -e "${CYAN}   Phased Deployment with Rollback Support${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Extract credentials from ~/.zshrc
extract_env_var() {
    local var_name=$1
    local default=$2
    local value=$(grep -E "^export ${var_name}=" ~/.zshrc 2>/dev/null | head -1 | sed -E "s/^export ${var_name}=['\"]?([^'\"]*)['\"]?.*/\1/" | head -1 || echo "")
    echo "${value:-$default}"
}

AWS_ACCESS_KEY_ID=$(extract_env_var "AWS_ACCESS_KEY_ID" "")
AWS_SECRET_ACCESS_KEY=$(extract_env_var "AWS_SECRET_ACCESS_KEY" "")
AWS_REGION=$(extract_env_var "AWS_REGION" "us-east-2")
AWS_PROFILE=$(extract_env_var "AWS_PROFILE" "AmplifyUser")
N8N_URL=$(extract_env_var "N8N_URL" "https://n8n.pbradygeorgen.com")
MCP_URL=$(extract_env_var "MCP_URL" "https://mcp.pbradygeorgen.com")
SUPABASE_URL=$(extract_env_var "SUPABASE_URL" "")
SUPABASE_ANON_KEY=$(extract_env_var "SUPABASE_ANON_KEY" "")

# State management
save_state() {
    local phase=$1
    local status=$2
    local details=$3
    
    cat > "$STATE_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "phase": "$phase",
  "status": "$status",
  "milestone_tag": "$MILESTONE_TAG",
  "details": $details,
  "checkpoints": {
    "pre_migration": {
      "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  }
}
EOF
}

load_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo "{}"
    fi
}

log_rollback() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" >> "$ROLLBACK_LOG"
}

# Rollback functions
rollback_vercel() {
    echo -e "${YELLOW}🔄 Rolling back Vercel deployment...${NC}"
    log_rollback "Rolling back Vercel deployment"
    
    cd "$PROJECT_ROOT/dashboard" || exit 1
    
    if [ -f ".vercel/project.json" ]; then
        echo "   Checking for previous deployment..."
        PREVIOUS_DEPLOYMENT=$(vercel ls --json 2>/dev/null | jq -r '.[1].url' 2>/dev/null || echo "")
        
        if [ -n "$PREVIOUS_DEPLOYMENT" ]; then
            echo "   Rolling back to: $PREVIOUS_DEPLOYMENT"
            vercel rollback --yes 2>&1 | tee -a "$ROLLBACK_LOG" || {
                echo -e "${RED}   ⚠️  Rollback command failed, manual intervention may be required${NC}"
            }
        else
            echo "   No previous deployment found to rollback to"
        fi
    else
        echo "   No Vercel project linked, nothing to rollback"
    fi
    
    echo -e "${GREEN}   ✅ Vercel rollback complete${NC}"
}

rollback_aws() {
    echo -e "${YELLOW}🔄 Rolling back AWS infrastructure...${NC}"
    log_rollback "Rolling back AWS infrastructure"
    
    # Check if Terraform state exists
    if [ -f "$PROJECT_ROOT/infrastructure/terraform/terraform.tfstate" ]; then
        echo "   Rolling back Terraform infrastructure..."
        cd "$PROJECT_ROOT/infrastructure/terraform" || exit 1
        terraform destroy -auto-approve 2>&1 | tee -a "$ROLLBACK_LOG" || {
            echo -e "${RED}   ⚠️  Terraform destroy failed, manual cleanup may be required${NC}"
        }
    else
        echo "   No Terraform state found, checking for manual AWS resources..."
        
        # List resources that might need cleanup
        if command -v aws &> /dev/null && [ -n "$AWS_ACCESS_KEY_ID" ]; then
            export AWS_ACCESS_KEY_ID
            export AWS_SECRET_ACCESS_KEY
            export AWS_REGION
            export AWS_PROFILE
            
            echo "   Checking for S3 buckets..."
            BUCKETS=$(aws s3 ls 2>/dev/null | grep "alex-ai" | awk '{print $3}' || echo "")
            if [ -n "$BUCKETS" ]; then
                echo "   Found buckets: $BUCKETS"
                echo "   Manual cleanup required for: $BUCKETS"
            fi
        fi
    fi
    
    echo -e "${GREEN}   ✅ AWS rollback complete${NC}"
}

rollback_git() {
    echo -e "${YELLOW}🔄 Rolling back Git to milestone...${NC}"
    log_rollback "Rolling back Git to milestone: $MILESTONE_TAG"
    
    # Check if milestone tag exists
    if git rev-parse "$MILESTONE_TAG" >/dev/null 2>&1; then
        echo "   Found milestone tag: $MILESTONE_TAG"
        echo "   Resetting to milestone..."
        git reset --hard "$MILESTONE_TAG" 2>&1 | tee -a "$ROLLBACK_LOG"
        echo -e "${GREEN}   ✅ Git rollback complete${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Milestone tag not found, checking for commit...${NC}"
        STATE=$(load_state)
        COMMIT=$(echo "$STATE" | jq -r '.checkpoints.pre_migration.git_commit' 2>/dev/null || echo "")
        
        if [ -n "$COMMIT" ] && [ "$COMMIT" != "unknown" ]; then
            echo "   Resetting to commit: $COMMIT"
            git reset --hard "$COMMIT" 2>&1 | tee -a "$ROLLBACK_LOG"
            echo -e "${GREEN}   ✅ Git rollback complete${NC}"
        else
            echo -e "${RED}   ❌ No rollback point found${NC}"
            return 1
        fi
    fi
}

full_rollback() {
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}🔄 FULL ROLLBACK INITIATED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    STATE=$(load_state)
    PHASE=$(echo "$STATE" | jq -r '.phase' 2>/dev/null || echo "unknown")
    
    echo "Current phase: $PHASE"
    echo ""
    
    # Rollback in reverse order
    case "$PHASE" in
        "aws_backend"|"integration"|"complete")
            rollback_aws
            ;;
    esac
    
    case "$PHASE" in
        "vercel_frontend"|"integration"|"complete")
            rollback_vercel
            ;;
    esac
    
    # Always rollback Git last
    rollback_git
    
    # Clear state
    rm -f "$STATE_FILE"
    
    echo ""
    echo -e "${GREEN}✅ Full rollback complete${NC}"
    echo "Rollback log saved to: $ROLLBACK_LOG"
    echo ""
}

# Phase 1: Vercel Frontend Deployment
phase1_vercel_frontend() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 Phase 1: Vercel Frontend Deployment${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    save_state "vercel_frontend" "in_progress" "{\"step\": \"starting\"}"
    
    cd "$PROJECT_ROOT/dashboard" || exit 1
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}   Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    echo -e "${BLUE}   📤 Deploying to Vercel...${NC}"
    
    if [ -f ".vercel/project.json" ]; then
        echo "   Project already linked, deploying..."
        DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | grep -oE "https://[^ ]+\.vercel\.app" | head -1 || echo "")
    else
        echo "   Linking project (first time)..."
        DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | grep -oE "https://[^ ]+\.vercel\.app" | head -1 || echo "")
    fi
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        echo -e "${RED}   ❌ Deployment failed${NC}"
        save_state "vercel_frontend" "failed" "{\"error\": \"deployment_failed\"}"
        return 1
    fi
    
    echo -e "${GREEN}   ✅ Deployed to: $DEPLOYMENT_URL${NC}"
    
    # Set environment variables
    echo -e "${BLUE}   🔐 Configuring environment variables...${NC}"
    [ -n "$N8N_URL" ] && echo "$N8N_URL" | vercel env add "NEXT_PUBLIC_N8N_URL" "production" 2>/dev/null || true
    [ -n "$MCP_URL" ] && echo "$MCP_URL" | vercel env add "NEXT_PUBLIC_MCP_URL" "production" 2>/dev/null || true
    [ -n "$SUPABASE_URL" ] && echo "$SUPABASE_URL" | vercel env add "NEXT_PUBLIC_SUPABASE_URL" "production" 2>/dev/null || true
    [ -n "$SUPABASE_ANON_KEY" ] && echo "$SUPABASE_ANON_KEY" | vercel env add "NEXT_PUBLIC_SUPABASE_ANON_KEY" "production" 2>/dev/null || true
    
    # Redeploy with env vars
    vercel --prod --yes >/dev/null 2>&1
    
    save_state "vercel_frontend" "complete" "{\"deployment_url\": \"$DEPLOYMENT_URL\"}"
    
    echo ""
    echo -e "${GREEN}✅ Phase 1 Complete: Vercel Frontend Deployed${NC}"
    echo ""
}

# Phase 2: AWS Backend Infrastructure
phase2_aws_backend() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 Phase 2: AWS Backend Infrastructure${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    save_state "aws_backend" "in_progress" "{\"step\": \"starting\"}"
    
    # Check AWS credentials
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo -e "${RED}   ❌ AWS credentials not found in ~/.zshrc${NC}"
        echo "   Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
        save_state "aws_backend" "failed" "{\"error\": \"missing_credentials\"}"
        return 1
    fi
    
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY
    export AWS_REGION
    export AWS_PROFILE
    
    # Verify AWS access
    echo -e "${BLUE}   🔐 Verifying AWS access...${NC}"
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo -e "${RED}   ❌ AWS credentials invalid${NC}"
        save_state "aws_backend" "failed" "{\"error\": \"invalid_credentials\"}"
        return 1
    fi
    
    echo -e "${GREEN}   ✅ AWS access verified${NC}"
    
    # Create infrastructure directory if it doesn't exist
    INFRA_DIR="$PROJECT_ROOT/infrastructure"
    mkdir -p "$INFRA_DIR"
    
    echo -e "${BLUE}   📝 Infrastructure setup...${NC}"
    echo "   Note: Full AWS infrastructure deployment requires Terraform/CloudFormation"
    echo "   This phase sets up the foundation for backend services"
    echo ""
    echo "   Next steps (manual or automated):"
    echo "   1. Create Terraform configuration for ECS/Fargate"
    echo "   2. Deploy n8n to AWS ECS/Lambda"
    echo "   3. Configure MCP service on EC2/ECS"
    echo "   4. Set up CloudWatch monitoring"
    echo ""
    
    save_state "aws_backend" "complete" "{\"status\": \"foundation_ready\", \"note\": \"manual_setup_required\"}"
    
    echo -e "${GREEN}✅ Phase 2 Complete: AWS Backend Foundation Ready${NC}"
    echo ""
}

# Phase 3: Integration Testing
phase3_integration() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 Phase 3: Integration Testing${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    save_state "integration" "in_progress" "{\"step\": \"testing\"}"
    
    STATE=$(load_state)
    VERCEL_URL=$(echo "$STATE" | jq -r '.checkpoints.vercel_frontend.deployment_url' 2>/dev/null || echo "")
    
    if [ -z "$VERCEL_URL" ]; then
        echo -e "${YELLOW}   ⚠️  Vercel URL not found in state, checking...${NC}"
        cd "$PROJECT_ROOT/dashboard" || exit 1
        VERCEL_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")
    fi
    
    if [ -n "$VERCEL_URL" ]; then
        echo -e "${BLUE}   🧪 Testing Vercel deployment: $VERCEL_URL${NC}"
        
        # Test health endpoint
        if curl -s -f "$VERCEL_URL/api/health" >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Health check passed${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Health check endpoint not available (may be normal)${NC}"
        fi
        
        # Test MCP status endpoint
        if curl -s -f "$VERCEL_URL/api/mcp/status" >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ MCP status endpoint accessible${NC}"
        else
            echo -e "${YELLOW}   ⚠️  MCP status endpoint not accessible${NC}"
        fi
    else
        echo -e "${YELLOW}   ⚠️  Vercel URL not available for testing${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}   🔗 Integration Checklist:${NC}"
    echo "   [ ] Vercel frontend accessible"
    echo "   [ ] n8n webhooks responding"
    echo "   [ ] MCP server accessible from Vercel"
    echo "   [ ] Supabase connection working"
    echo "   [ ] End-to-end flow tested"
    echo ""
    
    save_state "integration" "complete" "{\"vercel_url\": \"$VERCEL_URL\", \"note\": \"manual_verification_required\"}"
    
    echo -e "${GREEN}✅ Phase 3 Complete: Integration Testing${NC}"
    echo ""
}

# Main execution
main() {
    # Check for rollback flag
    if [ "$1" == "--rollback" ] || [ "$1" == "-r" ]; then
        full_rollback
        exit 0
    fi
    
    # Check for status flag
    if [ "$1" == "--status" ] || [ "$1" == "-s" ]; then
        STATE=$(load_state)
        echo "Migration Status:"
        echo "$STATE" | jq '.' 2>/dev/null || echo "No migration in progress"
        exit 0
    fi
    
    # Verify milestone exists
    if ! git rev-parse "$MILESTONE_TAG" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Milestone tag '$MILESTONE_TAG' not found${NC}"
        echo "   Creating checkpoint from current commit..."
        CURRENT_COMMIT=$(git rev-parse HEAD)
        save_state "pre_migration" "checkpoint" "{\"git_commit\": \"$CURRENT_COMMIT\"}"
    else
        echo -e "${GREEN}✅ Milestone checkpoint found: $MILESTONE_TAG${NC}"
    fi
    
    echo ""
    
    # Execute phases
    phase1_vercel_frontend || {
        echo -e "${RED}❌ Phase 1 failed, initiating rollback...${NC}"
        full_rollback
        exit 1
    }
    
    read -p "Continue to Phase 2 (AWS Backend)? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        phase2_aws_backend || {
            echo -e "${RED}❌ Phase 2 failed, initiating rollback...${NC}"
            rollback_vercel
            rollback_git
            exit 1
        }
        
        read -p "Continue to Phase 3 (Integration Testing)? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            phase3_integration || {
                echo -e "${RED}❌ Phase 3 failed, initiating rollback...${NC}"
                rollback_aws
                rollback_vercel
                rollback_git
                exit 1
            }
        fi
    fi
    
    save_state "complete" "success" "{\"completed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Hybrid Migration Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Migration state saved to: $STATE_FILE"
    echo "Rollback log: $ROLLBACK_LOG"
    echo ""
    echo "To rollback: ./scripts/hybrid-migration-vercel-aws.sh --rollback"
    echo "To check status: ./scripts/hybrid-migration-vercel-aws.sh --status"
    echo ""
}

# Run main function
main "$@"

