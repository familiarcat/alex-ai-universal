#!/bin/bash

# 🛡️ Alex AI Cursor Spell Check Installation Script
# 
# This script installs the Alex AI Cursor Spell Check extension
# for real-time spell checking in Cursor AI chat input

set -e

echo "🛡️ Alex AI Cursor Spell Check Installation"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Please run this script from the Alex AI Universal root directory"
    exit 1
fi

print_info "Installing Alex AI Cursor Spell Check extension..."

# Step 1: Navigate to extension directory
print_info "Step 1: Setting up extension directory"
cd packages/cursor-spell-check-extension

# Step 2: Install dependencies
print_info "Step 2: Installing dependencies"
npm install
print_status "Dependencies installed"

# Step 3: Compile TypeScript
print_info "Step 3: Compiling TypeScript"
npm run compile
print_status "TypeScript compiled"

# Step 4: Package extension
print_info "Step 4: Packaging extension"
npx vsce package --out alex-ai-cursor-spell-check.vsix
print_status "Extension packaged"

# Step 5: Install extension
print_info "Step 5: Installing extension in Cursor AI"
code --install-extension alex-ai-cursor-spell-check.vsix
print_status "Extension installed"

# Step 6: Create activation script
print_info "Step 6: Creating activation script"
cat > ../../scripts/activate-cursor-spell-check.sh << 'EOF'
#!/bin/bash

# Activate Alex AI Cursor Spell Check
echo "🛡️ Activating Alex AI Cursor Spell Check..."

# Open Cursor AI with the extension
code --extension-dir ~/.vscode/extensions

echo "✅ Alex AI Cursor Spell Check activated!"
echo "🛡️ Real-time spell checking is now active in Cursor AI chat input"
echo "🎯 Look for the Alex AI status bar indicator"
echo ""
echo "Features:"
echo "  • Real-time spell checking"
echo "  • Alex AI branding and indicators"
echo "  • Context-aware suggestions"
echo "  • Custom dictionary support"
echo "  • Zero-Artifact Guarantee"
echo ""
echo "Commands:"
echo "  • Toggle spell check: Ctrl+Shift+P > 'Alex AI Spell Check: Toggle'"
echo "  • Add to dictionary: Right-click on word > 'Add to Dictionary'"
echo "  • Show suggestions: Right-click on word > 'Show Suggestions'"
EOF

chmod +x ../../scripts/activate-cursor-spell-check.sh
print_status "Activation script created"

# Step 7: Create restart instructions
print_info "Step 7: Creating restart instructions"
cat > ../../CURSOR_RESTART_INSTRUCTIONS.md << 'EOF'
# 🛡️ Alex AI Cursor Spell Check - Restart Instructions

## ✅ **INSTALLATION COMPLETE**

The Alex AI Cursor Spell Check extension has been successfully installed!

## 🔄 **RESTART REQUIREMENTS**

### **YES, YOU NEED TO RESTART CURSOR AI**

To see the spell checking effects implemented, you **MUST** restart Cursor AI:

1. **Close Cursor AI completely**
2. **Reopen Cursor AI**
3. **The extension will automatically activate**

### **Why Restart is Required**

- **Extension Loading**: VSCode extensions load during startup
- **Chat Input Override**: The extension needs to override Cursor AI's chat input behavior
- **Real-time Monitoring**: Background processes need to initialize
- **Alex AI Branding**: Status bar and UI elements need to register

### **How to Verify Installation**

After restarting Cursor AI:

1. **Look for Alex AI Status Bar**: You should see "🛡️ Alex AI Spell Check" in the status bar
2. **Open Chat Input**: Start typing in Cursor AI chat
3. **Test Spell Checking**: Type a misspelled word (e.g., "helo" instead of "hello")
4. **See Highlighting**: Misspelled words should be highlighted with wavy red underlines
5. **Hover for Suggestions**: Hover over misspelled words to see suggestions

### **Troubleshooting**

If spell checking doesn't appear after restart:

1. **Check Extension Status**: Go to Extensions and verify "Alex AI Cursor Spell Check" is enabled
2. **Reload Window**: Press `Ctrl+Shift+P` > "Developer: Reload Window"
3. **Check Output**: Go to View > Output > "Alex AI Spell Check" for logs
4. **Toggle Extension**: Press `Ctrl+Shift+P` > "Alex AI Spell Check: Toggle"

### **Features Available After Restart**

- ✅ Real-time spell checking in chat input
- ✅ Alex AI branding and visual indicators
- ✅ Context-aware word suggestions
- ✅ Custom dictionary support
- ✅ Right-click context menu options
- ✅ Status bar integration
- ✅ Zero-Artifact Guarantee maintenance

## 🎯 **NEXT STEPS**

1. **Restart Cursor AI** (required)
2. **Test spell checking** in chat input
3. **Customize settings** via VS Code settings
4. **Add custom words** to dictionary
5. **Enjoy enhanced typing experience** with Alex AI!

---

**"Make it so!"** - Captain Picard

**"The crew has successfully implemented real-time spell checking for Cursor AI!"** - Commander Data

**"Restart Cursor AI to see the spell checking effects!"** - Lt. Cmdr. Geordi
EOF

print_status "Restart instructions created"

# Step 8: Display completion message
print_info "Step 8: Installation complete!"

echo ""
echo "🎉 Alex AI Cursor Spell Check Installation Complete!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo "1. 🔄 RESTART CURSOR AI (Required!)"
echo "2. 🧪 Test spell checking in chat input"
echo "3. 🎯 Look for Alex AI status bar indicator"
echo "4. 📚 Add custom words to dictionary"
echo ""
echo "🛡️ Features Installed:"
echo "  • Real-time spell checking"
echo "  • Alex AI branding and indicators"
echo "  • Context-aware suggestions"
echo "  • Custom dictionary support"
echo "  • Zero-Artifact Guarantee"
echo ""
echo "📖 See CURSOR_RESTART_INSTRUCTIONS.md for detailed restart instructions"
echo ""

print_status "Alex AI Cursor Spell Check extension successfully installed!"
print_warning "IMPORTANT: You must restart Cursor AI to see the effects!"

echo ""
echo "Make it so! - Captain Picard"
echo "The crew has successfully implemented spell checking for Cursor AI! - Commander Data"
