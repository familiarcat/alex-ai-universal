#!/bin/bash

# Setup n8n Workflows for Project Content DDD Flow
# Imports the 3 workflows into n8n

set -e

echo "🔄 Setting up n8n workflows for project content..."
echo ""

# Load n8n credentials from ~/.zshrc
source "$HOME/.zshrc" 2>/dev/null || true

if [ -z "$N8N_URL" ] || [ -z "$N8N_API_KEY" ]; then
  echo "❌ Error: N8N_URL and N8N_API_KEY must be set in ~/.zshrc"
  echo ""
  echo "Add these to your ~/.zshrc:"
  echo "  export N8N_URL='https://n8n.pbradygeorgen.com'"
  echo "  export N8N_API_KEY='your-api-key'"
  exit 1
fi

echo "📍 n8n Instance: $N8N_URL"
echo ""

# Function to import workflow
import_workflow() {
  local workflow_file=$1
  local workflow_name=$(basename "$workflow_file" .json)
  
  echo "📤 Importing: $workflow_name"
  
  # Import workflow via n8n API
  response=$(curl -s -X POST "${N8N_URL}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Content-Type: application/json" \
    -d @"$workflow_file")
  
  workflow_id=$(echo "$response" | jq -r '.id // empty')
  
  if [ -n "$workflow_id" ]; then
    echo "   ✅ Imported (ID: $workflow_id)"
    
    # Activate the workflow
    curl -s -X PATCH "${N8N_URL}/api/v1/workflows/${workflow_id}" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"active": true}' > /dev/null
    
    echo "   ✅ Activated"
  else
    echo "   ⚠️  Import failed or workflow already exists"
  fi
  echo ""
}

# Import all 3 workflows
import_workflow "n8n-workflows/project-content-store.json"
import_workflow "n8n-workflows/project-content-retrieve.json"
import_workflow "n8n-workflows/project-content-delete.json"

echo ""
echo "✅ n8n workflows setup complete!"
echo ""
echo "🔗 Webhook URLs:"
echo "  Store:    ${N8N_URL}/webhook/project-content-store"
echo "  Retrieve: ${N8N_URL}/webhook/project-content-retrieve"
echo "  Delete:   ${N8N_URL}/webhook/project-content-delete"
echo ""
echo "🔍 Verify in n8n dashboard:"
echo "  $N8N_URL"
echo ""
echo "⚠️  NOTE: You may need to manually configure Supabase credentials in n8n:"
echo "  1. Go to: $N8N_URL/workflows"
echo "  2. Open each workflow"
echo "  3. Configure PostgreSQL credentials for Supabase"
echo "  4. Save and activate"

