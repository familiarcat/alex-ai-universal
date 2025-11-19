# 🖖 VS Code / Cursor AI Workspace Configuration

**Alex AI automatic startup tasks**

---

## 📋 Files

- **`tasks.json`** - Automatic tasks that run on workspace open
- **`settings.json`** - Workspace settings for Alex AI

---

## 🚀 Automatic Startup

When you open this workspace, the following tasks run automatically:

1. **🖖 Load Alex AI Crew Memories** - Loads memories from Supabase
2. **🖖 Generate Alex AI Cursor Prompt** - Creates startup prompt
3. **🖖 Alex AI Startup** - Runs both sequentially

---

## ⚙️ Configuration

Tasks are configured to run on `folderOpen`. To disable:

Edit `.vscode/tasks.json`:
```json
{
  "runOptions": {
    "runOn": "never"  // Change from "folderOpen"
  }
}
```

---

## 💡 Manual Execution

Run tasks manually via Command Palette:
1. `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Type: "Tasks: Run Task"
3. Select: "🖖 Alex AI Startup"

---

## 📝 Note

This directory is typically git-ignored. If you want to share these settings:
- Add exception to `.gitignore`: `!.vscode/tasks.json`
- Or commit manually: `git add -f .vscode/tasks.json`

---

**Last Updated**: 2025-11-19

