#!/bin/bash
# Alex AI Dashboard Direct N8N Server Deployment
# Uploads files directly to n8n.pbradygeorgen.com/dashboard

set -e

echo "🖖 Alex AI Dashboard - Direct N8N Server Deployment"
echo "=================================================="

# Configuration
N8N_SERVER="n8n.pbradygeorgen.com"
DASHBOARD_PATH="/dashboard"
LOCAL_OUTPUT="out/"
DEPLOYMENT_PACKAGE="alex-ai-dashboard-n8n.tar.gz"

echo "📊 Deployment Configuration:"
echo "   Target Server: ${N8N_SERVER}"
echo "   Dashboard Path: ${DASHBOARD_PATH}"
echo "   Local Output: ${LOCAL_OUTPUT}"
echo "   Package: ${DEPLOYMENT_PACKAGE}"

# Check if deployment package exists
if [ ! -f "${DEPLOYMENT_PACKAGE}" ]; then
    echo "❌ Deployment package not found. Run deploy-n8n.sh first."
    exit 1
fi

echo "✅ Deployment package found: ${DEPLOYMENT_PACKAGE}"

# Extract package contents for inspection
echo "📦 Package contents:"
tar -tzf ${DEPLOYMENT_PACKAGE} | head -10
echo "   ... and $(tar -tzf ${DEPLOYMENT_PACKAGE} | wc -l) more files"

echo ""
echo "🚀 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. Upload the deployment package to your N8N server:"
echo "   scp ${DEPLOYMENT_PACKAGE} user@${N8N_SERVER}:/tmp/"
echo ""
echo "2. SSH into your N8N server:"
echo "   ssh user@${N8N_SERVER}"
echo ""
echo "3. Extract the dashboard files:"
echo "   sudo mkdir -p ${DASHBOARD_PATH}"
echo "   cd ${DASHBOARD_PATH}"
echo "   sudo tar -xzf /tmp/${DEPLOYMENT_PACKAGE}"
echo ""
echo "4. Configure web server (nginx/apache) to serve from ${DASHBOARD_PATH}"
echo ""
echo "5. Set proper permissions:"
echo "   sudo chown -R www-data:www-data ${DASHBOARD_PATH}"
echo "   sudo chmod -R 755 ${DASHBOARD_PATH}"
echo ""
echo "6. Restart web server:"
echo "   sudo systemctl restart nginx  # or apache2"
echo ""
echo "📊 Dashboard will be available at: https://${N8N_SERVER}${DASHBOARD_PATH}"
echo ""
echo "🔧 Alternative: Use your CI/CD pipeline to deploy this package"
echo "   Package location: $(pwd)/${DEPLOYMENT_PACKAGE}"
echo ""

# Create a simple deployment script for the server
cat > deploy-on-server.sh << 'EOF'
#!/bin/bash
# Run this script on your N8N server

DASHBOARD_PATH="/dashboard"
PACKAGE="/tmp/alex-ai-dashboard-n8n.tar.gz"

echo "🖖 Deploying Alex AI Dashboard on N8N Server"
echo "============================================"

# Create dashboard directory
sudo mkdir -p ${DASHBOARD_PATH}
cd ${DASHBOARD_PATH}

# Extract dashboard files
echo "📦 Extracting dashboard files..."
sudo tar -xzf ${PACKAGE}

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data ${DASHBOARD_PATH}
sudo chmod -R 755 ${DASHBOARD_PATH}

# Create nginx configuration (if using nginx)
echo "🌐 Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/alex-ai-dashboard << 'NGINX_CONFIG'
server {
    listen 80;
    server_name n8n.pbradygeorgen.com;
    
    location /dashboard/ {
        alias /dashboard/;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Enable CORS for API calls
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }
}
NGINX_CONFIG

# Enable the site
sudo ln -sf /etc/nginx/sites-available/alex-ai-dashboard /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Alex AI Dashboard deployed successfully!"
echo "🌐 Dashboard available at: https://n8n.pbradygeorgen.com/dashboard/"
EOF

chmod +x deploy-on-server.sh

echo "✅ Created server deployment script: deploy-on-server.sh"
echo ""
echo "🎉 Ready for deployment!"
echo "📁 Upload: $(pwd)/${DEPLOYMENT_PACKAGE}"
echo "📁 Server script: $(pwd)/deploy-on-server.sh"
