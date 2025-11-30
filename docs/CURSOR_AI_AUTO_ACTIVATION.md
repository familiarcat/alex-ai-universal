# 🖖 Cursor AI Auto-Activation System

## Overview

The Alex AI Auto-Activation System automatically detects when to activate Alex AI in Cursor AI Chat and provides seamless integration with crew coordination capabilities.

## Features

### ✅ Automatic Activation

Alex AI automatically activates when the user's message contains:

1. **Crew Mentions**
   - Any Star Trek crew member name (Picard, Data, Riker, etc.)
   - References to "crew", "Star Trek", "Enterprise"

2. **Alex AI Features**
   - Mentions of "N8N", "Supabase", "memory storage", "workflow"
   - Requests for "milestone push", "cost analysis", "litmus test"
   - Questions about "Alex AI" capabilities

3. **Complex Technical Questions**
   - Architecture, optimization, refactoring questions
   - Security analysis, performance, scalability questions
   - Code review or best practices requests

4. **Business Questions**
   - Cost, budget, ROI, efficiency questions
   - Business optimization or profit questions

### 🎯 Activation Prompts

Users can manually activate Alex AI by typing:
- `🖖 Activate Alex AI`
- `Activate Alex AI`
- `Engage Alex AI`
- `Start Alex AI`
- `Alex AI, activate`

### 💡 Smart Suggestions

The system suggests Alex AI activation when:
- Questions are complex or would benefit from multiple perspectives
- Technical questions require specialized expertise
- Business questions need cost analysis
- Security or compliance questions arise

## Usage

### Automatic Activation Example

```
User: "What would Data recommend for optimizing this code?"
→ 🖖 Auto-activating Alex AI (reason: crew_mention)
→ Routes to Commander Data for technical analysis
```

### Manual Activation Example

```
User: "Activate Alex AI"
→ 🖖 Activating Alex AI...
→ Crew coordination active
```

### Suggestion Example

```
User: "How can I improve this React component?"
→ Normal response + suggestion:
   "💡 Tip: This might benefit from Alex AI crew coordination. 
    Type 'Activate Alex AI' for enhanced assistance."
```

## Integration

### In `.cursorrules`

The `.cursorrules` file now includes:
- Automatic activation triggers
- Activation prompt detection
- Crew coordination instructions
- Zero-artifact guarantee

### Script: `scripts/cursor-ai-auto-activation.js`

Provides programmatic activation:
```javascript
const { handleCursorChat } = require('./scripts/cursor-ai-auto-activation');

const result = handleCursorChat(userMessage);
if (result.activated) {
  // Alex AI is active
  console.log(result.response);
}
```

## Activation Flow

1. **Message Detection**
   - User sends message in Cursor AI Chat
   - System checks for activation triggers

2. **Auto-Activation**
   - If trigger detected, automatically activate
   - Route to Alex AI CLI: `npx alex-ai chat`

3. **Crew Coordination**
   - Appropriate crew members activated
   - Specialized expertise provided
   - Memory storage via N8N → Supabase

4. **Response**
   - Coordinated crew response returned
   - Zero-artifact guarantee maintained
   - Memory automatically stored

## Crew Members Available

When Alex AI is active, you have access to:

- 🎖️ **Captain Picard**: Strategic leadership
- ⚡ **Commander Riker**: Tactical operations
- 🤖 **Commander Data**: Technical analysis
- 🔧 **Lieutenant Commander La Forge**: Engineering
- ⚔️ **Lieutenant Worf**: Security analysis
- 💭 **Counselor Troi**: User experience
- 💊 **Dr. Crusher**: System health
- 📻 **Lieutenant Uhura**: Communication systems
- 💰 **Quark**: Business optimization
- 🛠️ **Chief O'Brien**: Pragmatic solutions

## Zero-Artifact Guarantee

When Alex AI is active:
- ✅ No files created in project unless explicitly requested
- ✅ All temporary data in isolated `.alex-ai-artifacts/` directory
- ✅ Memory storage to Supabase via N8N (not local files)
- ✅ Git repository remains clean
- ✅ Automatic cleanup after session

## Examples

### Example 1: Automatic Activation
```
User: "What would Quark recommend for cost optimization?"
→ Auto-activates Alex AI
→ Routes to Quark for business analysis
→ Returns cost optimization recommendations
```

### Example 2: Manual Activation
```
User: "Activate Alex AI for code review"
→ Activates Alex AI
→ Crew coordination begins
→ Multiple crew members provide review insights
```

### Example 3: Suggestion
```
User: "How do I optimize this database query?"
→ Normal response + suggestion
→ User can activate Alex AI if desired
```

## Configuration

### Custom Triggers

Edit `scripts/cursor-ai-auto-activation.js` to add custom triggers:

```javascript
const AUTO_ACTIVATION_TRIGGERS = {
  customTriggers: [
    'your custom trigger',
    'another trigger'
  ]
};
```

### Activation Prompts

Add custom activation prompts:

```javascript
const ACTIVATION_PROMPTS = [
  'Your custom prompt',
  'Another prompt'
];
```

## Troubleshooting

### Alex AI Not Activating

1. Check if trigger patterns match your message
2. Verify `.cursorrules` file is in project root
3. Ensure `npx alex-ai` is installed and accessible
4. Check script permissions: `chmod +x scripts/cursor-ai-auto-activation.js`

### CLI Not Found

If `npx alex-ai` fails:
- System falls back to inline Alex AI reasoning
- Response includes note about CLI unavailability
- Full crew coordination requires CLI access

## Future Enhancements

- [ ] Visual activation indicator in Cursor UI
- [ ] Activation history and preferences
- [ ] Custom crew member assignments
- [ ] Activation analytics
- [ ] Voice activation support

---

**Status:** ✅ Active and Operational

**Last Updated:** 2025-11-18

