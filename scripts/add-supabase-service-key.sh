#!/bin/bash
################################################################################
# ADD SUPABASE SERVICE ROLE KEY TO ~/.zshrc
################################################################################
# This enables full automation of schema deployments
################################################################################

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🔑 ADD SUPABASE SERVICE ROLE KEY                                    ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "To enable FULL automation (including schema deployment), we need the"
echo "Supabase Service Role Key."
echo ""
echo "📍 How to get it:"
echo "   1. Go to: https://supabase.com/dashboard"
echo "   2. Select your project"
echo "   3. Click 'Settings' → 'API'"
echo "   4. Find 'service_role' key (NOT the anon key)"
echo "   5. Copy the value"
echo ""
echo "This key allows automated SQL execution for schema deployment."
echo ""

read -p "Do you have the Service Role Key ready? (y/n): " READY

if [ "$READY" != "y" ] && [ "$READY" != "Y" ]; then
    echo ""
    echo "No problem! You can add it later. For now, you'll need to deploy"
    echo "the schema manually via Supabase SQL Editor."
    echo ""
    echo "When ready, run this script again or add to ~/.zshrc:"
    echo "  export SUPABASE_SERVICE_ROLE_KEY=\"your-key-here\""
    exit 0
fi

echo ""
read -p "Paste your Service Role Key: " SERVICE_KEY

if [ -z "$SERVICE_KEY" ]; then
    echo "❌ No key provided. Exiting."
    exit 1
fi

# Backup ~/.zshrc
cp ~/.zshrc ~/.zshrc.backup.$(date +%Y%m%d-%H%M%S)
echo "✅ Backed up ~/.zshrc"

# Add to ~/.zshrc if not already there
if grep -q "SUPABASE_SERVICE_ROLE_KEY" ~/.zshrc; then
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY already in ~/.zshrc"
    echo "   Updating value..."
    sed -i.bak "s|export SUPABASE_SERVICE_ROLE_KEY=.*|export SUPABASE_SERVICE_ROLE_KEY=\"$SERVICE_KEY\"|" ~/.zshrc
else
    echo "" >> ~/.zshrc
    echo "# Supabase Service Role Key (for automated schema deployment)" >> ~/.zshrc
    echo "export SUPABASE_SERVICE_ROLE_KEY=\"$SERVICE_KEY\"" >> ~/.zshrc
fi

echo "✅ Added SUPABASE_SERVICE_ROLE_KEY to ~/.zshrc"
echo ""
echo "🔄 Reload your shell or run: source ~/.zshrc"
echo ""
echo "✅ You can now run fully automated deployments!"
echo "   Run: ./fully-automated-crew-deployment.sh"
echo ""

