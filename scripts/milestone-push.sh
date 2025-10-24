#!/usr/bin/env bash
set -euo pipefail

# Milestone Push Script
# - Creates a single, well-structured milestone commit and annotated tag
# - Pushes branch and tag to origin (non-interactive)
# Usage:
#   scripts/milestone-push.sh -s "Recovery + LCARS nav + immersive pages" \
#     -n recovery-2025-10-15 \
#     -f "gallery search/filter/sort; quiz recommendation CTA; wizard updates content+theme"

summary=""
slug=""
features=""
branch=""

while getopts ":s:n:f:b:" opt; do
  case "$opt" in
    s) summary="$OPTARG" ;;
    n) slug="$OPTARG" ;;
    f) features="$OPTARG" ;;
    b) branch="$OPTARG" ;;
    :) echo "Option -$OPTARG requires an argument" >&2; exit 1 ;;
    \?) echo "Unknown option -$OPTARG" >&2; exit 1 ;;
  esac
done

if [[ -z "$summary" ]]; then
  echo "❌ Provide -s \"summary\"" >&2; exit 1
fi

date_tag=$(date +%Y-%m-%d)
time_tag=$(date +%H%M%S)
slug_safe=${slug:-$(echo "$summary" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')}
tag_name="milestone-${date_tag}-${slug_safe}"

# Ensure we are in repo root
repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ -z "$repo_root" ]]; then
  echo "❌ Not a git repo" >&2; exit 1
fi
cd "$repo_root"

# Ensure branch
if [[ -n "${branch}" ]]; then
  git switch "$branch" >/dev/null 2>&1 || git switch -c "$branch"
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)

# Stage any changes
git add -A

# Detect if there is anything to commit
if ! git diff --cached --quiet; then
  # Build commit message
  {
    printf "milestone: %s\n\n" "$summary"
    if [[ -n "$features" ]]; then
      printf "Features:\n"
      # split by ; into bullets
      IFS=';' read -ra arr <<< "$features"
      for f in "${arr[@]}"; do
        trimmed=$(echo "$f" | sed -E 's/^\s+|\s+$//g')
        [[ -n "$trimmed" ]] && printf -- "- %s\n" "$trimmed"
      done
      printf "\n"
    fi
    printf "Files changed since last commit (staged):\n"
    git diff --cached --name-status | sed 's/^/  /'
  } > .git/.milestone_msg.txt

  git commit -F .git/.milestone_msg.txt
fi

commit_sha=$(git rev-parse HEAD)

# Create or update annotated tag (prefer signed if available)
if git rev-parse -q --verify "refs/tags/${tag_name}" >/dev/null; then
  git tag -d "$tag_name" >/dev/null
fi
if git config user.signingkey >/dev/null; then
  git tag -s "$tag_name" -m "$summary" "$commit_sha" || git tag -a "$tag_name" -m "$summary" "$commit_sha"
else
  git tag -a "$tag_name" -m "$summary" "$commit_sha"
fi

# Push branch and tag
git push origin "$current_branch"
git push origin "$tag_name"

echo "✅ Milestone pushed"
echo "   Branch: $current_branch"
echo "   Tag:    $tag_name ($commit_sha)"

# Post milestone to RAG via n8n controller (best-effort; do not fail script)
if command -v node >/dev/null 2>&1; then
  echo "\n🧠 Posting milestone to RAG via n8n ingestion webhook..."
  node scripts/n8n-post-knowledge.js --summary "$summary" --features "$features" --tags "milestone,git,$current_branch" >/dev/null 2>&1 || true
  echo "   RAG ingestion attempted (non-blocking)"
  echo "\n🗒️  Requesting crew summary via controller..."
  node scripts/n8n-summarize-milestone.js --summary "$summary" --features "$features" || true
fi


