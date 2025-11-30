#!/bin/bash

################################################################################
# Merge Milestone Feature Branch to Main
# 
# Safely merges feature branch changes back to main
################################################################################

set -e

FEATURE_BRANCH="feature/milestone-push-automation"
MAIN_BRANCH="main"

echo "🔄 Merging ${FEATURE_BRANCH} to ${MAIN_BRANCH}..."

# Ensure we're on main
git checkout ${MAIN_BRANCH}
git pull origin ${MAIN_BRANCH}

# Merge feature branch
git merge ${FEATURE_BRANCH} --no-ff -m "Merge milestone push automation from feature branch"

echo "✅ Merge complete!"
echo "📤 Push to remote: git push origin ${MAIN_BRANCH}"
