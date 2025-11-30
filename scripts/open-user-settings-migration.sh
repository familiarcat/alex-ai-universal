#!/bin/bash

##############################################################################
# Open Supabase SQL Editor with user_settings migration ready
#
# One-command automation to open the right Supabase page with migration SQL
# Then you just paste and click Run (30 seconds total)
#
# Crew: Chief O'Brien ("Just open it and paste!")
##############################################################################

# Extract project ref from URL
SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1 | tr -d ' ')
PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

SQL_EDITOR_URL="https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

MIGRATION_FILE="supabase/migrations/002_create_user_settings_table.sql"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_PATH="$PROJECT_ROOT/$MIGRATION_FILE"

echo "🚀 Opening Supabase SQL Editor for user_settings migration..."
echo ""
echo "URL: $SQL_EDITOR_URL"
echo ""
echo "📋 MIGRATION SQL (copy this):"
echo "=========================================="
cat "$MIGRATION_PATH"
echo ""
echo "=========================================="
echo ""
echo "📋 NEXT STEPS (30 seconds):"
echo "   1. SQL Editor will open in your browser"
echo "   2. Copy the SQL above (already displayed)"
echo "   3. Paste into SQL Editor"
echo "   4. Click 'RUN' button"
echo "   5. Verify: Should see 'Success' message"
echo ""
echo "Opening browser..."
sleep 1

# Open in browser
open "$SQL_EDITOR_URL" 2>/dev/null || xdg-open "$SQL_EDITOR_URL" 2>/dev/null || echo "Please open: $SQL_EDITOR_URL"

echo ""
echo "✅ SQL Editor opened!"
echo ""
echo "After running SQL, verify with:"
echo "  node scripts/verify-user-settings-table.js"
echo ""
echo "🖖 Ready to paste and run!"

