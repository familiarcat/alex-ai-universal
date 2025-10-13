/**
 * Workflow Repository Interface
 * Defines persistence operations for workflows
 */

import { Workflow } from '../../domain/aggregates/workflow';

export interface WorkflowRepository {
  /**
   * Find workflow by ID
   */
  findById(id: string): Promise<Workflow | null>;

  /**
   * Find workflow by N8N workflow ID
   */
  findByN8NId(n8nWorkflowId: string): Promise<Workflow | null>;

  /**
   * Find workflow by name
   */
  findByName(name: string): Promise<Workflow | null>;

  /**
   * List all workflows
   */
  findAll(): Promise<Workflow[]>;

  /**
   * List active workflows
   */
  findActive(): Promise<Workflow[]>;

  /**
   * Save workflow (create or update)
   */
  save(workflow: Workflow): Promise<void>;

  /**
   * Delete workflow
   */
  delete(id: string): Promise<void>;
}

