# N8N to MCP Migration Guide

**Date:** November 23, 2025  
**Status:** 🔄 In Progress  
**Purpose:** Complete migration from n8n workflows to MCP framework

---

## 🎯 Mission

Migrate all n8n workflows to MCP tools with:
- Complete feature parity
- End-to-end testing
- Crew coordination
- Automated analysis and migration

---

## 🏗️ Architecture

```
n8n Workflows (JSON)
    ↓
Workflow Analyzer
    ↓
Crew Coordination
    ↓
MCP Tool Implementation
    ↓
E2E Testing
    ↓
Migration Complete
```

---

## 📋 Migration Process

### Phase 1: Analysis
1. Find all n8n workflow files
2. Analyze each workflow structure
3. Extract functionality
4. Map to MCP tools
5. Generate migration plan

**Script:** `scripts/migrate-n8n-to-mcp/migrate-all-workflows.js`

### Phase 2: Strategic Planning
1. Crew reviews migration plan
2. Captain Picard: Strategic approval
3. Commander Riker: Execution plan
4. Priority assignment

**Script:** `scripts/migrate-n8n-to-mcp/crew-coordinate-migration.js`

### Phase 3: Implementation
1. Implement MCP tools based on mapping
2. Port n8n logic to MCP
3. Test individual tools
4. Document changes

### Phase 4: End-to-End Testing
1. Test each migrated workflow
2. Compare n8n vs MCP results
3. Verify feature parity
4. Performance comparison

**Script:** `scripts/migrate-n8n-to-mcp/e2e-test-migration.js`

---

## 🚀 Usage

### Run Complete Migration

```bash
# Full migration with crew coordination
node scripts/migrate-n8n-to-mcp/crew-coordinate-migration.js
```

### Analyze Workflows

```bash
# Analyze all workflows
node scripts/migrate-n8n-to-mcp/migrate-all-workflows.js

# Analyze single workflow
node scripts/migrate-n8n-to-mcp/analyze-n8n-workflow.js n8n-workflows/project-content-store.json
```

### Test Migration

```bash
# Test specific workflow migration
node scripts/migrate-n8n-to-mcp/e2e-test-migration.js project-content-store
```

---

## 📊 Workflow Analysis

### Workflow Structure

n8n workflows contain:
- **Nodes**: Individual workflow steps
- **Connections**: Flow between nodes
- **Webhooks**: Entry points
- **Parameters**: Node configuration

### Functionality Types

1. **Supabase Operations**: Database CRUD
2. **OpenRouter LLM**: AI/LLM calls
3. **Code Execution**: Custom logic
4. **Data Transformation**: Data manipulation
5. **Conditional Logic**: Branching

### MCP Mapping

| n8n Functionality | MCP Tool | Status |
|------------------|----------|--------|
| Supabase SELECT | `get_crew_memories` | ✅ Exists |
| Supabase INSERT | `store_crew_memory` | ⚠️ Needs implementation |
| OpenRouter LLM | `call_openrouter_llm` | ✅ Exists |
| Code Execution | Custom MCP tool | ⚠️ Needs implementation |
| Data Transform | Inline in MCP | ✅ Supported |

---

## 🧪 Testing Strategy

### Test Categories

1. **Functionality Parity**: Same operations
2. **Input/Output Format**: Compatible formats
3. **Error Handling**: Proper error responses
4. **Performance**: Comparable speed

### Test Execution

```bash
# Run all tests
npm run test:migration

# Test specific workflow
npm run test:migration -- project-content-store
```

---

## 📝 Migration Checklist

### Per Workflow

- [ ] Analyze workflow structure
- [ ] Map to MCP tools
- [ ] Implement MCP tool(s)
- [ ] Test functionality
- [ ] Verify feature parity
- [ ] Update documentation
- [ ] Deprecate n8n workflow

### Overall

- [ ] All workflows analyzed
- [ ] All MCP tools implemented
- [ ] All tests passing
- [ ] Documentation complete
- [ ] n8n workflows deprecated

---

## 🔧 Implementation Guide

### Creating MCP Tool from n8n Workflow

1. **Analyze workflow:**
   ```bash
   node scripts/migrate-n8n-to-mcp/analyze-n8n-workflow.js workflow.json
   ```

2. **Identify functionality:**
   - Extract node types
   - Identify operations
   - Map to MCP tools

3. **Implement MCP tool:**
   - Add to `lib/mcp-crew-memories-server.js`
   - Port n8n logic
   - Test implementation

4. **Test migration:**
   ```bash
   node scripts/migrate-n8n-to-mcp/e2e-test-migration.js workflow-name
   ```

---

## 📊 Progress Tracking

### Current Status

- **Workflows Found**: ~75
- **Workflows Analyzed**: 0 (pending)
- **MCP Tools Created**: 7
- **Migrations Complete**: 0
- **Tests Passing**: 0

### Reports

- **Migration Plan**: `reports/n8n-to-mcp-migration-plan.json`
- **Test Results**: `reports/migration-test-results.json`

---

## 🎯 Success Criteria

- [ ] All n8n workflows analyzed
- [ ] All functionality mapped to MCP
- [ ] All MCP tools implemented
- [ ] All tests passing
- [ ] Feature parity verified
- [ ] Performance acceptable
- [ ] Documentation complete

---

## 📚 Related Documentation

- **Feature Parity**: `docs/MCP_N8N_FEATURE_PARITY.md`
- **MCP Server**: `lib/mcp-crew-memories-server.js`
- **Test Harness**: `docs/OPENROUTER_TEST_HARNESS.md`

---

**This migration ensures complete feature parity while removing n8n webhook dependencies.**

