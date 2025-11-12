#!/usr/bin/env bash
set -euo pipefail

# Automates GitHub secret updates via gh CLI and triggers the supabase-sync workflow.
# Requires:
#   - gh CLI authenticated (gh auth login)
#   - Repository available in $REPO (defaults to current remote)
#   - Secrets present in environment or local ~/.zshrc parsed by Node loader

REPO="${REPO:-$(git config --get remote.origin.url | sed -E 's#https://github.com/##;s/.git$//')}"
WORKFLOW_FILE="${WORKFLOW_FILE:-.github/workflows/supabase-sync.yml}"

if ! command -v gh >/dev/null; then
  echo "GitHub CLI (gh) is required. Install from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

# Load secrets from ~/.zshrc (via Node helper) or the current environment
resolve_secret() {
  local key="$1"
  node scripts/collect-automation-secrets.js "$key"
}

SUPABASE_URL=$(resolve_secret SUPABASE_URL)
SUPABASE_SERVICE_ROLE_KEY=$(resolve_secret SUPABASE_SERVICE_ROLE_KEY)
SUPABASE_ANON_KEY=$(resolve_secret SUPABASE_ANON_KEY)
SUPABASE_API_KEY=$(resolve_secret SUPABASE_API_KEY)

N8N_URL=$(resolve_secret N8N_URL)
N8N_OWNER_API_KEY=$(resolve_secret N8N_OWNER_API_KEY)
N8N_API_KEY=$(resolve_secret N8N_API_KEY)

AWS_ACCESS_KEY_ID=$(resolve_secret AWS_ACCESS_KEY_ID)
AWS_SECRET_ACCESS_KEY=$(resolve_secret AWS_SECRET_ACCESS_KEY)
AWS_REGION=$(resolve_secret AWS_REGION)

N8N_SSH_HOST=$(resolve_secret N8N_SSH_HOST)
N8N_SSH_USER=$(resolve_secret N8N_SSH_USER)
N8N_SSH_KEY=$(resolve_secret N8N_SSH_KEY)
N8N_REMOTE_PATH=$(resolve_secret N8N_REMOTE_PATH)
ALEX_AI_PARAMETER_NAMESPACE=$(resolve_secret ALEX_AI_PARAMETER_NAMESPACE)

REQUIRED=(SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY N8N_URL N8N_OWNER_API_KEY AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION N8N_SSH_HOST N8N_SSH_USER N8N_SSH_KEY)
MISSING=()
for key in "${REQUIRED[@]}"; do
  value="${!key}"
  if [ -z "$value" ]; then
    MISSING+=("$key")
  fi
done

if [ "${#MISSING[@]}" -ne 0 ]; then
  echo "Missing required secrets (ensure they are exported in ~/.zshrc or environment): ${MISSING[*]}" >&2
  exit 1
fi

# Push secrets via gh CLI
set_secret() {
  local name="$1"
  local value="$2"
  if [ -z "$value" ]; then
    echo "Skipping empty secret $name"
    return
  fi
  printf "%s" "$value" | gh secret set "$name" --repo "$REPO" --body -
}

set_secret "SUPABASE_URL" "$SUPABASE_URL"
set_secret "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
set_secret "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
[ -n "${SUPABASE_API_KEY:-}" ] && set_secret "SUPABASE_API_KEY" "$SUPABASE_API_KEY"

set_secret "N8N_URL" "$N8N_URL"
set_secret "N8N_OWNER_API_KEY" "$N8N_OWNER_API_KEY"
[ -n "${N8N_API_KEY:-}" ] && set_secret "N8N_API_KEY" "$N8N_API_KEY"

set_secret "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID"
set_secret "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY"
set_secret "AWS_REGION" "$AWS_REGION"

set_secret "N8N_SSH_HOST" "$N8N_SSH_HOST"
set_secret "N8N_SSH_USER" "$N8N_SSH_USER"
set_secret "N8N_SSH_KEY" "$N8N_SSH_KEY"
[ -n "${N8N_REMOTE_PATH:-}" ] && set_secret "N8N_REMOTE_PATH" "$N8N_REMOTE_PATH"
[ -n "${ALEX_AI_PARAMETER_NAMESPACE:-}" ] && set_secret "ALEX_AI_PARAMETER_NAMESPACE" "$ALEX_AI_PARAMETER_NAMESPACE"

echo "Secrets updated. Triggering workflow $WORKFLOW_FILE"

gh workflow run "$WORKFLOW_FILE" --repo "$REPO"

echo "Run started. Use 'gh run list --repo \"$REPO\"' to monitor progress."

