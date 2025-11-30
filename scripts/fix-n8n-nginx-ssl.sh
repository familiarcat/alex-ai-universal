#!/bin/bash
# Fix N8N nginx SSL certificate issue

INSTANCE_ID="i-0afdf313f61f22df0"
INSTANCE_IP="3.21.117.131"
DOMAIN="n8n.pbradygeorgen.com"

echo "🔧 Fixing N8N nginx SSL configuration..."

# Check SSL certificate status
echo ""
echo "📋 Checking SSL certificate status..."
ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << 'EOF'
echo "Checking SSL certificate directory..."
ls -la /etc/letsencrypt/live/$DOMAIN/ 2>&1 || echo "Certificate directory not found"

echo ""
echo "Checking certbot certificates..."
certbot certificates 2>&1 | grep -A 10 "$DOMAIN" || echo "No certificate found for $DOMAIN"

echo ""
echo "Checking nginx SSL config..."
grep -A 5 "ssl_certificate" /etc/nginx/sites-available/n8n 2>&1 || echo "nginx config not found"
EOF

# Fix SSL certificate
echo ""
echo "🔐 Obtaining/fixing SSL certificate..."
ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP << EOF
# Stop nginx temporarily for certbot
sudo systemctl stop nginx

# Try to obtain certificate
sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@pbradygeorgen.com 2>&1 || {
    echo "Certificate obtain failed, checking existing certificates..."
    sudo certbot certificates
}

# Fix permissions
sudo chmod 755 /etc/letsencrypt/live/
sudo chmod 755 /etc/letsencrypt/archive/
sudo chown -R root:root /etc/letsencrypt/live/
sudo chown -R root:root /etc/letsencrypt/archive/

# Test nginx config
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl status nginx | head -5
EOF

echo ""
echo "✅ SSL fix complete. Testing connectivity..."
sleep 5

# Test HTTPS
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://$DOMAIN/healthz 2>&1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTPS is working! (HTTP $HTTP_CODE)"
else
    echo "⚠️  HTTPS returned HTTP $HTTP_CODE"
    echo "   You may need to wait a few minutes for DNS/propagation"
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Visit https://$DOMAIN in your browser"
echo "   2. Clear browser cache if still seeing errors"
echo "   3. Check browser console for SSL errors"

