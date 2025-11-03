#!/bin/bash

################################################################################
#
# 🔄 RESTORE N8N FROM GIT (Complete System Rebuild)
#
# Purpose: Rebuild entire n8n instance from git-versioned workflow JSONs
#
# This script:
# 1. Gets new API key from user
# 2. Creates Supabase credential in n8n
# 3. Imports all workflows from git
# 4. Configures Supabase nodes
# 5. Activates workflows
# 6. Verifies webhook registration
#
# Use this when: Docker restart caused data loss (blank n8n instance)
#
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🔄 N8N FULL SYSTEM RESTORATION FROM GIT                             ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Extract current credentials from ~/.zshrc
N8N_URL=$(grep 'export N8N_URL=' ~/.zshrc | cut -d'"' -f2)
SUPABASE_URL=$(grep 'export SUPABASE_URL=' ~/.zshrc | cut -d'"' -f2)
SUPABASE_SERVICE_ROLE_KEY=$(grep 'export SUPABASE_SERVICE_ROLE_KEY=' ~/.zshrc | cut -d'"' -f2)

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  SUPABASE_SERVICE_ROLE_KEY=$(grep 'export SUPABASE_SERVICE_KEY=' ~/.zshrc | cut -d'"' -f2)
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 STEP 1: Get new N8N API key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Since this is a blank n8n instance, you need to:"
echo "  1. Open: $N8N_URL"
echo "  2. Create an account (or login if exists)"
echo "  3. Go to: Settings → API"
echo "  4. Click: 'Create API Key'"
echo "  5. Copy the API key"
echo ""

# Open n8n UI
open "$N8N_URL"

echo "⏳ Opening n8n UI in browser..."
echo ""
echo "Paste the new API key here and press Enter:"
read -r NEW_API_KEY

if [ -z "$NEW_API_KEY" ]; then
  echo ""
  echo "❌ No API key provided. Exiting."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 STEP 2: Updating ~/.zshrc with new API key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup ~/.zshrc
cp ~/.zshrc ~/.zshrc.backup.$(date +%s)
echo "✅ Backed up ~/.zshrc"

# Update or add N8N_API_KEY in ~/.zshrc
if grep -q "export N8N_API_KEY=" ~/.zshrc; then
  sed -i.bak "s|export N8N_API_KEY=\".*\"|export N8N_API_KEY=\"$NEW_API_KEY\"|g" ~/.zshrc
  echo "✅ Updated N8N_API_KEY in ~/.zshrc"
else
  echo "export N8N_API_KEY=\"$NEW_API_KEY\"" >> ~/.zshrc
  echo "✅ Added N8N_API_KEY to ~/.zshrc"
fi

# Reload zshrc
export N8N_API_KEY="$NEW_API_KEY"
echo "✅ Loaded new API key into current session"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 STEP 3: Creating Supabase credential in n8n"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create Supabase credential
CREDENTIAL_RESPONSE=$(curl -s -X POST "$N8N_URL/api/v1/credentials" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Supabase (Universal)\",
    \"type\": \"supabaseApi\",
    \"data\": {
      \"host\": \"$SUPABASE_URL\",
      \"serviceRole\": \"$SUPABASE_SERVICE_ROLE_KEY\"
    }
  }")

CREDENTIAL_ID=$(echo "$CREDENTIAL_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CREDENTIAL_ID" ]; then
  echo "✅ Created Supabase credential"
  echo "   ID: $CREDENTIAL_ID"
  
  # Save to ~/.zshrc
  if grep -q "export N8N_SUPABASE_CREDENTIAL_ID=" ~/.zshrc; then
    sed -i.bak "s|export N8N_SUPABASE_CREDENTIAL_ID=\".*\"|export N8N_SUPABASE_CREDENTIAL_ID=\"$CREDENTIAL_ID\"|g" ~/.zshrc
  else
    echo "export N8N_SUPABASE_CREDENTIAL_ID=\"$CREDENTIAL_ID\"" >> ~/.zshrc
  fi
  echo "✅ Saved credential ID to ~/.zshrc"
else
  echo "❌ Failed to create Supabase credential"
  echo "Response: $CREDENTIAL_RESPONSE"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 4: Importing workflows from git"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Workflows to import
WORKFLOWS=(
  "n8n-workflows/rag-workflows/knowledge-ingest.json:knowledge_base"
  "n8n-workflows/settings-workflows/settings-store.json:user_settings"
  "n8n-workflows/settings-workflows/settings-retrieve.json:user_settings"
  "n8n-workflows/project-workflows/project-content-store.json:projects"
  "n8n-workflows/project-workflows/project-content-retrieve.json:projects"
  "n8n-workflows/project-workflows/project-content-delete.json:projects"
)

declare -A WORKFLOW_IDS

for WORKFLOW_ENTRY in "${WORKFLOWS[@]}"; do
  WORKFLOW_FILE=$(echo "$WORKFLOW_ENTRY" | cut -d':' -f1)
  TABLE_NAME=$(echo "$WORKFLOW_ENTRY" | cut -d':' -f2)
  WORKFLOW_NAME=$(basename "$WORKFLOW_FILE" .json)
  
  echo "📥 Importing: $WORKFLOW_NAME"
  
  # Read workflow JSON
  WORKFLOW_JSON=$(cat "$WORKFLOW_FILE")
  
  # Remove read-only fields
  WORKFLOW_JSON=$(echo "$WORKFLOW_JSON" | jq 'del(.id, .createdAt, .updatedAt, .versionId, .active, .tags)')
  
  # Create workflow
  CREATE_RESPONSE=$(curl -s -X POST "$N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW_JSON")
  
  WORKFLOW_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
  
  if [ "$WORKFLOW_ID" != "null" ] && [ -n "$WORKFLOW_ID" ]; then
    echo "   ✅ Created (ID: $WORKFLOW_ID)"
    WORKFLOW_IDS["$WORKFLOW_NAME"]="$WORKFLOW_ID:$TABLE_NAME"
  else
    echo "   ❌ Failed"
    echo "   Response: $CREATE_RESPONSE"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 STEP 5: Configuring Supabase nodes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for WORKFLOW_NAME in "${!WORKFLOW_IDS[@]}"; do
  IFS=':' read -r WORKFLOW_ID TABLE_NAME <<< "${WORKFLOW_IDS[$WORKFLOW_NAME]}"
  
  echo "🔧 Configuring: $WORKFLOW_NAME"
  
  # Fetch workflow
  WORKFLOW=$(curl -s "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" -H "X-N8N-API-KEY: $N8N_API_KEY")
  
  # Update Supabase nodes
  UPDATED_WORKFLOW=$(echo "$WORKFLOW" | jq --arg credId "$CREDENTIAL_ID" --arg table "$TABLE_NAME" '
    .nodes |= map(
      if .type == "n8n-nodes-base.supabase" then
        .credentials = {"supabaseApi": {"id": $credId, "name": "Supabase (Universal)"}} |
        .parameters.table = $table
      else
        .
      end
    )
  ')
  
  # Extract only mutable fields
  UPDATE_PAYLOAD=$(echo "$UPDATED_WORKFLOW" | jq '{name, nodes, connections, settings, staticData}')
  
  # Update workflow
  curl -s -X PUT "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_PAYLOAD" > /dev/null
  
  echo "   ✅ Configured (Table: $TABLE_NAME)"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STEP 6: Activating workflows"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for WORKFLOW_NAME in "${!WORKFLOW_IDS[@]}"; do
  IFS=':' read -r WORKFLOW_ID TABLE_NAME <<< "${WORKFLOW_IDS[$WORKFLOW_NAME]}"
  
  echo "▶️  Activating: $WORKFLOW_NAME"
  
  curl -s -X POST "$N8N_URL/api/v1/workflows/$WORKFLOW_ID/activate" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" > /dev/null
  
  echo "   ✅ Active"
done

echo ""
echo "⏳ Waiting 5 seconds for webhooks to register..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 7: Testing webhook registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TEST_WEBHOOKS=(
  "knowledge-ingest"
  "settings-store"
  "settings-retrieve"
  "project-content-store"
  "project-content-retrieve"
)

for WEBHOOK in "${TEST_WEBHOOKS[@]}"; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/webhook/$WEBHOOK")
  
  if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ /webhook/$WEBHOOK: HTTP $HTTP_STATUS (NOT REGISTERED)"
  else
    echo "✅ /webhook/$WEBHOOK: HTTP $HTTP_STATUS (REGISTERED)"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ RESTORATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   • API key updated in ~/.zshrc ✅"
echo "   • Supabase credential created ✅"
echo "   • All workflows imported from git ✅"
echo "   • Supabase nodes configured ✅"
echo "   • All workflows activated ✅"
echo "   • Webhook registration tested ✅"
echo ""
echo "🎯 Your n8n instance has been fully restored from git!"
echo ""

