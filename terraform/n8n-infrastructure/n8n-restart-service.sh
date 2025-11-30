#!/bin/bash

################################################################################
#
# N8N Restart Service Script
# 
# Ensures n8n container is always started with --env-file flag
# This script can be called manually or via systemd/cron
#
################################################################################

set -e

N8N_DIR="/opt/n8n"
ENV_FILE="/opt/n8n/.env"

echo "🔄 Restarting n8n with proper WEBHOOK_URL configuration..."

# Verify .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found!"
  exit 1
fi

# Verify WEBHOOK_URL is set
if ! grep -q "^WEBHOOK_URL=" "$ENV_FILE"; then
  echo "⚠️  Warning: WEBHOOK_URL not found in $ENV_FILE"
  echo "   Adding it now..."
  echo "WEBHOOK_URL=https://n8n.pbradygeorgen.com" >> "$ENV_FILE"
fi

# Stop existing container
if docker ps -a | grep -q "n8n$"; then
  echo "   Stopping existing n8n container..."
  docker stop n8n 2>/dev/null || true
  docker rm n8n 2>/dev/null || true
fi

# Kill any process on port 5678
if lsof -ti:5678 >/dev/null 2>&1; then
  echo "   Killing process on port 5678..."
  lsof -ti:5678 | xargs kill -9 2>/dev/null || true
  sleep 2
fi

# Start with docker-compose (uses --env-file automatically)
if [ -f "$N8N_DIR/docker-compose.yml" ]; then
  echo "   Starting n8n with docker-compose..."
  cd "$N8N_DIR"
  docker-compose up -d
else
  # Fallback to docker run with --env-file
  echo "   Starting n8n with docker run (docker-compose.yml not found)..."
  docker run -d \
    --name n8n \
    --restart always \
    -p 5678:5678 \
    --env-file "$ENV_FILE" \
    -v /home/ubuntu/.n8n:/home/node/.n8n \
    n8nio/n8n:latest
fi

# Wait for n8n to start
echo "   Waiting for n8n to initialize..."
sleep 10

# Verify WEBHOOK_URL is set in container
if docker exec n8n env | grep -q "WEBHOOK_URL=https://"; then
  echo "✅ n8n restarted successfully"
  echo "✅ WEBHOOK_URL is set in container"
  docker exec n8n env | grep WEBHOOK_URL
else
  echo "⚠️  Warning: WEBHOOK_URL may not be set in container"
  echo "   Container environment:"
  docker exec n8n env | grep -i webhook || echo "   (no WEBHOOK_URL found)"
fi

echo ""
echo "✅ Restart complete!"

