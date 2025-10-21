## Milestone – 2025-10-21 – Preview Policy and Theme Parity

Summary
- Established a clear Preview Policy and aligned live previews with production behavior.
- Removed developer overlays from project previews and suppressed dashboard chrome for embeds.
- Ensured theme parity by extending preview theme mapping (midnight, glass); set the stage for token-driven previews.

Key Changes
- dashboard/app/reports/observation-lounge/page.tsx
  - Added “Preview Policy” section clarifying isolation and production‑faithful behavior
  - Hydration-safe timestamp rendering
- dashboard/components/DashboardChrome.tsx
  - Suppress DevNavigation/StatusRibbon/CommandPalette on `/projects/*` and `?embed=1`
- dashboard/app/projects/[projectId]/page.tsx
  - Removed Dev Mode Info; added embed detection; extended theme mapping (midnight, glass)
- dashboard/app/projects/page.tsx, dashboard/app/gallery/page.tsx
  - “View” links use `?embed=1` to force production‑style preview

Verification
- Routes return 200 locally:
  - /projects/<id>?embed=1
  - /reports/observation-lounge
- No hydration warnings on Observation Lounge page
- Preview renders without dev chrome/overlays

Next
- Apply token-based CSS from `/api/projects/[id]/tokens` in preview to guarantee full theme parity
- Activate n8n collaboration-complete webhook to persist findings to Supabase automatically
- Begin Next.js 16 upgrade once route parity is fully validated


