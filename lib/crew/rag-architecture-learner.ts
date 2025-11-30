/**
 * RAG Architecture Learner
 * 
 * Queries RAG system for common software architecture patterns and problems,
 * learns from them, and applies as best practices to Alex AI framework.
 * 
 * Leadership: Commander Data (Pattern Recognition) + Geordi La Forge (Infrastructure)
 * Crew: All teams contributing architecture knowledge
 */

export interface ArchitecturePattern {
  patternName: string;
  category: 'design_pattern' | 'anti_pattern' | 'best_practice' | 'architecture_decision';
  description: string;
  problem: string;
  solution: string;
  examples: string[];
  relatedPatterns: string[];
  applicability: {
    contexts: string[];
    technologies: string[];
    complexity: 'low' | 'medium' | 'high';
  };
  source: {
    type: 'rag_memory' | 'external' | 'crew_analysis';
    reference: string;
    confidence: number;
  };
}

export interface ArchitectureProblem {
  problemName: string;
  description: string;
  symptoms: string[];
  rootCause: string;
  solutions: string[];
  prevention: string[];
  relatedProblems: string[];
  learnedFrom: string[];
}

export class RAGArchitectureLearner {
  private supabaseUrl: string;
  private supabaseKey: string;
  private learnedPatterns: Map<string, ArchitecturePattern>;
  private learnedProblems: Map<string, ArchitectureProblem>;
  
  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseKey = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    this.learnedPatterns = new Map();
    this.learnedProblems = new Map();
  }
  
  /**
   * Query RAG for architecture patterns
   */
  async queryArchitecturePatterns(
    query: string,
    category?: ArchitecturePattern['category']
  ): Promise<ArchitecturePattern[]> {
    // Query Supabase RAG for relevant memories
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/search_crew_memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({
          query_text: query,
          knowledge_types: category ? [category] : undefined,
          limit: 20
        })
      });
      
      if (!response.ok) {
        throw new Error(`RAG query failed: ${response.statusText}`);
      }
      
      const memories = await response.json();
      
      // Extract architecture patterns from memories
      const patterns = memories
        .filter((m: any) => 
          m.keywords?.some((k: string) => 
            ['pattern', 'architecture', 'design', 'best practice', 'anti-pattern'].includes(k.toLowerCase())
          )
        )
        .map((m: any) => this.extractPatternFromMemory(m));
      
      // Cache learned patterns
      patterns.forEach(p => {
        this.learnedPatterns.set(p.patternName, p);
      });
      
      return patterns;
    } catch (error) {
      console.error('Error querying RAG for architecture patterns:', error);
      return [];
    }
  }
  
  /**
   * Query RAG for architecture problems
   */
  async queryArchitectureProblems(query: string): Promise<ArchitectureProblem[]> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/search_crew_memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({
          query_text: `${query} problem issue error bug`,
          knowledge_types: ['troubleshooting', 'technical_knowledge'],
          limit: 20
        })
      });
      
      if (!response.ok) {
        throw new Error(`RAG query failed: ${response.statusText}`);
      }
      
      const memories = await response.json();
      
      // Extract problems from memories
      const problems = memories
        .filter((m: any) => 
          m.keywords?.some((k: string) => 
            ['problem', 'issue', 'error', 'bug', 'failure'].includes(k.toLowerCase())
          )
        )
        .map((m: any) => this.extractProblemFromMemory(m));
      
      // Cache learned problems
      problems.forEach(p => {
        this.learnedProblems.set(p.problemName, p);
      });
      
      return problems;
    } catch (error) {
      console.error('Error querying RAG for architecture problems:', error);
      return [];
    }
  }
  
  /**
   * Learn from external architecture resources
   */
  async learnFromExternalResources(
    resources: Array<{ url: string; type: string }>
  ): Promise<ArchitecturePattern[]> {
    // This would integrate with web scraping or API calls to learn from
    // external architecture resources (e.g., Martin Fowler, AWS Well-Architected, etc.)
    // For now, return empty array
    return [];
  }
  
  /**
   * Apply learned patterns to Alex AI framework
   */
  async applyPatternsToFramework(
    patterns: ArchitecturePattern[],
    context: string
  ): Promise<{
    appliedPatterns: string[];
    recommendations: string[];
    codeChanges: string[];
  }> {
    const appliedPatterns: string[] = [];
    const recommendations: string[] = [];
    const codeChanges: string[] = [];
    
    for (const pattern of patterns) {
      // Check if pattern is applicable to current context
      if (this.isPatternApplicable(pattern, context)) {
        appliedPatterns.push(pattern.patternName);
        
        // Generate recommendations
        recommendations.push(
          `Apply ${pattern.patternName}: ${pattern.solution}`
        );
        
        // Generate code change suggestions
        if (pattern.examples.length > 0) {
          codeChanges.push(
            `// ${pattern.patternName}\n${pattern.examples[0]}`
          );
        }
      }
    }
    
    return {
      appliedPatterns,
      recommendations,
      codeChanges
    };
  }
  
  /**
   * Extract pattern from crew memory
   */
  private extractPatternFromMemory(memory: any): ArchitecturePattern {
    return {
      patternName: memory.title || 'Unknown Pattern',
      category: this.inferCategory(memory),
      description: memory.summary || '',
      problem: memory.detailed_analysis || '',
      solution: memory.recommendations?.join(' ') || '',
      examples: memory.referenced_documents || [],
      relatedPatterns: memory.related_topics || [],
      applicability: {
        contexts: memory.applicable_scenarios || [],
        technologies: memory.tags || [],
        complexity: this.inferComplexity(memory)
      },
      source: {
        type: 'rag_memory',
        reference: memory.id,
        confidence: memory.confidence_level / 100 || 0.75
      }
    };
  }
  
  /**
   * Extract problem from crew memory
   */
  private extractProblemFromMemory(memory: any): ArchitectureProblem {
    return {
      problemName: memory.title || 'Unknown Problem',
      description: memory.summary || '',
      symptoms: memory.key_findings || [],
      rootCause: memory.detailed_analysis || '',
      solutions: memory.recommendations || [],
      prevention: memory.conclusions || [],
      relatedProblems: memory.related_topics || [],
      learnedFrom: [memory.crew_member_name || 'Unknown']
    };
  }
  
  /**
   * Infer pattern category from memory
   */
  private inferCategory(memory: any): ArchitecturePattern['category'] {
    const title = (memory.title || '').toLowerCase();
    const summary = (memory.summary || '').toLowerCase();
    
    if (title.includes('anti') || summary.includes('anti')) {
      return 'anti_pattern';
    }
    if (title.includes('best practice') || summary.includes('best practice')) {
      return 'best_practice';
    }
    if (title.includes('decision') || summary.includes('decision')) {
      return 'architecture_decision';
    }
    return 'design_pattern';
  }
  
  /**
   * Infer complexity from memory
   */
  private inferComplexity(memory: any): 'low' | 'medium' | 'high' {
    const complexity = memory.complexity_level || 5;
    if (complexity <= 3) return 'low';
    if (complexity <= 7) return 'medium';
    return 'high';
  }
  
  /**
   * Check if pattern is applicable to context
   */
  private isPatternApplicable(
    pattern: ArchitecturePattern,
    context: string
  ): boolean {
    const lowerContext = context.toLowerCase();
    
    // Check if context matches any applicable contexts
    const contextMatch = pattern.applicability.contexts.some(ctx =>
      lowerContext.includes(ctx.toLowerCase())
    );
    
    // Check if context mentions any related technologies
    const techMatch = pattern.applicability.technologies.some(tech =>
      lowerContext.includes(tech.toLowerCase())
    );
    
    return contextMatch || techMatch;
  }
  
  /**
   * Get learned patterns
   */
  getLearnedPatterns(): ArchitecturePattern[] {
    return Array.from(this.learnedPatterns.values());
  }
  
  /**
   * Get learned problems
   */
  getLearnedProblems(): ArchitectureProblem[] {
    return Array.from(this.learnedProblems.values());
  }
}

