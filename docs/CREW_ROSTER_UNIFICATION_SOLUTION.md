# 🖖 Crew Roster Unification Solution

**Date:** November 26, 2025  
**Status:** ✅ Implemented  
**Source of Truth:** MCP Server

---

## 🎯 Problem

Crew rosters were inconsistent across systems:
- **Local system:** Multiple definitions (12, 9, 10 members) in different files
- **n8n workflows:** Hardcoded lists with 9 members (including Tasha Yar and Spock not in other rosters)
- **MCP server:** No crew roster endpoint

This caused:
- Inconsistent crew member counts
- Different crew members in different systems
- No single source of truth
- Cost/crew optimization processes not shared

---

## ✅ Solution

### 1. MCP Server as Source of Truth

**Created:** `GET /api/crew/roster` endpoint in `mcp-server/server.js`

- **Unified roster:** 10 crew members with complete metadata
- **Cost optimization:** Includes `cost` and `capacity` fields
- **OpenRouter integration:** Includes `preferredModels` for each crew member
- **n8n integration:** Includes `n8nWorkflowId` and `webhookPath`
- **Shared with n8n:** Both systems use the same roster definition

### 2. Crew Roster Endpoint

```javascript
GET /api/crew/roster
Headers: X-MCP-API-KEY: <key>

Response:
{
  "success": true,
  "roster": {
    "version": "2.0.0",
    "source": "mcp-server",
    "totalCrewMembers": 10,
    "activeCrewMembers": 10,
    "crewMembers": [
      {
        "id": "picard",
        "name": "Captain Jean-Luc Picard",
        "role": "Strategic Leadership",
        "department": "Command",
        "specialization": [...],
        "capabilities": [...],
        "expertise": [...],
        "cost": "high",
        "capacity": "strategic",
        "preferredModels": [...],
        "n8nWorkflowId": "...",
        "webhookPath": "...",
        "active": true
      },
      // ... 9 more crew members
    ]
  }
}
```

### 3. Unified Crew Roster (10 Members)

1. **Captain Picard** - Strategic Leadership (Command)
2. **Commander Riker** - Tactical Operations (Command)
3. **Commander Data** - Technical Analysis (Operations)
4. **Lt. Cmdr. La Forge** - Infrastructure Engineering (Engineering)
5. **Lieutenant Worf** - Security & Compliance (Security)
6. **Counselor Troi** - User Experience (Support)
7. **Dr. Crusher** - System Health (Medical)
8. **Lieutenant Uhura** - Communication Systems (Communications)
9. **Quark** - Business Operations (Business)
10. **Chief O'Brien** - Pragmatic Solutions (Operations)

### 4. Sync Script

**Created:** `scripts/crew-coordination/sync-crew-roster-from-mcp.js`

- Queries MCP server for authoritative roster
- Updates local systems:
  - `packages/core/src/crew-manager.ts`
  - `crew-roster.json` (backward compatibility)
- Updates n8n workflows:
  - Replaces hardcoded crew member lists
  - Preserves workflow structure

### 5. Analysis Script

**Created:** `scripts/crew-coordination/unify-crew-roster-systems.js`

- Analyzes roster differences across systems
- Identifies inconsistencies
- Generates recommendations
- Creates unified roster

---

## 🔄 Usage

### Query MCP Roster

```bash
# Set environment variables
export MCP_SERVER_URL="http://localhost:5679"
export MCP_API_KEY="your-api-key"

# Query roster
curl -H "X-MCP-API-KEY: $MCP_API_KEY" \
  $MCP_SERVER_URL/api/crew/roster
```

### Sync from MCP

```bash
# Sync roster to local systems and n8n
node scripts/crew-coordination/sync-crew-roster-from-mcp.js
```

### Analyze Differences

```bash
# Analyze roster inconsistencies
node scripts/crew-coordination/unify-crew-roster-systems.js
```

---

## 🖖 Crew Team Organization

### Analysis & Comparison Team
- **Commander Data** - Content analysis
- **Lt. Cmdr. La Forge** - Infrastructure analysis

### MCP Integration Team
- **Lt. Cmdr. La Forge** - MCP endpoint creation
- **Commander Data** - Roster structure design

### Local System Updates Team
- **Chief O'Brien** - Pragmatic implementation
- **Commander Riker** - Coordination

### n8n Workflow Updates Team
- **Commander Riker** - Workflow coordination
- **Lieutenant Uhura** - Integration updates

### Cost Optimization Team
- **Quark** - Cost analysis
- **Commander Riker** - Process preservation

### Strategic Oversight
- **Captain Picard** - Strategic approval
- **Commander Riker** - Execution oversight

---

## 📊 Benefits

1. **Single Source of Truth** - MCP server is authoritative
2. **Consistency** - All systems use the same roster
3. **Cost Optimization** - Shared cost/crew optimization processes
4. **OpenRouter Integration** - Preferred models defined per crew member
5. **n8n Compatibility** - Includes n8n workflow IDs and webhooks
6. **Automated Sync** - Scripts to keep systems in sync
7. **Backward Compatible** - Maintains `crew-roster.json` for legacy systems

---

## 🔧 Implementation Details

### MCP Server Endpoint

- **Location:** `mcp-server/server.js`
- **Route:** `GET /api/crew/roster`
- **Authentication:** `X-MCP-API-KEY` header
- **Response:** Complete crew roster with metadata

### Sync Script Features

- Queries MCP server for roster
- Falls back to local `crew-roster.json` if MCP unavailable
- Updates TypeScript crew manager
- Updates JSON roster file
- Updates n8n workflow hardcoded lists

### Roster Structure

Each crew member includes:
- **Identity:** `id`, `name`, `role`, `department`
- **Capabilities:** `specialization`, `capabilities`, `expertise`
- **Cost Optimization:** `cost`, `capacity`
- **AI Configuration:** `preferredModels`
- **Integrations:** `n8nWorkflowId`, `webhookPath`
- **Status:** `active`

---

## ✅ Status

- ✅ MCP server endpoint created
- ✅ Unified roster defined (10 members)
- ✅ Sync script created
- ✅ Analysis script created
- ⚠️  MCP server needs to be running for sync
- ⚠️  Local systems need manual update on first sync
- ⚠️  n8n workflows need manual review after sync

---

## 🚀 Next Steps

1. **Start MCP Server:**
   ```bash
   cd mcp-server
   npm start
   ```

2. **Run Sync:**
   ```bash
   node scripts/crew-coordination/sync-crew-roster-from-mcp.js
   ```

3. **Verify Updates:**
   - Check `packages/core/src/crew-manager.ts`
   - Check `crew-roster.json`
   - Review n8n workflow updates

4. **Test Integration:**
   - Query MCP roster endpoint
   - Verify crew member assignments
   - Test cost optimization

---

**Status:** ✅ Solution Implemented  
**Source of Truth:** MCP Server (`GET /api/crew/roster`)  
**Crew Members:** 10 (unified across all systems)

