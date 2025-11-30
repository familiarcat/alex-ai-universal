#!/bin/bash

# Master script: Setup credentials + Execute crew-coordinated fix
# Handles the full workflow from credential setup to webhook fix

echo "🖖 CREW-COORDINATED N8N WEBHOOK FIX - MASTER EXECUTION"
echo "════════════════════════════════════════════════════════"
echo ""

# Step 1: Check for credentials
echo "🔍 Step 1: Checking for credentials..."
source ~/.zshrc 2>/dev/null

if [ -z "$N8N_EMAIL" ] || [ -z "$N8N_PASSWORD" ]; then
  echo "❌ Credentials not found"
  echo ""
  echo "📋 Please add credentials to ~/.zshrc:"
  echo ""
  echo "   export N8N_EMAIL=\"your-email@example.com\""
  echo "   export N8N_PASSWORD=\"your-password\""
  echo ""
  echo "Then run this script again, or run:"
  echo "   source ~/.zshrc"
  echo "   node scripts/crew-coordinated-n8n-webhook-fix.js"
  echo ""
  exit 1
fi

echo "✅ Credentials found"
echo "   Email: ${N8N_EMAIL:0:10}..."
echo ""

# Step 2: Verify Node.js and dependencies
echo "🔍 Step 2: Verifying environment..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found"
  exit 1
fi

if ! npm list puppeteer &> /dev/null; then
  echo "⚠️  Puppeteer not found, installing..."
  npm install puppeteer
fi

echo "✅ Environment ready"
echo ""

# Step 3: Execute crew-coordinated fix
echo "🚀 Step 3: Executing crew-coordinated webhook fix..."
echo ""
node scripts/crew-coordinated-n8n-webhook-fix.js

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Master execution complete"
else
  echo "⚠️  Execution completed with exit code: $EXIT_CODE"
fi

exit $EXIT_CODE

