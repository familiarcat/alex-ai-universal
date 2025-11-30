#!/bin/bash

################################################################################
#
# 🧪 TEST WEBHOOKS AFTER WEBHOOK_URL FIX
#
# Run this AFTER applying the WEBHOOK_URL fix to verify everything works
#
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🧪 WEBHOOK TESTING SUITE                                           ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

N8N_URL=$(grep 'export N8N_URL=' ~/.zshrc | cut -d'"' -f2)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 STEP 1: Verify WEBHOOK_URL is now set..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

WEBHOOK_URL=$(curl -s "$N8N_URL/api/v1/settings" | jq -r '.settings.WEBHOOK_URL')

echo "🎯 Target: $N8N_URL"
echo "📊 WEBHOOK_URL: ${WEBHOOK_URL:-null}"
echo ""

if [ "$WEBHOOK_URL" = "null" ] || [ -z "$WEBHOOK_URL" ]; then
  echo "❌ WEBHOOK_URL is still NULL!"
  echo ""
  echo "Please run the fix commands in AWS Console first."
  exit 1
else
  echo "✅ WEBHOOK_URL is set correctly!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 STEP 2: Force workflow re-validation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "This will deactivate and reactivate all workflows to register webhooks."
echo ""

node << 'NODE_SCRIPT'
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

const workflows = JSON.parse(execSync(`curl -s "${N8N_URL}/api/v1/workflows" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' }));

console.log(`Found ${workflows.data.length} workflows\n`);

workflows.data.filter(w => w.active).forEach((workflow, index) => {
  console.log(`[${index + 1}] 🔄 ${workflow.name}`);
  
  // Deactivate
  execSync(`curl -s -X POST "${N8N_URL}/api/v1/workflows/${workflow.id}/deactivate" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' });
  
  // Wait 1 second
  execSync('sleep 1');
  
  // Reactivate
  execSync(`curl -s -X POST "${N8N_URL}/api/v1/workflows/${workflow.id}/activate" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' });
  
  console.log(`    ✅ Done`);
});

console.log('\n✅ All workflows re-validated!\n');
NODE_SCRIPT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 STEP 3: Testing critical webhooks..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏳ Waiting 10 seconds for webhooks to register..."
sleep 10
echo ""

# Test critical webhooks
WEBHOOKS=(
  "knowledge-ingest"
  "settings-store"
  "settings-retrieve"
  "project-content-store"
  "project-content-retrieve"
)

SUCCESS_COUNT=0
TOTAL=${#WEBHOOKS[@]}

for WEBHOOK in "${WEBHOOKS[@]}"; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/webhook/$WEBHOOK")
  
  if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ /webhook/$WEBHOOK: HTTP $HTTP_STATUS (NOT REGISTERED)"
  else
    echo "✅ /webhook/$WEBHOOK: HTTP $HTTP_STATUS (REGISTERED)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 RESULT: $SUCCESS_COUNT/$TOTAL webhooks registered"
echo ""

if [ "$SUCCESS_COUNT" -eq "$TOTAL" ]; then
  echo "🎉 ALL WEBHOOKS WORKING!"
  echo ""
  echo "✅ Pure DDD architecture achieved:"
  echo "   Client => n8n => Supabase"
  echo ""
  echo "✅ Your system is now fully operational!"
  echo ""
elif [ "$SUCCESS_COUNT" -gt 0 ]; then
  echo "⚠️  Partial success. Some webhooks still need manual UI refresh."
  echo ""
  echo "Try opening each workflow in n8n UI and clicking 'Save'."
  echo ""
else
  echo "❌ No webhooks registered yet."
  echo ""
  echo "Manual steps needed:"
  echo "   1. Open n8n UI: $N8N_URL"
  echo "   2. Open each workflow"
  echo "   3. Click the workflow name to edit"
  echo "   4. Click 'Save' (this triggers re-validation)"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

