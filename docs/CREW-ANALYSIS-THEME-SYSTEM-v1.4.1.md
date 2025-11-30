# CREW ANALYSIS: Theme System Architecture Issue

**Date:** November 2, 2025
**Issue:** Theme system regression - lost project-level themes
**Severity:** High - breaks core multi-project functionality

## PROBLEM STATEMENT

Recent fixes (commits 412c01e, 77913d3) introduced a theme system regression:

### What We Broke:
1. ✅ Global dashboard theme works
2. ❌ Project-level themes lost in live previews
3. ❌ All projects now use globalTheme instead of their own theme

### Original Architecture:
```
AppState {
  globalTheme: 'midnight'      // For dashboard UI
  projects: {
    alpha: { theme: 'gradient' }   // Each project has own theme
    beta: { theme: 'pastel' }
    gamma: { theme: 'cyberpunk' }
    temporal: { theme: 'offworld' }
  }
}
```

### What Happened:
- GlobalThemeStyles now only applies `globalTheme` to entire app
- Lost the distinction between dashboard theme and project themes
- Live preview iframes should use project.theme, not globalTheme

## CREW CONSENSUS DECISION

After analyzing the codebase and DDD architecture, here's the unanimous crew decision:

### SOLUTION: Two-Layer Theme System

**Layer 1: Dashboard Theme (Global)**
- Controls dashboard UI, navigation, cards
- Applied via GlobalThemeStyles to dashboard wrapper
- User selects from dropdown in header

**Layer 2: Project Themes (Per-Project)**
- Each project maintains its own theme
- Live preview iframes use project.theme in URL params
- Editing interface shows project theme selector
- Projects are isolated from dashboard theme

### IMPLEMENTATION PLAN

#### Phase 1: Fix GlobalThemeStyles (Dashboard Only)
- GlobalThemeStyles should only affect dashboard container
- NOT the entire document.documentElement
- Projects render in iframes with their own themes

#### Phase 2: Restore Project Theme Isolation
- Live preview iframes use `/projects/[id]?theme=X` 
- Project page reads theme from URL param
- ProjectEditorTabs has theme selector per project

#### Phase 3: Update state-manager
- Keep globalTheme for dashboard
- Keep project.theme for each project
- updateGlobalTheme() changes dashboard only
- updateTheme(projectId, themeId) changes project only

## CREW VOTES

**Captain Picard (Architecture):** ✅ APPROVE
- "Separation of concerns is paramount. Dashboard and projects are distinct domains."

**Chief O'Brien (Implementation):** ✅ APPROVE  
- "Simple fix - scope the CSS variables to dashboard, not documentElement."

**Commander Data (Logic):** ✅ APPROVE
- "Logical. Projects in iframes maintain isolation. Dashboard theme independent."

**Lt. Cmdr. La Forge (Infrastructure):** ✅ APPROVE
- "This respects the iframe boundary. Clean separation at the infrastructure level."

**Counselor Troi (UX):** ✅ APPROVE
- "Users expect dashboard to have one theme, projects to have their own. This feels right."

**Lt. Worf (Security):** ✅ APPROVE
- "Isolation strengthens the architecture. Each domain has its own authority."

**Dr. Crusher (System Health):** ✅ APPROVE
- "This prevents theme contamination between dashboard and projects. Healthy boundaries."

## UNANIMOUS DECISION: 7/7 ✅

**Proceed with two-layer theme system.**

## AUTOMATION STEPS

1. Modify GlobalThemeStyles to scope to dashboard only
2. Ensure project iframes use their own theme from URL params
3. Verify ProjectEditorTabs has per-project theme selector
4. Test: Dashboard theme change doesn't affect project previews
5. Test: Project theme change doesn't affect dashboard
6. Commit: "Fix: Restore two-layer theme system (dashboard + project)"

## EXPECTED OUTCOME

- Dashboard has its own theme (globalTheme)
- Each project has its own theme (project.theme)
- Live previews show project theme, not dashboard theme
- No contamination between layers
- Full DDD compliance maintained

---

**Crew Commander:** Captain Picard
**Chief Engineer:** O'Brien  
**Status:** APPROVED FOR IMPLEMENTATION
**Priority:** IMMEDIATE

