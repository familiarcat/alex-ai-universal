# OpenRouter Test Harness

**Date:** November 23, 2025  
**Status:** ✅ Implemented  
**Purpose:** Comprehensive test suite for OpenRouter optimization system

---

## 🎯 Overview

The OpenRouter Test Harness provides end-to-end testing for the OpenRouter optimization system, ensuring all functionality works correctly with real API calls.

---

## 🚀 Usage

### Run All Tests

```bash
# Run all tests
node scripts/test-openrouter-harness.js

# Run with verbose output
node scripts/test-openrouter-harness.js --verbose

# Run specific test suite
node scripts/test-openrouter-harness.js --test=model-selection
node scripts/test-openrouter-harness.js --test=task-coordination
node scripts/test-openrouter-harness.js --test=integration
```

### Prerequisites

```bash
# Set OpenRouter API key
export OPENROUTER_API_KEY="sk-or-v1-..."

# Or add to ~/.zshrc
echo 'export OPENROUTER_API_KEY="sk-or-v1-..."' >> ~/.zshrc
source ~/.zshrc
```

---

## 📋 Test Suites

### 1. Model Selection Tests

Tests the model selection optimization:

- ✅ Basic model selection
- ✅ Budget constraint handling
- ✅ Crew member variations
- ✅ Complexity level variations

**Example:**
```bash
node scripts/test-openrouter-harness.js --test=model-selection
```

### 2. OpenRouter API Call Tests

Tests actual OpenRouter API calls:

- ✅ Basic LLM calls
- ✅ Crew member variations
- ✅ Cost tracking
- ✅ Usage tracking

**Example:**
```bash
node scripts/test-openrouter-harness.js --test=openrouter
```

### 3. Task-Based Coordination Tests

Tests task-based coordination system:

- ✅ Task initialization
- ✅ Crew member execution
- ✅ Token pooling
- ✅ Task completion

**Example:**
```bash
node scripts/test-openrouter-harness.js --test=task-coordination
```

### 4. Integration Tests

Tests end-to-end integration:

- ✅ Full task coordination flow
- ✅ Model selection + execution
- ✅ Token pooling + reporting
- ✅ Hallucination management integration

**Example:**
```bash
node scripts/test-openrouter-harness.js --test=integration
```

---

## 📊 Test Results

### Expected Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 OPENROUTER TEST HARNESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Running: Model Selection - Basic
✅ Passed: Model Selection - Basic (45ms)
ℹ️  Running: Model Selection - Budget Constraint
✅ Passed: Model Selection - Budget Constraint (38ms)
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Passed: 12
❌ Failed: 0
⏭️  Skipped: 0
📊 Total: 12
```

---

## 🔧 Test Configuration

### Environment Variables

- `OPENROUTER_API_KEY` - Required for API tests
- `VERBOSE` - Enable verbose output (or use `--verbose` flag)

### Test Filtering

Filter tests by name:
```bash
# Run only model selection tests
node scripts/test-openrouter-harness.js --test=model

# Run only coordination tests
node scripts/test-openrouter-harness.js --test=coordination
```

---

## 💰 Cost Tracking

The test harness tracks costs for all OpenRouter API calls:

- Model selection: ~$0 (no API calls)
- LLM calls: ~$0.0001-$0.001 per call
- Task coordination: ~$0.001-$0.01 per task
- Full test suite: ~$0.01-$0.05 total

---

## 🛠️ Adding New Tests

### Example Test

```javascript
await runTest('My New Test', async () => {
  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();
  
  const result = await optimizer.optimizeAndCall('Test prompt', {
    crewMember: 'data',
    complexity: 'medium'
  });
  
  assert(result, 'Result should be returned');
  assert(result.cost >= 0, 'Cost should be tracked');
});
```

---

## 📝 Test Maintenance

### Regular Testing

Run tests regularly to ensure system health:
```bash
# Daily check
node scripts/test-openrouter-harness.js

# Before deployments
node scripts/test-openrouter-harness.js --test=all --verbose
```

### CI/CD Integration

Add to CI/CD pipeline:
```yaml
- name: Test OpenRouter
  run: node scripts/test-openrouter-harness.js
  env:
    OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

---

## 🐛 Troubleshooting

### API Key Not Set

```
⚠️  OPENROUTER_API_KEY not set. Some tests will be skipped.
```

**Solution:** Set `OPENROUTER_API_KEY` in environment or `~/.zshrc`

### Test Failures

If tests fail:
1. Check OpenRouter API key is valid
2. Verify network connectivity
3. Check OpenRouter service status
4. Review error messages with `--verbose` flag

---

## 📚 Related Documentation

- **Feature Parity**: `docs/MCP_N8N_FEATURE_PARITY.md`
- **OpenRouter Setup**: `docs/OPENROUTER_AUTOMATION_SETUP.md`
- **Task Coordination**: `docs/TASK_BASED_COORDINATION.md`

---

**This test harness ensures the OpenRouter optimization system is always working correctly.**

