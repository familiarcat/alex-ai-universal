#!/bin/bash

##############################################################################
# Deploy Project Workflows to n8n
# 
# Automates deployment of 3 DDD workflows:
# - project-content-store (POST)
# - project-content-retrieve (GET)
# - project-content-delete (POST)
#
# Uses credentials from ~/.zshrc:
# - N8N_API_KEY
# - N8N_URL
#
# Crew: Captain Picard (Strategic) + Lt. Cmdr. La Forge (Implementation)
##############################################################################

set -e  # Exit on error

echo "🖖 Deploying Project Workflows to n8n"
echo "========================================"
echo ""

# Load credentials from ~/.zshrc
if [ -f "$HOME/.zshrc" ]; then
    echo "🔐 Loading credentials from ~/.zshrc..."
    # shellcheck disable=SC1090
    source "$HOME/.zshrc" >/dev/null 2>&1 || true
else
    echo "❌ ~/.zshrc not found!"
    exit 1
fi

# Verify required environment variables
if [ -z "$N8N_API_KEY" ]; then
    echo "❌ N8N_API_KEY not set in ~/.zshrc"
    echo "   Add: export N8N_API_KEY='your-api-key'"
    exit 1
fi

if [ -z "$N8N_URL" ]; then
    echo "⚠️  N8N_URL not set, using default: https://n8n.pbradygeorgen.com"
    N8N_URL="https://n8n.pbradygeorgen.com"
fi

echo "✅ Credentials loaded"
echo "   URL: $N8N_URL"
echo ""

# Check n8n connectivity
echo "🔌 Testing n8n API connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "$N8N_URL/api/v1/workflows" || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Cannot connect to n8n API (HTTP $HTTP_CODE)"
    echo "   Check your N8N_API_KEY and N8N_URL"
    exit 1
fi

echo "✅ n8n API connection successful"
echo ""

# Function to import and activate a workflow
deploy_workflow() {
    local WORKFLOW_FILE=$1
    local WORKFLOW_NAME=$2
    
    echo "📤 Deploying: $WORKFLOW_NAME"
    
    # Read workflow JSON
    if [ ! -f "$WORKFLOW_FILE" ]; then
        echo "   ❌ File not found: $WORKFLOW_FILE"
        return 1
    fi
    
    # Import workflow
    RESPONSE=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -d @"$WORKFLOW_FILE")
    
    # Extract workflow ID
    WORKFLOW_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$WORKFLOW_ID" ]; then
        echo "   ❌ Failed to import workflow"
        echo "   Response: $RESPONSE"
        return 1
    fi
    
    echo "   ✅ Imported (ID: $WORKFLOW_ID)"
    
    # Activate workflow
    curl -s -X PATCH "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"active": true}' > /dev/null
    
    echo "   ✅ Activated"
    echo ""
    
    return 0
}

# Deploy workflows
WORKFLOW_DIR="n8n-workflows/project-workflows"
FAILURES=0

deploy_workflow "$WORKFLOW_DIR/project-content-store.json" "Project Content Store" || ((FAILURES++))
deploy_workflow "$WORKFLOW_DIR/project-content-retrieve.json" "Project Content Retrieve" || ((FAILURES++))
deploy_workflow "$WORKFLOW_DIR/project-content-delete.json" "Project Content Delete" || ((FAILURES++))

echo "========================================"
echo "📊 Deployment Summary"
echo ""

if [ $FAILURES -eq 0 ]; then
    echo "🎉 All 3 workflows deployed successfully!"
    echo ""
    echo "Webhooks now available:"
    echo "  POST   $N8N_URL/webhook/project-content-store"
    echo "  GET    $N8N_URL/webhook/project-content-retrieve?projectId={id}"
    echo "  POST   $N8N_URL/webhook/project-content-delete"
    echo ""
    echo "Next steps:"
    echo "  1. Run Supabase migration:"
    echo "     psql -f supabase/migrations/001_create_projects_table.sql"
    echo ""
    echo "  2. Seed default projects:"
    echo "     cd dashboard && npm run seed:projects"
    echo ""
    echo "  3. Verify dashboard loads from Supabase:"
    echo "     http://localhost:3000/dashboard"
    echo ""
    echo "🖖 DDD architecture complete!"
else
    echo "❌ $FAILURES workflow(s) failed to deploy"
    echo ""
    echo "Check the errors above and retry."
    exit 1
fi

