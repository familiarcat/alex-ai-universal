#!/bin/bash
# Alex AI Testing Environment Start Script

echo "🚀 Starting Alex AI Testing Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Alex AI Testing Environment Configuration
N8N_API_KEY=your_n8n_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
GITHUB_TOKEN=your_github_token_here
EOF
    echo "📝 Please update .env file with your credentials"
fi

# Load environment variables
source .env

# Start web platform
echo "🌐 Starting Web Platform..."
cd web-platform
npm start &
WEB_PID=$!

# Wait for web platform to start
sleep 5

echo "✅ Alex AI Testing Environment Started!"
echo "🌐 Web Platform: http://localhost:3000"
echo "📁 VS Code Workspace: ./vscode-workspace/alex-ai-testing.code-workspace"
echo "📁 Cursor Workspace: ./cursor-workspace/"
echo "📁 Test Projects: ./test-projects/"

# Keep script running
wait $WEB_PID
