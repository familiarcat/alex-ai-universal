# MCP Crew Memories Migration Guide

**Date:** November 23, 2025  
**Status:** ✅ Complete  
**Purpose:** Migrate crew memory loading from direct Supabase to MCP protocol

## 🎯 Mission

Migrate crew memory access to use Model Context Protocol (MCP) instead of direct Supabase connections, enabling better integration with Cursor AI and other MCP-compatible tools.

## 🏗️ Architecture

### Before (Direct Supabase)
```
load-crew-memories.js → Direct Supabase Connection
```

### After (MCP Protocol)
```
Cursor AI / Tools → MCP Server → Supabase
```

## 📋 Components

### 1. MCP Crew Memories Server
**File:** `lib/mcp-crew-memories-server.js`

**Features:**
- Exposes crew memories as MCP resources
- Provides tools for querying and searching memories
- Caches memories for 5 minutes (configurable)
- Supports all crew members

**Resources:**
- `crew://memories/all` - All crew memories (JSON)
- `crew://memories/{crewId}` - Specific crew member memories (JSON)
- `crew://memories/cursor-prompt` - Formatted Cursor AI prompt (Markdown)

**Tools:**
- `get_crew_memories` - Get memories for crew member(s)
- `search_crew_memories` - Search memories by query

### 2. MCP Configuration
**File:** `.cursor/mcp-config.json`

**Usage:**
Add this configuration to Cursor AI's MCP settings to enable crew memories access.

### 3. Updated Load Script
**File:** `scripts/crew/coordination/load-crew-memories.js`

**Changes:**
- Maintains backward compatibility (still works directly)
- Can be enhanced to use MCP when available
- No breaking changes to existing functionality

## 🚀 Setup Instructions

### 1. Install MCP SDK (Already Done)
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Configure Cursor AI

Add to Cursor AI MCP settings (usually in `~/.cursor/mcp.json` or Cursor settings):

```json
{
  "mcpServers": {
    "alex-ai-crew-memories": {
      "command": "node",
      "args": [
        "/Users/bradygeorgen/Documents/workspace/alex-ai-universal/lib/mcp-crew-memories-server.js"
      ],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

**Note:** Update the path to match your workspace location.

### 3. Test MCP Server

```bash
# Test the server directly
node lib/mcp-crew-memories-server.js
```

The server communicates via stdio, so it's designed to be used by MCP clients.

## 📊 Benefits

### Before (Direct Supabase)
- ✅ Works reliably
- ❌ Not accessible via MCP protocol
- ❌ Can't be used by Cursor AI directly
- ❌ No standardized interface

### After (MCP Protocol)
- ✅ Works reliably
- ✅ Accessible via MCP protocol
- ✅ Can be used by Cursor AI and other MCP clients
- ✅ Standardized interface
- ✅ Caching for performance
- ✅ Tool-based access for AI agents

## 🔄 Migration Status

- ✅ MCP server created
- ✅ Resources and tools implemented
- ✅ Configuration file created
- ✅ Documentation complete
- ⏳ Cursor AI integration (user configuration)
- ⏳ Optional: Update load-crew-memories.js to use MCP when available

## 🖖 Crew Assessment

**Captain Picard:** "Strategic migration to MCP protocol ensures future compatibility and standardization."

**Commander Data:** "MCP implementation provides 100% backward compatibility while enabling new capabilities."

**Chief O'Brien:** "Simple, reliable solution. No breaking changes, just added functionality."

---

**Status:** ✅ Ready for Use  
**Backward Compatibility:** ✅ Maintained  
**Breaking Changes:** None

