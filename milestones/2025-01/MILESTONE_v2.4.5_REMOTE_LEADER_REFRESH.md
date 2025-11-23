# 🚀 Milestone v2.4.5 — Remote n8n Leader Refresh

## Summary
- Added `scripts/remote-n8n-leader-refresh.sh`, a one-command wrapper that:
  1. SSHes into the production n8n host (`n8n.pbradygeorgen.com` backend) and forces `INSTANCE_ROLE=main`.
  2. Restarts the container using the remote `docker-compose.n8n.yml`.
  3. Invokes `scripts/crew-webhook-refresh-via-api.js` remotely to re-register all crew/coordination webhooks.
  4. Runs the local `rag-query` verification to confirm knowledge-ingest availability.
- Ensured `scripts/crew-webhook-refresh-via-api.js` is part of the automation chain so Observational Lounge and RAG stay in sync after each refresh.

## Why It Matters
- Promoting the deployed n8n instance (La Forge) to technical leader is now a single terminal command—for any operator with SSH credentials.
- Webhook registration + RAG verification happen together, eliminating the manual dance that previously risked drift between crew operations and knowledge ingestion.

## Next Steps
- Accept the host fingerprint and open SSH access once per operator so the wrapper script can run non-interactively.
- After every infrastructure change, run `./scripts/remote-n8n-leader-refresh.sh` to keep crew webhooks and RAG memories aligned.

