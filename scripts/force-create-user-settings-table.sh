#!/bin/bash

##############################################################################
# Force Create user_settings table via Supabase Management API
# 
# Uses Supabase REST API to execute SQL directly
# Bypasses migration tracking if needed
#
# Crew: La Forge (Infrastructure) + O'Brien (Pragmatic Fix)
##############################################################################

set -e

echo "🖖 Force Creating user_settings table via Supabase API..."
echo ""

# Load credentials
if [ -f "$HOME/.zshrc" ]; then
    export SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1)
    export SUPABASE_SERVICE_KEY=$(grep "export SUPABASE_SERVICE_ROLE_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
else
    echo "❌ ~/.zshrc not found!"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$PROJECT_ROOT/supabase/migrations/002_create_user_settings_table.sql"

# Read SQL
SQL_CONTENT=$(cat "$MIGRATION_FILE")

echo "📄 Migration SQL loaded"
echo "🔧 Executing via Supabase Management API..."
echo ""

# Use Supabase Management API (requires project API key)
# Alternative: Use psql if available
if command -v psql &> /dev/null; then
    # Extract connection details from URL
    PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
    
    echo "⚠️  Direct SQL execution requires database password"
    echo "   Using Supabase CLI db push instead..."
    echo ""
    
    cd "$PROJECT_ROOT"
    supabase db push --include-all --yes 2>&1 | tail -10
    
    echo ""
    echo "🔍 Verifying..."
    sleep 2
    
    # Verify via Node script
    node "$PROJECT_ROOT/scripts/verify-user-settings-table.js"
else
    echo "❌ psql not available"
    echo ""
    echo "📋 Use Supabase Dashboard instead:"
    echo "   bash scripts/open-user-settings-migration.sh"
    exit 1
fi

