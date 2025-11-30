#!/bin/bash
# Quick nginx deployment script for n8n.pbradygeorgen.com/dashboard

echo "🚀 Quick Nginx Deployment for Alex AI Dashboard"
echo "============================================="

# Configuration
SERVER_HOST="n8n.pbradygeorgen.com"
NGINX_CONFIG="nginx-proxy-config.conf"

echo "📊 Deployment Target: ${SERVER_HOST}/dashboard/"
echo "📋 Configuration file: ${NGINX_CONFIG}"

# Check if configuration file exists
if [ ! -f "${NGINX_CONFIG}" ]; then
    echo "❌ Configuration file not found: ${NGINX_CONFIG}"
    exit 1
fi

echo "✅ Configuration file found"

echo ""
echo "📋 Manual Deployment Steps:"
echo "=========================="
echo ""
echo "1. 📤 Upload configuration to server:"
echo "   scp ${NGINX_CONFIG} user@${SERVER_HOST}:/tmp/"
echo ""
echo "2. 🔧 Apply configuration on server:"
echo "   ssh user@${SERVER_HOST}"
echo "   sudo mv /tmp/${NGINX_CONFIG} /etc/nginx/sites-available/alex-ai-dashboard"
echo "   sudo ln -sf /etc/nginx/sites-available/alex-ai-dashboard /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "3. 🧪 Test deployment:"
echo "   curl -I https://${SERVER_HOST}/dashboard/"
echo "   curl https://${SERVER_HOST}/health"
echo ""
echo "🎯 Alternative - Use your existing deployment method:"
echo "   • Upload via web interface"
echo "   • Use your existing CI/CD pipeline"
echo "   • Copy configuration manually"
echo ""
echo "✅ After deployment, dashboard will be live at:"
echo "   https://${SERVER_HOST}/dashboard/"
echo ""
echo "🧪 Current working URLs:"
echo "   • CloudFront: https://d3pjopnssd0uqw.cloudfront.net"
echo "   • S3 Direct: http://alex-ai-dashboard-direct-1758689482.s3-website.us-east-2.amazonaws.com"
echo ""
echo "🚀 Ready for real-time N8N integration testing!"
