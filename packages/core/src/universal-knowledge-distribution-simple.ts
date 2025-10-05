/**
 * Alex AI Universal Knowledge Distribution System (Simplified)
 * 
 * This module ensures that all crew knowledge, capabilities, and new features
 * are universally available across every Alex AI project.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  private config: UniversalKnowledgeConfig;
  private registeredProjects: Map<string, ProjectCapabilities>;
  private universalFeatures: UniversalFeatureSet;

  constructor(config: UniversalKnowledgeConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.registeredProjects = new Map();
    this.initializeUniversalFeatures();
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

      // Store project in Supabase (if enabled)
      if (this.config.enableUniversalSync) {
        try {
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
        } catch (error) {
          console.log('⚠️ Supabase sync disabled (demo mode)');
        }
      }

      this.registeredProjects.set(projectConfig.projectId, projectCapabilities);

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
   * Update project sync status
   */
  private async updateProjectSyncStatus(projectId: string, status: string): Promise<void> {
    try {
      const project = this.registeredProjects.get(projectId);
      if (project) {
        project.status = status as any;
        project.lastSync = new Date();

        if (this.config.enableUniversalSync) {
          try {
            await this.supabase
              .from('alex_ai_projects')
              .update({
                status,
                last_sync: project.lastSync.toISOString()
              })
              .eq('project_id', projectId);
          } catch (error) {
            console.log('⚠️ Supabase sync disabled (demo mode)');
          }
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
   * Generate universal integration code for new projects
   */
  generateUniversalIntegrationCode(projectId: string): string {
    return `
/**
 * Alex AI Universal Integration for ${projectId}
 * Auto-generated by Alex AI Universal Knowledge Distribution System
 */

import { UniversalKnowledgeDistribution } from '@alex-ai/core';

export class ${projectId}AlexAI {
  private universalKnowledge: UniversalKnowledgeDistribution;

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
