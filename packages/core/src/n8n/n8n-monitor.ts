/**
 * N8N Server Relationship Monitoring
 * Monitors and manages the relationship between Alex AI and N8N server
 */

import axios, { AxiosInstance } from 'axios';

export interface N8NConnectionStatus {
  connected: boolean;
  url: string;
  version?: string;
  lastPing?: Date;
  responseTime?: number;
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  error?: string;
}

export interface N8NWorkflowStatus {
  id: string;
  name: string;
  active: boolean;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  crewMember: string;
  webhookUrl: string;
}

export interface N8NWebhookEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  crewMember: string;
  status: 'active' | 'inactive' | 'error';
  lastCalled?: Date;
  callCount: number;
}

export interface CrewMemberN8NStatus {
  crewMember: string;
  workflows: N8NWorkflowStatus[];
  webhooks: N8NWebhookEndpoint[];
  status: 'active' | 'inactive' | 'error';
  lastActivity?: Date;
  totalExecutions: number;
  successRate: number;
}

export class N8NMonitor {
  private n8nClient: AxiosInstance;
  private connectionStatus: N8NConnectionStatus;
  private workflowStatuses: Map<string, N8NWorkflowStatus> = new Map();
  private webhookEndpoints: Map<string, N8NWebhookEndpoint> = new Map();
  private crewMemberStatuses: Map<string, CrewMemberN8NStatus> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  constructor(n8nUrl: string, apiKey: string) {
    this.connectionStatus = {
      connected: false,
      url: n8nUrl,
      health: 'unknown'
    };

    this.n8nClient = axios.create({
      baseURL: n8nUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    this.initializeCrewMembers();
  }

  /**
   * Start monitoring N8N server relationship
   */
  async startMonitoring(intervalMs: number = 30000): Promise<void> {
    console.log('🌐 Starting N8N server monitoring...');

    if (this.isMonitoring) {
      console.log('⚠️  Monitoring already active');
      return;
    }

    // Initial connection check
    await this.checkConnection();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);

    this.isMonitoring = true;
    console.log(`✅ N8N monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 N8N monitoring stopped');
  }

  /**
   * Check N8N server connection
   */
  async checkConnection(): Promise<boolean> {
    console.log('🔗 Checking N8N server connection...');

    try {
      const startTime = Date.now();
      const response = await this.n8nClient.get('/healthz');
      const responseTime = Date.now() - startTime;

      this.connectionStatus = {
        connected: true,
        url: this.connectionStatus.url,
        version: response.data.version || 'unknown',
        lastPing: new Date(),
        responseTime,
        health: response.status === 200 ? 'healthy' : 'degraded'
      };

      console.log(`✅ N8N server connected (${responseTime}ms)`);
      return true;

    } catch (error: any) {
      this.connectionStatus = {
        connected: false,
        url: this.connectionStatus.url,
        lastPing: new Date(),
        health: 'unhealthy',
        error: error.message
      };

      console.log(`❌ N8N server connection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<void> {
    console.log('🏥 Performing N8N health check...');

    // Check connection
    await this.checkConnection();

    // Check workflows
    await this.checkWorkflowStatuses();

    // Check webhook endpoints
    await this.checkWebhookEndpoints();

    // Update crew member statuses
    this.updateCrewMemberStatuses();

    console.log('✅ Health check complete');
  }

  /**
   * Check workflow statuses
   */
  async checkWorkflowStatuses(): Promise<void> {
    try {
      const response = await this.n8nClient.get('/workflows');
      const workflows = response.data.data || [];

      for (const workflow of workflows) {
        const workflowStatus: N8NWorkflowStatus = {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active || false,
          lastExecuted: workflow.updatedAt ? new Date(workflow.updatedAt) : undefined,
          executionCount: workflow.executionCount || 0,
          successRate: this.calculateSuccessRate(workflow),
          averageExecutionTime: this.calculateAverageExecutionTime(workflow),
          crewMember: this.extractCrewMemberFromWorkflow(workflow),
          webhookUrl: this.extractWebhookUrl(workflow)
        };

        this.workflowStatuses.set(workflow.id, workflowStatus);
      }

      console.log(`📊 Updated ${workflows.length} workflow statuses`);

    } catch (error: any) {
      console.error('❌ Failed to check workflow statuses:', error.message);
    }
  }

  /**
   * Check webhook endpoints
   */
  async checkWebhookEndpoints(): Promise<void> {
    const crewWebhooks = [
      'picard-strategic-coordinator',
      'data-operations-analyst',
      'geordi-engineering',
      'worf-security',
      'troi-ux-empathy',
      'riker-execution',
      'crusher-health-maintenance',
      'la-forge-innovation',
      'spock-logic-analysis',
      'observation-lounge'
    ];

    for (const webhookPath of crewWebhooks) {
      try {
        const webhookUrl = `${this.connectionStatus.url}/webhook/${webhookPath}`;
        const startTime = Date.now();
        
        // Test webhook endpoint
        const response = await axios.get(webhookUrl, { timeout: 5000 });
        const responseTime = Date.now() - startTime;

        const webhookEndpoint: N8NWebhookEndpoint = {
          path: webhookPath,
          method: 'POST',
          crewMember: this.extractCrewMemberFromWebhook(webhookPath),
          status: response.status === 200 ? 'active' : 'inactive',
          lastCalled: new Date(),
          callCount: 0 // This would be tracked over time
        };

        this.webhookEndpoints.set(webhookPath, webhookEndpoint);
        console.log(`✅ Webhook ${webhookPath} is active (${responseTime}ms)`);

      } catch (error: any) {
        const webhookEndpoint: N8NWebhookEndpoint = {
          path: webhookPath,
          method: 'POST',
          crewMember: this.extractCrewMemberFromWebhook(webhookPath),
          status: 'error',
          lastCalled: new Date(),
          callCount: 0
        };

        this.webhookEndpoints.set(webhookPath, webhookEndpoint);
        console.log(`❌ Webhook ${webhookPath} is not responding: ${error.message}`);
      }
    }
  }

  /**
   * Update crew member statuses based on workflow and webhook data
   */
  private updateCrewMemberStatuses(): void {
    const crewMembers = [
      'captain_picard', 'commander_data', 'geordi_la_forge', 'lieutenant_worf',
      'counselor_troi', 'commander_riker', 'dr_crusher', 'la_forge', 'spock'
    ];

    for (const crewMember of crewMembers) {
      const workflows = Array.from(this.workflowStatuses.values())
        .filter(w => w.crewMember === crewMember);

      const webhooks = Array.from(this.webhookEndpoints.values())
        .filter(w => w.crewMember === crewMember);

      const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
      const successRate = workflows.length > 0 
        ? workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length 
        : 0;

      const status: CrewMemberN8NStatus = {
        crewMember,
        workflows,
        webhooks,
        status: this.determineCrewMemberStatus(workflows, webhooks),
        lastActivity: this.getLastActivity(workflows, webhooks),
        totalExecutions,
        successRate
      };

      this.crewMemberStatuses.set(crewMember, status);
    }
  }

  /**
   * Execute crew member workflow
   */
  async executeCrewWorkflow(crewMember: string, prompt: string, data?: any): Promise<any> {
    console.log(`🖖 Executing ${crewMember} workflow...`);

    const webhookEndpoint = Array.from(this.webhookEndpoints.values())
      .find(w => w.crewMember === crewMember);

    if (!webhookEndpoint || webhookEndpoint.status !== 'active') {
      throw new Error(`No active webhook found for ${crewMember}`);
    }

    try {
      const webhookUrl = `${this.connectionStatus.url}/webhook/${webhookEndpoint.path}`;
      const payload = {
        prompt,
        crewMember,
        sessionId: this.generateSessionId(),
        timestamp: new Date().toISOString(),
        ...data
      };

      const response = await axios.post(webhookUrl, payload, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update webhook call count
      webhookEndpoint.callCount++;
      webhookEndpoint.lastCalled = new Date();

      console.log(`✅ ${crewMember} workflow executed successfully`);
      return response.data;

    } catch (error: any) {
      console.error(`❌ ${crewMember} workflow execution failed:`, error.message);
      throw error;
    }
  }

  /**
   * Get comprehensive status report
   */
  getStatusReport(): {
    connection: N8NConnectionStatus;
    crewMembers: CrewMemberN8NStatus[];
    workflows: N8NWorkflowStatus[];
    webhooks: N8NWebhookEndpoint[];
    summary: {
      totalWorkflows: number;
      activeWorkflows: number;
      totalWebhooks: number;
      activeWebhooks: number;
      activeCrewMembers: number;
      overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    };
  } {
    const crewMembers = Array.from(this.crewMemberStatuses.values());
    const workflows = Array.from(this.workflowStatuses.values());
    const webhooks = Array.from(this.webhookEndpoints.values());

    const activeWorkflows = workflows.filter(w => w.active).length;
    const activeWebhooks = webhooks.filter(w => w.status === 'active').length;
    const activeCrewMembers = crewMembers.filter(c => c.status === 'active').length;

    const overallHealth = this.determineOverallHealth(
      this.connectionStatus,
      activeWorkflows,
      activeWebhooks,
      activeCrewMembers
    );

    return {
      connection: { ...this.connectionStatus },
      crewMembers,
      workflows,
      webhooks,
      summary: {
        totalWorkflows: workflows.length,
        activeWorkflows,
        totalWebhooks: webhooks.length,
        activeWebhooks,
        activeCrewMembers,
        overallHealth
      }
    };
  }

  // Helper methods
  private initializeCrewMembers(): void {
    const crewMembers = [
      'captain_picard', 'commander_data', 'geordi_la_forge', 'lieutenant_worf',
      'counselor_troi', 'commander_riker', 'dr_crusher', 'la_forge', 'spock'
    ];

    crewMembers.forEach(crewMember => {
      this.crewMemberStatuses.set(crewMember, {
        crewMember,
        workflows: [],
        webhooks: [],
        status: 'inactive',
        totalExecutions: 0,
        successRate: 0
      });
    });
  }

  private calculateSuccessRate(workflow: any): number {
    // Simplified success rate calculation
    return workflow.successCount && workflow.executionCount 
      ? (workflow.successCount / workflow.executionCount) * 100 
      : 95; // Default optimistic rate
  }

  private calculateAverageExecutionTime(workflow: any): number {
    // Simplified execution time calculation
    return workflow.averageExecutionTime || 1500; // Default 1.5 seconds
  }

  private extractCrewMemberFromWorkflow(workflow: any): string {
    // Extract crew member from workflow name or metadata
    const name = workflow.name?.toLowerCase() || '';
    if (name.includes('picard')) return 'captain_picard';
    if (name.includes('data')) return 'commander_data';
    if (name.includes('geordi')) return 'geordi_la_forge';
    if (name.includes('worf')) return 'lieutenant_worf';
    if (name.includes('troi')) return 'counselor_troi';
    if (name.includes('riker')) return 'commander_riker';
    if (name.includes('crusher')) return 'dr_crusher';
    if (name.includes('la-forge')) return 'la_forge';
    if (name.includes('spock')) return 'spock';
    return 'unknown';
  }

  private extractWebhookUrl(workflow: any): string {
    // Extract webhook URL from workflow nodes
    return workflow.webhookUrl || 'unknown';
  }

  private extractCrewMemberFromWebhook(webhookPath: string): string {
    const mapping: { [key: string]: string } = {
      'picard-strategic-coordinator': 'captain_picard',
      'data-operations-analyst': 'commander_data',
      'geordi-engineering': 'geordi_la_forge',
      'worf-security': 'lieutenant_worf',
      'troi-ux-empathy': 'counselor_troi',
      'riker-execution': 'commander_riker',
      'crusher-health-maintenance': 'dr_crusher',
      'la-forge-innovation': 'la_forge',
      'spock-logic-analysis': 'spock',
      'observation-lounge': 'observation_lounge'
    };

    return mapping[webhookPath] || 'unknown';
  }

  private determineCrewMemberStatus(workflows: N8NWorkflowStatus[], webhooks: N8NWebhookEndpoint[]): 'active' | 'inactive' | 'error' {
    const hasActiveWorkflows = workflows.some(w => w.active);
    const hasActiveWebhooks = webhooks.some(w => w.status === 'active');
    
    if (hasActiveWorkflows && hasActiveWebhooks) return 'active';
    if (workflows.length === 0 && webhooks.length === 0) return 'inactive';
    return 'error';
  }

  private getLastActivity(workflows: N8NWorkflowStatus[], webhooks: N8NWebhookEndpoint[]): Date | undefined {
    const workflowDates = workflows.map(w => w.lastExecuted).filter(Boolean) as Date[];
    const webhookDates = webhooks.map(w => w.lastCalled).filter(Boolean) as Date[];
    
    const allDates = [...workflowDates, ...webhookDates];
    return allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : undefined;
  }

  private determineOverallHealth(
    connection: N8NConnectionStatus,
    activeWorkflows: number,
    activeWebhooks: number,
    activeCrewMembers: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (!connection.connected || connection.health === 'unhealthy') return 'unhealthy';
    if (connection.health === 'degraded' || activeCrewMembers < 7) return 'degraded';
    return 'healthy';
  }

  private generateSessionId(): string {
    return `n8n-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  getConnectionStatus(): N8NConnectionStatus {
    return { ...this.connectionStatus };
  }

  getCrewMemberStatus(crewMember: string): CrewMemberN8NStatus | undefined {
    return this.crewMemberStatuses.get(crewMember);
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}
