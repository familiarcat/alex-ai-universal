#!/bin/bash

##############################################################################
# Auto-Link n8n Workflows to Supabase Credential
# 
# Fetches each workflow, patches credential references, updates via API
# FULL AUTOMATION - NO MANUAL WORKFLOW EDITING!
#
# Crew: Lt. Cmdr. La Forge (Infrastructure Automation)
##############################################################################

set -e

echo "🔗 Auto-Linking Workflows to Supabase Credential"
echo "================================================="
echo ""

# Load credentials
N8N_API_KEY=$(grep "export N8N_API_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
N8N_URL=$(grep "export N8N_URL" "$HOME/.zshrc" | cut -d'"' -f2)

CREDENTIAL_ID="iUZDdMiy60b3NRvq"

echo "🔧 Credential ID: $CREDENTIAL_ID"
echo ""

# Workflow IDs from previous deployment
WORKFLOWS=(
  "2eoq8ycgL5M8dG7z:Project Content Store"
  "NmxfBurDWPEQDqeE:Project Content Retrieve"
  "bgfljtVeLVCSnfI5:Project Content Delete"
)

for WORKFLOW_INFO in "${WORKFLOWS[@]}"; do
  WORKFLOW_ID="${WORKFLOW_INFO%%:*}"
  WORKFLOW_NAME="${WORKFLOW_INFO##*:}"
  
  echo "📝 Processing: $WORKFLOW_NAME"
  echo "   ID: $WORKFLOW_ID"
  
  # Fetch workflow
  WORKFLOW_JSON=$(curl -s -X GET "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" \
      -H "X-N8N-API-KEY: $N8N_API_KEY")
  
  # Update Supabase node credentials using jq
  UPDATED_JSON=$(echo "$WORKFLOW_JSON" | jq '
    .nodes |= map(
      if .type == "n8n-nodes-base.supabase" then
        .credentials = {
          "supabaseApi": {
            "id": "'"$CREDENTIAL_ID"'",
            "name": "Supabase Account"
          }
        }
      else
        .
      end
    ) | .active = true
  ')
  
  # Update workflow via API
  UPDATE_RESPONSE=$(curl -s -X PUT "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" \
      -H "X-N8N-API-KEY: $N8N_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$UPDATED_JSON")
  
  if echo "$UPDATE_RESPONSE" | jq -e '.id' >/dev/null 2>&1; then
    echo "   ✅ Linked & Activated"
  else
    echo "   ⚠️  Update response: $(echo $UPDATE_RESPONSE | jq -r '.message // .' | head -1)"
  fi
  
  echo ""
done

echo "========================================="
echo "📊 Linking Summary"
echo "========================================="
echo ""
echo "✅ All workflows processed"
echo ""
echo "Testing webhooks..."
echo ""

# Test retrieve webhook
TEST_RESPONSE=$(curl -s "https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=temporal")

if echo "$TEST_RESPONSE" | jq -e '.headline' >/dev/null 2>&1; then
  HEADLINE=$(echo "$TEST_RESPONSE" | jq -r '.headline')
  echo "✅ WEBHOOKS WORKING!"
  echo "   Retrieved temporal: $HEADLINE"
  echo ""
  echo "🎉 DDD FLOW COMPLETE!"
  echo ""
  echo "   Client => n8n => Supabase ✅"
  echo ""
else
  echo "⚠️  Webhook test: $TEST_RESPONSE"
  echo ""
  echo "May need to manually verify credential linkage in n8n UI"
fi

echo "🖖 Automation complete!"

