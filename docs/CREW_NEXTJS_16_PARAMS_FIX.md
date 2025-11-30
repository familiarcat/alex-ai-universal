# 🔧 Crew Fix: Next.js 16 Async Params

**Date:** November 27, 2025  
**Issue:** Next.js 16 breaking change - `params` is now a Promise  
**Status:** ✅ **FIXED**

## Problem

Next.js 16 introduced a breaking change where dynamic route parameters (`params`) are now Promises and must be awaited before accessing their properties.

### Error Message
```
Error: Route "/api/progress/[taskId]" used `params.taskId`. 
`params` is a Promise and must be unwrapped with `await` or `React.use()` 
before accessing its properties.
```

## Solution

All dynamic route handlers were updated to:
1. Change `params` type from object to `Promise<object>`
2. Await `params` before accessing properties

## Files Fixed

### 1. `/api/progress/[taskId]/route.ts` ✅
**Before:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params;
```

**After:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
```

### 2. `/api/themes/project/[project]/route.ts` ✅
**Fixed both GET and POST handlers:**
```typescript
// Before: params: { project: string }
// After: params: Promise<{ project: string }>
const { project: projectId } = await params;
```

### 3. `/api/workflows/[id]/mermaid/route.ts` ✅
```typescript
// Before: params: { id: string }
// After: params: Promise<{ id: string }>
const { id: workflowId } = await params;
```

### 4. `/api/mcp/[...endpoint]/route.ts` ✅
```typescript
// Before: params: { endpoint: string[] }
// After: params: Promise<{ endpoint: string[] }>
const { endpoint: endpointArray } = await params;
const endpoint = endpointArray.join('/');
```

### 5. `/api/themes/[theme]/tokens/route.ts` ✅
```typescript
// Before: params: { theme: string }
// After: params: Promise<{ theme: string }>
const { theme: themeId = 'gradient' } = await params;
```

### 6. `/api/themes/project/[project]/tokens/route.ts` ✅
```typescript
// Before: params: { project: string }
// After: params: Promise<{ project: string }>
const { project } = await params;
```

## Pattern Applied

**Standard Pattern:**
```typescript
// ❌ OLD (Next.js 15 and earlier)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // ...
}

// ✅ NEW (Next.js 16+)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## Verification

After fixes:
- ✅ No linter errors
- ✅ All routes compile successfully
- ✅ Dev servers start without errors
- ✅ Dynamic routes work correctly

## Crew Consensus

**Commander Data:**
> "Analysis complete. Next.js 16 breaking change identified and resolved. All 6 dynamic route handlers updated. Error count: 0. System status: Optimal."

**Lieutenant Commander La Forge:**
> "Infrastructure update: Complete. All dynamic routes now properly await params. Next.js 16 compatibility achieved."

**Chief O'Brien:**
> "Simple fix, but important. All routes updated to use async params. No issues remaining."

**All 10 crew members agree:** ✅ Next.js 16 async params issue resolved.

## Related Documentation

- [Next.js 16 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js 16 Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)

---

**🖖 All Next.js 16 async params issues resolved.**

