#!/bin/bash
# Alex AI Dashboard CI/CD Deployment Script
# Integrates with existing CI/CD workflow for automated deployment

set -e

echo "🖖 Alex AI Dashboard CI/CD Deployment"
echo "===================================="

# Configuration
DASHBOARD_DIR="/Users/bradygeorgen/Documents/workspace/alex-ai-universal/dashboard"
PACKAGE_NAME="alex-ai-dashboard-n8n.tar.gz"
DEPLOYMENT_TARGET="n8n.pbradygeorgen.com/dashboard"

echo "📊 CI/CD Configuration:"
echo "   Dashboard Directory: ${DASHBOARD_DIR}"
echo "   Package Name: ${PACKAGE_NAME}"
echo "   Target: https://${DEPLOYMENT_TARGET}"

# Navigate to dashboard directory
cd ${DASHBOARD_DIR}

# Check if package exists
if [ ! -f "${PACKAGE_NAME}" ]; then
    echo "❌ Deployment package not found. Building..."
    ./scripts/deploy-n8n.sh
fi

echo "✅ Deployment package ready: ${PACKAGE_NAME}"

# Get package info
PACKAGE_SIZE=$(du -h ${PACKAGE_NAME} | cut -f1)
PACKAGE_FILES=$(tar -tzf ${PACKAGE_NAME} | wc -l)

echo "📦 Package Information:"
echo "   Size: ${PACKAGE_SIZE}"
echo "   Files: ${PACKAGE_FILES}"
echo "   Location: $(pwd)/${PACKAGE_NAME}"

# Create deployment manifest
cat > deployment-manifest.json << EOF
{
  "deployment": {
    "name": "alex-ai-dashboard",
    "version": "1.0.0",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "target": "${DEPLOYMENT_TARGET}",
    "package": "${PACKAGE_NAME}",
    "size": "${PACKAGE_SIZE}",
    "files": ${PACKAGE_FILES},
    "checksum": "$(shasum -a 256 ${PACKAGE_NAME} | cut -d' ' -f1)"
  },
  "features": {
    "lcr_layout": true,
    "dark_mode": true,
    "real_time_data": true,
    "n8n_integration": true,
    "supabase_integration": true,
    "responsive_design": true
  },
  "integrations": {
    "n8n_api": "https://n8n.pbradygeorgen.com/api/v1",
    "supabase": "enabled",
    "real_time_updates": "30s_interval"
  }
}
EOF

echo "✅ Created deployment manifest: deployment-manifest.json"

# Create GitHub Actions workflow (if needed)
cat > .github/workflows/deploy-dashboard.yml << 'EOF'
name: Deploy Alex AI Dashboard

on:
  push:
    branches: [ main ]
    paths: [ 'dashboard/**' ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: dashboard/package-lock.json
    
    - name: Install dependencies
      run: |
        cd dashboard
        npm ci
    
    - name: Build dashboard
      run: |
        cd dashboard
        npm run build
      env:
        N8N_API_URL: https://n8n.pbradygeorgen.com/api/v1
        N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to N8N Server
      run: |
        cd dashboard
        ./scripts/deploy-to-n8n-server.sh
        # Upload package to N8N server using your preferred method
        # This could be scp, rsync, or integration with your existing deployment system
EOF

echo "✅ Created GitHub Actions workflow: .github/workflows/deploy-dashboard.yml"

# Create deployment status file
cat > deployment-status.json << EOF
{
  "status": "ready_for_deployment",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "package": {
    "name": "${PACKAGE_NAME}",
    "size": "${PACKAGE_SIZE}",
    "files": ${PACKAGE_FILES},
    "checksum": "$(shasum -a 256 ${PACKAGE_NAME} | cut -d' ' -f1)"
  },
  "target": "${DEPLOYMENT_TARGET}",
  "next_steps": [
    "Upload package to N8N server",
    "Extract files to /dashboard directory",
    "Configure web server",
    "Set proper permissions",
    "Test deployment"
  ]
}
EOF

echo "✅ Created deployment status: deployment-status.json"

echo ""
echo "🎉 CI/CD Integration Complete!"
echo "=============================="
echo ""
echo "📁 Files created:"
echo "   • ${PACKAGE_NAME} - Deployment package"
echo "   • deployment-manifest.json - Deployment metadata"
echo "   • .github/workflows/deploy-dashboard.yml - GitHub Actions workflow"
echo "   • deployment-status.json - Current status"
echo ""
echo "🚀 Next Steps:"
echo "   1. Upload ${PACKAGE_NAME} to your N8N server"
echo "   2. Run deploy-on-server.sh on the server"
echo "   3. Configure your web server to serve from /dashboard"
echo "   4. Test the deployment at https://${DEPLOYMENT_TARGET}"
echo ""
echo "🔧 CI/CD Integration:"
echo "   • GitHub Actions workflow ready"
echo "   • Automatic deployment on dashboard changes"
echo "   • Environment variables configured"
echo ""
echo "📊 Dashboard Features:"
echo "   • LCRS (Left-Center-Right-Sidebar) layout"
echo "   • Dark mode with Federation theme"
echo "   • Real-time N8N and Supabase integration"
echo "   • Responsive design"
echo "   • Auto-refresh every 30 seconds"
echo ""

# Update package.json with deployment scripts
if ! grep -q "deploy:n8n" package.json; then
    echo "📝 Adding deployment scripts to package.json..."
    npm pkg set scripts.deploy:n8n="./scripts/deploy-n8n.sh"
    npm pkg set scripts.deploy:ci-cd="./scripts/ci-cd-deploy.sh"
    echo "✅ Added deployment scripts to package.json"
fi

echo "✅ CI/CD deployment setup complete!"
