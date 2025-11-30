# 🖖 Cursor AI Startup - Alex AI Auto-Load

**This file triggers automatic Alex AI memory loading when Cursor AI opens**

---

## 🚀 Automatic Startup

When you open this workspace in Cursor AI, the following happens automatically:

1. **Crew memories are loaded** from Supabase
2. **Startup prompt is generated** with all crew context
3. **Prompt is saved** to `.cursor/alex-ai/cursor-startup-prompt.md`

---

## 📋 Manual Commands

If automatic loading doesn't work, you can run manually:

### Via NPM:
```bash
npm run cursor:prompt
```

### Via Cursor AI Command Palette:
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "Alex AI"
3. Select: "🖖 Generate Alex AI Cursor Prompt"

---

## 💡 Usage

1. **Open Cursor AI** - Memories auto-load
2. **Open chat** - Start new conversation
3. **Copy prompt** from `.cursor/alex-ai/cursor-startup-prompt.md`
4. **Paste into chat** - Activate Alex AI with full crew context!

---

## 🔧 Configuration

Settings are in:
- `.cursor/settings.json` - Cursor AI specific settings
- `.vscode/settings.json` - VS Code/Cursor workspace settings
- `.vscode/tasks.json` - Automatic tasks

---

**Last Updated**: 2025-11-19

