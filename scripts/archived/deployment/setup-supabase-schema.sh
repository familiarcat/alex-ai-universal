#!/bin/bash

# Setup Supabase Schema for Project Content
# Proper DDD: Client => n8n Controller => Supabase
# 
# ⚠️  IMPORTANT: This script does NOT access Supabase directly!
# All database operations flow through n8n as the controller.

set -e

echo "🗄️  Setting up Supabase schema via n8n Controller..."
echo ""

# Load n8n credentials from ~/.zshrc (NOT Supabase - proper DDD!)
source "$HOME/.zshrc" 2>/dev/null || true

if [ -z "$N8N_URL" ]; then
  echo "❌ Error: N8N_URL must be set in ~/.zshrc"
  echo ""
  echo "Add this to your ~/.zshrc:"
  echo "  export N8N_URL='https://n8n.pbradygeorgen.com'"
  exit 1
fi

# Admin setup key for security (prevents unauthorized schema changes)
if [ -z "$ADMIN_SETUP_KEY" ]; then
  echo "⚠️  Warning: ADMIN_SETUP_KEY not set. Using default (insecure)."
  ADMIN_SETUP_KEY="default-admin-key-change-me"
fi

echo "📍 n8n Controller: $N8N_URL"
echo "🔒 Separation of Concerns: Client => n8n => Supabase ✅"
echo ""

# Call n8n webhook to setup schema (proper DDD flow)
echo "🔧 Triggering schema setup via n8n..."
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "${N8N_URL}/webhook/supabase-schema-setup" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: ${ADMIN_SETUP_KEY}" \
  -d '{}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
  echo "✅ Supabase schema created successfully via n8n!"
  echo ""
  echo "📊 Response:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo ""
  echo "✅ Proper DDD flow confirmed:"
  echo "   Client (this script) => n8n Controller => Supabase Database"
  echo ""
  echo "🔍 Verify schema in n8n logs:"
  echo "   ${N8N_URL}/workflows"
else
  echo "❌ Schema creation failed (HTTP $http_code)"
  echo ""
  echo "Response:"
  echo "$body"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check n8n workflow 'Supabase Schema Setup' is imported and activated"
  echo "  2. Check ADMIN_SETUP_KEY matches n8n environment variable"
  echo "  3. Check n8n has Supabase PostgreSQL credentials configured"
  exit 1
fi

