# Alex AI Extension SDK

Unified SDK for all IDE extensions to communicate with the dashboard system.

## Usage

```typescript
import { createSDK } from '@alex-ai/extension-sdk';

const sdk = createSDK({
  n8nUrl: 'https://n8n.pbradygeorgen.com',
  apiKey: 'your-api-key'
});

// Send data to dashboard
const result = await sdk.sendToDashboard('project/create', {
  name: 'My Project',
  theme: 'modernBlue'
});

// Get data from dashboard
const projects = await sdk.getFromDashboard('projects/list');

// Sync with Supabase
await sdk.syncWithSupabase('memories', {
  content: 'User preference',
  metadata: { source: 'extension' }
});
```

## Architecture

Extensions → SDK → API Gateway (n8n) → Controller → Supabase

This ensures proper DDD boundaries and security isolation.
