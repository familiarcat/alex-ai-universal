## 2025-11-08 – Webhook Registration & Verification Progress

- Confirmed production webhooks still return HTTP 404 even after `n8n:full-refresh`; n8n only registers the URL after the UI “Test” button runs.
- Added `scripts/n8n-replay-manual-tests.js` to replay manual executions across workflows.
- Added `scripts/ci-verify-client-n8n-supabase.js` for dual-domain verification; it now hits production endpoints and writes summaries to `DDD_VERIFY_OUTPUT`.
- Added `scripts/capture-n8n-test-payload.js` using Puppeteer to log in, open each workflow, click “Run,” and capture the `POST /rest/workflows/:id/run` payload. Currently refining selectors to reliably locate login fields and the run button.
- Next steps: finalize the Puppeteer capture, wire the captured payload into an automated registration script so test and production webhooks register together, then enforce with `npm run verify:ddd` in CI.
- Updated `capture-n8n-test-payload.js` to authenticate via `/rest/login` and reuse session cookies, but the workflow editor still isn’t exposing the expected `[data-test-id="run-data-mode-selector"]` element. Next step: inspect the rendered HTML (e.g. dump `page.content()` or fetch selectors from the deployed version) to locate the correct buttons for triggering the UI run.
