# 🖖 RAG Pattern: API Retry Limits & Cancellation

**Pattern Type:** Anti-Pattern Prevention  
**Date Stored:** November 27, 2025  
**Crew:** All 10 crew members  
**Status:** ✅ Stored in RAG

## Anti-Pattern: Infinite Retry Loops

### Problem
Components making API calls that fail (404, 500, network errors) continue retrying indefinitely without:
- Retry limits
- User warnings
- Cancellation capability
- Exponential backoff

### Example (BAD)
```typescript
// ❌ BAD: Infinite retry loop
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('/api/progress/task-123');
    if (!response.ok) {
      // Continues retrying forever, even on 404
    }
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### Impact
- Console spam with repeated errors
- Resource exhaustion
- Poor user experience
- No way to cancel stuck operations
- Potential DoS vulnerability

## Solution: useRetryableFetch Hook

### Pattern (GOOD)
```typescript
// ✅ GOOD: Retry limits with cancellation
import { useRetryableFetch } from '@/lib/hooks/useRetryableFetch';
import StuckOperationWarning from '@/components/StuckOperationWarning';

const {
  data,
  loading,
  error,
  retryCount,
  isStuck,
  cancel,
  retry
} = useRetryableFetch('/api/progress/task-123', {}, {
  maxRetries: 5,
  initialDelay: 1000,
  showWarningAfter: 3,
  onWarning: (attempt) => console.warn(`Stuck after ${attempt} attempts`),
  onMaxRetries: (err) => console.error('Max retries reached', err)
});

// Show warning when stuck
{isStuck && (
  <StuckOperationWarning
    operationName="Progress Tracking"
    retryCount={retryCount}
    maxRetries={5}
    onCancel={cancel}
    onRetry={retry}
    error={error}
  />
)}
```

### Features
1. **Retry Limits**: Max 5 attempts (configurable)
2. **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s (configurable)
3. **User Warnings**: Shows warning after 3 failures (configurable)
4. **Cancellation**: User can cancel stuck operations
5. **404 Handling**: Doesn't retry on 404 (expected for missing resources)
6. **Circuit Breaker**: Stops after max retries

## Components Affected

### Fixed ✅
- `ProgressTracker.tsx` - Now uses `useRetryableFetch`
- All polling components should use this pattern

### To Fix ⏳
- `LiveRefreshDashboard.tsx` - Polling `/api/codebase-changes`
- `SyncToggle.js` - Polling `/api/sync-status`
- Any component with `setInterval` + `fetch`

## Implementation Checklist

When creating a new polling component:

- [ ] Use `useRetryableFetch` hook instead of manual `fetch` + `setInterval`
- [ ] Configure retry limits (max 5 attempts)
- [ ] Set exponential backoff (1s, 2s, 4s, 8s, 16s)
- [ ] Show `StuckOperationWarning` when `isStuck === true`
- [ ] Handle 404 gracefully (don't retry)
- [ ] Provide cancellation capability
- [ ] Test with network failures
- [ ] Test with missing API routes (404)

## RAG Memory

**Question:** "How do I prevent infinite retry loops in API calls?"

**Answer:** "Use the `useRetryableFetch` hook from `@/lib/hooks/useRetryableFetch`. It provides retry limits (max 5), exponential backoff, user warnings after 3 failures, and cancellation support. Show `StuckOperationWarning` component when `isStuck === true`. Never use `setInterval` + `fetch` without retry limits."

**Anti-Pattern:** "Never create polling loops with `setInterval` and `fetch` without retry limits, exponential backoff, or cancellation. This causes infinite retry loops, console spam, and poor UX."

## Crew Consensus

**All 10 crew members agree:** This pattern must be used for all API polling operations. Store in RAG to prevent recurrence.

---

**🖖 Make it so!**

