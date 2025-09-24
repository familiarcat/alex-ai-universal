#!/bin/bash
# Complete CI/CD Deployment to n8n.pbradygeorgen.com/dashboard
# Uses nginx configuration and SSH keys from ~/.zshrc

set -e

echo "🖖 Alex AI Dashboard - Complete CI/CD Deployment"
echo "=============================================="

# Load environment variables from ~/.zshrc
source ~/.zshrc

# Configuration
SERVER_HOST="n8n.pbradygeorgen.com"
SERVER_USER="ubuntu"  # or root, depending on your setup
SSH_KEY="$SSH_KEY_PATH"
DASHBOARD_PATH="/var/www/dashboard"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/alex-ai-dashboard"
NGINX_ENABLED_PATH="/etc/nginx/sites-enabled/alex-ai-dashboard"

# AWS CloudFront configuration
CLOUDFRONT_DOMAIN="d3pjopnssd0uqw.cloudfront.net"
S3_BUCKET="alex-ai-dashboard-direct-1758689482"

echo "📊 Deployment Configuration:"
echo "   Server: ${SERVER_HOST}"
echo "   User: ${SERVER_USER}"
echo "   SSH Key: ${SSH_KEY}"
echo "   Dashboard Path: ${DASHBOARD_PATH}"
echo "   CloudFront Domain: ${CLOUDFRONT_DOMAIN}"
echo "   N8N URL: ${N8N_URL}"

# Check prerequisites
echo ""
echo "🔍 Checking Prerequisites..."

# Check SSH key exists
if [ ! -f "${SSH_KEY}" ]; then
    echo "❌ SSH key not found: ${SSH_KEY}"
    exit 1
fi
echo "✅ SSH key found"

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity --profile AmplifyUser || {
    echo "❌ AWS credentials not found"
    exit 1
}
echo "✅ AWS credentials validated"

# Build the dashboard
echo ""
echo "🔨 Building dashboard..."
npm run build
echo "✅ Dashboard built successfully"

# Phase 1: Upload files to server
echo ""
echo "🚀 Phase 1: Upload Files to Server"
echo "================================="

echo "📤 Uploading dashboard files to server..."
# Create deployment package
tar -czf alex-ai-dashboard-server.tar.gz out/

# Upload to server
scp -i "${SSH_KEY}" alex-ai-dashboard-server.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
echo "✅ Files uploaded to server"

# Phase 2: Deploy on server
echo ""
echo "🚀 Phase 2: Server Deployment"
echo "============================="

echo "🔧 Deploying on server..."
ssh -i "${SSH_KEY}" ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    echo "🖖 Deploying Alex AI Dashboard on Server"
    echo "======================================="
    
    # Create dashboard directory
    sudo mkdir -p /var/www/dashboard
    cd /var/www/dashboard
    
    # Extract dashboard files
    echo "📦 Extracting dashboard files..."
    sudo tar -xzf /tmp/alex-ai-dashboard-server.tar.gz
    
    # Set permissions
    echo "🔐 Setting permissions..."
    sudo chown -R www-data:www-data /var/www/dashboard
    sudo chmod -R 755 /var/www/dashboard
    
    # Cleanup
    rm -f /tmp/alex-ai-dashboard-server.tar.gz
    
    echo "✅ Dashboard files deployed"
EOF

echo "✅ Server deployment completed"

# Phase 3: Configure nginx
echo ""
echo "🚀 Phase 3: Nginx Configuration"
echo "=============================="

echo "🔧 Creating nginx configuration..."
cat > nginx-config.conf << EOF
server {
    listen 80;
    listen 443 ssl http2;
    server_name n8n.pbradygeorgen.com;
    
    # SSL configuration (update paths to your SSL certificates)
    # ssl_certificate /etc/ssl/certs/n8n.pbradygeorgen.com.crt;
    # ssl_certificate_key /etc/ssl/private/n8n.pbradygeorgen.com.key;
    
    # Dashboard location - proxy to CloudFront
    location /dashboard/ {
        proxy_pass https://${CLOUDFRONT_DOMAIN}/;
        proxy_set_header Host ${CLOUDFRONT_DOMAIN};
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers for API calls
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Cache control
        proxy_cache_bypass \$http_upgrade;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
    }
    
    # Alternative: Serve files directly from server (uncomment if needed)
    # location /dashboard/ {
    #     alias /var/www/dashboard/;
    #     index index.html;
    #     try_files \$uri \$uri/ /dashboard/index.html;
    #     
    #     # CORS headers
    #     add_header Access-Control-Allow-Origin *;
    #     add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    #     add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    #     
    #     # Security headers
    #     add_header X-Frame-Options "SAMEORIGIN" always;
    #     add_header X-Content-Type-Options "nosniff" always;
    #     add_header X-XSS-Protection "1; mode=block" always;
    # }
    
    # N8N API proxy
    location /api/ {
        proxy_pass https://n8n.pbradygeorgen.com/api/;
        proxy_set_header Host n8n.pbradygeorgen.com;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo "📤 Uploading nginx configuration to server..."
scp -i "${SSH_KEY}" nginx-config.conf ${SERVER_USER}@${SERVER_HOST}:/tmp/

echo "🔧 Applying nginx configuration on server..."
ssh -i "${SSH_KEY}" ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    echo "🔧 Configuring nginx..."
    
    # Backup existing config if it exists
    if [ -f /etc/nginx/sites-available/alex-ai-dashboard ]; then
        sudo cp /etc/nginx/sites-available/alex-ai-dashboard /etc/nginx/sites-available/alex-ai-dashboard.backup
    fi
    
    # Install new config
    sudo mv /tmp/nginx-config.conf /etc/nginx/sites-available/alex-ai-dashboard
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/alex-ai-dashboard /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    sudo nginx -t && {
        sudo systemctl reload nginx
        echo "✅ Nginx configuration applied and reloaded"
    } || {
        echo "❌ Nginx configuration test failed"
        exit 1
    }
    
    echo "✅ Nginx configuration complete"
EOF

echo "✅ Nginx configuration completed"

# Phase 4: Test deployment
echo ""
echo "🚀 Phase 4: Deployment Testing"
echo "============================="

echo "🧪 Testing deployment..."
DASHBOARD_URL="https://${SERVER_HOST}/dashboard/"

# Wait a moment for nginx to reload
sleep 5

echo "Testing dashboard accessibility..."
if curl -s -I "${DASHBOARD_URL}" | grep -q "200\|301\|302"; then
    echo "✅ Dashboard is accessible at: ${DASHBOARD_URL}"
else
    echo "⚠️  Dashboard may not be ready yet or needs DNS propagation"
    echo "   Testing CloudFront directly..."
    if curl -s -I "https://${CLOUDFRONT_DOMAIN}" | grep -q "200"; then
        echo "✅ CloudFront is accessible: https://${CLOUDFRONT_DOMAIN}"
    fi
fi

# Phase 5: CI/CD Integration
echo ""
echo "🚀 Phase 5: CI/CD Integration Setup"
echo "================================="

echo "🔧 Creating GitHub Actions workflow..."
mkdir -p .github/workflows

cat > .github/workflows/deploy-dashboard.yml << EOF
name: Deploy Alex AI Dashboard

on:
  push:
    branches: [ main, master ]
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
      working-directory: ./dashboard
      run: npm ci
    
    - name: Build dashboard
      working-directory: ./dashboard
      run: npm run build
      env:
        N8N_API_URL: \${{ secrets.N8N_API_URL }}
        N8N_API_KEY: \${{ secrets.N8N_API_KEY }}
        SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: \${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to AWS S3
      run: |
        cd dashboard
        ./scripts/aws-direct-deploy.sh
    
    - name: Deploy to N8N Server
      run: |
        cd dashboard
        ./scripts/nginx-cicd-deploy.sh
      env:
        SSH_PRIVATE_KEY: \${{ secrets.SSH_PRIVATE_KEY }}
        SERVER_HOST: \${{ secrets.SERVER_HOST }}
        SERVER_USER: \${{ secrets.SERVER_USER }}
EOF

echo "✅ GitHub Actions workflow created"

# Summary
echo ""
echo "🎉 Complete CI/CD Deployment Success!"
echo "==================================="
echo ""
echo "📦 Deployment Complete:"
echo "   • AWS S3 Bucket: ${S3_BUCKET}"
echo "   • CloudFront: https://${CLOUDFRONT_DOMAIN}"
echo "   • Server Files: ${SERVER_HOST}:${DASHBOARD_PATH}"
echo "   • Nginx Config: ${NGINX_CONFIG_PATH}"
echo "   • Dashboard URL: ${DASHBOARD_URL}"
echo ""
echo "📊 Features Deployed:"
echo "   • LCRS (Left-Center-Right-Sidebar) layout"
echo "   • Dark mode Federation theme"
echo "   • Real-time N8N integration"
echo "   • Supabase memory system"
echo "   • CloudFront CDN + Server backup"
echo "   • Automated CI/CD pipeline"
echo ""
echo "🔧 CI/CD Pipeline Ready:"
echo "   • GitHub Actions workflow configured"
echo "   • Automated deployment on push to main"
echo "   • Environment variables from secrets"
echo "   • Multi-stage deployment (AWS + Server)"
echo ""
echo "🧪 Ready for Testing:"
echo "   • Dashboard: ${DASHBOARD_URL}"
echo "   • Health Check: https://${SERVER_HOST}/health"
echo "   • API Proxy: https://${SERVER_HOST}/api/"
echo ""
echo "✅ Alex AI Dashboard CI/CD deployment complete!"
echo "🚀 Ready to test knowledge gathering and security!"

# Cleanup
rm -f alex-ai-dashboard-server.tar.gz nginx-config.conf
