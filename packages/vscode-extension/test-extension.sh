#!/bin/bash

# Test VS Code Extension with installed VS Code
# Uses the VS Code from Applications folder

echo "🖖 Testing Alex AI VS Code Extension"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Get VS Code path
VSCODE_PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"

if [ ! -f "$VSCODE_PATH" ]; then
    echo "❌ VS Code not found at $VSCODE_PATH"
    echo "Trying alternative location..."
    VSCODE_PATH="/Applications/Visual Studio Code.app/Contents/MacOS/Electron"
fi

if [ ! -f "$VSCODE_PATH" ] && [ ! -d "/Applications/Visual Studio Code.app" ]; then
    echo "❌ VS Code not found. Please install VS Code first."
    exit 1
fi

# Check if code command is available
if command -v code &> /dev/null; then
    VSCODE_CMD="code"
else
    VSCODE_CMD="$VSCODE_PATH"
fi

echo "✅ Using VS Code: $VSCODE_CMD"
echo ""

# Build extension
echo "📦 Building extension..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Create test workspace
TEST_WORKSPACE="/tmp/alex-ai-test-workspace"
mkdir -p "$TEST_WORKSPACE"
echo "// Test file for Alex AI Extension" > "$TEST_WORKSPACE/test.ts"
echo "export function test() {" >> "$TEST_WORKSPACE/test.ts"
echo "  return 'Hello Alex AI';" >> "$TEST_WORKSPACE/test.ts"
echo "}" >> "$TEST_WORKSPACE/test.ts"

echo "📁 Test workspace created at: $TEST_WORKSPACE"
echo ""

# Launch VS Code with extension
echo "🚀 Launching VS Code with extension in development mode..."
echo ""
echo "Instructions:"
echo "1. VS Code will open with the extension loaded"
echo "2. Press Cmd+Shift+P (or Ctrl+Shift+P) to open command palette"
echo "3. Type 'Alex AI' to see available commands"
echo "4. Try 'Alex AI: Open Chat' to test the enhanced chat interface"
echo "5. Try 'Alex AI: Suggest' on the test.ts file"
echo "6. Try 'Alex AI: Status' to check system health"
echo ""
echo "Press Enter to launch VS Code..."
read

if command -v code &> /dev/null; then
    code --extensionDevelopmentPath="$(pwd)" "$TEST_WORKSPACE"
else
    "$VSCODE_PATH" --extensionDevelopmentPath="$(pwd)" "$TEST_WORKSPACE"
fi

echo ""
echo "✅ VS Code launched with extension"
echo ""
echo "To test:"
echo "- Open test.ts file"
echo "- Select some code"
echo "- Run 'Alex AI: Suggest' command"
echo "- Or run 'Alex AI: Open Chat' for full chat interface"

