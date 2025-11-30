/**
 * Alex AI Crew Manager - Crew Coordination and Management
 * 
 * This service manages Alex AI crew members and their interactions
 * with the N8N Federation Crew for all sub-projects.
 */

import { N8NCredentialsManager } from './n8n-credentials-manager'
import axios from 'axios'

export interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'inactive' | 'busy'
  lastActivity: Date
  capabilities: string[]
}

export interface CrewInteraction {
  id: string
  from: string
  to: string
  type: 'collaboration' | 'handoff' | 'consultation'
  data: any
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}

export interface CrewStatus {
  totalMembers: number
  activeMembers: number
  busyMembers: number
  lastUpdate: Date
  members: Record<string, CrewMember>
}

export class AlexAICrewManager {
  private credentialsManager: N8NCredentialsManager
  private crewMembers: Map<string, CrewMember> = new Map()
  private interactions: CrewInteraction[] = []

  constructor() {
    this.credentialsManager = new N8NCredentialsManager()
    this.initializeCrewMembers()
  }

  /**
   * Initialize crew members
   */
  private initializeCrewMembers(): void {
    const members: CrewMember[] = [
      {
        id: 'captain_picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Commanding Officer',
        specialization: ['Strategic Leadership', 'Mission Planning', 'Decision Making', 'Crew Management'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['strategic_planning', 'leadership', 'mission_coordination', 'decision_making', 'crew_management']
      },
      {
        id: 'commander_riker',
        name: 'Commander William Riker',
        role: 'First Officer',
        specialization: ['Tactical Operations', 'Workflow Management', 'Execution', 'Team Leadership', 'Resource Coordination'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['tactical_operations', 'workflow_management', 'execution', 'team_leadership', 'resource_coordination']
      },
      {
        id: 'commander_data',
        name: 'Commander Data',
        role: 'Operations Officer',
        specialization: ['Analytics', 'Logic', 'Data Processing', 'AI/ML', 'MCP', 'Workflow Automation', 'Prompt Engineering', 'LLM Integration'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['data_analysis', 'ai_ml', 'mcp_integration', 'workflow_automation', 'prompt_engineering', 'llm_integration']
      },
      {
        id: 'geordi_la_forge',
        name: 'Lieutenant Commander Geordi La Forge',
        role: 'Chief Engineer',
        specialization: ['Infrastructure', 'System Integration', 'Technical Solutions', 'TypeScript', 'Node.js', 'MCP', 'API Design', 'System Architecture'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['infrastructure', 'system_integration', 'technical_solutions', 'typescript', 'nodejs', 'api_design', 'system_architecture']
      },
      {
        id: 'lieutenant_worf',
        name: 'Lieutenant Worf',
        role: 'Security Officer',
        specialization: ['Security', 'Compliance', 'Risk Assessment', 'Testing', 'Quality Assurance'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['security', 'compliance', 'risk_assessment', 'testing', 'quality_assurance']
      },
      {
        id: 'counselor_troi',
        name: 'Counselor Deanna Troi',
        role: 'Ship\'s Counselor',
        specialization: ['User Experience', 'Empathy Analysis', 'Human Factors', 'Quality Assurance', 'Visual Debugging'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['user_experience', 'empathy_analysis', 'human_factors', 'quality_assurance', 'visual_debugging']
      },
      {
        id: 'lieutenant_uhura',
        name: 'Lieutenant Uhura',
        role: 'Communications Officer',
        specialization: ['Communications', 'I/O Operations', 'Information Flow', 'Documentation', 'Automation'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['communications', 'io_operations', 'information_flow', 'documentation', 'automation']
      },
      {
        id: 'dr_crusher',
        name: 'Dr. Beverly Crusher',
        role: 'Chief Medical Officer',
        specialization: ['Health', 'Diagnostics', 'System Optimization', 'Performance Optimization'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['health', 'diagnostics', 'system_optimization', 'performance_optimization']
      },
      {
        id: 'quark',
        name: 'Quark',
        role: 'Business Operations',
        specialization: ['Business Intelligence', 'Budget Optimization', 'ROI Analysis', 'Business Analysis'],
        status: 'active',
        lastActivity: new Date(),
        capabilities: ['business_intelligence', 'budget_optimization', 'roi_analysis', 'business_analysis']
      }
    ]

    members.forEach(member => {
      this.crewMembers.set(member.id, member)
    })
  }

  /**
   * Initialize the crew manager
   */
  async initialize(): Promise<void> {
    console.log('👥 Initializing Alex AI Crew Manager...')
    
    // Test connection to N8N Federation Crew
    const isConnected = await this.testFederationConnection()
    if (isConnected) {
      console.log('✅ Connected to N8N Federation Crew')
    } else {
      console.log('⚠️ N8N Federation Crew connection failed, using local crew')
    }

    console.log('✅ Alex AI Crew Manager initialized')
  }

  /**
   * Test connection to N8N Federation Crew
   */
  private async testFederationConnection(): Promise<boolean> {
    try {
      const credentials = await this.credentialsManager.getN8NCredentials()
      
      const response = await axios.post(
        `${credentials.baseUrl}/webhook/federation-mission`,
        {
          action: 'crew_status_check',
          timestamp: new Date().toISOString(),
          source: 'alex_ai_crew_manager'
        },
        {
          headers: {
            'X-N8N-API-KEY': credentials.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 5000
        }
      )

      return response.status === 200
    } catch (error) {
      return false
    }
  }

  /**
   * Get crew status
   */
  async getCrewStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {}
    
    for (const [id, member] of this.crewMembers) {
      status[id] = member.status === 'active'
    }

    return status
  }

  /**
   * Get all crew members
   */
  getCrewMembers(): CrewMember[] {
    return Array.from(this.crewMembers.values())
  }

  /**
   * Get crew member by ID
   */
  getCrewMember(id: string): CrewMember | null {
    return this.crewMembers.get(id) || null
  }

  /**
   * Update crew member status
   */
  updateCrewMemberStatus(id: string, status: 'active' | 'inactive' | 'busy'): void {
    const member = this.crewMembers.get(id)
    if (member) {
      member.status = status
      member.lastActivity = new Date()
    }
  }

  /**
   * Create crew interaction
   */
  createInteraction(interaction: Omit<CrewInteraction, 'id' | 'timestamp' | 'status'>): CrewInteraction {
    const newInteraction: CrewInteraction = {
      ...interaction,
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'pending'
    }

    this.interactions.push(newInteraction)
    return newInteraction
  }

  /**
   * Get crew interactions
   */
  getInteractions(): CrewInteraction[] {
    return [...this.interactions]
  }

  /**
   * Get interactions for a specific crew member
   */
  getInteractionsForMember(memberId: string): CrewInteraction[] {
    return this.interactions.filter(
      interaction => interaction.from === memberId || interaction.to === memberId
    )
  }

  /**
   * Coordinate with N8N Federation Crew
   */
  async coordinateWithFederation(action: string, data: any): Promise<any> {
    try {
      const credentials = await this.credentialsManager.getN8NCredentials()
      
      const response = await axios.post(
        `${credentials.baseUrl}/webhook/federation-mission`,
        {
          action: action,
          data: data,
          timestamp: new Date().toISOString(),
          source: 'alex_ai_crew_manager',
          crew_coordination: true
        },
        {
          headers: {
            'X-N8N-API-KEY': credentials.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      )

      return response.data
    } catch (error) {
      console.error('Federation coordination failed:', error)
      throw error
    }
  }

  /**
   * Assign task to crew member
   */
  async assignTask(memberId: string, task: any): Promise<CrewInteraction> {
    const member = this.crewMembers.get(memberId)
    if (!member) {
      throw new Error(`Crew member ${memberId} not found`)
    }

    if (member.status === 'busy') {
      throw new Error(`Crew member ${memberId} is currently busy`)
    }

    // Update member status
    this.updateCrewMemberStatus(memberId, 'busy')

    // Create interaction
    const interaction = this.createInteraction({
      from: 'system',
      to: memberId,
      type: 'handoff',
      data: task
    })

    // Coordinate with Federation Crew if needed
    try {
      await this.coordinateWithFederation('task_assignment', {
        member_id: memberId,
        task: task,
        interaction_id: interaction.id
      })
    } catch (error) {
      console.warn('Federation coordination failed, continuing with local assignment')
    }

    return interaction
  }

  /**
   * Complete task
   */
  async completeTask(interactionId: string, result: any): Promise<void> {
    const interaction = this.interactions.find(i => i.id === interactionId)
    if (!interaction) {
      throw new Error(`Interaction ${interactionId} not found`)
    }

    interaction.status = 'completed'
    interaction.data = { ...interaction.data, result }

    // Update crew member status
    this.updateCrewMemberStatus(interaction.to, 'active')

    // Notify Federation Crew
    try {
      await this.coordinateWithFederation('task_completion', {
        interaction_id: interactionId,
        result: result
      })
    } catch (error) {
      console.warn('Federation notification failed')
    }
  }

  /**
   * Get crew analytics
   */
  getCrewAnalytics(): CrewStatus {
    const members = Array.from(this.crewMembers.values())
    
    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      busyMembers: members.filter(m => m.status === 'busy').length,
      lastUpdate: new Date(),
      members: Object.fromEntries(this.crewMembers)
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.testFederationConnection()
    } catch (error) {
      return false
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.crewMembers.clear()
    this.interactions = []
    console.log('✅ Alex AI Crew Manager cleaned up')
  }
}
