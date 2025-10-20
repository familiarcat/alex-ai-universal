## Alex AI Engagement — 2025-10-20

### Purpose
Launch a designer-first, real-time theme pipeline using a single Figma file as the source of truth, enabling project owners to spin up projects with a base theme and evolve unique UIs.

### Branch
- `feature/alex-ai-engagement-2025-10-20`

### Owners
- Product/Design: TBD
- Engineering: TBD

### Outcomes
- Live Figma → tokens sync using Variables and webhooks
- Per-theme overrides and per-project overrides
- API endpoints to serve merged tokens to projects

### Designer workflow (single .fig)
1. Use theme-prefixed Variables in Figma: `<theme>/text`, `<theme>/surface`, etc.
2. For project-specific tweaks, add `<projectId>/<themeId>/...` Variables.
3. Publish Variables when ready.

### Dev workflow
- One-time env setup:
  - `scripts/configure-figma-env.sh` (sets FIGMA_TOKEN, FIGMA_FILE_KEY_MASTER, WEBHOOK_BASE_URL, optional per-theme keys)
  - `scripts/ensure-figma-webhook-secret.sh`
- Register webhooks: `node scripts/register-figma-webhooks.js`
- Live sync runner: `node scripts/figma-live-sync.js`

### Key scripts
- `scripts/export-themes-for-figma.js` — generate per-theme Tokens Studio JSON
- `scripts/tokens-studio-combine-for-figma.js` — one combined import file
- `scripts/figma-export-serve.sh` — serve JSON for URL Sync
- `scripts/figma-token-sync.js <theme>` — pull Variables → theme overrides
- `scripts/figma-project-sync.js <projectId> <themeId>` — pull Variables → project overrides
- `scripts/register-figma-webhooks.js` — create FILE_UPDATE webhooks for all configured files

### API
- Theme tokens: `/api/themes/[theme]/tokens`
- Project tokens (merged base + theme + project): `/api/projects/[project]/tokens`

### Done criteria
- Designers can update Variables in the single .fig and see app tokens update
- Project owners can base on a theme and add project-specific Variables
- Webhook-based automation in place (no manual polling needed)

### Follow-ups
- Dashboard button: Force Sync Now (calls the same backend sync)
- Optional: Style Dictionary outputs for platforms beyond web


