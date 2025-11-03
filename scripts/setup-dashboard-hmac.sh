#!/bin/bash

# Setup Dashboard HMAC Authentication
# Adds HMAC secret to dashboard .env.local

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Setting up Dashboard HMAC Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DASHBOARD_DIR="$(dirname "$0")/../dashboard"
ENV_FILE="$DASHBOARD_DIR/.env.local"

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ dashboard/.env.local not found!"
  echo "   Please create it first or run from correct directory"
  exit 1
fi

# Add HMAC secret
echo "" >> "$ENV_FILE"
echo "# Webhook HMAC Authentication (Added by Lt. Worf - Nov 4, 2025)" >> "$ENV_FILE"
echo "NEXT_PUBLIC_N8N_WEBHOOK_HMAC_SECRET=860d7ddf268ebc67a1ab0175e863778c69ff472771a576c59d135483dd6ec70a" >> "$ENV_FILE"

echo "✅ HMAC secret added to dashboard/.env.local"
echo ""
echo "🔄 Please restart the dashboard server to load the new environment variable:"
echo "   cd dashboard && npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  Worf: 'Dashboard now has HMAC secret. Update webhook calls to use it.'"

