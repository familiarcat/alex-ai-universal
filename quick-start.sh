#!/bin/bash
# Alex AI Quick Start Script

echo "🚀 Starting Alex AI Local Development Environment..."

# Check if local registry exists
if [ ! -d "local-registry" ]; then
    echo "❌ Local registry not found. Please run setup first."
    exit 1
fi

# Start web platform
echo "🌐 Starting Web Platform..."
cd testing-environment/web-platform
npm start &
WEB_PID=$!

# Wait for web platform to start
sleep 3

echo "✅ Alex AI Local Environment Started!"
echo "🌐 Web Platform: http://localhost:3000"
echo "📁 VS Code Workspace: ./testing-environment/vscode-workspace/alex-ai-testing.code-workspace"
echo "📁 Cursor Workspace: ./testing-environment/cursor-workspace/"
echo "📁 Test Projects: ./testing-environment/test-projects/"

echo ""
echo "🎯 Ready for development! You can now:"
echo "  • Open VS Code workspace for development"
echo "  • Use Cursor AI with the extension"
echo "  • Test with the web platform"
echo "  • Run test projects"

# Keep script running
wait $WEB_PID
