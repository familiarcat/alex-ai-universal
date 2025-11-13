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

START_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

gh workflow run "$WORKFLOW_NAME" --repo "$REPO"

POLL_INTERVAL=${POLL_INTERVAL:-10}
POLL_TIMEOUT=${POLL_TIMEOUT:-600}
MAX_ATTEMPTS=$((POLL_TIMEOUT / POLL_INTERVAL))

echo "Waiting for workflow_dispatch run to appear..."

RUN_ID=""
RUN_STATUS=""
RUN_CONCLUSION=""
RUN_URL=""

for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
  RUN_DATA=$(gh api "repos/${REPO}/actions/workflows/${WORKFLOW_NAME}/runs?event=workflow_dispatch&per_page=20")
  RUN_INFO=$(RUN_JSON="$RUN_DATA" node - "$START_TS" <<'NODE'
const start = new Date(process.argv[1]);
const raw = process.env.RUN_JSON || '';
if (!raw.trim()) process.exit(0);
const data = JSON.parse(raw);
const run = data.workflow_runs
  .filter((item) => item.event === 'workflow_dispatch')
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .find((item) => new Date(item.created_at) >= start);
if (!run) process.exit(0);
console.log(run.status || '');
console.log(run.conclusion || '');
console.log(run.id || '');
console.log(run.html_url || '');
NODE
) || true

  if [ -n "$RUN_INFO" ]; then
    IFS=$'\n' read -r RUN_STATUS RUN_CONCLUSION RUN_ID RUN_URL <<<"$RUN_INFO"
    echo "↻ Run ${RUN_ID:-unknown} status: ${RUN_STATUS:-unknown} (conclusion: ${RUN_CONCLUSION:-pending})"
    if [ "${RUN_STATUS}" = "completed" ]; then
      break
    fi
  else
    echo "… waiting (no dispatch detected yet, attempt ${attempt}/${MAX_ATTEMPTS})"
  fi

  sleep "$POLL_INTERVAL"
done

if [ -z "$RUN_ID" ]; then
  echo "❌ No workflow_dispatch run detected. If this is the first run of a new workflow, visit GitHub Actions UI and approve it manually." >&2
  exit 1
fi

if [ "$RUN_STATUS" != "completed" ]; then
  echo "❌ Workflow run $RUN_ID did not complete within timeout. Inspect $RUN_URL" >&2
  exit 1
fi

if [ "${RUN_CONCLUSION}" != "success" ]; then
  echo "❌ Workflow run $RUN_ID concluded with status '${RUN_CONCLUSION}'. Inspect $RUN_URL" >&2
  exit 1
fi

echo "✅ Workflow run $RUN_ID completed successfully. See $RUN_URL"

