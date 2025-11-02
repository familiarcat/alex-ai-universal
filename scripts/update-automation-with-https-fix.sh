#!/bin/bash
# Fix automation scripts to include https:// in Supabase URL

echo "🔧 Updating automation scripts with https:// fix"
echo "==============================================="
echo ""
echo "Chief O'Brien's Discovery: n8n Supabase node needs full URL"
echo "Fix: Always include https:// when configuring Supabase host"
echo ""

# Update use-existing-supabase-keys.sh
sed -i.bak 's/"host": "$SUPABASE_HOST"/"host": "https:\/\/$SUPABASE_HOST"/' scripts/use-existing-supabase-keys.sh

echo "✅ Updated: use-existing-supabase-keys.sh"
echo "✅ Pattern: Always use full URL with protocol"
echo ""
echo "🖖 Automation scripts corrected for future deployments!"
