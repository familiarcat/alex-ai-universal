#!/bin/bash
# Infrastructure Deployment with Cost Checks

set -e

TF_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COST_THRESHOLD=100

echo "🔍 Running cost analysis before deployment..."
node "$TF_DIR/scripts/cost-analysis.js" "$TF_DIR" > /tmp/terraform-costs.json

COST=$(node -e "const d=require('/tmp/terraform-costs.json');console.log(d.costs?.total||0)")

if (( $(echo "$COST > $COST_THRESHOLD" | bc -l) )); then
  echo "⚠️  WARNING: Estimated monthly cost ($$COST) exceeds threshold ($$COST_THRESHOLD)"
  echo "Press Enter to continue or Ctrl+C to abort..."
  read
fi

echo "✅ Cost check passed. Proceeding with deployment..."
terraform apply
