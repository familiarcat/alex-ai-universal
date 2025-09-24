#!/bin/bash

# Configure nginx to proxy /dashboard to Amplify subdomain
# This script sets up nginx to route n8n.pbradygeorgen.com/dashboard to dashboard.n8n.pbradygeorgen.com

echo "🌐 CONFIGURING NGINX AMPLIFY PROXY"
echo "=================================="
echo ""
echo "📊 Target Configuration:"
echo "   • Source: n8n.pbradygeorgen.com/dashboard"
echo "   • Destination: dashboard.n8n.pbradygeorgen.com"
echo "   • SSL: Automatic (Amplify managed)"
echo ""

# Create nginx configuration for Amplify proxy
cat > nginx-amplify-dashboard.conf << 'EOF'
# Amplify Dashboard Proxy Configuration
# Routes /dashboard to dashboard.n8n.pbradygeorgen.com

server {
    listen 80;
    listen 443 ssl http2;
    server_name n8n.pbradygeorgen.com;

    # SSL configuration (if using existing certificate)
    # ssl_certificate /path/to/your/certificate.crt;
    # ssl_certificate_key /path/to/your/private.key;

    # Proxy /dashboard to Amplify subdomain
    location /dashboard {
        # Remove /dashboard prefix and proxy to Amplify
        rewrite ^/dashboard(.*)$ $1 break;
        
        # Proxy to Amplify subdomain
        proxy_pass https://dashboard.n8n.pbradygeorgen.com;
        
        # Headers for proper proxying
        proxy_set_header Host dashboard.n8n.pbradygeorgen.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # CORS headers for API calls
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Proxy settings
        proxy_redirect off;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Default location (existing n8n app)
    location / {
        # Your existing n8n configuration here
        # This will handle all other requests to n8n.pbradygeorgen.com
        proxy_pass http://localhost:5678;  # Adjust to your n8n port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "✅ Nginx configuration created: nginx-amplify-dashboard.conf"
echo ""
echo "📋 Manual Setup Steps:"
echo "   1. Add DNS records to your domain:"
echo "      • _8307e04dc9f12ce9d5a95441c1d83e68.n8n.pbradygeorgen.com. CNAME _82cf47833b1f34c7571335dbf0414bde.xlfgrmvvlj.acm-validations.aws."
echo "      • dashboard.n8n.pbradygeorgen.com CNAME d3mq856om3quh6.cloudfront.net"
echo ""
echo "   2. Upload nginx configuration to server:"
echo "      scp nginx-amplify-dashboard.conf user@n8n.pbradygeorgen.com:/etc/nginx/sites-available/"
echo ""
echo "   3. Enable the site:"
echo "      sudo ln -s /etc/nginx/sites-available/nginx-amplify-dashboard.conf /etc/nginx/sites-enabled/"
echo "      sudo nginx -t"
echo "      sudo systemctl reload nginx"
echo ""
echo "   4. Test the configuration:"
echo "      curl -I https://n8n.pbradygeorgen.com/dashboard"
echo ""
echo "🎯 Final Result:"
echo "   • n8n.pbradygeorgen.com/dashboard → dashboard.n8n.pbradygeorgen.com"
echo "   • SSL certificate managed by AWS Amplify"
echo "   • Automatic HTTPS redirect"
echo "   • CORS headers for API calls"
echo ""
echo "🖖 Ready for deployment!"
