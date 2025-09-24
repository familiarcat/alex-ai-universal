# 🔄 Crew Member OpenRouter Integration Flow

## 📊 **OpenRouter Node Usage Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ALEX AI CREW OPENROUTER INTEGRATION                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER PROMPT   │───▶│  PROMPT ANALYSIS │───▶│ CREW SELECTION  │
│                 │    │                 │    │                 │
│ "Explain ML"    │    │ Domain: AI/ML   │    │ → Data (70%)    │
│                 │    │ Type: Technical │    │ → La Forge(20%) │
│                 │    │ Complexity: Med │    │ → Picard (10%)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INDIVIDUAL CREW MEMBER WORKFLOWS                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  CAPTAIN PICARD │    │  COMMANDER DATA │    │ COUNSELOR TROI  │    │ LIEUTENANT WORF │
│                 │    │                 │    │                 │    │                 │
│ Model: Claude   │    │ Model: GPT-4    │    │ Model: Claude   │    │ Model: GPT-4    │
│ 3-Opus          │    │ Turbo           │    │ 3-Sonnet        │    │ Turbo           │
│                 │    │                 │    │                 │    │                 │
│ Temp: 0.8       │    │ Temp: 0.3       │    │ Temp: 0.7       │    │ Temp: 0.4       │
│ Max: 1200       │    │ Max: 1500       │    │ Max: 1000       │    │ Max: 1100       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ OPENROUTER NODE │    │ OPENROUTER NODE │    │ OPENROUTER NODE │    │ OPENROUTER NODE │
│                 │    │                 │    │                 │    │                 │
│ Strategic       │    │ Analytical      │    │ Empathetic      │    │ Tactical        │
│ Leadership      │    │ Technical       │    │ Psychological   │    │ Security        │
│                 │    │                 │    │                 │    │                 │
│ System Prompt:  │    │ System Prompt:  │    │ System Prompt:  │    │ System Prompt:  │
│ "You are        │    │ "You are        │    │ "You are        │    │ "You are        │
│ Captain Picard  │    │ Commander Data  │    │ Counselor Troi  │    │ Lieutenant Worf │
│ commanding      │    │ an android      │    │ ship's          │    │ security chief  │
│ officer..."     │    │ operations      │    │ counselor..."   │    │ honor-bound..." │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ANTI-HALLUCINATION SYSTEM                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ RESPONSE COLLECT│    │ CONSENSUS CHECK │    │ HALLUCINATION   │
│                 │    │                 │    │ DETECTION       │
│ Gather all crew │    │ Compare         │    │                 │
│ responses       │    │ responses for   │    │ Detect          │
│                 │    │ consistency     │    │ deviations      │
│                 │    │                 │    │                 │
│ [Picard]        │    │ Consensus:      │    │ Data: ✅        │
│ [Data]          │    │ 85% agreement   │    │ Troi: ⚠️        │
│ [Troi]          │    │                 │    │ Worf: ✅        │
│ [Worf]          │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ CORRECTION      │    │ LEARNING        │    │ FINAL RESPONSE  │
│                 │    │ STORAGE         │    │                 │
│ Correct Troi's  │    │                 │    │ Return best     │
│ response        │    │ Store           │    │ consensus       │
│                 │    │ hallucination   │    │                 │
│ "Your response  │    │ patterns in     │    │ [Final Answer]  │
│ deviated from   │    │ RAG memory      │    │                 │
│ crew consensus  │    │                 │    │ Confidence:     │
│ please revise"  │    │ [Learning DB]   │    │ 92%             │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 **OpenRouter Node Configuration Summary**

### **Model Selection by Crew Member**:

| Crew Member | Primary Model | Fallback Model | Temperature | Max Tokens | Specialization |
|-------------|---------------|----------------|-------------|------------|----------------|
| **Captain Picard** | `anthropic/claude-3-opus` | `anthropic/claude-3-sonnet` | 0.8 | 1200 | Strategic Leadership |
| **Commander Data** | `openai/gpt-4-turbo` | `openai/gpt-4o` | 0.3 | 1500 | Analytics & Logic |
| **Counselor Troi** | `anthropic/claude-3-sonnet` | `anthropic/claude-3-haiku` | 0.7 | 1000 | Empathy & Psychology |
| **Lieutenant Worf** | `openai/gpt-4-turbo` | `openai/gpt-4o` | 0.4 | 1100 | Security & Tactics |
| **Commander Riker** | `anthropic/claude-3-sonnet` | `anthropic/claude-3-haiku` | 0.6 | 1200 | Operations & Execution |
| **La Forge** | `openai/gpt-4-turbo` | `openai/gpt-4o` | 0.5 | 1400 | Engineering & Innovation |
| **Doctor Crusher** | `anthropic/claude-3-sonnet` | `anthropic/claude-3-haiku` | 0.6 | 1300 | Medical & Science |
| **Lieutenant Uhura** | `anthropic/claude-3-haiku` | `anthropic/claude-3-sonnet` | 0.5 | 800 | Communications |
| **Quark** | `openai/gpt-4o` | `openai/gpt-4-turbo` | 0.7 | 1000 | Business & Negotiation |

### **Workflow Execution Flow**:

1. **User Input** → Webhook receives prompt
2. **Prompt Analysis** → Determines domain, complexity, type
3. **Crew Selection** → Routes to appropriate crew member(s)
4. **OpenRouter Call** → Each crew member uses optimized LLM
5. **Response Collection** → Gathers all crew perspectives
6. **Consensus Analysis** → Detects hallucinations and deviations
7. **Correction & Learning** → Corrects outliers, stores learning
8. **Final Response** → Returns consensus-based answer

### **Anti-Hallucination Integration**:

- **Universal Activation**: All 9 crew members respond to every prompt
- **Consensus Validation**: Responses compared for consistency
- **Deviation Detection**: Identifies responses that vary too far from consensus
- **Automatic Correction**: Outlier crew members receive correction prompts
- **Learning Storage**: Hallucination patterns stored in RAG memory
- **Continuous Improvement**: System learns from corrections over time

This architecture ensures that each crew member leverages their unique expertise through optimized LLM selection while maintaining collective intelligence and hallucination prevention through consensus validation.
