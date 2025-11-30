## N8N Webhook Status and Next.js 16 Prep

### N8N Webhook Status
- Collaboration-complete webhook:
  - Endpoint in use by executor: `N8N_COLLAB_COMPLETE_WEBHOOK` or fallback `N8N_COLLABORATION_WEBHOOK`
  - POST preferred; GET fallback implemented (summary mode) when POST not registered
  - Action required: create/activate workflow at `/webhook/collaboration-complete` (POST) to persist crew memories to Supabase `agent_memories`
- Per-crew fanout (optional): endpoints like `/webhook/crew-captain-jean-luc-picard`, `/webhook/crew-commander-data`, etc.
  - Useful when collaboration webhook is unavailable; can be activated later
- Environment alignment:
  - `N8N_BASE_URL`, `N8N_URL`, `N8N_API_KEY`
  - `N8N_COLLAB_COMPLETE_WEBHOOK` (recommended) or `N8N_COLLABORATION_WEBHOOK` (compat)

### Next.js 16 Prep (High-Level)
- Confirm Node and dependency versions; update `next`, `eslint-config-next`, `@types/*`
- Keep `experimental.externalDir` and consider Turbopack dev
- Validate rewrites/redirects; remove legacy static export assumptions
- App router parity checks (dynamic segments, route handlers)
- Re-enable lint during build once plugins are aligned
- Full route smoke + timeout metrics

### Crew Assignments
- Uhura: verify n8n endpoints live, credentials configured, and webhook execution succeeds with 2xx
- La Forge: dependency upgrades, route parity, and build stability
- Data: document breaking diffs and propose migration steps for any routing or link behavior changes


