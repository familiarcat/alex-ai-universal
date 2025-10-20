#!/usr/bin/env bash
set -euo pipefail

# Source ~/.zshrc so N8N/Supabase/OpenRouter envs are available
if [ -f "$HOME/.zshrc" ]; then
  # shellcheck disable=SC1090
  # Temporarily allow unbound vars during sourcing
  set +u
  . "$HOME/.zshrc"
  set -u
fi

# Move to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "Running executor with environment:"
echo "  N8N_BASE_URL=${N8N_BASE_URL:-unset}"
echo "  N8N_URL=${N8N_URL:-unset}"
echo "  N8N_COLLAB_COMPLETE_WEBHOOK=${N8N_COLLAB_COMPLETE_WEBHOOK:-unset}"
echo "  N8N_COLLABORATION_WEBHOOK=${N8N_COLLABORATION_WEBHOOK:-unset}"
echo "  SUPABASE_URL=${SUPABASE_URL:-unset}"
echo "  NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-unset}"
echo "  OPENROUTER_API_KEY=${OPENROUTER_API_KEY:+set}"

node scripts/innovation-day-executor.js --plan latest


