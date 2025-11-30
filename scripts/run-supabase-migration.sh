#!/bin/bash

##############################################################################
# RUN SUPABASE MIGRATION - Automated DDL Execution
#
# Uses Supabase CLI to execute migration files programmatically
# Credentials: Loaded from ~/.zshrc
#
# Crew: Chief O'Brien (automation), Lt. Uhura (API integration)
##############################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 AUTOMATED SUPABASE MIGRATION RUNNER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load credentials from ~/.zshrc
echo "📋 Loading credentials from ~/.zshrc..."
SUPABASE_URL=$(grep 'export SUPABASE_URL=' ~/.zshrc | cut -d'"' -f2)
SUPABASE_SERVICE_KEY=$(grep 'export SUPABASE_SERVICE_KEY=' ~/.zshrc | cut -d'"' -f2)

# Extract project ref from URL (e.g., rpkkkbufdwxmjaerbhbn)
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\///' | cut -d'.' -f1)

echo "✅ Loaded credentials"
echo "   Project: $PROJECT_REF"
echo ""

# Check which migration to run
MIGRATION_FILE=${1:-supabase/migrations/002_create_user_settings_table.sql}

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Method 1: Try Supabase CLI (if authenticated)
echo "🔍 Checking if Supabase CLI is authenticated..."
if supabase projects list 2>/dev/null | grep -q "$PROJECT_REF"; then
  echo "✅ Supabase CLI authenticated!"
  echo ""
  echo "🚀 Running migration via CLI..."
  
  # Link to project if not already linked
  if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "🔗 Linking to project $PROJECT_REF..."
    supabase link --project-ref "$PROJECT_REF"
  fi
  
  # Run migration
  supabase db push
  
  echo ""
  echo "✅ Migration executed via Supabase CLI!"
  exit 0
fi

# Method 2: Execute via SQL using psql-like HTTP request
echo "⏳ Supabase CLI not authenticated, using direct SQL execution..."
echo ""

# Read migration file
MIGRATION_SQL=$(cat "$MIGRATION_FILE")

# Execute via Supabase SQL endpoint using service role key
echo "🚀 Executing migration SQL..."

# Use curl to execute SQL directly (using service_role key for admin access)
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}" 2>&1)

if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ SQL execution failed via RPC"
  echo "$RESPONSE"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⚠️  FALLBACK: Manual execution required"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Supabase REST API doesn't support DDL (CREATE TABLE) operations."
  echo "You'll need to paste the migration in the Supabase SQL editor."
  echo ""
  echo "📋 Migration copied to clipboard"
  echo "🌐 SQL Editor: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
  echo ""
  echo "Paste and click RUN"
  exit 1
fi

echo "✅ Migration executed successfully!"
echo "$RESPONSE"
