#!/usr/bin/env bash
# remote-n8n-leader-refresh.sh
# ------------------------------------------------------------
# Promotes the remote n8n instance to leader, refreshes crew webhooks,
# and runs a verification RAG query from the local machine.
# Usage:
#   ./scripts/remote-n8n-leader-refresh.sh
# ------------------------------------------------------------

set -euo pipefail

INSTANCE_SERVICE="${1:-n8n}"
REMOTE_ENV_DIR="${REMOTE_N8N_DIR:-/home/ubuntu/.n8n}"
REMOTE_ENV_FILE="${REMOTE_ENV_DIR}/.env"
N8N_EXTERNAL_URL="${N8N_EXTERNAL_URL:-https://n8n.pbradygeorgen.com}"
QUERY="${RAG_VERIFY_QUERY:-What is the current crew leadership structure?}"

: "${EC2_HOST:?Set EC2_HOST in your environment}"
: "${EC2_USER:?Set EC2_USER in your environment}"
: "${EC2_KEY_PATH:?Set EC2_KEY_PATH in your environment}"

remote_exec() {
  ssh -i "$EC2_KEY_PATH" "${EC2_USER}@${EC2_HOST}" "$@"
}

echo "🚀 Promoting remote n8n instance to leader..."
remote_exec bash -s <<EOF
set -euo pipefail
mkdir -p "${REMOTE_ENV_DIR}"
if [ ! -f "${REMOTE_ENV_FILE}" ]; then
  echo 'INSTANCE_ROLE=main' > "${REMOTE_ENV_FILE}"
else
  if grep -q '^INSTANCE_ROLE=' "${REMOTE_ENV_FILE}"; then
    sed -i 's/^INSTANCE_ROLE=.*/INSTANCE_ROLE=main/' "${REMOTE_ENV_FILE}"
  else
    echo 'INSTANCE_ROLE=main' >> "${REMOTE_ENV_FILE}"
  fi
fi
if grep -q '^WEBHOOK_URL=' "${REMOTE_ENV_FILE}"; then
  sed -i 's|^WEBHOOK_URL=.*|WEBHOOK_URL=${N8N_EXTERNAL_URL}|' "${REMOTE_ENV_FILE}"
else
  echo "WEBHOOK_URL=${N8N_EXTERNAL_URL}" >> "${REMOTE_ENV_FILE}"
fi
if grep -q '^N8N_HOST=' "${REMOTE_ENV_FILE}"; then
  sed -i 's|^N8N_HOST=.*|N8N_HOST=0.0.0.0|' "${REMOTE_ENV_FILE}"
else
  echo "N8N_HOST=0.0.0.0" >> "${REMOTE_ENV_FILE}"
fi
if grep -q '^N8N_PORT=' "${REMOTE_ENV_FILE}"; then
  sed -i 's|^N8N_PORT=.*|N8N_PORT=5678|' "${REMOTE_ENV_FILE}"
else
  echo "N8N_PORT=5678" >> "${REMOTE_ENV_FILE}"
fi
if grep -q '^N8N_PROTOCOL=' "${REMOTE_ENV_FILE}"; then
  sed -i 's|^N8N_PROTOCOL=.*|N8N_PROTOCOL=https|' "${REMOTE_ENV_FILE}"
else
  echo "N8N_PROTOCOL=https" >> "${REMOTE_ENV_FILE}"
fi
echo "INSTANCE_ROLE set to:"
grep '^INSTANCE_ROLE=' "${REMOTE_ENV_FILE}" || true
grep '^WEBHOOK_URL=' "${REMOTE_ENV_FILE}" || true

CONTAINER_NAME="${INSTANCE_SERVICE}"
if ! docker ps --format '{{.Names}}' | grep -qx "\${CONTAINER_NAME}"; then
  ALT_NAME=\$(docker ps --format '{{.Names}}' | grep -E '^n8n' | head -n1)
  if [ -n "\${ALT_NAME}" ]; then
    echo "⚙️  Falling back to detected n8n container: \${ALT_NAME}"
    CONTAINER_NAME="\${ALT_NAME}"
  else
    echo "❌ Unable to locate a running n8n container matching '\${INSTANCE_SERVICE}'" >&2
    exit 1
  fi
fi
echo "🔁 Restarting n8n container: \${CONTAINER_NAME}"
docker restart "\${CONTAINER_NAME}"
EOF

echo "⏳ Waiting 30 seconds for n8n to finish booting..."
sleep 30

echo "🔄 Refreshing crew webhooks on remote n8n..."
if node scripts/crew-webhook-refresh-via-api.js; then
  REFRESH_OK=1
else
  REFRESH_OK=0
fi

if [[ "$REFRESH_OK" -ne 1 ]]; then
  echo "⚠️  Primary refresh failed, attempting deep refresh..."
  AUTO_CONFIRM=1 printf "y\n" | ./scripts/n8n-full-webhook-refresh.sh || true
  echo "⏳ Waiting 20 seconds before re-testing..."
  sleep 20
  node scripts/crew-webhook-refresh-via-api.js || true
fi

echo "🎭 Running UI-based toggle automation for diagnostic capture..."
if node scripts/n8n-toggle-workflows-ui.js; then
  echo "   ✅ UI automation completed"
else
  echo "   ⚠️  UI automation reported errors (see above output)"
fi
node scripts/process-toggle-summary.js || true

echo "🧠 Running local RAG verification query..."
node scripts/rag-query.js "\${QUERY}"

echo "✅ Done."

