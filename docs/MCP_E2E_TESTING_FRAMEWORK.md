# 🖖 MCP E2E Testing Framework

**Date:** 2025-01-24  
**Status:** ✅ Complete  
**Framework:** End-to-End MCP Integration Testing

---

## 🎯 Overview

Comprehensive E2E testing framework for MCP-first DDD architecture. Tests the complete data flow from UI components through MCP server to Supabase.

---

## 🏗️ Architecture Under Test

```
UI Component
  ↓
UnifiedDataService (getUnifiedDataService())
  ↓
Next.js API Route (/api/mcp/[endpoint])
  ↓
MCP Server (mcp.pbradygeorgen.com)
  ↓
Supabase (Data Layer)
```

**Fallback Flow:**
```
UI Component
  ↓
UnifiedDataService
  ↓ (if MCP unavailable)
n8n Webhook (n8n.pbradygeorgen.com)
  ↓
Supabase
```

---

## 🧪 Test Suite

### Infrastructure Tests

1. **MCP Server Health Check**
   - Tests: `GET /healthz`
   - Verifies: MCP server is operational
   - Required: MCP server must be running

2. **n8n Fallback Availability**
   - Tests: `GET /healthz` on n8n
   - Verifies: Fallback mechanism is available
   - Required: n8n server should be available

### Component Tests (10 Components)

For each component, tests:

1. **MCP Endpoint Direct Access**
   - Tests: Direct POST to MCP endpoint
   - Verifies: Endpoint responds with valid data structure
   - Example: `POST /crew/stats`

2. **MCP Proxy Route**
   - Tests: Next.js API route proxy
   - Verifies: Proxy forwards requests correctly
   - Example: `POST /api/mcp/crew/stats`

3. **UnifiedDataService Integration**
   - Tests: Service method exists
   - Verifies: Method signature is correct
   - Example: `service.getCrewStats()`

4. **Component Refactoring**
   - Tests: Component uses UnifiedDataService
   - Verifies: No direct API calls (DDD compliance)
   - Example: Checks `CrewMemoryVisualization.tsx`

5. **End-to-End Flow**
   - Tests: Complete chain exists
   - Verifies: All components of flow are present
   - Example: Component → Service → Proxy → MCP → Supabase

---

## 📋 Tested Components

1. **CrewMemoryVisualization**
   - Service: `getCrewStats()`
   - Endpoint: `crew/stats`

2. **LearningAnalyticsDashboard**
   - Service: `getLearningMetrics()`
   - Endpoint: `learning/metrics`

3. **RAGProjectRecommendations**
   - Service: `getProjectRecommendations()`
   - Endpoint: `project/recommendations`

4. **RAGSelfDocumentation**
   - Service: `getDocumentation()`
   - Endpoint: `documentation`

5. **SecurityAssessmentDashboard**
   - Service: `getSecurityData()`
   - Endpoint: `security/assessment`

6. **CostOptimizationMonitor**
   - Service: `getCostData()`
   - Endpoint: `cost/optimization`

7. **UserExperienceAnalytics**
   - Service: `getUXData()`
   - Endpoint: `ux/analytics`

8. **AIImpactAssessment**
   - Service: `getAssessmentData()`
   - Endpoint: `ai/impact`

9. **ProcessDocumentationSystem**
   - Service: `getProcesses()`
   - Endpoint: `process/documentation`

10. **DataSourceIntegrationPanel**
    - Service: `getDataSources()`
    - Endpoint: `data/sources`

---

## 🚀 Usage

### Run All Tests

```bash
# From project root
npm run test:e2e:mcp

# Or directly
node scripts/test/e2e-mcp-integration-test.js
```

### Test Specific Component

```bash
npm run test:e2e:mcp:component=CrewMemoryVisualization

# Or directly
node scripts/test/e2e-mcp-integration-test.js --component=CrewMemoryVisualization
```

### Run All E2E Tests

```bash
npm run test:e2e:all
```

### Run via Test Harness

```bash
cd test-harness
npm test
```

---

## 📊 Test Results

### Report Location

Test results are saved to:
```
reports/mcp-e2e-test-report.json
```

### Report Structure

```json
{
  "timestamp": "2025-01-24T...",
  "summary": {
    "total": 55,
    "passed": 50,
    "failed": 2,
    "warnings": 3,
    "skipped": 0,
    "successRate": "96.2%"
  },
  "results": {
    "passed": [...],
    "failed": [...],
    "warnings": [...],
    "skipped": [...]
  },
  "componentResults": [...]
}
```

---

## ✅ Test Criteria

### Pass Criteria

- ✅ MCP server responds to health check
- ✅ MCP endpoint returns valid data structure
- ✅ Proxy route forwards requests correctly
- ✅ UnifiedDataService method exists
- ✅ Component uses UnifiedDataService (no direct API calls)
- ✅ Complete E2E flow chain exists

### Failure Criteria

- ❌ MCP server not accessible
- ❌ MCP endpoint returns error
- ❌ Proxy route fails
- ❌ UnifiedDataService method missing
- ❌ Component has direct API calls (DDD violation)
- ❌ E2E flow chain incomplete

### Warning Criteria

- ⚠️ Next.js server not running (proxy tests skipped)
- ⚠️ n8n server not accessible (fallback unavailable)
- ⚠️ Unexpected response structure (but endpoint works)

---

## 🔧 Configuration

### Environment Variables

```bash
# MCP Configuration
MCP_URL=https://mcp.pbradygeorgen.com
MCP_API_KEY=your-api-key

# n8n Configuration (fallback)
N8N_URL=https://n8n.pbradygeorgen.com
N8N_API_KEY=your-api-key

# Next.js Configuration
NEXTJS_BASE_URL=http://localhost:3000
```

### Credentials Loading

The framework automatically loads credentials from:
1. Environment variables
2. `~/.zshrc` file

---

## 🖖 Integration with Test Harness

The MCP E2E test is integrated into the main test harness:

```bash
cd test-harness
npm test
```

This runs:
- CLI tests
- Extension tests
- Web interface tests
- **MCP E2E tests** (new)

---

## 📈 Success Metrics

- **Target Success Rate:** >95%
- **Required Tests:** All infrastructure tests must pass
- **Component Tests:** At least 8/10 components must pass
- **DDD Compliance:** 100% (no direct API calls)

---

## 🐛 Troubleshooting

### MCP Server Not Accessible

**Symptom:** Health check fails  
**Solution:**
1. Verify MCP server is running: `curl https://mcp.pbradygeorgen.com/healthz`
2. Check DNS resolution
3. Verify firewall rules
4. Check MCP server logs

### Next.js Server Not Running

**Symptom:** Proxy route tests skipped  
**Solution:**
1. Start Next.js dev server: `cd dashboard && npm run dev`
2. Verify server is accessible: `curl http://localhost:3000/api/health`

### API Key Issues

**Symptom:** 401 Unauthorized errors  
**Solution:**
1. Verify `MCP_API_KEY` or `N8N_API_KEY` in environment
2. Check `~/.zshrc` for credentials
3. Verify API key is valid

---

## 🎯 Next Steps

1. **Add Browser Testing:** Use Playwright/Puppeteer for real browser tests
2. **Add Performance Tests:** Measure response times
3. **Add Load Tests:** Test under concurrent requests
4. **Add Visual Regression:** Screenshot comparison
5. **Add CI/CD Integration:** Run tests on every commit

---

**Status:** ✅ Complete  
**Framework:** Ready for use  
**Integration:** ✅ Test harness integrated

