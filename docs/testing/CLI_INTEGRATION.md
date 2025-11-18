# Litmus Test System - CLI Integration

## Overview

The litmus test system is now fully integrated into the Alex AI NPX CLI, making it accessible via both command-line and natural language prompts.

## Usage

### Command Line

```bash
# Run all litmus tests
npx alex-ai test

# Or using alias
npx alex-ai litmus

# Run specific test
npx alex-ai test --id litmus-001

# Show help
npx alex-ai test --help
```

### Natural Language (Chat Mode)

```bash
# Start interactive chat
npx alex-ai chat

# Then type any of these prompts:
- "run tests"
- "run litmus"
- "test system"
- "litmus test"
- "test alex ai"
- "verify system"
- "test harness"
- "run test suite"
- "execute tests"
- "system test"
- "end to end test"
- "e2e test"
```

### Direct Engagement

```bash
# Natural language via engage command
npx alex-ai engage "run tests"
npx alex-ai engage "test system"
npx alex-ai engage "litmus test"
```

## Integration Points

### 1. CLI Command Registration

The test command is registered in `packages/cli/src/alex-ai-cli.ts`:

```typescript
program
  .command('test')
  .alias('litmus')
  .description('Run Alex AI Universal Litmus Tests - End-to-end system validation')
  .option('-a, --all', 'Run all tests', true)
  .option('-i, --id <testId>', 'Run specific test by ID (e.g., litmus-001)')
  .action(async (options) => {
    await npxHandler.handleTestExecution({ 
      all: options.all, 
      testId: options.id 
    });
  });
```

### 2. Natural Language Detection

Test requests are detected via keyword matching in `handleEngagement()`:

```typescript
private isTestRequest(message: string): boolean {
  const testKeywords = [
    'run tests',
    'run litmus',
    'test system',
    'litmus test',
    'test alex ai',
    'verify system',
    'test harness',
    'run test suite',
    'execute tests',
    'system test',
    'end to end test',
    'e2e test'
  ];
  
  const lowerMessage = message.toLowerCase();
  return testKeywords.some(keyword => lowerMessage.includes(keyword));
}
```

### 3. Test Execution Handler

The handler executes the litmus test harness:

```typescript
async handleTestExecution(options?: { testId?: string; all?: boolean }): Promise<void> {
  const testScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'test-harness', 'run-litmus-tests.js');
  const child = spawn('node', [testScriptPath], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  // ... handle results
}
```

## Benefits of CLI Integration

1. **Unified Interface**: All Alex AI functionality accessible via one CLI
2. **Natural Language**: Tests can be triggered conversationally
3. **Zero-Artifact**: Tests run without creating project files
4. **Crew Integration**: Tests can leverage crew coordination
5. **Memory Storage**: Test results automatically stored in Supabase
6. **Documentation**: Test execution documented through system

## Examples

### Example 1: Command Line

```bash
$ npx alex-ai test

🧪 Running Alex AI Universal Litmus Tests...
==========================================

[1/5] Supabase Migration Automation Test
✅ All steps passed

[2/5] Chat Session Memory Storage Test
✅ All steps passed

...

✅ Litmus tests complete!
📊 Reports saved to: docs/testing/
```

### Example 2: Natural Language

```bash
$ npx alex-ai chat
You: run tests
🧪 Test execution request detected!
🧪 Running Alex AI Universal Litmus Tests...
...
```

### Example 3: Direct Engagement

```bash
$ npx alex-ai engage "test system"
🧪 Test execution request detected!
🧪 Running Alex AI Universal Litmus Tests...
...
```

## Test Results

After execution, test reports are generated in:
- `docs/testing/litmus-test-report-*.json` (machine-readable)
- `docs/testing/litmus-test-report-*.md` (human-readable)

## Future Enhancements

- [ ] Test filtering by functional role
- [ ] Test performance metrics
- [ ] Parallel test execution
- [ ] Test result caching
- [ ] Integration with CI/CD pipelines
- [ ] Real-time test monitoring

---

**Crew Notes:**
- **Commander Data**: "CLI integration provides a unified interface for system validation."
- **Chief O'Brien**: "Natural language prompts make testing accessible to all users."
- **Lt. Uhura**: "Test results are automatically documented and stored for future reference."

