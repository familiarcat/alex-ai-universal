# OpenRouter Optimization Integration Guide

## Overview

This optimization code enables context-aware, cost-effective OpenRouter model selection in N8N workflows.

## Usage in N8N Workflows

1. **Add Function/Code Node** before your OpenRouter HTTP Request node
2. **Paste the code** from `openrouter-optimization-code.js`
3. **Update your HTTP Request node** to use `{{ $json.openRouterConfig }}`

## Benefits

- ✅ Cost-effective model selection based on task requirements
- ✅ Context-aware routing (crew member, task type, complexity)
- ✅ Budget constraint support
- ✅ Automatic cost estimation

## Example Workflow Structure

```
Webhook Trigger
  ↓
Extract Context (crew member, task type, complexity)
  ↓
OpenRouter Optimization Code Node ← ADD THIS
  ↓
OpenRouter HTTP Request (uses optimized config)
  ↓
Process Response
```

## Model Selection Logic

- **Strategic Planning** → Claude 3.5 Sonnet (high performance)
- **Quick Analysis** → Claude 3 Haiku (cost-effective)
- **Code Generation** → Llama 3 70B or Claude 3.5 Sonnet
- **Optimization** → Gemini Pro 1.5 (specialized)
- **Budget Constrained** → Automatically selects lower-cost models

## Cost Optimization

The optimizer automatically:
- Selects cost-effective models for simple tasks
- Uses high-performance models only when needed
- Respects budget constraints
- Estimates costs before execution
