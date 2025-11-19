# 🖖 Alex AI Cursor Chat Startup Prompt

**Copy this prompt into Cursor AI chat to automatically activate Alex AI with full crew memory context.**

---

## 🚀 Quick Start

1. Run the memory loader:
   ```bash
   node scripts/load-crew-memories.js
   ```

2. Copy the output below into Cursor AI chat

3. Or use this template and the script will auto-populate memories

---

## 📋 Startup Prompt Template

```
🖖 Activate Alex AI with Full Crew Memory Context

I'm starting a new Cursor AI chat session and want to include Alex AI crew coordination with full memory context.

Please:
1. Load all crew member memories from our Supabase RAG system
2. Activate Alex AI crew coordination mode
3. Include the following crew members in context:
   - 🎖️ Captain Picard (Strategic leadership)
   - ⚡ Commander Riker (Tactical operations)
   - 🤖 Commander Data (Technical analysis)
   - 🔧 Lieutenant Commander La Forge (Infrastructure)
   - ⚔️ Lieutenant Worf (Security)
   - 💭 Counselor Troi (User experience)
   - 💊 Dr. Crusher (System health)
   - 📻 Lieutenant Uhura (Communication)
   - 💰 Quark (Business optimization)
   - 🛠️ Chief O'Brien (Pragmatic solutions)

4. Maintain chat memory persistence throughout this session
5. Reference previous conversations and decisions from crew memories

[CREW_MEMORIES_PLACEHOLDER - Will be replaced by load-crew-memories.js output]

Current project context:
- Repository: alex-ai-universal
- Working on: Dashboard development and memory system
- Recent focus: Fixing dashboard startup issues, n8n integration

Let's continue our work with full crew coordination! 🖖
```

---

## 🔄 Auto-Load Script

Run this before starting Cursor AI:

```bash
# Load memories and generate prompt
node scripts/load-crew-memories.js > .cursor/alex-ai/current-prompt.md

# Then copy the contents of .cursor/alex-ai/current-prompt.md into Cursor AI
```

---

## 💡 Memory Persistence Recommendations

### 1. **Regular Memory Sync**
- Run `load-crew-memories.js` at the start of each session
- Update memories after significant milestones
- Store session summaries in crew memories

### 2. **Context Preservation**
- Reference previous decisions in new conversations
- Include relevant file paths and code references
- Maintain project state awareness

### 3. **Crew Coordination**
- Always mention which crew members should be consulted
- Reference their previous recommendations
- Build on their accumulated knowledge

### 4. **Session Continuity**
- Start each session with: "Continuing from previous session..."
- Reference specific previous conversations
- Include relevant context from crew memories

---

## 📝 Usage Examples

### Example 1: Starting New Session
```
🖖 Activate Alex AI

[Paste crew memories output here]

I'm continuing work on the dashboard. Last session we fixed TypeScript return types. 
What should we tackle next?
```

### Example 2: Referencing Previous Work
```
🖖 Activate Alex AI

[Paste crew memories output here]

We previously discussed [specific topic from memories]. 
Commander Data recommended [specific recommendation]. 
Let's implement that now.
```

### Example 3: Milestone Check-in
```
🖖 Activate Alex AI

[Paste crew memories output here]

We just completed [milestone]. Should we:
1. Store this in crew memories?
2. Make a milestone push?
3. Continue with next steps?
```

---

## 🔧 Advanced: Auto-Load on Cursor Startup

Create a Cursor AI workspace setting to auto-load memories:

1. Create `.cursor/settings.json`:
```json
{
  "alex-ai": {
    "autoLoadMemories": true,
    "memoryScript": "scripts/load-crew-memories.js",
    "updateInterval": 3600000
  }
}
```

2. Use a Cursor AI extension or custom command to auto-inject memories

---

## 📊 Memory Statistics

After loading memories, you'll see:
- Total memories per crew member
- Most recent memories
- Knowledge type distribution
- Key findings and recommendations

---

**Last Updated**: 2025-11-19  
**Memory System**: Supabase RAG via n8n workflows

