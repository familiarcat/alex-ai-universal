# 🖖 MCP (Model Context Protocol) Scripts

Scripts related to MCP migration, workflow translation, and MCP system management.

## Structure

```
scripts/mcp/
├── migration/        # n8n to MCP migration scripts
└── README.md         # This file
```

## Migration Scripts

- `translate-n8n-workflows-to-mcp.js` - Translate n8n workflows to MCP format
- `migrate-n8n-workflows-to-mcp.js` - Complete migration process

## Usage

```bash
# Translate n8n workflows to MCP
node scripts/mcp/migration/translate-n8n-workflows-to-mcp.js

# Complete migration
node scripts/mcp/migration/migrate-n8n-workflows-to-mcp.js
```

## Documentation

See `docs/mcp/` for complete MCP documentation:
- `MCP_MIGRATION_GUIDE.md`
- `MCP_N8N_STATUS_ANALYSIS.md`
- `MCP_SERVER_FIXES_APPLIED.md`
- `N8N_TO_MCP_WORKFLOW_TRANSLATION_GUIDE.md`

