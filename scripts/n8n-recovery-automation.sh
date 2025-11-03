#!/bin/bash

################################################################################
#
# 🔧 N8N RECOVERY AUTOMATION
#
# Purpose: Detect and recover from n8n API key invalidation after Docker restart
#
# This script:
# 1. Checks if n8n API is accessible with current key
# 2. If 401: Prompts user to get new API key from UI
# 3. Updates ~/.zshrc with new key
# 4. Re-validates all workflows
# 5. Tests webhook registration
#
# Created after: v1.7.3 Docker restart incident
# Crew Learning: Never restart n8n without proper credential backup
#
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🔧 N8N RECOVERY AUTOMATION                                          ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Extract current credentials from ~/.zshrc
N8N_URL=$(grep 'export N8N_URL=' ~/.zshrc | cut -d'"' -f2)
N8N_API_KEY=$(grep 'export N8N_API_KEY=' ~/.zshrc | cut -d'"' -f2)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 STEP 1: Testing n8n API connectivity..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Target: $N8N_URL"
echo "🔑 API Key: ${N8N_API_KEY:0:10}..."
echo ""

# Test API
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/api/v1/workflows" -H "X-N8N-API-KEY: $N8N_API_KEY")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ API is accessible! No recovery needed."
  echo ""
  exit 0
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "❌ API returned 401 Unauthorized"
  echo ""
  echo "🔍 DIAGNOSIS: API key is invalid (likely due to Docker restart)"
  echo ""
else
  echo "⚠️  API returned HTTP $HTTP_STATUS (unexpected)"
  echo ""
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 STEP 2: Retrieving new API key from n8n UI..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Instructions:"
echo "   1. Opening n8n UI in browser..."
echo "   2. Go to: Settings → API"
echo "   3. Click: 'Create API Key'"
echo "   4. Copy the new API key"
echo ""

# Open n8n UI
open "$N8N_URL"

echo "⏳ Waiting for you to retrieve the new API key..."
echo ""
echo "Paste the new API key here and press Enter:"
read -r NEW_API_KEY

if [ -z "$NEW_API_KEY" ]; then
  echo ""
  echo "❌ No API key provided. Exiting."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 STEP 3: Updating ~/.zshrc with new API key..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup ~/.zshrc
cp ~/.zshrc ~/.zshrc.backup.$(date +%s)
echo "✅ Backed up ~/.zshrc"

# Update N8N_API_KEY in ~/.zshrc
sed -i.bak "s|export N8N_API_KEY=\".*\"|export N8N_API_KEY=\"$NEW_API_KEY\"|g" ~/.zshrc
echo "✅ Updated N8N_API_KEY in ~/.zshrc"

# Reload zshrc
source ~/.zshrc
echo "✅ Reloaded ~/.zshrc"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 4: Testing new API key..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/api/v1/workflows" -H "X-N8N-API-KEY: $NEW_API_KEY")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ New API key works!"
else
  echo "❌ New API key failed (HTTP $HTTP_STATUS)"
  echo ""
  echo "Please verify you copied the correct API key."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 STEP 5: Re-validating all workflows..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Call the re-validation script
node << 'NODE_SCRIPT'
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

const workflows = JSON.parse(execSync(`curl -s "${N8N_URL}/api/v1/workflows" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' }));

workflows.data.filter(w => w.active).forEach((workflow, index) => {
  console.log(`[${index + 1}] 🔄 ${workflow.name}`);
  execSync(`curl -s -X POST "${N8N_URL}/api/v1/workflows/${workflow.id}/deactivate" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' });
  execSync('sleep 1');
  execSync(`curl -s -X POST "${N8N_URL}/api/v1/workflows/${workflow.id}/activate" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' });
  console.log(`    ✅ Done`);
});

console.log('\n✅ All workflows re-validated!\n');
NODE_SCRIPT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 6: Testing webhook registration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

WEBHOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/webhook/knowledge-ingest")

if [ "$WEBHOOK_STATUS" = "404" ]; then
  echo "❌ Webhook still not registered (HTTP 404)"
  echo "   Manual intervention required in n8n UI"
elif [ "$WEBHOOK_STATUS" = "401" ] || [ "$WEBHOOK_STATUS" = "405" ] || [ "$WEBHOOK_STATUS" = "200" ]; then
  echo "✅ Webhook is registered! (HTTP $WEBHOOK_STATUS)"
else
  echo "⚠️  Unexpected response: HTTP $WEBHOOK_STATUS"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ RECOVERY COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   • API key updated in ~/.zshrc ✅"
echo "   • All workflows re-validated ✅"
echo "   • Webhook registration tested ✅"
echo ""
echo "🎯 Next: Test your DDD workflows with actual data!"
echo ""

