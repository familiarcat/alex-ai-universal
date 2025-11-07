#!/usr/bin/env node
/**
 * Store Crew Dashboard Observations in RAG
 * 
 * Sends each crew member's analysis to n8n for RAG storage
 */

const axios = require('axios');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';

const crewObservations = [
  {
    crew_member: "Captain Jean-Luc Picard",
    specialty: "Strategic Leadership",
    observation_type: "Strategic Architecture Assessment",
    key_insights: [
      "Client-only rendering strategy eliminates hydration errors",
      "Scalability pattern: Unlimited projects with dynamic IDs",
      "Integration architecture: n8n as middleware, Supabase as source of truth",
      "Crew consensus decision-making documented",
      "Production-ready with clear architectural decisions"
    ],
    recommendations: [
      "Document architectural decisions for future crew",
      "Establish patterns for new feature integration",
      "Create roadmap for crew-driven enhancements",
      "Monitor system health through dashboard metrics"
    ],
    tags: ["strategic-architecture", "production-ready", "client-rendering", "scalability-pattern", "dashboard"],
    priority: "high",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Commander Data",
    specialty: "Analytics & Code Analysis",
    observation_type: "Code Pattern Analysis",
    key_insights: [
      "State management: Lazy initialization with useState(() => fn())",
      "Crossfade algorithm: Overlapping iframes with 100ms paint delay",
      "TypeScript coverage: ~70% (41/160 files)",
      "Debounced updates: 300ms for smooth 60fps editing",
      "High component reusability: 20 shared components"
    ],
    recommendations: [
      "Replicate lazy state initialization pattern",
      "Use debounced updates for performance-critical features",
      "Continue client-only rendering for interactive apps",
      "Implement dynamic imports for code splitting"
    ],
    tags: ["code-patterns", "state-management", "type-safety", "performance-optimization", "dashboard"],
    priority: "high",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Lieutenant Commander Geordi La Forge",
    specialty: "Infrastructure",
    observation_type: "Technical Infrastructure Assessment",
    key_insights: [
      "Build system: Next.js 15 + Tailwind 4 + TypeScript 5",
      "Deployment: Docker + Nginx + AWS Amplify + 37 scripts",
      "Integration points: n8n, Supabase, OpenRouter",
      "Performance: Client-only rendering eliminates SSR overhead",
      "Dependencies: All up-to-date, 0 vulnerabilities"
    ],
    recommendations: [
      "Implement CI/CD pipeline (GitHub Actions)",
      "Add automated testing suite",
      "Set up performance monitoring (Lighthouse)",
      "Create infrastructure-as-code integration"
    ],
    tags: ["infrastructure", "build-system", "deployment", "ci-cd-needed", "dashboard"],
    priority: "medium",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Lieutenant Worf",
    specialty: "Security & Compliance",
    observation_type: "Security Analysis",
    key_insights: [
      "CRITICAL: No authentication system implemented",
      "WARNING: API routes have no protection",
      "MEDIUM: Environment keys exposed to client",
      "Webhook auth: HMAC signature verification exists",
      "Supabase RLS status: Unknown (needs verification)"
    ],
    recommendations: [
      "Priority 1: Implement authentication (NextAuth.js or Supabase Auth)",
      "Priority 2: Protect API routes with middleware",
      "Priority 3: Enable Row Level Security in Supabase",
      "Priority 4: Add security headers (CSP, HSTS)"
    ],
    tags: ["security-assessment", "authentication-needed", "api-protection", "vulnerabilities", "dashboard"],
    priority: "critical",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Counselor Deanna Troi",
    specialty: "User Experience",
    observation_type: "UX Assessment",
    key_insights: [
      "12 distinct themes provide rich visual experience",
      "Smooth crossfade transitions prevent jarring flash",
      "Live preview builds user confidence",
      "Clear linear flow: Entry → Theme → Create → Edit → Preview",
      "Debounced updates create smooth 60fps editing experience"
    ],
    recommendations: [
      "Add onboarding wizard for first-time users",
      "Implement toast notifications for action feedback",
      "Create project organization system (tags/folders)",
      "Add undo/redo functionality to state manager",
      "Enhance loading states with skeleton screens"
    ],
    tags: ["user-experience", "interaction-design", "emotional-design", "onboarding-needed", "dashboard"],
    priority: "medium",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Dr. Beverly Crusher",
    specialty: "System Health & Diagnostics",
    observation_type: "Health & Diagnostics Assessment",
    key_insights: [
      "Performance: TTI ~2-3s (good), FCP ~1s (excellent), CLS 0 (excellent)",
      "Dependencies: All up-to-date, 0 vulnerabilities (352 packages)",
      "State management healthy: No memory leaks detected",
      "CRITICAL: No error monitoring system (Sentry/LogRocket)",
      "WARNING: Missing performance metrics dashboard"
    ],
    recommendations: [
      "Implement React Error Boundaries",
      "Add Sentry for error tracking",
      "Create health dashboard for metrics visualization",
      "Set up automated health checks (cron jobs)"
    ],
    tags: ["system-health", "diagnostics", "error-monitoring-needed", "dependencies", "dashboard"],
    priority: "high",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Commander William Riker",
    specialty: "Tactical Execution",
    observation_type: "Tactical Implementation Analysis",
    key_insights: [
      "Clear execution flow: Create → Theme → Components → Edit → Publish",
      "20 components with clear separation of concerns",
      "All state mutations centralized in state manager",
      "Deployment ready: Docker + Nginx + multiple paths",
      "37 deployment scripts (consolidation needed)"
    ],
    recommendations: [
      "Implement testing strategy: Unit + Integration + E2E",
      "Consolidate 37 deployment scripts to 3 unified commands",
      "Create operational playbooks for incidents",
      "Establish feature development process with crew review"
    ],
    tags: ["tactical-execution", "project-management", "testing-needed", "deployment-consolidation", "dashboard"],
    priority: "high",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Lieutenant Uhura",
    specialty: "Communications & I/O",
    observation_type: "Communications & Integration Analysis",
    key_insights: [
      "17 API routes: health, agent, crew, lounge, knowledge, ingest, themes, events",
      "Data flow: User → State Manager → Debounce → LocalStorage + Supabase → n8n",
      "RESTful API design with consistent JSON structure",
      "Webhook authentication via HMAC signatures",
      "No WebSocket: Using polling instead of real-time updates"
    ],
    recommendations: [
      "Generate OpenAPI specification for all 17 endpoints",
      "Consider WebSocket or Server-Sent Events for real-time",
      "Implement request/response logging for debugging",
      "Create crew coordination protocol for inter-crew messaging"
    ],
    tags: ["communications", "api-architecture", "integration-patterns", "real-time-needed", "dashboard"],
    priority: "medium",
    project: "alex-ai-dashboard"
  },
  {
    crew_member: "Chief Miles O'Brien",
    specialty: "Pragmatic Solutions",
    observation_type: "Pragmatic Assessment",
    key_insights: [
      "What works: Fast loading, live preview, simple themes, reliable saves",
      "What's broken: 37 deployment scripts (too many), no auth (major hole), no tests",
      "Over-engineered: Multiple deployment variations, redundant server files",
      "Simple solutions that work: State manager (1 file), theme system (CSS vars), crossfade (2 iframes)",
      "Quick wins: Delete 30 scripts, add NextAuth, write 10 tests"
    ],
    recommendations: [
      "Consolidate to 3 deployment scripts: dev, staging, prod",
      "File cleanup: Delete old versions, remove unused servers",
      "Use NextAuth.js with Google OAuth (2 hours)",
      "Focus testing on state manager and API routes (high ROI)"
    ],
    tags: ["pragmatic-solutions", "over-engineering", "cleanup-needed", "quick-wins", "dashboard"],
    priority: "high",
    project: "alex-ai-dashboard"
  }
];

async function storeObservation(observation) {
  const payload = {
    knowledge_type: "crew_observation",
    source: "dashboard_analysis_session",
    content: JSON.stringify(observation, null, 2),
    metadata: {
      crew_member: observation.crew_member,
      specialty: observation.specialty,
      observation_type: observation.observation_type,
      priority: observation.priority,
      project: observation.project,
      tags: observation.tags,
      session_date: "2025-11-07",
      analysis_type: "comprehensive_dashboard_analysis"
    }
  };

  try {
    const response = await axios.post(
      `${N8N_URL}/webhook/knowledge-ingest`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    console.log(`✅ ${observation.crew_member}: ${response.status}`);
    return { success: true, crew_member: observation.crew_member };
  } catch (error) {
    console.error(`❌ ${observation.crew_member}: ${error.message}`);
    return { success: false, crew_member: observation.crew_member, error: error.message };
  }
}

async function main() {
  console.log('🏛️  Storing Crew Dashboard Observations in RAG...\n');
  
  const results = [];
  for (const observation of crewObservations) {
    const result = await storeObservation(observation);
    results.push(result);
    // Delay between requests to respect rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`   ✅ Successful: ${successful}/${results.length}`);
  console.log(`   ❌ Failed: ${failed}/${results.length}`);
  
  if (successful === results.length) {
    console.log('\n🎉 All crew observations stored in RAG successfully!');
  } else {
    console.log('\n⚠️  Some observations failed to store. Check errors above.');
  }
}

main().catch(console.error);

