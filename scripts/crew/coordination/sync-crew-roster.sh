#!/bin/bash

# 🖖 Alex AI Crew Roster Sync Script
# Syncs crew member data from n8n.pbradygeorgen.com
# Updates crew-roster.json with live data

set -e

echo "🖖 Alex AI Crew Roster Sync"
echo "============================"
echo ""

# Load credentials (suppress output)
if [ -z "$N8N_API_KEY" ]; then
  source ~/.zshrc >/dev/null 2>&1 || true
fi

if [ -z "$N8N_API_KEY" ]; then
  echo "❌ Error: N8N_API_KEY not found in environment"
  echo "   Please ensure ~/.zshrc contains N8N_API_KEY"
  exit 1
fi

echo "✅ Credentials loaded"
echo "🌐 n8n Instance: https://n8n.pbradygeorgen.com"
echo ""

# Fetch crew workflows
echo "📡 Fetching crew workflows..."
CREW_DATA=$(curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "https://n8n.pbradygeorgen.com/api/v1/workflows")

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to fetch workflows from n8n"
  exit 1
fi

# Count active crew members
TOTAL_ACTIVE=$(echo "$CREW_DATA" | jq '[.data[] | select(.name | test("CREW -|Quark -|LCARS")) | select(.active == true)] | length')
TOTAL_CREW=$(echo "$CREW_DATA" | jq '[.data[] | select(.name | test("CREW -|Quark -|LCARS"))] | length')

echo "✅ Found $TOTAL_ACTIVE active crew members (out of $TOTAL_CREW total)"
echo ""

# Display crew roster
echo "👥 ACTIVE CREW MEMBERS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$CREW_DATA" | jq -r '
  .data[] | 
  select(.name | test("CREW -|Quark -|LCARS")) | 
  select(.active == true) | 
  "  🟢 \(.name | sub("CREW - "; "") | sub(" - OpenRouter - Production"; ""))\n     ID: \(.id) | Nodes: \(.nodes | length) | Updated: \(.updatedAt[:10])"
' | head -n 60

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save detailed JSON
ROSTER_FILE="crew-roster.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "💾 Updating $ROSTER_FILE..."

# Extract and format crew data
echo "$CREW_DATA" | jq --arg timestamp "$TIMESTAMP" '{
  version: "1.0.0",
  lastUpdated: $timestamp,
  n8nInstance: "https://n8n.pbradygeorgen.com",
  totalCrewMembers: ([.data[] | select(.name | test("CREW -|Quark -|LCARS"))] | length),
  activeCrewMembers: ([.data[] | select(.name | test("CREW -|Quark -|LCARS")) | select(.active == true)] | length),
  crewMembers: [
    .data[] | 
    select(.name | test("CREW -|Quark -|LCARS")) | 
    {
      id: .id,
      name: (.name | sub("CREW - "; "") | sub(" - OpenRouter - Production"; "") | sub(" - Real-time Preview"; "") | sub(" - LLM Optimization"; "") | sub(" (OpenRouter Optimized)"; "")),
      fullName: .name,
      status: (if .active then "active" else "inactive" end),
      workflowUrl: ("https://n8n.pbradygeorgen.com/workflow/" + .id),
      nodes: (.nodes | length),
      lastUpdated: .updatedAt[:10],
      active: .active
    }
  ] | sort_by(.name)
}' > "$ROSTER_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Roster file updated: $ROSTER_FILE"
else
  echo "❌ Error: Failed to update roster file"
  exit 1
fi

# Summary
echo ""
echo "📊 SYNC SUMMARY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Total Crew Members: $TOTAL_CREW"
echo "  Active: $TOTAL_ACTIVE"
echo "  Inactive: $(($TOTAL_CREW - $TOTAL_ACTIVE))"
echo "  Roster File: $ROSTER_FILE"
echo "  Last Sync: $TIMESTAMP"
echo ""
echo "🖖 Crew roster sync complete!"

