/**
 * LLM Optimizer for Anti-Hallucination System
 * Dynamically selects optimal LLM for each crew member based on prompt context
 */

export interface LLMOptimizationConfig {
  crewMember: string;
  promptContext: string;
  personaSkills: string[];
  optimalLLM: string;
  confidence: number;
  reasoning: string;
  timestamp: Date;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider: {
    context_length: number;
  };
}

export interface PromptContext {
  domain: string;
  complexity: 'low' | 'medium' | 'high';
  type: 'technical' | 'creative' | 'analytical' | 'empathic' | 'strategic';
  keywords: string[];
  length: number;
}

export class LLMOptimizer {
  private openRouterApiKey: string;
  private crewMemberExpertise: Map<string, string[]>;
  private llmCapabilities: Map<string, string[]>;

  constructor(openRouterApiKey: string) {
    this.openRouterApiKey = openRouterApiKey;
    this.crewMemberExpertise = new Map();
    this.llmCapabilities = new Map();
    this.initializeCrewMemberExpertise();
    this.initializeLLMCapabilities();
  }

  /**
   * Select optimal LLM for crew member based on prompt context
   */
  async selectOptimalLLM(crewMember: string, prompt: string): Promise<LLMOptimizationConfig> {
    const context = await this.analyzePromptContext(prompt);
    const skills = this.getCrewMemberSkills(crewMember);
    const optimalLLM = await this.queryOpenRouter(context, skills);
    const confidence = this.calculateConfidence(context, optimalLLM, skills);
    const reasoning = this.generateReasoning(optimalLLM, context, skills);

    return {
      crewMember,
      promptContext: JSON.stringify(context),
      personaSkills: skills,
      optimalLLM,
      confidence,
      reasoning,
      timestamp: new Date()
    };
  }

  /**
   * Analyze prompt context to determine requirements
   */
  private async analyzePromptContext(prompt: string): Promise<PromptContext> {
    // Analyze domain
    const domain = this.detectDomain(prompt);
    
    // Analyze complexity
    const complexity = this.detectComplexity(prompt);
    
    // Analyze type
    const type = this.detectPromptType(prompt);
    
    // Extract keywords
    const keywords = this.extractKeywords(prompt);
    
    // Calculate length
    const length = prompt.length;

    return {
      domain,
      complexity,
      type,
      keywords,
      length
    };
  }

  /**
   * Detect domain from prompt
   */
  private detectDomain(prompt: string): string {
    const domains = {
      'machine-learning': ['ml', 'ai', 'model', 'training', 'neural', 'algorithm', 'data science'],
      'security': ['security', 'vulnerability', 'threat', 'attack', 'defense', 'audit', 'compliance'],
      'psychology': ['emotion', 'behavior', 'psychology', 'mental', 'therapy', 'counseling'],
      'engineering': ['code', 'architecture', 'system', 'design', 'implementation', 'optimization'],
      'strategy': ['strategy', 'planning', 'leadership', 'management', 'vision', 'goals'],
      'medical': ['medical', 'health', 'diagnosis', 'treatment', 'patient', 'clinical'],
      'legal': ['legal', 'law', 'contract', 'compliance', 'regulation', 'litigation'],
      'business': ['business', 'market', 'finance', 'revenue', 'customer', 'product']
    };

    const lowerPrompt = prompt.toLowerCase();
    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return domain;
      }
    }
    return 'general';
  }

  /**
   * Detect complexity level
   */
  private detectComplexity(prompt: string): 'low' | 'medium' | 'high' {
    const highComplexityKeywords = [
      'complex', 'advanced', 'sophisticated', 'comprehensive', 'detailed analysis',
      'multi-step', 'integration', 'optimization', 'architecture', 'enterprise'
    ];
    
    const mediumComplexityKeywords = [
      'explain', 'describe', 'analyze', 'compare', 'evaluate', 'implement',
      'design', 'develop', 'create', 'build'
    ];

    const lowerPrompt = prompt.toLowerCase();
    
    if (highComplexityKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      return 'high';
    } else if (mediumComplexityKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Detect prompt type
   */
  private detectPromptType(prompt: string): 'technical' | 'creative' | 'analytical' | 'empathic' | 'strategic' {
    const technicalKeywords = ['code', 'algorithm', 'implementation', 'technical', 'system', 'architecture'];
    const creativeKeywords = ['creative', 'design', 'artistic', 'innovative', 'imaginative', 'story'];
    const analyticalKeywords = ['analyze', 'evaluate', 'compare', 'assess', 'examine', 'investigate'];
    const empathicKeywords = ['feel', 'emotion', 'empathy', 'understand', 'support', 'help', 'counsel'];
    const strategicKeywords = ['strategy', 'plan', 'leadership', 'vision', 'goals', 'direction'];

    const lowerPrompt = prompt.toLowerCase();
    
    if (technicalKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'technical';
    if (creativeKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'creative';
    if (analyticalKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'analytical';
    if (empathicKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'empathic';
    if (strategicKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'strategic';
    
    return 'analytical'; // default
  }

  /**
   * Extract keywords from prompt
   */
  private extractKeywords(prompt: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const words = prompt.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common stop words
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those'];
    return words.filter(word => !stopWords.includes(word)).slice(0, 10);
  }

  /**
   * Query OpenRouter for optimal LLM
   */
  private async queryOpenRouter(context: PromptContext, skills: string[]): Promise<string> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const models = await response.json() as { data: OpenRouterModel[] };
      const optimalModel = this.selectOptimalModel(models.data, context, skills);
      
      return optimalModel || 'anthropic/claude-3-sonnet'; // fallback
    } catch (error) {
      console.error('OpenRouter query failed:', error);
      return this.getFallbackLLM(context, skills);
    }
  }

  /**
   * Select optimal model based on context and skills
   */
  private selectOptimalModel(models: OpenRouterModel[], context: PromptContext, skills: string[]): string {
    const modelScores = new Map<string, number>();

    for (const model of models) {
      let score = 0;

      // Score based on context type
      if (context.type === 'technical' && this.isTechnicalModel(model.id)) score += 3;
      if (context.type === 'empathic' && this.isEmpathicModel(model.id)) score += 3;
      if (context.type === 'creative' && this.isCreativeModel(model.id)) score += 3;
      if (context.type === 'analytical' && this.isAnalyticalModel(model.id)) score += 3;
      if (context.type === 'strategic' && this.isStrategicModel(model.id)) score += 3;

      // Score based on complexity
      if (context.complexity === 'high' && model.context_length > 100000) score += 2;
      if (context.complexity === 'medium' && model.context_length > 50000) score += 1;

      // Score based on skills match
      if (this.skillsMatchModel(model.id, skills)) score += 2;

      // Prefer certain high-quality models
      if (model.id.includes('claude-3-opus')) score += 2;
      if (model.id.includes('gpt-4')) score += 2;
      if (model.id.includes('claude-3-sonnet')) score += 1;

      modelScores.set(model.id, score);
    }

    // Return model with highest score
    const sortedModels = Array.from(modelScores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return sortedModels[0]?.[0] || 'anthropic/claude-3-sonnet';
  }

  /**
   * Model capability checks
   */
  private isTechnicalModel(modelId: string): boolean {
    return modelId.includes('gpt-4') || modelId.includes('claude-3') || modelId.includes('code');
  }

  private isEmpathicModel(modelId: string): boolean {
    return modelId.includes('claude') || modelId.includes('llama');
  }

  private isCreativeModel(modelId: string): boolean {
    return modelId.includes('claude') || modelId.includes('gpt') || modelId.includes('creative');
  }

  private isAnalyticalModel(modelId: string): boolean {
    return modelId.includes('gpt-4') || modelId.includes('claude-3') || modelId.includes('analysis');
  }

  private isStrategicModel(modelId: string): boolean {
    return modelId.includes('claude-3-opus') || modelId.includes('gpt-4') || modelId.includes('strategic');
  }

  /**
   * Check if skills match model capabilities
   */
  private skillsMatchModel(modelId: string, skills: string[]): boolean {
    const modelCapabilities = this.llmCapabilities.get(modelId) || [];
    return skills.some(skill => modelCapabilities.includes(skill));
  }

  /**
   * Get fallback LLM when OpenRouter fails
   */
  private getFallbackLLM(context: PromptContext, skills: string[]): string {
    if (context.type === 'technical') return 'openai/gpt-4-turbo';
    if (context.type === 'empathic') return 'anthropic/claude-3-sonnet';
    if (context.type === 'creative') return 'anthropic/claude-3-sonnet';
    if (context.type === 'analytical') return 'openai/gpt-4-turbo';
    if (context.type === 'strategic') return 'anthropic/claude-3-opus';
    
    return 'anthropic/claude-3-sonnet';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(context: PromptContext, llm: string, skills: string[]): number {
    let confidence = 0.5; // base confidence

    // Increase confidence based on context clarity
    if (context.domain !== 'general') confidence += 0.1;
    if (context.keywords.length > 3) confidence += 0.1;
    if (context.complexity !== 'low') confidence += 0.1;

    // Increase confidence based on skills match
    const modelCapabilities = this.llmCapabilities.get(llm) || [];
    const skillsMatch = skills.filter(skill => modelCapabilities.includes(skill)).length;
    confidence += (skillsMatch / skills.length) * 0.2;

    // Cap confidence at 0.95
    return Math.min(confidence, 0.95);
  }

  /**
   * Generate reasoning for LLM selection
   */
  private generateReasoning(llm: string, context: PromptContext, skills: string[]): string {
    const reasons = [];

    if (context.type === 'technical') {
      reasons.push('Selected for superior technical analysis capabilities');
    } else if (context.type === 'empathic') {
      reasons.push('Selected for excellent empathy and psychological understanding');
    } else if (context.type === 'creative') {
      reasons.push('Selected for strong creative and imaginative capabilities');
    } else if (context.type === 'analytical') {
      reasons.push('Selected for comprehensive analytical reasoning');
    } else if (context.type === 'strategic') {
      reasons.push('Selected for superior strategic thinking and planning');
    }

    if (context.complexity === 'high') {
      reasons.push('High complexity task requires advanced reasoning capabilities');
    }

    const matchedSkills = skills.filter(skill => 
      this.llmCapabilities.get(llm)?.includes(skill)
    );
    
    if (matchedSkills.length > 0) {
      reasons.push(`Skills match: ${matchedSkills.join(', ')}`);
    }

    return reasons.join('. ') || 'Selected based on general capability assessment';
  }

  /**
   * Initialize crew member expertise mapping
   */
  private initializeCrewMemberExpertise(): void {
    this.crewMemberExpertise = new Map([
      ['Captain Picard', ['leadership', 'strategy', 'diplomacy', 'ethics', 'command']],
      ['Commander Data', ['technical-analysis', 'logic', 'computation', 'science', 'engineering']],
      ['Counselor Troi', ['empathy', 'psychology', 'counseling', 'emotions', 'human-behavior']],
      ['Lieutenant Worf', ['security', 'tactics', 'combat', 'honor', 'warrior-code']],
      ['Commander Riker', ['leadership', 'tactics', 'diplomacy', 'command', 'strategy']],
      ['Lieutenant Commander La Forge', ['engineering', 'technology', 'innovation', 'problem-solving']],
      ['Doctor Crusher', ['medical', 'healing', 'science', 'research', 'compassion']],
      ['Lieutenant Commander Tasha Yar', ['security', 'tactics', 'survival', 'protection']],
      ['Lieutenant Commander Spock', ['logic', 'science', 'analysis', 'vulcan-knowledge']]
    ]);
  }

  /**
   * Initialize LLM capabilities mapping
   */
  private initializeLLMCapabilities(): void {
    this.llmCapabilities = new Map([
      ['anthropic/claude-3-opus', ['strategy', 'leadership', 'diplomacy', 'ethics', 'creative', 'analytical', 'empathy']],
      ['anthropic/claude-3-sonnet', ['technical-analysis', 'logic', 'science', 'engineering', 'empathy', 'creative']],
      ['openai/gpt-4-turbo', ['technical-analysis', 'logic', 'computation', 'science', 'engineering', 'analytical']],
      ['openai/gpt-4', ['technical-analysis', 'logic', 'computation', 'science', 'engineering', 'creative']],
      ['openai/gpt-3.5-turbo', ['general', 'creative', 'analytical', 'technical-analysis']],
      ['meta-llama/llama-2-70b-chat', ['creative', 'analytical', 'empathy', 'general']],
      ['google/gemini-pro', ['technical-analysis', 'science', 'analytical', 'creative']]
    ]);
  }

  /**
   * Get crew member skills
   */
  private getCrewMemberSkills(crewMember: string): string[] {
    return this.crewMemberExpertise.get(crewMember) || ['general'];
  }

  /**
   * Get all available crew members
   */
  getCrewMembers(): string[] {
    return Array.from(this.crewMemberExpertise.keys());
  }

  /**
   * Get all available LLMs
   */
  getAvailableLLMs(): string[] {
    return Array.from(this.llmCapabilities.keys());
  }
}
