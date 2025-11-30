#!/usr/bin/env bash
# ensure-n8n-leader.sh
#
# Automates the local steps needed to promote the n8n container to "leader".
# It creates/updates docker-compose.override.yml so the specified service
# starts with INSTANCE_ROLE=main, then restarts that service.
#
# Usage:
#   ./scripts/ensure-n8n-leader.sh             # assumes service is "n8n"
#   ./scripts/ensure-n8n-leader.sh crew-n8n    # specify service name
#
# After running, you can verify leadership with:
#   docker compose exec <service> printenv INSTANCE_ROLE
# and refresh webhooks via:
#   docker compose exec <service> node scripts/crew-webhook-refresh-via-api.js
#
set -euo pipefail

SERVICE_NAME="${1:-n8n}"
OVERRIDE_FILE="docker-compose.override.yml"
BASE_COMPOSE_FILE="docker-compose.n8n.yml"

echo "🚀 Ensuring ${SERVICE_NAME} runs as n8n leader (INSTANCE_ROLE=main)..."

# Create or update override file
cat > "${OVERRIDE_FILE}" <<EOF
services:
  ${SERVICE_NAME}:
    environment:
      INSTANCE_ROLE: main
EOF

echo "✅ Wrote ${OVERRIDE_FILE} with INSTANCE_ROLE=main for service \"${SERVICE_NAME}\""

# Restart the target service
echo "🔄 Restarting ${SERVICE_NAME}..."
docker compose -f "${BASE_COMPOSE_FILE}" -f "${OVERRIDE_FILE}" up -d "${SERVICE_NAME}"

echo "✅ ${SERVICE_NAME} restarted. Run the following to verify:"
echo "    docker compose -f ${BASE_COMPOSE_FILE} -f ${OVERRIDE_FILE} exec ${SERVICE_NAME} printenv INSTANCE_ROLE"
echo "    docker compose -f ${BASE_COMPOSE_FILE} -f ${OVERRIDE_FILE} exec ${SERVICE_NAME} node scripts/crew-webhook-refresh-via-api.js"

