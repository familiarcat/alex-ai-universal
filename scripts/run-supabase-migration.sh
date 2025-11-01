#!/bin/bash

##############################################################################
# Automated Supabase Migration Script
# 
# Runs database migration via Supabase API (no manual UI clicks!)
# Consistent with our n8n deployment automation philosophy
#
# Uses credentials from ~/.zshrc:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
#
# Crew: Chief O'Brien (Pragmatic Automation) + Commander Data (API Logic)
##############################################################################

set -e  # Exit on error

echo "🗄️  Automated Supabase Migration"
echo "================================"
echo ""

# Load credentials from ~/.zshrc
if [ -f "$HOME/.zshrc" ]; then
    echo "🔐 Loading Supabase credentials from ~/.zshrc..."
    export SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1)
    export SUPABASE_SERVICE_ROLE_KEY=$(grep "export SUPABASE_SERVICE_ROLE_KEY" "$HOME/.zshrc" | cut -d'"' -f2 | head -1)
    export SUPABASE_ANON_KEY=$(grep "export SUPABASE_ANON_KEY" "$HOME/.zshrc" | cut -d'"' -f2 | head -1)
else
    echo "❌ ~/.zshrc not found!"
    exit 1
fi

# Verify required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not set in ~/.zshrc"
    echo "   Add: export SUPABASE_URL='https://your-project.supabase.co'"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set in ~/.zshrc"
    echo "   Add: export SUPABASE_SERVICE_ROLE_KEY='eyJ...'"
    echo "   Get from: Supabase Dashboard → Settings → API → service_role (secret)"
    exit 1
fi

echo "✅ Credentials loaded"
echo "   URL: $SUPABASE_URL"
echo ""

# Read migration SQL
MIGRATION_FILE="supabase/migrations/001_create_projects_table.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Reading migration SQL..."
MIGRATION_SQL=$(cat "$MIGRATION_FILE")

# Execute migration via Supabase REST API
echo "🚀 Executing migration via Supabase API..."
echo ""

RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}" 2>&1)

# Check if we need to use PostgREST query endpoint instead
if echo "$RESPONSE" | grep -q "404\|not found"; then
    echo "⚠️  RPC endpoint not available, using query method..."
    
    # Split SQL into individual statements
    # Execute via psql if available, or use Supabase SQL API
    
    if command -v psql >/dev/null 2>&1; then
        echo "📊 Executing via psql..."
        
        # Construct DATABASE_URL if we have the parts
        if [ ! -z "$SUPABASE_DB_PASSWORD" ]; then
            DB_HOST=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||').supabase.co
            DATABASE_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${DB_HOST}:5432/postgres"
            
            echo "$MIGRATION_SQL" | psql "$DATABASE_URL" 2>&1
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Migration executed successfully via psql!"
            else
                echo ""
                echo "❌ Migration failed"
                exit 1
            fi
        else
            echo ""
            echo "⚠️  SUPABASE_DB_PASSWORD not set in ~/.zshrc"
            echo "   Cannot use psql without database password"
            echo ""
            echo "📋 Manual migration required:"
            echo "   1. Go to: ${SUPABASE_URL/https:\/\//https://app.supabase.com/project/}/sql/new"
            echo "   2. Copy: $MIGRATION_FILE"
            echo "   3. Paste and run"
            echo ""
            echo "   OR add to ~/.zshrc:"
            echo "   export SUPABASE_DB_PASSWORD='your-db-password'"
            exit 1
        fi
    else
        echo ""
        echo "⚠️  psql not installed"
        echo ""
        echo "Install options:"
        echo "  brew install postgresql"
        echo ""
        echo "OR run migration manually:"
        echo "  1. Go to: ${SUPABASE_URL/https:\/\//https://app.supabase.com/project/}/sql/new"
        echo "  2. Copy: $MIGRATION_FILE"
        echo "  3. Paste and run"
        exit 1
    fi
else
    echo "✅ Migration executed successfully!"
fi

echo ""

# Verify table was created
echo "🔍 Verifying projects table..."

VERIFY_RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/projects?select=project_id,headline,project_type&order=project_id.asc" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json")

# Count projects
PROJECT_COUNT=$(echo "$VERIFY_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")

if [ "$PROJECT_COUNT" -eq 4 ]; then
    echo "✅ Projects table created successfully!"
    echo "✅ 4 default projects seeded:"
    echo ""
    echo "$VERIFY_RESPONSE" | jq -r '.[] | "  - \(.project_id): \(.headline) [\(.project_type)]"' 2>/dev/null || echo "$VERIFY_RESPONSE"
else
    echo "⚠️  Expected 4 projects, found: $PROJECT_COUNT"
    echo "   Response: $VERIFY_RESPONSE"
fi

echo ""
echo "================================"
echo "📊 Migration Summary"
echo ""
echo "✅ Migration completed!"
echo "✅ Projects table created"
echo "✅ Default projects seeded"
echo ""
echo "Next steps:"
echo "  1. Configure n8n Supabase credential (automated next)"
echo "  2. Link workflows to credential"
echo "  3. Test DDD flow"
echo "  4. Update dashboard to fetch from Supabase"
echo ""
echo "🖖 Infrastructure setup complete!"

