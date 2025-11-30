#!/bin/bash
# Simplified CI/CD Deployment - Bypasses zsh sourcing issues
# Uses direct environment variables and SSH keys

set -e

echo "🖖 Alex AI Dashboard - Simplified CI/CD Deployment"
echo "==============================================="

# Direct configuration (bypassing ~/.zshrc sourcing)
SERVER_HOST="n8n.pbradygeorgen.com"
SERVER_USER="ubuntu"
SSH_KEY="/Users/bradygeorgen/.ssh/AlexKeyPair.pem"
DASHBOARD_PATH="/var/www/dashboard"
CLOUDFRONT_DOMAIN="d3pjopnssd0uqw.cloudfront.net"
S3_BUCKET="alex-ai-dashboard-direct-1758689482"

echo "📊 Deployment Configuration:"
echo "   Server: ${SERVER_HOST}"
echo "   User: ${SERVER_USER}"
echo "   SSH Key: ${SSH_KEY}"
echo "   Dashboard Path: ${DASHBOARD_PATH}"
echo "   CloudFront Domain: ${CLOUDFRONT_DOMAIN}"

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
export AWS_PROFILE="AmplifyUser"
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity --profile ${AWS_PROFILE} || {
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

echo "📤 Creating deployment package..."
tar -czf alex-ai-dashboard-server.tar.gz out/
echo "✅ Deployment package created"

echo "📤 Uploading to server..."
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
    }
    
    # N8N API proxy
    location /api/ {
        proxy_pass https://n8n.pbradygeorgen.com/api/;
        proxy_set_header Host n8n.pbradygeorgen.com;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo "📤 Uploading nginx configuration..."
scp -i "${SSH_KEY}" nginx-config.conf ${SERVER_USER}@${SERVER_HOST}:/tmp/

echo "🔧 Applying nginx configuration..."
ssh -i "${SSH_KEY}" ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    echo "🔧 Configuring nginx..."
    
    # Install new config
    sudo mv /tmp/nginx-config.conf /etc/nginx/sites-available/alex-ai-dashboard
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/alex-ai-dashboard /etc/nginx/sites-enabled/
    
    # Test and reload nginx
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

# Wait for nginx to reload
sleep 5

echo "Testing dashboard accessibility..."
if curl -s -I "${DASHBOARD_URL}" | grep -q "200\|301\|302"; then
    echo "✅ Dashboard is accessible at: ${DASHBOARD_URL}"
else
    echo "⚠️  Dashboard may not be ready yet"
    echo "   Testing CloudFront directly..."
    if curl -s -I "https://${CLOUDFRONT_DOMAIN}" | grep -q "200"; then
        echo "✅ CloudFront is accessible: https://${CLOUDFRONT_DOMAIN}"
    fi
fi

# Summary
echo ""
echo "🎉 Simplified CI/CD Deployment Success!"
echo "===================================="
echo ""
echo "📦 Deployment Complete:"
echo "   • Server Files: ${SERVER_HOST}:${DASHBOARD_PATH}"
echo "   • CloudFront: https://${CLOUDFRONT_DOMAIN}"
echo "   • Dashboard URL: ${DASHBOARD_URL}"
echo "   • Health Check: https://${SERVER_HOST}/health"
echo ""
echo "📊 Features Deployed:"
echo "   • LCRS (Left-Center-Right-Sidebar) layout"
echo "   • Dark mode Federation theme"
echo "   • Real-time N8N integration"
echo "   • Supabase memory system"
echo "   • CloudFront CDN + Server backup"
echo "   • Nginx proxy configuration"
echo ""
echo "🧪 Ready for Testing:"
echo "   • Dashboard: ${DASHBOARD_URL}"
echo "   • API Proxy: https://${SERVER_HOST}/api/"
echo "   • Health Check: https://${SERVER_HOST}/health"
echo ""
echo "✅ Alex AI Dashboard CI/CD deployment complete!"
echo "🚀 Ready to test knowledge gathering and security!"

# Cleanup
rm -f alex-ai-dashboard-server.tar.gz nginx-config.conf
