/**
 * Execution Repository Interface
 * Defines persistence operations for workflow executions
 */

import { Execution } from '../../domain/aggregates/execution';

export interface ExecutionRepository {
  /**
   * Find execution by ID
   */
  findById(id: string): Promise<Execution | null>;

  /**
   * Find executions by workflow ID
   */
  findByWorkflowId(workflowId: string, limit?: number): Promise<Execution[]>;

  /**
   * Find recent executions
   */
  findRecent(limit: number): Promise<Execution[]>;

  /**
   * Save execution (create or update)
   */
  save(execution: Execution): Promise<void>;

  /**
   * Delete execution
   */
  delete(id: string): Promise<void>;
}

