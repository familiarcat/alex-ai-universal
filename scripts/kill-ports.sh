#!/bin/bash

set -e

PORTS=(3000 3001 3002 3003 3004 3006 3010 3020 3030 5678)

echo "🛑 Stopping processes on common Alex AI ports: ${PORTS[*]}"

for p in "${PORTS[@]}"; do
  if lsof -ti:"$p" >/dev/null 2>&1; then
    echo " - Killing port $p"
    lsof -ti:"$p" | xargs kill -9 2>/dev/null || true
  else
    echo " - Port $p already free"
  fi
done

echo "✅ Ports cleared"


