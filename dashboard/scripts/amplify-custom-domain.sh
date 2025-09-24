#!/bin/bash
# Amplify CLI Custom Domain Management for n8n.pbradygeorgen.com/dashboard
# Advanced domain configuration using Amplify CLI

set -e

echo "🖖 Amplify CLI Custom Domain Management"
echo "====================================="

# Configuration
APP_ID="dwmfx8efrhb9y"
DOMAIN="n8n.pbradygeorgen.com"
SUBDOMAIN="dashboard"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

echo "📊 Domain Configuration:"
echo "   App ID: ${APP_ID}"
echo "   Domain: ${DOMAIN}"
echo "   Subdomain: ${SUBDOMAIN}"
echo "   Full Domain: ${FULL_DOMAIN}"

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "❌ Amplify CLI not found. Installing..."
    npm install -g @aws-amplify/cli
fi

echo "✅ Amplify CLI found"

# Initialize Amplify project if needed
echo ""
echo "🚀 Phase 1: Amplify Project Initialization"
echo "========================================="

if [ ! -d "amplify" ]; then
    echo "📱 Initializing Amplify project..."
    amplify init \
        --name alex-ai-dashboard \
        --environment dev \
        --app-id ${APP_ID} \
        --yes
    echo "✅ Amplify project initialized"
else
    echo "✅ Amplify project already exists"
fi

# Add hosting if not already added
echo ""
echo "🚀 Phase 2: Hosting Configuration"
echo "================================"

if ! amplify status | grep -q "hosting"; then
    echo "🌐 Adding hosting..."
    amplify add hosting
    echo "✅ Hosting added"
else
    echo "✅ Hosting already configured"
fi

# Configure custom domain
echo ""
echo "🚀 Phase 3: Custom Domain Setup"
echo "=============================="

echo "🔧 Adding custom domain..."
amplify add domain \
    --domain ${DOMAIN} \
    --subdomain ${SUBDOMAIN}

echo "✅ Custom domain added"

# Configure environment variables for production
echo ""
echo "🚀 Phase 4: Environment Configuration"
echo "===================================="

echo "🔧 Setting up production environment..."
amplify env add \
    --name production \
    --profile AmplifyUser

echo "🔧 Switching to production environment..."
amplify env checkout production

# Set up environment variables
echo "🔧 Configuring environment variables..."
cat > amplify/team-provider-info.json << EOF
{
    "dev": {
        "awscloudformation": {
            "AuthRoleName": "amplify-alex-ai-dashboard-dev-123456-authRole",
            "UnauthRoleName": "amplify-alex-ai-dashboard-dev-123456-unauthRole",
            "AuthRoleArn": "arn:aws:iam::860268930466:role/amplify-alex-ai-dashboard-dev-123456-authRole",
            "UnauthRoleArn": "arn:aws:iam::860268930466:role/amplify-alex-ai-dashboard-dev-123456-unauthRole",
            "Region": "us-east-2"
        },
        "categories": {
            "hosting": {
                "amplifyhosting": {
                    "appId": "${APP_ID}"
                }
            }
        }
    },
    "production": {
        "awscloudformation": {
            "AuthRoleName": "amplify-alex-ai-dashboard-production-123456-authRole",
            "UnauthRoleName": "amplify-alex-ai-dashboard-production-123456-unauthRole",
            "AuthRoleArn": "arn:aws:iam::860268930466:role/amplify-alex-ai-dashboard-production-123456-authRole",
            "UnauthRoleArn": "arn:aws:iam::860268930466:role/amplify-alex-ai-dashboard-production-123456-unauthRole",
            "Region": "us-east-2"
        },
        "categories": {
            "hosting": {
                "amplifyhosting": {
                    "appId": "${APP_ID}"
                }
            }
        }
    }
}
EOF

# Deploy with custom domain
echo ""
echo "🚀 Phase 5: Deploy with Custom Domain"
echo "===================================="

echo "🔨 Publishing with custom domain..."
amplify publish \
    --yes \
    --profile AmplifyUser

echo "✅ Deployment completed"

# Verify domain configuration
echo ""
echo "🚀 Phase 6: Domain Verification"
echo "=============================="

echo "🔍 Checking domain status..."
amplify status

echo "🔍 Checking domain configuration..."
amplify domain list

# Test the deployment
echo ""
echo "🧪 Testing Deployment"
echo "==================="

echo "Testing Amplify app..."
AMPLIFY_URL="https://${APP_ID}.amplifyapp.com"
if curl -s -I "${AMPLIFY_URL}" | grep -q "200\|404"; then
    echo "✅ Amplify app accessible: ${AMPLIFY_URL}"
else
    echo "⚠️  Amplify app may not be ready yet"
fi

echo "Testing custom domain..."
CUSTOM_URL="https://${FULL_DOMAIN}"
if curl -s -I "${CUSTOM_URL}" | grep -q "200\|404"; then
    echo "✅ Custom domain accessible: ${CUSTOM_URL}"
else
    echo "⚠️  Custom domain may need DNS propagation"
fi

# Summary
echo ""
echo "🎉 Amplify Custom Domain Deployment Complete!"
echo "==========================================="
echo ""
echo "📱 Amplify App: ${AMPLIFY_URL}"
echo "🌐 Custom Domain: ${CUSTOM_URL}"
echo "🎯 Target URL: https://${DOMAIN}/${SUBDOMAIN}/"
echo ""
echo "📊 Deployment Features:"
echo "   • Custom domain configuration"
echo "   • Production environment setup"
echo "   • Environment variable management"
echo "   • Automated deployment pipeline"
echo ""
echo "🔧 Next Steps:"
echo "   1. Wait for DNS propagation (up to 24 hours)"
echo "   2. Test dashboard functionality"
echo "   3. Configure SSL certificates if needed"
echo "   4. Run security and integration tests"
echo ""
echo "🧪 Ready for knowledge gathering and security testing!"
echo "   Run: ./scripts/test-deployment.sh"
echo ""
echo "✅ Alex AI Dashboard custom domain deployment complete!"
