/**
 * Crew Assignment System
 * Intelligently routes questions to the most qualified crew member
 * 
 * Pattern: Analyze user query → Match to crew capabilities → Route to best fit
 */

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  specialization: string[];
  capabilities: string[];
  typicalUseCases: string[];
  n8nWorkflowId: string;
  webhookPath: string;
}

export interface AssignmentScore {
  crewMemberId: string;
  score: number;
  matchedKeywords: string[];
  reason: string;
}

export class CrewAssignmentSystem {
  private crewMembers: CrewMember[] = [];
  
  constructor() {
    this.initializeCrewMembers();
  }
  
  private initializeCrewMembers() {
    // Load from crew-members/*.json files
    // For now, hardcode the mapping
    this.crewMembers = [
      {
        id: 'captain_picard',
        name: 'Captain Jean-Luc Picard',
        role: 'Strategic Leadership',
        specialization: ['Strategic Planning', 'Decision Making', 'Vision', 'Ethics'],
        capabilities: ['strategic_planning', 'leadership', 'decision_making', 'high_level_architecture'],
        typicalUseCases: ['architecture decisions', 'strategic planning', 'ethical dilemmas', 'vision setting'],
        n8nWorkflowId: 'xz1Op8tLhe6dd3yV',
        webhookPath: '/webhook/crew-captain-jean-luc-picard'
      },
      {
        id: 'commander_data',
        name: 'Commander Data',
        role: 'Analytics & AI',
        specialization: ['Analytics', 'AI/ML', 'Logic', 'Data Processing'],
        capabilities: ['data_analysis', 'ai_ml', 'logical_reasoning', 'pattern_recognition'],
        typicalUseCases: ['data analysis', 'AI integration', 'algorithms', 'machine learning'],
        n8nWorkflowId: 'RxCX3376Du6xW727',
        webhookPath: '/webhook/crew-commander-data'
      },
      {
        id: 'geordi_la_forge',
        name: 'Lt. Cmdr. Geordi La Forge',
        role: 'Infrastructure',
        specialization: ['Infrastructure', 'System Integration', 'TypeScript', 'Node.js', 'API Design'],
        capabilities: ['infrastructure', 'system_integration', 'api_design', 'performance_optimization'],
        typicalUseCases: ['infrastructure', 'system integration', 'API design', 'performance'],
        n8nWorkflowId: 'ogsUoPCp5KjNf3Or',
        webhookPath: '/webhook/crew-lieutenant-commander-geordi-la-forge'
      },
      {
        id: 'commander_riker',
        name: 'Commander William Riker',
        role: 'Tactical Execution',
        specialization: ['Tactical Operations', 'Workflow Management', 'Execution', 'Team Leadership'],
        capabilities: ['tactical_operations', 'workflow_management', 'execution', 'team_leadership'],
        typicalUseCases: ['workflow execution', 'tactical implementation', 'team coordination'],
        n8nWorkflowId: 'BFh2I9TwxN9871uO',
        webhookPath: '/webhook/crew-commander-william-riker'
      },
      {
        id: 'lieutenant_worf',
        name: 'Lieutenant Worf',
        role: 'Security & Compliance',
        specialization: ['Security', 'Compliance', 'Risk Assessment', 'Testing', 'QA'],
        capabilities: ['security', 'compliance', 'risk_assessment', 'testing', 'quality_assurance'],
        typicalUseCases: ['security', 'compliance', 'testing', 'risk assessment', 'quality'],
        n8nWorkflowId: 'Jz3TVht94wnjr5Q7',
        webhookPath: '/webhook/crew-lieutenant-worf'
      },
      {
        id: 'counselor_troi',
        name: 'Counselor Deanna Troi',
        role: 'User Experience',
        specialization: ['UX', 'Empathy', 'Human Factors', 'Accessibility', 'User Research'],
        capabilities: ['user_experience', 'empathy_analysis', 'accessibility', 'user_research'],
        typicalUseCases: ['user experience', 'UX design', 'accessibility', 'user needs'],
        n8nWorkflowId: 'ozPdtlXJ7mkB3jkc',
        webhookPath: '/webhook/crew-counselor-deanna-troi'
      },
      {
        id: 'dr_crusher',
        name: 'Dr. Beverly Crusher',
        role: 'System Health',
        specialization: ['Health Diagnostics', 'System Optimization', 'Performance', 'Monitoring'],
        capabilities: ['health', 'diagnostics', 'system_optimization', 'performance_monitoring'],
        typicalUseCases: ['system health', 'diagnostics', 'performance issues', 'monitoring'],
        n8nWorkflowId: 'FZjbB8fmomNvH7et',
        webhookPath: '/webhook/crew-dr-beverly-crusher'
      },
      {
        id: 'lieutenant_uhura',
        name: 'Lieutenant Uhura',
        role: 'Communications',
        specialization: ['Communications', 'I/O Operations', 'Documentation', 'APIs'],
        capabilities: ['communications', 'io_operations', 'documentation', 'api_integration'],
        typicalUseCases: ['communication', 'documentation', 'I/O', 'API integration'],
        n8nWorkflowId: 'ALug4ov1cTS754pV',
        webhookPath: '/webhook/crew-lieutenant-uhura'
      },
      {
        id: 'quark',
        name: 'Quark',
        role: 'Business Intelligence',
        specialization: ['Business Analysis', 'ROI', 'Budget', 'Value Optimization'],
        capabilities: ['business_intelligence', 'roi_analysis', 'budget_optimization'],
        typicalUseCases: ['business value', 'ROI', 'budget', 'cost optimization'],
        n8nWorkflowId: 'neFZ70goRnt6qUNm',
        webhookPath: '/webhook/crew-quark'
      },
      {
        id: 'chief_obrien',
        name: 'Chief Miles O\'Brien',
        role: 'Pragmatic Solutions',
        specialization: ['Pragmatic Engineering', 'Quick Fixes', 'Troubleshooting', 'Simplification'],
        capabilities: ['pragmatic_solutions', 'quick_fixes', 'troubleshooting', 'minimal_complexity'],
        typicalUseCases: ['simple solutions', 'quick fixes', 'over-engineering', 'practical advice'],
        n8nWorkflowId: 'MuaWfFowlkSDefSP',
        webhookPath: '/webhook/crew-chief-obrien'
      }
    ];
  }
  
  /**
   * Analyze user query and assign the best crew member(s)
   */
  public assignCrew(userQuery: string, context?: any): AssignmentScore[] {
    const scores: AssignmentScore[] = [];
    const lowerQuery = userQuery.toLowerCase();
    
    for (const crew of this.crewMembers) {
      let score = 0;
      const matchedKeywords: string[] = [];
      
      // Check specialization matches
      for (const spec of crew.specialization) {
        if (lowerQuery.includes(spec.toLowerCase())) {
          score += 3;
          matchedKeywords.push(spec);
        }
      }
      
      // Check capability matches
      for (const cap of crew.capabilities) {
        if (lowerQuery.includes(cap.replace(/_/g, ' '))) {
          score += 2;
          matchedKeywords.push(cap);
        }
      }
      
      // Check use case matches
      for (const useCase of crew.typicalUseCases) {
        if (lowerQuery.includes(useCase.toLowerCase())) {
          score += 4; // Higher weight for explicit use cases
          matchedKeywords.push(useCase);
        }
      }
      
      // Special keyword boosting
      const keywordBoosts = {
        'captain_picard': ['strategic', 'decision', 'ethics', 'vision', 'leadership', 'plan', 'architecture'],
        'commander_data': ['data', 'analytics', 'ai', 'ml', 'algorithm', 'logic', 'pattern'],
        'geordi_la_forge': ['infrastructure', 'integration', 'api', 'typescript', 'node'],
        'commander_riker': ['tactical', 'workflow', 'execution', 'implement', 'coordinate'],
        'lieutenant_worf': ['security', 'compliance', 'test', 'risk', 'quality', 'validation'],
        'counselor_troi': ['ux', 'user', 'experience', 'accessibility', 'empathy', 'design'],
        'dr_crusher': ['health', 'diagnostic', 'monitor', 'optimize', 'performance', 'bottleneck'],
        'lieutenant_uhura': ['documentation', 'io', 'message'],
        'quark': ['business', 'roi', 'budget', 'cost', 'value', 'profit', 'money'],
        'chief_obrien': ['simple', 'quick', 'fix', 'practical', 'pragmatic', 'over-engineer', 'complex', 'ssr', 'cookie', 'hydration', 'should we', 'versus', 'vs']
      };
      
      const boosts = keywordBoosts[crew.id] || [];
      for (const keyword of boosts) {
        if (lowerQuery.includes(keyword)) {
          score += 1;
        }
      }
      
      if (score > 0) {
        scores.push({
          crewMemberId: crew.id,
          score,
          matchedKeywords: [...new Set(matchedKeywords)],
          reason: this.generateReason(crew, matchedKeywords)
        });
      }
    }
    
    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    
    // If no matches, default to Captain Picard for strategic guidance
    if (scores.length === 0) {
      scores.push({
        crewMemberId: 'captain_picard',
        score: 0,
        matchedKeywords: [],
        reason: 'No specific match found, routing to Captain for strategic guidance'
      });
    }
    
    return scores;
  }
  
  private generateReason(crew: CrewMember, keywords: string[]): string {
    if (keywords.length === 0) return 'General expertise match';
    return `Matched: ${keywords.slice(0, 3).join(', ')}${keywords.length > 3 ? '...' : ''}`;
  }
  
  /**
   * Get best crew member for a query
   */
  public getBestCrewMember(userQuery: string, context?: any): CrewMember {
    const assignments = this.assignCrew(userQuery, context);
    const bestMatch = assignments[0];
    return this.crewMembers.find(c => c.id === bestMatch.crewMemberId)!;
  }
  
  /**
   * Get top N crew members for a query
   */
  public getTopCrewMembers(userQuery: string, n: number = 3, context?: any): CrewMember[] {
    const assignments = this.assignCrew(userQuery, context);
    return assignments.slice(0, n).map(a => 
      this.crewMembers.find(c => c.id === a.crewMemberId)!
    );
  }
  
  /**
   * Get all crew members
   */
  public getAllCrewMembers(): CrewMember[] {
    return [...this.crewMembers];
  }
  
  /**
   * Get crew member by ID
   */
  public getCrewMember(id: string): CrewMember | null {
    return this.crewMembers.find(c => c.id === id) || null;
  }
}

