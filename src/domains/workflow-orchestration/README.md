# Workflow Orchestration Domain

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
