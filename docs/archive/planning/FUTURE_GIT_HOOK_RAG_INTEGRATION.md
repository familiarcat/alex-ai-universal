# 🚀 Future Enhancement: Git Hook RAG Integration (Option 3)

**Status:** Designed, Not Yet Implemented  
**Priority:** Medium  
**Estimated Time:** 1-2 hours  
**Benefit:** Fully automatic knowledge capture on every commit

---

## 🎯 CONCEPT

Automatically ingest crew documentation into the RAG system whenever you commit to Git - **zero manual steps required**.

### **Current Workflow (Option 2)**
```
1. Write documentation
2. Commit to Git
3. Run: node scripts/prepare-rag-knowledge-base.js
4. Run: node scripts/ingest-to-rag.js
```

### **Future Workflow (Option 3)**
```
1. Write documentation
2. Commit to Git
   ↳ 🤖 Automatically prepares payload
   ↳ 🤖 Automatically ingests to RAG
   ↳ ✅ Done!
```

---

## 📝 IMPLEMENTATION PLAN

### **Step 1: Create Post-Commit Hook**

File: `.git/hooks/post-commit`

```bash
#!/bin/bash

#====================================================================
# 🖖 ALEX AI - Automatic RAG Knowledge Ingestion
# Triggered on every Git commit
#====================================================================

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Detect new/modified documentation files
MODIFIED_DOCS=$(git diff --name-only HEAD~1 HEAD | grep -E '\.md$' | grep -E '(CREW_CODE_REVIEW|MILESTONE|NEXT_STEPS|SESSION_SUMMARY)')

if [ -z "$MODIFIED_DOCS" ]; then
  echo "ℹ️  No documentation changes detected"
  exit 0
fi

echo ""
echo "🖖 ═══════════════════════════════════════════════════════════"
echo "   ALEX AI - Automatic RAG Knowledge Ingestion"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📚 Documentation changes detected:"
echo "$MODIFIED_DOCS"
echo ""

# Generate session ID from commit
SESSION_ID="commit-$(git rev-parse --short HEAD)-$(date +%Y%m%d)"

echo "📝 Preparing knowledge base payload..."
node scripts/prepare-rag-knowledge-base.js "$SESSION_ID"

if [ $? -ne 0 ]; then
  echo "❌ Failed to prepare payload"
  echo "⚠️  Run manually: node scripts/prepare-rag-knowledge-base.js"
  exit 0  # Don't fail the commit
fi

echo "📤 Ingesting to RAG system..."
node scripts/ingest-to-rag.js

if [ $? -ne 0 ]; then
  echo "❌ Failed to ingest to RAG"
  echo "⚠️  Run manually: node scripts/ingest-to-rag.js"
  exit 0  # Don't fail the commit
fi

echo ""
echo "✅ Knowledge base updated automatically!"
echo "🔍 Your crew can now search: '$MODIFIED_DOCS'"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
```

### **Step 2: Make Hook Executable**

```bash
chmod +x .git/hooks/post-commit
```

### **Step 3: Configure Environment**

Ensure `~/.zshrc` has:

```bash
export N8N_WEBHOOK_URL="https://n8n.pbradygeorgen.com/webhook/ingest-knowledge"
```

### **Step 4: Test the Hook**

```bash
# Create a test document
echo "# Test Document" > TEST_CREW_CODE_REVIEW.md

# Commit (should trigger hook)
git add TEST_CREW_CODE_REVIEW.md
git commit -m "test: git hook integration"

# Expected output:
# 🖖 ALEX AI - Automatic RAG Knowledge Ingestion
# 📚 Documentation changes detected: TEST_CREW_CODE_REVIEW.md
# 📝 Preparing knowledge base payload...
# ✅ Payload saved
# 📤 Ingesting to RAG system...
# ✅ Knowledge base updated automatically!
```

---

## 🎨 ADVANCED FEATURES

### **Smart Detection**

Only process files matching patterns:
```bash
# Detect only significant documentation
PATTERNS=(
  "CREW_CODE_REVIEW_*.md"
  "MILESTONE_*.md"
  "NEXT_STEPS_*.md"
  "SESSION_SUMMARY_*.md"
  "OBSERVATION_LOUNGE_*.md"
)
```

### **Batch Processing**

Group multiple commits:
```bash
# Only run if it's been >1 hour since last ingestion
LAST_INGEST=$(cat .git/last-rag-ingest 2>/dev/null || echo 0)
NOW=$(date +%s)
ELAPSED=$((NOW - LAST_INGEST))

if [ $ELAPSED -lt 3600 ]; then
  echo "⏰ Waiting for batch... (${ELAPSED}s since last ingest)"
  exit 0
fi
```

### **Async Background Processing**

Don't block commits:
```bash
# Run ingestion in background
(
  node scripts/prepare-rag-knowledge-base.js "$SESSION_ID" && \
  node scripts/ingest-to-rag.js
) > /tmp/rag-ingest.log 2>&1 &

echo "🚀 RAG ingestion started in background"
echo "📋 View log: tail -f /tmp/rag-ingest.log"
```

### **Notification System**

Alert when complete:
```bash
# macOS notification
osascript -e 'display notification "RAG knowledge base updated!" with title "Alex AI"'

# Or send to Slack/Discord via webhook
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"🖖 Knowledge base updated: $MODIFIED_DOCS\"}"
```

---

## 🔧 TROUBLESHOOTING

### **Hook Not Running**

```bash
# Check if hook exists
ls -la .git/hooks/post-commit

# Check permissions
chmod +x .git/hooks/post-commit

# Test manually
.git/hooks/post-commit
```

### **N8N Webhook Unreachable**

```bash
# Test webhook
curl -X POST $N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### **Prevent Hook from Running**

```bash
# Temporarily disable
git commit --no-verify -m "message"

# Or rename hook
mv .git/hooks/post-commit .git/hooks/post-commit.disabled
```

---

## 📊 COMPARISON

| Feature | Option 2 (Current) | Option 3 (Future) |
|---------|-------------------|-------------------|
| **Automation** | Manual run | Fully automatic |
| **Effort** | 2 commands | 0 commands |
| **Timing** | When you remember | Every commit |
| **Reliability** | Depends on memory | 100% consistent |
| **Setup Time** | 0 min | 30 min |
| **Risk** | Low (manual control) | Medium (auto-run) |

---

## 🎯 WHEN TO IMPLEMENT

**Good Reasons:**
- ✅ You commit documentation frequently
- ✅ You want zero-friction knowledge capture
- ✅ You trust the automation
- ✅ N8N webhook is always available

**Wait If:**
- ⏸️ Still testing RAG system reliability
- ⏸️ N8N uptime is uncertain
- ⏸️ You want manual control
- ⏸️ Commit workflow needs to be fast

---

## 🚀 QUICK START (When Ready)

```bash
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal

# Copy the hook template
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

MODIFIED_DOCS=$(git diff --name-only HEAD~1 HEAD | grep -E '\.md$' | grep -E '(CREW|MILESTONE|NEXT_STEPS|SESSION)')

if [ ! -z "$MODIFIED_DOCS" ]; then
  echo "🖖 Auto-ingesting documentation to RAG..."
  SESSION_ID="commit-$(git rev-parse --short HEAD)"
  node scripts/prepare-rag-knowledge-base.js "$SESSION_ID" && \
  node scripts/ingest-to-rag.js
fi
EOF

# Make executable
chmod +x .git/hooks/post-commit

# Test
echo "# Test" > TEST_DOC.md
git add TEST_DOC.md
git commit -m "test: git hook"
```

---

## 📚 RESOURCES

- **Git Hooks Documentation:** https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- **Post-Commit Hook Examples:** https://githooks.com/
- **Async Shell Scripting:** https://www.gnu.org/software/bash/manual/html_node/Job-Control.html

---

## ✅ CHECKLIST (For Implementation)

- [ ] Test Option 2 thoroughly first
- [ ] Verify N8N webhook reliability
- [ ] Create post-commit hook script
- [ ] Make hook executable
- [ ] Test with dummy documentation
- [ ] Verify background execution works
- [ ] Add error notification system
- [ ] Document for team
- [ ] Monitor for issues
- [ ] Iterate based on usage

---

## 🖖 CREW CONSENSUS

**Captain Picard:**  
"A logical evolution. Once we trust the automation, this will save significant time."

**Commander Data:**  
"Probability of success: 94.2%. Recommend phased rollout with monitoring."

**Lt. Cmdr. La Forge:**  
"I love it! Automation that 'just works' is the dream. Let's build it!"

**Lieutenant Worf:**  
"Security concern: Hook runs arbitrary code. Review carefully before deployment."

**Counselor Troi:**  
"Users will appreciate not having to remember another step. Reduces cognitive load."

---

**Status:** Designed and ready for implementation when needed  
**Next Step:** Use Option 2, then upgrade to Option 3 when confident

🖖 **Live Long and Automate!**

