#!/usr/bin/env bash

##############################################################################
# 🖖 Milestone Completeness Verification
# 
# Verifies that the milestone is complete and all components are in place
# for future reference.
# 
# Milestone: quark-riker-integration-openrouter-automation
# Tag: milestone-2025-11-23-quark-riker-integration-openrouter-automation
##############################################################################

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖖 MILESTONE COMPLETENESS VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Milestone: quark-riker-integration-openrouter-automation"
echo "Tag: milestone-2025-11-23-quark-riker-integration-openrouter-automation"
echo ""

ERRORS=0
WARNINGS=0

# Check core integration files
echo "📁 Core Integration Files:"
echo "──────────────────────────────────────────────────────────────────────"

check_file() {
  if [ -f "$1" ]; then
    echo "   ✅ $1"
  else
    echo "   ❌ $1 (MISSING)"
    ((ERRORS++))
  fi
}

check_file "lib/mcp-crew-memories-server.js"
check_file "scripts/utils/mcp-openrouter-optimizer.js"
check_file "scripts/crew/quark-riker-task-optimizer.js"
check_file ".cursor/mcp-config.json"

echo ""

# Check documentation
echo "📚 Documentation Files:"
echo "──────────────────────────────────────────────────────────────────────"

check_file "docs/OPENROUTER_AUTOMATION_SETUP.md"
check_file "docs/OPENROUTER_KEY_MANAGEMENT.md"
check_file "docs/OPENROUTER_SETUP_SUMMARY.md"
check_file "docs/QUARK_RIKER_CREW_INTEGRATION.md"
check_file "docs/QUARK_RIKER_INTEGRATION_SUMMARY.md"
check_file "docs/MILESTONE_REFERENCE_QUARK_RIKER_OPENROUTER.md"

echo ""

# Check scripts
echo "🔧 Script Files:"
echo "──────────────────────────────────────────────────────────────────────"

check_file "scripts/automate-openrouter-key.js"
check_file "scripts/get-openrouter-key.sh"
check_file "scripts/setup-openrouter-automation.sh"
check_file "scripts/verify-openrouter-key.js"
check_file "scripts/test-crew-llm-call.js"
check_file "scripts/test-quark-riker-integration.js"
check_file "scripts/observation-lounge-cinematic.js"

echo ""

# Check MCP tools
echo "🛠️  MCP Tools Verification:"
echo "──────────────────────────────────────────────────────────────────────"

TOOL_COUNT=$(grep -c "name: '" lib/mcp-crew-memories-server.js 2>/dev/null || echo "0")
EXPECTED_TOOLS=7

if [ "$TOOL_COUNT" -ge "$EXPECTED_TOOLS" ]; then
  echo "   ✅ MCP Tools: $TOOL_COUNT registered (expected: $EXPECTED_TOOLS+)"
else
  echo "   ⚠️  MCP Tools: $TOOL_COUNT registered (expected: $EXPECTED_TOOLS)"
  ((WARNINGS++))
fi

# Check for specific tools
TOOLS=("get_crew_memories" "search_crew_memories" "optimize_openrouter_model" "call_openrouter_llm" "optimize_task_assignment" "get_task_assignment" "provide_task_feedback")

for tool in "${TOOLS[@]}"; do
  if grep -q "name: '$tool'" lib/mcp-crew-memories-server.js 2>/dev/null; then
    echo "   ✅ Tool: $tool"
  else
    echo "   ❌ Tool: $tool (MISSING)"
    ((ERRORS++))
  fi
done

echo ""

# Check configuration
echo "⚙️  Configuration:"
echo "──────────────────────────────────────────────────────────────────────"

if grep -q "OPENROUTER_API_KEY" .cursor/mcp-config.json 2>/dev/null; then
  echo "   ✅ MCP Config: OpenRouter env vars present"
else
  echo "   ⚠️  MCP Config: OpenRouter env vars missing"
  ((WARNINGS++))
fi

if grep -q "openrouter" package.json 2>/dev/null; then
  echo "   ✅ Package.json: OpenRouter scripts present"
else
  echo "   ⚠️  Package.json: OpenRouter scripts missing"
  ((WARNINGS++))
fi

echo ""

# Check module loading
echo "🧪 Module Loading Test:"
echo "──────────────────────────────────────────────────────────────────────"

if node -e "require('./lib/mcp-crew-memories-server')" 2>/dev/null; then
  echo "   ✅ MCP Server: Loads successfully"
else
  echo "   ❌ MCP Server: Failed to load"
  ((ERRORS++))
fi

if node -e "require('./scripts/utils/mcp-openrouter-optimizer')" 2>/dev/null; then
  echo "   ✅ OpenRouter Optimizer: Loads successfully"
else
  echo "   ❌ OpenRouter Optimizer: Failed to load"
  ((ERRORS++))
fi

if node -e "require('./scripts/crew/quark-riker-task-optimizer')" 2>/dev/null; then
  echo "   ✅ Quark+Riker Optimizer: Loads successfully"
else
  echo "   ❌ Quark+Riker Optimizer: Failed to load"
  ((ERRORS++))
fi

echo ""

# Check git tag
echo "🏷️  Git Reference:"
echo "──────────────────────────────────────────────────────────────────────"

if git rev-parse "milestone-2025-11-23-quark-riker-integration-openrouter-automation" >/dev/null 2>&1; then
  TAG_COMMIT=$(git rev-parse "milestone-2025-11-23-quark-riker-integration-openrouter-automation")
  echo "   ✅ Milestone tag exists: $TAG_COMMIT"
  echo "   📋 To restore: git checkout milestone-2025-11-23-quark-riker-integration-openrouter-automation"
else
  echo "   ⚠️  Milestone tag not found locally"
  echo "   💡 Tag may be on remote: git fetch --tags"
  ((WARNINGS++))
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ Milestone is COMPLETE and ready for future reference!"
  echo ""
  echo "📋 Reference Document:"
  echo "   docs/MILESTONE_REFERENCE_QUARK_RIKER_OPENROUTER.md"
  echo ""
  echo "🔗 Git Reference:"
  echo "   Tag: milestone-2025-11-23-quark-riker-integration-openrouter-automation"
  echo "   Branch: feature/milestone-push-automation"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Milestone is mostly complete with $WARNINGS warning(s)"
  echo "   Review warnings above"
  echo ""
  exit 0
else
  echo "❌ Milestone has $ERRORS error(s) and $WARNINGS warning(s)"
  echo "   Fix errors before using as reference point"
  echo ""
  exit 1
fi

