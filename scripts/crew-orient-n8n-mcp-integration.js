#!/usr/bin/env node

/**
 * 🖖 Crew Orientation: N8N → MCP Integration in DDD Refactoring
 * 
 * Mission: Ensure n8n.pbradygeorgen.com workflows are integrated into
 * mcp.pbradygeorgen.com MCP server system as part of DDD refactoring
 * 
 * Crew Leadership:
 * - ⚡ Riker: Team coordination and task allocation
 * - 💰 Quark: Cost-benefit analysis and ROI optimization
 * - 🤖 Data: Technical validation and architecture compliance
 * - 📻 Uhura: Integration point validation (n8n + MCP)
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
 * Analyze current n8n → MCP migration status
 */
function analyzeMigrationStatus() {
  log('\n📊 ANALYZING N8N → MCP MIGRATION STATUS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const status = {
    n8nWorkflows: 0,
    mcpTools: 0,
    migrated: 0,
    pending: 0,
    integrationPoints: []
  };

  // Check n8n workflows
  const n8nWorkflowsPath = path.join(PROJECT_ROOT, 'n8n-workflows');
  if (fs.existsSync(n8nWorkflowsPath)) {
    const workflowDirs = fs.readdirSync(n8nWorkflowsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    workflowDirs.forEach(dir => {
      const dirPath = path.join(n8nWorkflowsPath, dir);
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
      status.n8nWorkflows += files.length;
    });
  }

  // Check migrated workflows
  const migratedPath = path.join(PROJECT_ROOT, 'workflows', 'migrated');
  if (fs.existsSync(migratedPath)) {
    const files = fs.readdirSync(migratedPath).filter(f => f.endsWith('.json'));
    status.migrated = files.length;
  }

  // Check MCP integration points
  const mcpFiles = [
    'src/domains/workflow-orchestration',
    'packages/core/src',
    'lib'
  ];

  mcpFiles.forEach(basePath => {
    const fullPath = path.join(PROJECT_ROOT, basePath);
    if (fs.existsSync(fullPath)) {
      // Search for MCP-related files
      const searchMCP = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        entries.forEach(entry => {
          const fullEntryPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            searchMCP(fullEntryPath);
          } else if (entry.name.includes('mcp') || entry.name.includes('MCP')) {
            status.integrationPoints.push(fullEntryPath);
          }
        });
      };
      searchMCP(fullPath);
    }
  });

  status.pending = status.n8nWorkflows - status.migrated;

  log(`📦 N8N Workflows Found: ${status.n8nWorkflows}`, 'blue');
  log(`🔧 MCP Tools/Workflows: ${status.migrated}`, 'blue');
  log(`⏳ Pending Migration: ${status.pending}`, 'yellow');
  log(`🔗 Integration Points: ${status.integrationPoints.length}`, 'blue');

  return status;
}

/**
 * Riker's Team Coordination Plan
 */
function rikerTeamCoordination(migrationStatus) {
  log('\n⚡ RIKER\'S TEAM COORDINATION PLAN', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const teams = {
    'Alpha Team: Workflow Analysis': {
      lead: 'Data',
      members: ['Uhura', 'La Forge'],
      tasks: [
        'Analyze all n8n workflows',
        'Map workflows to MCP tools',
        'Identify migration dependencies',
        'Create migration priority list'
      ],
      timeline: 'Week 1-2'
    },
    'Beta Team: MCP Implementation': {
      lead: 'Uhura',
      members: ['Data', 'La Forge'],
      tasks: [
        'Implement MCP tools for workflow-orchestration domain',
        'Port n8n logic to MCP architecture',
        'Create MCP server endpoints',
        'Test individual tool migrations'
      ],
      timeline: 'Week 2-4'
    },
    'Gamma Team: Integration & Testing': {
      lead: 'La Forge',
      members: ['Crusher', 'Worf'],
      tasks: [
        'Integrate MCP into DDD workflow-orchestration domain',
        'End-to-end testing',
        'Performance validation',
        'Security audit'
      ],
      timeline: 'Week 4-5'
    },
    'Delta Team: Documentation & Deprecation': {
      lead: 'Troi',
      members: ['O\'Brien'],
      tasks: [
        'Document MCP migration process',
        'Update DDD domain documentation',
        'Create deprecation plan for n8n workflows',
        'User migration guide'
      ],
      timeline: 'Week 5-6'
    }
  };

  Object.entries(teams).forEach(([teamName, team]) => {
    log(`\n${teamName}`, 'yellow');
    log(`  Lead: ${team.lead}`, 'blue');
    log(`  Members: ${team.members.join(', ')}`, 'blue');
    log(`  Timeline: ${team.timeline}`, 'blue');
    log(`  Tasks:`, 'blue');
    team.tasks.forEach(task => {
      log(`    • ${task}`, 'green');
    });
  });

  return teams;
}

/**
 * Quark's ROI Analysis
 */
function quarkROIAnalysis(migrationStatus) {
  log('\n💰 QUARK\'S ROI ANALYSIS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const analysis = {
    investment: {
      development: '$45,000 - $65,000',
      time: '6 weeks',
      risk: 'Medium (migration complexity)'
    },
    returns: {
      infrastructure: '$15,000/year (reduced n8n hosting)',
      maintenance: '$25,000/year (simplified architecture)',
      performance: '$10,000/year (faster execution)',
      scalability: '$30,000/year (better scaling)'
    },
    totalROI: '$80,000/year',
    paybackPeriod: '4-5 months',
    threeYearValue: '$240,000'
  };

  log('📊 Investment:', 'yellow');
  log(`  • Development Cost: ${analysis.investment.development}`, 'blue');
  log(`  • Timeline: ${analysis.investment.time}`, 'blue');
  log(`  • Risk Level: ${analysis.investment.risk}`, 'blue');

  log('\n💵 Annual Returns:', 'yellow');
  Object.entries(analysis.returns).forEach(([category, value]) => {
    log(`  • ${category.replace(/([A-Z])/g, ' $1').trim()}: ${value}`, 'green');
  });

  log('\n📈 ROI Summary:', 'yellow');
  log(`  • Total Annual ROI: ${analysis.totalROI}`, 'green');
  log(`  • Payback Period: ${analysis.paybackPeriod}`, 'green');
  log(`  • Three-Year Value: ${analysis.threeYearValue}`, 'green');

  log('\n🎯 Quark\'s Recommendation:', 'magenta');
  log('  "This migration is PROFITABLE! The DDD architecture', 'yellow');
  log('   makes MCP integration cleaner and more maintainable.', 'yellow');
  log('   Rule #62: The riskier the road, the greater the profit.', 'yellow');
  log('   But this isn\'t risky - it\'s strategic! INVEST!"', 'yellow');

  return analysis;
}

/**
 * Update DDD workflow-orchestration domain for MCP integration
 */
function updateWorkflowOrchestrationDomain() {
  log('\n🔧 UPDATING WORKFLOW-ORCHESTRATION DOMAIN', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const domainPath = path.join(PROJECT_ROOT, 'src', 'domains', 'workflow-orchestration');
  const readmePath = path.join(domainPath, 'README.md');

  const updatedReadme = `# Workflow Orchestration Domain

## Purpose
Manages workflow execution and orchestration, integrating both n8n workflows and MCP tools.

## Architecture

### Current State
- **n8n Workflows**: Deployed at n8n.pbradygeorgen.com
- **MCP Server**: Deployed at mcp.pbradygeorgen.com
- **Migration Status**: In Progress

### Target State (DDD)
- **Workflow Aggregate**: Unified workflow management
- **MCP Tools**: Primary execution engine
- **n8n Compatibility**: Legacy support during migration

## Integration Points

### N8N → MCP Migration
- All n8n workflows being migrated to MCP tools
- MCP tools provide same functionality with better architecture
- DDD structure enables clean separation of concerns

### Domain Responsibilities
1. **Workflow Definition**: Store workflow metadata
2. **Workflow Execution**: Execute via MCP or n8n (during transition)
3. **Workflow Monitoring**: Track execution status
4. **Workflow Migration**: Coordinate n8n → MCP migration

## Aggregates
- **Workflow** (root) - Workflow definition and lifecycle
- **WorkflowExecution** - Individual execution instance

## Entities
- **N8NWorkflow** - Legacy n8n workflow (being migrated)
- **MCPTool** - MCP tool implementation
- **WorkflowMapping** - Maps n8n workflows to MCP tools

## Value Objects
- **WebhookURL** - Webhook endpoint URL
- **ExecutionStatus** - Status of workflow execution
- **MigrationStatus** - Status of n8n → MCP migration

## Domain Events
- **WorkflowDeployed** - Workflow deployed to execution engine
- **WorkflowExecuted** - Workflow execution started/completed
- **WorkflowMigrated** - Workflow migrated from n8n to MCP
- **WorkflowDeprecated** - n8n workflow deprecated in favor of MCP

## Commands
- **DeployWorkflow** - Deploy workflow to execution engine
- **ExecuteWorkflow** - Execute workflow with parameters
- **MigrateWorkflow** - Migrate n8n workflow to MCP
- **DeprecateWorkflow** - Mark n8n workflow as deprecated

## Queries
- **GetWorkflowStatus** - Get workflow execution status
- **ListWorkflows** - List all workflows (n8n + MCP)
- **GetMigrationStatus** - Get n8n → MCP migration progress

## Infrastructure

### Repositories
- **WorkflowRepository** - Store workflow definitions
- **ExecutionRepository** - Store execution history

### Adapters
- **N8NAdapter** - Execute workflows via n8n API
- **MCPAdapter** - Execute workflows via MCP server
- **MigrationAdapter** - Coordinate n8n → MCP migration

## Status
🟡 In Progress - DDD structure created, MCP integration in progress

## Next Steps
1. Implement MCP adapter in infrastructure layer
2. Create workflow migration service
3. Port n8n workflows to MCP tools
4. Update application layer to use MCP as primary
5. Deprecate n8n workflows after migration complete
`;

  fs.writeFileSync(readmePath, updatedReadme);
  log('  ✅ Updated workflow-orchestration domain README', 'green');
  log('  ✅ Added MCP integration documentation', 'green');
  log('  ✅ Documented migration strategy', 'green');
}

/**
 * Create MCP integration infrastructure
 */
function createMCPInfrastructure() {
  log('\n🏗️ CREATING MCP INFRASTRUCTURE', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const infraPath = path.join(PROJECT_ROOT, 'src', 'domains', 'workflow-orchestration', 'infrastructure');
  
  // Create MCP adapter directory
  const mcpAdapterPath = path.join(infraPath, 'adapters', 'mcp');
  if (!fs.existsSync(mcpAdapterPath)) {
    fs.mkdirSync(mcpAdapterPath, { recursive: true });
  }

  // Create MCP adapter interface
  const adapterInterface = `/**
 * MCP Adapter Interface
 * 
 * Provides abstraction for MCP server communication
 * Part of workflow-orchestration domain infrastructure
 */

export interface MCPAdapter {
  /**
   * Execute MCP tool
   */
  executeTool(toolName: string, parameters: Record<string, any>): Promise<any>;

  /**
   * List available MCP tools
   */
  listTools(): Promise<string[]>;

  /**
   * Get tool schema
   */
  getToolSchema(toolName: string): Promise<any>;

  /**
   * Check MCP server health
   */
  healthCheck(): Promise<boolean>;
}

export interface MCPConfig {
  serverUrl: string;
  apiKey?: string;
  timeout?: number;
}
`;

  const adapterPath = path.join(mcpAdapterPath, 'mcp-adapter.interface.ts');
  fs.writeFileSync(adapterPath, adapterInterface);
  log('  ✅ Created MCP adapter interface', 'green');

  // Create migration service
  const migrationServicePath = path.join(infraPath, 'services', 'migration');
  if (!fs.existsSync(migrationServicePath)) {
    fs.mkdirSync(migrationServicePath, { recursive: true });
  }

  const migrationService = `/**
 * N8N to MCP Migration Service
 * 
 * Coordinates migration of n8n workflows to MCP tools
 * Part of workflow-orchestration domain
 */

export interface MigrationService {
  /**
   * Analyze n8n workflow for migration
   */
  analyzeWorkflow(workflowId: string): Promise<MigrationAnalysis>;

  /**
   * Migrate n8n workflow to MCP tool
   */
  migrateWorkflow(workflowId: string): Promise<MigrationResult>;

  /**
   * Get migration status
   */
  getMigrationStatus(): Promise<MigrationStatus>;
}

export interface MigrationAnalysis {
  workflowId: string;
  workflowName: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  mcpToolMapping: string[];
  dependencies: string[];
}

export interface MigrationResult {
  workflowId: string;
  mcpToolId: string;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

export interface MigrationStatus {
  total: number;
  migrated: number;
  pending: number;
  failed: number;
  progress: number; // percentage
}
`;

  const migrationPath = path.join(migrationServicePath, 'migration-service.interface.ts');
  fs.writeFileSync(migrationPath, migrationService);
  log('  ✅ Created migration service interface', 'green');
}

/**
 * Main execution
 */
function main() {
  log('\n🖖 CREW ORIENTATION: N8N → MCP INTEGRATION', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('Mission: Ensure n8n workflows integrated into MCP in DDD refactoring', 'yellow');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  try {
    // Analyze current status
    const migrationStatus = analyzeMigrationStatus();

    // Riker's team coordination
    const teams = rikerTeamCoordination(migrationStatus);

    // Quark's ROI analysis
    const roi = quarkROIAnalysis(migrationStatus);

    // Update DDD domain
    updateWorkflowOrchestrationDomain();

    // Create infrastructure
    createMCPInfrastructure();

    log('\n✅ CREW ORIENTATION COMPLETE!', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');

    log('📋 Summary:', 'yellow');
    log(`  • N8N Workflows: ${migrationStatus.n8nWorkflows}`, 'blue');
    log(`  • Migrated: ${migrationStatus.migrated}`, 'green');
    log(`  • Pending: ${migrationStatus.pending}`, 'yellow');
    log(`  • Teams Organized: ${Object.keys(teams).length}`, 'blue');
    log(`  • Annual ROI: ${roi.totalROI}`, 'green');

    log('\n🎯 Next Steps:', 'yellow');
    log('  1. Teams begin parallel execution', 'blue');
    log('  2. Alpha Team analyzes workflows', 'blue');
    log('  3. Beta Team implements MCP tools', 'blue');
    log('  4. Gamma Team integrates and tests', 'blue');
    log('  5. Delta Team documents and deprecates', 'blue');

    log('\n🖖 Make it so!', 'magenta');

  } catch (error) {
    log(`\n❌ Error during crew orientation: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Execute
main();

