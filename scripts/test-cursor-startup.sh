#!/bin/bash
# Cursor AI Startup Testing Script
# 
# Automated testing for automatic startup system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🧪 Cursor AI Startup Testing"
echo "============================"
echo ""

# Test 1: Check configuration files
echo "📋 Test 1: Configuration Files"
echo "-------------------------------"
PASS=0
FAIL=0

if [ -f ".vscode/tasks.json" ]; then
  echo "✅ .vscode/tasks.json exists"
  ((PASS++))
else
  echo "❌ .vscode/tasks.json missing"
  ((FAIL++))
fi

if [ -f ".cursorrules" ]; then
  echo "✅ .cursorrules exists"
  ((PASS++))
else
  echo "❌ .cursorrules missing"
  ((FAIL++))
fi

if [ -f ".cursor/settings.json" ]; then
  echo "✅ .cursor/settings.json exists"
  ((PASS++))
else
  echo "❌ .cursor/settings.json missing"
  ((FAIL++))
fi

echo ""

# Test 2: Check tasks configuration
echo "📋 Test 2: Tasks Configuration"
echo "-------------------------------"

TASKS_WITH_RUNON=$(grep -c '"runOn": "folderOpen"' .vscode/tasks.json 2>/dev/null || echo "0")
if [ "$TASKS_WITH_RUNON" -ge "4" ]; then
  echo "✅ Found $TASKS_WITH_RUNON tasks with runOn: folderOpen"
  ((PASS++))
else
  echo "⚠️  Only found $TASKS_WITH_RUNON tasks with runOn: folderOpen (expected at least 4)"
  ((FAIL++))
fi

echo ""

# Test 3: Check state files
echo "📋 Test 3: State Files"
echo "----------------------"

if [ -f ".cursor/workspace-state.json" ]; then
  echo "✅ workspace-state.json exists"
  ((PASS++))
else
  echo "⚠️  workspace-state.json missing (run: npm run cursor:state:capture)"
  ((FAIL++))
fi

if [ -f ".cursor/workspace-layout.json" ]; then
  echo "✅ workspace-layout.json exists"
  ((PASS++))
else
  echo "⚠️  workspace-layout.json missing (run: npm run cursor:layout:capture)"
  ((FAIL++))
fi

echo ""

# Test 4: Check Alex AI files
echo "📋 Test 4: Alex AI Files"
echo "-----------------------"

if [ -f ".cursor/alex-ai/crew-memories.md" ]; then
  echo "✅ crew-memories.md exists"
  ((PASS++))
else
  echo "⚠️  crew-memories.md missing (will be created on startup)"
  ((FAIL++))
fi

if [ -f ".cursor/alex-ai/cursor-startup-prompt.md" ]; then
  echo "✅ cursor-startup-prompt.md exists"
  ((PASS++))
else
  echo "⚠️  cursor-startup-prompt.md missing (will be created on startup)"
  ((FAIL++))
fi

echo ""

# Test 5: Check NPM scripts
echo "📋 Test 5: NPM Scripts"
echo "---------------------"

if npm run cursor:memories --dry-run > /dev/null 2>&1; then
  echo "✅ cursor:memories script exists"
  ((PASS++))
else
  echo "❌ cursor:memories script missing"
  ((FAIL++))
fi

if npm run cursor:prompt --dry-run > /dev/null 2>&1; then
  echo "✅ cursor:prompt script exists"
  ((PASS++))
else
  echo "❌ cursor:prompt script missing"
  ((FAIL++))
fi

if npm run cursor:layout:restore --dry-run > /dev/null 2>&1; then
  echo "✅ cursor:layout:restore script exists"
  ((PASS++))
else
  echo "❌ cursor:layout:restore script missing"
  ((FAIL++))
fi

if npm run cursor:state:recover --dry-run > /dev/null 2>&1; then
  echo "✅ cursor:state:recover script exists"
  ((PASS++))
else
  echo "❌ cursor:state:recover script missing"
  ((FAIL++))
fi

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ "$FAIL" -eq "0" ]; then
  echo "🎉 All tests passed! System is ready for testing."
  echo ""
  echo "💡 Next steps:"
  echo "   1. Capture state: npm run cursor:state:capture"
  echo "   2. Capture layout: npm run cursor:layout:capture"
  echo "   3. Close and reopen Cursor AI to test automatic startup"
  exit 0
else
  echo "⚠️  Some tests failed. Please fix issues before testing."
  echo ""
  echo "💡 Recommended fixes:"
  if [ ! -f ".cursor/workspace-state.json" ]; then
    echo "   • Run: npm run cursor:state:capture"
  fi
  if [ ! -f ".cursor/workspace-layout.json" ]; then
    echo "   • Run: npm run cursor:layout:capture"
  fi
  exit 1
fi

