#!/bin/bash

################################################################################
# Create Feature Branch for Milestone Pushes
# 
# Creates a feature branch that can handle milestone pushes independently
# while maintaining ability to merge back to main when necessary.
################################################################################

set -e

BRANCH_NAME="feature/milestone-push-automation"
BASE_BRANCH="main"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌿 CREATING MILESTONE FEATURE BRANCH${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${YELLOW}❌ Not in a git repository${NC}"
  exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}📍 Current branch: ${CURRENT_BRANCH}${NC}\n"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/${BRANCH_NAME}; then
  echo -e "${YELLOW}⚠️  Branch ${BRANCH_NAME} already exists${NC}"
  read -p "Switch to existing branch? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git checkout ${BRANCH_NAME}
    echo -e "${GREEN}✅ Switched to ${BRANCH_NAME}${NC}\n"
    exit 0
  else
    echo -e "${YELLOW}Using existing branch...${NC}\n"
    git checkout ${BRANCH_NAME}
  fi
else
  # Ensure we're on main or base branch
  if [ "$CURRENT_BRANCH" != "$BASE_BRANCH" ]; then
    echo -e "${YELLOW}Switching to ${BASE_BRANCH}...${NC}"
    git checkout ${BASE_BRANCH}
    git pull origin ${BASE_BRANCH} 2>/dev/null || true
  fi

  # Create feature branch
  echo -e "${YELLOW}🌿 Creating feature branch: ${BRANCH_NAME}${NC}"
  git checkout -b ${BRANCH_NAME}
  echo -e "${GREEN}✅ Feature branch created${NC}\n"
fi

# Create branch configuration
echo -e "${YELLOW}📋 Setting up branch configuration...${NC}"

# Create .gitattributes for milestone files (if needed)
if [ ! -f .gitattributes ]; then
  cat > .gitattributes << 'EOF'
# Milestone files
MILESTONE_*.md merge=ours
EOF
  git add .gitattributes
  echo -e "   ✅ Created .gitattributes for milestone files"
fi

# Create branch-specific documentation
mkdir -p docs/branches
cat > docs/branches/feature-milestone-push-automation.md << 'EOF'
# Feature Branch: Milestone Push Automation

**Branch:** `feature/milestone-push-automation`  
**Purpose:** Independent milestone push automation with merge-back capability

## Branch Strategy

This feature branch allows:
- ✅ Independent milestone pushes without affecting main
- ✅ Testing of new milestone automation features
- ✅ Safe experimentation with RAG integration
- ✅ Easy merge-back to main when ready

## Workflow

1. **Milestone Pushes:** All milestone pushes happen on this branch
2. **Testing:** Test new features without affecting main
3. **Merge Back:** When stable, merge back to main

## Merge Strategy

- **From main to feature:** `git merge main` (get latest changes)
- **From feature to main:** `git checkout main && git merge feature/milestone-push-automation`

## Milestone Files

All `MILESTONE_*.md` files are configured to use `merge=ours` strategy to prevent conflicts.
EOF

git add docs/branches/feature-milestone-push-automation.md
echo -e "   ✅ Created branch documentation\n"

# Create merge helper script
cat > scripts/merge-milestone-branch-to-main.sh << 'EOF'
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
EOF

chmod +x scripts/merge-milestone-branch-to-main.sh
git add scripts/merge-milestone-branch-to-main.sh
echo -e "   ✅ Created merge helper script\n"

# Create sync script (merge main into feature branch)
cat > scripts/sync-feature-branch-from-main.sh << 'EOF'
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
EOF

chmod +x scripts/sync-feature-branch-from-main.sh
git add scripts/sync-feature-branch-from-main.sh
echo -e "   ✅ Created sync helper script\n"

# Update milestone push script to use current branch
if [ -f scripts/push-milestone-to-rag.js ]; then
  echo -e "${YELLOW}📝 Note: Milestone push script will use current branch${NC}"
  echo -e "   (No changes needed - git automatically uses current branch)\n"
fi

# Initial commit
if ! git diff --cached --quiet; then
  git commit -m "feat: Set up milestone push automation feature branch

- Create feature branch for independent milestone pushes
- Add branch documentation and merge helpers
- Configure milestone file merge strategy"
  echo -e "${GREEN}✅ Initial commit created${NC}\n"
fi

# Push branch to remote
echo -e "${YELLOW}📤 Pushing branch to remote...${NC}"
git push -u origin ${BRANCH_NAME} 2>/dev/null || {
  echo -e "${YELLOW}⚠️  Could not push to remote (may need to set upstream manually)${NC}"
  echo -e "   Run: git push -u origin ${BRANCH_NAME}\n"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}✅ FEATURE BRANCH SETUP COMPLETE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}Branch: ${BRANCH_NAME}${NC}"
echo -e "${GREEN}Status: Ready for milestone pushes${NC}\n"

echo -e "${YELLOW}📋 Available Commands:${NC}"
echo -e "   • Push milestone: node scripts/push-milestone-to-rag.js <file>"
echo -e "   • Sync from main: bash scripts/sync-feature-branch-from-main.sh"
echo -e "   • Merge to main: bash scripts/merge-milestone-branch-to-main.sh\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

