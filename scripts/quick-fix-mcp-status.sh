#!/bin/bash
# Quick fix script to verify MCP status setup

echo "🖖 MCP Status Quick Fix"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f "dashboard/.env.local" ]; then
  echo "❌ dashboard/.env.local not found"
  echo "   Run: node scripts/setup-dashboard-env.js"
  exit 1
fi

echo "✅ dashboard/.env.local exists"
echo ""

# Check if Supabase key is set
if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-" dashboard/.env.local; then
  echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY needs to be configured"
  echo "   Edit dashboard/.env.local and replace 'your-supabase-anon-key-here'"
else
  echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be configured"
fi

# Check if OpenRouter key is set
if grep -q "OPENROUTER_API_KEY=your-" dashboard/.env.local; then
  echo "⚠️  OPENROUTER_API_KEY needs to be configured"
  echo "   Edit dashboard/.env.local and replace 'your-openrouter-api-key-here'"
else
  echo "✅ OPENROUTER_API_KEY appears to be configured"
fi

echo ""
echo "💡 Next: Restart your Next.js dev server"
echo "   cd dashboard && npm run dev"
