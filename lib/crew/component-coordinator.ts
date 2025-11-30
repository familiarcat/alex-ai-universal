/**
 * Component Coordinator System
 * 
 * Enables crew coordination for dashboard components using Riker's organization
 * and Quark's business analytics to optimize component teams.
 * 
 * Leadership: Commander Riker (Organization) + Quark (Business Analytics)
 * Crew: All teams working in parallel on component optimization
 */

import { CrewAssignmentSystem, AssignmentScore } from '../crew-assignment-system';

export interface ComponentGoal {
  componentName: string;
  purpose: string;
  responsibilities: string[];
  domain: string;
  crewOwners: string[];
  businessValue: string;
  integrations: string[];
  dataSources: string[];
  technicalDetails: {
    framework: string;
    hooks: string[];
    dependencies: string[];
  };
}

export interface ComponentTeam {
  teamId: string;
  teamName: string;
  components: string[];
  crewMembers: string[];
  coordinator: 'riker' | 'quark';
  goals: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'planning' | 'completed';
}

export interface CrewCoordinationPlan {
  sessionId: string;
  topic: string;
  teams: ComponentTeam[];
  coordinationStrategy: 'parallel' | 'sequential' | 'hybrid';
  businessMetrics: {
    estimatedValue: number;
    cost: number;
    roi: number;
  };
  timeline: {
    start: string;
    estimatedCompletion: string;
    milestones: string[];
  };
}

export class ComponentCoordinator {
  private crewAssignment: CrewAssignmentSystem;
  private componentGoals: Map<string, ComponentGoal>;
  private activeTeams: Map<string, ComponentTeam>;
  
  constructor() {
    this.crewAssignment = new CrewAssignmentSystem();
    this.componentGoals = new Map();
    this.activeTeams = new Map();
  }
  
  /**
   * Load component goals from RAG system or local analysis
   */
  async loadComponentGoals(goals: ComponentGoal[]): Promise<void> {
    goals.forEach(goal => {
      this.componentGoals.set(goal.componentName, goal);
    });
  }
  
  /**
   * Form component teams based on Riker's organization principles
   * and Quark's business analytics
   */
  formComponentTeams(
    componentNames: string[],
    coordinationStrategy: 'parallel' | 'sequential' | 'hybrid' = 'parallel'
  ): ComponentTeam[] {
    const teams: ComponentTeam[] = [];
    const componentGroups = this.groupComponentsByDomain(componentNames);
    
    // Riker's Organization: Group by domain and crew expertise
    for (const [domain, components] of Object.entries(componentGroups)) {
      // Find crew members best suited for this domain
      const domainQuery = `optimize ${domain} components for better performance and integration`;
      const crewAssignments = this.crewAssignment.assignCrew(domainQuery);
      
      // Quark's Analytics: Calculate business value
      const businessValue = this.calculateBusinessValue(components);
      
      // Determine coordinator based on domain
      const coordinator: 'riker' | 'quark' = 
        domain.includes('analytics') || domain.includes('business') || domain.includes('cost')
          ? 'quark'
          : 'riker';
      
      const team: ComponentTeam = {
        teamId: `team-${domain}-${Date.now()}`,
        teamName: `${domain} Optimization Team`,
        components,
        crewMembers: crewAssignments.slice(0, 3).map(a => a.crewMemberId),
        coordinator,
        goals: this.extractTeamGoals(components),
        priority: businessValue > 100 ? 'high' : businessValue > 50 ? 'medium' : 'low',
        status: 'planning'
      };
      
      teams.push(team);
      this.activeTeams.set(team.teamId, team);
    }
    
    return teams;
  }
  
  /**
   * Create coordination plan for component updates
   */
  createCoordinationPlan(
    topic: string,
    componentNames: string[],
    coordinationStrategy: 'parallel' | 'sequential' | 'hybrid' = 'parallel'
  ): CrewCoordinationPlan {
    const teams = this.formComponentTeams(componentNames, coordinationStrategy);
    
    // Quark's Business Analytics: Calculate ROI
    const totalValue = teams.reduce((sum, team) => 
      sum + this.calculateBusinessValue(team.components), 0
    );
    const estimatedCost = teams.length * 2; // 2 hours per team
    const roi = (totalValue - estimatedCost) / estimatedCost * 100;
    
    const plan: CrewCoordinationPlan = {
      sessionId: `coordination-${Date.now()}`,
      topic,
      teams,
      coordinationStrategy,
      businessMetrics: {
        estimatedValue: totalValue,
        cost: estimatedCost,
        roi
      },
      timeline: {
        start: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + teams.length * 2 * 60 * 60 * 1000).toISOString(),
        milestones: teams.map(t => `Complete ${t.teamName}`)
      }
    };
    
    return plan;
  }
  
  /**
   * Execute coordination plan via Observation Lounge
   */
  async executeCoordinationPlan(plan: CrewCoordinationPlan): Promise<any> {
    // Trigger Observation Lounge for each team
    const teamPromises = plan.teams.map(team => 
      this.coordinateTeam(team, plan.topic)
    );
    
    if (plan.coordinationStrategy === 'parallel') {
      // All teams work in parallel
      return Promise.all(teamPromises);
    } else if (plan.coordinationStrategy === 'sequential') {
      // Teams work one after another
      const results = [];
      for (const promise of teamPromises) {
        results.push(await promise);
      }
      return results;
    } else {
      // Hybrid: Some parallel, some sequential based on dependencies
      return this.executeHybridCoordination(teamPromises, plan.teams);
    }
  }
  
  /**
   * Coordinate a single team via n8n Observation Lounge
   */
  private async coordinateTeam(team: ComponentTeam, topic: string): Promise<any> {
    const coordinator = team.coordinator === 'riker' 
      ? 'commander_riker'
      : 'quark';
    
    const observationLoungePayload = {
      topic: `${topic} - ${team.teamName}`,
      context: {
        team: team.teamName,
        components: team.components,
        crewMembers: team.crewMembers,
        goals: team.goals,
        coordinator
      },
      crew_members: team.crewMembers,
      discussion_type: 'collaborative',
      priority: team.priority,
      coordination_method: 'component_optimization',
      routing_strategy: 'domain_expertise'
    };
    
    // Call Observation Lounge webhook
    try {
      const response = await fetch('https://n8n.pbradygeorgen.com/webhook/observation-lounge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(observationLoungePayload)
      });
      
      if (!response.ok) {
        throw new Error(`Observation Lounge request failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update team status
      team.status = 'active';
      this.activeTeams.set(team.teamId, team);
      
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        result,
        status: 'active'
      };
    } catch (error) {
      console.error(`Error coordinating team ${team.teamId}:`, error);
      team.status = 'planning';
      this.activeTeams.set(team.teamId, team);
      throw error;
    }
  }
  
  /**
   * Group components by domain
   */
  private groupComponentsByDomain(componentNames: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    
    componentNames.forEach(name => {
      const goal = this.componentGoals.get(name);
      const domain = goal?.domain || 'Uncategorized';
      
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(name);
    });
    
    return groups;
  }
  
  /**
   * Extract team goals from components
   */
  private extractTeamGoals(componentNames: string[]): string[] {
    const goals: string[] = [];
    
    componentNames.forEach(name => {
      const goal = this.componentGoals.get(name);
      if (goal) {
        goals.push(goal.purpose);
        goals.push(...goal.responsibilities);
      }
    });
    
    return [...new Set(goals)];
  }
  
  /**
   * Calculate business value (Quark's analytics)
   */
  private calculateBusinessValue(componentNames: string[]): number {
    let value = 0;
    
    componentNames.forEach(name => {
      const goal = this.componentGoals.get(name);
      if (goal) {
        // Base value from component importance
        value += 10;
        
        // Add value for integrations (more integrations = more critical)
        value += goal.integrations.length * 2;
        
        // Add value for data sources (data-driven = valuable)
        value += goal.dataSources.length * 3;
        
        // Add value for business value description
        if (goal.businessValue.includes('insights') || goal.businessValue.includes('decision')) {
          value += 20;
        }
        if (goal.businessValue.includes('security') || goal.businessValue.includes('compliance')) {
          value += 25;
        }
      }
    });
    
    return value;
  }
  
  /**
   * Execute hybrid coordination (some parallel, some sequential)
   */
  private async executeHybridCoordination(
    promises: Promise<any>[],
    teams: ComponentTeam[]
  ): Promise<any[]> {
    // Group teams by priority
    const highPriority = teams.filter(t => t.priority === 'high');
    const mediumPriority = teams.filter(t => t.priority === 'medium');
    const lowPriority = teams.filter(t => t.priority === 'low');
    
    const results: any[] = [];
    
    // Execute high priority in parallel
    if (highPriority.length > 0) {
      const highPromises = highPriority.map((team, idx) => 
        promises[teams.indexOf(team)]
      );
      results.push(...await Promise.all(highPromises));
    }
    
    // Execute medium priority in parallel
    if (mediumPriority.length > 0) {
      const mediumPromises = mediumPriority.map((team, idx) => 
        promises[teams.indexOf(team)]
      );
      results.push(...await Promise.all(mediumPromises));
    }
    
    // Execute low priority sequentially
    if (lowPriority.length > 0) {
      for (const team of lowPriority) {
        const promise = promises[teams.indexOf(team)];
        results.push(await promise);
      }
    }
    
    return results;
  }
  
  /**
   * Get active teams
   */
  getActiveTeams(): ComponentTeam[] {
    return Array.from(this.activeTeams.values());
  }
  
  /**
   * Get team by ID
   */
  getTeam(teamId: string): ComponentTeam | undefined {
    return this.activeTeams.get(teamId);
  }
}

