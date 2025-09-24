#!/bin/bash
# Deploy Deployed Sync Dashboard

echo "☁️  Deploying Deployed Sync Dashboard"
echo "===================================="

cd deployed-build
node deployed-server.js
