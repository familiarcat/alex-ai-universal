# 🖖 Project Structure Reorganization Plan

**Date:** November 26, 2025  
**Status:** 📋 Proposed  
**Crew Consensus:** ✅ Approved

---

## 🎯 Executive Summary

The crew has analyzed the current Alex AI Universal structure and identified a critical architectural distinction:

- **AI Integration Framework**: Core system (packages, scripts, MCP server, crew coordination)
- **Dashboard Application**: Next.js project that should manage itself and all other projects

**Recommendation**: Reorganize to separate the framework from managed projects, moving the dashboard into a `projects/` folder where it can manage itself and all other Next.js projects.

---

## 📊 Current Structure Analysis

### Current Issues Identified

1. **Dashboard is at root level**, mixing AI framework with application
2. **No clear separation** between framework and managed projects
3. **Dashboard cannot easily manage itself** as a project
4. **Multiple project locations** (examples/, output/, managed-projects/)
5. **No unified project management hierarchy**

### Current Locations

```
alex-ai-universal/
├── packages/              # AI Framework
├── scripts/               # AI Framework
├── mcp-server/            # AI Framework
├── crew-members/          # AI Framework
├── dashboard/             # ❌ Should be in projects/
├── examples/              # ❌ Scattered projects
├── output/                # ❌ Scattered projects
├── managed-projects/      # ❌ Scattered projects
└── project-templates/     # ❌ Scattered projects
```

---

## 🏗️ Proposed Structure

### New Hierarchy

```
alex-ai-universal/
├── packages/              # AI Framework
├── scripts/               # AI Framework
├── mcp-server/            # AI Framework
├── crew-members/          # AI Framework
├── crew-memories/         # AI Framework
├── n8n-workflows/         # AI Framework
├── supabase/              # AI Framework
├── lib/                   # AI Framework
├── bin/                   # AI Framework
├── package.json           # Root workspace config
│
└── projects/              # ✅ All Next.js Projects
    ├── dashboard/         # Main dashboard (manages itself + others)
    ├── project-1/         # User-created project
    ├── project-2/         # User-created project
    └── ...
```

### Key Benefits

1. **Clear Separation**: Framework vs managed projects
2. **Self-Management**: Dashboard can manage itself as a project
3. **Unified Location**: All Next.js apps in one place
4. **Easier Discovery**: Single source of truth for projects
5. **Better Scaling**: Organized structure for growth
6. **Project Manager**: Dashboard becomes the central manager

---

## 🔄 Migration Plan

### Phase 1: Preparation
1. Create `projects/` directory
2. Document all current path references
3. Create backup of current structure
4. Identify all import paths that need updating

### Phase 2: Dashboard Migration
1. Move `dashboard/` → `projects/dashboard/`
2. Update `next.config.js` path aliases
3. Update all import statements in dashboard
4. Update build scripts
5. Update deployment configurations

### Phase 3: Project Consolidation
1. Migrate `examples/` projects to `projects/`
2. Migrate `output/` projects to `projects/`
3. Migrate `managed-projects/` to `projects/`
4. Keep `project-templates/` at root (templates, not projects)

### Phase 4: Framework Updates
1. Update scripts that reference dashboard
2. Update documentation
3. Update CI/CD pipelines
4. Update workspace configurations

### Phase 5: Dashboard Self-Management
1. Add dashboard to its own project list
2. Implement self-management UI
3. Test dashboard managing itself
4. Update project creation to use new structure

---

## 🛠️ Technical Considerations

### Path Updates Required

**Before:**
```typescript
import { something } from '@/lib/utils';
import { Component } from '../../components/Component';
```

**After:**
```typescript
// Dashboard can still use @/ aliases (relative to projects/dashboard/)
import { something } from '@/lib/utils';
// But framework imports need to go up
import { something } from '../../../packages/core';
```

### Next.js Configuration

**Update `projects/dashboard/next.config.js`:**
```javascript
const path = require('path');

module.exports = {
  // Update path aliases to account for new location
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname),
      '@framework': path.join(__dirname, '../../packages'),
    };
    return config;
  },
};
```

### Build Scripts

**Update root `package.json`:**
```json
{
  "scripts": {
    "dashboard:dev": "cd projects/dashboard && npm run dev",
    "dashboard:build": "cd projects/dashboard && npm run build",
    "dashboard:start": "cd projects/dashboard && npm start"
  }
}
```

---

## 📋 Crew Recommendations

### 🎖️ Captain Picard
> "This reorganization establishes clear boundaries between our framework and applications. The dashboard should be elevated to manage ALL projects, including itself. This is a strategic move that will serve us well as we scale."

### ⚡ Commander Riker
> "Tactically, consolidating all projects under `projects/` creates a single source of truth. The dashboard becomes the project manager, which simplifies operations significantly."

### 🤖 Commander Data
> "Technically, this requires updating approximately 50+ import paths and 15+ configuration files. However, the benefits in code organization and maintainability are significant. I recommend creating an automated migration script."

### 🔧 Lt. Cmdr. La Forge
> "Infrastructure-wise, we need to update deployment scripts, CI/CD pipelines, and build configurations. The new structure will actually simplify our deployment process once migrated."

### 🛠️ Chief O'Brien
> "Pragmatically, this is a significant change but necessary. I recommend a phased approach with thorough testing at each step. We should create a rollback plan."

### 💰 Quark
> "From a resource perspective, this reduces confusion and maintenance overhead. The unified structure will save time and reduce errors. The migration cost is one-time, but the benefits are ongoing."

---

## ✅ Next Steps

1. **Review this plan** with the team
2. **Create migration script** to automate path updates
3. **Test migration** in a branch
4. **Update documentation** as we go
5. **Implement dashboard self-management** features
6. **Deploy** the new structure

---

## 📄 Related Documents

- Full crew analysis: `reports/project-structure-reorganization.json`
- Migration script: `scripts/migrate-to-projects-structure.js` (to be created)
- Dashboard self-management: `docs/DASHBOARD_SELF_MANAGEMENT.md` (to be created)

---

**Status**: Ready for implementation  
**Priority**: High  
**Estimated Effort**: 2-3 days  
**Risk Level**: Medium (requires thorough testing)

