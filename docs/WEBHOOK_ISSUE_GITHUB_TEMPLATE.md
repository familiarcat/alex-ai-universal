# GitHub Issue Template for n8n

**Copy this to create a GitHub issue on the n8n repository**

---

## Title
`[Bug] WEBHOOK_URL environment variable not read by n8n - webhooks return 404`

## Labels
- `bug`
- `webhooks`
- `docker`
- `environment-variables`

## Issue Body

---

### Describe the bug
n8n fails to register webhooks despite `WEBHOOK_URL` being correctly set as an environment variable in the Docker container. The API endpoint `/rest/settings` returns `webhookUrl: null` even though `docker exec` confirms the environment variable is present in the container.

### n8n version
- **Docker Image:** `n8nio/n8n:latest`
- **Pulled:** November 2025

### Operating System
- **OS:** Ubuntu 24.04.3 LTS
- **Environment:** AWS EC2
- **Docker Version:** Latest stable

### Steps to reproduce

1. Create environment file:
```bash
mkdir -p /opt/n8n
cat > /opt/n8n/.env << EOF
WEBHOOK_URL=https://n8n.example.com
N8N_PROTOCOL=https
N8N_HOST=n8n.example.com
N8N_PORT=5678
EOF
```

2. Start container with env file:
```bash
docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n:latest
```

3. Verify environment variable is in container:
```bash
docker exec n8n env | grep WEBHOOK_URL
# Output: WEBHOOK_URL=https://n8n.example.com ✅
```

4. Check n8n settings via API:
```bash
curl https://n8n.example.com/rest/settings | jq '.webhookUrl'
# Output: null ❌ (Expected: "https://n8n.example.com")
```

5. Test webhook endpoint:
```bash
curl https://n8n.example.com/webhook/test
# Output: 404 ❌ (Webhook not registered)
```

### Expected behavior
- `/rest/settings` should return `webhookUrl: "https://n8n.example.com"`
- Workflow webhooks should register and respond (not 404)
- Active workflows with webhook triggers should be accessible

### Actual behavior
- `/rest/settings` returns `webhookUrl: null`
- All webhook URLs return 404
- Workflows are active but webhooks don't register

### Additional context

**What we've tried:**
- Container restarts: 5+ times
- Workflow reactivation via API: Multiple times
- Full server reboot
- Different environment variable combinations
- Waited up to 60 seconds for initialization

**Verification:**
- ✅ Environment variable IS in container (`docker exec` confirms)
- ✅ n8n web UI is accessible
- ✅ n8n API responds correctly
- ✅ All 31 workflows show as "active" in UI
- ❌ Webhooks all return 404
- ❌ `/rest/settings` shows `webhookUrl: null`

**Impact:**
- Blocks all webhook-based automation
- 31 active workflows cannot be triggered via webhooks
- Breaks integration with external systems

**Question:** Is there a specific initialization step or API call required to make n8n read and use the `WEBHOOK_URL` environment variable?

### Logs

Container environment (confirmed present):
```
WEBHOOK_URL=https://n8n.example.com
N8N_PROTOCOL=https
N8N_HOST=n8n.example.com
N8N_PORT=5678
```

n8n settings API response:
```json
{
  "webhookUrl": null,
  "publicApi": {
    "enabled": true
  },
  "timezone": "America/New_York"
}
```

---

### Screenshots
_(Attach screenshots of:_
_- Docker environment variables_
_- n8n settings API response_
_- Webhook 404 error)_

---

**Is there a workaround or configuration we're missing?**

We've followed Docker documentation but webhooks won't register. Any guidance would be greatly appreciated!

---

_Environment:_ Docker, AWS EC2, Behind Nginx Reverse Proxy  
_Urgency:_ High - Production system blocked  
_Reproducibility:_ 100% - happens on every deployment

