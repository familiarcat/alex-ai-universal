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
export declare class LLMOptimizer {
    private openRouterApiKey;
    private crewMemberExpertise;
    private llmCapabilities;
    constructor(openRouterApiKey: string);
    /**
     * Select optimal LLM for crew member based on prompt context
     */
    selectOptimalLLM(crewMember: string, prompt: string): Promise<LLMOptimizationConfig>;
    /**
     * Analyze prompt context to determine requirements
     */
    private analyzePromptContext;
    /**
     * Detect domain from prompt
     */
    private detectDomain;
    /**
     * Detect complexity level
     */
    private detectComplexity;
    /**
     * Detect prompt type
     */
    private detectPromptType;
    /**
     * Extract keywords from prompt
     */
    private extractKeywords;
    /**
     * Query OpenRouter for optimal LLM
     */
    private queryOpenRouter;
    /**
     * Select optimal model based on context and skills
     */
    private selectOptimalModel;
    /**
     * Model capability checks
     */
    private isTechnicalModel;
    private isEmpathicModel;
    private isCreativeModel;
    private isAnalyticalModel;
    private isStrategicModel;
    /**
     * Check if skills match model capabilities
     */
    private skillsMatchModel;
    /**
     * Get fallback LLM when OpenRouter fails
     */
    private getFallbackLLM;
    /**
     * Calculate confidence score
     */
    private calculateConfidence;
    /**
     * Generate reasoning for LLM selection
     */
    private generateReasoning;
    /**
     * Initialize crew member expertise mapping
     */
    private initializeCrewMemberExpertise;
    /**
     * Initialize LLM capabilities mapping
     */
    private initializeLLMCapabilities;
    /**
     * Get crew member skills
     */
    private getCrewMemberSkills;
    /**
     * Get all available crew members
     */
    getCrewMembers(): string[];
    /**
     * Get all available LLMs
     */
    getAvailableLLMs(): string[];
}
//# sourceMappingURL=llm-optimizer.d.ts.map