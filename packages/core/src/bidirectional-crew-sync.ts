/**
 * Bidirectional Crew Synchronization System
 * 
 * This module ensures crew member consistency across all Alex AI Universal platforms:
 * - Core System
 * - N8N Workflows
 * - IDE Integration
 * - Web Project Builder
 * - Cursor AI Integration
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  specialization: string[];
  status: 'active' | 'inactive' | 'maintenance';
  lastActivity: Date;
  capabilities: string[];
  platformCapabilities?: {
    ide?: string[];
    web?: string[];
    n8n?: string[];
    cursor?: string[];
  };
}

export interface CrewRegistry {
  version: string;
  lastUpdated: Date;
  checksum: string;
  members: CrewMember[];
  syncStatus: {
    core: boolean;
    n8n: boolean;
    ide: boolean;
    web: boolean;
    cursor: boolean;
  };
}

export interface SyncResult {
  success: boolean;
  platform: string;
  membersSynced: number;
  errors: string[];
  warnings: string[];
  timestamp: Date;
}

export class BidirectionalCrewSync {
  private registry: CrewRegistry;
  private registryPath: string;
  private syncCallbacks: Map<string, (members: CrewMember[]) => Promise<void>> = new Map();

  constructor(registryPath?: string) {
    this.registryPath = registryPath || path.join(__dirname, '../config/crew-registry.json');
    this.registry = this.initializeRegistry();
  }

  /**
   * Initialize crew registry with standard 9-member roster
   */
  private initializeRegistry(): CrewRegistry {
    const standardCrew: CrewMember[] = [
      {
        id: 'captain_picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Commander',
        specialization: ['Strategic Leadership', 'Mission Planning', 'Decision Making', 'Crew Management'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['strategic_planning', 'leadership', 'mission_coordination', 'decision_making', 'crew_management'],
        platformCapabilities: {
          ide: ['project-analysis', 'architecture-review', 'code-organization'],
          web: ['project-planning', 'architecture-design', 'scalability-planning'],
          n8n: ['workflow-strategy', 'automation-planning'],
          cursor: ['strategic-guidance', 'project-coordination']
        }
      },
      {
        id: 'commander_riker',
        name: 'Commander William Riker',
        role: 'First Officer',
        specialization: ['Tactical Operations', 'Workflow Management', 'Execution', 'Team Leadership', 'Resource Coordination'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['tactical_operations', 'workflow_management', 'execution', 'team_leadership', 'resource_coordination'],
        platformCapabilities: {
          ide: ['project-coordination', 'workflow-optimization', 'team-management'],
          web: ['project-coordination', 'workflow-optimization', 'team-management'],
          n8n: ['workflow-execution', 'task-coordination'],
          cursor: ['execution-guidance', 'workflow-coordination']
        }
      },
      {
        id: 'commander_data',
        name: 'Commander Data',
        role: 'Operations Officer',
        specialization: ['Analytics', 'Logic', 'Data Processing', 'AI/ML', 'MCP', 'Workflow Automation', 'Prompt Engineering', 'LLM Integration'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['data_analysis', 'ai_ml', 'mcp_integration', 'workflow_automation', 'prompt_engineering', 'llm_integration'],
        platformCapabilities: {
          ide: ['code-analysis', 'performance-profiling', 'data-structures'],
          web: ['performance-analysis', 'data-structures', 'algorithm-optimization'],
          n8n: ['data-processing', 'automation-logic'],
          cursor: ['analytical-guidance', 'data-insights']
        }
      },
      {
        id: 'geordi_la_forge',
        name: 'Lieutenant Commander Geordi La Forge',
        role: 'Chief Engineer',
        specialization: ['Infrastructure', 'System Integration', 'Technical Solutions', 'TypeScript', 'Node.js', 'MCP', 'API Design', 'System Architecture'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['infrastructure', 'system_integration', 'technical_solutions', 'typescript', 'nodejs', 'api_design', 'system_architecture'],
        platformCapabilities: {
          ide: ['build-systems', 'deployment-pipelines', 'infrastructure-as-code'],
          web: ['build-systems', 'deployment-pipelines', 'infrastructure-setup'],
          n8n: ['system-integration', 'technical-automation'],
          cursor: ['technical-solutions', 'architecture-guidance']
        }
      },
      {
        id: 'lieutenant_worf',
        name: 'Lieutenant Worf',
        role: 'Security Officer',
        specialization: ['Security Protocols', 'Threat Assessment', 'Compliance', 'Data Protection', 'Authentication', 'Authorization'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['security_protocols', 'threat_assessment', 'compliance', 'data_protection', 'authentication', 'authorization'],
        platformCapabilities: {
          ide: ['security-analysis', 'vulnerability-scanning', 'secure-coding'],
          web: ['web-security', 'authentication', 'data-protection'],
          n8n: ['security-automation', 'compliance-monitoring'],
          cursor: ['security-guidance', 'threat-assessment']
        }
      },
      {
        id: 'counselor_troi',
        name: 'Counselor Deanna Troi',
        role: 'Ship\'s Counselor',
        specialization: ['User Experience', 'Communication', 'Team Dynamics', 'Accessibility', 'User Research', 'Empathy'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['user_experience', 'communication', 'team_dynamics', 'accessibility', 'user_research', 'empathy'],
        platformCapabilities: {
          ide: ['ui-ux-analysis', 'accessibility-review', 'user-feedback'],
          web: ['ui-ux-design', 'accessibility', 'user-research'],
          n8n: ['user-workflow-optimization', 'experience-automation'],
          cursor: ['user-experience-guidance', 'communication-optimization']
        }
      },
      {
        id: 'dr_crusher',
        name: 'Dr. Beverly Crusher',
        role: 'Chief Medical Officer',
        specialization: ['System Health', 'Diagnostics', 'Wellness', 'Performance Monitoring', 'Health Analytics'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['system_health', 'diagnostics', 'wellness', 'performance_monitoring', 'health_analytics'],
        platformCapabilities: {
          ide: ['code-health-analysis', 'performance-diagnostics', 'system-wellness'],
          web: ['application-health', 'performance-diagnostics', 'system-wellness'],
          n8n: ['health-monitoring', 'diagnostic-automation'],
          cursor: ['health-guidance', 'wellness-monitoring']
        }
      },
      {
        id: 'lieutenant_uhura',
        name: 'Lieutenant Uhura',
        role: 'Communications Officer',
        specialization: ['Communication', 'Synchronization', 'Integration', 'API Management', 'Protocol Management'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['communication', 'synchronization', 'integration', 'api_management', 'protocol_management'],
        platformCapabilities: {
          ide: ['api-integration', 'communication-protocols', 'synchronization'],
          web: ['api-integration', 'communication-protocols', 'synchronization'],
          n8n: ['communication-automation', 'integration-workflows'],
          cursor: ['communication-guidance', 'integration-support']
        }
      },
      {
        id: 'quark',
        name: 'Quark',
        role: 'Business Operations',
        specialization: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics', 'Resource Management', 'ROI Analysis'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['cost_optimization', 'efficiency_analysis', 'business_metrics', 'resource_management', 'roi_analysis'],
        platformCapabilities: {
          ide: ['performance-metrics', 'resource-optimization', 'cost-analysis'],
          web: ['performance-metrics', 'cost-analysis', 'business-optimization'],
          n8n: ['business-automation', 'efficiency-workflows'],
          cursor: ['business-guidance', 'optimization-recommendations']
        }
      }
    ];

    return {
      version: '2.0.0',
      lastUpdated: new Date(),
      checksum: this.generateChecksum(standardCrew),
      members: standardCrew,
      syncStatus: {
        core: true,
        n8n: false,
        ide: false,
        web: false,
        cursor: false
      }
    };
  }

  /**
   * Register a platform for crew synchronization
   */
  public registerPlatform(platform: string, syncCallback: (members: CrewMember[]) => Promise<void>): void {
    this.syncCallbacks.set(platform, syncCallback);
    console.log(`🔄 Registered platform for crew sync: ${platform}`);
  }

  /**
   * Synchronize crew members across all registered platforms
   */
  public async syncAllPlatforms(): Promise<SyncResult[]> {
    console.log('🖖 Starting bidirectional crew synchronization...');
    const results: SyncResult[] = [];

    // Update registry checksum
    this.registry.checksum = this.generateChecksum(this.registry.members);
    this.registry.lastUpdated = new Date();

    // Sync each platform
    for (const [platform, callback] of this.syncCallbacks) {
      try {
        console.log(`🔄 Syncing ${platform}...`);
        await callback(this.registry.members);
        
        // Update sync status
        this.registry.syncStatus[platform as keyof typeof this.registry.syncStatus] = true;
        
        results.push({
          success: true,
          platform,
          membersSynced: this.registry.members.length,
          errors: [],
          warnings: [],
          timestamp: new Date()
        });

        console.log(`✅ ${platform} synced successfully (${this.registry.members.length} members)`);
      } catch (error) {
        console.error(`❌ Failed to sync ${platform}:`, error);
        
        this.registry.syncStatus[platform as keyof typeof this.registry.syncStatus] = false;
        
        results.push({
          success: false,
          platform,
          membersSynced: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          timestamp: new Date()
        });
      }
    }

    // Save updated registry
    await this.saveRegistry();

    console.log('🖖 Bidirectional crew synchronization complete');
    return results;
  }

  /**
   * Sync specific platform
   */
  public async syncPlatform(platform: string): Promise<SyncResult> {
    const callback = this.syncCallbacks.get(platform);
    if (!callback) {
      throw new Error(`Platform ${platform} not registered for crew sync`);
    }

    try {
      console.log(`🔄 Syncing ${platform}...`);
      await callback(this.registry.members);
      
      this.registry.syncStatus[platform as keyof typeof this.registry.syncStatus] = true;
      await this.saveRegistry();

      console.log(`✅ ${platform} synced successfully`);
      
      return {
        success: true,
        platform,
        membersSynced: this.registry.members.length,
        errors: [],
        warnings: [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ Failed to sync ${platform}:`, error);
      
      this.registry.syncStatus[platform as keyof typeof this.registry.syncStatus] = false;
      
      return {
        success: false,
        platform,
        membersSynced: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        timestamp: new Date()
      };
    }
  }

  /**
   * Get current crew registry
   */
  public getRegistry(): CrewRegistry {
    return { ...this.registry };
  }

  /**
   * Get crew members for specific platform
   */
  public getCrewForPlatform(platform: 'ide' | 'web' | 'n8n' | 'cursor'): CrewMember[] {
    return this.registry.members.map(member => ({
      ...member,
      capabilities: member.platformCapabilities?.[platform] || member.capabilities
    }));
  }

  /**
   * Validate crew member consistency
   */
  public validateConsistency(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check if all platforms are synced
    const unsyncedPlatforms = Object.entries(this.registry.syncStatus)
      .filter(([_, synced]) => !synced)
      .map(([platform, _]) => platform);

    if (unsyncedPlatforms.length > 0) {
      issues.push(`Unsynced platforms: ${unsyncedPlatforms.join(', ')}`);
    }

    // Check crew member count consistency
    if (this.registry.members.length !== 9) {
      issues.push(`Expected 9 crew members, found ${this.registry.members.length}`);
    }

    // Check for required crew members
    const requiredIds = [
      'captain_picard', 'commander_riker', 'commander_data', 'geordi_la_forge',
      'lieutenant_worf', 'counselor_troi', 'dr_crusher', 'lieutenant_uhura', 'quark'
    ];

    const missingIds = requiredIds.filter(id => 
      !this.registry.members.some(member => member.id === id)
    );

    if (missingIds.length > 0) {
      issues.push(`Missing required crew members: ${missingIds.join(', ')}`);
    }

    // Check for duplicate IDs
    const ids = this.registry.members.map(member => member.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      issues.push(`Duplicate crew member IDs: ${duplicates.join(', ')}`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate checksum for crew registry
   */
  private generateChecksum(members: CrewMember[]): string {
    const data = JSON.stringify(members.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      specialization: member.specialization.sort(),
      capabilities: member.capabilities.sort()
    })));

    // Simple checksum implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Save crew registry to file
   */
  private async saveRegistry(): Promise<void> {
    await fs.ensureDir(path.dirname(this.registryPath));
    await fs.writeJson(this.registryPath, this.registry, { spaces: 2 });
  }

  /**
   * Load crew registry from file
   */
  public async loadRegistry(): Promise<void> {
    try {
      if (await fs.pathExists(this.registryPath)) {
        this.registry = await fs.readJson(this.registryPath);
        console.log(`📋 Loaded crew registry from ${this.registryPath}`);
      } else {
        console.log('📋 No existing crew registry found, using default');
      }
    } catch (error) {
      console.error('❌ Failed to load crew registry:', error);
      console.log('📋 Using default crew registry');
    }
  }

  /**
   * Get sync status report
   */
  public getSyncStatusReport(): string {
    const validation = this.validateConsistency();
    const syncedPlatforms = Object.entries(this.registry.syncStatus)
      .filter(([_, synced]) => synced)
      .map(([platform, _]) => platform);

    return `
# 🖖 Alex AI Crew Synchronization Status

## 📊 Overview
- **Registry Version:** ${this.registry.version}
- **Last Updated:** ${this.registry.lastUpdated.toISOString()}
- **Crew Members:** ${this.registry.members.length}/9
- **Checksum:** ${this.registry.checksum}

## ✅ Synced Platforms
${syncedPlatforms.map(platform => `- ✅ ${platform}`).join('\n') || '- None'}

## ❌ Unsynced Platforms
${Object.entries(this.registry.syncStatus)
  .filter(([_, synced]) => !synced)
  .map(([platform, _]) => `- ❌ ${platform}`)
  .join('\n') || '- None'}

## 🔍 Validation Status
- **Consistency:** ${validation.isValid ? '✅ Valid' : '❌ Issues Found'}
${validation.issues.length > 0 ? `
### Issues:
${validation.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}
` : ''}

## 👥 Crew Members
${this.registry.members.map(member => `- **${member.name}** (${member.role}) - ${member.status}`).join('\n')}
    `.trim();
  }
}

// Export singleton instance
export const crewSync = new BidirectionalCrewSync();


