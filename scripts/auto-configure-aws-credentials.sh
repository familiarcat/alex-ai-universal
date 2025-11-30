#!/bin/bash

# 🖖 Auto-Configure AWS Credentials from ~/.zshrc
# 
# Automatically extracts and validates AWS credentials
# Sets up environment for deployment scripts

set -e

echo "🔐 Auto-Configuring AWS Credentials from ~/.zshrc"
echo ""

# Source ~/.zshrc to load credentials
source ~/.zshrc 2>/dev/null || true

# Extract credentials
AWS_ACCESS_KEY_ID=$(grep 'export AWS_ACCESS_KEY_ID=' ~/.zshrc 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1 || echo "")
AWS_SECRET_ACCESS_KEY=$(grep 'export AWS_SECRET_ACCESS_KEY=' ~/.zshrc 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1 || echo "")
AWS_REGION=$(grep 'export AWS_REGION=' ~/.zshrc 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1 || echo "us-east-2")
AWS_PROFILE=$(grep 'export AWS_PROFILE=' ~/.zshrc 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1 || echo "AmplifyUser")

# Extract Route 53 Zone ID
ROUTE53_ZONE_ID=$(grep 'export ROUTE53_ZONE_ID=' ~/.zshrc 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1 || echo "")

# Extract domain info
DOMAIN=$(grep 'export DOMAIN=' ~/.zshrc 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1 || echo "n8n.pbradygeorgen.com")
SUBDOMAIN=$(grep 'export SUBDOMAIN=' ~/.zshrc 2>/dev/null | cut -d'=' -f2 | tr -d '"' | head -1 || echo "dashboard")

# Export for use in other scripts
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_REGION
export AWS_PROFILE
export ROUTE53_ZONE_ID
export DOMAIN
export SUBDOMAIN

echo "✅ Credentials Loaded:"
echo "   AWS Region: $AWS_REGION"
echo "   AWS Profile: $AWS_PROFILE"
echo "   Domain: $DOMAIN"
echo "   Subdomain: $SUBDOMAIN"

if [ -n "$ROUTE53_ZONE_ID" ]; then
    echo "   Route 53 Zone ID: $ROUTE53_ZONE_ID"
else
    echo "   Route 53 Zone ID: (not found - will auto-discover)"
fi

echo ""

# Validate credentials
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found in ~/.zshrc"
    echo ""
    echo "Please add to ~/.zshrc:"
    echo "   export AWS_ACCESS_KEY_ID='your-key'"
    echo "   export AWS_SECRET_ACCESS_KEY='your-secret'"
    echo "   export AWS_REGION='us-east-2'"
    echo "   export AWS_PROFILE='AmplifyUser'"
    echo ""
    echo "Optional (for DNS automation):"
    echo "   export ROUTE53_ZONE_ID='your-zone-id'"
    echo "   export DOMAIN='n8n.pbradygeorgen.com'"
    echo "   export SUBDOMAIN='dashboard'"
    exit 1
fi

# Test AWS connection
echo "🔍 Testing AWS connection..."
if aws sts get-caller-identity --profile "$AWS_PROFILE" &>/dev/null; then
    echo "✅ AWS credentials validated"
    AWS_ACCOUNT=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query "Account" --output text)
    echo "   Account: $AWS_ACCOUNT"
else
    echo "❌ AWS credentials invalid"
    exit 1
fi

echo ""
echo "✅ All credentials configured and validated!"

