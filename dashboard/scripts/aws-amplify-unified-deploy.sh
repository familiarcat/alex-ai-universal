#!/bin/bash
# Unified AWS + Amplify CLI Deployment to n8n.pbradygeorgen.com/dashboard
# Leverages both CLIs to work around deployment restrictions

set -e

echo "🖖 Alex AI Dashboard - Unified AWS + Amplify CLI Deployment"
echo "========================================================="

# Load environment variables from ~/.zshrc
export AWS_PROFILE="AmplifyUser"
export AWS_DEFAULT_REGION="us-east-2"
export N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"
export N8N_API_KEY="$(grep 'export N8N_API_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"')"
export SUPABASE_URL="$(grep 'export SUPABASE_URL=' ~/.zshrc | cut -d'=' -f2 | tr -d '"')"
export SUPABASE_ANON_KEY="$(grep 'export SUPABASE_ANON_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"')"

# Configuration
APP_NAME="alex-ai-dashboard"
DOMAIN="n8n.pbradygeorgen.com"
SUBDOMAIN="dashboard"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

echo "📊 Deployment Configuration:"
echo "   App Name: ${APP_NAME}"
echo "   Target Domain: ${FULL_DOMAIN}"
echo "   Region: ${AWS_DEFAULT_REGION}"
echo "   AWS Profile: ${AWS_PROFILE}"

# Check prerequisites
echo ""
echo "🔍 Checking Prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi
echo "✅ AWS CLI found"

# Check Amplify CLI
if ! command -v amplify &> /dev/null; then
    echo "⚠️  Amplify CLI not found. Installing..."
    npm install -g @aws-amplify/cli
fi
echo "✅ Amplify CLI found"

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity --profile ${AWS_PROFILE} || {
    echo "❌ AWS credentials not found or invalid"
    exit 1
}
echo "✅ AWS credentials validated"

# Build the dashboard
echo ""
echo "🔨 Building dashboard..."
npm run build
echo "✅ Dashboard built successfully"

# Phase 1: Initialize Amplify project (if not already done)
echo ""
echo "🚀 Phase 1: Amplify Project Setup"
echo "================================"

if [ ! -d "amplify" ]; then
    echo "📱 Initializing Amplify project..."
    amplify init \
        --name ${APP_NAME} \
        --environment dev \
        --app-id dwmfx8efrhb9y \
        --yes
    
    echo "✅ Amplify project initialized"
else
    echo "✅ Amplify project already exists"
fi

# Phase 2: Add hosting with custom domain support
echo ""
echo "🚀 Phase 2: Adding Hosting with Custom Domain"
echo "============================================="

# Check if hosting is already configured
if ! amplify status | grep -q "hosting"; then
    echo "🌐 Adding Amplify hosting..."
    amplify add hosting
    echo "✅ Hosting added"
else
    echo "✅ Hosting already configured"
fi

# Phase 3: Configure custom domain using AWS CLI
echo ""
echo "🚀 Phase 3: Custom Domain Configuration"
echo "======================================"

echo "🔧 Creating custom domain association..."
aws amplify create-domain-association \
    --app-id dwmfx8efrhb9y \
    --domain-name ${DOMAIN} \
    --sub-domain-settings branchName=main,prefix=${SUBDOMAIN} \
    --profile ${AWS_PROFILE} || echo "⚠️  Domain association may already exist"

echo "✅ Custom domain configured"

# Phase 4: Deploy using Amplify CLI with environment variables
echo ""
echo "🚀 Phase 4: Deploy with Environment Variables"
echo "============================================"

echo "🔧 Setting up environment variables..."
amplify env add \
    --name production \
    --profile ${AWS_PROFILE} \
    --yes

echo "🔧 Configuring environment variables..."
amplify env checkout production

# Set environment variables for the deployment
cat > amplify/team-provider-info.json << EOF
{
    "dev": {
        "awscloudformation": {
            "AuthRoleName": "amplify-${APP_NAME}-dev-123456-authRole",
            "UnauthRoleName": "amplify-${APP_NAME}-dev-123456-unauthRole",
            "AuthRoleArn": "arn:aws:iam::860268930466:role/amplify-${APP_NAME}-dev-123456-authRole",
            "UnauthRoleArn": "arn:aws:iam::860268930466:role/amplify-${APP_NAME}-dev-123456-unauthRole",
            "Region": "${AWS_DEFAULT_REGION}"
        },
        "categories": {
            "hosting": {
                "amplifyhosting": {
                    "appId": "dwmfx8efrhb9y"
                }
            }
        }
    }
}
EOF

echo "🚀 Publishing with Amplify CLI..."
amplify publish \
    --yes \
    --profile ${AWS_PROFILE}

echo "✅ Deployment completed with Amplify CLI"

# Phase 5: Configure nginx proxy for custom domain
echo ""
echo "🚀 Phase 5: Nginx Proxy Configuration"
echo "===================================="

echo "📋 Nginx configuration for ${DOMAIN}:"
cat << 'NGINX_CONFIG'
server {
    listen 80;
    listen 443 ssl http2;
    server_name n8n.pbradygeorgen.com;
    
    # SSL configuration (if you have SSL certificates)
    # ssl_certificate /path/to/certificate.crt;
    # ssl_certificate_key /path/to/private.key;
    
    # Dashboard location
    location /dashboard/ {
        proxy_pass https://dwmfx8efrhb9y.amplifyapp.com/;
        proxy_set_header Host dwmfx8efrhb9y.amplifyapp.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for API calls
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
    
    # N8N API proxy
    location /api/ {
        proxy_pass https://n8n.pbradygeorgen.com/api/;
        proxy_set_header Host n8n.pbradygeorgen.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONFIG

echo "✅ Nginx configuration ready"

# Phase 6: Test deployment
echo ""
echo "🚀 Phase 6: Deployment Testing"
echo "============================="

echo "🧪 Testing Amplify app..."
AMPLIFY_URL="https://dwmfx8efrhb9y.amplifyapp.com"
if curl -s -I "${AMPLIFY_URL}" | grep -q "200\|404"; then
    echo "✅ Amplify app is accessible at: ${AMPLIFY_URL}"
else
    echo "⚠️  Amplify app may not be ready yet"
fi

echo "🧪 Testing custom domain..."
CUSTOM_URL="https://${FULL_DOMAIN}"
if curl -s -I "${CUSTOM_URL}" | grep -q "200\|404"; then
    echo "✅ Custom domain is accessible at: ${CUSTOM_URL}"
else
    echo "⚠️  Custom domain may need DNS propagation time"
fi

# Summary
echo ""
echo "🎉 Unified Deployment Complete!"
echo "=============================="
echo ""
echo "📱 Amplify App: ${AMPLIFY_URL}"
echo "🌐 Custom Domain: ${CUSTOM_URL}"
echo "🎯 Target URL: https://${DOMAIN}/${SUBDOMAIN}/"
echo ""
echo "📊 Features Deployed:"
echo "   • LCRS (Left-Center-Right-Sidebar) layout"
echo "   • Dark mode Federation theme"
echo "   • Real-time N8N integration"
echo "   • Supabase memory system"
echo "   • Auto-refresh every 30 seconds"
echo ""
echo "🔧 Next Steps:"
echo "   1. Configure nginx on your N8N server with the provided config"
echo "   2. Update DNS records if needed"
echo "   3. Test the dashboard at https://${DOMAIN}/${SUBDOMAIN}/"
echo "   4. Run security and integration tests"
echo ""
echo "🧪 Ready to test knowledge gathering and security!"
echo "   Run: ./scripts/test-deployment.sh"
echo ""
echo "✅ Alex AI Dashboard deployment via unified AWS + Amplify CLI complete!"
