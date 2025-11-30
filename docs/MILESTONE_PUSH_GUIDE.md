# 🖖 Milestone Push Guide - Troubleshooting Git Issues

**Issue:** Git errors during milestone push operations

## Common Problems

### 1. Git Index Lock
**Error:** `Unable to create '.git/index.lock': File exists`

**Solution:**
```bash
rm -f .git/index.lock
```

### 2. Short Read Errors
**Error:** `error: short read while indexing`

**Solution:**
```bash
# Rebuild git index
rm -f .git/index
git reset
git add -A
```

### 3. Build Files in Git
**Problem:** `.next` directories or build artifacts causing issues

**Solution:**
```bash
# Ensure .gitignore is correct
echo ".next*/" >> .gitignore
echo "dist/" >> .gitignore
echo "build/" >> .gitignore

# Remove from git if already tracked
git rm -r --cached dashboard/.next* 2>/dev/null || true
```

## Simple Milestone Push

Use the simplified script:

```bash
bash scripts/simple-milestone-push.sh "Your Milestone Summary" "slug-name"
```

This script:
- ✅ Checks for uncommitted changes
- ✅ Stages and commits them
- ✅ Creates an annotated tag
- ✅ Does NOT push (you do that manually)

## Manual Milestone Push

If scripts fail, do it manually:

```bash
# 1. Stage changes
git add -A

# 2. Commit
git commit -m "🖖 Your Milestone Summary"

# 3. Create tag
DATE=$(date +%Y-%m-%d)
SLUG="your-slug"
TAG="milestone-${DATE}-${SLUG}"
git tag -a "$TAG" -m "🖖 Your Milestone Summary"

# 4. Push (when ready)
git push origin main
git push origin "$TAG"
```

## Best Practices

1. **Check git status first:**
   ```bash
   git status
   ```

2. **Exclude build files:**
   - Ensure `.gitignore` is up to date
   - Don't commit `.next`, `dist`, `build` directories

3. **Small, focused commits:**
   - One milestone = one logical set of changes
   - Clear, descriptive commit messages

4. **Test before pushing:**
   - Verify changes work
   - Check for lint errors
   - Test functionality

## Recovery

If you've lost files due to `git clean`:

1. **Check git reflog:**
   ```bash
   git reflog
   ```

2. **Recover from stash (if you stashed):**
   ```bash
   git stash list
   git stash pop
   ```

3. **Check if files are in working directory:**
   ```bash
   find . -name "filename" -type f
   ```

## Prevention

1. **Always check what will be cleaned:**
   ```bash
   git clean -fd --dry-run
   ```

2. **Use git status before operations:**
   ```bash
   git status
   ```

3. **Commit frequently:**
   - Don't leave important work uncommitted
   - Use feature branches for experimental work

---

**Status:** Guide created to prevent future issues

