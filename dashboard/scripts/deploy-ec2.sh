#!/bin/bash
# Alex AI Dashboard - EC2 Production Deployment
# Deploys to your EC2 instance with proper port management

set -e

echo "🖖 Alex AI Dashboard - EC2 Production Deployment"
echo "================================================"

# Configuration
DASHBOARD_PORT=3001
DASHBOARD_NAME="alex-ai-dashboard"
EC2_USER="ubuntu"
EC2_HOST="n8n.pbradygeorgen.com"

echo "📊 EC2 Deployment Configuration:"
echo "   Dashboard Name: ${DASHBOARD_NAME}"
echo "   Dashboard Port: ${DASHBOARD_PORT}"
echo "   EC2 Host: ${EC2_HOST}"
echo "   EC2 User: ${EC2_USER}"

# Build the dashboard
echo "🔨 Building dashboard..."
npm run build
echo "✅ Dashboard built successfully"

# Create production deployment package
echo "📦 Creating production deployment package..."
mkdir -p ec2-deploy
cp -r .next ec2-deploy/
cp package.json ec2-deploy/
cp next.config.js ec2-deploy/
cp -r public ec2-deploy/ 2>/dev/null || mkdir -p ec2-deploy/public

# Create production server.js
cat > ec2-deploy/server.js << EOF
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = false
const hostname = '0.0.0.0'
const port = process.env.PORT || ${DASHBOARD_PORT}

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(\`🖖 Alex AI Dashboard running on port \${port}\`)
      console.log(\`📊 Dashboard: http://\${hostname}:\${port}\`)
    })
})
EOF

# Create production package.json
cat > ec2-deploy/package.json << EOF
{
  "name": "${DASHBOARD_NAME}",
  "version": "1.0.0",
  "description": "Alex AI Universal Dashboard",
  "scripts": {
    "start": "node server.js",
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.6.0"
  }
}
EOF

# Create PM2 ecosystem file for process management
cat > ec2-deploy/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${DASHBOARD_NAME}',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${DASHBOARD_PORT}
    }
  }]
}
EOF

# Create deployment script for EC2
cat > ec2-deploy/deploy-to-ec2.sh << 'EOF'
#!/bin/bash
# Deploy Alex AI Dashboard to EC2

echo "🚀 Deploying Alex AI Dashboard to EC2..."

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Stop existing dashboard if running
pm2 stop alex-ai-dashboard 2>/dev/null || echo "No existing dashboard to stop"

# Start the dashboard
echo "🚀 Starting Alex AI Dashboard..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup

echo "✅ Alex AI Dashboard deployed successfully!"
echo "📊 Dashboard running on port 3001"
echo "🔗 Access: http://n8n.pbradygeorgen.com:3001"
echo "📋 PM2 Status: pm2 status"
echo "📋 PM2 Logs: pm2 logs alex-ai-dashboard"
EOF

chmod +x ec2-deploy/deploy-to-ec2.sh

echo "✅ Production deployment package created"

# Create deployment archive
echo "📦 Creating deployment archive..."
tar -czf alex-ai-dashboard-ec2.tar.gz -C ec2-deploy .
echo "✅ Deployment archive created"

# Instructions for EC2 deployment
echo ""
echo "🎉 EC2 Deployment Package Ready!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Upload the deployment package to your EC2 instance:"
echo "   scp alex-ai-dashboard-ec2.tar.gz ${EC2_USER}@${EC2_HOST}:~/"
echo ""
echo "2. SSH into your EC2 instance:"
echo "   ssh ${EC2_USER}@${EC2_HOST}"
echo ""
echo "3. Extract and deploy:"
echo "   tar -xzf alex-ai-dashboard-ec2.tar.gz"
echo "   ./deploy-to-ec2.sh"
echo ""
echo "4. Access the dashboard:"
echo "   http://${EC2_HOST}:${DASHBOARD_PORT}"
echo ""
echo "⏰ Federation Time: 2-5 minutes after deployment"
echo "🔄 The dashboard will run alongside your existing n8n application"

# Cleanup
rm -rf ec2-deploy

echo "✅ EC2 deployment package ready for upload"
