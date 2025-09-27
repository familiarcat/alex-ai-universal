#!/bin/bash
# Alex AI Dashboard AWS Deployment Script
# Deploys to n8n.pbradygeorgen.com/dashboard using AWS Amplify

set -e

echo "🖖 Alex AI Dashboard AWS Deployment"
echo "=================================="

# Load environment variables
source ~/.zshrc

# Configuration
APP_NAME="alex-ai-dashboard"
DOMAIN="n8n.pbradygeorgen.com"
SUBDOMAIN="dashboard"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
REGION="us-east-2"

echo "📊 Deployment Configuration:"
echo "   App Name: ${APP_NAME}"
echo "   Domain: ${FULL_DOMAIN}"
echo "   Region: ${REGION}"
echo "   AWS Profile: ${AWS_PROFILE}"

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity --profile ${AWS_PROFILE} || {
    echo "❌ AWS credentials not found or invalid"
    exit 1
}
echo "✅ AWS credentials validated"

# Build the dashboard
echo "🔨 Building dashboard..."
npm run build
echo "✅ Dashboard built successfully"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf alex-ai-dashboard.tar.gz .next package.json next.config.js public/
echo "✅ Deployment package created"

# Deploy to AWS Amplify
echo "🚀 Deploying to AWS Amplify..."

# Check if app exists
if aws amplify get-app --app-id ${APP_NAME} --profile ${AWS_PROFILE} >/dev/null 2>&1; then
    echo "📱 App exists, updating..."
    
    # Update existing app
    aws amplify update-app \
        --app-id ${APP_NAME} \
        --name "Alex AI Dashboard" \
        --description "Real-time Alex AI Universal Dashboard" \
        --profile ${AWS_PROFILE}
    
    echo "✅ App updated successfully"
else
    echo "📱 Creating new Amplify app..."
    
    # Create new app
    aws amplify create-app \
        --name "Alex AI Dashboard" \
        --description "Real-time Alex AI Universal Dashboard" \
        --platform WEB \
        --environment-variables N8N_BASE_URL=https://n8n.pbradygeorgen.com \
        --profile ${AWS_PROFILE} \
        --output json > app-info.json
    
    APP_ID=$(cat app-info.json | jq -r '.app.appId')
    echo "✅ App created with ID: ${APP_ID}"
fi

# Deploy the app
echo "🚀 Deploying app..."
aws amplify start-deployment \
    --app-id ${APP_NAME} \
    --branch-name main \
    --profile ${AWS_PROFILE} \
    --output json > deployment-info.json

DEPLOYMENT_ID=$(cat deployment-info.json | jq -r '.jobSummary.jobId')
echo "✅ Deployment started with ID: ${DEPLOYMENT_ID}"

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
aws amplify wait job-completed \
    --app-id ${APP_NAME} \
    --branch-name main \
    --job-id ${DEPLOYMENT_ID} \
    --profile ${AWS_PROFILE}

echo "✅ Deployment completed successfully!"

# Get app URL
APP_URL=$(aws amplify get-app --app-id ${APP_NAME} --profile ${AWS_PROFILE} --query 'app.defaultDomain' --output text)
echo "🌐 Dashboard deployed to: https://${APP_URL}"

# Configure custom domain if needed
echo "🔧 Configuring custom domain..."
aws amplify create-domain-association \
    --app-id ${APP_NAME} \
    --domain-name ${DOMAIN} \
    --sub-domain-settings branchName=main,prefix=${SUBDOMAIN} \
    --profile ${AWS_PROFILE} || echo "⚠️  Domain association may already exist"

echo "🎉 Alex AI Dashboard deployment complete!"
echo "📊 Dashboard URL: https://${FULL_DOMAIN}"
echo "🔗 Amplify Console: https://console.aws.amazon.com/amplify/home#/${APP_NAME}"

# Cleanup
rm -f app-info.json deployment-info.json alex-ai-dashboard.tar.gz

echo "✅ Deployment cleanup complete"

