#!/usr/bin/env bash
set -euo pipefail

# Alex AI - Crew Up: clean restart of local services with n8n engagement
# 1) Kills known ports  2) Runs engage preflight  3) Starts themes & bridges
# 4) Launches dashboard in n8n-aware mode

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🧹 Stopping services on known ports..."
lsof -ti:3000,3001,3002,3003,3004,3010,3020,3030 | xargs kill -9 2>/dev/null || true

echo "🔐 Loading ~/.zshrc (best-effort)"
if [ -f "$HOME/.zshrc" ]; then
  # shellcheck disable=SC1090
  source "$HOME/.zshrc" >/dev/null 2>&1 || true
fi

# Disable themed logs by default to avoid off-mission chatter
export ALEX_AI_THEME=${ALEX_AI_THEME:-off}

cd "$ROOT_DIR"

echo "🤝 Engaging n8n controller preflight (non-blocking)..."
npm run -s engage >/dev/null 2>&1 || true

echo "🎨 Starting theme services..."
npm run -s themes:start >/dev/null 2>&1 &

echo "🧭 Starting bridged project servers..."
node ./start-bridged-projects.js >/dev/null 2>&1 &

echo "🖥️  Launching dashboard on http://localhost:3000 (n8n-aware)"
cd "$ROOT_DIR/dashboard"
exec npm run dev:n8n



