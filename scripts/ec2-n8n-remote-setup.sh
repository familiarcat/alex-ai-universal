#!/usr/bin/env bash
set -euo pipefail

# Remote EC2 bootstrap for n8n controller
# Expected env (passed from caller via SSH):
#   N8N_API_KEY (required)
#   N8N_HOST (default: n8n.pbradygeorgen.com)
#   WEBHOOK_URL (default: https://$N8N_HOST)

N8N_HOST="${N8N_HOST:-n8n.pbradygeorgen.com}"
WEBHOOK_URL="${WEBHOOK_URL:-https://${N8N_HOST}}"

if [ -z "${N8N_API_KEY:-}" ]; then
  echo "N8N_API_KEY is required" >&2
  exit 1
fi

echo "[remote] Ensuring docker present"
if ! command -v docker >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y docker.io
    sudo systemctl enable --now docker
  else
    echo "[remote] docker not installed and apt-get missing" >&2
  fi
fi

echo "[remote] Writing /opt/n8n/.env"
sudo mkdir -p /opt/n8n
sudo tee /opt/n8n/.env >/dev/null <<EOF
N8N_PROTOCOL=http
N8N_HOST=${N8N_HOST}
N8N_PORT=5678
WEBHOOK_URL=${WEBHOOK_URL}
N8N_ENDPOINT_WEBHOOK=webhook
N8N_ENDPOINT_WEBHOOK_TEST=webhook-test
N8N_ENABLE_API=true
GENERIC_TIMEZONE=UTC
N8N_API_KEY=${N8N_API_KEY}
EOF

echo "[remote] Installing/refreshing systemd service for n8n"
sudo tee /etc/systemd/system/n8n.service >/dev/null <<'UNIT'
[Unit]
Description=n8n (docker)
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
EnvironmentFile=/opt/n8n/.env
ExecStartPre=/usr/bin/docker pull n8nio/n8n:latest
ExecStartPre=/usr/bin/docker rm -f n8n
ExecStart=/usr/bin/docker run -d --name n8n --restart unless-stopped \
  --env-file /opt/n8n/.env -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n:latest
ExecStop=/usr/bin/docker rm -f n8n

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now n8n

echo "[remote] Adjusting nginx to forward API headers (best-effort)"
NG_FILE="$(grep -R -l "proxy_pass http://localhost:5678" /etc/nginx 2>/dev/null | head -n1 || true)"
if [ -n "$NG_FILE" ]; then
  if ! grep -q "X-N8N-API-KEY" "$NG_FILE"; then
    sudo awk '
      BEGIN{insert=0}
      {
        print $0;
        if($0 ~ /proxy_pass http:\/\/localhost:5678;/ && insert==0){
          print "  proxy_http_version 1.1;";
          print "  proxy_set_header Host $host;";
          print "  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;";
          print "  proxy_set_header X-Forwarded-Proto $scheme;";
          print "  proxy_set_header Upgrade $http_upgrade;";
          print "  proxy_set_header Connection \"upgrade\";";
          print "  proxy_set_header X-N8N-API-KEY $http_x_n8n_api_key;";
          print "  proxy_set_header Authorization $http_authorization;";
          insert=1;
        }
      }
    ' "$NG_FILE" | sudo tee "$NG_FILE.tmp" >/dev/null && sudo mv "$NG_FILE.tmp" "$NG_FILE"
  fi
  sudo nginx -t && sudo systemctl reload nginx || true
else
  echo "[remote] nginx site with proxy_pass not found; skipping header injection"
fi

echo "[remote] Container env snapshot:"
sudo docker exec n8n printenv N8N_API_KEY || true
sudo docker exec n8n printenv N8N_ENABLE_API || true

echo "[remote] HTTPS head:"
curl -sS -I "https://${N8N_HOST}" | head -1 || true

echo "[remote] Done"

