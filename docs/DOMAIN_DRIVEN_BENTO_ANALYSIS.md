# 🖖 Domain-Driven Bento Layout Analysis

**Mission:** Refactor dashboard component hierarchy to be domain-driven with visual grouping

**Leadership:** Counselor Troi (UX Lead) + Commander Riker (Tactical Organization) + Quark (Business Optimization)

## Current State Analysis

### Current Bento Layout Structure (Functional Grouping)
1. Core System Status
2. Analytics & Learning
3. Workflows & Automation
4. Security & Optimization
5. Vector & Data Visualization
6. Dynamic Data & Components
7. Documentation & Knowledge
8. Projects & Management
9. Testing & Development

### Issues with Current Structure
- Components grouped by technical function, not user intent
- Related components scattered across sections
- No clear user journey or interaction flow
- Visual hierarchy doesn't match mental model

## Domain-Driven Approach

### User Interaction Domains (Troi's Analysis)

#### Domain 1: **System Health & Monitoring** 🏥
**User Intent:** "Is everything working? What's the status?"
- Service Status Display
- Status Ribbon
- Live Refresh Dashboard
- MCP System Dashboard
- Cross-Server Sync Panel
- Progress Tracker

#### Domain 2: **Intelligence & Learning** 🧠
**User Intent:** "What has the system learned? What insights do we have?"
- Learning Analytics Dashboard
- Crew Memory Visualization
- RAG Project Recommendations
- Agent Memory Display
- Analytics Dashboard

#### Domain 3: **Design & Theming** 🎨
**User Intent:** "How does it look? What themes work best?"
- Theme Testing Harness
- UIDesignComparison
- Global Theme Switcher
- Theme Selector
- Intent Theme Switcher

#### Domain 4: **Project Management** 📋
**User Intent:** "What projects exist? How do I manage them?"
- Project Grid
- Project Editor Tabs
- Bento Editor
- Combined Wizard
- Delete Project Modal

#### Domain 5: **Workflow & Automation** ⚙️
**User Intent:** "How do processes work? What's automated?"
- N8N Workflow Bento
- Process Documentation System
- Data Source Integration Panel
- Workflow Management (workflows/)
- Execution Monitor (workflows/)

#### Domain 6: **Security & Compliance** 🛡️
**User Intent:** "Is it secure? Are we compliant?"
- Security Assessment Dashboard
- AI Impact Assessment
- Cost Optimization Monitor

#### Domain 7: **Data & Analytics** 📊
**User Intent:** "What does the data tell us? How do we visualize it?"
- Vector-Based Dashboard
- Vector Priority System
- Priority Matrix
- Dynamic Data Renderer
- Dynamic Data Drilldown
- Dynamic Component Registry

#### Domain 8: **Knowledge & Documentation** 📚
**User Intent:** "What do we know? How is it documented?"
- RAG Self-Documentation
- Debate Panel
- User Experience Analytics

## Proposed Domain-Driven Bento Structure

### Visual Hierarchy Principles (Troi)
1. **Top Level:** User interaction domains (what user wants to do)
2. **Second Level:** Related components grouped by visual similarity and meaning
3. **Third Level:** Individual components within groups

### Domain Organization

```
┌─────────────────────────────────────────────────────────┐
│  Domain 1: System Health & Monitoring                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Service      │ │ Live Refresh │ │ Status       │   │
│  │ Status       │ │ Dashboard    │ │ Ribbon       │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐                    │
│  │ MCP System   │ │ Cross-Server │                    │
│  │ Dashboard    │ │ Sync Panel   │                    │
│  └──────────────┘ └──────────────┘                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Domain 2: Intelligence & Learning                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Learning     │ │ Crew Memory │ │ RAG         │   │
│  │ Analytics    │ │ Visualization│ │ Recommendations│ │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐                    │
│  │ Analytics    │ │ Agent Memory │                    │
│  │ Dashboard    │ │ Display      │                    │
│  └──────────────┘ └──────────────┘                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Domain 3: Design & Theming                             │
│  ┌──────────────┐ ┌──────────────┐                    │
│  │ Theme        │ │ UI Design    │                    │
│  │ Testing      │ │ Comparison   │                    │
│  │ Harness      │ │              │                    │
│  └──────────────┘ └──────────────┘                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Domain 4: Project Management                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Project Grid (Full Width)                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Domain 5: Workflow & Automation                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ N8N          │ │ Process      │ │ Data Source │   │
│  │ Workflows     │ │ Documentation│ │ Integration │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Domain 6: Security & Compliance                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Security     │ │ AI Impact    │ │ Cost        │   │
│  │ Assessment   │ │ Assessment   │ │ Optimization│   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Domain 7: Data & Analytics                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Vector       │ │ Vector       │ │ Priority     │   │
│  │ Dashboard    │ │ Priority     │ │ Matrix       │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Dynamic Data │ │ Dynamic Data │ │ Component    │   │
│  │ Renderer     │ │ Drilldown    │ │ Registry     │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Domain 8: Knowledge & Documentation                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ RAG Self     │ │ Debate       │ │ UX Analytics │   │
│  │ Documentation│ │ Panel        │ │              │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Team Organization (Riker + Quark)

### Team Alpha: System Health Domain
- **Lead:** Dr. Crusher (System Health)
- **Members:** La Forge (Infrastructure), Worf (Security Monitoring)
- **Components:** Service Status, Live Refresh, Status Ribbon, MCP, Cross-Server Sync

### Team Beta: Intelligence Domain
- **Lead:** Commander Data (Analytics)
- **Members:** Troi (UX Insights), Picard (Strategic Analysis)
- **Components:** Learning Analytics, Crew Memory, RAG Recommendations, Analytics Dashboard

### Team Gamma: Design Domain
- **Lead:** Counselor Troi (UX Lead)
- **Members:** La Forge (Theme System), Data (Visualization)
- **Components:** Theme Testing, UI Design Comparison, Theme Selectors

### Team Delta: Project Management Domain
- **Lead:** Commander Riker (Tactical Operations)
- **Members:** O'Brien (Pragmatic Implementation), Quark (Business Optimization)
- **Components:** Project Grid, Project Editor, Bento Editor, Wizards

### Team Epsilon: Workflow Domain
- **Lead:** Lieutenant Uhura (Communications)
- **Members:** Riker (Workflow Management), Data (Automation)
- **Components:** N8N Workflows, Process Documentation, Data Integration

### Team Zeta: Security Domain
- **Lead:** Lieutenant Worf (Security)
- **Members:** Uhura (Network Security), Quark (Cost Security)
- **Components:** Security Assessment, AI Impact, Cost Optimization

### Team Eta: Data & Analytics Domain
- **Lead:** Commander Data (Data Analysis)
- **Members:** La Forge (Vector Systems), Troi (Visualization UX)
- **Components:** Vector Dashboard, Priority System, Dynamic Components

### Team Theta: Knowledge Domain
- **Lead:** Commander Data (Knowledge Systems)
- **Members:** Troi (User Experience), O'Brien (Documentation)
- **Components:** RAG Documentation, Debate Panel, UX Analytics

## Implementation Plan

### Phase 1: Domain Analysis (Troi + Data)
1. Map all components to domains
2. Identify visual relationships
3. Create component grouping rules

### Phase 2: Layout Design (Troi + La Forge)
1. Design domain-based bento structure
2. Create visual hierarchy
3. Implement responsive grid system

### Phase 3: Component Organization (Riker + Quark)
1. Reorganize components by domain
2. Group related components visually
3. Create domain sections

### Phase 4: Testing Harness Updates (Data + La Forge)
1. Update Theme Testing Harness
2. Update component testing
3. Validate domain structure

### Phase 5: Team Review (All Teams)
1. Review domain organization
2. Validate user experience
3. Finalize implementation

## Success Criteria

- ✅ Components organized by user intent, not technical function
- ✅ Related components visually grouped together
- ✅ Clear visual hierarchy within each domain
- ✅ User journey flows naturally through domains
- ✅ Testing harnesses account for new structure
- ✅ Maintains all existing functionality

