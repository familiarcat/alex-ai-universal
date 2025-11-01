#!/bin/bash

##############################################################################
# Open Supabase SQL Editor
#
# One-command automation to open the right Supabase page
# Then you just paste the SQL and click Run (2 minutes total)
#
# Crew: Chief O'Brien ("Open the damn SQL editor already!")
##############################################################################

# Extract project ref from URL
SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1 | tr -d ' ')
PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

SQL_EDITOR_URL="https://app.supabase.com/project/${PROJECT_REF}/sql/new"

echo "🚀 Opening Supabase SQL Editor..."
echo ""
echo "URL: $SQL_EDITOR_URL"
echo ""
echo "📋 NEXT STEPS (2 minutes):"
echo "   1. SQL Editor will open in your browser"
echo "   2. Copy SQL from: supabase/migrations/001_create_projects_table.sql"
echo "   3. Paste into editor"
echo "   4. Click 'RUN' button"
echo "   5. Verify: Should see 4 rows inserted (alpha, beta, gamma, temporal)"
echo ""
echo "Opening browser..."
sleep 1

# Open in browser
open "$SQL_EDITOR_URL" || xdg-open "$SQL_EDITOR_URL" || echo "Please open: $SQL_EDITOR_URL"

echo ""
echo "✅ SQL Editor opened!"
echo ""
echo "After running SQL, verify with:"
echo "  node scripts/supabase-migrate-automated.js"
echo ""
echo "🖖 Almost there!"

