#!/usr/bin/env bash
set -euo pipefail

# Automates GitHub secret updates via gh CLI and triggers the supabase-sync workflow.
# Requires:
#   - gh CLI authenticated (gh auth login)
#   - Repository available in $REPO (defaults to current remote)
#   - Secrets present in environment or local ~/.zshrc parsed by Node loader

RAW_REMOTE="${RAW_REMOTE:-$(git config --get remote.origin.url)}"
if [[ "$RAW_REMOTE" == git@github.com:* ]]; then
  REPO_DEFAULT="${RAW_REMOTE#git@github.com:}"
elif [[ "$RAW_REMOTE" == https://github.com/* ]]; then
  REPO_DEFAULT="${RAW_REMOTE#https://github.com/}"
else
  REPO_DEFAULT="$RAW_REMOTE"
fi
REPO_DEFAULT="${REPO_DEFAULT%.git}"
REPO="${REPO:-$REPO_DEFAULT}"
WORKFLOW_FILE="${WORKFLOW_FILE:-.github/workflows/supabase-sync.yml}"
WORKFLOW_NAME="${WORKFLOW_NAME:-$(basename "$WORKFLOW_FILE")}"

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

echo "Ensuring workflow $WORKFLOW_NAME is enabled..."
gh api -X PUT "repos/${REPO}/actions/workflows/${WORKFLOW_NAME}/enable" >/dev/null 2>&1 || true

echo "Secrets updated. Triggering workflow $WORKFLOW_NAME"

echo "Capturing existing workflow run baseline..."
BASELINE_RUN_NUMBER=$(gh run list --repo "$REPO" --workflow "$WORKFLOW_NAME" --limit 1 --json number --jq '.[0].number // 0' 2>/tmp/gh_baseline_error.log || echo 0)
if [ -s /tmp/gh_baseline_error.log ]; then
  echo "⚠️  Could not determine baseline run: $(< /tmp/gh_baseline_error.log)"
fi
BASELINE_RUN_NUMBER=${BASELINE_RUN_NUMBER:-0}

gh workflow run "$WORKFLOW_NAME" --repo "$REPO"

POLL_INTERVAL=${POLL_INTERVAL:-5}
POLL_TIMEOUT=${POLL_TIMEOUT:-120}
MAX_ATTEMPTS=$((POLL_TIMEOUT / POLL_INTERVAL))

echo "Waiting for workflow_dispatch run to appear..."

RUN_NUMBER=""
RUN_ID=""
RUN_URL=""

for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
  if ! LATEST_RUN=$(gh run list --repo "$REPO" --workflow "$WORKFLOW_NAME" --limit 1 --json number,status,url,databaseId 2>/tmp/gh_run_error.log); then
    ERR_MSG=$(< /tmp/gh_run_error.log)
    echo "… polling failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${ERR_MSG:-unknown error}. Retrying in ${POLL_INTERVAL}s..."
    sleep "$POLL_INTERVAL"
    continue
  fi
  CURRENT_NUMBER=$(echo "$LATEST_RUN" | jq -r '.[0].number // 0' 2>/dev/null || echo 0)
  CURRENT_STATUS=$(echo "$LATEST_RUN" | jq -r '.[0].status // ""' 2>/dev/null || echo "")
  CURRENT_URL=$(echo "$LATEST_RUN" | jq -r '.[0].url // ""' 2>/dev/null || echo "")
  CURRENT_ID=$(echo "$LATEST_RUN" | jq -r '.[0].databaseId // 0' 2>/dev/null || echo 0)

  if [ "$CURRENT_NUMBER" -gt "$BASELINE_RUN_NUMBER" ]; then
    RUN_NUMBER="$CURRENT_NUMBER"
    RUN_URL="$CURRENT_URL"
    RUN_ID="$CURRENT_ID"
    echo "↻ Detected new run ${RUN_NUMBER} (status: ${CURRENT_STATUS:-unknown})"
    break
  else
    echo "… waiting (latest run ${CURRENT_NUMBER} <= baseline ${BASELINE_RUN_NUMBER}, attempt ${attempt}/${MAX_ATTEMPTS})"
  fi

  sleep "$POLL_INTERVAL"
done

if [ -z "$RUN_NUMBER" ]; then
  echo "❌ No workflow_dispatch run detected within ${POLL_TIMEOUT}s. Visit GitHub Actions UI to verify the workflow state." >&2
  exit 1
fi

WATCH_TARGET="${RUN_ID:-$RUN_NUMBER}"
echo "Watching run ${RUN_NUMBER} (this may take a minute)..."
if ! gh run watch "$WATCH_TARGET" --repo "$REPO" --exit-status; then
  echo "❌ Workflow run $RUN_NUMBER failed. Inspect ${RUN_URL:-'Actions UI'} for details." >&2
  exit 1
fi

echo "✅ Workflow run $RUN_NUMBER completed successfully. See ${RUN_URL:-'(no url)'}"

