## Figma → Live Tokens → App (Alex AI) – Operational Process

### Purpose
Keep the app’s theme tokens in sync with Figma Variables with minimal manual steps so designers can update UI and changes flow into the app automatically.

### Architecture
- Source: Figma Variables (managed via Tokens Studio URL Sync Provider)
- Export: `scripts/export-themes-for-figma.js` → `universal-theme-system/figma-export/*.tokens.json`
- Serve for designers: `scripts/figma-export-serve.sh <port>` → URL Sync Provider in Tokens Studio
- Live update trigger: Figma Webhooks (FILE_UPDATE) → backend webhook route (planned)
- Sync worker: `scripts/figma-sync-all.sh` → writes `universal-theme-system/overrides/<theme>.json`
- Delivery to app: `dashboard/app/api/themes/[theme]/tokens/route.ts` merges base + overrides

### Environment and Secrets
- `FIGMA_TOKEN`: Figma API token
- `FIGMA_WEBHOOK_SECRET`: HMAC secret to verify webhook payloads
- `FIGMA_FILE_KEY_<THEME>`: File key per theme (uppercase; dashes → underscores)
  - Example: `FIGMA_FILE_KEY_GRADIENT=XXXXXXXXXXXXXXX`

Use `scripts/ensure-figma-webhook-secret.sh` to generate/persist `FIGMA_WEBHOOK_SECRET` (Keychain + `~/.zshrc`).

### Operations
1) Export theme tokens for designers
```bash
node scripts/export-themes-for-figma.js
```
Outputs to `universal-theme-system/figma-export/*.tokens.json`.

2) Serve tokens for Tokens Studio URL Sync
```bash
bash scripts/figma-export-serve.sh 8087
```
Use printed URLs in Tokens Studio → Settings → Sync Providers → URL.

3) Sync published Variables back into the app
```bash
bash scripts/figma-sync-all.sh
```
This creates/updates JSON overrides in `universal-theme-system/overrides/*.json`.

4) Webhook-based automation (planned)
- Add a secure webhook route to receive `FILE_UPDATE`
- Verify signature with `FIGMA_WEBHOOK_SECRET`
- Map `file_key` → `<theme>` and run:
```bash
FIGMA_FILE_KEY="$file_key" node scripts/figma-token-sync.js <theme>
```

### One-Command Helper
Use `scripts/figma-auto-setup.sh` for a guided flow (secret, export, serve, sync).

### Verification
- Check merged tokens via Next.js API:
  - `/api/themes/<theme>/tokens`
- Inspect overrides: `universal-theme-system/overrides/<theme>.json`

### Troubleshooting
- Ensure `FIGMA_TOKEN` is available (Keychain item `ALEX_FIGMA_TOKEN` or exported in shell)
- Verify `FIGMA_FILE_KEY_*` env vars exist for themes you want to sync
- If Tokens Studio URL import fails, confirm the served URL and network accessibility


