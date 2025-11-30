#!/bin/bash
# Direct AWS CLI Deployment - Bypass Amplify CLI configuration issues
# Uses existing AWS resources and deploys directly

set -e

echo "🖖 Alex AI Dashboard - Direct AWS CLI Deployment"
echo "=============================================="

# Load environment variables
export AWS_PROFILE="AmplifyUser"
export AWS_DEFAULT_REGION="us-east-2"

# Configuration
APP_ID="dwmfx8efrhb9y"
BUCKET_NAME="alex-ai-dashboard-direct-$(date +%s)"
DOMAIN="n8n.pbradygeorgen.com"
SUBDOMAIN="dashboard"

echo "📊 Deployment Configuration:"
echo "   App ID: ${APP_ID}"
echo "   Bucket: ${BUCKET_NAME}"
echo "   Domain: ${DOMAIN}/${SUBDOMAIN}"
echo "   Region: ${AWS_DEFAULT_REGION}"

# Check AWS credentials
echo ""
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

# Create S3 bucket for direct hosting
echo ""
echo "🚀 Phase 1: Create S3 Bucket for Direct Hosting"
echo "=============================================="

echo "🪣 Creating S3 bucket..."
aws s3 mb s3://${BUCKET_NAME} --profile ${AWS_PROFILE} --region ${AWS_DEFAULT_REGION}
echo "✅ S3 bucket created: ${BUCKET_NAME}"

# Upload files to S3
echo ""
echo "🚀 Phase 2: Upload Files to S3"
echo "=============================="

echo "📤 Uploading dashboard files..."
aws s3 sync out/ s3://${BUCKET_NAME}/ --profile ${AWS_PROFILE}
echo "✅ Files uploaded to S3"

# Configure bucket for static website hosting
echo ""
echo "🚀 Phase 3: Configure Static Website Hosting"
echo "==========================================="

echo "🌐 Configuring static website hosting..."
aws s3 website s3://${BUCKET_NAME} \
    --index-document index.html \
    --error-document 404.html \
    --profile ${AWS_PROFILE}
echo "✅ Static website hosting configured"

# Create bucket policy for public read access
echo ""
echo "🚀 Phase 4: Configure Public Access"
echo "=================================="

echo "🔓 Creating bucket policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

# Remove public access block first
echo "🔧 Removing public access block..."
aws s3api delete-public-access-block --bucket ${BUCKET_NAME} --profile ${AWS_PROFILE} || echo "⚠️  Public access block may not exist"

# Apply bucket policy
aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file://bucket-policy.json --profile ${AWS_PROFILE}
echo "✅ Bucket policy applied"

# Create CloudFront distribution for HTTPS
echo ""
echo "🚀 Phase 5: Create CloudFront Distribution"
echo "========================================"

echo "☁️  Creating CloudFront distribution..."
cat > cloudfront-config.json << EOF
{
    "CallerReference": "alex-ai-dashboard-$(date +%s)",
    "Comment": "Alex AI Dashboard Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-${BUCKET_NAME}",
                "DomainName": "${BUCKET_NAME}.s3-website.${AWS_DEFAULT_REGION}.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${BUCKET_NAME}",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        }
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json \
    --profile ${AWS_PROFILE} \
    --query 'Distribution.Id' \
    --output text)

echo "✅ CloudFront distribution created: ${DISTRIBUTION_ID}"

# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id ${DISTRIBUTION_ID} \
    --profile ${AWS_PROFILE} \
    --query 'Distribution.DomainName' \
    --output text)

echo "✅ CloudFront domain: ${CLOUDFRONT_DOMAIN}"

# Create custom domain configuration for nginx
echo ""
echo "🚀 Phase 6: Nginx Configuration"
echo "=============================="

echo "📋 Nginx configuration for ${DOMAIN}:"
cat << NGINX_CONFIG
server {
    listen 80;
    listen 443 ssl http2;
    server_name ${DOMAIN};
    
    # SSL configuration (add your SSL certificates)
    # ssl_certificate /path/to/certificate.crt;
    # ssl_certificate_key /path/to/private.key;
    
    # Dashboard location
    location /${SUBDOMAIN}/ {
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
}
NGINX_CONFIG

# Test the deployment
echo ""
echo "🚀 Phase 7: Testing Deployment"
echo "============================="

echo "🧪 Testing S3 website..."
S3_URL="http://${BUCKET_NAME}.s3-website.${AWS_DEFAULT_REGION}.amazonaws.com"
if curl -s -I "${S3_URL}" | grep -q "200"; then
    echo "✅ S3 website accessible: ${S3_URL}"
else
    echo "⚠️  S3 website may not be ready yet"
fi

echo "🧪 Testing CloudFront distribution..."
CF_URL="https://${CLOUDFRONT_DOMAIN}"
if curl -s -I "${CF_URL}" | grep -q "200"; then
    echo "✅ CloudFront accessible: ${CF_URL}"
else
    echo "⚠️  CloudFront may need time to propagate"
fi

# Summary
echo ""
echo "🎉 Direct AWS CLI Deployment Complete!"
echo "===================================="
echo ""
echo "📦 Resources Created:"
echo "   • S3 Bucket: ${BUCKET_NAME}"
echo "   • CloudFront Distribution: ${DISTRIBUTION_ID}"
echo "   • S3 Website: ${S3_URL}"
echo "   • CloudFront URL: ${CF_URL}"
echo "   • Target URL: https://${DOMAIN}/${SUBDOMAIN}/"
echo ""
echo "📊 Features Deployed:"
echo "   • LCRS (Left-Center-Right-Sidebar) layout"
echo "   • Dark mode Federation theme"
echo "   • Real-time N8N integration"
echo "   • Supabase memory system"
echo "   • HTTPS via CloudFront"
echo "   • Global CDN distribution"
echo ""
echo "🔧 Next Steps:"
echo "   1. Configure nginx on your N8N server with the provided config"
echo "   2. Update DNS records to point to your server"
echo "   3. Test the dashboard at https://${DOMAIN}/${SUBDOMAIN}/"
echo "   4. Wait for CloudFront propagation (15-20 minutes)"
echo ""
echo "🧪 Ready to test knowledge gathering and security!"
echo "   Run: ./scripts/test-deployment.sh"
echo ""
echo "✅ Alex AI Dashboard direct AWS CLI deployment complete!"

# Cleanup
rm -f bucket-policy.json cloudfront-config.json
