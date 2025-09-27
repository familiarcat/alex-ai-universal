#!/bin/bash
# Alex AI Dashboard Deployment Script
# Deploys the real-time dashboard to n8n.pbradygeorgen.com/dashboard

set -e

echo "🖖 Alex AI Dashboard Deployment"
echo "==============================="

# Check if we're in the right directory
if [ ! -d "dashboard" ]; then
    echo "❌ Dashboard directory not found"
    exit 1
fi

cd dashboard

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the dashboard
echo "🔨 Building dashboard..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf alex-ai-dashboard.tar.gz .next package.json next.config.js

# Deploy to n8n.pbradygeorgen.com/dashboard
echo "🚀 Deploying to n8n.pbradygeorgen.com/dashboard..."

# Note: This would typically deploy to your server
# For now, we'll just show what would happen
echo "✅ Dashboard built successfully!"
echo "📊 Dashboard features:"
echo "   - Real-time system monitoring"
echo "   - Crew performance tracking"
echo "   - System health metrics"
echo "   - Integration status"
echo "   - Auto-refresh every 30 seconds"

echo ""
echo "🌐 Dashboard would be available at:"
echo "   https://n8n.pbradygeorgen.com/dashboard"

echo ""
echo "💡 To deploy manually:"
echo "   1. Upload alex-ai-dashboard.tar.gz to your server"
echo "   2. Extract in the /dashboard directory"
echo "   3. Run 'npm start' to start the dashboard"
echo "   4. Configure nginx to proxy /dashboard to the Next.js app"

cd ..
echo "✅ Deployment script complete!"

