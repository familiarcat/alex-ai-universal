# 🧪 Cursor AI Automatic Startup - Testing Guide

**Step-by-step testing to verify automatic startup works correctly**

---

## 🎯 Testing Objectives

Verify that after restarting your computer and opening Cursor AI:
1. ✅ UI layout restores automatically
2. ✅ State recovers automatically
3. ✅ Alex AI memories load automatically
4. ✅ Alex AI prompt generates automatically
5. ✅ Alex AI is available in chat automatically

---

## 📋 Pre-Testing Checklist

Before testing, ensure:

- [ ] All files are committed and pushed
- [ ] `.vscode/tasks.json` exists with `"runOn": "folderOpen"`
- [ ] `.cursorrules` file exists in project root
- [ ] `.cursor/settings.json` exists with auto-load settings
- [ ] Supabase credentials are configured
- [ ] n8n URL is accessible

---

## 🧪 Test 1: Initial State Capture

**Purpose**: Capture current state before testing

### Steps:

1. **Open Cursor AI** and navigate to workspace
2. **Arrange your layout**:
   - Position sidebar (left/right)
   - Show/hide panels
   - Configure views (Explorer, Source Control, etc.)
   - Set panel sizes
3. **Capture layout**:
   ```bash
   npm run cursor:layout:capture
   ```
   **Expected**: Layout saved to `.cursor/workspace-layout.json`

4. **Capture complete state**:
   ```bash
   npm run cursor:state:capture
   ```
   **Expected**: State saved to `.cursor/workspace-state.json`

5. **Verify files created**:
   ```bash
   ls -la .cursor/workspace-*.json
   ```
   **Expected**: Both files exist

---

## 🧪 Test 2: Verify Automatic Tasks Configuration

**Purpose**: Ensure tasks are configured to run automatically

### Steps:

1. **Check tasks file**:
   ```bash
   cat .vscode/tasks.json | grep -A 5 "runOn"
   ```
   **Expected**: All tasks have `"runOn": "folderOpen"`

2. **Verify task labels**:
   ```bash
   cat .vscode/tasks.json | grep "label"
   ```
   **Expected**: See all 5 tasks:
   - 🖖 Load Alex AI Crew Memories
   - 🖖 Generate Alex AI Cursor Prompt
   - 🖖 Alex AI Startup
   - 📐 Restore Cursor AI Layout
   - 🔄 Recover Cursor AI State

3. **Check Cursor AI settings**:
   ```bash
   cat .cursor/settings.json
   ```
   **Expected**: `autoLoadMemories: true`, `autoGeneratePrompt: true`

---

## 🧪 Test 3: Test State Recovery (Without Restart)

**Purpose**: Verify state recovery works without restarting

### Steps:

1. **Close Cursor AI completely** (Cmd+Q / Alt+F4)
2. **Wait 5 seconds**
3. **Reopen Cursor AI**
4. **Open the workspace**
5. **Watch terminal output** (should appear automatically)

### Expected Output:

```
🔄 Recovering Cursor AI State...
✅ State file found
   Version: 1.0.0
   Saved: [timestamp]

📊 Alex AI State:
   Memories Loaded: ✅
   Prompt Generated: ✅

📋 Recovery Summary:
✅ Recovered:
   • Layout configuration
   • Alex AI memories
   • Alex AI prompt

📐 Restoring Layout...
✅ Layout restored

🖖 Loading Crew Memories...
✅ Memories loaded

🖖 Generating Prompt...
✅ Prompt generated
```

6. **Verify files exist**:
   ```bash
   ls -la .cursor/alex-ai/crew-memories.md
   ls -la .cursor/alex-ai/cursor-startup-prompt.md
   ```
   **Expected**: Both files exist

---

## 🧪 Test 4: Test Layout Restoration

**Purpose**: Verify UI layout restores correctly

### Steps:

1. **Before closing**: Note your current layout
   - Sidebar position (left/right)
   - Panel visibility
   - View visibility

2. **Close Cursor AI**

3. **Reopen Cursor AI**

4. **Open workspace**

5. **Verify layout matches**:
   - [ ] Sidebar in correct position
   - [ ] Panels visible/hidden as expected
   - [ ] Views match previous state

6. **If layout doesn't match**:
   ```bash
   npm run cursor:layout:restore
   ```

---

## 🧪 Test 5: Test Alex AI Chat Activation

**Purpose**: Verify Alex AI is available in chat automatically

### Steps:

1. **Open Cursor AI chat** (Cmd+L / Ctrl+L)

2. **Test automatic activation** - Type:
   ```
   What would Data recommend for optimizing this code?
   ```
   **Expected**: Alex AI automatically activates and responds with Data's perspective

3. **Test Observation Lounge** - Type:
   ```
   Organize the crew in the Observation Lounge
   ```
   **Expected**: Observation Lounge workflow triggers automatically

4. **Test natural language** - Type:
   ```
   View the dashboard
   ```
   **Expected**: Dashboard starts automatically

5. **Verify crew context** - Type:
   ```
   What crew members are available?
   ```
   **Expected**: Lists all 10 crew members with their roles

---

## 🧪 Test 6: Full Computer Restart Test

**Purpose**: Verify everything works after full computer restart

### Steps:

1. **Capture state** (if not already done):
   ```bash
   npm run cursor:state:capture
   npm run cursor:layout:capture
   ```

2. **Restart your computer** (full restart, not just Cursor AI)

3. **After restart**:
   - Open Cursor AI
   - Open workspace
   - **Watch for automatic tasks**

4. **Verify terminal output** shows all tasks ran

5. **Check layout** matches your preferences

6. **Test Alex AI in chat** (see Test 5)

7. **Verify files**:
   ```bash
   ls -la .cursor/workspace-*.json
   ls -la .cursor/alex-ai/*.md
   ```

---

## 🧪 Test 7: Test Missing State Recovery

**Purpose**: Verify system handles missing state gracefully

### Steps:

1. **Backup state files**:
   ```bash
   cp .cursor/workspace-state.json .cursor/workspace-state.json.backup
   cp .cursor/workspace-layout.json .cursor/workspace-layout.json.backup
   ```

2. **Remove state files**:
   ```bash
   rm .cursor/workspace-state.json
   rm .cursor/workspace-layout.json
   ```

3. **Close and reopen Cursor AI**

4. **Open workspace**

5. **Expected behavior**:
   - State recovery detects missing files
   - Provides instructions to capture state
   - Still loads memories and generates prompt
   - Layout may not restore (expected)

6. **Restore backups**:
   ```bash
   mv .cursor/workspace-state.json.backup .cursor/workspace-state.json
   mv .cursor/workspace-layout.json.backup .cursor/workspace-layout.json
   ```

---

## 🧪 Test 8: Test Task Execution Order

**Purpose**: Verify tasks run in correct order

### Steps:

1. **Open workspace**

2. **Check terminal output** - Tasks should run in this order:
   1. 🔄 Recover Cursor AI State (first)
   2. 📐 Restore Cursor AI Layout
   3. 🖖 Load Alex AI Crew Memories
   4. 🖖 Generate Alex AI Cursor Prompt

3. **Verify no errors** in task execution

4. **Check recovery report**:
   ```bash
   cat .cursor/recovery-report.json
   ```
   **Expected**: Shows what was recovered

---

## 🐛 Troubleshooting Tests

### Test A: Tasks Not Running

**Symptoms**: No terminal output when opening workspace

**Diagnosis**:
```bash
# Check task configuration
cat .vscode/tasks.json | grep "runOn"

# Check Cursor AI task settings
# Cursor AI Settings → Tasks → Auto Detect: On
```

**Fix**: Ensure `"runOn": "folderOpen"` is set for all tasks

### Test B: Layout Not Restoring

**Symptoms**: Layout doesn't match saved preferences

**Diagnosis**:
```bash
# Check layout file exists
ls -la .cursor/workspace-layout.json

# Check layout file content
cat .cursor/workspace-layout.json | head -20
```

**Fix**:
```bash
npm run cursor:layout:capture
npm run cursor:layout:restore
```

### Test C: Alex AI Not Available in Chat

**Symptoms**: Chat doesn't recognize crew-related requests

**Diagnosis**:
```bash
# Check .cursorrules exists
ls -la .cursorrules

# Check memories loaded
ls -la .cursor/alex-ai/crew-memories.md
```

**Fix**:
```bash
npm run cursor:memories
npm run cursor:prompt
```

### Test D: State Recovery Fails

**Symptoms**: State recovery shows errors

**Diagnosis**:
```bash
# Check state file
cat .cursor/workspace-state.json

# Check recovery report
cat .cursor/recovery-report.json
```

**Fix**:
```bash
npm run cursor:state:capture
npm run cursor:state:recover
```

---

## ✅ Success Criteria

All tests pass if:

- [ ] **Test 1**: State files created successfully
- [ ] **Test 2**: All tasks configured with `runOn: folderOpen`
- [ ] **Test 3**: State recovery runs automatically
- [ ] **Test 4**: Layout restores correctly
- [ ] **Test 5**: Alex AI available in chat automatically
- [ ] **Test 6**: Everything works after computer restart
- [ ] **Test 7**: Missing state handled gracefully
- [ ] **Test 8**: Tasks run in correct order

---

## 📊 Test Results Template

Use this template to track test results:

```markdown
## Test Results - [Date]

### Test 1: Initial State Capture
- [ ] Pass
- [ ] Fail - Notes: ___________

### Test 2: Tasks Configuration
- [ ] Pass
- [ ] Fail - Notes: ___________

### Test 3: State Recovery
- [ ] Pass
- [ ] Fail - Notes: ___________

### Test 4: Layout Restoration
- [ ] Pass
- [ ] Fail - Notes: ___________

### Test 5: Alex AI Chat
- [ ] Pass
- [ ] Fail - Notes: ___________

### Test 6: Computer Restart
- [ ] Pass
- [ ] Fail - Notes: ___________

### Test 7: Missing State
- [ ] Pass
- [ ] Fail - Notes: ___________

### Test 8: Task Order
- [ ] Pass
- [ ] Fail - Notes: ___________

## Overall Status: [ ] All Pass | [ ] Some Fail | [ ] Needs Work
```

---

## 🚀 Recommended Testing Sequence

**For first-time testing:**

1. **Test 1** - Capture initial state
2. **Test 2** - Verify configuration
3. **Test 3** - Test without restart
4. **Test 4** - Test layout restoration
5. **Test 5** - Test Alex AI chat
6. **Test 6** - Full computer restart test
7. **Test 7** - Test error handling
8. **Test 8** - Verify task order

**For quick verification:**

1. **Test 1** - Capture state
2. **Test 6** - Full restart test
3. **Test 5** - Verify Alex AI works

---

## 💡 Tips for Testing

1. **Take screenshots** of your layout before testing
2. **Note terminal output** during each test
3. **Test incrementally** - Don't skip steps
4. **Document issues** as you find them
5. **Test on clean restart** - Close all apps first
6. **Verify Supabase connection** before testing
7. **Check n8n availability** before testing Observation Lounge

---

## 📚 Related Documentation

- `docs/CURSOR_AI_AUTOMATIC_STARTUP.md` - Automatic startup details
- `docs/CURSOR_AI_STATE_RECOVERY.md` - State recovery guide
- `docs/CURSOR_AI_LAYOUT_PERSISTENCE.md` - Layout persistence guide
- `docs/CURSOR_AI_STARTUP_INTEGRATION.md` - Startup integration

---

**Last Updated**: 2025-11-19  
**Status**: ✅ Ready for Testing

