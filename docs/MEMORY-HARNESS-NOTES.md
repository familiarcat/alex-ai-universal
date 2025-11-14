# Memory Harness Automation Notes

Date: 2025-11-14

## Goals
- Create a fast, platform-agnostic end-to-end test harness for the RAG memory system.
- Keep GitHub Actions runtime under one minute by scoping installs to the harness package.
- Ensure secrets follow the single-source-of-truth policy (`~/.zshrc` → GitHub → AWS/n8n).
- Capture harness output as an artifact for downstream ingestion.

## Implementation Steps
1. **Scoped Package**
   - Added `tests/memory-harness` as a standalone package with its own `package.json`, `tsconfig`, and lockfile.
   - Updated `.github/workflows/memory-harness.yml` to run `npm ci --prefix tests/memory-harness` with caching keyed to the harness lockfile.

2. **Workflow Optimizations**
   - Removed repo-wide `npm ci`, reducing runtime from ~6 minutes to ~10 seconds after cache warm-up.
   - Added conditional Supabase verification (skips when secrets are masked) to prevent failures on GitHub-hosted runners.
   - Generated `tests/memory-harness/output.json` containing inserted memory IDs and uploaded it as the `memory-harness-output` artifact.

3. **Secret Automation**
   - Synced `N8N_URL` and `SUPABASE_URL` secrets from `~/.zshrc` via `scripts/collect-automation-secrets.js` + `gh secret set`.
   - Harness now resolves webhook URLs with sane defaults and validates HTTPS prefixes to avoid masked values like `***`.

4. **Artifact Handling**
   - Harness writes the list of inserted memory IDs to `output.json` so CI artifacts can feed the ingestion script (`scripts/n8n-post-knowledge.js`).
   - Local workflow documented: trigger harness → download artifact → ingest IDs into RAG.

## Next Recommendations
- Wire the ingestion script into the workflow (post-success job) once the n8n knowledge endpoint is confirmed healthy.
- Expand the harness to run nightly with higher `HARNESS_COUNT` and alert on failed Supabase verification.
- Record additional notes here whenever the harness flow changes so the RAG system can stay aligned with reality.


