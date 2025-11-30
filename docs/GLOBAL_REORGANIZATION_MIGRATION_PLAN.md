# 🖖 Global Reorganization Migration Plan

**Date:** November 26, 2025  
**Status:** 📋 Ready for Execution  
**Crew Consensus:** ✅ Approved by Quark & Riker  
**DDD Compliance:** ✅ Maintained

---

## 🎯 Executive Summary

This migration reorganizes the Alex AI Universal structure to:
1. **Separate AI Framework from Applications** (DDD Bounded Contexts)
2. **Move Dashboard to `projects/`** (enables self-management)
3. **Organize Milestones by Category & Timestamp** (better discoverability)
4. **Maintain DDD Principles** throughout migration

---

## 👥 Crew Team Assignments (Quark-Optimized)

### Phase 1: Analysis & Planning
- **Team:** 🤖 Commander Data
- **Task:** Structure Analysis & Planning
- **Cost:** Low | **Efficiency:** 100%

### Phase 2: Core Migration
- **Team:** ⚔️ Lt. Worf
- **Task:** Security & Compliance Audit
- **Cost:** Low | **Efficiency:** 100%

- **Team:** 🔧 Lt. Cmdr. La Forge
- **Task:** Build System Updates
- **Cost:** Low | **Efficiency:** 100%

- **Team:** 🛠️ Chief O'Brien
- **Task:** Path & Import Updates
- **Cost:** Low | **Efficiency:** 67%

### Phase 3: Organization & Cleanup
- **Team:** 🛠️ Chief O'Brien
- **Task:** Milestone File Organization
- **Cost:** Low | **Efficiency:** 50%

- **Team:** ⚡ Commander Riker
- **Task:** Documentation Updates
- **Cost:** Low | **Efficiency:** 100%

### Phase 4: Validation & Testing
- **Team:** 🛠️ Chief O'Brien
- **Task:** Testing & Validation
- **Cost:** Low | **Efficiency:** 100%

**Total Estimated Cost:** Low (optimized by Quark)  
**Average Efficiency:** 88.1%

---

## 🏗️ DDD Architecture Compliance

### Current Bounded Contexts
- AI Integration Framework (root)
- Dashboard Application (dashboard/)
- MCP Server (mcp-server/)
- Crew Coordination (crew-members/)
- RAG System (supabase/)

### Proposed Bounded Contexts
- **AI Integration Framework (root)** - Core Domain
- **Project Management Domain (projects/)** - Supporting Domain
- **Dashboard Application (projects/dashboard/)** - Application Layer
- **MCP Server (mcp-server/)** - Infrastructure Layer
- **Crew Coordination (crew-members/)** - Domain Service

### DDD Layer Separation
- **Current:** Mixed (framework and application at same level)
- **Proposed:** Clear separation: Framework (root) → Projects (projects/) → Applications

### DDD Entity Organization
- **Current:** Projects scattered across multiple locations
- **Proposed:** Unified Project entity in `projects/` bounded context

---

## 📋 Migration Steps

### Step 1: Milestone Organization ✅
```bash
node scripts/organize-milestones-by-category.js
```
- **Status:** Complete
- **Result:** 96 milestones organized into 8 categories
- **Location:** `milestones-organized/` directory

### Step 2: Create Projects Directory
```bash
mkdir -p projects/
```
- Creates the new bounded context for project management

### Step 3: Move Dashboard
```bash
mv dashboard/ projects/dashboard/
```
- Moves dashboard to projects/ (enables self-management)
- Updates all path references automatically

### Step 4: Update Path References
- **Code Files:** ~50+ files with dashboard imports
- **Config Files:** package.json, next.config.js, etc.
- **Scripts:** All shell scripts referencing dashboard
- **Documentation:** All .md files with dashboard references

### Step 5: Update Build System
- Next.js config path aliases
- Package.json workspace configuration
- CI/CD pipeline paths
- Deployment scripts

### Step 6: Migrate Existing Projects
- Move `examples/` projects to `projects/`
- Move `output/` projects to `projects/`
- Move `managed-projects/` to `projects/`
- Keep `project-templates/` at root (templates, not projects)

### Step 7: Update Documentation
- Update all README files
- Update architecture docs
- Update deployment guides
- Update API documentation

### Step 8: Testing & Validation
- Test dashboard in new location
- Verify all imports work
- Test build process
- Test deployment
- Security audit

---

## 📊 Milestone Organization Results

### Categories Created (96 milestones total):
1. **N8N Workflows:** 29 milestones
2. **Crew Coordination:** 21 milestones
3. **Dashboard & UI:** 19 milestones
4. **RAG & Knowledge:** 12 milestones
5. **MCP Integration:** 6 milestones
6. **Testing & Quality:** 6 milestones
7. **Architecture & DDD:** 2 milestones
8. **New Features:** 1 milestone

### Structure:
```
milestones-organized/
├── n8n/
│   ├── 2025-01/
│   ├── 2025-11/
│   └── README.md
├── crew/
│   ├── 2025-01/
│   ├── 2025-11/
│   └── README.md
└── ...
```

---

## 🔄 Migration Script Usage

### Dry Run (Analysis Only)
```bash
node scripts/migrate-to-projects-structure.js --dry-run
```

### Full Migration
```bash
node scripts/migrate-to-projects-structure.js
```

### Rollback
```bash
# If needed, restore from git
git checkout HEAD -- dashboard/
```

---

## ✅ Pre-Migration Checklist

- [x] Crew coordination complete (Quark & Riker)
- [x] Milestone organization complete
- [x] Path reference analysis complete
- [ ] Backup current structure
- [ ] Create feature branch
- [ ] Review migration plan
- [ ] Execute migration
- [ ] Test thoroughly
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Production deployment

---

## 🚨 Risk Mitigation

### Rollback Plan
1. All changes tracked in git
2. Feature branch for safety
3. Incremental commits per phase
4. Can revert individual steps

### Testing Strategy
1. Test in feature branch first
2. Verify all imports resolve
3. Test build process
4. Test deployment scripts
5. Security audit by Worf

---

## 📄 Related Documents

- **Crew Coordination:** `reports/global-reorganization-coordination.json`
- **Milestone Organization:** `reports/milestone-organization.json`
- **Project Structure Analysis:** `reports/project-structure-reorganization.json`
- **Migration Script:** `scripts/migrate-to-projects-structure.js`
- **Milestone Organizer:** `scripts/organize-milestones-by-category.js`

---

**Status:** Ready for execution  
**Estimated Time:** 2-3 hours  
**Risk Level:** Medium (thorough testing required)  
**DDD Compliance:** ✅ Maintained

🖖 **Make it so!**

