#!/bin/bash
set -e

echo "🔍 Checking n8n database for workflows..."
echo ""

# Check if database exists and has workflows
if [ -f /home/ubuntu/.n8n/database.sqlite ]; then
  echo "✅ Database file exists"
  COUNT=$(sqlite3 /home/ubuntu/.n8n/database.sqlite "SELECT COUNT(*) FROM workflow_entity;" 2>/dev/null || echo "0")
  echo "   Workflows in database: $COUNT"
  
  if [ "$COUNT" -gt 0 ]; then
    echo ""
    echo "📋 Sample workflow names:"
    sqlite3 /home/ubuntu/.n8n/database.sqlite "SELECT name FROM workflow_entity LIMIT 5;" 2>/dev/null || echo "Could not query"
  fi
else
  echo "❌ Database file not found"
fi

echo ""
echo "💡 If workflows are in database but not showing in UI, n8n may need restart"
echo "💡 If workflows are gone, restore from git using restore-all-n8n-workflows.js"

