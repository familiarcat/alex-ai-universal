# Timeout Error Handling

## Overview

Timeout errors from `AbortSignal.timeout()` are expected behavior when requests take too long. This document explains how we handle them gracefully without breaking the UI or flooding the console with errors.

## Problem

When `AbortSignal.timeout()` triggers, it throws a `TimeoutError` or `AbortError` that shows up in the console as a scary red error, even though:
- The timeout is intentional (prevents infinite hangs)
- The error is handled gracefully with fallbacks
- The UI continues to work with sample/fallback data

## Solution

### 1. Silent Timeout Handling

Timeout errors are now detected and handled silently:
- No `console.error()` for timeout errors
- Only non-timeout errors are logged
- Timeout detection includes:
  - `error.name === 'TimeoutError'`
  - `error.name === 'AbortError'`
  - `error.message.includes('timeout')`
  - `error.message.includes('signal timed out')`

### 2. Graceful Fallbacks

When timeouts occur:
- MCP requests fall back to n8n automatically
- Components use sample/fallback data
- UI continues to function normally
- Users see appropriate fallback messages

### 3. Proper HTTP Status Codes

API routes now return:
- `408 Request Timeout` for timeout errors
- `500 Internal Server Error` for actual errors
- `timeout: true` flag in response for client-side handling

## Implementation

### UnifiedDataService

```typescript
const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || 
                 error.message?.includes('timeout') || error.message?.includes('signal timed out');

if (!isTimeout) {
  // Only log non-timeout errors
  console.warn(`⚠️  MCP endpoint failed:`, error.message);
}
```

### API Routes

```typescript
catch (error: any) {
  const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || 
                   error.message?.includes('timeout');
  
  if (!isTimeout) {
    console.error(`❌ API error:`, error);
  }
  
  return NextResponse.json(
    { 
      success: false, 
      error: isTimeout ? 'Request timeout' : error.message,
      timeout: isTimeout
    },
    { status: isTimeout ? 408 : 500 }
  );
}
```

## Benefits

1. **Clean Console**: No scary red errors for expected timeouts
2. **Better UX**: Users see graceful fallbacks instead of error screens
3. **Proper Logging**: Real errors are still logged, timeouts are not
4. **Debugging**: Timeout flag in responses helps with debugging

## Timeout Values

- **MCP API calls**: 30 seconds (with 3 retries)
- **Health checks**: 3-5 seconds (quick checks)
- **Component data fetching**: 10-15 seconds (with fallbacks)

## Crew Review

- **Commander Data**: "Timeout detection is logically sound. The silent handling prevents console noise while preserving error visibility for actual issues."
- **Lt. Cmdr. La Forge**: "The fallback pattern ensures system resilience. Timeouts are infrastructure-level concerns, not user-facing errors."
- **Counselor Troi**: "Users never see scary timeout errors. The system gracefully degrades, maintaining user confidence."

