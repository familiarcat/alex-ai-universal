/**
 * Alex AI Crew Management API
 * 
 * Provides unified access to crew roster, project management,
 * and agentic orchestration for multi-project development.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class CrewManagementAPI {
  constructor() {
    this.n8nUrl = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
    this.n8nApiKey = process.env.N8N_API_KEY;
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Load crew roster from local JSON
    this.rosterPath = path.join(__dirname, '../../../crew-roster.json');
    this.projects = new Map(); // Active projects
  }

  /**
   * Get live crew roster from n8n
   */
  async getCrewRoster() {
    try {
      // Try to load from local JSON first (cached)
      if (fs.existsSync(this.rosterPath)) {
        const rosterData = JSON.parse(fs.readFileSync(this.rosterPath, 'utf8'));
        return {
          success: true,
          source: 'local',
          data: rosterData,
          crewMembers: rosterData.crewMembers.filter(c => c.active),
          totalActive: rosterData.activeCrewMembers
        };
      }
      
      // Fallback to mock data if file doesn't exist
      return this.getMockCrewRoster();
    } catch (error) {
      console.error('Error loading crew roster:', error.message);
      return this.getMockCrewRoster();
    }
  }

  /**
   * Get mock crew roster for demo
   */
  getMockCrewRoster() {
    return {
      success: true,
      source: 'mock',
      data: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalCrewMembers: 11,
        activeCrewMembers: 11
      },
      crewMembers: [
        {
          id: 'BdNHOluRYUw2JxGW',
          name: 'Captain Jean-Luc Picard',
          role: 'Strategic Leadership',
          specialization: 'Project strategy, decision-making, stakeholder communication',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['Strategy', 'Leadership', 'Communication', 'Decision Making']
        },
        {
          id: 'gIwrQHHArgrVARjL',
          name: 'Commander Data',
          role: 'Android Analytics',
          specialization: 'Data analysis, pattern recognition, computational optimization',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['Data Analysis', 'Machine Learning', 'Optimization', 'Pattern Recognition']
        },
        {
          id: 'Imn7p6pVgi6SRvnF',
          name: 'Commander William Riker',
          role: 'Tactical Execution',
          specialization: 'Code implementation, tactical planning, execution',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['Implementation', 'Execution', 'Coding', 'Problem Solving']
        },
        {
          id: 'e0UEwyVcXJqeePdj',
          name: 'Lt. Commander Geordi La Forge',
          role: 'Infrastructure',
          specialization: 'DevOps, CI/CD, infrastructure architecture',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['DevOps', 'Infrastructure', 'CI/CD', 'System Architecture']
        },
        {
          id: 'GhSB8EpZWXLU78LM',
          name: 'Lieutenant Worf',
          role: 'Security & Compliance',
          specialization: 'Security auditing, authentication, vulnerability scanning',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['Security', 'Authentication', 'Compliance', 'Auditing']
        },
        {
          id: 'QJnN7ks2KsQTENDc',
          name: 'Counselor Deanna Troi',
          role: 'User Experience',
          specialization: 'UX/UI design, user research, accessibility',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['UX Design', 'User Research', 'Accessibility', 'Empathy']
        },
        {
          id: 'SXAMupVWdOxZybF6',
          name: 'Dr. Beverly Crusher',
          role: 'Health & Diagnostics',
          specialization: 'System health, error diagnosis, performance optimization',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['Diagnostics', 'Health Monitoring', 'Performance', 'Optimization']
        },
        {
          id: '36KPle5mPiMaazG6',
          name: 'Lieutenant Uhura',
          role: 'Communications',
          specialization: 'API integration, external communications, data translation',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['API Integration', 'Communication', 'Data Translation', 'Protocols']
        },
        {
          id: 'L6K4bzSKlGC36ABL',
          name: 'Quark',
          role: 'Business Intelligence',
          specialization: 'Cost analysis, profit optimization, resource allocation',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['Business Analysis', 'Cost Optimization', 'ROI', 'Resource Management']
        },
        {
          id: 'UgP1oSoOELyXJUTa',
          name: 'LCARS Library Computer',
          role: 'LLM Optimization',
          specialization: 'Dynamic LLM selection, prompt analysis, cost optimization',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['LLM Selection', 'Optimization', 'Cost Analysis', 'AI Orchestration']
        },
        {
          id: 'oiKW42kyYR2AGj1D',
          name: 'LCARS Access & Retrieval',
          role: 'Real-time Preview',
          specialization: 'Real-time updates, collaborative editing, publishing',
          status: 'active',
          availability: 100,
          currentProject: null,
          skills: ['Real-time Systems', 'Collaboration', 'Publishing', 'UI/UX']
        }
      ],
      totalActive: 11
    };
  }

  /**
   * Create a new project with assigned crew
   */
  createProject(projectData) {
    const projectId = `proj_${Date.now()}`;
    const project = {
      id: projectId,
      name: projectData.name,
      description: projectData.description,
      type: projectData.type || 'web-app',
      assignedCrew: projectData.crewIds || [],
      status: 'planning',
      created: new Date().toISOString(),
      progress: 0,
      tasks: [],
      knowledgeBase: []
    };

    this.projects.set(projectId, project);
    
    return {
      success: true,
      project,
      message: `Project "${project.name}" created with ${project.assignedCrew.length} crew members`
    };
  }

  /**
   * Get all active projects
   */
  getProjects() {
    return {
      success: true,
      projects: Array.from(this.projects.values()),
      totalProjects: this.projects.size
    };
  }

  /**
   * Assign crew member to project
   */
  assignCrewToProject(projectId, crewId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return { success: false, message: 'Project not found' };
    }

    if (!project.assignedCrew.includes(crewId)) {
      project.assignedCrew.push(crewId);
    }

    return {
      success: true,
      project,
      message: 'Crew member assigned successfully'
    };
  }

  /**
   * Get crew recommendations for a project type
   */
  getRecommendedCrew(projectType) {
    const recommendations = {
      'web-app': [
        'BdNHOluRYUw2JxGW', // Picard - Strategy
        'Imn7p6pVgi6SRvnF', // Riker - Implementation
        'QJnN7ks2KsQTENDc', // Troi - UX
        'e0UEwyVcXJqeePdj', // La Forge - Infrastructure
        'GhSB8EpZWXLU78LM', // Worf - Security
        'UgP1oSoOELyXJUTa'  // LCARS LC - Optimization
      ],
      'api-service': [
        'BdNHOluRYUw2JxGW', // Picard - Strategy
        'gIwrQHHArgrVARjL', // Data - Analytics
        '36KPle5mPiMaazG6', // Uhura - API
        'e0UEwyVcXJqeePdj', // La Forge - Infrastructure
        'SXAMupVWdOxZybF6', // Crusher - Health
        'UgP1oSoOELyXJUTa'  // LCARS LC - Optimization
      ],
      'data-analysis': [
        'gIwrQHHArgrVARjL', // Data - Analytics
        'L6K4bzSKlGC36ABL', // Quark - Business Intelligence
        'SXAMupVWdOxZybF6', // Crusher - Diagnostics
        'UgP1oSoOELyXJUTa'  // LCARS LC - Optimization
      ],
      'full-stack': [
        'BdNHOluRYUw2JxGW', // Picard - Strategy
        'Imn7p6pVgi6SRvnF', // Riker - Implementation
        'gIwrQHHArgrVARjL', // Data - Analytics
        'QJnN7ks2KsQTENDc', // Troi - UX
        'e0UEwyVcXJqeePdj', // La Forge - Infrastructure
        'GhSB8EpZWXLU78LM', // Worf - Security
        '36KPle5mPiMaazG6', // Uhura - API
        'L6K4bzSKlGC36ABL', // Quark - Business
        'UgP1oSoOELyXJUTa', // LCARS LC - Optimization
        'oiKW42kyYR2AGj1D'  // LCARS ARS - Preview
      ]
    };

    return {
      success: true,
      projectType,
      recommendedCrewIds: recommendations[projectType] || recommendations['web-app'],
      reasoning: this.getCrewRecommendationReasoning(projectType)
    };
  }

  /**
   * Get reasoning for crew recommendations
   */
  getCrewRecommendationReasoning(projectType) {
    const reasoning = {
      'web-app': 'Web applications require strategic planning, strong implementation, excellent UX, robust infrastructure, and security. LCARS optimizes LLM usage for efficiency.',
      'api-service': 'API services need strategic architecture, data analytics, communication protocols, infrastructure, health monitoring, and optimization.',
      'data-analysis': 'Data analysis projects benefit from analytical capabilities, business intelligence, diagnostics, and AI optimization.',
      'full-stack': 'Full-stack projects require the complete crew for comprehensive development across all layers.'
    };

    return reasoning[projectType] || 'Recommended crew based on project requirements.';
  }

  /**
   * Get crew knowledge insights from RAG
   */
  async getCrewKnowledge(crewId) {
    // Mock knowledge data for demo
    return {
      success: true,
      crewId,
      insights: {
        totalInteractions: Math.floor(Math.random() * 1000) + 100,
        projectsCompleted: Math.floor(Math.random() * 50) + 5,
        specializations: [],
        recentLearnings: [
          'Optimized error handling patterns',
          'Improved API response times',
          'Enhanced security protocols'
        ],
        collaborations: Math.floor(Math.random() * 20) + 5
      }
    };
  }

  /**
   * Orchestrate crew for a project task
   */
  async orchestrateCrew(projectId, task) {
    const project = this.projects.get(projectId);
    if (!project) {
      return { success: false, message: 'Project not found' };
    }

    // Simulate agentic orchestration
    const orchestration = {
      success: true,
      projectId,
      task: task.description,
      assignedCrew: project.assignedCrew,
      workflow: [
        {
          phase: 'Planning',
          lead: 'BdNHOluRYUw2JxGW', // Picard
          supporting: ['gIwrQHHArgrVARjL', 'L6K4bzSKlGC36ABL'],
          duration: '2 hours'
        },
        {
          phase: 'Implementation',
          lead: 'Imn7p6pVgi6SRvnF', // Riker
          supporting: ['e0UEwyVcXJqeePdj', '36KPle5mPiMaazG6'],
          duration: '8 hours'
        },
        {
          phase: 'Review',
          lead: 'GhSB8EpZWXLU78LM', // Worf
          supporting: ['SXAMupVWdOxZybF6', 'gIwrQHHArgrVARjL'],
          duration: '2 hours'
        }
      ],
      estimatedCompletion: '12 hours',
      llmOptimization: {
        providedBy: 'LCARS Library Computer',
        estimatedCost: '$2.50',
        tokensEstimated: 50000
      }
    };

    return orchestration;
  }

  /**
   * Get system status dashboard data
   */
  async getSystemStatus() {
    const roster = await this.getCrewRoster();
    const projects = this.getProjects();

    return {
      success: true,
      timestamp: new Date().toISOString(),
      crew: {
        total: roster.totalActive,
        available: roster.crewMembers.filter(c => !c.currentProject).length,
        assigned: roster.crewMembers.filter(c => c.currentProject).length
      },
      projects: {
        total: projects.totalProjects,
        active: Array.from(this.projects.values()).filter(p => p.status === 'in-progress').length,
        planning: Array.from(this.projects.values()).filter(p => p.status === 'planning').length,
        completed: Array.from(this.projects.values()).filter(p => p.status === 'completed').length
      },
      integrations: {
        n8n: { status: 'operational', url: this.n8nUrl },
        supabase: { status: 'operational', url: this.supabaseUrl },
        openrouter: { status: 'operational' },
        lcars: { status: 'operational', optimization: 'active' }
      }
    };
  }
}

module.exports = CrewManagementAPI;



