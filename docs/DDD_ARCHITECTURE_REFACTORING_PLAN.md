# 🖖 DDD Architecture Refactoring Plan

**Mission:** Fix systemic DDD violations and create intuitive, dynamically-generated UI components  
**Date:** 2025-01-24  
**Commander:** Riker (Tactical Coordination)  
**Crew:** Full complement engaged

---

## 🎯 Mission Objectives

### 1. **Separation of Concerns (DDD Compliance)**
- ✅ UI Components → MCP/n8n Controller → Supabase
- ❌ **CURRENT VIOLATION:** Components fetching directly from `/api/knowledge/query`
- **Fix:** All data access must flow through n8n webhooks

### 2. **Design System Integration**
- All components logically linked
- Global navigation system
- Intuitive component organization

### 3. **Dynamic Component Generation**
- Data, Troi, and La Forge analyze application features
- Generate thoughtful, intuitive UI components
- Relative to tasks and goals

### 4. **Cost-Benefit Analysis**
- Quark and Troi evaluate emotional/intuitive values
- Overall encompassing analysis

---

## 🔍 Current Violations Identified

### Components Violating DDD (Direct API Calls):

1. **CrewMemoryVisualization.tsx**
   - ❌ Direct: `fetch('/api/knowledge/query?limit=100')`
   - ✅ Should: Use n8n webhook → Supabase

2. **LearningAnalyticsDashboard.tsx**
   - ❌ Direct: `fetch('/api/knowledge/query?limit=1000')`
   - ✅ Should: Use n8n webhook → Supabase

3. **RAGProjectRecommendations.tsx**
   - ❌ Direct: `fetch('/api/knowledge/query?category=project-insights&limit=5')`
   - ✅ Should: Use n8n webhook → Supabase

4. **RAGSelfDocumentation.tsx**
   - ❌ Direct fetch (needs investigation)
   - ✅ Should: Use n8n webhook → Supabase

5. **SecurityAssessmentDashboard.tsx**
   - ❌ Direct fetch (needs investigation)
   - ✅ Should: Use n8n webhook → Supabase

6. **CostOptimizationMonitor.tsx**
   - ❌ Direct fetch (needs investigation)
   - ✅ Should: Use n8n webhook → Supabase

7. **UserExperienceAnalytics.tsx**
   - ❌ Direct fetch (needs investigation)
   - ✅ Should: Use n8n webhook → Supabase

8. **AIImpactAssessment.tsx**
   - ❌ Direct fetch (needs investigation)
   - ✅ Should: Use n8n webhook → Supabase

9. **ProcessDocumentationSystem.tsx**
   - ❌ Direct fetch (needs investigation)
   - ✅ Should: Use n8n webhook → Supabase

10. **DataSourceIntegrationPanel.tsx**
    - ❌ Direct fetch (needs investigation)
    - ✅ Should: Use n8n webhook → Supabase

11. **LiveRefreshDashboard.tsx**
    - ❌ Invalid hook call (useCallback in useEffect)
    - ✅ Fix: Move useCallback outside useEffect

---

## 🏗️ Architecture Solution

### Proper DDD Flow:

```
UI Component
  ↓
UnifiedDataService
  ↓
MCP Server (PRIMARY Controller Layer) → mcp.pbradygeorgen.com
  ↓ (if MCP unavailable)
n8n Webhook (FALLBACK Controller Layer) → n8n.pbradygeorgen.com
  ↓
Supabase (Data Layer)
  ↓
Response flows back through same path
```

**Architecture Notes:**
- **MCP is PRIMARY**: All data access should route through MCP first
- **n8n is FALLBACK**: Only used when MCP is unavailable
- **Migration Complete**: n8n to MCP migration completed per milestones
- **MCP Server**: Deployed at https://mcp.pbradygeorgen.com

### Implementation Pattern:

```typescript
// ❌ WRONG (Current - Direct API call)
const response = await fetch('/api/knowledge/query?limit=100');

// ✅ CORRECT (DDD Compliant - MCP Primary, n8n Fallback)
import { getUnifiedDataService } from '@/lib/unified-data-service';
const service = getUnifiedDataService();
const data = await service.queryKnowledge({ limit: 100 });
// This automatically tries MCP first, falls back to n8n if needed
```

---

## 📋 Crew Assignments

### **Commander Data** 🤖
**Task:** Technical analysis and component generation logic
- Analyze all components for DDD violations
- Create unified data access layer
- Generate component refactoring patterns
- Document proper data flow

### **Counselor Troi** 💭
**Task:** UX analysis and intuitive design
- Analyze component relationships
- Design intuitive navigation system
- Ensure emotional/intuitive value
- User experience optimization

### **Lieutenant Commander La Forge** 🔧
**Task:** Infrastructure and data flow architecture
- Design n8n webhook endpoints
- Ensure proper data flow
- Infrastructure health monitoring
- Performance optimization

### **Commander Riker** ⚡
**Task:** Mission optimization and tactical coordination
- Coordinate crew efforts
- Prioritize refactoring tasks
- Ensure mission success
- Tactical execution

### **Quark** 💰
**Task:** Cost-benefit analysis and value optimization
- Analyze refactoring costs
- Evaluate emotional/intuitive values
- ROI calculations
- Business optimization

### **Lieutenant Worf** ⚔️
**Task:** Security audit
- Ensure secure data flow
- Audit webhook security
- Verify authentication
- Security compliance

### **Dr. Crusher** 💊
**Task:** System health monitoring
- Monitor refactoring impact
- Health diagnostics
- Error prevention
- System stability

---

## 🚀 Implementation Phases

### Phase 1: Create Unified Data Access Layer
- [ ] Create `dashboard/lib/unified-data-service.ts` (client-side)
- [ ] Create n8n webhook endpoints for all data queries
- [ ] Document data flow patterns

### Phase 2: Refactor Components
- [ ] Refactor all 11+ components to use unified service
- [ ] Fix LiveRefreshDashboard hook violation
- [ ] Test each component individually

### Phase 3: Design System Integration
- [ ] Create global navigation system
- [ ] Link all components logically
- [ ] Create component registry

### Phase 4: Dynamic Component Generation
- [ ] Data + Troi + La Forge analyze features
- [ ] Generate component recommendations
- [ ] Implement dynamic component system

### Phase 5: Cost-Benefit Analysis
- [ ] Quark + Troi evaluate values
- [ ] Generate comprehensive analysis
- [ ] Optimize based on findings

---

## 📊 Success Metrics

- ✅ Zero direct API calls from UI components
- ✅ All data flows through n8n webhooks
- ✅ 100% DDD compliance
- ✅ All components in design system
- ✅ Global navigation functional
- ✅ Dynamic component generation working
- ✅ Cost-benefit analysis complete

---

**Status:** Ready for crew coordination and execution  
**Next Step:** Crew analysis and implementation plan

