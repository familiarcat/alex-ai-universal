# Test Fixtures

**Purpose:** Provide test data and mock services for E2E tests

## Files

- `workflow-fixtures.js` - Test data fixtures for workflows, payloads, and responses
- `mock-webhook-server.js` - Mock webhook server for offline testing

## Usage

### Using Fixtures

```javascript
const { getPayload, getExpectedResponse } = require('./test-fixtures/workflow-fixtures');

// Get test payload
const payload = getPayload('knowledgeIngest');

// Get expected response
const expected = getExpectedResponse('knowledgeIngest', 'success');
```

### Using Mock Server

```javascript
const MockWebhookServer = require('./test-fixtures/mock-webhook-server');
const { getExpectedResponse } = require('./test-fixtures/workflow-fixtures');

const server = new MockWebhookServer(5678);

// Register webhook route
server.registerRoute('/webhook/ingest-knowledge', 'POST', (payload) => {
  return getExpectedResponse('knowledgeIngest', 'success');
});

// Start server
await server.start();

// Run tests...

// Stop server
await server.stop();
```

## Benefits

- **Offline Testing:** Run tests without live n8n instance
- **Consistent Data:** Use same test data across tests
- **Faster Tests:** No network delays
- **CI/CD Ready:** Tests can run in any environment

