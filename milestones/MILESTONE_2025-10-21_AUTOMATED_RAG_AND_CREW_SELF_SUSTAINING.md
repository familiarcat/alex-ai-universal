## Milestone – 2025-10-21 – Automated RAG + Self‑Sustaining Crew

Summary
- Crew can automatically persist development knowledge to Supabase RAG via n8n.
- One‑command posting and auto‑derivation from git diffs.

What’s new
- bin/alex-n8n-post: crew wrapper to POST collaboration notes (uses ~/.zshrc)
- scripts/n8n-post-collaboration.sh: robust POST with zsh auto‑invoke and GET fallback guidance
- scripts/auto-rag-from-git.js: derives findings + crew_memories from git range and posts via n8n
- docs/CREW_CAPABILITIES.md: crew capacity to store knowledge via n8n → Supabase
- docs/N8N_WEBHOOK_STATUS_AND_NEXT16_PREP.md: operational plan captured and posted

Operating procedure
- Post notes:
  - alex-n8n-post <plan_id> <doc.md>
- Auto‑derive from last commit:
  - node scripts/auto-rag-from-git.js --range HEAD~1..HEAD --plan AUTO_RAG_<YYYY-MM-DD>

Impact
- Shared memory continuously accrues; crew recalls domain changes by specialty
- Lower friction; standardized payloads; production webhook ready with GET fallback

Next
- Ensure collaboration‑complete POST workflow is active in n8n
- Extend auto‑derivation mapping and include token/theme updates from API responses

