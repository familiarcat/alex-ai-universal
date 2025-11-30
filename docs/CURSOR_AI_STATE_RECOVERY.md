# 🔄 Cursor AI State Recovery System

**Comprehensive state recovery after Cursor AI restart**

---

## 🎯 Overview

When Cursor AI closes and reopens, some state is lost. This system captures and recovers as much state as possible automatically.

---

## 🚀 Quick Start

### Capture State (Before Closing)

```bash
npm run cursor:state:capture
```

This saves complete workspace state to `.cursor/workspace-state.json`.

### Recover State (On Startup)

State recovery runs automatically when you open the workspace. Or run manually:

```bash
npm run cursor:state:recover
```

---

## ⚙️ Automatic Recovery

### On Workspace Open

The following tasks run automatically (configured in `.vscode/tasks.json`):

1. **🔄 Recover Cursor AI State** - Detects what's missing
2. **📐 Restore Cursor AI Layout** - Restores panel layout
3. **🖖 Load Alex AI Crew Memories** - Loads memories
4. **🖖 Generate Alex AI Cursor Prompt** - Generates prompt

### What Gets Recovered

- ✅ **Layout** - Panel positions, visibility, sizes
- ✅ **Alex AI Memories** - Crew memories from Supabase
- ✅ **Alex AI Prompt** - Startup prompt
- ✅ **Workspace Configuration** - Settings and preferences
- ⚠️ **Open Files** - Instructions provided (can't auto-open)
- ❌ **Terminals** - Cannot be restored (must reopen manually)
- ❌ **Chat History** - Managed by Cursor AI (not recoverable)

---

## 📋 State Capture

### What Gets Captured

The state capture saves:

- **Layout Configuration** - From layout capture
- **Open Files** - List of open files (for reference)
- **Editor State** - Active editor, cursor positions
- **Panel Visibility** - Sidebar, bottom panel, status bar
- **View Visibility** - Explorer, Search, Source Control, etc.
- **Alex AI State** - Memories and prompt status
- **Recovery Metadata** - What can and cannot be recovered

### Capture Before Closing

**Best Practice**: Capture state before closing Cursor AI:

```bash
npm run cursor:state:capture
```

Or add to your workflow:
- Before closing workspace
- Before switching projects
- Periodically during work

---

## 🔄 Recovery Process

### Automatic Recovery Flow

```
Cursor AI Opens
      ↓
Tasks Run (folderOpen)
      ↓
1. Recover State (detect what's missing)
      ↓
2. Restore Layout
      ↓
3. Load Alex AI Memories
      ↓
4. Generate Alex AI Prompt
      ↓
State Fully Recovered!
```

### Manual Recovery

If automatic recovery doesn't work:

```bash
# 1. Recover state
npm run cursor:state:recover

# 2. Restore layout
npm run cursor:layout:restore

# 3. Load memories
npm run cursor:memories

# 4. Generate prompt
npm run cursor:prompt
```

---

## 📊 Recovery Report

After recovery, a report is saved to `.cursor/recovery-report.json`:

```json
{
  "stateFileExists": true,
  "layoutFileExists": true,
  "memoriesExist": true,
  "promptExists": true,
  "recovered": [
    "Layout configuration",
    "Alex AI memories",
    "Alex AI prompt"
  ],
  "missing": [],
  "instructions": []
}
```

---

## 🛠️ NPM Scripts

- `npm run cursor:state:capture` - Capture complete state
- `npm run cursor:state:recover` - Recover state and detect missing items
- `npm run cursor:layout:capture` - Capture layout only
- `npm run cursor:layout:restore` - Restore layout only

---

## 💡 Usage Workflow

### Daily Workflow

1. **Start Work**:
   - Open Cursor AI workspace
   - State auto-recovers
   - Verify recovery in terminal output

2. **During Work**:
   - State is maintained in memory
   - No action needed

3. **Before Closing**:
   - Run: `npm run cursor:state:capture`
   - Or let auto-capture handle it (if configured)

4. **After Restart**:
   - Open workspace
   - State auto-recovers
   - Continue where you left off

### Recovery Verification

After opening workspace, check terminal for:

```
🔄 Recovering Cursor AI State...
✅ State file found
✅ Layout: Available for restoration
✅ Alex AI Memories: Found
✅ Alex AI Prompt: Found
```

---

## 🔧 Advanced Configuration

### Custom State Capture

Edit `scripts/capture-cursor-state.js` to add custom state:

```javascript
workspaceState.custom = {
  // Your custom state
};
```

### Recovery Priority

Edit recovery priority in state file:

```json
{
  "recovery": {
    "recoveryPriority": ["layout", "files", "panels", "views"]
  }
}
```

### Disable Auto-Recovery

Edit `.vscode/tasks.json`:

```json
{
  "runOptions": {
    "runOn": "never"  // Change from "folderOpen"
  }
}
```

---

## 🐛 Troubleshooting

### State Not Recovering

1. **Check state file exists**:
   ```bash
   ls -la .cursor/workspace-state.json
   ```

2. **Verify tasks are configured**:
   - Open `.vscode/tasks.json`
   - Check "🔄 Recover Cursor AI State" task

3. **Run manually**:
   ```bash
   npm run cursor:state:recover
   ```

### Missing State File

If state file is missing:

1. **Capture current state**:
   ```bash
   npm run cursor:state:capture
   ```

2. **Verify capture**:
   ```bash
   cat .cursor/workspace-state.json
   ```

### Layout Not Restoring

1. **Check layout file**:
   ```bash
   ls -la .cursor/workspace-layout.json
   ```

2. **Restore manually**:
   ```bash
   npm run cursor:layout:restore
   ```

### Alex AI State Missing

If memories or prompt are missing:

1. **Load memories**:
   ```bash
   npm run cursor:memories
   ```

2. **Generate prompt**:
   ```bash
   npm run cursor:prompt
   ```

---

## 📁 Files

- **`.cursor/workspace-state.json`** - Complete state capture
- **`.cursor/workspace-layout.json`** - Layout configuration
- **`.cursor/recovery-report.json`** - Recovery report (generated)
- **`scripts/capture-cursor-state.js`** - State capture script
- **`scripts/recover-cursor-state.js`** - State recovery script

---

## 🎯 What Can and Cannot Be Recovered

### ✅ Can Be Recovered

- Layout (panels, views, positions)
- Alex AI memories
- Alex AI prompt
- Workspace settings
- Open files list (instructions to reopen)

### ⚠️ Partially Recoverable

- Open files (can provide list, but can't auto-open)
- Editor groups (can restore layout, not exact files)

### ❌ Cannot Be Recovered

- Terminal state (must reopen manually)
- Chat history (managed by Cursor AI)
- Unsaved editor changes (Cursor AI handles this)
- Cursor positions (Cursor AI may remember)

---

## 💡 Best Practices

1. **Capture before closing** - Run `npm run cursor:state:capture` before closing
2. **Verify recovery** - Check terminal output after opening
3. **Keep state file in git** - Commit `.cursor/workspace-state.json` (optional)
4. **Regular captures** - Capture state periodically during work
5. **Check recovery report** - Review `.cursor/recovery-report.json` if issues

---

## 🔄 Integration with Startup

State recovery is fully integrated with Alex AI startup:

1. **Workspace opens**
2. **Tasks run automatically**:
   - Recover state (detect missing items)
   - Restore layout
   - Load memories
   - Generate prompt
3. **State fully recovered!**

---

## 📚 Related Documentation

- `docs/CURSOR_AI_STARTUP_INTEGRATION.md` - Startup integration
- `docs/CURSOR_AI_LAYOUT_PERSISTENCE.md` - Layout persistence
- `docs/CURSOR_AI_MEMORY_PERSISTENCE.md` - Memory persistence

---

**Last Updated**: 2025-11-19  
**Status**: ✅ Fully Integrated

