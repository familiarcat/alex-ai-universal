#!/bin/bash
# Quick script to check n8n configuration on EC2

sudo systemctl cat n8n 2>/dev/null || echo "[No systemd service]"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Docker containers:"
sudo docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "n8n Docker inspect (environment):"
sudo docker inspect n8n 2>/dev/null | jq '.[0].Config.Env[]' | grep -i webhook || echo "No webhook env vars"

