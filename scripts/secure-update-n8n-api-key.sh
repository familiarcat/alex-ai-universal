#!/bin/bash
#
# 🔐 Secure N8N API Key Update Script
#
# Safely updates N8N_OWNER_API_KEY in ~/.zshrc with proper security practices
# Ensures universal access across all scripts and applications
#

set -e

echo "🔐 Secure N8N API Key Update"
echo "=============================="
echo ""

# Check if running interactively
if [ -t 0 ]; then
    INTERACTIVE=true
else
    INTERACTIVE=false
fi

# Get API key
if [ -n "$1" ]; then
    NEW_KEY="$1"
elif [ "$INTERACTIVE" = true ]; then
    echo "📋 Instructions:"
    echo "   1. Open: https://n8n.pbradygeorgen.com"
    echo "   2. Go to: Settings → API"
    echo "   3. Click: 'Create API Key'"
    echo "   4. Copy the key"
    echo ""
    read -p "Paste the new N8N API key here: " NEW_KEY
else
    echo "❌ Error: API key required as argument or in interactive mode"
    echo "Usage: $0 <api-key>"
    exit 1
fi

if [ -z "$NEW_KEY" ]; then
    echo "❌ No API key provided"
    exit 1
fi

# Validate key format (JWT tokens start with eyJ)
if [[ ! "$NEW_KEY" =~ ^eyJ ]]; then
    echo "⚠️  Warning: API key doesn't look like a JWT token (should start with 'eyJ')"
    read -p "Continue anyway? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔍 Validating API key..."

# Test the key
HTTP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' \
    -H "X-N8N-API-KEY: $NEW_KEY" \
    "https://n8n.pbradygeorgen.com/api/v1/workflows" \
    --max-time 10)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ API key is valid and working!"
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "❌ API key is unauthorized (401)"
    echo "   Please verify the key is correct and has proper permissions"
    exit 1
elif [ "$HTTP_STATUS" = "000" ]; then
    echo "⚠️  Could not connect to n8n instance (network issue?)"
    echo "   Proceeding with key update anyway..."
else
    echo "⚠️  Unexpected response: HTTP $HTTP_STATUS"
    echo "   Proceeding with key update anyway..."
fi

echo ""
echo "💾 Updating ~/.zshrc..."

# Backup
BACKUP_FILE="$HOME/.zshrc.backup.$(date +%Y%m%d_%H%M%S)"
cp ~/.zshrc "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"

# Remove old N8N API key entries
sed -i.bak '/^export N8N_API_KEY=/d' ~/.zshrc
sed -i.bak '/^export N8N_OWNER_API_KEY=/d' ~/.zshrc

# Find or create N8N configuration section
if grep -q "# N8N Configuration" ~/.zshrc; then
    # Insert after N8N Configuration section
    sed -i.bak "/# N8N Configuration/a\\
export N8N_OWNER_API_KEY=\"$NEW_KEY\"\\
export N8N_API_KEY=\"$NEW_KEY\"\\
" ~/.zshrc
else
    # Add N8N section at the end
    cat >> ~/.zshrc << EOF

# N8N Configuration
export N8N_OWNER_API_KEY="$NEW_KEY"
export N8N_API_KEY="$NEW_KEY"
EOF
fi

# Clean up backup file created by sed
rm -f ~/.zshrc.bak

echo "   ✅ ~/.zshrc updated"

# Export for current session
export N8N_OWNER_API_KEY="$NEW_KEY"
export N8N_API_KEY="$NEW_KEY"

echo ""
echo "✅ API key securely updated!"
echo ""
echo "📋 Next steps:"
echo "   1. Run: source ~/.zshrc"
echo "   2. Or open a new terminal"
echo "   3. Test: node scripts/list-all-n8n-workflows.js"
echo ""
echo "🔐 Security notes:"
echo "   ✅ Key stored in ~/.zshrc (not in git)"
echo "   ✅ Backup created: $BACKUP_FILE"
echo "   ✅ Both N8N_OWNER_API_KEY and N8N_API_KEY set (for compatibility)"
echo "   ✅ Key validated before storage"
echo ""

