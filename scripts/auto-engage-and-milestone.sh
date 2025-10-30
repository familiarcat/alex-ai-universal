#!/usr/bin/env bash
set -euo pipefail

# Automates: ensure git connectivity to origin/main, keep themed logs off,
# then perform a milestone push using existing project scripts.

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SUMMARY=${SUMMARY:-"Alex AI sync verification"}
FEATURES=${FEATURES:-"branch main; origin/HEAD main; workflows ok"}
BRANCH=${BRANCH:-main}
SLUG=${SLUG:-"sync-$(date +%Y%m%d-%H%M%S)"}

# Load developer environment if present (secrets, tokens, etc.)
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" >/dev/null 2>&1 || true
[ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc" >/dev/null 2>&1 || true

# Silence themed logs unless explicitly enabled
export ALEX_AI_THEME=${ALEX_AI_THEME:-off}

cd "$REPO_DIR"

# Ensure we are inside a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

# Set default branch and ensure it exists locally
git config init.defaultBranch "$BRANCH" || true
git checkout -B "$BRANCH" || true

# Configure origin from package repository field if missing
REMOTE_URL=${REMOTE_URL:-}
if [ -z "$REMOTE_URL" ]; then
  # Prefer SSH if available, otherwise fall back to HTTPS
  SSH_URL="git@github.com:familiarcat/alex-ai-universal.git"
  HTTPS_URL="https://github.com/familiarcat/alex-ai-universal.git"
  if ssh -o BatchMode=yes -o ConnectTimeout=5 -T git@github.com 2>/dev/null; then
    REMOTE_URL="$SSH_URL"
  else
    REMOTE_URL="$HTTPS_URL"
  fi
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

# Fetch and align local branch to remote main when present
git fetch --prune origin || true
git remote set-head origin -a || git remote set-head origin "$BRANCH" || true
if git ls-remote --heads origin "$BRANCH" >/dev/null 2>&1; then
  git checkout -B "$BRANCH" --track "origin/$BRANCH" || git checkout -B "$BRANCH"
  git pull --ff-only || true
fi

# Perform the milestone push through existing script
npm run --silent milestone:push -- -s "$SUMMARY" -f "$FEATURES" -n "$SLUG" -b "$BRANCH"

echo "Milestone automation complete: $SLUG on $BRANCH"




