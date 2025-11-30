# MCP OpenRouter Optimization

**Date:** January 20, 2025  
**Status:** ✅ Complete - Enhanced with MCP Caching  
**Purpose:** Cost-effective LLM selection with MCP context caching

## 🎯 Mission

Preserve and enhance OpenRouter optimization capabilities in the MCP system with additional caching benefits.

## ✅ OpenRouter Capabilities Preserved

**All OpenRouter optimization features are preserved and enhanced:**

### ✅ Cost Optimization
- **Context-aware model selection** - Selects optimal model based on task
- **Budget constraints** - Respects budget limits
- **Cost estimation** - Estimates costs before execution
- **Crew member alignment** - Matches models to crew member expertise

### ✅ LLM Selection Per Task
- **Task-based affinity scoring** - Different models for different tasks
- **Complexity adjustment** - Adjusts model selection based on complexity
- **Crew member preferences** - Aligns with crew member specializations
- **Fallback models** - Provides alternative options

### ✅ Enhanced with MCP Caching
- **Model selection caching** - Caches selection results (NEW!)
- **Response caching** - Can cache API responses (NEW!)
- **Cost tracking** - Tracks costs across cached calls
- **Performance improvement** - Faster selection for repeated tasks

## 🏗️ Architecture

### Old (n8n)
```
Client → n8n workflow → OpenRouter Optimizer → OpenRouter API
❌ No caching
❌ Webhook dependency
```

### New (MCP)
```
Client → MCP Workflow Service → MCP OpenRouter Optimizer → OpenRouter API
         ↓ (MCP cache)
         Cached Selections & Responses
✅ Caching for efficiency
✅ Direct connection
✅ No webhook dependency
```

## 💻 Usage

### Direct LLM Call
```bash
node scripts/mcp-llm-call.js <prompt> [taskType] [complexity] [crewMember] [budgetConstraint]
```

**Examples:**

```bash
# Simple call
node scripts/mcp-llm-call.js "Analyze this code"

# With task type
node scripts/mcp-llm-call.js "Analyze this code" "code_generation"

# With complexity
node scripts/mcp-llm-call.js "Analyze this code" "code_generation" "high"

# With crew member
node scripts/mcp-llm-call.js "Analyze this code" "code_generation" "high" "data"

# With budget constraint
node scripts/mcp-llm-call.js "Analyze this code" "code_generation" "high" "data" "0.01"
```

### Via Workflow Service
```bash
node scripts/mcp-execute-workflow.js llm-call '{"prompt":"Analyze this","taskType":"code_generation","crewMember":"data"}'
```

### Programmatic Usage
```javascript
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

const optimizer = getMCPOpenRouterOptimizer();
optimizer.initialize();

// Select optimal model
const selection = optimizer.selectOptimalModel({
  taskType: 'code_generation',
  complexity: 'medium',
  crewMember: 'data',
  budgetConstraint: 0.01
});

// Call OpenRouter
const result = await optimizer.callOpenRouter(
  'Your prompt here',
  {
    taskType: 'code_generation',
    complexity: 'medium',
    crewMember: 'data'
  }
);
```

## 📊 Available Models

### High-Performance Models
- **Claude 3.5 Sonnet** - Strategic analysis, reasoning, coding ($3.00/1M)
- **GPT-4o** - Research, multimodal, general purpose ($5.00/1M)

### Cost-Effective Models
- **Claude 3 Haiku** - Quick analysis, simple tasks ($0.25/1M)
- **Gemini Pro 1.5** - Optimization, code analysis ($2.00/1M)
- **Llama 3 70B** - Code implementation, cost-effective ($1.00/1M)
- **GPT-4o Mini** - General purpose, balanced ($0.60/1M)

## 🎯 Task-Based Selection

### Strategic Planning
- **Best:** Claude 3.5 Sonnet (0.98)
- **Alternative:** GPT-4o (0.90)

### Complex Analysis
- **Best:** Claude 3.5 Sonnet (0.95)
- **Alternative:** GPT-4o (0.88)

### Code Generation
- **Best:** Claude 3.5 Sonnet (0.92)
- **Alternative:** Llama 3 70B (0.90)

### Quick Analysis
- **Best:** Claude 3 Haiku (0.95)
- **Alternative:** GPT-4o Mini (0.90)

### Optimization
- **Best:** Gemini Pro 1.5 (0.95)
- **Alternative:** Llama 3 70B (0.85)

## 💰 Cost Savings

### Before (n8n)
- No caching: Every selection recalculated
- Webhook overhead: Slower responses
- No reuse: Duplicate calculations

### After (MCP)
- **Selection caching:** Repeated tasks use cached selections
- **Direct connection:** Faster responses
- **Cost tracking:** Better visibility into costs
- **Estimated savings:** 20-30% additional efficiency from caching

## 🖖 Crew Member Alignment

Each crew member has preferred models:

- **Picard, Data, Geordi:** Claude 3.5 Sonnet
- **Troi, Uhura:** GPT-4o
- **O'Brien:** Claude 3 Haiku, Llama 3 70B
- **Quark, Geordi:** Gemini Pro 1.5
- **Crusher, Worf:** GPT-4o Mini

## 📋 Features

### ✅ Preserved from n8n
- Task-based model selection
- Cost optimization
- Budget constraints
- Crew member alignment
- Complexity adjustment

### ✅ Enhanced with MCP
- Model selection caching
- Response caching (optional)
- Cost tracking
- Performance improvement
- Direct API connection

---

**Status:** ✅ Complete - Enhanced  
**Benefits:** All n8n capabilities preserved + MCP caching improvements

