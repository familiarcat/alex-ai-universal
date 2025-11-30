# Task-Based Coordination System

**Status:** ✅ Implemented  
**Date:** November 23, 2025  
**Version:** 1.0.0

---

## 🎯 Overview

The Task-Based Coordination System optimizes OpenRouter LLM usage by coordinating crew members at the **task level** instead of individual crew member optimization. This approach:

- **Pools tokens together** for a task
- **Uses the same LLM model** for all crew members on a task (reduces echo chamber effects)
- **Enables process-level hallucination management** that monitors the entire task execution
- **Allows Quark and Riker to optimize** task-level decisions while using the same model

---

## 🏗️ Architecture

```
User Request
    ↓
Task Coordinator
    ↓
┌─────────────────────────────────────┐
│  Task-Based OpenRouter Coordinator  │
│  - Quark: Cost analysis             │
│  - Riker: Tactical coordination     │
│  - Model selection (same for all)   │
│  - Token pooling                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Process-Level Hallucination Mgr   │
│  - Monitors entire task execution   │
│  - Detects patterns over time      │
│  - Cross-crew-member analysis      │
│  - Process-level reporting         │
└─────────────────────────────────────┘
    ↓
Crew Member Execution
    ↓
Response + Hallucination Report
```

---

## 🚀 Key Features

### 1. Task-Based Model Selection

All crew members working on the same task use the **same LLM model**. This:
- Reduces echo chamber effects (crew members don't just echo each other)
- Enables token pooling (more efficient usage)
- Ensures consistency across crew responses
- Allows Quark and Riker to optimize at the task level

### 2. Token Pooling

Tokens are pooled together for a task:
- More efficient token usage
- Better cost tracking
- Per-crew-member breakdown available
- Average cost per member calculated

### 3. Process-Level Hallucination Management

Hallucination detection operates at the **process level**, not just individual prompts:
- Monitors entire task execution
- Detects contradictions between crew members
- Identifies inconsistencies over time
- Finds pattern anomalies
- Provides comprehensive process-level reports

### 4. Quark + Riker Task Optimization

Quark and Riker collaborate to optimize task-level decisions:
- **Quark**: Analyzes cost efficiency for the task
- **Riker**: Coordinates tactical workflow
- **Together**: Select optimal model for entire task
- Both use the same model (no echo chamber)

---

## 📋 Usage

### Basic Task Execution

```javascript
const { TaskCoordinator } = require('@alex-ai/core/task-coordination');

const coordinator = new TaskCoordinator(process.env.OPENROUTER_API_KEY);

// Initialize a task
await coordinator.initializeTask({
  taskId: 'task-001',
  description: 'Optimize database queries and implement caching',
  crewMembers: ['data', 'geordi', 'quark'],
  context: {
    budgetConstraint: 0.01,
    priority: 'high'
  }
});

// Execute crew member requests
const result1 = await coordinator.executeCrewRequest(
  'task-001',
  'data',
  'Analyze the current database query performance'
);

const result2 = await coordinator.executeCrewRequest(
  'task-001',
  'geordi',
  'Design a caching strategy for the identified bottlenecks'
);

const result3 = await coordinator.executeCrewRequest(
  'task-001',
  'quark',
  'Calculate the cost-benefit analysis of the proposed solution'
);

// Get comprehensive report
const report = await coordinator.completeTask('task-001');

console.log('Task Report:', {
  modelUsed: report.modelUsed,
  totalTokens: report.tokenPool.totalTokens,
  totalCost: report.tokenPool.totalCost,
  overallHealth: report.hallucinationReport.overallHealth,
  hallucinationEvents: report.hallucinationReport.events.length
});
```

### Task Report Structure

```javascript
{
  taskId: 'task-001',
  modelUsed: 'anthropic/claude-3.5-sonnet',
  crewResponses: [
    {
      crewMember: 'data',
      response: '...',
      tokens: 350,
      cost: 0.00105
    },
    // ... more responses
  ],
  tokenPool: {
    totalTokens: 1050,
    totalCost: 0.00315,
    averageCostPerMember: 0.00105
  },
  hallucinationReport: {
    overallHealth: 0.95,
    consistencyScore: 0.88,
    events: [
      {
        type: 'contradiction',
        severity: 'low',
        description: 'Minor contradiction between data and geordi',
        affectedCrewMembers: ['data', 'geordi']
      }
    ],
    recommendations: [
      'Review responses from data and geordi',
      'Seek clarification on conflicting information'
    ]
  },
  duration: 5000
}
```

---

## 🔍 Process-Level Hallucination Detection

The system detects hallucinations at multiple levels:

### 1. Contradictions
- Detects when crew members provide contradictory information
- Compares responses using semantic similarity
- Flags high deviation scores

### 2. Inconsistencies Over Time
- Monitors when the same crew member changes answers
- Tracks response evolution
- Identifies unexpected changes

### 3. Deviations
- Finds outliers in response patterns
- Detects unusual response lengths or structures
- Identifies responses that don't fit expected patterns

### 4. Pattern Anomalies
- Compares current patterns with historical patterns
- Detects when patterns change unexpectedly
- Identifies systemic issues

---

## 💰 Cost Optimization

### Token Pooling Benefits

**Before (Individual Optimization):**
- Data: 350 tokens @ $3.00/1M = $0.00105
- Geordi: 400 tokens @ $2.00/1M = $0.00080
- Quark: 300 tokens @ $0.25/1M = $0.00008
- **Total: $0.00193** (different models, no pooling)

**After (Task-Based):**
- All crew: 1050 tokens @ $3.00/1M = $0.00315
- **But**: Better consistency, no echo chamber, process-level oversight
- **Plus**: Quark and Riker optimize the model selection

### Model Selection Optimization

Quark and Riker collaborate to select the optimal model:
- **Quark**: Considers cost efficiency
- **Riker**: Considers tactical workflow needs
- **Together**: Balance cost and performance for the task

---

## 🛡️ Hallucination Management Benefits

### Process-Level Oversight

**Before (Prompt-Level):**
- Each prompt analyzed individually
- No cross-prompt analysis
- No pattern detection over time

**After (Process-Level):**
- Entire task execution monitored
- Cross-crew-member analysis
- Pattern detection over time
- Comprehensive process reports

### Example Detection

```
Task: "Optimize database queries"

Process-Level Detection:
1. Data suggests: "Use index on user_id"
2. Geordi suggests: "Use composite index on (user_id, created_at)"
3. Quark suggests: "Use index on user_id" (same as Data)

Hallucination Event Detected:
- Type: Contradiction
- Severity: Medium
- Description: Geordi and Data/Quark have conflicting index recommendations
- Recommendation: Review index strategy, consider composite index benefits
```

---

## 📊 Comparison: Individual vs Task-Based

| Aspect | Individual Optimization | Task-Based Coordination |
|--------|------------------------|------------------------|
| **Model Selection** | Per crew member | Per task (same for all) |
| **Token Pooling** | No | Yes |
| **Echo Chamber** | Possible (different models) | Reduced (same model) |
| **Hallucination Detection** | Prompt-level | Process-level |
| **Cost Tracking** | Per member | Per task + per member |
| **Consistency** | Variable | High (same model) |
| **Quark+Riker Optimization** | Per member | Per task |

---

## 🔧 Integration Points

### With Existing Systems

1. **OpenRouter Optimizer**: Used for model selection
2. **Hallucination Detector**: Used for process-level analysis
3. **Crew Manager**: Task coordinator integrates with crew assignments
4. **N8N Workflows**: Can trigger task-based coordination

### Migration Path

1. **Phase 1**: Use task-based coordination for new tasks
2. **Phase 2**: Migrate existing workflows to task-based
3. **Phase 3**: Enable process-level hallucination management
4. **Phase 4**: Full integration with all crew operations

---

## 📝 Best Practices

### 1. Task Definition
- Define clear task boundaries
- Include all relevant crew members
- Provide sufficient context

### 2. Model Selection
- Let Quark and Riker optimize
- Trust their collaboration
- Review their recommendations

### 3. Hallucination Monitoring
- Review process-level reports
- Address hallucination events promptly
- Use recommendations to improve

### 4. Cost Management
- Set budget constraints in context
- Monitor token pooling efficiency
- Review cost per member breakdown

---

## 🎯 Future Enhancements

1. **Adaptive Model Selection**: Adjust model during task execution if needed
2. **Dynamic Crew Assignment**: Add/remove crew members during task
3. **Cross-Task Learning**: Learn from previous tasks
4. **Real-Time Monitoring**: Live dashboard for task execution
5. **Automated Corrections**: Auto-correct detected hallucinations

---

## 📚 Related Documentation

- **OpenRouter Optimization**: `packages/shared-utilities/src/openrouter/optimizer.js`
- **Hallucination System**: `packages/core/src/anti-hallucination/`
- **Quark+Riker Integration**: `docs/QUARK_RIKER_INTEGRATION_SUMMARY.md`
- **Crew Coordination**: `docs/COMPLETE_CREW_COORDINATION_SYSTEM.md`

---

**This system represents a significant improvement in efficiency, consistency, and hallucination management for Alex AI crew coordination.**

