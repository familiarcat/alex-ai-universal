# 🖖 Cursor AI Memory Persistence Guide

**How to maintain Alex AI crew context across Cursor AI chat sessions**

---

## 🎯 Overview

This guide explains how to automatically load Alex AI crew memories into Cursor AI chat sessions, maintaining continuity and context across conversations.

---

## 🚀 Quick Start

### Method 1: Auto-Generated Prompt (Recommended)

```bash
# Generate complete startup prompt
node scripts/generate-cursor-prompt.js

# Copy the output from .cursor/alex-ai/cursor-startup-prompt.md
# Paste into Cursor AI chat
```

### Method 2: Manual Memory Load

```bash
# Load just the memories
node scripts/load-crew-memories.js

# Copy the output and paste into Cursor AI chat
# Then add: "🖖 Activate Alex AI with these crew memories"
```

---

## 📋 Components

### 1. Memory Loader Script
**File**: `scripts/load-crew-memories.js`

- Loads all crew member memories from Supabase
- Formats them for Cursor AI consumption
- Supports multiple output formats (markdown, JSON, cursor-optimized)

**Usage**:
```bash
node scripts/load-crew-memories.js                    # Cursor format (default)
node scripts/load-crew-memories.js --format=markdown # Full markdown
node scripts/load-crew-memories.js --format=json     # JSON format
```

### 2. Prompt Generator Script
**File**: `scripts/generate-cursor-prompt.js`

- Combines crew memories with startup template
- Creates ready-to-use Cursor AI prompt
- Includes project context

**Usage**:
```bash
node scripts/generate-cursor-prompt.js
node scripts/generate-cursor-prompt.js --context="Working on authentication"
```

### 3. Startup Prompt Template
**File**: `.cursor/alex-ai-startup-prompt.md`

- Template for Cursor AI chat activation
- Includes crew member list
- Instructions for memory persistence

---

## 💡 Memory Persistence Strategies

### Strategy 1: Session Start Routine

**Before each Cursor AI session:**
1. Run `node scripts/generate-cursor-prompt.js`
2. Open `.cursor/alex-ai/cursor-startup-prompt.md`
3. Copy entire contents
4. Paste into new Cursor AI chat
5. Start working with full crew context

### Strategy 2: Milestone Memory Updates

**After significant milestones:**
1. Store session summary in crew memories (via n8n)
2. Run memory loader to refresh context
3. Reference new memories in next session

### Strategy 3: Context Preservation

**During conversations:**
- Reference specific crew members: "What would Data recommend?"
- Mention previous decisions: "We previously decided to..."
- Include file paths: "In dashboard/app/api/..."
- Reference code: Use code references format

### Strategy 4: Continuous Memory Building

**Throughout development:**
- After fixes: "Store this solution in crew memories"
- After decisions: "Add this to Picard's strategic memories"
- After learnings: "Data should remember this pattern"

---

## 🔧 Advanced Configuration

### Auto-Load on Cursor Startup

Create a Cursor AI workspace command:

1. Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Load Alex AI Memories",
      "type": "shell",
      "command": "node",
      "args": ["${workspaceFolder}/scripts/generate-cursor-prompt.js"],
      "problemMatcher": []
    }
  ]
}
```

2. Run task before starting Cursor AI chat

### Custom Memory Filters

Modify `load-crew-memories.js` to filter by:
- Knowledge type
- Date range
- Tags
- Crew member
- Priority

Example:
```javascript
// In load-crew-memories.js
.eq('knowledge_type', 'technical_analysis')
.gte('created_at', '2025-11-01')
```

---

## 📊 Memory Statistics

The memory loader provides:
- **Total memories per crew member**
- **Most recent memories** (last 20 per crew)
- **Knowledge type distribution**
- **Key findings and recommendations**

---

## 🎯 Best Practices

### 1. Regular Updates
- Load memories at start of each session
- Update after major milestones
- Refresh when starting new features

### 2. Context Inclusion
- Always include relevant file paths
- Reference previous conversations
- Mention crew member expertise areas

### 3. Memory Building
- Store important decisions
- Document patterns and solutions
- Capture crew recommendations

### 4. Session Continuity
- Start with: "Continuing from previous session..."
- Reference specific previous work
- Build on accumulated knowledge

---

## 🔄 Workflow Example

### Morning Session Start:
```bash
# 1. Load memories
node scripts/generate-cursor-prompt.js

# 2. Open Cursor AI chat
# 3. Paste prompt from .cursor/alex-ai/cursor-startup-prompt.md
# 4. Start working with full context
```

### During Development:
```
User: "We need to fix the dashboard startup issue"
AI: "Commander Data previously analyzed this. Let me check his memories..."
[AI references Data's previous analysis]
```

### After Milestone:
```
User: "Store this solution in crew memories"
AI: "Storing solution via n8n workflow..."
[Memory stored in Supabase]
```

### Next Session:
```
User: [Pastes startup prompt with updated memories]
AI: "I see we fixed the dashboard startup issue. What's next?"
```

---

## 📝 Memory Format

Memories are loaded in this format:

```markdown
## Crew Member Name (crew_id)
**Memories**: X

### KNOWLEDGE_TYPE
#### Memory 1: Title
**Summary**: ...
**Key Findings**:
- Finding 1
- Finding 2
**Recommendations**:
- Recommendation 1
**Tags**: tag1, tag2
```

---

## 🛠️ Troubleshooting

### Memories Not Loading
- Check Supabase credentials in `~/.zshrc`
- Verify network connection
- Check Supabase table permissions

### Outdated Memories
- Run memory loader again
- Check `created_at` timestamps
- Verify n8n workflow is storing memories

### Too Many Memories
- Adjust limit in `load-crew-memories.js` (default: 20 per crew)
- Filter by date or knowledge type
- Use `--format=cursor` for condensed view

---

## 📚 Related Documentation

- `docs/DASHBOARD_STARTUP_INVESTIGATION.md` - Crew investigation process
- `docs/N8N_MERMAID_INTEGRATION.md` - n8n workflow integration
- `scripts/e2e-memory-structure-test.js` - Memory system testing

---

**Last Updated**: 2025-11-19  
**System**: Supabase RAG Memory System via n8n workflows

