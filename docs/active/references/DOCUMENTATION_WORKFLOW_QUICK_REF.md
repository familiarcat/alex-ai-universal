# 📚 Documentation Workflow - Quick Reference

**Last Updated:** October 13, 2025  
**Status:** Active Workflow

---

## 🎯 ROOT DIRECTORY RULE

**ONLY 5 files allowed at root:**
1. `README.md` - Project overview
2. `CHANGELOG.md` - Version history
3. `CONTRIBUTING.md` - Contributor guide
4. `QUICK_START.md` - Quick start
5. `START_HERE_NEXT_SESSION.md` - Session continuity

**Everything else → organize into docs/**

---

## 📁 DIRECTORY STRUCTURE

```
docs/
├── active/              ← Current working documentation
│   ├── architecture/    ← DDD guides, architecture docs
│   ├── guides/          ← How-to guides (RAG, N8N, etc.)
│   └── references/      ← Quick refs, cheat sheets
│
├── archive/             ← Historical docs (RAG-ready for pruning)
│   ├── milestones/      ← Completed milestones
│   ├── sessions/        ← Session summaries
│   ├── crew-meetings/   ← Crew consensus documents
│   ├── planning/        ← Planning & analysis
│   └── deprecated/      ← Outdated docs
│
├── domain-model/        ← Ubiquitous language
└── context-maps/        ← Bounded contexts map
```

---

## 🔄 WORKFLOWS

### **After Creating New Doc:**

**If actively used:**
```bash
mv NEW_DOC.md docs/active/architecture/  # or guides/ or references/
```

**If historical/completed:**
```bash
mv COMPLETED_DOC.md docs/archive/milestones/  # or sessions/ or planning/
```

---

### **After Each Session:**

```bash
# Organize any docs at root
bash scripts/organize-documentation.sh

# Commit
git add docs/ *.md
git commit -m "chore: organize documentation"
git push
```

**Time:** 2 minutes

---

### **Monthly (1st of Month):**

```bash
# 1. Organize (if needed)
bash scripts/organize-documentation.sh

# 2. Prepare RAG payload with archived docs
node scripts/prepare-rag-knowledge-base.js monthly-update-$(date +%Y-%m)

# 3. Ingest to RAG
node scripts/n8n-cli-tools.js ingest rag-knowledge-base-payload.json

# 4. Preview what would be pruned (SAFE - dry run)
node scripts/verify-rag-and-prune.js --dry-run

# 5. Review output, then actually prune
node scripts/verify-rag-and-prune.js

# 6. Commit cleanup
git add -A
git commit -m "chore: monthly doc cleanup - RAG verified"
git push
```

**Time:** 15 minutes/month  
**Safety:** Triple-verified (RAG check + 90-day retention + dry-run preview)

---

## 🛡️ SAFETY GUARANTEES

**Before ANY file is deleted:**
1. ✅ Must be in `docs/archive/` (not active)
2. ✅ Must be >90 days old (retention period)
3. ✅ Must be verified in Supabase RAG (knowledge preserved)
4. ✅ Must pass dry-run review

**Result:** Zero risk of knowledge loss

---

## 📊 CURRENT STATE

**Root Directory:** 5 files (87% cleaner)  
**Active Docs:** 5 current documents  
**Archived Docs:** 34 historical documents  
**Total Organized:** 39 files  

---

## 🔧 TROUBLESHOOTING

### **Root directory getting messy again?**
```bash
bash scripts/organize-documentation.sh
```

### **Want to check if doc is in RAG before manual delete?**
```bash
# Check Supabase
node scripts/verify-rag-and-prune.js --dry-run | grep "FILENAME"
```

### **Not sure where to put new doc?**
- **Active development?** → `docs/active/`
- **Completed/historical?** → `docs/archive/`
- **Essential reference?** → Root (ONLY if truly essential!)

---

## 💡 PRO TIPS

1. **Default to archiving** - When in doubt, put in archive
2. **Root is sacred** - Only 5 files, no exceptions
3. **Trust the RAG** - Once in Supabase, safe to prune
4. **Monthly rhythm** - 1st of month = cleanup day
5. **Dry-run first** - Always preview before actual prune

---

## 🖖 CREW OWNERSHIP

**Lt. Cmdr. La Forge:** Automation & organization scripts  
**Commander Data:** RAG verification logic  
**Captain Picard:** Workflow approval & oversight  
**All Crew:** Follow the workflow!

---

**Keep it clean. Keep it organized. Keep knowledge in RAG.**

🖖 **Make it so!**

