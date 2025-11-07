#!/usr/bin/env bash

# shellcheck disable=SC2155

# Purpose: Safely load Supabase/N8N credentials from ~/.zshrc (if present)
# Usage: source scripts/lib/load-supabase-env.sh

ENV_SOURCE_FILE="$HOME/.zshrc"

if [[ -f "$ENV_SOURCE_FILE" ]]; then
  TEMP_ENV_FILE=$(mktemp)
  trap 'rm -f "$TEMP_ENV_FILE"' EXIT

  grep -E '^[[:space:]]*export[[:space:]]+(SUPABASE_|N8N_)' "$ENV_SOURCE_FILE" > "$TEMP_ENV_FILE"

  if [[ -s "$TEMP_ENV_FILE" ]]; then
    # shellcheck source=/dev/null
    source "$TEMP_ENV_FILE"
  fi

  rm -f "$TEMP_ENV_FILE"
  trap - EXIT
fi

