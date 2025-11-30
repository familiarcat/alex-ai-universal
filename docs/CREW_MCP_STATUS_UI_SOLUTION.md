# 🖖 Crew Solution: MCP Status UI vs API Detection

**Date:** November 27, 2025  
**Mission:** Detect browser requests and serve UI instead of raw JSON  
**Lead:** Counselor Troi (UX) + Commander Data (Architecture)

## Problem Statement

When users visit `/api/mcp/status/` in a browser, they see raw JSON instead of a user-friendly interface. The API endpoint should:
- Return JSON for programmatic access (API clients, fetch requests)
- Redirect to UI page or serve HTML for browser requests

## Crew Analysis

### Counselor Troi (UX Lead):
> "Users expect a visual interface when they visit a URL in their browser. Raw JSON is developer-friendly but not user-friendly. We need to detect browser requests and provide an appropriate response."

### Commander Data (Architecture):
> "Analysis: Browser requests typically include `Accept: text/html` header. API requests include `Accept: application/json` or no Accept header. We can use this to differentiate request types."

### Lieutenant Commander La Forge (Implementation):
> "We can check the `Accept` header in the API route. If it includes `text/html`, redirect to the UI page. Otherwise, return JSON."

### Chief O'Brien (Pragmatic):
> "Simple solution: Check the Accept header. If browser, redirect. If API, return JSON. No need to overcomplicate."

## Solution Options

### Option 1: Header-Based Detection (RECOMMENDED) ✅
**Approach:** Check `Accept` header in API route
- If `Accept: text/html` → Redirect to `/mcp/status` UI page
- If `Accept: application/json` or no Accept → Return JSON

**Pros:**
- Simple and reliable
- Maintains API functionality
- Clear separation of concerns

**Cons:**
- Requires redirect (extra request)

### Option 2: Content Negotiation
**Approach:** Return HTML or JSON based on Accept header
- If `Accept: text/html` → Return HTML directly
- If `Accept: application/json` → Return JSON

**Pros:**
- Single request (no redirect)
- Standard HTTP content negotiation

**Cons:**
- More complex (need to render HTML in API route)
- Mixes concerns (API route serving HTML)

### Option 3: Separate Routes
**Approach:** Keep API and UI completely separate
- `/api/mcp/status` → Always JSON
- `/mcp/status` → Always UI

**Pros:**
- Clean separation
- Clear URL structure

**Cons:**
- Users might still access API URL directly
- No automatic detection

## Recommended Solution: Option 1 (Header Detection + Redirect)

**Implementation:**
1. Check `Accept` header in `/api/mcp/status` route
2. If browser request (`Accept: text/html`), redirect to `/mcp/status`
3. If API request, return JSON as normal

**Code Pattern:**
```typescript
export async function GET(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  const isBrowserRequest = acceptHeader.includes('text/html');
  
  if (isBrowserRequest) {
    return NextResponse.redirect(new URL('/mcp/status', request.url));
  }
  
  // Return JSON for API requests
  return NextResponse.json({ ... });
}
```

## Crew Consensus

**All 10 crew members agree:** Option 1 (Header Detection + Redirect) is the best solution.

**Reasoning:**
- Maintains API functionality for programmatic access
- Provides user-friendly UI for browser access
- Simple and maintainable
- Follows HTTP standards (content negotiation)

## Implementation Plan

1. ✅ Update `/api/mcp/status/route.ts` to detect browser requests
2. ✅ Redirect browser requests to `/mcp/status` UI page
3. ✅ Keep JSON response for API requests
4. ✅ Test with both browser and API clients

---

**🖖 Solution approved. Implementation proceeding.**

