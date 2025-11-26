# 🖖 Documentation Structure Guidelines

**Date:** November 26, 2025  
**Analysis by:** Crew Coordination (Data, Picard, Riker, La Forge, Troi)  
**Status:** ✅ Guidelines Established

---

## 🎯 Core Principle

**docs/ folder = Generated/Reference Documentation**  
**All other folders = Manual Documentation**

---

## 📋 Documentation Categories

### 1. docs/ Folder (Generated/Reference)

**Purpose:** Centralized reference and generated documentation

**Should Contain:**
- ✅ Generated API documentation
- ✅ System reference documentation  
- ✅ Auto-generated summaries and reports
- ✅ Architecture diagrams and system overviews
- ✅ Integration guides and reference materials
- ✅ RAG integration reports
- ✅ Crew coordination summaries
- ✅ Milestone category summaries

**Should NOT Contain:**
- ❌ Project-specific README files (use root README.md)
- ❌ Package-level documentation (use package README)
- ❌ Inline code documentation
- ❌ Temporary or draft documentation
- ❌ Session-specific notes

**Generation Rules:**
- **API docs:** Generate from code annotations
- **Summaries:** Generate from milestone/crew analysis
- **Reports:** Generate from system analysis
- **Reference:** Generate from code structure
- **Diagrams:** Generate from architecture analysis

**Examples:**
- `docs/E2E_RAG_MEMORY_SYSTEM.md` - Generated system documentation
- `docs/CREW_ROSTER_UNIFICATION_SOLUTION.md` - Generated solution docs
- `docs/active/architecture/` - Reference architecture docs
- `docs/active/guides/` - Reference integration guides

---

### 2. README Files (Manual)

**Purpose:** Project/package entry points

**Location:** Root level, package directories, component directories

**Should Contain:**
- ✅ Quick start guide
- ✅ Overview and purpose
- ✅ Basic usage examples
- ✅ Links to detailed docs in docs/ folder
- ✅ Installation instructions
- ✅ Project structure overview

**Should NOT Contain:**
- ❌ Detailed API reference (link to docs/)
- ❌ Comprehensive guides (link to docs/)
- ❌ Generated content
- ❌ System internals
- ❌ Long-form documentation

**Maintenance:** Manual - updated with project changes

**Examples:**
- `README.md` - Project overview
- `packages/core/README.md` - Package overview
- `scripts/milestones/README.md` - Script directory overview

---

### 3. Inline Documentation (Manual)

**Purpose:** Context-specific documentation

**Location:** Within code directories, alongside related code

**Should Contain:**
- ✅ Local decisions and rationale
- ✅ Implementation details
- ✅ Usage examples for specific components
- ✅ Troubleshooting for local issues
- ✅ Component-specific notes

**Should NOT Contain:**
- ❌ Duplicate of docs/ content
- ❌ Generated content
- ❌ System-wide reference
- ❌ Long-form guides

**Maintenance:** Manual - updated with code

**Examples:**
- `milestones-organized/README.md` - Milestone organization notes
- `scripts/crew-coordination/README.md` - Crew coordination notes
- Component-specific notes in feature directories

---

### 4. Milestone Documentation (Generated)

**Purpose:** Historical milestone summaries

**Location:** `milestones-organized/` directory

**Should Contain:**
- ✅ Auto-generated category summaries
- ✅ Timeline summaries
- ✅ Recent accomplishments
- ✅ Links to milestone files

**Should NOT Contain:**
- ❌ Manual milestone entries
- ❌ Duplicate content from milestones/

**Generation:** Automatic via milestone push system

**Examples:**
- `milestones-organized/architecture/README.md` - Generated category summary
- `milestones-organized/crew/README.md` - Generated crew milestone summary

---

### 5. Configuration Documentation (Manual)

**Purpose:** Setup and configuration guides

**Location:** `.cursor/`, `.vscode/`, config directories

**Should Contain:**
- ✅ Setup instructions
- ✅ Configuration examples
- ✅ Tool-specific guides
- ✅ Environment setup

**Should NOT Contain:**
- ❌ Generated content
- ❌ System reference docs

**Maintenance:** Manual - updated with tool changes

**Examples:**
- `.cursor/README.md` - Cursor AI setup
- `.cursor/alex-ai-startup-prompt.md` - Startup configuration

---

## 🔄 Decision Tree

### When creating new documentation:

```
Is it API/system reference?
  → Yes → docs/ folder (can be generated)
  → No → Continue

Is it a project/package overview?
  → Yes → README.md in appropriate directory
  → No → Continue

Is it component/feature specific?
  → Yes → Inline documentation alongside code
  → No → Continue

Is it a milestone summary?
  → Yes → milestones-organized/ (generated)
  → No → Continue

Is it configuration/setup?
  → Yes → Config directory (manual)
  → No → docs/ folder (manual guide)
```

---

## 🖖 Crew Recommendations

### Commander Data (Analysis)
- **Pattern Recognition:** docs/ folder should be primarily generated content
- **Structure:** Clear separation between generated and manual docs
- **Automation:** Maximize generation to reduce maintenance burden

### Captain Picard (Strategic)
- **Mission Clarity:** docs/ = reference, everything else = context
- **Architecture:** Centralized reference vs distributed context
- **Vision:** docs/ folder as the "Library Computer" - comprehensive reference

### Commander Riker (Organization)
- **Workflow:** Generate docs/ content automatically
- **Execution:** Manual docs live with code for context
- **Coordination:** Clear guidelines prevent documentation sprawl

### Lt. Cmdr. La Forge (Implementation)
- **Tooling:** Scripts to generate docs/ content
- **Automation:** Integrate generation into milestone push
- **Infrastructure:** docs/ folder as generated artifact

### Counselor Troi (User Experience)
- **Clarity:** Clear distinction helps users find information
- **Accessibility:** docs/ for comprehensive reference, README for quick start
- **Navigation:** Logical organization improves discoverability

---

## ✅ Implementation Checklist

- [x] Guidelines established
- [x] Categories defined
- [x] Decision tree created
- [ ] Script to analyze current documentation structure
- [ ] Script to generate docs/ content
- [ ] Script to validate documentation organization
- [ ] Integration with milestone push system
- [ ] Documentation generation automation

---

## 📊 Current Status

**Analysis Complete:** ✅  
**Guidelines Established:** ✅  
**Implementation:** In Progress

**Next Steps:**
1. Review current documentation structure
2. Identify files that should be moved/generated
3. Implement generation scripts
4. Integrate with automated systems

---

**Status:** ✅ Guidelines Complete  
**Maintained by:** Crew Coordination System  
**Last Updated:** November 26, 2025

