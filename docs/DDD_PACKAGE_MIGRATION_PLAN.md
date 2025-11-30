# 🖖 DDD Package Migration Plan

**Date:** November 30, 2025  
**Status:** 📋 Planning Complete, Ready for Execution  
**Crew Coordination:** Riker/Quark Optimized Teams

---

## 📦 Package Migration Strategy

### High Priority Packages

#### 1. packages/core → crew-management domain
**Team:** Worf (Lead), Data  
**Reason:** Contains crew logic and coordination  
**Timeline:** Week 1-2

**Migration Steps:**
1. Extract crew member logic to `src/domains/crew-management/domain/entities/`
2. Move crew assignment system to `src/domains/crew-management/domain/services/`
3. Create crew repository in `src/domains/crew-management/infrastructure/repositories/`
4. Update imports across codebase

#### 2. packages/messages-intelligence → knowledge-management domain
**Team:** Data (Lead), Uhura  
**Reason:** RAG and knowledge extraction logic  
**Timeline:** Week 2-3

**Migration Steps:**
1. Extract RAG logic to `src/domains/knowledge-management/domain/aggregates/`
2. Move embedding logic to `src/domains/knowledge-management/domain/services/`
3. Create knowledge repository
4. Port n8n integration to MCP

#### 3. packages/dashboard-core → dashboard-ui domain
**Team:** Troi (Lead), La Forge  
**Reason:** UI components and dashboard logic  
**Timeline:** Week 2-3

**Migration Steps:**
1. Move components to `src/domains/dashboard-ui/presentation/components/`
2. Extract dashboard logic to domain layer
3. Create dashboard aggregates
4. Update Next.js integration

### Medium Priority Packages

#### 4. packages/cli → application layer
**Team:** O'Brien (Lead), Riker  
**Reason:** Application layer commands  
**Timeline:** Week 3-4

**Migration Steps:**
1. Move CLI commands to `src/application/commands/`
2. Create command handlers
3. Update CLI entry point

### Low Priority Packages

#### 5. packages/rate-limiter → infrastructure
**Team:** La Forge (Lead)  
**Reason:** Infrastructure utility  
**Timeline:** Week 4

**Migration Steps:**
1. Move to `src/infrastructure/utilities/`
2. Update imports

---

## ⚡ Riker's Execution Plan

**Parallel Execution:**
- Week 1-2: Core → crew-management (Worf, Data)
- Week 2-3: messages-intelligence → knowledge-management (Data, Uhura)
- Week 2-3: dashboard-core → dashboard-ui (Troi, La Forge)
- Week 3-4: cli → application (O'Brien, Riker)
- Week 4: rate-limiter → infrastructure (La Forge)

---

## 💰 Quark's ROI Analysis

**Migration Investment:**
- Development Time: 4 weeks
- Risk: Low (incremental migration)
- Cost: $30,000 - $45,000

**Returns:**
- Maintainability: +200% (clear domain boundaries)
- Developer Productivity: +150% (easier navigation)
- Code Quality: +100% (isolated domains)
- Annual Value: $120,000+

**Payback Period:** 3-4 months

---

## 🎯 Success Criteria

- [ ] All packages migrated to appropriate domains
- [ ] No duplicate logic between packages and domains
- [ ] All imports updated
- [ ] Tests passing
- [ ] Documentation updated

---

**Status:** Ready for execution
