#!/bin/bash
# Alex AI Testing Environment Stop Script

echo "🛑 Stopping Alex AI Testing Environment..."

# Kill web platform
pkill -f "npm start"

echo "✅ Alex AI Testing Environment Stopped!"
