#!/bin/bash
# Cursor AI Startup Script for Alex AI
# 
# This script runs automatically when Cursor AI opens the workspace
# It loads crew memories and generates the startup prompt

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🖖 Alex AI Cursor Startup"
echo "========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "⚠️  Not in project root. Skipping Alex AI startup."
  exit 0
fi

# Load crew memories
echo "📚 Loading crew memories..."
if npm run cursor:memories > /dev/null 2>&1; then
  echo "✅ Crew memories loaded"
else
  echo "⚠️  Failed to load memories (this is okay if Supabase is not configured)"
fi

# Generate prompt
echo "📝 Generating Cursor AI prompt..."
if npm run cursor:prompt > /dev/null 2>&1; then
  echo "✅ Startup prompt generated"
  echo ""
  echo "📄 Prompt saved to: .cursor/alex-ai/cursor-startup-prompt.md"
  echo "💡 Copy this into Cursor AI chat to activate Alex AI"
else
  echo "⚠️  Failed to generate prompt"
fi

echo ""
echo "✅ Alex AI startup complete"
echo ""

