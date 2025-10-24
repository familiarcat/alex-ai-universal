# Secret Boundary RFC – Alex AI (Controller/RAG)

Status: Draft (Ready to implement)
Owner: Security Crew
Last updated: 2025-10-24

## Goals

- Single source of truth for secrets; no client-side secret exposure
- Enforce DDD boundaries: Client (UI), Controller (n8n), Data (Supabase)
- Standardize injection for CI/CD and server runners; enable rotation and least privilege
- Redact secrets in logs and error surfaces

## Domain Boundaries

- Client (Dashboard/Next.js)
  - Allowed: public/anon tokens only (e.g., SUPABASE_ANON_KEY)
  - Enforced by RLS and scope; no service keys, no n8n API keys

- Controller (n8n)
  - Holds service-level credentials (Supabase service role or RAG ingest role)
  - Receives client posts via webhooks; never returns secrets
  - Writes to data layer; logs without secrets (redacted)

- Data (Supabase)
  - Tables secured by RLS for public/anon
  - Dedicated role for ingestion (INSERT-only, limited columns/tables)
  - Keys rotated via CI/CD vault

## Secret Sources (Priority Order)

1. CI/CD-managed secrets (GitHub Actions Environments, self-hosted vault)
2. n8n Credential Store (for controller-only operations)
3. Local dev: .env (public scope) and optional ~/.zshrc fallback

## Injection Patterns

- CI/CD / server runners
  - Inject via environment (no .env files on server images)
  - For n8n → use built-in credential store
  - For server scripts → env vars passed by runner/PM2/systemd

- Local development
  - Dashboard: .env.local (public/anon only)
  - Scripts: resolve from process.env first; optionally fall back to ~/.zshrc for convenience

## Rotation & Least Privilege

- Create Supabase role `rag_ingest_role`
  - INSERT on `knowledge_base`, `rag_ingestion_log`
  - No SELECT on sensitive columns; no UPDATE/DELETE
  - Issue key stored in n8n credentials + CI/CD vault

- Rotation playbook
  - Rotate n8n and Supabase keys quarterly or on incident
  - Staged rollout: create new cred → update n8n creds → redeploy → revoke old cred

## Logging & Redaction

- Redact patterns in scripts and n8n flows (X-N8N-API-KEY, Authorization, apikey)
- Never print entire response bodies when status >= 400 from auth endpoints

## Migration Plan

Phase 1 (now)
- Add unified secret loader that prefers process.env and falls back to ~/.zshrc for local dev
- Update verification/utility scripts to use unified loader
- Ensure milestone push uses controller for ingestion (done)

Phase 2
- Move any remaining scripts that parse ~/.zshrc directly to the loader
- Add GitHub Actions environment and document required secrets
- Create `rag_ingest_role` in Supabase and update n8n credentials

Phase 3
- Add automated redaction helpers for logs in scripts and n8n function nodes
- Add quarterly rotation reminders/workflow

## Required Secrets (centralized)

- N8N_BASE_URL, N8N_API_KEY (controller API; server only)
- SUPABASE_URL, SUPABASE_ANON_KEY (client-safe)
- SUPABASE_SERVICE_KEY or RAG_INGEST_KEY (controller-only; least privilege preferred)

## Checklist

- [ ] Replace direct ~/.zshrc reads with `scripts/lib/secret-loader.js`
- [ ] Configure GitHub Environments (staging/prod) with n8n + supabase keys
- [ ] Create `rag_ingest_role` + policy SQL; store key in n8n cred store
- [ ] Update docs: local dev vs CI/CD secret handling
- [ ] Redaction patterns in scripts/n8n flows


