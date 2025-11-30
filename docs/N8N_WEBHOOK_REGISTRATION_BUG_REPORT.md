# n8n Webhook Registration Bug Report

**Date:** November 6, 2025  
**n8n Version:** latest (Docker image `n8nio/n8n:latest`)  
**Environment:** AWS EC2 (Ubuntu 24.04.3 LTS), Docker  
**Severity:** Critical - Blocks all webhook functionality

---

## 🐛 Bug Description

n8n fails to register webhooks despite `WEBHOOK_URL` environment variable being correctly set in the Docker container. The `/rest/settings` API reports `webhookUrl: null` even though the environment variable is confirmed present via `docker exec`.

---

## 🔍 Environment Details

### Container Configuration
```bash
docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:latest
```

### Environment File (/opt/n8n/.env)
```bash
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
N8N_USER_FOLDER=/home/node/.n8n
```

### Verification
```bash
$ docker exec <container_id> env | grep WEBHOOK
WEBHOOK_URL=https://n8n.pbradygeorgen.com
# ✅ Environment variable IS present in container
```

---

## ❌ Expected Behavior

1. Container starts with `WEBHOOK_URL` environment variable
2. n8n reads `WEBHOOK_URL` during initialization
3. `/rest/settings` API returns `webhookUrl: "https://n8n.pbradygeorgen.com"`
4. Active workflows register webhook endpoints
5. Webhook URLs respond (not 404)

---

## 🔴 Actual Behavior

1. Container starts with `WEBHOOK_URL` environment variable ✅
2. n8n appears to NOT read `WEBHOOK_URL` ❌
3. `/rest/settings` API returns `webhookUrl: null` ❌
4. Active workflows fail to register webhooks ❌
5. All webhook URLs return 404 ❌

### API Evidence
```bash
$ curl -s "https://n8n.pbradygeorgen.com/rest/settings" \
  -H "X-N8N-API-KEY: <key>" | jq '.webhookUrl'
null
```

### Webhook Test
```bash
$ curl -s -o /dev/null -w "%{http_code}" \
  "https://n8n.pbradygeorgen.com/webhook/test-webhook"
404
```

---

## 🔬 Reproduction Steps

1. **Create environment file:**
   ```bash
   mkdir -p /opt/n8n
   cat > /opt/n8n/.env << EOF
   WEBHOOK_URL=https://n8n.pbradygeorgen.com
   N8N_PROTOCOL=https
   N8N_HOST=n8n.pbradygeorgen.com
   N8N_PORT=5678
   EOF
   ```

2. **Start n8n container:**
   ```bash
   docker run -d --name n8n --restart always \
     -p 5678:5678 \
     --env-file /opt/n8n/.env \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n:latest
   ```

3. **Verify environment variable:**
   ```bash
   docker exec n8n env | grep WEBHOOK_URL
   # Returns: WEBHOOK_URL=https://n8n.pbradygeorgen.com
   ```

4. **Check n8n settings:**
   ```bash
   curl "https://n8n.pbradygeorgen.com/rest/settings" | jq '.webhookUrl'
   # Returns: null (WRONG - should return the URL)
   ```

5. **Test webhook:**
   ```bash
   curl "https://n8n.pbradygeorgen.com/webhook/test"
   # Returns: 404 (webhook not registered)
   ```

---

## 🧪 Troubleshooting Attempted

### Attempt 1: Container Restart
- **Action:** `docker stop n8n && docker rm n8n && docker run...`
- **Result:** ❌ webhookUrl still null

### Attempt 2: Workflow Reactivation
- **Action:** Deactivate/reactivate all workflows via API
- **Result:** ❌ Webhooks not registered

### Attempt 3: Different Environment Variables
- **Action:** Tried `N8N_PROTOCOL`, `N8N_HOST`, `N8N_PORT` combinations
- **Result:** ❌ No effect on webhookUrl

### Attempt 4: Instance Reboot
- **Action:** Full EC2 instance stop/start
- **Result:** ❌ webhookUrl still null

### Attempt 5: Multiple Reactivations
- **Action:** Reactivated 31 workflows, 3 separate times
- **Result:** ❌ No webhooks registered

---

## 💡 Hypothesis

n8n has one of these issues:

1. **Initialization Order:** Webhook system initializes before environment variables are read
2. **Cached Value:** n8n caches `webhookUrl: null` on first run and never updates
3. **Wrong Variable Name:** n8n expects different environment variable name
4. **Version Bug:** This version of n8n has broken webhook registration
5. **Internal API:** Webhook registration requires internal API call that's not documented

---

## 🔧 Workaround

Direct Supabase queries for READ operations, bypassing n8n webhooks. Not ideal for production.

---

## 📊 Impact

- **Workflows:** 31 active workflows, 0 webhooks functional
- **Architecture:** Breaks DDD pattern (Client ⇔ n8n ⇔ Supabase)
- **Users:** Cannot trigger workflows via webhooks
- **Automation:** All webhook-based automation blocked

---

## 🎯 Requested Information

1. What is the correct way to set `WEBHOOK_URL` in Docker?
2. Is there an initialization delay we should wait for?
3. Does n8n require a specific API call to register webhooks?
4. Is this a known issue in `n8nio/n8n:latest`?
5. Are there any logs we should check for webhook initialization?

---

## 📝 System Information

- **OS:** Ubuntu 24.04.3 LTS
- **Kernel:** 6.14.0-1015-aws
- **Docker:** Latest
- **n8n Image:** `n8nio/n8n:latest`
- **Architecture:** x86_64
- **Cloud:** AWS EC2
- **Network:** Behind nginx reverse proxy

---

## 📎 Attachments

- Container logs: Available on request
- Environment file: Provided above
- API responses: Provided above
- Network configuration: Standard HTTPS with valid SSL

---

## 🆘 Help Needed

This is blocking our entire workflow automation system. Any guidance on:
1. Correct environment variable configuration
2. n8n initialization sequence
3. Webhook registration process
4. Known issues or workarounds

---

**Reported by:** Alex AI Development Team  
**Contact:** Available via GitHub issue  
**Urgency:** High - Production system blocked

