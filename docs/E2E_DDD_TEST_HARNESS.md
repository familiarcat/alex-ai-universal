# 🧪 End-to-End DDD Integration Test Harness

**Date:** November 24, 2025  
**Status:** ✅ Implemented  
**Purpose:** Verify complete DDD architecture across all layers

---

## 📋 Overview

The E2E DDD Test Harness verifies that the complete system operates correctly within Domain-Driven Design (DDD) architecture:

- **Browser Layer** (Next.js) - Presentation
- **Controller Layer** (MCP Server) - Application logic
- **Data Layer** (Supabase) - Persistence

### Architecture Flow

```
Browser (Next.js UI)
    ↓
Next.js API Routes
    ↓
MCP Controller Layer
    ↓
Supabase Database
```

---

## 🎯 Test Coverage

### 1. DDD Architecture Boundary Verification

**Test:** `testDDDBoundary()`

Verifies that:
- Browser layer does NOT directly access Supabase
- All database operations flow through MCP controller
- Proper separation of concerns maintained

**Checks:**
- Scans Next.js API routes for direct Supabase imports
- Verifies no direct `createClient` calls from browser layer
- Ensures all database access goes through MCP

### 2. MCP Controller Layer Verification

**Test:** `testMCPControllerLayer()`

Verifies that:
- MCP server tools are available
- MCP endpoints are accessible
- Controller layer functions correctly

**Checks:**
- `get_crew_memories` tool
- `search_crew_memories` tool
- `optimize_openrouter_model` tool
- `call_openrouter_llm` tool
- `optimize_task_assignment` tool

### 3. Next.js → MCP → Supabase Flow

**Test:** `testNextJSMCPFlow()`

Verifies that:
- Complete request flow works end-to-end
- API calls route through proper layers
- Data consistency maintained

**Sub-tests:**
- Knowledge Query API flow
- MCP Status API flow
- Crew memories flow

### 4. Vector-Based Dashboard Integration

**Test:** `testVectorDashboardIntegration()`

Verifies that:
- Vector embeddings table exists
- Vector priority dashboard page accessible
- Vector system integrates correctly

**Checks:**
- `vector_embeddings` table accessibility
- Dashboard page route (`/dashboard/vector-priority`)
- Vector priority calculations

### 5. Supabase Operations Through MCP

**Test:** `testSupabaseThroughMCP()`

Verifies that:
- All Supabase operations go through MCP
- No direct database access from browser
- MCP acts as single point of access

### 6. Data Consistency

**Test:** `testDataConsistency()`

Verifies that:
- Data is consistent across layers
- MCP and direct Supabase queries match
- No data discrepancies

---

## 🌐 Browser-Based Tests

### Browser E2E Test Suite

**File:** `scripts/test/e2e-ddd-browser-test.js`

Uses Puppeteer to test:
- UI interactions
- API calls from browser
- Vector dashboard functionality
- Real user workflows

**Tests:**
1. Vector Priority Dashboard Page
2. API Calls Through Browser
3. Vector Priority System Integration

---

## 🚀 Usage

### Run Integration Tests

```bash
npm run test:e2e:ddd
```

### Run Browser Tests

```bash
npm run test:e2e:browser
```

### Run All Tests

```bash
npm run test:e2e:all
```

---

## 📊 Test Results

### Report Location

Test reports are saved to:
```
reports/e2e-ddd-test-report.json
```

### Report Format

```json
{
  "timestamp": "2025-11-24T...",
  "summary": {
    "passed": 10,
    "failed": 0,
    "warnings": 2
  },
  "results": {
    "passed": [...],
    "failed": [...],
    "warnings": [...]
  }
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Next.js server URL
NEXTJS_BASE_URL=http://localhost:3000

# MCP server URL
MCP_SERVER_URL=http://localhost:3001

# Supabase credentials (loaded from ~/.zshrc)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Prerequisites

1. **Next.js Server Running**
   ```bash
   cd dashboard
   npm run dev
   ```

2. **MCP Server Running** (optional for some tests)
   ```bash
   node lib/mcp-crew-memories-server.js
   ```

3. **Supabase Configured**
   - Credentials in `~/.zshrc`
   - Schema deployed
   - Tables accessible

---

## ⚠️ Known Issues

### Direct Supabase Access in API Routes

**Issue:** Some Next.js API routes directly access Supabase (e.g., `dashboard/app/api/knowledge/query/route.ts`)

**Status:** ⚠️ Warning (not a failure)

**Reason:** Fallback pattern for when MCP is unavailable

**Recommendation:** Migrate to MCP controller layer

**Example:**
```typescript
// Current (direct Supabase access)
const response = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_base...`);

// Recommended (through MCP)
const response = await fetch('/api/mcp/knowledge/query', {
  method: 'POST',
  body: JSON.stringify({ category, limit })
});
```

---

## 🎯 DDD Architecture Rules

### ✅ Allowed Patterns

1. **Browser → Next.js API Route**
   ```typescript
   // Browser
   fetch('/api/knowledge/query')
   ```

2. **Next.js API Route → MCP Controller**
   ```typescript
   // API Route
   const mcpResponse = await callMCPTool('get_crew_memories', { crewMember: 'data' });
   ```

3. **MCP Controller → Supabase**
   ```typescript
   // MCP Server
   const { data } = await supabase.from('crew_memories').select('*');
   ```

### ❌ Disallowed Patterns

1. **Browser → Direct Supabase**
   ```typescript
   // ❌ NOT ALLOWED
   const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
   ```

2. **Next.js API Route → Direct Supabase** (should use MCP)
   ```typescript
   // ❌ NOT RECOMMENDED (use MCP instead)
   const { data } = await supabase.from('table').select('*');
   ```

---

## 📈 Test Metrics

### Success Criteria

- ✅ All DDD boundary tests pass
- ✅ MCP controller layer accessible
- ✅ Next.js → MCP → Supabase flow works
- ✅ Vector dashboard integration functional
- ⚠️ Warnings acceptable for fallback patterns

### Failure Criteria

- ❌ Direct Supabase access from browser
- ❌ MCP tools unavailable
- ❌ Data inconsistency across layers
- ❌ Vector system not accessible

---

## 🔮 Future Enhancements

### Planned Tests

1. **Performance Tests**
   - Response time measurements
   - Throughput testing
   - Load testing

2. **Security Tests**
   - Authentication flow
   - Authorization checks
   - Data access controls

3. **Integration Tests**
   - Cross-layer communication
   - Error handling
   - Retry mechanisms

4. **Visual Regression Tests**
   - Dashboard UI consistency
   - Component rendering
   - Responsive design

---

## 🖖 Crew Notes

**Commander Data:** "The test harness ensures logical consistency across all architectural layers, maintaining proper separation of concerns."

**Lieutenant Worf:** "Security boundaries are verified, preventing unauthorized direct database access."

**Chief O'Brien:** "The tests verify that our pragmatic fallback patterns don't compromise the overall architecture."

---

**Status:** Production Ready ✅  
**Last Updated:** November 24, 2025

