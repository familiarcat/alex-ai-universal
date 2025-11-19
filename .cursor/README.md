# 🖖 Cursor AI - Alex AI Integration

**Quick reference for using Alex AI crew memories in Cursor AI chat**

---

## 🚀 Quick Start

### Option 1: Generate Complete Prompt (Recommended)
```bash
npm run cursor:prompt
```
Then copy contents of `.cursor/alex-ai/cursor-startup-prompt.md` into Cursor AI chat.

### Option 2: Load Just Memories
```bash
npm run cursor:memories
```
Copy the output and paste into Cursor AI chat with: "🖖 Activate Alex AI with these crew memories"

---

## 📁 Files

- **`alex-ai-startup-prompt.md`** - Template and instructions
- **`alex-ai/cursor-startup-prompt.md`** - Generated prompt (run `npm run cursor:prompt`)
- **`alex-ai/crew-memories-latest.md`** - Latest crew memories

---

## 💡 Usage

1. **Before each session**: Run `npm run cursor:prompt`
2. **Copy the generated prompt** from `.cursor/alex-ai/cursor-startup-prompt.md`
3. **Paste into Cursor AI chat** to activate Alex AI with full crew context
4. **Start working** with all crew memories loaded

---

## 🔄 Memory Updates

Memories are automatically loaded from Supabase RAG system. To refresh:
```bash
npm run cursor:memories
```

---

## 📚 Full Documentation

See `docs/CURSOR_AI_MEMORY_PERSISTENCE.md` for complete guide.

