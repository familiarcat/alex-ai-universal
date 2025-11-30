#!/bin/bash

#
# 🔥 N8N WEBHOOK WARMUP SCRIPT
# 
# In n8n, webhooks register lazily on first execution.
# This script "warms up" all crew webhooks by triggering them once.
# After this, they'll persist thanks to N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN.
#

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔥 WARMING UP N8N WEBHOOKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Chief O'Brien: 'Webhooks need to be triggered once to register.'"
echo "              'This is a one-time operation. Let's get it done.'"
echo ""

N8N_BASE_URL="https://n8n.pbradygeorgen.com/webhook"

# Array of webhook paths to warm up
declare -a webhooks=(
  "crew-captain-jean-luc-picard"
  "crew-commander-william-riker"
  "crew-commander-data"
  "crew-geordi-la-forge"
  "crew-lieutenant-worf"
  "crew-counselor-deanna-troi"
  "crew-dr-beverly-crusher"
  "crew-lieutenant-uhura"
  "crew-chief-obrien"
  "crew-quark"
  "coordination-democratic-collaboration"
  "coordination-observation-lounge"
  "knowledge-ingest"
)

success_count=0
fail_count=0

for webhook in "${webhooks[@]}"; do
  echo -n "Warming up: $webhook... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"test": true, "warmup": true, "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' \
    --max-time 10 \
    "$N8N_BASE_URL/$webhook" 2>&1)
  
  if [ "$response" = "200" ] || [ "$response" = "201" ]; then
    echo "✅ Success (HTTP $response)"
    ((success_count++))
  else
    echo "⚠️  HTTP $response (may need manual trigger)"
    ((fail_count++))
  fi
  
  # Small delay to avoid overwhelming n8n
  sleep 1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  WARMUP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Success: $success_count / ${#webhooks[@]}"
echo "Pending: $fail_count / ${#webhooks[@]}"
echo ""
echo "Re-running the test script now should show improved results!"
echo ""
