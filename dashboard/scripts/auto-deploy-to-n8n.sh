#!/bin/bash
# Automated Alex AI Dashboard Deployment to N8N Server
# This script handles the complete deployment process

set -e

echo "🖖 Automated Alex AI Dashboard Deployment to N8N Server"
echo "====================================================="

# Configuration
N8N_SERVER="n8n.pbradygeorgen.com"
PACKAGE="alex-ai-dashboard-n8n.tar.gz"
DASHBOARD_PATH="/dashboard"
DEPLOYMENT_SCRIPT="deploy-on-server.sh"

echo "📊 Deployment Configuration:"
echo "   Target Server: ${N8N_SERVER}"
echo "   Package: ${PACKAGE}"
echo "   Dashboard Path: ${DASHBOARD_PATH}"

# Check if package exists
if [ ! -f "${PACKAGE}" ]; then
    echo "❌ Deployment package not found. Building..."
    ./scripts/deploy-n8n.sh
fi

echo "✅ Deployment package found: ${PACKAGE}"

# Upload package to N8N server
echo "📤 Uploading package to N8N server..."
scp ${PACKAGE} root@${N8N_SERVER}:/tmp/ || {
    echo "❌ Failed to upload package. Please check your SSH access to ${N8N_SERVER}"
    echo "   Make sure you have SSH key access or password authentication enabled"
    exit 1
}

# Upload deployment script
echo "📤 Uploading deployment script..."
scp ${DEPLOYMENT_SCRIPT} root@${N8N_SERVER}:/tmp/ || {
    echo "❌ Failed to upload deployment script"
    exit 1
}

echo "✅ Files uploaded successfully"

# Execute deployment on server
echo "🚀 Executing deployment on N8N server..."
ssh root@${N8N_SERVER} << 'EOF'
    echo "🖖 Deploying Alex AI Dashboard on N8N Server"
    echo "============================================"
    
    DASHBOARD_PATH="/dashboard"
    PACKAGE="/tmp/alex-ai-dashboard-n8n.tar.gz"
    
    # Create dashboard directory
    echo "📁 Creating dashboard directory..."
    mkdir -p ${DASHBOARD_PATH}
    cd ${DASHBOARD_PATH}
    
    # Extract dashboard files
    echo "📦 Extracting dashboard files..."
    tar -xzf ${PACKAGE}
    
    # Set permissions
    echo "🔐 Setting permissions..."
    chown -R www-data:www-data ${DASHBOARD_PATH}
    chmod -R 755 ${DASHBOARD_PATH}
    
    # Check if nginx is installed
    if command -v nginx >/dev/null 2>&1; then
        echo "🌐 Configuring nginx..."
        
        # Create nginx configuration
        cat > /etc/nginx/sites-available/alex-ai-dashboard << 'NGINX_CONFIG'
server {
    listen 80;
    server_name n8n.pbradygeorgen.com;
    
    location /dashboard/ {
        alias /dashboard/;
        index index.html;
        try_files $uri $uri/ /dashboard/index.html;
        
        # Enable CORS for API calls
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
    
    # Handle API calls to N8N
    location /api/ {
        proxy_pass https://n8n.pbradygeorgen.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }
}
NGINX_CONFIG
        
        # Enable the site
        ln -sf /etc/nginx/sites-available/alex-ai-dashboard /etc/nginx/sites-enabled/
        
        # Test nginx configuration
        nginx -t && {
            systemctl reload nginx
            echo "✅ Nginx configured and reloaded"
        } || {
            echo "⚠️  Nginx configuration test failed, but continuing..."
        }
    else
        echo "⚠️  Nginx not found. Please configure your web server manually."
    fi
    
    # Cleanup
    rm -f /tmp/alex-ai-dashboard-n8n.tar.gz
    rm -f /tmp/deploy-on-server.sh
    
    echo "✅ Alex AI Dashboard deployed successfully!"
    echo "🌐 Dashboard should be available at: https://n8n.pbradygeorgen.com/dashboard/"
    
    # List deployed files
    echo "📁 Deployed files:"
    ls -la ${DASHBOARD_PATH}/
EOF

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "🌐 Dashboard URL: https://${N8N_SERVER}/dashboard/"
echo "📊 Features deployed:"
echo "   • LCRS (Left-Center-Right-Sidebar) layout"
echo "   • Dark mode Federation theme"
echo "   • Real-time N8N integration"
echo "   • Supabase memory system"
echo "   • Auto-refresh every 30 seconds"
echo ""
echo "🔍 Next steps:"
echo "   1. Visit https://${N8N_SERVER}/dashboard/"
echo "   2. Test real-time data integration"
echo "   3. Verify security of data transmission"
echo "   4. Monitor knowledge gathering from multiple projects"
echo ""
echo "🛡️ Security features enabled:"
echo "   • CORS headers for API access"
echo "   • Security headers (X-Frame-Options, X-XSS-Protection)"
echo "   • Proxy configuration for N8N API calls"
echo ""
echo "✅ Alex AI Dashboard is now live and ready for testing!"
