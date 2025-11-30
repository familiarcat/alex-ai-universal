# Roadmap v2.1: Strategic Features
## Four Pillars of Alex AI Evolution

**Date:** November 3, 2025  
**Version:** v2.1.0 (Planning Phase)  
**Strategic Vision:** User's Four-Pillar Framework  
**Status:** Requirements Captured, Ready for Implementation

---

## 🎯 Strategic Overview

**User's Vision:**
> "If this works correctly we should:
> a) be able to use the entire crew to evaluate new project generation in our dashboard UI
> b) record into our RAG memory system all user input while keeping the Prime Directive of ambiguity as a core feature
> c) always use Mr. Worf's security protocols in effect so that we have a military grade security flow in our system
> d) be able to bring in new Next.js projects into our project structure and provide the same editing features our dashboard provides while only updating their structure and using the dashboard to edit them"

---

## 🏛️ The Four Pillars

### Pillar A: Crew-Powered Project Generation
**"Use entire crew to evaluate new project generation in dashboard UI"**

### Pillar B: Ambient Intelligence with Ambiguity
**"Record all user input to RAG while maintaining Prime Directive of ambiguity"**

### Pillar C: Military-Grade Security (Worf Protocol)
**"Always use Mr. Worf's security protocols for military-grade security flow"**

### Pillar D: Universal Next.js Integration
**"Bring in external Next.js projects and edit via dashboard without destroying structure"**

---

## 📋 PILLAR A: Crew-Powered Project Generation

### Concept

**Current State:**
- User creates project via `/projects/new`
- Quiz → Wizard → Generate → Done
- No crew involvement in generation
- Generic templates based on theme

**Target State:**
- User describes project intent in natural language
- **All 12 crew members evaluate** the intent
- Each crew member contributes their expertise:
  - **Picard:** Strategic direction and mission alignment
  - **Data:** Technical feasibility and optimal architecture
  - **Riker:** Tactical implementation and user engagement
  - **La Forge:** Infrastructure requirements and performance
  - **Worf:** Security implications and compliance
  - **Troi:** User experience and emotional resonance
  - **Crusher:** Health checks and diagnostic workflows
  - **Uhura:** Communication patterns and I/O design
  - **Quark:** Business model and ROI optimization
  - **O'Brien:** Pragmatic solutions and maintenance concerns
  - Plus 2 more specialized crew
- **Consensus-driven generation:** Crew votes on best approach
- **Real-time collaboration UI:** Watch crew discuss and decide
- **Personalized output:** Project tailored to user's specific needs

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER INPUT                                                         │
│  "I need a landing page for my artisan coffee shop with            │
│   online ordering and loyalty program integration"                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  INTENT ANALYSIS (n8n Workflow: "Project Intent Analyzer")         │
│  • Parse user input                                                 │
│  • Extract key entities (coffee shop, online ordering, loyalty)    │
│  • Identify requirements (e-commerce, CRM, payment)                 │
│  • Classify project type (business, e-commerce, local)              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  CREW CONVOCATION (n8n Workflow: "Democratic Collaboration")       │
│  Parallel execution - all 12 crew members simultaneously           │
│                                                                     │
│  → Captain Picard:                                                  │
│    "Strategic assessment: Local business, focus on community       │
│     engagement. Recommend warm, inviting design. Mission: Build    │
│     customer relationships, not just transactions."                │
│                                                                     │
│  → Commander Data:                                                  │
│    "Technical analysis: Requires e-commerce module, payment        │
│     gateway (Stripe recommended), inventory management. Optimal    │
│     stack: Next.js 14, Supabase for orders, serverless functions." │
│                                                                     │
│  → Lt. Worf:                                                        │
│    "Security concern: PCI compliance required for payment          │
│     processing. Recommend: Stripe integration (handles PCI),       │
│     customer data encryption at rest, rate limiting on API."       │
│                                                                     │
│  → Counselor Troi:                                                  │
│    "User experience: Artisan coffee suggests emotional connection. │
│     Design should evoke warmth, craftsmanship. Loyalty program     │
│     must feel rewarding, not transactional. Recommend gamification."│
│                                                                     │
│  → Chief O'Brien:                                                   │
│    "Pragmatic assessment: Don't over-engineer. Start with simple   │
│     menu, basic ordering. Add loyalty program later if needed.     │
│     Focus on getting orders working first."                        │
│                                                                     │
│  → Quark:                                                           │
│    "Business intelligence: Average coffee shop margins 10-15%.     │
│     Online ordering increases ticket size by 23%. Loyalty program  │
│     retention: +40%. ROI projection: Positive within 6 months."    │
│                                                                     │
│  [... all 12 crew members contribute ...]                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  CONSENSUS BUILDING (n8n Workflow: "Crew Consensus")               │
│  • Aggregate all crew recommendations                               │
│  • Identify common themes                                           │
│  • Resolve conflicts (e.g., O'Brien vs Data on complexity)         │
│  • Vote on final approach (weighted by expertise)                  │
│  • Generate project specification                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PROJECT GENERATION (n8n Workflow: "Intelligent Code Gen")         │
│  Based on crew consensus:                                           │
│  • Select optimal theme (mocha/earth for warmth)                   │
│  • Generate page structure (Home, Menu, Order, Loyalty)            │
│  • Create components (ProductCard, Cart, LoyaltyWidget)            │
│  • Configure integrations (Stripe, email notifications)             │
│  • Set up database schema (products, orders, customers)            │
│  • Apply Worf's security (encryption, rate limits, validation)     │
│  • Optimize for Troi's UX (animations, micro-interactions)         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD PRESENTATION                                             │
│  User sees:                                                         │
│  • Crew discussion summary (who said what)                         │
│  • Final consensus and rationale                                   │
│  • Generated project preview                                       │
│  • Editable via dashboard ✅                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation Plan

**Phase 1: Intent Analysis (Week 1)**
- [ ] Create n8n workflow: "Project Intent Analyzer"
- [ ] NLP parsing of user input (using GPT-4 or Claude)
- [ ] Entity extraction (business type, features, requirements)
- [ ] Store intent in Supabase (`project_intents` table)

**Phase 2: Crew Convocation (Week 2)**
- [ ] Extend existing crew workflows to handle project evaluation
- [ ] Create n8n workflow: "Parallel Crew Consultation"
- [ ] Each crew member receives intent and responds with evaluation
- [ ] Store all crew responses in Supabase (`crew_evaluations` table)

**Phase 3: Consensus Building (Week 2)**
- [ ] Create n8n workflow: "Democratic Consensus Builder"
- [ ] Aggregate crew responses
- [ ] Weight by expertise (e.g., Worf's security opinion weighted higher for security)
- [ ] Generate project specification JSON
- [ ] Store consensus in Supabase (`project_specifications` table)

**Phase 4: Intelligent Generation (Week 3)**
- [ ] Create n8n workflow: "AI-Powered Code Generator"
- [ ] Use specification to generate:
  - Page structure
  - Component library
  - Database schema
  - API routes
  - Integration configs
- [ ] Store generated project in Supabase

**Phase 5: Dashboard UI (Week 4)**
- [ ] Create `/projects/new-intelligent` route
- [ ] Build "Crew Consultation" UI component
- [ ] Real-time updates via Supabase Realtime
- [ ] Show crew discussion as it happens (like Observation Lounge)
- [ ] Present final consensus and preview
- [ ] Allow user to edit generated project

**Success Metrics:**
- User describes intent in 1-2 sentences
- Crew provides 12 unique perspectives in <30 seconds
- Generated project matches user intent 90%+ accuracy
- User satisfaction: "The crew understood what I wanted"

---

## 📋 PILLAR B: Ambient Intelligence with Ambiguity

### Concept: The Prime Directive of Ambiguity

**Philosophy:**
> "The best AI systems don't just store what users say—they understand intent while respecting that users don't always know exactly what they want. Ambiguity is a feature, not a bug."

**Current State:**
- User input stored explicitly (project descriptions, settings)
- No ambient capture of interactions
- No learning from implicit behavior
- RAG system stores structured crew memories only

**Target State:**
- **Every user interaction captured** (clicks, edits, hesitations)
- **Intent inferred from behavior** (what they do, not just what they say)
- **Ambiguity preserved** (store multiple interpretations, not single "truth")
- **Privacy-first** (user controls what's remembered)
- **Crew learns from patterns** (improves recommendations over time)

### The Prime Directive

```
PRIME DIRECTIVE OF AMBIGUITY

1. CAPTURE EVERYTHING (But Interpret Nothing Prematurely)
   • Every click, edit, pause, scroll
   • Time spent on sections
   • What they edit vs what they keep
   • What they almost click but don't
   
2. STORE MULTIPLE INTERPRETATIONS (Not Single Truth)
   Example:
   User creates "coffee shop" project but keeps editing the loyalty section
   
   Interpretation A: User cares deeply about loyalty program
   Interpretation B: User confused by loyalty section
   Interpretation C: User experimenting with options
   
   → Store ALL THREE with confidence scores
   → Let crew evaluate which is most likely
   → Never commit to single interpretation prematurely

3. RESPECT PRIVACY (User Controls Memory)
   • "Remember this session" toggle
   • "Forget this interaction" button
   • "What does Alex AI remember about me?" dashboard
   • Opt-in, not opt-out

4. LEARN PATTERNS (Not Individual Behaviors)
   • "Users who edit X also tend to edit Y"
   • "Coffee shop projects usually need Z"
   • "When users hesitate on loyalty, they often want Q"
   
   → Aggregated insights, not individual tracking

5. SURFACE AMBIGUITY TO USER (Make It Visible)
   • "We noticed you spent time on X. Does this mean Y or Z?"
   • Let user clarify ambiguity when they're ready
   • Don't force premature clarity
```

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER INTERACTION LAYER (Dashboard)                                 │
│  • Every click tracked (opt-in)                                     │
│  • Edit events captured                                             │
│  • Dwell time recorded                                              │
│  • Scroll depth measured                                            │
│  • "Almost clicks" detected (hover >2s)                            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  EVENT STREAM (n8n Workflow: "Ambient Capture")                    │
│  Batches events every 30 seconds:                                   │
│  {                                                                  │
│    "session_id": "uuid",                                            │
│    "user_id": "optional",  // Only if logged in                    │
│    "project_id": "project_123",                                     │
│    "events": [                                                      │
│      {                                                              │
│        "type": "edit",                                              │
│        "component": "ProjectHeadline",                              │
│        "before": "Coffee Shop",                                     │
│        "after": "Artisan Coffee Experience",                        │
│        "time_spent": 45 // seconds                                  │
│      },                                                             │
│      {                                                              │
│        "type": "hover",                                             │
│        "component": "LoyaltySection",                               │
│        "duration": 12 // seconds                                    │
│      },                                                             │
│      // ... more events                                             │
│    ]                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  INTERPRETATION ENGINE (n8n Workflow: "Ambient Intelligence")      │
│  For each event batch:                                              │
│  • Generate multiple interpretations (using GPT-4)                  │
│  • Assign confidence scores                                         │
│  • Identify patterns across sessions                                │
│  • Flag ambiguities for crew review                                 │
│                                                                     │
│  Example Output:                                                    │
│  {                                                                  │
│    "session_id": "uuid",                                            │
│    "interpretations": [                                             │
│      {                                                              │
│        "interpretation": "User wants premium branding",             │
│        "confidence": 0.75,                                          │
│        "evidence": ["Changed 'Coffee Shop' to 'Artisan...']        │
│      },                                                             │
│      {                                                              │
│        "interpretation": "User unclear on loyalty features",        │
│        "confidence": 0.60,                                          │
│        "evidence": ["Long hover on loyalty section", "No edits"]   │
│      }                                                              │
│    ],                                                               │
│    "ambiguities": [                                                 │
│      "Does user want loyalty program or not?"                       │
│    ]                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  RAG STORAGE (Supabase: ambient_intelligence table)                │
│  Stores:                                                            │
│  • Raw events (anonymized if not logged in)                        │
│  • Multiple interpretations with confidence scores                  │
│  • Ambiguities flagged for crew review                             │
│  • Aggregated patterns (not individual behaviors)                  │
│                                                                     │
│  Privacy Controls:                                                  │
│  • user_id nullable (supports anonymous sessions)                  │
│  • retention_policy: 90 days for individuals, forever for patterns │
│  • delete_on_request: true                                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  CREW LEARNING (n8n Workflow: "Pattern Recognition")               │
│  Weekly analysis:                                                   │
│  • Identify common patterns across all sessions                    │
│  • Update crew recommendations based on patterns                   │
│  • Surface high-confidence ambiguities to user                     │
│                                                                     │
│  Example:                                                           │
│  "We noticed 80% of coffee shop projects spend time on loyalty.    │
│   Should we suggest loyalty features earlier in the flow?"         │
│                                                                     │
│  Crew votes → Update default templates                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Dashboard UI: Memory Controls

```
┌─────────────────────────────────────────────────────────────────────┐
│  Settings → Memory & Privacy                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🧠 What Alex AI Remembers About You                               │
│                                                                     │
│  ☑️ Remember my interactions to improve suggestions                │
│     (You can turn this off anytime)                                │
│                                                                     │
│  📊 Your Activity (Last 30 Days)                                   │
│  • 12 projects created                                             │
│  • 3 themes explored (mocha, offworld, cyberpunk)                  │
│  • Common pattern: You spend time on theme selection               │
│                                                                     │
│  🤖 What The Crew Learned:                                         │
│  • You prefer warm, earthy themes                                  │
│  • You value simplicity over complexity (Chief O'Brien agrees!)    │
│  • Ambiguity detected: Unclear if you need e-commerce features     │
│                                                                     │
│  💬 Clarify Ambiguity:                                             │
│  "We noticed you often hover over e-commerce sections but don't    │
│   enable them. Does this mean:"                                    │
│   ○ I don't need e-commerce                                        │
│   ○ I'm considering e-commerce for later                           │
│   ○ I don't understand the e-commerce options                      │
│                                                                     │
│  🗑️  Forget Everything  │  📥 Download My Data                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation Plan

**Phase 1: Event Capture (Week 1)**
- [ ] Add event tracking to dashboard components
- [ ] Create Supabase table: `ambient_events`
- [ ] Build event batching (30-second intervals)
- [ ] Create n8n workflow: "Ambient Event Ingestion"
- [ ] Privacy toggle in settings

**Phase 2: Interpretation Engine (Week 2)**
- [ ] Create n8n workflow: "Multi-Interpretation Generator"
- [ ] Use GPT-4 to generate multiple interpretations
- [ ] Confidence scoring algorithm
- [ ] Store in Supabase: `ambient_interpretations`

**Phase 3: Pattern Recognition (Week 3)**
- [ ] Create n8n workflow: "Pattern Analyzer"
- [ ] Aggregate patterns across sessions
- [ ] Generate crew recommendations
- [ ] Store in Supabase: `learned_patterns`

**Phase 4: Memory Dashboard (Week 4)**
- [ ] Create `/settings/memory` route
- [ ] Show user their activity and patterns
- [ ] Ambiguity clarification UI
- [ ] "Forget Everything" and data export

**Success Metrics:**
- User opts-in to memory: 70%+
- Ambiguities correctly identified: 80%+
- User finds "What Alex AI Knows" useful: 90%+
- Privacy violations: 0 (critical)

---

## 📋 PILLAR C: Military-Grade Security (Worf Protocol)

### Concept: Lt. Worf's Security Framework

**Current State:**
- Basic HTTPS (Let's Encrypt)
- Supabase Auth (JWT tokens)
- Secrets in `~/.zshrc` (development only)
- No rate limiting
- No audit logging
- No penetration testing

**Target State (Worf Protocol):**
> "Security is not an afterthought—it is the foundation upon which all systems must be built. Any breach is a dishonor to the entire crew."  
> — Lt. Worf

```
┌─────────────────────────────────────────────────────────────────────┐
│  WORF SECURITY PROTOCOL v1.0                                        │
│  "Military-Grade Security for Civilian Applications"                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TIER 1: PERIMETER DEFENSE                                          │
│  ✅ WAF (Web Application Firewall) - Cloudflare or AWS WAF         │
│  ✅ DDoS Protection - Cloudflare                                    │
│  ✅ Rate Limiting - nginx + Supabase RLS                            │
│  ✅ Geo-blocking - Block known malicious regions                    │
│  ✅ Bot Detection - Cloudflare Turnstile                            │
│                                                                     │
│  TIER 2: AUTHENTICATION & AUTHORIZATION                             │
│  ✅ MFA Required - TOTP (Google Authenticator) + SMS backup         │
│  ✅ Passkeys - WebAuthn biometric auth (primary)                    │
│  ✅ Session Management - Short-lived JWTs (15 min)                  │
│  ✅ Refresh Tokens - HTTP-only cookies, rotation on use             │
│  ✅ Role-Based Access Control (RBAC) - Supabase RLS policies        │
│                                                                     │
│  TIER 3: DATA PROTECTION                                            │
│  ✅ Encryption at Rest - AES-256 (Supabase native)                  │
│  ✅ Encryption in Transit - TLS 1.3 only                            │
│  ✅ Field-Level Encryption - PII fields encrypted separately        │
│  ✅ Key Rotation - AWS Secrets Manager, 90-day rotation             │
│  ✅ Backup Encryption - Supabase automated backups encrypted        │
│                                                                     │
│  TIER 4: AUDIT & COMPLIANCE                                         │
│  ✅ Immutable Audit Logs - All actions logged to audit_logs table   │
│  ✅ Anomaly Detection - ML-based (AWS GuardDuty)                    │
│  ✅ Security Scanning - Daily Dependabot + Snyk                     │
│  ✅ Penetration Testing - Quarterly (BugCrowd or HackerOne)         │
│  ✅ Compliance - SOC 2 Type II preparation                          │
│                                                                     │
│  TIER 5: INCIDENT RESPONSE                                          │
│  ✅ Automated Alerts - CloudWatch + PagerDuty                       │
│  ✅ Incident Runbooks - Documented response procedures              │
│  ✅ Automated Lockdown - Suspicious activity triggers auto-disable  │
│  ✅ Forensic Logging - Detailed logs for investigation              │
│  ✅ Recovery Procedures - Tested disaster recovery                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation Plan

**Phase 1: Perimeter Defense (Week 1)**
- [ ] Set up Cloudflare WAF
- [ ] Configure DDoS protection
- [ ] Add nginx rate limiting (10 req/sec per IP)
- [ ] Add Supabase RLS rate limits
- [ ] Enable Cloudflare bot detection

**Phase 2: Authentication (Week 2)**
- [ ] Implement MFA (TOTP via Supabase Auth)
- [ ] Add passkey support (WebAuthn)
- [ ] Short-lived JWTs (15 min → 5 min)
- [ ] Refresh token rotation
- [ ] Audit all RBAC policies

**Phase 3: Data Protection (Week 2)**
- [ ] Verify encryption at rest (Supabase default)
- [ ] Enforce TLS 1.3 (nginx config)
- [ ] Migrate secrets to AWS Secrets Manager
- [ ] Set up 90-day key rotation
- [ ] Field-level encryption for PII

**Phase 4: Audit & Compliance (Week 3)**
- [ ] Create `audit_logs` table (immutable)
- [ ] Log all user actions
- [ ] Set up AWS GuardDuty
- [ ] Configure Dependabot + Snyk
- [ ] Schedule quarterly pen testing

**Phase 5: Incident Response (Week 4)**
- [ ] CloudWatch alarms for anomalies
- [ ] PagerDuty integration
- [ ] Write incident runbooks
- [ ] Automated lockdown rules
- [ ] Test disaster recovery

**Worf's Security Checklist (Daily)**
```bash
# scripts/worf-security-check.sh
#!/bin/bash
# Lt. Worf's Daily Security Patrol

echo "🛡️  Worf's Security Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for unauthorized access attempts
echo "🔍 Checking audit logs for suspicious activity..."
psql $SUPABASE_URL -c "
  SELECT COUNT(*) as failed_logins 
  FROM audit_logs 
  WHERE action='login_failed' 
  AND created_at > NOW() - INTERVAL '24 hours';
"

# Check for outdated dependencies
echo "🔍 Checking for vulnerable dependencies..."
npm audit --json | jq '.metadata.vulnerabilities'

# Check SSL certificate expiry
echo "🔍 Checking SSL certificate..."
echo | openssl s_client -connect n8n.pbradygeorgen.com:443 2>/dev/null | 
  openssl x509 -noout -dates

# Check for exposed secrets
echo "🔍 Checking for exposed secrets in code..."
git diff HEAD~1 | grep -i "api_key\|password\|secret" && 
  echo "⚠️  SECURITY ALERT: Possible secret in commit!" ||
  echo "✅ No secrets found"

# Check rate limiting
echo "🔍 Testing rate limiting..."
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}" https://n8n.pbradygeorgen.com/webhook/test
done
echo " (Should see 429 after 10 requests)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Security patrol complete"
```

**Success Metrics:**
- Zero security breaches
- 100% audit log coverage
- <5 high/critical vulnerabilities
- <1 minute incident response time
- SOC 2 ready by Q2 2026

---

## 📋 PILLAR D: Universal Next.js Integration

### Concept: Non-Destructive Project Editing

**Current State:**
- Dashboard manages 4 hardcoded projects (alpha, beta, gamma, temporal)
- Projects generated from scratch
- No ability to import existing Next.js projects
- Dashboard editing only works for projects created by dashboard

**Target State:**
> "Any Next.js project should be editable via the dashboard without destroying its unique structure. The dashboard adapts to the project, not the other way around."

```
┌─────────────────────────────────────────────────────────────────────┐
│  IMPORT EXISTING PROJECT                                            │
│                                                                     │
│  Step 1: User provides GitHub URL or uploads ZIP                   │
│  Step 2: Alex AI analyzes project structure                        │
│  Step 3: Identifies editable elements (headlines, themes, etc.)    │
│  Step 4: Creates non-destructive overlay                           │
│  Step 5: User edits via dashboard                                  │
│  Step 6: Changes written back to original structure                │
│                                                                     │
│  🎯 KEY: Never overwrite original code, only augment it            │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  PROJECT ANALYZER (n8n Workflow: "Next.js Structure Detective")    │
│                                                                     │
│  Input: GitHub URL or ZIP file                                     │
│  Output: Project metadata + editable surface area                  │
│                                                                     │
│  Analysis Steps:                                                    │
│  1. Clone/unzip project                                             │
│  2. Detect framework version (Next.js 13/14/15)                    │
│  3. Identify app structure (pages/ vs app/)                        │
│  4. Find entry points (page.tsx, layout.tsx)                       │
│  5. Extract editable content:                                       │
│     • Text nodes (headlines, paragraphs)                           │
│     • Theme variables (CSS, Tailwind config)                       │
│     • Images (public/ directory)                                   │
│     • Data files (JSON, MD)                                        │
│  6. Map to dashboard editing interface                             │
│                                                                     │
│  Store in Supabase:                                                 │
│  {                                                                  │
│    "project_id": "external_project_123",                            │
│    "source_type": "github",                                         │
│    "source_url": "https://github.com/user/project",                │
│    "framework": "next.js@14.2.0",                                   │
│    "structure": {                                                   │
│      "type": "app_router",                                          │
│      "entry_points": [                                              │
│        "app/page.tsx",                                              │
│        "app/about/page.tsx"                                         │
│      ]                                                              │
│    },                                                               │
│    "editable_map": {                                                │
│      "headline": {                                                  │
│        "file": "app/page.tsx",                                      │
│        "line": 15,                                                  │
│        "selector": "h1.hero-title",                                 │
│        "current_value": "Welcome to My Site"                        │
│      },                                                             │
│      "theme": {                                                     │
│        "file": "tailwind.config.js",                                │
│        "variables": {                                               │
│          "primary": "#3b82f6",                                      │
│          "secondary": "#8b5cf6"                                     │
│        }                                                            │
│      }                                                              │
│    }                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  NON-DESTRUCTIVE OVERLAY SYSTEM                                     │
│                                                                     │
│  Instead of modifying original files directly, create overlay:     │
│                                                                     │
│  project-root/                                                      │
│  ├── app/                      (original structure - untouched)    │
│  │   └── page.tsx                                                  │
│  ├── .alex-ai/                 (overlay directory - new)           │
│  │   ├── metadata.json         (project metadata)                  │
│  │   ├── overrides/            (content overrides)                 │
│  │   │   ├── headlines.json                                        │
│  │   │   ├── theme.json                                            │
│  │   │   └── images/                                               │
│  │   └── build-hook.js         (injects overrides at build)        │
│  └── package.json              (add build hook)                    │
│                                                                     │
│  Build Process:                                                     │
│  1. Original Next.js build runs                                    │
│  2. Alex AI build hook runs                                        │
│  3. Overrides applied to build output (not source!)                │
│  4. Final site includes dashboard edits                            │
│  5. Source code remains pristine ✅                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Dashboard UI: Import Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard → Projects → Import Existing Project                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📥 Import Your Next.js Project                                    │
│                                                                     │
│  Option 1: GitHub Import                                            │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ https://github.com/username/my-project                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  [ Import from GitHub ]                                             │
│                                                                     │
│  Option 2: Upload ZIP                                               │
│  [ Choose File ] my-project.zip                                     │
│  [ Upload Project ]                                                 │
│                                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                     │
│  🔍 Analysis Results:                                              │
│  ✅ Next.js 14.2.0 detected                                        │
│  ✅ App Router structure                                           │
│  ✅ 5 pages found                                                  │
│  ✅ Tailwind CSS detected                                          │
│                                                                     │
│  📝 Editable Elements:                                             │
│  • 12 text headlines                                               │
│  • 1 theme configuration                                           │
│  • 8 images                                                        │
│  • 3 data files                                                    │
│                                                                     │
│  ⚠️  Non-Editable (Will Remain Untouched):                        │
│  • Custom React components                                         │
│  • API routes                                                      │
│  • Server-side logic                                               │
│                                                                     │
│  [ ✓ I understand dashboard edits won't change original code ]     │
│  [ Import & Edit Project ]                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation Plan

**Phase 1: Project Analyzer (Week 1-2)**
- [ ] Create n8n workflow: "Next.js Structure Analyzer"
- [ ] GitHub API integration for cloning
- [ ] ZIP upload handler
- [ ] Framework detection (Next.js version)
- [ ] Entry point identification
- [ ] Editable content extraction
- [ ] Store analysis in Supabase: `external_projects`

**Phase 2: Overlay System (Week 2-3)**
- [ ] Create `.alex-ai/` directory structure
- [ ] Build hook implementation (modifies build output)
- [ ] Override injection system
- [ ] Test with various Next.js projects
- [ ] Ensure original code untouched

**Phase 3: Dashboard Integration (Week 3-4)**
- [ ] Create `/projects/import` route
- [ ] GitHub import UI
- [ ] ZIP upload UI
- [ ] Analysis results display
- [ ] Edit interface (reuse existing editor)
- [ ] Preview with overrides applied

**Phase 4: Build & Deploy (Week 4)**
- [ ] Automated build process
- [ ] Deploy to Vercel/Netlify with overrides
- [ ] Sync changes back to GitHub (optional)
- [ ] Test with real-world projects

**Success Metrics:**
- Import success rate: 90%+ for Next.js projects
- Original code untouched: 100%
- Dashboard edits functional: 95%+
- User satisfaction: "Easy to import existing projects"

---

## 🎯 Integration: All Four Pillars Together

### The Complete Flow

```
USER JOURNEY: Creating a Project with All Four Pillars
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. USER INPUT (Natural Language)
   "I need a landing page for my artisan coffee shop"
   
   → PILLAR B: Ambient Intelligence captures this + hesitations
   
2. CREW EVALUATION (All 12 Crew Members)
   → PILLAR A: Crew discusses, evaluates, reaches consensus
   
   Worf: "Security assessment: Requires PCI compliance if e-commerce"
   → PILLAR C: Security requirements identified upfront
   
3. PROJECT GENERATION
   • AI-generated based on crew consensus
   • OR user imports existing project
   → PILLAR D: Works for generated OR imported projects
   
4. EDITING VIA DASHBOARD
   • User edits headline, theme, content
   → PILLAR B: All edits captured, ambiguities detected
   → PILLAR D: Changes applied non-destructively
   
5. DEPLOYMENT
   → PILLAR C: Security checks run (Worf's approval required)
   → All tests pass → Deploy
   
6. LEARNING
   → PILLAR B: Patterns learned, crew improves next time
```

---

## 📊 Implementation Timeline

### V2.1 Release Plan (12 Weeks)

**Weeks 1-3: Foundation**
- Pillar C Phase 1-2 (Security perimeter + auth)
- Pillar B Phase 1 (Event capture)
- Documentation and crew training

**Weeks 4-6: Intelligence**
- Pillar A Phase 1-2 (Intent analysis + crew convocation)
- Pillar B Phase 2-3 (Interpretation + patterns)
- Security Phase 3 (Data protection)

**Weeks 7-9: Integration**
- Pillar D Phase 1-2 (Project analyzer + overlay)
- Pillar A Phase 3-4 (Consensus + generation)
- Security Phase 4 (Audit logging)

**Weeks 10-12: Polish & Deploy**
- All Pillar Phase 4s (Dashboard UIs)
- Security Phase 5 (Incident response)
- End-to-end testing
- Launch v2.1 🚀

---

## 🎖️ Crew Assignments

**Captain Picard:** Strategic oversight, user experience philosophy
**Commander Data:** Technical architecture, AI systems
**Commander Riker:** Project management, tactical execution
**Lt. Cmdr. La Forge:** Infrastructure, build systems
**Lt. Worf:** Security (owns Pillar C entirely)
**Counselor Troi:** Ambient intelligence UX, ambiguity design
**Dr. Crusher:** Health monitoring, diagnostics
**Lt. Uhura:** Event capture, communication patterns
**Quark:** Business intelligence, ROI tracking
**Chief O'Brien:** Build automation, pragmatic solutions
**+2 Crew:** Specialized roles as needed

---

## 📝 Success Criteria (v2.1)

**Pillar A: Crew-Powered Generation**
- [ ] 12 crew members evaluate every project
- [ ] Consensus reached in <30 seconds
- [ ] User satisfaction: 90%+

**Pillar B: Ambient Intelligence**
- [ ] 70%+ users opt-in to memory
- [ ] Ambiguities correctly identified: 80%+
- [ ] Privacy violations: 0

**Pillar C: Military-Grade Security**
- [ ] Zero security breaches
- [ ] SOC 2 Type II ready
- [ ] Worf's daily checks: 100% pass rate

**Pillar D: Universal Next.js**
- [ ] Import success: 90%+ for Next.js projects
- [ ] Original code untouched: 100%
- [ ] Dashboard edits functional: 95%+

---

**Status:** Roadmap Complete, Ready for Implementation  
**Next Step:** User approval to proceed with v2.1 implementation  
**Estimated Completion:** Q1 2026

---

*"Make it so."*  
— Captain Jean-Luc Picard

