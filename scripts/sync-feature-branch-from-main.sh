#!/bin/bash

################################################################################
# Sync Feature Branch from Main
# 
# Merges latest main branch changes into feature branch
################################################################################

set -e

FEATURE_BRANCH="feature/milestone-push-automation"
MAIN_BRANCH="main"

echo "🔄 Syncing ${FEATURE_BRANCH} with ${MAIN_BRANCH}..."

# Ensure we're on feature branch
git checkout ${FEATURE_BRANCH}

# Pull latest main
git fetch origin ${MAIN_BRANCH}

# Merge main into feature branch
git merge origin/${MAIN_BRANCH} --no-ff -m "Sync feature branch with latest main"

echo "✅ Sync complete!"
