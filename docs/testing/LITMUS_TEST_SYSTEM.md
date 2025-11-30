# Alex AI Universal Litmus Test System

## Overview

The Litmus Test System is an end-to-end testing framework that validates the entire Alex AI Universal system through natural language prompts. Tests are executed semantically, documented through the system, stored in memory, and associated with functional roles.

## Key Features

1. **Natural Language Execution**: Tests use natural language prompts that mirror real user interactions
2. **Semantic Format**: Tests are stored in a semantic, reusable format
3. **Memory Integration**: All tests are stored in Supabase vector memory for retrieval and reuse
4. **Functional Role Association**: Tests are tagged with functional roles (infrastructure, memory, automation, etc.)
5. **Expandable**: New tests can be added as features are developed
6. **Comprehensive Reporting**: Generates detailed JSON and Markdown reports

## Architecture

```
┌─────────────────┐
│ Natural Language│
│    Prompt       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Test Harness   │
│  (Litmus Test)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Execute│ │  Verify  │
│  Steps │ │  Memory  │
└────┬───┘ └────┬─────┘
     │          │
     └────┬─────┘
          │
          ▼
┌─────────────────┐
│  Store Results  │
│  in Memory      │
└─────────────────┘
```

## Test Definition Structure

```json
{
  "id": "litmus-001",
  "name": "Test Name",
  "description": "Test description",
  "naturalLanguagePrompt": "natural language command",
  "expectedBehavior": "expected outcome",
  "functionalRole": "infrastructure|memory|automation|cli|system",
  "testSteps": [
    {
      "type": "natural_language|cli_command|file_check|api_call|memory_query",
      "name": "Step name",
      "prompt": "natural language prompt",
      "expectedBehavior": "expected outcome"
    }
  ],
  "memoryVerification": {
    "enabled": true,
    "verifyStorage": true,
    "verifyFunctionalRole": true
  },
  "tags": ["tag1", "tag2"],
  "priority": "high|medium|low|critical",
  "version": "1.0.0"
}
```

## Test Step Types

### 1. Natural Language (`natural_language`)
Executes a natural language prompt through the Alex AI CLI and verifies expected behavior.

```json
{
  "type": "natural_language",
  "name": "Execute migration command",
  "prompt": "run all migrations",
  "expectedBehavior": "migrations applied"
}
```

### 2. CLI Command (`cli_command`)
Executes a CLI command and verifies output.

```json
{
  "type": "cli_command",
  "name": "Verify migration status",
  "command": "supabase migration list",
  "expectedOutput": "Local"
}
```

### 3. File Check (`file_check`)
Verifies file existence and content.

```json
{
  "type": "file_check",
  "name": "Verify migration file",
  "path": "supabase/CONSOLIDATED_MIGRATION.sql",
  "expectedContent": "CONSOLIDATED"
}
```

### 4. API Call (`api_call`)
Tests API endpoints.

```json
{
  "type": "api_call",
  "name": "Verify Supabase connectivity",
  "endpoint": "https://rpkkkbufdwxmjaerbhbn.supabase.co/rest/v1/",
  "method": "GET",
  "expectedStatus": 200
}
```

### 5. Memory Query (`memory_query`)
Queries the memory system to verify storage.

```json
{
  "type": "memory_query",
  "name": "Verify memory storage",
  "query": "chat session",
  "expectedResults": {
    "minCount": 1
  }
}
```

## Functional Roles

Tests are associated with functional roles for organization and filtering:

- **infrastructure**: Database, migrations, deployment
- **memory**: Vector storage, RAG, knowledge base
- **automation**: Milestone pushes, CI/CD, workflows
- **cli**: Command-line interface, natural language routing
- **system**: End-to-end integration, system health

## Running Tests

### Run All Tests

```bash
node scripts/test-harness/run-litmus-tests.js
```

### Run Specific Test

```javascript
const { LitmusTest } = require('./scripts/test-harness/alex-ai-litmus-test');
const testDef = require('./scripts/test-harness/litmus-test-definitions.json');

const test = new LitmusTest(testDef.tests[0]);
const result = await test.execute();
console.log(result);
```

## Adding New Tests

1. **Create Test Definition**: Add to `litmus-test-definitions.json`

```json
{
  "id": "litmus-XXX",
  "name": "New Feature Test",
  "description": "Tests new feature functionality",
  "naturalLanguagePrompt": "test new feature",
  "expectedBehavior": "feature works",
  "functionalRole": "feature-category",
  "testSteps": [...],
  "tags": ["new-feature"],
  "priority": "high"
}
```

2. **Test Will Automatically**:
   - Be executed in test runs
   - Be stored in memory
   - Be associated with functional role
   - Appear in test reports

## Memory Storage

All test executions are stored in Supabase vector memory:

- **Test Definition**: Stored when test is created
- **Test Execution**: Stored when test is run
- **Test Results**: Stored in test reports
- **Functional Role**: Tagged for semantic search

## Test Reports

Reports are generated in two formats:

1. **JSON**: Machine-readable format for CI/CD integration
2. **Markdown**: Human-readable format for documentation

Reports include:
- Test execution status
- Memory verification results
- Functional role verification
- Step-by-step results
- Error details

## Integration with CI/CD

The litmus test system can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/litmus-tests.yml
name: Litmus Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Litmus Tests
        run: node scripts/test-harness/run-litmus-tests.js
      - name: Upload Test Report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: docs/testing/litmus-test-report-*.json
```

## Best Practices

1. **Use Natural Language**: Tests should mirror real user interactions
2. **Verify Memory**: Always enable memory verification for important tests
3. **Associate Roles**: Tag tests with appropriate functional roles
4. **Expand Tests**: Add new test steps as features are added
5. **Document Tests**: Include clear descriptions and expected behaviors
6. **Version Tests**: Use version numbers to track test evolution

## Example: Complete Test Flow

```bash
# 1. User runs natural language prompt
"run all migrations"

# 2. Test harness executes
node scripts/test-harness/run-litmus-tests.js

# 3. Test executes steps:
#    - Natural language: "run all migrations"
#    - CLI command: "supabase migration list"
#    - File check: "supabase/CONSOLIDATED_MIGRATION.sql"
#    - API call: Verify table accessibility

# 4. Memory verification:
#    - Store test execution in memory
#    - Query memory to verify storage
#    - Verify functional role association

# 5. Generate report:
#    - JSON report for CI/CD
#    - Markdown report for documentation

# 6. Test stored in memory:
#    - Available for semantic search
#    - Associated with functional role
#    - Reusable for future validation
```

## Troubleshooting

### Test Fails Memory Verification

- Check N8N workflow is active
- Verify Supabase connectivity
- Check service role key is valid

### Test Fails Functional Role Verification

- Verify test has correct functional role tag
- Check memory storage includes role metadata
- Ensure role is in test tags

### Natural Language Step Fails

- Verify Alex AI CLI is installed
- Check natural language routing is working
- Verify expected behavior matches actual output

## Future Enhancements

- [ ] Parallel test execution
- [ ] Test dependency management
- [ ] Visual test reports
- [ ] Test performance metrics
- [ ] Automated test generation from user interactions
- [ ] Integration with monitoring systems

---

**Crew Notes:**
- **Commander Data**: "The litmus test system provides comprehensive validation of all system components through semantic execution."
- **Chief O'Brien**: "Tests are stored in memory and can be reused as the system expands - very efficient!"
- **Lt. Uhura**: "Natural language prompts make tests accessible and maintainable."

