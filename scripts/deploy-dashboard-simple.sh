#!/bin/bash

# 🖖 Simple Dashboard Deployment - Works Around Build Issues
# 
# Deploys to existing EC2 infrastructure (n8n.pbradygeorgen.com)
# Uses Docker for containerized deployment
# 
# Alternative: Use Vercel/Netlify for Next.js deployment

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🖖 Simple Dashboard Deployment${NC}"
echo -e "${CYAN}   Deploy to Existing Infrastructure${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Extract credentials
extract_env_var() {
    local var_name=$1
    local default=$2
    local value=$(grep -E "^export ${var_name}=" ~/.zshrc 2>/dev/null | head -1 | sed -E "s/^export ${var_name}=['\"]?([^'\"]*)['\"]?.*/\1/" | head -1 || echo "")
    echo "${value:-$default}"
}

AWS_REGION=$(extract_env_var "AWS_REGION" "us-east-2")
AWS_PROFILE=$(extract_env_var "AWS_PROFILE" "AmplifyUser")
DOMAIN=$(extract_env_var "DOMAIN" "n8n.pbradygeorgen.com")

export AWS_REGION
export AWS_PROFILE

echo -e "${GREEN}✅ Configuration:${NC}"
echo "   Domain: $DOMAIN"
echo "   Region: $AWS_REGION"
echo "   Profile: $AWS_PROFILE"
echo ""

# Option 1: Deploy to existing EC2 (n8n.pbradygeorgen.com)
echo -e "${BLUE}📋 Deployment Options:${NC}"
echo ""
echo "   Option 1: Deploy to Existing EC2 (Recommended)"
echo "   ──────────────────────────────────────────────"
echo "   • Uses existing n8n.pbradygeorgen.com infrastructure"
echo "   • Docker containerized deployment"
echo "   • URL: https://$DOMAIN/dashboard"
echo "   • Cost: \$0 (uses existing EC2)"
echo ""
echo "   Option 2: Deploy to Vercel (Easiest)"
echo "   ─────────────────────────────────────"
echo "   • Free tier available"
echo "   • Automatic HTTPS"
echo "   • Zero configuration"
echo "   • URL: https://[project].vercel.app"
echo ""
echo "   Option 3: Deploy to AWS S3 + CloudFront"
echo "   ──────────────────────────────────────"
echo "   • Requires fixing build errors first"
echo "   • Static hosting only"
echo "   • Cost: ~\$1-5/month"
echo ""

# Check if we can deploy to EC2
if command -v aws &> /dev/null && aws sts get-caller-identity --profile "$AWS_PROFILE" &>/dev/null; then
    echo -e "${GREEN}✅ AWS credentials validated${NC}"
    echo ""
    echo -e "${BLUE}🚀 Recommended: Deploy to Existing EC2${NC}"
    echo ""
    echo "   This will:"
    echo "   1. Build Docker image"
    echo "   2. Deploy to n8n.pbradygeorgen.com via SSM"
    echo "   3. Configure nginx reverse proxy"
    echo "   4. Provide live URL: https://$DOMAIN/dashboard"
    echo ""
    echo -e "${YELLOW}   Run: ./scripts/deploy-dashboard-ec2.sh${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  AWS credentials not available${NC}"
    echo ""
    echo -e "${BLUE}🚀 Alternative: Deploy to Vercel${NC}"
    echo ""
    echo "   1. Install Vercel CLI: npm i -g vercel"
    echo "   2. Run: cd dashboard && vercel"
    echo "   3. Follow prompts"
    echo "   4. Get live URL immediately"
    echo ""
fi

# Provide live URL recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}🌐 Live URL Options:${NC}"
echo ""
echo -e "${GREEN}   1. Existing Infrastructure:${NC}"
echo "      https://$DOMAIN/dashboard"
echo "      (Deploy via: ./scripts/deploy-dashboard-ec2.sh)"
echo ""
echo -e "${GREEN}   2. Vercel (Recommended for Testing):${NC}"
echo "      https://[project].vercel.app"
echo "      (Deploy via: cd dashboard && vercel)"
echo ""
echo -e "${GREEN}   3. AWS S3 + CloudFront:${NC}"
echo "      https://[cloudfront-domain].cloudfront.net"
echo "      (Deploy via: ./scripts/deploy-dashboard-live.sh)"
echo "      (Requires fixing build errors first)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}💡 Recommendation:${NC}"
echo ""
echo "   For immediate testing, use Vercel (free, instant deployment):"
echo "   • cd dashboard"
echo "   • npm i -g vercel"
echo "   • vercel"
echo ""
echo "   For production, deploy to existing EC2:"
echo "   • ./scripts/deploy-dashboard-ec2.sh"
echo ""

