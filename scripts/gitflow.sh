#!/usr/bin/env bash
set -euo pipefail

# Simple GitFlow helper using GitHub CLI
# Usage:
#   ./scripts/gitflow.sh feature start <id-or-desc>
#   ./scripts/gitflow.sh feature finish
#   ./scripts/gitflow.sh release start <version>
#   ./scripts/gitflow.sh release finish <version>

current_branch() { git rev-parse --abbrev-ref HEAD; }
ensure_clean() { test -z "$(git status --porcelain)" || { echo "Uncommitted changes present. Commit or stash first." >&2; exit 1; }; }

case "${1:-}" in
  feature)
    sub=${2:-}
    case "$sub" in
      start)
        desc=${3:-}
        if [ -z "$desc" ]; then echo "Provide feature id/desc"; exit 1; fi
        git fetch origin
        git switch -c "feature/${desc}" origin/main
        git push -u origin HEAD
        ;;
      finish)
        ensure_clean
        feat_branch=$(current_branch)
        if [[ "$feat_branch" != feature/* ]]; then echo "Not on a feature branch"; exit 1; fi
        git fetch origin
        git rebase origin/main || true
        git push --force-with-lease || true
        gh pr create --base main --head "$feat_branch" --title "Merge $feat_branch" --body "Automated GitFlow finish"
        gh pr merge --squash --delete-branch
        git fetch origin
        git switch main
        git pull --ff-only
        ;;
      *) echo "Unknown: feature {start|finish}"; exit 1;;
    esac
    ;;
  release)
    sub=${2:-}
    case "$sub" in
      start)
        ver=${3:-}
        if [ -z "$ver" ]; then echo "Provide version"; exit 1; fi
        git fetch origin
        git switch -c "release/${ver}" origin/main
        git push -u origin HEAD
        ;;
      finish)
        ver=${3:-}
        if [ -z "$ver" ]; then echo "Provide version"; exit 1; fi
        ensure_clean
        rel_branch=$(current_branch)
        if [[ "$rel_branch" != release/* ]]; then echo "Not on a release branch"; exit 1; fi
        git fetch origin
        git rebase origin/main || true
        git push --force-with-lease || true
        gh pr create --base main --head "$rel_branch" --title "Release $ver" --body "Automated release merge"
        gh pr merge --squash --delete-branch
        git fetch origin
        git switch main
        git pull --ff-only
        git tag -a "v$ver" -m "Release $ver"
        git push origin main --tags
        ;;
      *) echo "Unknown: release {start|finish}"; exit 1;;
    esac
    ;;
  *)
    echo "Usage: $0 feature {start <desc>|finish} | release {start <ver>|finish <ver>}"; exit 1;;

esac
