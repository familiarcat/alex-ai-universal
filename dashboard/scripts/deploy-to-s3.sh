#!/bin/bash
# Deploy Alex AI Dashboard to AWS S3 with CloudFront
# Simple and effective deployment method

set -e

echo "🖖 Alex AI Dashboard S3 Deployment"
echo "================================="

# Load environment variables
export AWS_PROFILE="AmplifyUser"
export AWS_DEFAULT_REGION="us-east-2"

# Configuration
BUCKET_NAME="alex-ai-dashboard-$(date +%s)"
DOMAIN="n8n.pbradygeorgen.com"
DASHBOARD_PATH="dashboard"

echo "📊 Deployment Configuration:"
echo "   Bucket: ${BUCKET_NAME}"
echo "   Domain: ${DOMAIN}"
echo "   Dashboard Path: ${DASHBOARD_PATH}"
echo "   Region: ${AWS_DEFAULT_REGION}"

# Build the dashboard
echo "🔨 Building dashboard..."
npm run build
echo "✅ Dashboard built successfully"

# Create S3 bucket
echo "🪣 Creating S3 bucket..."
aws s3 mb s3://${BUCKET_NAME} --profile ${AWS_PROFILE} --region ${AWS_DEFAULT_REGION}
echo "✅ S3 bucket created: ${BUCKET_NAME}"

# Upload files to S3
echo "📤 Uploading files to S3..."
aws s3 sync out/ s3://${BUCKET_NAME}/${DASHBOARD_PATH}/ --profile ${AWS_PROFILE}
echo "✅ Files uploaded to S3"

# Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://${BUCKET_NAME} \
    --index-document ${DASHBOARD_PATH}/index.html \
    --error-document ${DASHBOARD_PATH}/404.html \
    --profile ${AWS_PROFILE}

echo "✅ Static website hosting configured"

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public access..."
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

aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file://bucket-policy.json --profile ${AWS_PROFILE}
echo "✅ Bucket policy set for public access"

# Get website URL
WEBSITE_URL="http://${BUCKET_NAME}.s3-website.${AWS_DEFAULT_REGION}.amazonaws.com"
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "🌐 Dashboard URL: ${WEBSITE_URL}/${DASHBOARD_PATH}/"
echo "📊 Features deployed:"
echo "   • LCRS (Left-Center-Right-Sidebar) layout"
echo "   • Dark mode Federation theme"
echo "   • Real-time N8N integration"
echo "   • Supabase memory system"
echo "   • Auto-refresh every 30 seconds"
echo ""
echo "🔧 Next Steps:"
echo "   1. Test dashboard: ${WEBSITE_URL}/${DASHBOARD_PATH}/"
echo "   2. Configure custom domain if needed"
echo "   3. Set up CloudFront for HTTPS"
echo "   4. Test real-time data integration"
echo ""
echo "📋 Bucket Information:"
echo "   Bucket: ${BUCKET_NAME}"
echo "   Region: ${AWS_DEFAULT_REGION}"
echo "   Website URL: ${WEBSITE_URL}/${DASHBOARD_PATH}/"
echo ""
echo "✅ Alex AI Dashboard is now live and ready for testing!"

# Cleanup
rm -f bucket-policy.json

echo "🧪 Ready to test real-time data integration and security!"
