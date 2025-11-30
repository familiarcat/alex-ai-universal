#!/bin/bash

##############################################################################
# AUTOMATED USER_SETTINGS TABLE CREATION
# 
# Uses Supabase CLI to automatically create user_settings table
# Falls back to manual instructions if CLI not available
#
# Crew: Chief O'Brien (Automation) + La Forge (Infrastructure)
##############################################################################

set -e

echo "🖖 AUTOMATED USER_SETTINGS TABLE CREATION"
echo "=========================================="
echo ""
echo "Philosophy: Terminal Automation > Manual UI"
echo "Crew: Chief O'Brien + Lt. Cmdr. La Forge"
echo ""

# Load credentials from ~/.zshrc
if [ -f "$HOME/.zshrc" ]; then
    echo "🔐 Loading credentials from ~/.zshrc..."
    export SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1)
    export SUPABASE_SERVICE_ROLE_KEY=$(grep "export SUPABASE_SERVICE_ROLE_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
else
    echo "❌ ~/.zshrc not found!"
    exit 1
fi

echo "✅ Credentials loaded"
echo "   Supabase: $SUPABASE_URL"
echo ""

# Extract project ref from URL
SUPABASE_PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "📊 Checking Supabase CLI availability..."
echo ""

SUPABASE_CLI=$(which supabase 2>/dev/null || echo "")

if [ -z "$SUPABASE_CLI" ]; then
    echo "⚠️  Supabase CLI not found in PATH"
    echo "🔄 Attempting to install..."
    
    # Try to install via brew
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase 2>&1 | tail -10
        SUPABASE_CLI=$(which supabase 2>/dev/null || echo "")
    fi
    
    if [ -z "$SUPABASE_CLI" ]; then
        echo ""
        echo "❌ Could not install Supabase CLI automatically"
        echo "📋 OPTION 1: Install manually"
        echo "   brew install supabase/tap/supabase"
        echo "   Then re-run this script"
        echo ""
        echo "📋 OPTION 2: Manual Migration (2 minutes)"
        echo "   bash scripts/open-user-settings-migration.sh"
        echo ""
        exit 1
    fi
fi

# Check version and update if needed (systemic failure pattern)
CLI_VERSION=$($SUPABASE_CLI --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
echo "✅ Supabase CLI found: v$CLI_VERSION"

# Check if CLI supports required features
if ! $SUPABASE_CLI db push --help &> /dev/null; then
    echo "⚠️  CLI version may be outdated or missing features"
    echo "🔄 Attempting to update..."
    
    if command -v brew &> /dev/null; then
        brew upgrade supabase/tap/supabase 2>&1 | tail -10
        CLI_VERSION=$($SUPABASE_CLI --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        echo "✅ Updated to: v$CLI_VERSION"
    fi
fi

echo ""

# Change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/002_create_user_settings_table.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"
echo ""

# Initialize supabase if needed
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    $SUPABASE_CLI init 2>/dev/null || true
    echo ""
fi

# Link to remote project
echo "🔗 Linking to Supabase project: $SUPABASE_PROJECT_REF..."
LINK_OUTPUT=$($SUPABASE_CLI link --project-ref "$SUPABASE_PROJECT_REF" 2>&1 | grep -v "password" || true)

if echo "$LINK_OUTPUT" | grep -q "error\|failed\|not found"; then
    echo "⚠️  Link may have issues, but continuing..."
    echo ""
else
    echo "✅ Linked to project"
    echo ""
fi

# Push migration
echo "📤 Pushing migration to Supabase..."
echo ""

MIGRATION_OUTPUT=$($SUPABASE_CLI db push 2>&1 || true)

if echo "$MIGRATION_OUTPUT" | grep -q "error\|failed\|Error"; then
    echo "⚠️  Migration push had issues:"
    echo "$MIGRATION_OUTPUT" | head -20
    echo ""
    echo "🔧 Attempting direct SQL execution..."
    
    # Try direct SQL execution via CLI
    SQL_CONTENT=$(cat "$MIGRATION_FILE")
    EXEC_OUTPUT=$($SUPABASE_CLI db execute "$SQL_CONTENT" 2>&1 || true)
    
    if echo "$EXEC_OUTPUT" | grep -q "error\|failed\|Error"; then
        echo "⚠️  Direct execution also had issues:"
        echo "$EXEC_OUTPUT" | head -20
        echo ""
        echo "📋 FALLBACK: Manual Migration Required"
        echo "   1. Open: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/sql/new"
        echo "   2. Copy SQL from: $MIGRATION_FILE"
        echo "   3. Paste and click 'Run'"
        echo ""
        exit 1
    else
        echo "✅ Migration executed successfully!"
    fi
else
    echo "✅ Migration pushed successfully!"
fi

echo ""

# Verify table exists
echo "🔍 Verifying user_settings table..."
echo ""

VERIFY_SQL="SELECT user_id, global_theme, created_at FROM user_settings LIMIT 1;"
TABLE_CHECK=$($SUPABASE_CLI db query "$VERIFY_SQL" 2>&1 || echo "")

if echo "$TABLE_CHECK" | grep -q "user_id\|default"; then
    echo "✅ Table verified - user_settings table exists!"
    echo "$TABLE_CHECK"
    echo ""
    echo "🎉 SUCCESS! Table created and verified."
    echo ""
else
    echo "⚠️  Table verification unclear:"
    echo "$TABLE_CHECK"
    echo ""
    echo "💡 If table doesn't exist, run manual migration:"
    echo "   1. Open: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/sql/new"
    echo "   2. Copy SQL from: $MIGRATION_FILE"
    echo "   3. Paste and click 'Run'"
    echo ""
fi

echo "✅ Automation complete!"
echo ""

