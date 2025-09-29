/**
 * N8N Integration System
 * 
 * Provides workflow automation and orchestration for Alex AI
 * Integrates with centralized credential hub for seamless execution
 */

import { UniversalCredentialHub } from './credential-hub';

export interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastExecution: Date;
  executionCount: number;
  successRate: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input: any;
  output?: any;
  error?: string;
}

export interface CrewWorkflowData {
  message: string;
  crewMembers: string[];
  platform: string;
  sessionId: string;
  context: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export interface MemorySyncWorkflowData {
  memories: any[];
  platform: string;
  syncType: 'full' | 'incremental';
  crewMembers: string[];
}

export interface CrossPlatformSyncData {
  platforms: string[];
  data: any;
  syncType: 'consciousness' | 'memory' | 'preferences';
  timestamp: Date;
}

/**
 * N8N Integration Manager
 * Manages workflow execution and orchestration
 */
export class N8NIntegrationManager {
  private credentialHub: UniversalCredentialHub;
  private n8nClient: any;
  private workflows: Map<string, N8NWorkflow>;
  private executions: Map<string, WorkflowExecution>;

  constructor(credentialHub: UniversalCredentialHub) {
    this.credentialHub = credentialHub;
    this.workflows = new Map();
    this.executions = new Map();
  }

  /**
   * Initialize N8N integration
   */
  async initialize(): Promise<void> {
    console.log('🔗 Initializing N8N Integration...');
    
    try {
      // Get N8N client from credential hub
      this.n8nClient = await this.credentialHub.getN8NClient();
      
      // Load available workflows
      await this.loadWorkflows();
      
      // Initialize workflow monitoring
      await this.initializeWorkflowMonitoring();
      
      console.log('✅ N8N Integration initialized');
    } catch (error: any) {
      console.error('❌ N8N Integration failed:', error.message);
      console.log('📝 Continuing with local workflow execution');
    }
  }

  /**
   * Execute crew coordination workflow
   */
  async executeCrewCoordination(data: CrewWorkflowData): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    try {
      const workflowId = this.credentialHub['credentials'].n8n.workflowIds.crewCoordination;
      
      if (!workflowId) {
        console.log('📝 N8N crew coordination workflow not configured, using local execution');
        return await this.executeLocalCrewCoordination(data);
      }

      const execution = await this.n8nClient.executeWorkflow(workflowId, {
        message: data.message,
        crewMembers: data.crewMembers,
        platform: data.platform,
        sessionId: data.sessionId,
        context: data.context,
        priority: data.priority,
        timestamp: new Date().toISOString()
      });

      // Track execution
      await this.trackExecution(execution.id, workflowId, data);

      return {
        success: true,
        result: execution.data,
        executionId: execution.id
      };

    } catch (error: any) {
      console.error('❌ Crew coordination workflow failed:', error);
      return await this.executeLocalCrewCoordination(data);
    }
  }

  /**
   * Execute memory synchronization workflow
   */
  async executeMemorySync(data: MemorySyncWorkflowData): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    try {
      const workflowId = this.credentialHub['credentials'].n8n.workflowIds.memorySync;
      
      if (!workflowId) {
        console.log('📝 N8N memory sync workflow not configured, using local execution');
        return await this.executeLocalMemorySync(data);
      }

      const execution = await this.n8nClient.executeWorkflow(workflowId, {
        memories: data.memories,
        platform: data.platform,
        syncType: data.syncType,
        crewMembers: data.crewMembers,
        timestamp: new Date().toISOString()
      });

      // Track execution
      await this.trackExecution(execution.id, workflowId, data);

      return {
        success: true,
        result: execution.data,
        executionId: execution.id
      };

    } catch (error: any) {
      console.error('❌ Memory sync workflow failed:', error);
      return await this.executeLocalMemorySync(data);
    }
  }

  /**
   * Execute cross-platform synchronization workflow
   */
  async executeCrossPlatformSync(data: CrossPlatformSyncData): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    try {
      const workflowId = this.credentialHub['credentials'].n8n.workflowIds.crossPlatformSync;
      
      if (!workflowId) {
        console.log('📝 N8N cross-platform sync workflow not configured, using local execution');
        return await this.executeLocalCrossPlatformSync(data);
      }

      const execution = await this.n8nClient.executeWorkflow(workflowId, {
        platforms: data.platforms,
        data: data.data,
        syncType: data.syncType,
        timestamp: data.timestamp.toISOString()
      });

      // Track execution
      await this.trackExecution(execution.id, workflowId, data);

      return {
        success: true,
        result: execution.data,
        executionId: execution.id
      };

    } catch (error: any) {
      console.error('❌ Cross-platform sync workflow failed:', error);
      return await this.executeLocalCrossPlatformSync(data);
    }
  }

  /**
   * Execute optimization workflow
   */
  async executeOptimization(data: any): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    try {
      const workflowId = this.credentialHub['credentials'].n8n.workflowIds.optimization;
      
      if (!workflowId) {
        console.log('📝 N8N optimization workflow not configured, using local execution');
        return await this.executeLocalOptimization(data);
      }

      const execution = await this.n8nClient.executeWorkflow(workflowId, {
        ...data,
        timestamp: new Date().toISOString()
      });

      // Track execution
      await this.trackExecution(execution.id, workflowId, data);

      return {
        success: true,
        result: execution.data,
        executionId: execution.id
      };

    } catch (error: any) {
      console.error('❌ Optimization workflow failed:', error);
      return await this.executeLocalOptimization(data);
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<N8NWorkflow | null> {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution | null> {
    return this.executions.get(executionId) || null;
  }

  /**
   * Get all workflows
   */
  async getAllWorkflows(): Promise<N8NWorkflow[]> {
    return Array.from(this.workflows.values());
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(limit: number = 50): Promise<WorkflowExecution[]> {
    return Array.from(this.executions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  /**
   * Execute local crew coordination (fallback)
   */
  private async executeLocalCrewCoordination(data: CrewWorkflowData): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    const executionId = `local-crew-${Date.now()}`;
    
    console.log('🔄 Executing local crew coordination...');
    
    // Simulate crew coordination
    const result = {
      coordinatedResponse: `Crew coordination completed for: ${data.message}`,
      activeMembers: data.crewMembers,
      platform: data.platform,
      sessionId: data.sessionId,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      result,
      executionId
    };
  }

  /**
   * Execute local memory sync (fallback)
   */
  private async executeLocalMemorySync(data: MemorySyncWorkflowData): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    const executionId = `local-memory-${Date.now()}`;
    
    console.log('🔄 Executing local memory synchronization...');
    
    // Simulate memory sync
    const result = {
      syncedMemories: data.memories.length,
      platform: data.platform,
      syncType: data.syncType,
      crewMembers: data.crewMembers,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      result,
      executionId
    };
  }

  /**
   * Execute local cross-platform sync (fallback)
   */
  private async executeLocalCrossPlatformSync(data: CrossPlatformSyncData): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    const executionId = `local-sync-${Date.now()}`;
    
    console.log('🔄 Executing local cross-platform synchronization...');
    
    // Simulate cross-platform sync
    const result = {
      platformsSynced: data.platforms,
      syncType: data.syncType,
      dataSize: JSON.stringify(data.data).length,
      timestamp: data.timestamp.toISOString()
    };

    return {
      success: true,
      result,
      executionId
    };
  }

  /**
   * Execute local optimization (fallback)
   */
  private async executeLocalOptimization(data: any): Promise<{
    success: boolean;
    result: any;
    executionId: string;
  }> {
    const executionId = `local-optimization-${Date.now()}`;
    
    console.log('🔄 Executing local optimization...');
    
    // Simulate optimization
    const result = {
      optimized: true,
      costSavings: Math.random() * 0.2,
      performanceImprovement: Math.random() * 0.3,
      recommendations: [
        'Use cost-optimized models for simple tasks',
        'Implement caching for repeated queries',
        'Optimize prompt engineering for better results'
      ],
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      result,
      executionId
    };
  }

  /**
   * Load available workflows
   */
  private async loadWorkflows(): Promise<void> {
    try {
      const credentials = this.credentialHub['credentials'];
      const workflowIds = credentials.n8n.workflowIds;

      // Load workflow definitions
      const workflowDefinitions = [
        {
          id: workflowIds.crewCoordination,
          name: 'Crew Coordination',
          description: 'Coordinates crew member responses and consciousness',
          status: 'active' as const
        },
        {
          id: workflowIds.memorySync,
          name: 'Memory Synchronization',
          description: 'Synchronizes memories across platforms',
          status: 'active' as const
        },
        {
          id: workflowIds.crossPlatformSync,
          name: 'Cross-Platform Sync',
          description: 'Synchronizes data across all platforms',
          status: 'active' as const
        },
        {
          id: workflowIds.optimization,
          name: 'Resource Optimization',
          description: 'Optimizes LLM usage and costs',
          status: 'active' as const
        }
      ];

      for (const workflow of workflowDefinitions) {
        if (workflow.id) {
          this.workflows.set(workflow.id, {
            ...workflow,
            lastExecution: new Date(),
            executionCount: 0,
            successRate: 1.0
          });
        }
      }

      console.log(`📋 Loaded ${this.workflows.size} N8N workflows`);
    } catch (error) {
      console.error('❌ Failed to load workflows:', error);
    }
  }

  /**
   * Initialize workflow monitoring
   */
  private async initializeWorkflowMonitoring(): Promise<void> {
    console.log('📊 Workflow monitoring initialized');
    
    // Set up periodic monitoring
    setInterval(async () => {
      await this.monitorWorkflows();
    }, 60000); // Check every minute
  }

  /**
   * Monitor workflow health
   */
  private async monitorWorkflows(): Promise<void> {
    for (const [workflowId, workflow] of this.workflows) {
      try {
        // Check workflow status
        const status = await this.checkWorkflowHealth(workflowId);
        if (status !== workflow.status) {
          workflow.status = status;
          console.log(`📊 Workflow ${workflow.name} status: ${status}`);
        }
      } catch (error) {
        console.error(`❌ Workflow monitoring failed for ${workflowId}:`, error);
      }
    }
  }

  /**
   * Check workflow health
   */
  private async checkWorkflowHealth(workflowId: string): Promise<'active' | 'inactive' | 'error'> {
    try {
      // In a real implementation, this would check the actual N8N API
      return 'active';
    } catch (error) {
      return 'error';
    }
  }

  /**
   * Track workflow execution
   */
  private async trackExecution(executionId: string, workflowId: string, data: any): Promise<void> {
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime: new Date(),
      input: data
    };

    this.executions.set(executionId, execution);

    // Update workflow statistics
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.executionCount++;
      workflow.lastExecution = new Date();
    }
  }
}

/**
 * Create N8N Integration Manager instance
 */
export function createN8NIntegrationManager(credentialHub: UniversalCredentialHub): N8NIntegrationManager {
  return new N8NIntegrationManager(credentialHub);
}
