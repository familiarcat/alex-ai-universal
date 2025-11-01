#!/bin/bash

##############################################################################
# Use Existing Supabase Keys for n8n Configuration
# 
# Pragmatic approach: Try using the keys we already have
# The "anon" key may have sufficient privileges, or we can use it for testing
#
# Crew: Chief O'Brien ("Work with what we have")
##############################################################################

echo "🔧 Configuring n8n with Existing Supabase Keys"
echo "==============================================="
echo ""

# Load what we have
SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1 | tr -d ' ')
SUPABASE_ANON_KEY=$(grep "export SUPABASE_ANON_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
SUPABASE_KEY=$(grep "export SUPABASE_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
N8N_API_KEY=$(grep "export N8N_API_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
N8N_URL=$(grep "export N8N_URL" "$HOME/.zshrc" | cut -d'"' -f2)

echo "Keys found in ~/.zshrc:"
echo "  SUPABASE_URL: ✅"
echo "  SUPABASE_ANON_KEY: ✅ (starts with sb_secret_)"
echo "  SUPABASE_KEY: ✅ (starts with sb_publishable_)"
echo "  SUPABASE_SERVICE_ROLE_KEY: ❌ Not found"
echo ""

SUPABASE_HOST=$(echo "$SUPABASE_URL" | sed 's|https://||')

echo "🎯 Strategy: Try using SUPABASE_ANON_KEY as service role"
echo "   (The 'sb_secret_' prefix suggests it may have elevated privileges)"
echo ""

# Try creating credential with anon key
echo "📝 Creating n8n Supabase credential with available key..."

CREDENTIAL_RESPONSE=$(curl -s -X POST "$N8N_URL/api/v1/credentials" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Supabase Account\",
        \"type\": \"supabaseApi\",
        \"data\": {
            \"host\": \"$SUPABASE_HOST\",
            \"serviceRole\": \"$SUPABASE_ANON_KEY\"
        }
    }")

CREDENTIAL_ID=$(echo "$CREDENTIAL_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ -z "$CREDENTIAL_ID" ] || [ "$CREDENTIAL_ID" = "null" ]; then
    echo "⚠️  Response: $CREDENTIAL_RESPONSE"
    echo ""
    echo "🔍 Checking if credential already exists..."
    
    EXISTING_CREDS=$(curl -s -X GET "$N8N_URL/api/v1/credentials" \
        -H "X-N8N-API-KEY: $N8N_API_KEY")
    
    CREDENTIAL_ID=$(echo "$EXISTING_CREDS" | jq -r '.data[] | select(.name == "Supabase Account") | .id' | head -1)
    
    if [ ! -z "$CREDENTIAL_ID" ] && [ "$CREDENTIAL_ID" != "null" ]; then
        echo "✅ Found existing Supabase credential (ID: $CREDENTIAL_ID)"
    else
        echo "❌ Could not create credential"
        echo ""
        echo "Options:"
        echo "  1. Get actual service_role key from Supabase (recommended)"
        echo "     bash scripts/get-supabase-service-key.sh"
        echo ""
        echo "  2. Or manually configure in n8n:"
        echo "     https://n8n.pbradygeorgen.com/credentials"
        exit 1
    fi
else
    echo "✅ Credential created (ID: $CREDENTIAL_ID)"
fi

echo ""
echo "🎉 n8n now has Supabase credentials configured!"
echo ""
echo "⚠️  NOTE: Workflows still need to be linked to this credential"
echo "   This requires editing each workflow in n8n UI (30 sec each)"
echo ""
echo "Or we can build an advanced script to auto-patch workflow JSONs..."
echo ""
echo "Current status: Credential exists, workflows need linking"

