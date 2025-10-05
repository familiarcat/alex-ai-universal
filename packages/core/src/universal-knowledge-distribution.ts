/**
 * Alex AI Universal Knowledge Distribution System
 * 
 * This module ensures that all crew knowledge, capabilities, and new features
 * are universally available across every Alex AI project.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BidirectionalRAGIntegration } from '@alex-ai/messages-intelligence';
import { CrewMultimodalAnalysis } from '@alex-ai/messages-intelligence';
import { EnhancedMonitoringDashboard } from '@alex-ai/messages-intelligence';

export interface UniversalKnowledgeConfig {
  supabaseUrl: string;
  supabaseKey: string;
  n8nWebhookUrl: string;
  n8nApiKey?: string;
  enableUniversalSync: boolean;
  enableCrewKnowledgeSharing: boolean;
  enableN8NIntegration: boolean;
  enableChatCapturing: boolean;
}

export interface ProjectCapabilities {
  projectId: string;
  projectName: string;
  capabilities: string[];
  crewMembers: string[];
  n8nIntegration: boolean;
  chatCapturing: boolean;
  ragIntegration: boolean;
  monitoringDashboard: boolean;
  lastSync: Date;
  status: 'active' | 'inactive' | 'syncing' | 'error';
}

export interface UniversalFeatureSet {
  chatCapturing: {
    enabled: boolean;
    version: string;
    capabilities: string[];
  };
  n8nIntegration: {
    enabled: boolean;
    version: string;
    workflows: string[];
  };
  crewAI: {
    enabled: boolean;
    members: string[];
    knowledgeBase: string[];
  };
  ragSystem: {
    enabled: boolean;
    memoryCount: number;
    lastSync: Date;
  };
  monitoring: {
    enabled: boolean;
    dashboard: string;
    metrics: any;
  };
}

export class UniversalKnowledgeDistribution {
  private supabase: SupabaseClient;
  private ragIntegration: BidirectionalRAGIntegration;
  private crewAnalysis: CrewMultimodalAnalysis;
  private dashboard: EnhancedMonitoringDashboard;
  private config: UniversalKnowledgeConfig;
  private registeredProjects: Map<string, ProjectCapabilities>;
  private universalFeatures: UniversalFeatureSet = {} as UniversalFeatureSet;

  constructor(config: UniversalKnowledgeConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.registeredProjects = new Map();
    this.initializeUniversalFeatures();
    this.initializeCoreSystems();
  }

  /**
   * Initialize universal feature set
   */
  private initializeUniversalFeatures(): void {
    this.universalFeatures = {
      chatCapturing: {
        enabled: true,
        version: '1.0.0',
        capabilities: [
          'apple-messages-export',
          'conversation-analysis',
          'natural-language-interface',
          'crew-integration',
          'security-protocols'
        ]
      },
      n8nIntegration: {
        enabled: true,
        version: '1.0.0',
        workflows: [
          'automated-conversation-analysis',
          'crew-analysis-request',
          'bidirectional-rag-sync',
          'monitoring-dashboard-updates'
        ]
      },
      crewAI: {
        enabled: true,
        members: [
          'Captain Picard',
          'Commander Data',
          'Commander La Forge',
          'Lieutenant Commander Worf',
          'Counselor Troi',
          'Quark'
        ],
        knowledgeBase: [
          'strategic-planning',
          'technical-architecture',
          'engineering-optimization',
          'security-protocols',
          'user-experience-design',
          'cost-efficiency-analysis'
        ]
      },
      ragSystem: {
        enabled: true,
        memoryCount: 0,
        lastSync: new Date()
      },
      monitoring: {
        enabled: true,
        dashboard: 'n8n.pbradygeorgen.com/dashboard',
        metrics: {}
      }
    };

    console.log('🖖 Alex AI Universal Features Initialized');
  }

  /**
   * Initialize core systems
   */
  private async initializeCoreSystems(): Promise<void> {
    try {
      console.log('🚀 Initializing Alex AI Universal Core Systems...');

      // Initialize RAG integration
      this.ragIntegration = new BidirectionalRAGIntegration({
        supabaseUrl: this.config.supabaseUrl,
        supabaseKey: this.config.supabaseKey,
        n8nWebhookUrl: this.config.n8nWebhookUrl,
        n8nApiKey: this.config.n8nApiKey,
        projectId: 'alex-ai-universal',
        workspaceId: 'universal-workspace',
        enableMemorySync: this.config.enableUniversalSync,
        enableWorkflowSync: this.config.enableN8NIntegration,
        enableRealTimeSync: true
      });

      // Initialize crew analysis
      this.crewAnalysis = new CrewMultimodalAnalysis(this.ragIntegration);

      // Initialize monitoring dashboard
      this.dashboard = new EnhancedMonitoringDashboard(
        this.ragIntegration,
        this.crewAnalysis,
        {
          n8nBaseUrl: this.config.n8nWebhookUrl,
          dashboardUrl: 'n8n.pbradygeorgen.com/dashboard',
          apiKey: this.config.n8nApiKey || '',
          refreshInterval: 5000,
          enableRealTimeUpdates: true,
          enableCrewAI: this.config.enableCrewKnowledgeSharing,
          enableWorkflowSync: this.config.enableN8NIntegration
        }
      );

      console.log('✅ Alex AI Universal Core Systems Ready');
    } catch (error) {
      console.error('❌ Failed to initialize core systems:', error);
    }
  }

  /**
   * Register a new Alex AI project with universal capabilities
   */
  async registerProject(projectConfig: {
    projectId: string;
    projectName: string;
    capabilities?: string[];
  }): Promise<ProjectCapabilities> {
    try {
      console.log(`🖖 Registering new Alex AI project: ${projectConfig.projectName}`);

      const projectCapabilities: ProjectCapabilities = {
        projectId: projectConfig.projectId,
        projectName: projectConfig.projectName,
        capabilities: projectConfig.capabilities || this.getUniversalCapabilities(),
        crewMembers: this.universalFeatures.crewAI.members,
        n8nIntegration: this.universalFeatures.n8nIntegration.enabled,
        chatCapturing: this.universalFeatures.chatCapturing.enabled,
        ragIntegration: this.universalFeatures.ragSystem.enabled,
        monitoringDashboard: this.universalFeatures.monitoring.enabled,
        lastSync: new Date(),
        status: 'active'
      };

      // Store project in Supabase
      if (this.config.enableUniversalSync) {
        await this.supabase
          .from('alex_ai_projects')
          .upsert([{
            project_id: projectConfig.projectId,
            project_name: projectConfig.projectName,
            capabilities: projectCapabilities.capabilities,
            crew_members: projectCapabilities.crewMembers,
            n8n_integration: projectCapabilities.n8nIntegration,
            chat_capturing: projectCapabilities.chatCapturing,
            rag_integration: projectCapabilities.ragIntegration,
            monitoring_dashboard: projectCapabilities.monitoringDashboard,
            last_sync: projectCapabilities.lastSync.toISOString(),
            status: projectCapabilities.status
          }]);
      }

      this.registeredProjects.set(projectConfig.projectId, projectCapabilities);

      // Store project registration as constructive memory
      await this.ragIntegration.storeConstructiveMemory(
        `project-registration-${projectConfig.projectId}`,
        {
          keyInsights: [`New Alex AI project registered: ${projectConfig.projectName}`],
          confidence: 1.0,
          crewMember: 'Captain Picard'
        },
        'Captain Picard'
      );

      console.log(`✅ Project registered with universal capabilities: ${projectConfig.projectName}`);
      return projectCapabilities;

    } catch (error) {
      console.error(`❌ Failed to register project ${projectConfig.projectName}:`, error);
      throw error;
    }
  }

  /**
   * Get universal capabilities available to all projects
   */
  private getUniversalCapabilities(): string[] {
    return [
      ...this.universalFeatures.chatCapturing.capabilities,
      'universal-rag-integration',
      'crew-ai-analysis',
      'n8n-workflow-sync',
      'monitoring-dashboard',
      'security-protocols',
      'knowledge-synchronization'
    ];
  }

  /**
   * Synchronize crew knowledge across all projects
   */
  async synchronizeCrewKnowledge(): Promise<void> {
    try {
      console.log('🔄 Synchronizing crew knowledge across all Alex AI projects...');

      // Get all registered projects
      const projects = Array.from(this.registeredProjects.values());
      
      for (const project of projects) {
        if (project.status === 'active') {
          console.log(`📡 Syncing crew knowledge to project: ${project.projectName}`);
          
          // Sync crew analysis capabilities
          await this.syncCrewCapabilities(project.projectId);
          
          // Sync N8N workflows
          if (project.n8nIntegration) {
            await this.syncN8NWorkflows(project.projectId);
          }
          
          // Sync monitoring dashboard
          if (project.monitoringDashboard) {
            await this.syncMonitoringDashboard(project.projectId);
          }
          
          // Update project sync status
          project.lastSync = new Date();
          await this.updateProjectSyncStatus(project.projectId, 'synced');
        }
      }

      console.log('✅ Crew knowledge synchronized across all projects');
    } catch (error) {
      console.error('❌ Failed to synchronize crew knowledge:', error);
    }
  }

  /**
   * Sync crew capabilities to a specific project
   */
  private async syncCrewCapabilities(projectId: string): Promise<void> {
    try {
      // Get crew analysis for this project
      const crewResults = await this.crewAnalysis.engageCrewForRAGIntegration();
      
      // Store crew knowledge as constructive memory for this project
      for (const result of crewResults) {
        await this.ragIntegration.storeConstructiveMemory(
          `crew-knowledge-${projectId}`,
          {
            keyInsights: result.recommendations,
            confidence: result.confidence,
            crewMember: result.crewMember
          },
          result.crewMember
        );
      }

      console.log(`✅ Crew capabilities synced to project: ${projectId}`);
    } catch (error) {
      console.error(`❌ Failed to sync crew capabilities to ${projectId}:`, error);
    }
  }

  /**
   * Sync N8N workflows to a specific project
   */
  private async syncN8NWorkflows(projectId: string): Promise<void> {
    try {
      // Sync universal N8N workflows
      const universalWorkflows = [
        {
          id: `universal-conversation-analysis-${projectId}`,
          name: 'Universal Conversation Analysis',
          version: '1.0.0',
          nodes: [
            {
              id: 'webhook',
              name: 'Alex AI Webhook',
              type: 'n8n-nodes-base.webhook',
              position: [100, 100],
              parameters: {
                path: `alex-ai-${projectId}`,
                httpMethod: 'POST'
              }
            },
            {
              id: 'crew-analysis',
              name: 'Crew AI Analysis',
              type: 'n8n-nodes-base.httpRequest',
              position: [300, 100],
              parameters: {
                url: `${this.config.n8nWebhookUrl}/crew-analysis`,
                method: 'POST'
              }
            }
          ],
          connections: {
            webhook: {
              main: [{ node: 'crew-analysis', type: 'main', index: 0 }]
            }
          },
          settings: { executionOrder: 'v1' },
          lastModified: new Date(),
          workspaceId: projectId
        }
      ];

      // Sync each workflow
      for (const workflow of universalWorkflows) {
        await this.ragIntegration.syncN8NWorkflow(workflow);
      }

      console.log(`✅ N8N workflows synced to project: ${projectId}`);
    } catch (error) {
      console.error(`❌ Failed to sync N8N workflows to ${projectId}:`, error);
    }
  }

  /**
   * Sync monitoring dashboard to a specific project
   */
  private async syncMonitoringDashboard(projectId: string): Promise<void> {
    try {
      // Create project-specific dashboard configuration
      const dashboardConfig = {
        projectId,
        dashboardUrl: `n8n.pbradygeorgen.com/dashboard/${projectId}`,
        widgets: [
          {
            id: `project-status-${projectId}`,
            title: `${projectId} Project Status`,
            type: 'status',
            data: { status: 'active', lastSync: new Date() }
          },
          {
            id: `crew-ai-${projectId}`,
            title: `Crew AI - ${projectId}`,
            type: 'crew',
            data: { members: this.universalFeatures.crewAI.members }
          }
        ]
      };

      // Update dashboard with project-specific widgets
      this.dashboard.createCustomWidget({
        id: `project-${projectId}`,
        title: `${projectId} Project Dashboard`,
        type: 'metric',
        data: dashboardConfig,
        position: { x: 0, y: 0, width: 6, height: 4 }
      });

      console.log(`✅ Monitoring dashboard synced to project: ${projectId}`);
    } catch (error) {
      console.error(`❌ Failed to sync monitoring dashboard to ${projectId}:`, error);
    }
  }

  /**
   * Update project sync status
   */
  private async updateProjectSyncStatus(projectId: string, status: string): Promise<void> {
    try {
      const project = this.registeredProjects.get(projectId);
      if (project) {
        project.status = status as any;
        project.lastSync = new Date();

        if (this.config.enableUniversalSync) {
          await this.supabase
            .from('alex_ai_projects')
            .update({
              status,
              last_sync: project.lastSync.toISOString()
            })
            .eq('project_id', projectId);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to update project sync status for ${projectId}:`, error);
    }
  }

  /**
   * Get all registered projects
   */
  getAllProjects(): ProjectCapabilities[] {
    return Array.from(this.registeredProjects.values());
  }

  /**
   * Get universal feature set
   */
  getUniversalFeatures(): UniversalFeatureSet {
    return this.universalFeatures;
  }

  /**
   * Get project capabilities
   */
  getProjectCapabilities(projectId: string): ProjectCapabilities | undefined {
    return this.registeredProjects.get(projectId);
  }

  /**
   * Check if a project has universal capabilities
   */
  hasUniversalCapabilities(projectId: string): boolean {
    const project = this.registeredProjects.get(projectId);
    return project ? project.status === 'active' : false;
  }

  /**
   * Create project template with universal Alex AI capabilities
   */
  createProjectTemplate(templateName: string, customCapabilities?: string[]): any {
    return {
      templateName,
      version: '1.0.0',
      description: `Alex AI Universal Project Template - ${templateName}`,
      universalFeatures: this.universalFeatures,
      capabilities: customCapabilities || this.getUniversalCapabilities(),
      crewMembers: this.universalFeatures.crewAI.members,
      setupInstructions: [
        '1. Initialize Alex AI Universal Knowledge Distribution',
        '2. Register project with universal capabilities',
        '3. Configure N8N integration',
        '4. Enable chat capturing features',
        '5. Set up monitoring dashboard',
        '6. Synchronize crew knowledge'
      ],
      dependencies: {
        '@alex-ai/core': '^1.0.0',
        '@alex-ai/messages-intelligence': '^1.0.0',
        '@supabase/supabase-js': '^2.58.0'
      },
      scripts: {
        'alex-ai:init': 'alex-ai universal-init',
        'alex-ai:sync': 'alex-ai universal-sync',
        'alex-ai:monitor': 'alex-ai universal-monitor'
      }
    };
  }

  /**
   * Generate universal integration code for new projects
   */
  generateUniversalIntegrationCode(projectId: string): string {
    return `
/**
 * Alex AI Universal Integration for ${projectId}
 * Auto-generated by Alex AI Universal Knowledge Distribution System
 */

import { UniversalKnowledgeDistribution } from '@alex-ai/core';
import { BidirectionalRAGIntegration } from '@alex-ai/messages-intelligence';
import { CrewMultimodalAnalysis } from '@alex-ai/messages-intelligence';

export class ${projectId}AlexAI {
  private universalKnowledge: UniversalKnowledgeDistribution;
  private ragIntegration: BidirectionalRAGIntegration;
  private crewAnalysis: CrewMultimodalAnalysis;

  constructor(config: any) {
    // Initialize universal knowledge distribution
    this.universalKnowledge = new UniversalKnowledgeDistribution({
      supabaseUrl: config.supabaseUrl,
      supabaseKey: config.supabaseKey,
      n8nWebhookUrl: config.n8nWebhookUrl,
      n8nApiKey: config.n8nApiKey,
      enableUniversalSync: true,
      enableCrewKnowledgeSharing: true,
      enableN8NIntegration: true,
      enableChatCapturing: true
    });

    // Register this project with universal capabilities
    this.initializeProject(config);
  }

  async initializeProject(config: any) {
    await this.universalKnowledge.registerProject({
      projectId: '${projectId}',
      projectName: config.projectName || '${projectId}',
      capabilities: config.capabilities
    });

    console.log('🖖 ${projectId} registered with Alex AI Universal capabilities');
  }

  // Universal chat capturing capabilities
  async captureConversation(conversationData: any) {
    // Implementation will use universal chat capturing features
    console.log('📱 Capturing conversation with Alex AI universal features');
  }

  // Universal N8N integration capabilities
  async syncWithN8N(workflowData: any) {
    // Implementation will use universal N8N integration
    console.log('⚙️ Syncing with N8N using universal integration');
  }

  // Universal crew AI capabilities
  async engageCrew(analysisRequest: any) {
    // Implementation will use universal crew AI features
    console.log('👥 Engaging Alex AI crew with universal capabilities');
  }

  // Universal monitoring capabilities
  async getMonitoringData() {
    // Implementation will use universal monitoring features
    console.log('📊 Getting monitoring data with universal dashboard');
  }
}

// Auto-export for easy integration
export default ${projectId}AlexAI;
`;
  }
}
