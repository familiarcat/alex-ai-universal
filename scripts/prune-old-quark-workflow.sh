#!/bin/bash

# 🗑️ Alex AI Workflow Pruning Script
# Safely removes the old Quark workflow from n8n
# Target: "Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)"
# ID: F5KLCH4ND7d6D6sQ

set -e

echo "🗑️  Alex AI Workflow Pruning"
echo "============================"
echo ""

# Load credentials
if [ -z "$N8N_API_KEY" ]; then
  source ~/.zshrc >/dev/null 2>&1 || true
fi

if [ -z "$N8N_API_KEY" ]; then
  echo "❌ Error: N8N_API_KEY not found in environment"
  exit 1
fi

echo "✅ Credentials loaded"
echo "🌐 n8n Instance: https://n8n.pbradygeorgen.com"
echo ""

# Target workflow details
WORKFLOW_ID="F5KLCH4ND7d6D6sQ"
WORKFLOW_NAME="Crew - Quark - Ferengi Business Intelligence (OpenRouter Optimized)"

echo "🎯 TARGET WORKFLOW:"
echo "   ID: $WORKFLOW_ID"
echo "   Name: $WORKFLOW_NAME"
echo "   Reason: Superseded by newer Quark workflow"
echo ""

# Fetch and verify the workflow exists
echo "🔍 Verifying workflow exists..."
WORKFLOW_DATA=$(curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "https://n8n.pbradygeorgen.com/api/v1/workflows/${WORKFLOW_ID}")

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to fetch workflow from n8n"
  exit 1
fi

# Check if workflow was found
WORKFLOW_CHECK=$(echo "$WORKFLOW_DATA" | jq -r '.id // empty')
if [ -z "$WORKFLOW_CHECK" ]; then
  echo "❌ Error: Workflow not found (may already be deleted)"
  exit 1
fi

# Display workflow details
echo "✅ Workflow found:"
echo "$WORKFLOW_DATA" | jq '{
  id: .id,
  name: .name,
  active: .active,
  nodes: (.nodes | length),
  updated: .updatedAt
}'
echo ""

# Confirm it's inactive
IS_ACTIVE=$(echo "$WORKFLOW_DATA" | jq -r '.active')
if [ "$IS_ACTIVE" = "true" ]; then
  echo "⚠️  WARNING: Workflow is currently ACTIVE"
  echo "   Please deactivate it before pruning"
  exit 1
fi

echo "✅ Workflow is inactive (safe to delete)"
echo ""

# Final confirmation
echo "⚠️  FINAL CONFIRMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "You are about to DELETE the following workflow:"
echo "  • Name: $WORKFLOW_NAME"
echo "  • ID: $WORKFLOW_ID"
echo "  • Status: Inactive"
echo ""
echo "This action CANNOT be undone!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
  echo ""
  echo "❌ Pruning cancelled"
  exit 0
fi

echo ""
echo "🗑️  Deleting workflow..."

# Delete the workflow
HTTP_CODE=$(curl -s -w "%{http_code}" -o /tmp/delete_response.txt \
  -X DELETE \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "https://n8n.pbradygeorgen.com/api/v1/workflows/${WORKFLOW_ID}")

RESPONSE_BODY=$(cat /tmp/delete_response.txt 2>/dev/null || echo "")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
  echo "✅ Workflow deleted successfully!"
  echo ""
  echo "📊 PRUNING SUMMARY:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Deleted: $WORKFLOW_NAME"
  echo "  ID: $WORKFLOW_ID"
  echo "  Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo ""
  echo "🔄 Syncing crew roster..."
  ./scripts/sync-crew-roster.sh
else
  echo "❌ Error: Failed to delete workflow (HTTP $HTTP_CODE)"
  echo "Response: $RESPONSE_BODY"
  exit 1
fi

echo ""
echo "🎉 Pruning complete! Old Quark workflow removed."
echo "🖖 Current active crew: 10 active workflows"

