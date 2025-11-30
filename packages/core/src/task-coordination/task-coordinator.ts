/**
 * Task Coordinator - Unified Task-Based System
 * 
 * Integrates:
 * - Task-based OpenRouter coordination (same model for all crew on a task)
 * - Process-level hallucination management
 * - Quark + Riker optimization within task context
 * 
 * This is the main entry point for task-based crew coordination.
 */

// Note: TaskBasedCoordinator is in JavaScript, so we'll need to import it differently
// For now, we'll use require in the implementation
const { TaskBasedCoordinator } = require('../../shared-utilities/src/openrouter/task-based-coordinator');
import { ProcessLevelHallucinationManager } from '../anti-hallucination/process-level-hallucination-manager';
import { HallucinationDetector } from '../anti-hallucination/hallucination-detector';

export interface TaskConfiguration {
  taskId: string;
  description: string;
  crewMembers: string[];
  context?: {
    budgetConstraint?: number;
    priority?: 'low' | 'medium' | 'high';
    deadline?: string;
    [key: string]: any;
  };
}

export interface TaskExecutionResult {
  taskId: string;
  modelUsed: string;
  crewResponses: Array<{
    crewMember: string;
    response: string;
    tokens: number;
    cost: number;
  }>;
  tokenPool: {
    totalTokens: number;
    totalCost: number;
    averageCostPerMember: number;
  };
  hallucinationReport: {
    overallHealth: number;
    consistencyScore: number;
    events: any[];
    recommendations: string[];
  };
  duration: number;
}

export class TaskCoordinator {
  private taskCoordinator: any; // TaskBasedCoordinator (JS class)
  private hallucinationManager: ProcessLevelHallucinationManager;
  private hallucinationDetector: HallucinationDetector;

  constructor(openRouterApiKey: string) {
    // Initialize components
    this.taskCoordinator = new (TaskBasedCoordinator as any)(openRouterApiKey);
    
    // Initialize hallucination detector
    this.hallucinationDetector = new HallucinationDetector(
      0.3, // hallucinationThreshold
      0.7, // semanticSimilarityThreshold
      0.6  // factualAlignmentThreshold
    );
    
    // Initialize process-level hallucination manager
    this.hallucinationManager = new ProcessLevelHallucinationManager(this.hallucinationDetector);
    
    console.log('🎯 Task Coordinator initialized with process-level hallucination management');
  }

  /**
   * Initialize a task with optimal model selection and process monitoring
   */
  async initializeTask(config: TaskConfiguration) {
    console.log(`\n🎯 Initializing Task: ${config.taskId}`);
    
    // Step 1: Initialize task-based coordination
    const taskState = await this.taskCoordinator.initializeTask(
      config.taskId,
      config.description,
      config.crewMembers,
      config.context || {}
    );

    // Step 2: Initialize process-level hallucination monitoring
    this.hallucinationManager.initializeTaskMonitoring(
      config.taskId,
      config.description,
      config.crewMembers
    );

    console.log(`✅ Task ${config.taskId} fully initialized`);
    console.log(`   Model: ${taskState.modelSelection.modelName}`);
    console.log(`   Crew: ${config.crewMembers.join(', ')}`);
    console.log(`   Process monitoring: Active\n`);

    return taskState;
  }

  /**
   * Execute a crew member request within a task
   * Automatically records response for process-level hallucination detection
   */
  async executeCrewRequest(
    taskId: string,
    crewMember: string,
    prompt: string,
    options: any = {}
  ) {
    // Execute request using task-based coordinator
    const result = await this.taskCoordinator.executeCrewRequest(
      taskId,
      crewMember,
      prompt,
      options
    );

    // Record response for process-level hallucination detection
    const hallucinationEvents = await this.hallucinationManager.recordResponse(
      taskId,
      crewMember,
      prompt,
      result.response,
      result.usage.total_tokens,
      result.cost
    );

    // Log any hallucinations detected
    if (hallucinationEvents.length > 0) {
      console.log(`\n⚠️  Process-level hallucinations detected: ${hallucinationEvents.length}`);
      for (const event of hallucinationEvents) {
        console.log(`   [${event.severity.toUpperCase()}] ${event.type}: ${event.description}`);
      }
      console.log('');
    }

    return {
      ...result,
      hallucinationEvents
    };
  }

  /**
   * Get comprehensive task report
   */
  async getTaskReport(taskId: string): Promise<TaskExecutionResult> {
    // Get task summary from coordinator
    const taskSummary = this.taskCoordinator.getTaskSummary(taskId);
    if (!taskSummary) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Get hallucination report
    const hallucinationReport = await this.hallucinationManager.generateReport(taskId);

    return {
      taskId,
      modelUsed: taskSummary.model.name,
      crewResponses: taskSummary.tokenPool.crewMemberBreakdown as any,
      tokenPool: {
        totalTokens: taskSummary.tokenPool.totalTokens,
        totalCost: taskSummary.tokenPool.totalCost,
        averageCostPerMember: taskSummary.tokenPool.averageCostPerMember
      },
      hallucinationReport: {
        overallHealth: hallucinationReport.overallHealth,
        consistencyScore: hallucinationReport.consistencyScore,
        events: hallucinationReport.hallucinationEvents,
        recommendations: hallucinationReport.recommendations
      },
      duration: taskSummary.duration
    };
  }

  /**
   * Complete a task and return final report
   */
  async completeTask(taskId: string): Promise<TaskExecutionResult> {
    // Get final report
    const report = await this.getTaskReport(taskId);

    // Complete task in coordinator
    this.taskCoordinator.completeTask(taskId);

    console.log(`\n✅ Task ${taskId} completed`);
    console.log(`   Total tokens: ${report.tokenPool.totalTokens}`);
    console.log(`   Total cost: $${report.tokenPool.totalCost.toFixed(4)}`);
    console.log(`   Overall health: ${(report.hallucinationReport.overallHealth * 100).toFixed(1)}%`);
    console.log(`   Consistency: ${(report.hallucinationReport.consistencyScore * 100).toFixed(1)}%`);
    console.log(`   Hallucination events: ${report.hallucinationReport.events.length}\n`);

    return report;
  }
}

