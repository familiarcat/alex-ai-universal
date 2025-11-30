# 🖖 Alex AI Diagnostic System

**Star Trek Medical Diagnostic Levels for Codebase Analysis**

---

## 📊 Diagnostic Levels

### Level 1: Full Crew Examination
**Deepest analysis across entire codebase**

- **Crew:** All 10 crew members
- **Scope:** Entire codebase, all components, cross-component interactions
- **Time:** 30-60 minutes
- **Cost:** 100 units
- **Use When:**
  - Critical system-wide issues
  - Major architectural decisions
  - Comprehensive codebase audit
  - Pre-deployment validation

**Analysis Areas:**
1. Code structure and organization
2. Security and compliance
3. Performance and optimization
4. User experience and accessibility
5. Infrastructure and deployment
6. Cost and resource utilization
7. Integration and communication
8. Health and diagnostics
9. Architecture and design patterns
10. Pragmatic solutions and fixes

---

### Level 2: Targeted Team Analysis
**Focused examination of specific aspects**

- **Coordination:** Riker (tactical) + Quark (cost optimization)
- **Team Size:** 3-5 crew members (optimized by Quark)
- **Time:** 10-20 minutes
- **Cost:** ~21 units (30 base × 0.7 with focus area)
- **Use When:**
  - Specific component issues
  - Focused optimization needs
  - Targeted security review
  - Performance investigation

**Focus Areas:**
- `security` - Worf, Data, La Forge
- `performance` - Data, La Forge, Crusher
- `ux` - Troi, Data, Uhura
- `infrastructure` - La Forge, Data, O'Brien
- `architecture` - Picard, Data, La Forge
- `cost` - Quark, Riker, Data
- `health` - Crusher, Data, Troi
- `integration` - Uhura, La Forge, Data

**Example:**
```bash
node scripts/diagnostic-system.js level2 security
```

---

### Level 3: System Health Check
**Quick health assessment of all systems**

- **Leaders:** Crusher, Data, Troi
- **Team Size:** 3 crew members
- **Time:** 2-5 minutes
- **Cost:** 10 units
- **Use When:**
  - Routine monitoring
  - Quick status check
  - Pre-flight validation
  - Daily health checks

**Health Check Areas:**
1. System uptime and availability
2. Error rates and logs
3. Performance metrics
4. Resource utilization
5. User experience metrics
6. Integration status
7. Security status
8. Cost metrics

---

## 🎯 Management System

### Riker's Role (Tactical Coordination)
- **Builds teams** for Level 2 diagnostics
- **Organizes crew** based on focus area
- **Coordinates execution** across team members
- **Ensures efficiency** in resource allocation

### Quark's Role (Cost Optimization)
- **Analyzes cost-benefit** for each diagnostic level
- **Optimizes team composition** to stay within budget
- **Calculates ROI** for diagnostic investments
- **Recommends optimal level** based on issue severity/scope

### Crew Leaders
- **Crusher:** Health & Diagnostics (Level 3 leader)
- **Data:** Technical Analysis (Level 2/3 leader)
- **Troi:** User Experience (Level 2/3 leader)

---

## 🚀 Usage

### Level 1 Diagnostic
```bash
# Full crew examination
node scripts/diagnostic-system.js level1

# With specific issue
node scripts/diagnostic-system.js level1 "Performance degradation in dashboard"
```

### Level 2 Diagnostic
```bash
# Security focus
node scripts/diagnostic-system.js level2 security

# Performance focus
node scripts/diagnostic-system.js level2 performance "Slow API responses"

# UX focus
node scripts/diagnostic-system.js level2 ux "Dashboard usability issues"
```

### Level 3 Diagnostic
```bash
# Quick health check
node scripts/diagnostic-system.js level3
```

### Auto-Recommendation
```bash
# Quark recommends based on issue
ISSUE_SEVERITY=critical ISSUE_SCOPE=system-wide node scripts/diagnostic-system.js
```

---

## 📋 Decision Matrix

| Issue Severity | Issue Scope | Recommended Level |
|---------------|-------------|-------------------|
| Critical | System-wide | Level 1 |
| Critical | Component | Level 2 |
| High | System-wide | Level 1 |
| High | Component | Level 2 |
| Medium | System-wide | Level 2 |
| Medium | Component | Level 2 |
| Low | Any | Level 3 |

---

## 💰 Cost-Benefit Analysis

### Level 1
- **Cost:** 100 units
- **Value:** 95 (catches everything)
- **ROI:** -5% (high cost, but comprehensive)
- **Best For:** Critical issues, major decisions

### Level 2
- **Cost:** 21-30 units
- **Value:** 70 (targeted analysis)
- **ROI:** 133-233% (excellent value)
- **Best For:** Most situations

### Level 3
- **Cost:** 10 units
- **Value:** 40 (quick check)
- **ROI:** 300% (very efficient)
- **Best For:** Routine monitoring

---

## 🔄 Workflow

1. **Issue Identified**
   - Assess severity and scope
   - Quark recommends diagnostic level

2. **Team Assembly** (Level 2)
   - Riker builds team based on focus area
   - Quark optimizes for cost

3. **Diagnostic Execution**
   - Crew members analyze assigned areas
   - Results coordinated and synthesized

4. **Results Storage**
   - Findings stored in RAG system
   - Diagnostic plan saved to `docs/diagnostics/`

5. **Action Items**
   - Prioritized by Riker
   - Cost-analyzed by Quark
   - Implemented by crew

---

## 📊 Output Format

Diagnostic results are saved as JSON:
```json
{
  "timestamp": "2025-11-28T16:23:24.652Z",
  "level": "level1",
  "result": {
    "level": "level1",
    "crew": ["picard", "riker", "data", ...],
    "cost": 100,
    "roi": 0,
    "scope": "entire_codebase"
  },
  "options": {
    "focusArea": null,
    "issue": null,
    "issueSeverity": "medium",
    "issueScope": "component"
  }
}
```

---

## 🛠️ Integration

The diagnostic system integrates with:
- **OpenRouter MCP:** For crew LLM coordination
- **RAG System:** For storing diagnostic results
- **n8n Workflows:** For crew coordination
- **Supabase:** For persistent storage

---

## 📚 Examples

### Example 1: Security Audit
```bash
node scripts/diagnostic-system.js level2 security "Review authentication system"
```
**Team:** Worf, Data, La Forge  
**Focus:** Security vulnerabilities, access controls, data protection

### Example 2: Performance Investigation
```bash
node scripts/diagnostic-system.js level2 performance "Dashboard loading slowly"
```
**Team:** Data, La Forge, Crusher  
**Focus:** Response times, resource usage, bottlenecks

### Example 3: Routine Health Check
```bash
node scripts/diagnostic-system.js level3
```
**Team:** Crusher, Data, Troi  
**Focus:** Quick status of all systems

---

## 🎖️ Best Practices

1. **Start with Level 3** for routine checks
2. **Use Level 2** for most issues (best ROI)
3. **Reserve Level 1** for critical/system-wide issues
4. **Let Quark recommend** when unsure
5. **Trust Riker's team building** for Level 2
6. **Store all diagnostics** in RAG for learning

---

**Status:** ✅ System Operational  
**Crew Coordination:** Riker + Quark  
**Leaders:** Crusher, Data, Troi

