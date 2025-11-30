# Setting WEBHOOK_URL in Self-Hosted n8n Community Edition

## Overview
In self-hosted n8n Community Edition, WEBHOOK_URL must be set as an environment variable when n8n starts. The "Environments" UI feature is typically only available in paid/cloud versions.

## Method 1: Docker Container with --env-file (Current Setup)

### Current Status
We've already set WEBHOOK_URL in `/opt/n8n/.env` on EC2, but n8n isn't reading it.

### Verify Current Setup

1. **Check if .env file exists and has WEBHOOK_URL:**
   ```bash
   # On EC2
   sudo cat /opt/n8n/.env | grep WEBHOOK_URL
   ```

2. **Verify Docker container is using --env-file:**
   ```bash
   # On EC2
   sudo docker inspect n8n | grep -A 5 "Env"
   ```

### Fix: Ensure Container Uses --env-file

The container must be started with `--env-file /opt/n8n/.env` flag:

```bash
# On EC2 - Stop and restart with env file
sudo docker stop n8n
sudo docker rm n8n
sudo docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:latest
```

## Method 2: Direct Environment Variable in Docker Run

If --env-file doesn't work, set it directly:

```bash
sudo docker stop n8n
sudo docker rm n8n
sudo docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  -e WEBHOOK_URL=https://n8n.pbradygeorgen.com \
  -e N8N_PROTOCOL=https \
  -e N8N_HOST=n8n.pbradygeorgen.com \
  -e N8N_PORT=5678 \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:latest
```

## Method 3: Docker Compose (Recommended for Production)

Create `/opt/n8n/docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - WEBHOOK_URL=https://n8n.pbradygeorgen.com
      - N8N_PROTOCOL=https
      - N8N_HOST=n8n.pbradygeorgen.com
      - N8N_PORT=5678
      - N8N_EDITOR_BASE_URL=https://n8n.pbradygeorgen.com
    volumes:
      - /home/ubuntu/.n8n:/home/node/.n8n
```

Then run:
```bash
cd /opt/n8n
sudo docker-compose up -d
```

## Method 4: Systemd Service (If Using systemd)

If n8n runs via systemd, edit the service file:

```bash
sudo systemctl edit n8n
```

Add:
```ini
[Service]
Environment="WEBHOOK_URL=https://n8n.pbradygeorgen.com"
Environment="N8N_PROTOCOL=https"
Environment="N8N_HOST=n8n.pbradygeorgen.com"
Environment="N8N_PORT=5678"
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl restart n8n
```

## Method 5: Verify Environment Variable in Container

After restarting, verify the variable is set:

```bash
# On EC2
sudo docker exec n8n env | grep WEBHOOK_URL
```

Should output: `WEBHOOK_URL=https://n8n.pbradygeorgen.com`

## Why It's Not Working

### Common Issues:

1. **Container not using --env-file:**
   - Solution: Restart container with --env-file flag

2. **Environment variable set but n8n not reading it:**
   - n8n reads WEBHOOK_URL at startup
   - Must restart n8n after setting it
   - Some versions have bugs reading env vars

3. **Database override:**
   - If WEBHOOK_URL is null in database, it may override env var
   - We've already set it in database, but n8n may cache it

## Verification Steps

1. **Check environment variable in container:**
   ```bash
   sudo docker exec n8n env | grep WEBHOOK_URL
   ```

2. **Check n8n settings API:**
   ```bash
   curl -s "https://n8n.pbradygeorgen.com/rest/settings" \
     -H "X-N8N-API-KEY: YOUR_KEY" | jq '.webhookUrl'
   ```

3. **If still null, check n8n logs:**
   ```bash
   sudo docker logs n8n | grep -i webhook
   ```

## Automated Fix Script

We have a script that does this automatically:
```bash
node scripts/restart-n8n-docker-with-env.js
```

This script:
- Stops n8n container
- Removes old container
- Starts new container with --env-file /opt/n8n/.env
- Verifies WEBHOOK_URL is set

## Community Edition Limitations

- **No Environments UI:** Community Edition doesn't have the Environments feature
- **Environment Variables Only:** Must use Docker/systemd environment variables
- **No UI Configuration:** Can't set WEBHOOK_URL via Settings UI in Community Edition

## Next Steps

1. Ensure container is started with WEBHOOK_URL environment variable
2. Restart n8n to load the variable
3. Verify it's set in container and n8n settings
4. Activate workflows - webhooks should auto-register

