# ⚙️ Workflow Orchestration Domain

**Bounded Context:** N8N workflow management and autonomous automation

## Purpose

The Workflow Orchestration domain handles:
- N8N workflow deployment
- Workflow execution and monitoring
- Webhook management
- Autonomous workflow operations

## Ubiquitous Language

- **Workflow**: N8N automation sequence
- **Execution**: Single run of a workflow
- **Webhook**: HTTP endpoint triggering workflow
- **Node**: Individual step in workflow
- **Trigger**: Event that starts workflow

## Aggregates

### Workflow (Root)
- **Identity**: N8N workflow ID
- **Properties**: Name, nodes, webhooks, status
- **Operations**: Deploy, execute, monitor

### WorkflowExecution
- **Identity**: Execution ID
- **Properties**: Workflow ID, start time, status, result
- **Invariants**:
  - Must reference valid workflow
  - Status follows lifecycle (pending → running → completed/failed)

## Domain Events

- `WorkflowDeployed`: Workflow deployed to N8N
- `WorkflowExecuted`: Workflow run completed
- `IntegrationUpdated`: N8N integration modified
- `AutomationTriggered`: Autonomous workflow started

## Value Objects

- **WebhookURL**: Validated webhook endpoint
- **ExecutionStatus**: Enumeration (pending, running, completed, failed)
- **Credentials**: N8N API credentials

## Dependencies

- **Outbound**: Infrastructure (N8N API client)
- **Inbound**: 
  - Project Management (deployment workflows)
  - Knowledge Management (RAG ingestion workflow)

## Migration Status

- [ ] Directory structure created
- [ ] Aggregates defined
- [ ] Value objects implemented
- [ ] Domain events defined
- [ ] Commands/queries created
- [ ] Repository interfaces defined
- [ ] Tests written
- [ ] Legacy code migrated from n8n-workflows/, scripts/n8n-*

## Crew Assignment

**Owner**: Lieutenant Uhura  
**Effort**: 2 hours  
**Priority**: HIGH

