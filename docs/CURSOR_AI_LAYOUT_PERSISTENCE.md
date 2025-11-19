# 📐 Cursor AI Layout Persistence Guide

**Save and automatically restore your Cursor AI screen layout**

---

## 🎯 Overview

Cursor AI doesn't have built-in layout persistence, but we've created a system to capture and restore your preferred workspace layout automatically.

---

## 🚀 Quick Start

### Capture Current Layout

```bash
npm run cursor:layout:capture
```

This saves your current layout to `.cursor/workspace-layout.json`.

### Restore Saved Layout

```bash
npm run cursor:layout:restore
```

This restores your saved layout configuration.

---

## ⚙️ Automatic Restoration

### On Workspace Open

Layout is automatically restored when you open the workspace:

1. **Task runs automatically** (configured in `.vscode/tasks.json`)
2. **Layout preferences loaded** from `.cursor/workspace-layout.json`
3. **Settings updated** in `.cursor/settings.json`
4. **Manual restoration** via Command Palette if needed

### Configuration

Edit `.cursor/settings.json`:

```json
{
  "layout": {
    "autoRestore": true,
    "layoutFile": ".cursor/workspace-layout.json",
    "restoreOnStartup": true
  }
}
```

---

## 📋 What Gets Saved

The layout capture saves:

- **Panel Visibility**: Sidebar, bottom panel, status bar
- **Panel Positions**: Left/right sidebar, bottom panel
- **Panel Sizes**: Width, height
- **View Visibility**: Explorer, Search, Source Control, Cursor Chat, etc.
- **Editor Groups**: Layout configuration
- **Window State**: Zoom level, theme preferences

---

## 🛠️ Manual Commands

### Via Command Palette

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "Tasks: Run Task"
3. Select:
   - "📐 Restore Cursor AI Layout"
   - "📐 Capture Cursor AI Layout" (if added as task)

### Via Terminal

```bash
# Capture current layout
npm run cursor:layout:capture

# Restore saved layout
npm run cursor:layout:restore
```

---

## 📁 Files

- **`.cursor/workspace-layout.json`** - Saved layout configuration
- **`.cursor/settings.json`** - Layout preferences
- **`.vscode/tasks.json`** - Automatic restoration task

---

## 💡 Usage Workflow

### Initial Setup

1. **Arrange your layout** in Cursor AI:
   - Position sidebar (left/right)
   - Show/hide panels
   - Configure views
   - Set panel sizes

2. **Capture the layout**:
   ```bash
   npm run cursor:layout:capture
   ```

3. **Verify**:
   ```bash
   cat .cursor/workspace-layout.json
   ```

### Daily Use

1. **Open workspace** - Layout auto-restores
2. **If needed, manually restore**:
   - Command Palette → "View: Restore Editor Layout"
   - Or: `npm run cursor:layout:restore`

### Updating Layout

1. **Adjust layout** as needed
2. **Re-capture**:
   ```bash
   npm run cursor:layout:capture
   ```

---

## 🔧 Advanced Configuration

### Custom Layout File

Edit `.cursor/settings.json`:

```json
{
  "layout": {
    "layoutFile": ".cursor/custom-layout.json"
  }
}
```

### Disable Auto-Restore

Edit `.cursor/settings.json`:

```json
{
  "layout": {
    "autoRestore": false
  }
}
```

### Multiple Layouts

Save different layouts:

```bash
# Save current as default
npm run cursor:layout:capture

# Save as specific layout
node scripts/capture-cursor-layout.js > .cursor/layout-dev.json
node scripts/capture-cursor-layout.js > .cursor/layout-debug.json
```

---

## 📊 Layout Structure

The layout file (`.cursor/workspace-layout.json`) contains:

```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-19T...",
  "panels": {
    "sidebar": {
      "visible": true,
      "position": "left",
      "width": 250
    },
    "bottomPanel": {
      "visible": true,
      "height": 200
    }
  },
  "views": {
    "explorer": true,
    "search": false,
    "sourceControl": true,
    "cursorChat": true
  }
}
```

---

## 🐛 Troubleshooting

### Layout Not Restoring

1. **Check layout file exists**:
   ```bash
   ls -la .cursor/workspace-layout.json
   ```

2. **Verify task is configured**:
   - Open `.vscode/tasks.json`
   - Check "Restore Cursor AI Layout" task

3. **Run manually**:
   ```bash
   npm run cursor:layout:restore
   ```

### Layout File Corrupted

1. **Delete corrupted file**:
   ```bash
   rm .cursor/workspace-layout.json
   ```

2. **Capture new layout**:
   ```bash
   npm run cursor:layout:capture
   ```

### Task Not Running

1. **Enable task auto-detect**:
   - Cursor AI Settings → Tasks → Auto Detect: On

2. **Run task manually**:
   - Command Palette → "Tasks: Run Task" → "📐 Restore Cursor AI Layout"

---

## 💡 Best Practices

1. **Capture after major layout changes** - Keep layout file up to date
2. **Version control layout file** - Commit `.cursor/workspace-layout.json` to git
3. **Share with team** - Team members can use same layout
4. **Backup layouts** - Save multiple layout files for different workflows

---

## 🔄 Integration with Startup

Layout restoration is integrated with Alex AI startup:

1. **Workspace opens**
2. **Tasks run** (configured in `.vscode/tasks.json`):
   - Load crew memories
   - Generate prompt
   - **Restore layout** ← New!
3. **Ready to work!**

---

## 📚 Related Documentation

- `docs/CURSOR_AI_STARTUP_INTEGRATION.md` - Startup integration
- `docs/CURSOR_AI_MEMORY_PERSISTENCE.md` - Memory persistence
- `.vscode/tasks.json` - Automatic tasks

---

## 🎯 Example Session

```bash
# 1. Arrange your perfect layout in Cursor AI
#    - Sidebar on left
#    - Bottom panel visible
#    - Explorer open
#    - Cursor Chat visible

# 2. Capture it
npm run cursor:layout:capture
# ✅ Layout captured successfully!

# 3. Close and reopen workspace
#    Layout automatically restores!

# 4. Or restore manually
npm run cursor:layout:restore
# ✅ Layout restored!
```

---

**Last Updated**: 2025-11-19  
**Status**: ✅ Ready for use

