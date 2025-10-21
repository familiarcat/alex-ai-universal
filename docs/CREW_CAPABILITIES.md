## Crew Capabilities (Operational)

- Store collaboration findings and notes to Supabase RAG via n8n
  - Use POST webhook: `$N8N_COLLAB_COMPLETE_WEBHOOK` (fallback to `$N8N_COLLABORATION_WEBHOOK` or `${N8N_BASE_URL}/webhook/collaboration-complete`)
  - Script: `./scripts/n8n-post-collaboration.sh <plan_id> <doc.md>`
  - Payload structure: `collaboration_result` + `crew_memories`
  - GET summary fallback is available when POST is not registered

- Live Preview discipline
  - Use `?embed=1` for production‑faithful previews (no dev chrome/overlays)
  - Token parity: prefer applying `/api/projects/[id]/tokens` in preview when feasible
