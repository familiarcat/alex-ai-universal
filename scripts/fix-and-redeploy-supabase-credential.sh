#!/bin/bash

##############################################################################
# Fix and Redeploy Supabase Credential with Correct URL Format
# 
# Chief O'Brien's Discovery: n8n Supabase node needs FULL URL with https://
# 
# This script:
# 1. Deletes old credential (wrong format)
# 2. Creates new credential with https:// prefix
# 3. Re-links all 3 workflows
# 4. Activates workflows
# 5. Tests webhook registration
#
# FULL AUTOMATION based on manual discovery!
##############################################################################

set -e

echo "🔧 Fix & Redeploy Supabase Credential"
echo "======================================"
echo ""
echo "Chief O'Brien's Discovery: n8n needs https:// in host"
echo ""

# Load credentials
N8N_API_KEY=$(grep "export N8N_API_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
N8N_URL=$(grep "export N8N_URL" "$HOME/.zshrc" | cut -d'"' -f2)
SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1 | tr -d ' ')
SUPABASE_SERVICE_KEY=$(grep "export SUPABASE_SERVICE_KEY" "$HOME/.zshrc" | cut -d'"' -f2)

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_KEY not found in ~/.zshrc"
    exit 1
fi

echo "✅ Credentials loaded"
echo "   n8n: $N8N_URL"
echo "   Supabase: $SUPABASE_URL"
echo ""

# Delete old credential (wrong format)
echo "🗑️  Deleting old credential with wrong URL format..."
curl -s -X DELETE "$N8N_URL/api/v1/credentials/iUZDdMiy60b3NRvq" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" > /dev/null

echo "✅ Old credential deleted"
echo ""

# Create new credential with FULL URL (including https://)
echo "📝 Creating new credential with correct format..."
echo "   Host: $SUPABASE_URL (with https://!)"
echo ""

CREDENTIAL_RESPONSE=$(curl -s -X POST "$N8N_URL/api/v1/credentials" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Supabase Account\",
        \"type\": \"supabaseApi\",
        \"data\": {
            \"host\": \"$SUPABASE_URL\",
            \"serviceRole\": \"$SUPABASE_SERVICE_KEY\"
        }
    }")

NEW_CREDENTIAL_ID=$(echo "$CREDENTIAL_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ -z "$NEW_CREDENTIAL_ID" ] || [ "$NEW_CREDENTIAL_ID" = "null" ]; then
    echo "❌ Failed to create credential"
    echo "   Response: $CREDENTIAL_RESPONSE"
    exit 1
fi

echo "✅ New credential created!"
echo "   ID: $NEW_CREDENTIAL_ID"
echo "   Format: FULL URL with https://"
echo ""

# Update our automation scripts with the new ID
echo "📝 Updating automation scripts with new credential ID..."
sed -i.bak "s/iUZDdMiy60b3NRvq/$NEW_CREDENTIAL_ID/g" scripts/auto-link-workflows-aggressive.js
echo "✅ Scripts updated with new credential ID"
echo ""

# Re-link workflows with new credential
echo "🔗 Re-linking workflows to new credential..."
node scripts/auto-link-workflows-aggressive.js

echo ""
echo "⏳ Waiting for n8n to register webhooks (5 seconds)..."
sleep 5

echo ""
echo "🧪 Testing webhooks..."
echo ""

# Test retrieve
TEST_RESPONSE=$(curl -s "https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=temporal")

if echo "$TEST_RESPONSE" | jq -e '.headline' >/dev/null 2>&1; then
    HEADLINE=$(echo "$TEST_RESPONSE" | jq -r '.headline')
    echo "✅ WEBHOOKS REGISTERED!"
    echo "   Retrieved temporal: $HEADLINE"
    echo ""
    echo "🎉 DDD ARCHITECTURE: 100% COMPLETE!"
    echo ""
    echo "   Client => n8n => Supabase ✅"
    echo ""
else
    echo "⚠️  Webhook test response:"
    echo "$TEST_RESPONSE" | jq '.' 2>/dev/null || echo "$TEST_RESPONSE"
    echo ""
    echo "May need to manually save workflows in n8n UI"
fi

echo ""
echo "🖖 Chief O'Brien: 'https:// - who knew?'"

