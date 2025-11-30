#!/bin/bash
# Simple Milestone Push Script
# Avoids complex operations that can cause git errors

set -e

SUMMARY="$1"
SLUG="${2:-$(echo "$SUMMARY" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')}"
DATE_TAG=$(date +%Y-%m-%d)
TAG_NAME="milestone-${DATE_TAG}-${SLUG}"

echo "🖖 Creating milestone: $SUMMARY"
echo "📋 Tag: $TAG_NAME"
echo ""

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Not a git repository"
  exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  You have uncommitted changes"
  echo "📝 Staging all changes..."
  git add -A
  
  echo "💾 Creating commit..."
  git commit -m "🖖 $SUMMARY" || {
    echo "❌ Commit failed. Check your changes."
    exit 1
  }
else
  echo "✅ No uncommitted changes"
fi

# Create annotated tag
echo "🏷️  Creating tag: $TAG_NAME"
git tag -a "$TAG_NAME" -m "🖖 $SUMMARY" || {
  echo "❌ Tag creation failed"
  exit 1
}

echo ""
echo "✅ Milestone created successfully!"
echo "📋 Tag: $TAG_NAME"
echo ""
echo "💡 To push to remote:"
echo "   git push origin $CURRENT_BRANCH"
echo "   git push origin $TAG_NAME"
echo ""

