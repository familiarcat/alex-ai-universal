/**
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
