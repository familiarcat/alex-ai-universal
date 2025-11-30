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
