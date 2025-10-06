/**
 * Crew RAG Integration System
 * Integrates crew member responses with RAG system queries
 * Ensures crew members speak to RAG instead of local documentation
 */

import CrewRAGQuery from './crew-rag-query';

interface CrewResponse {
  crewMember: string;
  response: string;
  ragContext: {
    query: string;
    chunks: any[];
    relevance: number;
    timestamp: string;
  };
  localContext: boolean;
}

interface CrewRAGIntegration {
  queryRAG: (crewMemberId: string, query: string) => Promise<any>;
  generateResponse: (crewMemberId: string, userQuery: string) => Promise<CrewResponse>;
  analyzeQueryRelevance: (query: string) => Promise<string>;
  getCrewContext: (crewMemberId: string) => Promise<any>;
}

export class CrewRAGIntegrationSystem implements CrewRAGIntegration {
  private ragQuery: CrewRAGQuery;
  private crewMembers: Map<string, any>;

  constructor() {
    this.ragQuery = new CrewRAGQuery();
    this.crewMembers = new Map();
    this.initializeCrewMembers();
  }

  private initializeCrewMembers() {
    // Initialize crew members with their expertise and response patterns
    this.crewMembers.set('captain_picard', {
      id: 'captain_picard',
      name: 'Captain Jean-Luc Picard',
      role: 'Strategic Commander',
      expertise: ['Strategic Leadership', 'System Integration', 'Decision Making'],
      keywords: ['strategic', 'leadership', 'command', 'decision', 'mission', 'planning', 'coordination'],
      responseStyle: 'authoritative, strategic, commanding',
      contextRequirements: ['strategic planning', 'decision making', 'leadership coordination']
    });

    this.crewMembers.set('commander_data', {
      id: 'commander_data',
      name: 'Commander Data',
      role: 'Operations Officer',
      expertise: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
      keywords: ['data', 'analysis', 'logic', 'processing', 'analytics', 'metrics', 'performance'],
      responseStyle: 'logical, analytical, precise',
      contextRequirements: ['data analysis', 'performance metrics', 'logical optimization']
    });

    this.crewMembers.set('commander_riker', {
      id: 'commander_riker',
      name: 'Commander William Riker',
      role: 'First Officer',
      expertise: ['Tactical Operations', 'Workflow Management', 'Execution'],
      keywords: ['operations', 'tactical', 'execution', 'workflow', 'management', 'coordination'],
      responseStyle: 'tactical, operational, decisive',
      contextRequirements: ['operational strategy', 'workflow management', 'execution planning']
    });

    this.crewMembers.set('lieutenant_geordi', {
      id: 'lieutenant_geordi',
      name: 'Lieutenant Commander Geordi La Forge',
      role: 'Chief Engineer',
      expertise: ['Infrastructure', 'System Integration', 'Technical Solutions'],
      keywords: ['engineering', 'technical', 'infrastructure', 'system', 'architecture', 'implementation'],
      responseStyle: 'technical, practical, solution-oriented',
      contextRequirements: ['technical architecture', 'system integration', 'infrastructure design']
    });

    this.crewMembers.set('lieutenant_worf', {
      id: 'lieutenant_worf',
      name: 'Lieutenant Worf',
      role: 'Security Officer',
      expertise: ['Security Protocols', 'Threat Assessment', 'Compliance'],
      keywords: ['security', 'threat', 'compliance', 'vulnerability', 'protection', 'audit'],
      responseStyle: 'vigilant, security-focused, thorough',
      contextRequirements: ['security protocols', 'threat assessment', 'compliance procedures']
    });

    this.crewMembers.set('counselor_troi', {
      id: 'counselor_troi',
      name: 'Counselor Deanna Troi',
      role: 'Ship\'s Counselor',
      expertise: ['User Experience', 'Communication', 'Team Dynamics'],
      keywords: ['user experience', 'communication', 'team dynamics', 'interface', 'usability'],
      responseStyle: 'empathetic, user-focused, communicative',
      contextRequirements: ['user experience design', 'team communication', 'interface usability']
    });

    this.crewMembers.set('dr_crusher', {
      id: 'dr_crusher',
      name: 'Dr. Beverly Crusher',
      role: 'Chief Medical Officer',
      expertise: ['System Health', 'Diagnostics', 'Wellness'],
      keywords: ['performance', 'health', 'diagnostics', 'optimization', 'monitoring', 'wellness'],
      responseStyle: 'diagnostic, health-focused, caring',
      contextRequirements: ['system health monitoring', 'performance diagnostics', 'optimization']
    });

    this.crewMembers.set('lieutenant_uhura', {
      id: 'lieutenant_uhura',
      name: 'Lieutenant Uhura',
      role: 'Communications Officer',
      expertise: ['Communication Protocols', 'Synchronization', 'Integration'],
      keywords: ['communication', 'integration', 'synchronization', 'protocols', 'connectivity'],
      responseStyle: 'communicative, integration-focused, systematic',
      contextRequirements: ['communication protocols', 'system synchronization', 'integration']
    });

    this.crewMembers.set('quark', {
      id: 'quark',
      name: 'Quark',
      role: 'Business Operations',
      expertise: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics'],
      keywords: ['business', 'cost', 'efficiency', 'metrics', 'optimization', 'value', 'roi'],
      responseStyle: 'business-focused, efficiency-oriented, value-driven',
      contextRequirements: ['business value analysis', 'cost optimization', 'efficiency metrics']
    });
  }

  /**
   * Query RAG system for crew member context
   */
  async queryRAG(crewMemberId: string, query: string): Promise<any> {
    try {
      const results = await this.ragQuery.queryForCrewMember(crewMemberId, query, 5);
      return results;
    } catch (error) {
      console.error(`Failed to query RAG for ${crewMemberId}:`, error);
      return null;
    }
  }

  /**
   * Analyze query to determine most relevant crew member
   */
  async analyzeQueryRelevance(query: string): Promise<string> {
    try {
      const relevance = this.ragQuery.analyzeQueryRelevance(query);
      
      // Find the crew member with highest relevance
      const sortedRelevance = relevance.sort((a, b) => b.relevance - a.relevance);
      return sortedRelevance.length > 0 ? sortedRelevance[0].crewMember : 'captain_picard';
    } catch (error) {
      console.error('Failed to analyze query relevance:', error);
      return 'captain_picard'; // Default fallback
    }
  }

  /**
   * Get crew member context from RAG system
   */
  async getCrewContext(crewMemberId: string): Promise<any> {
    const crewMember = this.crewMembers.get(crewMemberId);
    if (!crewMember) {
      throw new Error(`Crew member ${crewMemberId} not found`);
    }

    try {
      // Query RAG for crew member's expertise areas
      const contextQueries = crewMember.contextRequirements;
      const ragContexts = [];

      for (const contextQuery of contextQueries) {
        const ragResult = await this.queryRAG(crewMemberId, contextQuery);
        if (ragResult && ragResult.chunks.length > 0) {
          ragContexts.push({
            query: contextQuery,
            chunks: ragResult.chunks,
            relevance: ragResult.totalResults
          });
        }
      }

      return {
        crewMember,
        ragContexts,
        hasRAGContext: ragContexts.length > 0
      };
    } catch (error) {
      console.error(`Failed to get crew context for ${crewMemberId}:`, error);
      return {
        crewMember,
        ragContexts: [],
        hasRAGContext: false
      };
    }
  }

  /**
   * Generate crew response with RAG integration
   */
  async generateResponse(crewMemberId: string, userQuery: string): Promise<CrewResponse> {
    const crewMember = this.crewMembers.get(crewMemberId);
    if (!crewMember) {
      throw new Error(`Crew member ${crewMemberId} not found`);
    }

    try {
      // Query RAG system for relevant context
      const ragResult = await this.queryRAG(crewMemberId, userQuery);
      
      if (!ragResult || ragResult.chunks.length === 0) {
        // Fallback to local context if RAG fails
        return {
          crewMember: crewMember.name,
          response: this.generateLocalResponse(crewMember, userQuery),
          ragContext: {
            query: userQuery,
            chunks: [],
            relevance: 0,
            timestamp: new Date().toISOString()
          },
          localContext: true
        };
      }

      // Generate response with RAG context
      const response = this.generateRAGEnhancedResponse(crewMember, userQuery, ragResult);

      return {
        crewMember: crewMember.name,
        response,
        ragContext: {
          query: userQuery,
          chunks: ragResult.chunks,
          relevance: ragResult.totalResults,
          timestamp: ragResult.timestamp
        },
        localContext: false
      };
    } catch (error) {
      console.error(`Failed to generate response for ${crewMemberId}:`, error);
      
      // Fallback to local response
      return {
        crewMember: crewMember.name,
        response: this.generateLocalResponse(crewMember, userQuery),
        ragContext: {
          query: userQuery,
          chunks: [],
          relevance: 0,
          timestamp: new Date().toISOString()
        },
        localContext: true
      };
    }
  }

  /**
   * Generate RAG-enhanced response
   */
  private generateRAGEnhancedResponse(crewMember: any, userQuery: string, ragResult: any): string {
    const chunks = ragResult.chunks;
    const relevantContent = chunks.map((chunk: any) => chunk.content).join('\n\n');
    
    // Generate response based on crew member's style and RAG context
    let response = `🖖 ${crewMember.name} here. `;
    
    switch (crewMember.id) {
      case 'captain_picard':
        response += `Based on our strategic documentation, I can provide the following guidance:\n\n`;
        response += `**Strategic Analysis:**\n${this.extractStrategicInsights(relevantContent)}\n\n`;
        response += `**Recommended Course of Action:**\n${this.generateStrategicRecommendation(userQuery, relevantContent)}`;
        break;
        
      case 'commander_data':
        response += `My analysis of the relevant documentation reveals the following data:\n\n`;
        response += `**Data Analysis:**\n${this.extractDataInsights(relevantContent)}\n\n`;
        response += `**Logical Conclusion:**\n${this.generateLogicalConclusion(userQuery, relevantContent)}`;
        break;
        
      case 'commander_riker':
        response += `From an operational perspective, our documentation indicates:\n\n`;
        response += `**Operational Assessment:**\n${this.extractOperationalInsights(relevantContent)}\n\n`;
        response += `**Execution Strategy:**\n${this.generateExecutionStrategy(userQuery, relevantContent)}`;
        break;
        
      case 'lieutenant_geordi':
        response += `The technical documentation shows:\n\n`;
        response += `**Technical Analysis:**\n${this.extractTechnicalInsights(relevantContent)}\n\n`;
        response += `**Implementation Approach:**\n${this.generateTechnicalSolution(userQuery, relevantContent)}`;
        break;
        
      case 'lieutenant_worf':
        response += `Security analysis of the documentation reveals:\n\n`;
        response += `**Security Assessment:**\n${this.extractSecurityInsights(relevantContent)}\n\n`;
        response += `**Security Recommendations:**\n${this.generateSecurityRecommendations(userQuery, relevantContent)}`;
        break;
        
      case 'counselor_troi':
        response += `From a user experience perspective, the documentation suggests:\n\n`;
        response += `**User Experience Analysis:**\n${this.extractUXInsights(relevantContent)}\n\n`;
        response += `**Communication Strategy:**\n${this.generateUXRecommendations(userQuery, relevantContent)}`;
        break;
        
      case 'dr_crusher':
        response += `My diagnostic analysis of the system documentation indicates:\n\n`;
        response += `**System Health Assessment:**\n${this.extractHealthInsights(relevantContent)}\n\n`;
        response += `**Optimization Recommendations:**\n${this.generateHealthRecommendations(userQuery, relevantContent)}`;
        break;
        
      case 'lieutenant_uhura':
        response += `Communication protocol analysis shows:\n\n`;
        response += `**Integration Assessment:**\n${this.extractIntegrationInsights(relevantContent)}\n\n`;
        response += `**Synchronization Strategy:**\n${this.generateIntegrationRecommendations(userQuery, relevantContent)}`;
        break;
        
      case 'quark':
        response += `From a business perspective, the documentation reveals:\n\n`;
        response += `**Business Analysis:**\n${this.extractBusinessInsights(relevantContent)}\n\n`;
        response += `**Efficiency Recommendations:**\n${this.generateBusinessRecommendations(userQuery, relevantContent)}`;
        break;
        
      default:
        response += `Based on the relevant documentation:\n\n${relevantContent}`;
    }
    
    return response;
  }

  /**
   * Generate local response (fallback when RAG fails)
   */
  private generateLocalResponse(crewMember: any, userQuery: string): string {
    return `🖖 ${crewMember.name} here. I'm currently unable to access our documentation system, but based on my expertise in ${crewMember.expertise.join(', ')}, I can provide general guidance. Please ensure the RAG system is properly configured for more detailed responses.`;
  }

  // Helper methods for extracting insights from RAG content
  private extractStrategicInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractDataInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractOperationalInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractTechnicalInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractSecurityInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractUXInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractHealthInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractIntegrationInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  private extractBusinessInsights(content: string): string {
    return content.substring(0, 300) + '...';
  }

  // Helper methods for generating recommendations
  private generateStrategicRecommendation(query: string, content: string): string {
    return `Based on the strategic documentation, I recommend focusing on the key objectives outlined in our previous analyses. The documentation suggests a systematic approach to ${query.toLowerCase()}.`;
  }

  private generateLogicalConclusion(query: string, content: string): string {
    return `The data analysis indicates that ${query.toLowerCase()} follows logical patterns consistent with our established protocols.`;
  }

  private generateExecutionStrategy(query: string, content: string): string {
    return `For operational execution of ${query.toLowerCase()}, I recommend following the tactical procedures outlined in our documentation.`;
  }

  private generateTechnicalSolution(query: string, content: string): string {
    return `The technical documentation provides clear implementation guidelines for ${query.toLowerCase()}.`;
  }

  private generateSecurityRecommendations(query: string, content: string): string {
    return `Security protocols require careful implementation for ${query.toLowerCase()} to ensure system integrity.`;
  }

  private generateUXRecommendations(query: string, content: string): string {
    return `User experience considerations for ${query.toLowerCase()} should prioritize intuitive interaction patterns.`;
  }

  private generateHealthRecommendations(query: string, content: string): string {
    return `System health monitoring is essential for optimal performance of ${query.toLowerCase()}.`;
  }

  private generateIntegrationRecommendations(query: string, content: string): string {
    return `Integration protocols for ${query.toLowerCase()} require careful synchronization with existing systems.`;
  }

  private generateBusinessRecommendations(query: string, content: string): string {
    return `Business optimization for ${query.toLowerCase()} should focus on efficiency and cost-effectiveness.`;
  }

  /**
   * Get all crew members
   */
  getAllCrewMembers(): any[] {
    return Array.from(this.crewMembers.values());
  }

  /**
   * Check if crew member exists
   */
  hasCrewMember(crewMemberId: string): boolean {
    return this.crewMembers.has(crewMemberId);
  }
}

export default CrewRAGIntegrationSystem;
