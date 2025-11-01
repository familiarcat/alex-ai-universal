#!/bin/bash

##############################################################################
# Get Supabase Service Role Key Helper
# 
# Opens Supabase API settings page and guides you to add the key to ~/.zshrc
# 
# Crew: Chief O'Brien ("Let's just get the damn key and finish this")
##############################################################################

echo "🔑 Get Supabase Service Role Key"
echo "================================="
echo ""

# Extract project ref
SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1 | tr -d ' ')
PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

API_SETTINGS_URL="https://app.supabase.com/project/${PROJECT_REF}/settings/api"

echo "📋 STEPS TO GET SERVICE ROLE KEY:"
echo ""
echo "1. Opening Supabase API Settings in browser..."
echo "   URL: $API_SETTINGS_URL"
echo ""

# Open in browser
open "$API_SETTINGS_URL" || xdg-open "$API_SETTINGS_URL" 2>/dev/null || echo "Please open: $API_SETTINGS_URL"

sleep 1

echo "2. On the page, scroll to 'Project API keys' section"
echo ""
echo "3. Find 'service_role' key (it's a secret, click to reveal)"
echo ""
echo "4. Copy the service_role key (starts with eyJ...)"
echo ""
echo "5. Add to ~/.zshrc:"
echo ""
echo "   export SUPABASE_SERVICE_ROLE_KEY=\"paste-key-here\""
echo ""
echo "6. Save ~/.zshrc and run:"
echo "   source ~/.zshrc"
echo ""
echo "7. Then continue automation:"
echo "   bash scripts/automated-ddd-setup.sh"
echo ""
echo "⏱️  Total time: 2 minutes"
echo ""
echo "🖖 Standing by for your service role key..."

