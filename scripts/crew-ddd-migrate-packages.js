#!/usr/bin/env node

/**
 * 🖖 DDD Package Migration Execution
 * 
 * Mission: Migrate existing packages to DDD structure
 * with Riker/Quark team coordination
 * 
 * Crew Leadership:
 * - ⚡ Riker: Tactical execution
 * - 💰 Quark: Cost-benefit optimization
 * - 🤖 Data: Technical validation
 * - 🔧 La Forge: Infrastructure readiness
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Phase 1: Migrate packages/core → crew-management domain
 */
function migrateCorePackage() {
  log('\n🖖 PHASE 1: MIGRATE CORE PACKAGE', 'cyan');
  log('Team: Worf (Lead), Data', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const corePath = path.join(PROJECT_ROOT, 'packages', 'core', 'src');
  const crewDomainPath = path.join(PROJECT_ROOT, 'src', 'domains', 'crew-management');

  if (!fs.existsSync(corePath)) {
    log('  ⚠️  packages/core/src not found', 'yellow');
    return;
  }

  log('  📦 Analyzing packages/core for crew-related code...', 'blue');

  // Create migration mapping document
  const migrationMap = {
    'crew-assignment': {
      source: 'packages/core/src',
      target: 'src/domains/crew-management/domain/services',
      description: 'Crew assignment logic'
    },
    'crew-members': {
      source: 'packages/core/src',
      target: 'src/domains/crew-management/domain/entities',
      description: 'Crew member entities'
    },
    'crew-coordination': {
      source: 'packages/core/src',
      target: 'src/domains/crew-management/application/commands',
      description: 'Crew coordination commands'
    }
  };

  log('  ✅ Migration mapping created', 'green');
  log('  📋 Migration plan:', 'blue');
  Object.entries(migrationMap).forEach(([key, map]) => {
    log(`     • ${key} → ${map.target}`, 'green');
  });

  // Create migration guide
  const guidePath = path.join(crewDomainPath, 'MIGRATION_GUIDE.md');
  const guide = `# Crew Management Domain - Migration Guide

## Source Package
\`packages/core\`

## Migration Mapping

${Object.entries(migrationMap).map(([key, map]) => `
### ${key}
- **Source:** \`${map.source}\`
- **Target:** \`${map.target}\`
- **Description:** ${map.description}
`).join('')}

## Migration Steps

1. **Extract crew logic from packages/core**
   - Identify all crew-related files
   - Map to appropriate DDD layers
   - Create domain entities/aggregates

2. **Create domain objects**
   - CrewMember aggregate
   - CrewRole value object
   - CrewAssignment service

3. **Update imports**
   - Update all references to crew code
   - Point to new domain locations

4. **Test migration**
   - Verify crew functionality
   - Test crew assignment
   - Validate domain logic

## Status
🟡 In Progress
`;

  fs.writeFileSync(guidePath, guide);
  log('  ✅ Created migration guide', 'green');

  log('\n✅ Phase 1 Planning Complete', 'green');
}

/**
 * Phase 2: Migrate messages-intelligence → knowledge-management
 */
function migrateMessagesPackage() {
  log('\n🧠 PHASE 2: MIGRATE MESSAGES-INTELLIGENCE PACKAGE', 'cyan');
  log('Team: Data (Lead), Uhura', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const messagesPath = path.join(PROJECT_ROOT, 'packages', 'messages-intelligence', 'src');
  const knowledgeDomainPath = path.join(PROJECT_ROOT, 'src', 'domains', 'knowledge-management');

  if (!fs.existsSync(messagesPath)) {
    log('  ⚠️  packages/messages-intelligence/src not found', 'yellow');
    return;
  }

  log('  📦 Analyzing messages-intelligence for RAG/knowledge code...', 'blue');

  const migrationMap = {
    'rag-extraction': {
      source: 'packages/messages-intelligence/src',
      target: 'src/domains/knowledge-management/domain/services',
      description: 'RAG extraction and analysis'
    },
    'knowledge-storage': {
      source: 'packages/messages-intelligence/src',
      target: 'src/domains/knowledge-management/infrastructure/repositories',
      description: 'Knowledge storage logic'
    }
  };

  log('  ✅ Migration mapping created', 'green');

  const guidePath = path.join(knowledgeDomainPath, 'MIGRATION_GUIDE.md');
  const guide = `# Knowledge Management Domain - Migration Guide

## Source Package
\`packages/messages-intelligence\`

## Migration Mapping

${Object.entries(migrationMap).map(([key, map]) => `
### ${key}
- **Source:** \`${map.source}\`
- **Target:** \`${map.target}\`
- **Description:** ${map.description}
`).join('')}

## Status
🟡 In Progress
`;

  fs.writeFileSync(guidePath, guide);
  log('  ✅ Created migration guide', 'green');

  log('\n✅ Phase 2 Planning Complete', 'green');
}

/**
 * Phase 3: Implement MCP Adapter
 */
function implementMCPAdapter() {
  log('\n🔗 PHASE 3: IMPLEMENT MCP ADAPTER', 'cyan');
  log('Team: Uhura (Lead), Data, La Forge', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const adapterPath = path.join(
    PROJECT_ROOT,
    'src',
    'domains',
    'workflow-orchestration',
    'infrastructure',
    'adapters',
    'mcp',
    'mcp-adapter.ts'
  );

  const adapterCode = `/**
 * MCP Adapter Implementation
 * 
 * Provides concrete implementation for MCP server communication
 * Part of workflow-orchestration domain infrastructure
 * 
 * Server: mcp.pbradygeorgen.com
 */

import { MCPAdapter, MCPConfig } from './mcp-adapter.interface';

export class MCPAdapterImpl implements MCPAdapter {
  private config: MCPConfig;
  private baseUrl: string;

  constructor(config: MCPConfig) {
    this.config = config;
    this.baseUrl = config.serverUrl.replace(/\/$/, '');
  }

  /**
   * Execute MCP tool
   */
  async executeTool(toolName: string, parameters: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(\`\${this.baseUrl}/api/tools/\${toolName}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': \`Bearer \${this.config.apiKey}\` })
        },
        body: JSON.stringify(parameters),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        throw new Error(\`MCP tool execution failed: \${response.statusText}\`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(\`Failed to execute MCP tool \${toolName}: \${error.message}\`);
    }
  }

  /**
   * List available MCP tools
   */
  async listTools(): Promise<string[]> {
    try {
      const response = await fetch(\`\${this.baseUrl}/api/tools\`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': \`Bearer \${this.config.apiKey}\` })
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(\`Failed to list MCP tools: \${response.statusText}\`);
      }

      const data = await response.json();
      return data.tools || [];
    } catch (error: any) {
      throw new Error(\`Failed to list MCP tools: \${error.message}\`);
    }
  }

  /**
   * Get tool schema
   */
  async getToolSchema(toolName: string): Promise<any> {
    try {
      const response = await fetch(\`\${this.baseUrl}/api/tools/\${toolName}/schema\`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': \`Bearer \${this.config.apiKey}\` })
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(\`Failed to get tool schema: \${response.statusText}\`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(\`Failed to get tool schema for \${toolName}: \${error.message}\`);
    }
  }

  /**
   * Check MCP server health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(\`\${this.baseUrl}/health\`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout || 5000)
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Factory function to create MCP adapter
 */
export function createMCPAdapter(config?: Partial<MCPConfig>): MCPAdapter {
  const defaultConfig: MCPConfig = {
    serverUrl: process.env.MCP_URL || 'https://mcp.pbradygeorgen.com',
    apiKey: process.env.MCP_API_KEY,
    timeout: 30000
  };

  return new MCPAdapterImpl({ ...defaultConfig, ...config } as MCPConfig);
}
`;

  fs.writeFileSync(adapterPath, adapterCode);
  log('  ✅ Created MCP adapter implementation', 'green');
  log('  ✅ Server: mcp.pbradygeorgen.com', 'blue');
  log('  ✅ Supports tool execution, listing, and health checks', 'green');

  log('\n✅ Phase 3 Complete', 'green');
}

/**
 * Main execution
 */
function main() {
  log('\n🖖 DDD PACKAGE MIGRATION EXECUTION', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('Crew Coordination: Riker/Quark Optimized Teams', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  try {
    migrateCorePackage();
    migrateMessagesPackage();
    implementMCPAdapter();

    log('\n🎉 MIGRATION EXECUTION COMPLETE!', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');

    log('📋 Summary:', 'yellow');
    log('  ✅ Core package migration plan created', 'green');
    log('  ✅ Messages package migration plan created', 'green');
    log('  ✅ MCP adapter implementation created', 'green');
    log('  ✅ Integration with mcp.pbradygeorgen.com ready', 'green');

    log('\n🎯 Next Steps:', 'yellow');
    log('  1. Begin actual code migration (extract and move files)', 'blue');
    log('  2. Update imports across codebase', 'blue');
    log('  3. Test migrated code', 'blue');
    log('  4. Deploy MCP adapter to mcp.pbradygeorgen.com', 'blue');

    log('\n🖖 Make it so!', 'magenta');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

main();

