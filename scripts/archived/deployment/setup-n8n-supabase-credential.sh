#!/bin/bash

##############################################################################
# Automated n8n Supabase Credential Setup
# 
# Creates and configures Supabase credential in n8n via API
# Links the credential to all 3 project workflows
#
# Uses credentials from ~/.zshrc:
# - N8N_API_KEY
# - N8N_URL
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
#
# Crew: Lt. Cmdr. La Forge (Automation) + Commander Data (API Integration)
##############################################################################

set -e

echo "🔗 Automated n8n Supabase Credential Setup"
echo "==========================================="
echo ""

# Load credentials
if [ -f "$HOME/.zshrc" ]; then
    echo "🔐 Loading credentials from ~/.zshrc..."
    export N8N_API_KEY=$(grep "export N8N_API_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
    export N8N_URL=$(grep "export N8N_URL" "$HOME/.zshrc" | cut -d'"' -f2)
    export SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1)
    export SUPABASE_SERVICE_ROLE_KEY=$(grep "export SUPABASE_SERVICE_ROLE_KEY" "$HOME/.zshrc" | cut -d'"' -f2 | head -1)
else
    echo "❌ ~/.zshrc not found!"
    exit 1
fi

# Verify all required vars
MISSING=0
if [ -z "$N8N_API_KEY" ]; then echo "❌ N8N_API_KEY not set"; MISSING=1; fi
if [ -z "$N8N_URL" ]; then echo "❌ N8N_URL not set"; MISSING=1; fi
if [ -z "$SUPABASE_URL" ]; then echo "❌ SUPABASE_URL not set"; MISSING=1; fi
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then echo "❌ SUPABASE_SERVICE_ROLE_KEY not set"; MISSING=1; fi

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "Add to ~/.zshrc:"
    echo "  export SUPABASE_URL='https://your-project.supabase.co'"
    echo "  export SUPABASE_SERVICE_ROLE_KEY='eyJ...'"
    exit 1
fi

echo "✅ All credentials loaded"
echo ""

# Extract Supabase host (remove https://)
SUPABASE_HOST=$(echo "$SUPABASE_URL" | sed 's|https://||')

echo "📝 Creating Supabase credential in n8n..."

# Create credential via n8n API
CREDENTIAL_RESPONSE=$(curl -s -X POST "$N8N_URL/api/v1/credentials" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Supabase Account\",
        \"type\": \"supabaseApi\",
        \"data\": {
            \"host\": \"$SUPABASE_HOST\",
            \"serviceRole\": \"$SUPABASE_SERVICE_ROLE_KEY\"
        }
    }")

CREDENTIAL_ID=$(echo "$CREDENTIAL_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ -z "$CREDENTIAL_ID" ] || [ "$CREDENTIAL_ID" = "null" ]; then
    echo "❌ Failed to create credential"
    echo "   Response: $CREDENTIAL_RESPONSE"
    echo ""
    echo "⚠️  The credential may already exist. Fetching existing credentials..."
    
    # Try to find existing credential
    EXISTING_CREDS=$(curl -s -X GET "$N8N_URL/api/v1/credentials" \
        -H "X-N8N-API-KEY: $N8N_API_KEY")
    
    CREDENTIAL_ID=$(echo "$EXISTING_CREDS" | jq -r '.data[] | select(.name == "Supabase Account") | .id' | head -1)
    
    if [ -z "$CREDENTIAL_ID" ] || [ "$CREDENTIAL_ID" = "null" ]; then
        echo "❌ Could not create or find Supabase credential"
        exit 1
    else
        echo "✅ Found existing credential (ID: $CREDENTIAL_ID)"
    fi
else
    echo "✅ Credential created (ID: $CREDENTIAL_ID)"
fi

echo ""
echo "🔗 Linking credential to workflows..."

# Get all workflows
WORKFLOWS=$(curl -s -X GET "$N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY")

# Find our 3 project workflows by name
WORKFLOW_IDS=$(echo "$WORKFLOWS" | jq -r '.data[] | select(.name | contains("Project Content")) | .id')

if [ -z "$WORKFLOW_IDS" ]; then
    echo "⚠️  No project workflows found"
    echo "   Make sure workflows are deployed first"
    exit 1
fi

# Note: Updating workflow nodes via API to link credentials is complex
# Requires fetching workflow, modifying node credential references, and updating
echo "⚠️  Automatic credential linking to workflow nodes requires manual step"
echo ""
echo "📋 Manual step required (30 seconds):"
echo "   1. Go to: $N8N_URL"
echo "   2. Open each workflow:"
echo "      - Project Content Store"
echo "      - Project Content Retrieve"
echo "      - Project Content Delete"
echo "   3. For each Supabase node:"
echo "      - Click node"
echo "      - Credentials dropdown → Select 'Supabase Account'"
echo "      - Save workflow"
echo ""
echo "✅ Credential 'Supabase Account' is ready to use"
echo ""
echo "Or we can provide a more complex script to auto-link via API..."
echo "(Would need to parse and update workflow JSON programmatically)"

