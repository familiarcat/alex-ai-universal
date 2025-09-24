#!/bin/bash
# Alex AI Dashboard N8N Server Deployment Script
# Deploys to n8n.pbradygeorgen.com/dashboard

set -e

echo "🖖 Alex AI Dashboard N8N Deployment"
echo "==================================="

# Load environment variables (skip zsh-specific commands)
export N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"
export N8N_API_KEY="$(grep 'export N8N_API_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"')"
export SUPABASE_URL="$(grep 'export SUPABASE_URL=' ~/.zshrc | cut -d'=' -f2 | tr -d '"')"
export SUPABASE_ANON_KEY="$(grep 'export SUPABASE_ANON_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"')"

# Configuration
N8N_SERVER="n8n.pbradygeorgen.com"
DASHBOARD_PATH="/dashboard"
BUILD_DIR=".next"
OUTPUT_DIR="out"

echo "📊 Deployment Configuration:"
echo "   Target: ${N8N_SERVER}${DASHBOARD_PATH}"
echo "   Build Directory: ${BUILD_DIR}"
echo "   Output Directory: ${OUTPUT_DIR}"

# Build the dashboard for static export
echo "🔨 Building dashboard for production..."
npm run build
echo "✅ Dashboard built successfully"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf alex-ai-dashboard-n8n.tar.gz out/
echo "✅ Deployment package created"

# Deploy to N8N server
echo "🚀 Deploying to N8N server..."
echo "   Server: ${N8N_SERVER}"
echo "   Path: ${DASHBOARD_PATH}"

# Upload to N8N server (you'll need to configure this based on your server setup)
echo "📤 Uploading files to server..."
# This would typically use scp, rsync, or your preferred deployment method
# For now, we'll create the files ready for manual upload

echo "✅ Files ready for deployment"
echo "📁 Deployment package: alex-ai-dashboard-n8n.tar.gz"
echo "🌐 Extract to: ${N8N_SERVER}${DASHBOARD_PATH}"

echo "🎉 Alex AI Dashboard deployment preparation complete!"
echo "📊 Dashboard will be available at: https://${N8N_SERVER}${DASHBOARD_PATH}"
