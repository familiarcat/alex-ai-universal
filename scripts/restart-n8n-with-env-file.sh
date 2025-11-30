#!/bin/bash
set -e

echo "[1/5] Stopping n8n container..."
sudo docker stop n8n 2>/dev/null || true

echo "[2/5] Removing n8n container..."
sudo docker rm n8n 2>/dev/null || true

echo "[3/5] Finding and killing process on port 5678..."
PID=$(sudo lsof -ti:5678 2>/dev/null || echo "")
if [ -n "$PID" ]; then
  echo "   Killing process $PID on port 5678..."
  sudo kill -9 $PID 2>/dev/null || true
  sleep 2
else
  echo "   No process found on port 5678"
fi

echo "[4/5] Waiting for port to be free..."
sleep 3

echo "[5/5] Starting n8n with env file..."
sudo docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:latest

echo "✅ n8n restarted with env file"
echo "   Container ID: $(sudo docker ps -q --filter name=n8n)"

