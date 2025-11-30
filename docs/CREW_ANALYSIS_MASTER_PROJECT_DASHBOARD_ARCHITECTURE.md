# 🖖 Crew Analysis: Master Dashboard + Project-Specific Dashboard Architecture

**Date:** November 27, 2025  
**Mission:** Redesign dashboard architecture to support master control + per-project dashboards  
**Crew Lead:** Captain Picard (Strategic Vision)  
**Crew:** All Officers (Full Analysis)

---

## 🎯 Vision Statement

**Master Dashboard** → Controls ALL projects (orchestration layer)  
**Project Dashboards** → Each project has its own dashboard that:
- Dynamically orients visual components based on project-specific needs
- Updates only explicit variations from the template
- Allows template customization per project

---

## 📊 Current Architecture Analysis

### Current State (Commander Data)

**Master Dashboard (`/dashboard`):**
- Single dashboard managing all projects
- Shows all projects in one view
- Global theme controls
- Project editing via tabs
- Components managed globally

**Project Structure:**
- Projects stored in `state-manager.tsx`
- Each project has: `headline`, `subheadline`, `description`, `theme`, `components[]`
- Components are generic (hero, header, footer, feature, etc.)
- No project-specific dashboard views

**Template System:**
- Templates exist in `packages/core/src/project-template-generator.ts`
- Templates define project structure and dependencies
- No per-project template inheritance or variation tracking

---

## 🏗️ Proposed Architecture

### 1. Master Dashboard (Commander Riker - Tactical)

**Purpose:** Central control center for all projects

**Responsibilities:**
- List all projects (grid/card view)
- Create new projects
- Delete/archive projects
- Global theme management
- Project status overview
- Quick actions (deploy, preview, edit)
- Cross-project analytics

**Location:** `/dashboard` (existing)

**Components:**
- `ProjectGrid` - Visual grid of all projects
- `ProjectCard` - Individual project card with quick actions
- `GlobalThemeSelector` - Master theme controls
- `ProjectStatusOverview` - Health/status dashboard
- `QuickActions` - Bulk operations

**Data Flow:**
```
Master Dashboard
  ↓ (selects project)
Project-Specific Dashboard
  ↓ (edits project variations)
Template + Variations → Supabase
```

---

### 2. Project-Specific Dashboard (Counselor Troi - UX)

**Purpose:** Focused editing interface for individual projects

**Responsibilities:**
- Show only THIS project's data
- Display template as baseline (read-only reference)
- Edit only variations from template
- Dynamic component orientation based on project type
- Template customization per project
- Live preview of project

**Location:** `/dashboard/projects/[projectId]`

**Key Features:**
1. **Template Baseline View** (read-only)
   - Shows what the template provides
   - Grayed out / disabled state
   - "This is from template" indicator

2. **Variations Editor** (editable)
   - Only shows fields that differ from template
   - "Customized" badges on modified fields
   - "Reset to template" buttons

3. **Dynamic Component Orientation**
   - Business projects → Data tables, charts, metrics
   - Creative projects → Galleries, portfolios, narratives
   - E-commerce → Product grids, cart, checkout flows
   - SaaS → Feature lists, pricing tables, integrations

4. **Template Customization**
   - "Customize Template" mode
   - Save customizations as new template variant
   - Apply customizations to other projects

**Components:**
- `ProjectHeader` - Project name, theme, status
- `TemplateBaseline` - Read-only template reference
- `VariationsEditor` - Editable variations
- `ComponentOrienter` - Dynamic component layout
- `LivePreview` - Real-time preview
- `TemplateCustomizer` - Template customization UI

---

### 3. Template System Enhancement (Commander Data - Technical)

**Current Template Structure:**
```typescript
interface ProjectTemplate {
  name: string;
  type: 'nextjs' | 'react' | 'node' | 'typescript';
  alexAIFeatures: UniversalFeatureSet;
  dependencies: { [key: string]: string };
  // ... no variation tracking
}
```

**Enhanced Template Structure:**
```typescript
interface ProjectTemplate {
  id: string;
  name: string;
  type: 'business' | 'creative' | 'ecommerce' | 'saas';
  baseComponents: ComponentTemplate[];
  defaultTheme: string;
  defaultConfig: ProjectConfig;
  // NEW: Variation tracking
  variationFields: string[]; // Fields that can be customized
  lockedFields: string[]; // Fields that cannot be customized
}

interface ProjectInstance {
  id: string;
  templateId: string;
  templateVersion: string;
  // NEW: Only store variations
  variations: {
    [field: string]: any; // Only fields that differ from template
  };
  // NEW: Template customizations
  templateCustomizations?: {
    componentOverrides: ComponentOverride[];
    themeOverrides: ThemeOverride[];
  };
}
```

**Variation Detection:**
```typescript
function getProjectData(projectId: string): ProjectData {
  const template = getTemplate(project.templateId);
  const variations = project.variations;
  
  // Merge template baseline + variations
  return {
    ...template.defaults,
    ...variations, // Variations override template
  };
}
```

---

### 4. Dynamic Component Orientation (Lieutenant Commander La Forge)

**Component Mapping by Project Type:**

**Business Projects:**
- Data tables (metrics, KPIs)
- Charts (analytics, trends)
- Forms (contact, lead capture)
- Lists (features, benefits)
- Cards (testimonials, case studies)

**Creative Projects:**
- Galleries (image grids, portfolios)
- Carousels (showcase, highlights)
- Narratives (story sections, timelines)
- Media players (video, audio)
- Interactive elements (animations, transitions)

**E-commerce Projects:**
- Product grids
- Shopping cart
- Checkout flow
- Product detail pages
- Category filters

**SaaS Projects:**
- Feature lists
- Pricing tables
- Integration showcases
- Demo requests
- Documentation links

**Implementation:**
```typescript
function getOrientedComponents(project: ProjectInstance): Component[] {
  const template = getTemplate(project.templateId);
  const baseComponents = template.baseComponents;
  
  // Filter and reorder based on project type
  const oriented = baseComponents
    .filter(c => isRelevantForType(c, project.type))
    .sort((a, b) => getPriorityForType(a, project.type) - getPriorityForType(b, project.type));
  
  // Add project-specific components from variations
  const customComponents = project.variations.components || [];
  
  return [...oriented, ...customComponents];
}
```

---

### 5. Data Architecture (Lieutenant Worf - Security)

**Supabase Schema Enhancement:**

```sql
-- Templates table
CREATE TABLE project_templates (
  template_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  version TEXT NOT NULL,
  base_config JSONB NOT NULL, -- Default project config
  base_components JSONB NOT NULL, -- Default components
  variation_fields JSONB, -- Fields that can be customized
  locked_fields JSONB, -- Fields that cannot be customized
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (enhanced)
ALTER TABLE projects ADD COLUMN template_id TEXT REFERENCES project_templates(template_id);
ALTER TABLE projects ADD COLUMN template_version TEXT;
ALTER TABLE projects ADD COLUMN variations JSONB; -- Only variations from template
ALTER TABLE projects ADD COLUMN template_customizations JSONB; -- Template overrides

-- Index for template lookups
CREATE INDEX idx_projects_template ON projects(template_id);
```

**Data Flow:**
```
Template (Supabase)
  ↓
Project Instance (template_id + variations)
  ↓
Project Dashboard (shows template baseline + variations)
  ↓
User edits variations
  ↓
Only variations saved to Supabase
```

---

## 🎨 UI/UX Design (Counselor Troi)

### Master Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  🖖 Alex AI Universal - Master Dashboard        │
├─────────────────────────────────────────────────┤
│  [Global Theme] [New Project] [Analytics]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Project 1│ │ Project 2│ │ Project 3│      │
│  │ [Edit]   │ │ [Edit]   │ │ [Edit]   │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Project 4│ │ Project 5│ │ Project 6│      │
│  │ [Edit]   │ │ [Edit]   │ │ [Edit]   │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Project-Specific Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  ← Back to Master | Project: "Alpha"            │
├─────────────────────────────────────────────────┤
│  [Template: Business Starter v1.2] [Customize] │
├─────────────────────────────────────────────────┤
│                                                 │
│  📋 TEMPLATE BASELINE (Read-Only)              │
│  ┌─────────────────────────────────────────┐   │
│  │ Headline: "Welcome to [Project Name]"  │   │
│  │ Subheadline: "Your business solution"  │   │
│  │ Theme: Midnight                        │   │
│  │ [Locked - from template]               │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ✏️ YOUR CUSTOMIZATIONS (Editable)             │
│  ┌─────────────────────────────────────────┐   │
│  │ Headline: "✨ Discover Your Next..."    │   │
│  │ [Customized] [Reset to Template]       │   │
│  │                                         │   │
│  │ Components:                            │   │
│  │   • Hero Section (customized)          │   │
│  │   • Feature Grid (from template)      │   │
│  │   • Testimonial Carousel (customized)  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  🎨 DYNAMIC COMPONENTS (Business Type)         │
│  ┌─────────────────────────────────────────┐   │
│  │ [Data Table] [Chart] [Form] [Metrics]   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  👁️ LIVE PREVIEW                               │
│  ┌─────────────────────────────────────────┐   │
│  │ [Real-time preview of project]           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Plan

### Phase 1: Template System Enhancement (Data + La Forge)
1. ✅ Create `project_templates` table in Supabase
2. ✅ Enhance `projects` table with `template_id`, `variations`
3. ✅ Create template management API
4. ✅ Build variation detection logic

### Phase 2: Master Dashboard Refinement (Riker + Troi)
1. ✅ Refine master dashboard to focus on project list
2. ✅ Add project cards with quick actions
3. ✅ Remove project editing from master (move to project dashboards)
4. ✅ Add project status overview

### Phase 3: Project-Specific Dashboard (Troi + Data)
1. ✅ Create `/dashboard/projects/[projectId]` route
2. ✅ Build template baseline view (read-only)
3. ✅ Build variations editor
4. ✅ Implement dynamic component orientation
5. ✅ Add template customization UI

### Phase 4: Dynamic Component Orientation (La Forge + Troi)
1. ✅ Create component mapping by project type
2. ✅ Build component priority system
3. ✅ Implement component filtering/reordering
4. ✅ Add project-type-specific component libraries

### Phase 5: Integration & Testing (All Crew)
1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ Documentation
4. ✅ User training materials

---

## 💡 Key Benefits

1. **Separation of Concerns**
   - Master dashboard = orchestration
   - Project dashboards = focused editing

2. **Template Efficiency**
   - Only store variations (smaller data)
   - Template updates propagate automatically
   - Easy to reset to template

3. **Dynamic UX**
   - Components adapt to project type
   - Relevant tools for each project
   - Reduced cognitive load

4. **Scalability**
   - Easy to add new project types
   - Template system is extensible
   - Component library grows organically

---

## 🎖️ Crew Consensus

**Captain Picard:** "Make it so. This architecture provides clear separation of concerns and scales beautifully."

**Commander Riker:** "Tactically sound. Master dashboard for control, project dashboards for focus."

**Commander Data:** "Logically optimal. Template + variations pattern is efficient and maintainable."

**Lieutenant Commander La Forge:** "Infrastructure is solid. Dynamic component orientation is the right approach."

**Counselor Troi:** "User experience will be dramatically improved. Focused editing reduces cognitive load."

**Lieutenant Worf:** "Security is maintained. Template system provides controlled customization."

**Quark:** "This will reduce support costs and increase user satisfaction. Profitable architecture!"

**Chief O'Brien:** "Simple and effective. Template + variations is the right pattern."

---

## 📋 Next Steps

1. **Review this document** with the crew
2. **Approve architecture** (Captain Picard)
3. **Begin Phase 1** implementation
4. **Create detailed technical specs** for each phase
5. **Set up project tracking** for implementation

---

**Status:** ✅ Architecture Analysis Complete  
**Ready for:** Implementation Planning

