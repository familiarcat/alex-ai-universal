# Alex AI Universal Litmus Test Harness

## Quick Start

Run all litmus tests:

```bash
npm run test:litmus
```

Or directly:

```bash
node scripts/test-harness/run-litmus-tests.js
```

## What Are Litmus Tests?

Litmus tests are end-to-end validation tests that:

1. **Use Natural Language**: Tests execute real user prompts like "run all migrations"
2. **Test Entire System**: Validates CLI, N8N, Supabase, and memory systems
3. **Store in Memory**: All tests are stored in Supabase for semantic search
4. **Associate with Roles**: Tests are tagged with functional roles (infrastructure, memory, etc.)
5. **Expand Automatically**: New features can add new test steps

## Example Test

```json
{
  "id": "litmus-001",
  "name": "Supabase Migration Automation Test",
  "naturalLanguagePrompt": "run all migrations",
  "expectedBehavior": "All migrations applied successfully",
  "functionalRole": "infrastructure",
  "testSteps": [
    {
      "type": "natural_language",
      "prompt": "run all migrations",
      "expectedBehavior": "migrations applied"
    }
  ]
}
```

## Test Results

Reports are generated in:
- `docs/testing/litmus-test-report-*.json` (machine-readable)
- `docs/testing/litmus-test-report-*.md` (human-readable)

## Adding New Tests

Edit `litmus-test-definitions.json` and add your test definition. The test will automatically:
- Be executed in test runs
- Be stored in memory
- Be associated with functional role
- Appear in reports

## Documentation

See `docs/testing/LITMUS_TEST_SYSTEM.md` for complete documentation.

