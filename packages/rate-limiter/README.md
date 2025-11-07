# @alex-ai/rate-limiter

**Unified Rate Limiting for Alex AI Universal**

A comprehensive, enterprise-grade rate limiting system that prevents HTTP 429 errors across all Alex AI platforms: n8n automation, Next.js APIs, and custom integrations.

---

## 🎯 Why This Package Exists

**The Problem:** We experienced cascading 429 (Too Many Requests) errors across our n8n workflows, causing webhook registration failures and blocking our automation systems. We had three separate rate limiting implementations that didn't talk to each other.

**The Solution:** One unified package with adapters for every use case, ensuring consistent rate limiting behavior across the entire Alex AI ecosystem.

---

##  Features

- ✅ **Exponential Backoff**: Automatic retry with intelligent backoff on 429 errors
- ✅ **Adaptive Timing**: Adjusts delays based on API response times
- ✅ **Batch Processing**: Process large datasets without hitting rate limits
- ✅ **Concurrency Control**: Semaphore-based limiting of parallel operations
- ✅ **Multiple Adapters**: Optimized for n8n, Next.js, and custom needs
- ✅ **Rate Limit Monitoring**: Tracks and logs X-RateLimit-* headers
- ✅ **Zero Dependencies**: Core package has no external dependencies
- ✅ **TypeScript**: Full type safety and IntelliSense support

---

## 📦 Installation

```bash
# From monorepo root
npm install

# The package is automatically linked via npm workspaces
```

---

## 🚀 Quick Start

### For n8n Automation Scripts

```javascript
const { createN8nRateLimiter } = require('@alex-ai/rate-limiter');

const rateLimiter = createN8nRateLimiter({
  maxConcurrent: 3,
  minDelayBetweenRequests: 2000,
});

// Execute API calls with automatic rate limiting
await rateLimiter.apiCall(async () => {
  return axios.get('https://n8n.pbradygeorgen.com/api/v1/workflows');
}, 'fetch workflows');

// Toggle workflows (forces webhook re-registration)
await rateLimiter.toggleWorkflow(
  async () => axios.post(`/api/v1/workflows/${id}/deactivate`),
  async () => axios.post(`/api/v1/workflows/${id}/activate`)
);

// Process in batches
await rateLimiter.processBatches(workflows, async (batch) => {
  // Process each batch
}, 5); // Batch size of 5
```

### For Next.js API Routes

```typescript
import { createNextJsRateLimiter } from '@alex-ai/rate-limiter';
import { NextRequest, NextResponse } from 'next/server';

const rateLimiter = createNextJsRateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  message: 'Please slow down and try again in a moment.',
});

export async function POST(request: NextRequest) {
  // Check rate limit
  const result = rateLimiter.checkLimit(request, 'create-project');
  
  if (!result.allowed) {
    return NextResponse.json(result.response.body, {
      status: result.response.status,
      headers: result.response.headers,
    });
  }

  // Your API logic here
  return NextResponse.json({ success: true });
}
```

### Custom Implementation

```typescript
import { RateLimiter, Semaphore } from '@alex-ai/rate-limiter';

const rateLimiter = new RateLimiter({
  maxRetries: 5,
  backoffMultiplier: 2,
  adaptiveTiming: true,
});

const semaphore = new Semaphore(3); // Max 3 concurrent operations

// Execute with both rate limiting and concurrency control
await semaphore.execute(async () => {
  return rateLimiter.execute(async () => {
    return await myApiCall();
  });
});
```

---

## 📚 API Reference

### N8nAdapter

**`createN8nRateLimiter(config?)`**

Creates a rate limiter optimized for n8n automation scripts.

**Config Options:**
- `maxConcurrent` (number): Maximum concurrent API calls (default: 3)
- `minDelayBetweenRequests` (number): Minimum delay in ms (default: 2000)
- `operationDelay` (number): Delay for activate/deactivate (default: 3000)
- `batchDelay` (number): Delay between batches (default: 5000)
- `maxRetries` (number): Maximum retry attempts (default: 5)
- `webhookRegistrationWait` (number): Wait time after activation (default: 8000)

**Methods:**
- `apiCall(fn, operation)`: Execute API call with rate limiting
- `activateWorkflow(fn)`: Activate workflow and wait for webhook registration
- `deactivateWorkflow(fn)`: Deactivate workflow
- `toggleWorkflow(deactivateFn, activateFn)`: Toggle workflow (forces webhook re-registration)
- `processBatches(items, fn, batchSize)`: Process items in batches
- `waitForContainerRestart()`: Wait after Docker restart

### NextJsAdapter

**`createNextJsRateLimiter(config?)`**

Creates a rate limiter for Next.js API routes.

**Config Options:**
- `maxRequests` (number): Maximum requests per window (default: 100)
- `windowMs` (number): Time window in ms (default: 60000)
- `message` (string): Error message for rate-limited requests
- `statusCode` (number): HTTP status code (default: 429)
- `headers` (boolean): Include X-RateLimit-* headers (default: true)

**Methods:**
- `checkLimit(request, endpoint)`: Check if request should be rate limited
- `getRemaining(request, endpoint)`: Get remaining requests for identifier
- `clearLimit(identifier, endpoint)`: Clear rate limit for specific key
- `clearAll()`: Clear all rate limits

### RateLimiter (Core)

**`new RateLimiter(config?)`**

Core rate limiting engine.

**Config Options:**
- `minDelayBetweenRequests` (number): Minimum delay between requests (ms)
- `maxRetries` (number): Maximum retry attempts on 429 errors
- `initialRetryDelay` (number): Initial retry delay in ms
- `maxRetryDelay` (number): Maximum retry delay in ms
- `backoffMultiplier` (number): Exponential backoff multiplier
- `adaptiveTiming` (boolean): Adjust delays based on response times
- `logRateLimitHeaders` (boolean): Log X-RateLimit-* headers
- `onRetry` (function): Callback on retry
- `onSuccess` (function): Callback on success
- `onRateLimited` (function): Callback on 429 error

**Methods:**
- `execute(fn, options)`: Execute function with rate limiting and retry logic
- `processBatches(items, fn, batchSize)`: Process items in batches
- `updateConfig(config)`: Update configuration
- `getConfig()`: Get current configuration

### Semaphore

**`new Semaphore(maxConcurrent)`**

Concurrency control for limiting parallel operations.

**Methods:**
- `acquire()`: Acquire a slot (wait if none available)
- `release()`: Release a slot
- `execute(fn)`: Execute function with semaphore control
- `getState()`: Get current state (current, queued, available)

---

## 🎓 Best Practices

### 1. **Use Appropriate Adapters**

```javascript
// ✅ Good: Use n8n adapter for automation
const rateLimiter = createN8nRateLimiter();

// ❌ Bad: Using raw RateLimiter for n8n (missing webhook wait logic)
const rateLimiter = new RateLimiter();
```

### 2. **Batch Large Operations**

```javascript
// ✅ Good: Process in batches
await rateLimiter.processBatches(workflows, async (batch) => {
  for (const workflow of batch) {
    await processWorkflow(workflow);
  }
}, 5);

// ❌ Bad: Process all at once (will hit rate limits)
for (const workflow of workflows) {
  await processWorkflow(workflow);
}
```

### 3. **Monitor Rate Limit Headers**

```javascript
const rateLimiter = createN8nRateLimiter({
  logRateLimitHeaders: true, // ✅ Enable monitoring
});
```

### 4. **Use Semaphores for Concurrency**

```javascript
// ✅ Good: Limit concurrent operations
const semaphore = new Semaphore(3);
await Promise.all(items.map(item => 
  semaphore.execute(() => processItem(item))
));

// ❌ Bad: Unlimited concurrency
await Promise.all(items.map(item => processItem(item)));
```

---

## 🔧 Troubleshooting

### Still Getting 429 Errors?

1. **Increase delays:**
   ```javascript
   const rateLimiter = createN8nRateLimiter({
     minDelayBetweenRequests: 3000, // Increase from 2s to 3s
     operationDelay: 5000,           // Increase from 3s to 5s
   });
   ```

2. **Reduce batch size:**
   ```javascript
   await rateLimiter.processBatches(items, fn, 3); // Reduce from 5 to 3
   ```

3. **Reduce concurrency:**
   ```javascript
   const rateLimiter = createN8nRateLimiter({
     maxConcurrent: 2, // Reduce from 3 to 2
   });
   ```

### Webhooks Not Registering?

After toggling workflows, n8n needs time to register webhooks:

```javascript
await rateLimiter.activateWorkflow(async () => {
  return api.post('/activate');
});
// Automatically waits 8 seconds for webhook registration
```

---

## 📖 Architecture

```
@alex-ai/rate-limiter/
├── src/
│   ├── core/
│   │   ├── RateLimiter.ts       # Core rate limiting engine
│   │   └── Semaphore.ts         # Concurrency control
│   ├── adapters/
│   │   ├── N8nAdapter.ts        # n8n-specific optimizations
│   │   └── NextJsAdapter.ts     # Next.js API route integration
│   ├── storage/
│   │   └── MemoryStore.ts       # In-memory storage (default)
│   └── index.ts                 # Public exports
└── dist/                        # Compiled JavaScript
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📝 Changelog

### v1.0.0 (2025-11-07)

- Initial release
- N8nAdapter for automation scripts
- NextJsAdapter for API routes
- Core RateLimiter with exponential backoff
- Semaphore for concurrency control
- Memory-based storage
- Full TypeScript support

---

## 👥 Credits

Built by the Alex AI Crew:
- 🤖 **Commander Data**: Core architecture & algorithms
- 👨‍✈️ **Chief O'Brien**: Pragmatic n8n integration
- 🛡️ **Lieutenant Worf**: Security & validation
- 💙 **Counselor Troi**: User-friendly error messages
- ⚕️ **Dr. Crusher**: System health monitoring
- 🔧 **Lt. Cmdr. Geordi**: Infrastructure integration
- 📡 **Lieutenant Uhura**: Documentation & communication

---

## 📄 License

MIT

---

## 🔗 Related Documentation

- [N8N Rate Limiting Solution](/docs/N8N_RATE_LIMITING_COMPLETE_SOLUTION.md)
- [Crew Parallel Execution Plan](/docs/CREW-PARALLEL-EXECUTION-PLAN.md)
- [Alex AI Universal Cheat Sheet](/docs/guides/ALEX_AI_UNIVERSAL_CHEAT_SHEET.md)

---

**Questions?** Open an issue or ask in the Alex AI Observation Lounge! 🖖

