#!/bin/bash

# Alex AI Dashboard with N8N/Supabase Integration
# This script loads credentials from ~/.zshrc and starts the dashboard

echo "🚀 Starting Alex AI Dashboard with Real-time Integration..."
echo "=================================================="

# Load environment variables from ~/.zshrc
echo "🔐 Loading credentials from ~/.zshrc..."
if [ -f ~/.zshrc ]; then
    # Extract N8N and Supabase credentials from ~/.zshrc
    source ~/.zshrc
    
    # Set environment variables for the dashboard
    export N8N_API_URL="$N8N_API_URL"
    export N8N_API_KEY="$N8N_API_KEY"
    export SUPABASE_URL="$SUPABASE_URL"
    export SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
    
    echo "✅ Credentials loaded successfully"
    echo "   N8N API URL: $N8N_API_URL"
    echo "   N8N API Key: ${N8N_API_KEY:0:10}..."
    echo "   Supabase URL: $SUPABASE_URL"
    echo "   Supabase Key: ${SUPABASE_ANON_KEY:0:10}..."
else
    echo "⚠️  ~/.zshrc not found, using default values"
fi

echo ""
echo "📦 Installing dependencies..."
cd "$(dirname "$0")"
npm install

echo ""
echo "🏗️  Building dashboard..."
npm run build

echo ""
echo "🚀 Starting dashboard on localhost:3000..."
echo "   Dashboard: http://localhost:3000"
echo "   API Status: http://localhost:3000/api/alex-ai/status"
echo ""
echo "🔄 Dashboard will auto-refresh every 30 seconds with live data from:"
echo "   • N8N workflows and crew data"
echo "   • Supabase memory records"
echo "   • Real-time system metrics"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dashboard
npm start
