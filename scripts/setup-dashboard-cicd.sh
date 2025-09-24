#!/bin/bash
# Alex AI Dashboard CI/CD Setup Script
# Sets up git-based CI/CD for the dashboard project

set -e

echo "🖖 Alex AI Dashboard CI/CD Setup"
echo "==============================="

# Load environment variables
source ~/.zshrc

# Configuration
DASHBOARD_DIR="dashboard"
GIT_REPO_URL="https://github.com/your-username/alex-ai-universal.git"
AWS_REGION="us-east-2"

echo "📊 CI/CD Configuration:"
echo "   Dashboard Directory: ${DASHBOARD_DIR}"
echo "   Git Repository: ${GIT_REPO_URL}"
echo "   AWS Region: ${AWS_REGION}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git remote add origin ${GIT_REPO_URL} || echo "⚠️  Remote may already exist"
fi

# Create dashboard-specific git configuration
echo "📁 Setting up dashboard-specific configuration..."

# Create .gitignore for dashboard
cat > ${DASHBOARD_DIR}/.gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# AWS
.aws/
amplify/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF

echo "✅ .gitignore created"

# Create GitHub Actions secrets setup instructions
cat > ${DASHBOARD_DIR}/GITHUB_SECRETS_SETUP.md << EOF
# GitHub Secrets Setup for Alex AI Dashboard

## Required Secrets

Add these secrets to your GitHub repository:

### AWS Credentials
- \`AWS_ACCESS_KEY_ID\`: Your AWS access key ID
- \`AWS_SECRET_ACCESS_KEY\`: Your AWS secret access key

### Current Values
- AWS_ACCESS_KEY_ID: \`${AWS_ACCESS_KEY_ID}\`
- AWS_SECRET_ACCESS_KEY: \`${AWS_SECRET_ACCESS_KEY}\`

## How to Add Secrets

1. Go to your GitHub repository
2. Click on Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the values above

## Environment Variables

The dashboard will automatically use these environment variables:
- N8N_BASE_URL: https://n8n.pbradygeorgen.com
- N8N_API_KEY: (from your ~/.zshrc)
- SUPABASE_URL: (from your ~/.zshrc)
- SUPABASE_ANON_KEY: (from your ~/.zshrc)
EOF

echo "✅ GitHub secrets setup guide created"

# Create deployment status script
cat > ${DASHBOARD_DIR}/scripts/check-deployment.sh << 'EOF'
#!/bin/bash
# Check deployment status

echo "🔍 Checking Alex AI Dashboard deployment status..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured"
    exit 1
fi

# Check Amplify app status
APP_NAME="alex-ai-dashboard"
if aws amplify get-app --app-id ${APP_NAME} >/dev/null 2>&1; then
    echo "✅ Amplify app exists"
    
    # Get app status
    aws amplify get-app --app-id ${APP_NAME} --query 'app.{Name:name,Status:status,DefaultDomain:defaultDomain}' --output table
    
    # Get latest deployment
    aws amplify list-jobs --app-id ${APP_NAME} --branch-name main --max-results 1 --query 'jobSummaries[0].{Status:status,StartTime:startTime,EndTime:endTime}' --output table
else
    echo "❌ Amplify app not found"
fi
EOF

chmod +x ${DASHBOARD_DIR}/scripts/check-deployment.sh

echo "✅ Deployment status script created"

# Create initial commit
echo "📝 Creating initial commit..."
cd ${DASHBOARD_DIR}
git add .
git commit -m "Initial Alex AI Dashboard setup with CI/CD" || echo "⚠️  No changes to commit"

echo "🎉 CI/CD setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Add GitHub secrets (see GITHUB_SECRETS_SETUP.md)"
echo "2. Push to main branch: git push origin main"
echo "3. Monitor deployment in GitHub Actions"
echo "4. Check deployment status: ./scripts/check-deployment.sh"
echo ""
echo "🌐 Dashboard will be available at: https://dashboard.n8n.pbradygeorgen.com"
