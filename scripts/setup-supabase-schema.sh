#!/bin/bash

# Setup Supabase Schema for Project Content
# Proper DDD: Client <=> n8n <=> Supabase

set -e

echo "🗄️  Setting up Supabase schema for project content..."
echo ""

# Load Supabase credentials from ~/.zshrc
source "$HOME/.zshrc" 2>/dev/null || true

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in ~/.zshrc"
  echo ""
  echo "Add these to your ~/.zshrc:"
  echo "  export SUPABASE_URL='https://your-project.supabase.co'"
  echo "  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
  exit 1
fi

# Extract project ID from Supabase URL
SUPABASE_PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "📍 Supabase Project: $SUPABASE_PROJECT_ID"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql (PostgreSQL client) is not installed"
  echo ""
  echo "Install it:"
  echo "  macOS: brew install postgresql"
  echo "  Ubuntu: sudo apt-get install postgresql-client"
  exit 1
fi

# Connection string
SUPABASE_DB_URL="postgresql://postgres:$SUPABASE_SERVICE_ROLE_KEY@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"

echo "🔧 Running schema migration..."
echo ""

# Run the SQL schema
psql "$SUPABASE_DB_URL" -f supabase/schema-project-content.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Supabase schema created successfully!"
  echo ""
  echo "📊 Created:"
  echo "  - Table: project_content"
  echo "  - Table: project_content_changelog"
  echo "  - View: active_projects"
  echo "  - View: recent_project_changes"
  echo "  - Triggers: version increment, changelog"
  echo "  - RLS Policies: n8n service role access"
  echo ""
  echo "🔍 Verify in Supabase dashboard:"
  echo "  $SUPABASE_URL"
else
  echo ""
  echo "❌ Schema creation failed. Check errors above."
  exit 1
fi

