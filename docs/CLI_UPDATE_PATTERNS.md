# CLI Update Patterns & Automation

## 🎯 Philosophy

**Crew Consensus:** Chief O'Brien (Pragmatic Automation) + La Forge (Infrastructure)

### Update Strategy

1. **SYSTEMIC FAILURE** → Auto-update immediately
   - Script fails due to missing CLI features
   - Required commands don't work
   - Example: `supabase db push` fails because CLI is too old

2. **VERSION WARNING** → Warn but continue
   - CLI is outdated but still functional
   - New features available but not required
   - Example: "New version available: v2.62.10 (currently v2.33.9)"

3. **RAG MEMORY** → Store all patterns
   - Every CLI update decision stored in RAG
   - Pattern recognition for future automation
   - Crew learns from each update scenario

## 📋 Implementation

### CLI Version Checker

**File:** `scripts/cli-version-checker.js`

**Usage:**
```bash
# Check and auto-update if needed
node scripts/cli-version-checker.js supabase systemic_failure

# Check only (warn if outdated)
node scripts/cli-version-checker.js supabase version_warning
```

**Features:**
- Checks if CLI is installed
- Tests required features
- Auto-updates on systemic failure
- Warns on version updates
- Stores patterns in RAG

### Integration Pattern

All automation scripts should:

1. **Check CLI availability** at start
2. **Test required features** before use
3. **Auto-update** if features missing (systemic failure)
4. **Warn** if version outdated (non-critical)
5. **Store pattern** in RAG for learning

### Example Integration

```bash
#!/bin/bash
# Check CLI before use
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    brew install supabase/tap/supabase
fi

# Test required feature
if ! supabase db push --help &> /dev/null; then
    echo "CLI missing required feature - updating..."
    brew upgrade supabase/tap/supabase
fi

# Continue with script...
```

## 🧠 RAG Memory Storage

All CLI update decisions are stored in RAG with:
- CLI name and version
- Update reason (systemic_failure vs version_warning)
- Action taken (updated, warned, installed)
- Timestamp
- Pattern learned

This allows the crew to:
- Recognize similar situations
- Make better update decisions
- Avoid unnecessary updates
- Learn from past experiences

## 📊 Tracked CLIs

- **Supabase CLI**: Database migrations, schema management
- **Terraform**: Infrastructure as code (future)
- **Docker**: Container management (future)
- **AWS CLI**: Cloud resource management (future)

## 🔄 Update History

- **2025-11-27**: Supabase CLI updated from v2.33.9 → v2.62.10
  - Reason: Missing `db query` and `db execute` features
  - Action: Auto-updated via `brew upgrade`
  - Pattern: Systemic failure → immediate update
  - Result: Table creation now fully automated

## 💡 Best Practices

1. **Always check CLI version** before critical operations
2. **Test required features** not just version numbers
3. **Auto-update on failure**, warn on version mismatch
4. **Store in RAG** for pattern recognition
5. **Document patterns** for crew learning

---

**Crew:** La Forge (Infrastructure) + Data (Pattern Recognition) + O'Brien (Pragmatic Automation)

