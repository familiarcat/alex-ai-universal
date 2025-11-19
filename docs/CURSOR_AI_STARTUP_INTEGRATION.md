# 🖖 Cursor AI Startup Integration Guide

**How Alex AI automatically loads on Cursor AI startup**

---

## 🎯 Overview

Alex AI crew memories are now automatically loaded when you open the workspace in Cursor AI. This ensures you always have the latest crew context available.

---

## ⚙️ How It Works

### Automatic Tasks (VS Code/Cursor Compatible)

**File**: `.vscode/tasks.json`

Three tasks are configured:
1. **Load Crew Memories** - Runs on folder open
2. **Generate Prompt** - Creates startup prompt
3. **Alex AI Startup** - Runs both sequentially on folder open

### Cursor AI Settings

**File**: `.cursor/settings.json`

- `autoLoadMemories`: true
- `autoGeneratePrompt`: true
- `onStartup`: ["load-memories", "generate-prompt"]

### Startup Script

**File**: `scripts/cursor-startup.sh`

Bash script that:
- Loads crew memories
- Generates startup prompt
- Provides status feedback

---

## 🚀 What Happens on Startup

1. **Cursor AI opens workspace**
2. **Task runs automatically** (if configured)
3. **Crew memories load** from Supabase
4. **Startup prompt generated**
5. **Saved to** `.cursor/alex-ai/cursor-startup-prompt.md`

---

## 📋 Manual Commands

### Via Command Palette

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "Alex AI"
3. Select command:
   - "🖖 Load Alex AI Crew Memories"
   - "🖖 Generate Alex AI Cursor Prompt"
   - "🖖 Alex AI Full Startup"

### Via Terminal

```bash
# Load memories
npm run cursor:memories

# Generate prompt
npm run cursor:prompt

# Full startup
bash scripts/cursor-startup.sh
```

### Via Tasks

1. Press `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Type: "Tasks: Run Task"
3. Select: "🖖 Alex AI Startup"

---

## 🔧 Configuration Options

### Disable Auto-Load

Edit `.vscode/tasks.json`:
```json
{
  "runOptions": {
    "runOn": "never"  // Change from "folderOpen"
  }
}
```

Or edit `.cursor/settings.json`:
```json
{
  "alex-ai": {
    "autoLoadMemories": false
  }
}
```

### Change Update Interval

Edit `.cursor/settings.json`:
```json
{
  "alex-ai": {
    "updateInterval": 1800000  // 30 minutes (in milliseconds)
  }
}
```

### Custom Output Directory

Edit `.cursor/settings.json`:
```json
{
  "alex-ai": {
    "outputDirectory": ".cursor/custom-path"
  }
}
```

---

## 🐛 Troubleshooting

### Auto-Load Not Working

1. **Check task configuration**:
   - Open `.vscode/tasks.json`
   - Verify `runOn: "folderOpen"` is set

2. **Check Cursor AI settings**:
   - Open `.cursor/settings.json`
   - Verify `autoLoadMemories: true`

3. **Run manually**:
   ```bash
   npm run cursor:prompt
   ```

### Tasks Not Running

1. **Enable task auto-detect**:
   - Cursor AI Settings → Tasks → Auto Detect: On

2. **Check task panel**:
   - View → Terminal → Tasks
   - Look for errors

3. **Run task manually**:
   - Command Palette → "Tasks: Run Task"

### Memory Loading Fails

1. **Check Supabase credentials**:
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Test connection**:
   ```bash
   npm run cursor:memories
   ```

3. **Check network**:
   - Verify internet connection
   - Check Supabase status

---

## 📊 Startup Flow

```
Cursor AI Opens
      ↓
Workspace Detected
      ↓
Tasks Run (if configured)
      ↓
Load Crew Memories
      ↓
Generate Startup Prompt
      ↓
Save to .cursor/alex-ai/
      ↓
Ready for Chat!
```

---

## 💡 Best Practices

1. **Let auto-load run** - Don't interrupt the startup process
2. **Check prompt file** - Verify `.cursor/alex-ai/cursor-startup-prompt.md` exists
3. **Refresh if needed** - Run `npm run cursor:prompt` if memories seem stale
4. **Store milestones** - After major work, store in crew memories
5. **Reference memories** - Use crew member names in chat

---

## 🔄 Workflow

### Morning Routine:
1. Open Cursor AI
2. Wait for auto-load (or run manually)
3. Open chat
4. Paste startup prompt
5. Start working!

### During Development:
- Memories are already loaded
- Reference crew members directly
- Store important decisions

### End of Session:
- Store session summary in memories
- Run `npm run cursor:prompt` to refresh
- Next session will have updated context

---

## 📚 Related Files

- `.vscode/tasks.json` - Automatic tasks
- `.cursor/settings.json` - Cursor AI settings
- `.vscode/settings.json` - Workspace settings
- `scripts/cursor-startup.sh` - Startup script
- `scripts/load-crew-memories.js` - Memory loader
- `scripts/generate-cursor-prompt.js` - Prompt generator

---

## 🎯 Next Steps

1. **Test auto-load**: Open workspace and verify tasks run
2. **Check output**: Verify `.cursor/alex-ai/cursor-startup-prompt.md` exists
3. **Use in chat**: Copy prompt into Cursor AI chat
4. **Customize**: Adjust settings as needed

---

**Last Updated**: 2025-11-19  
**Status**: ✅ Ready for use

