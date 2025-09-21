/**
 * Universal Crew Activation System
 * Activates all crew members for every prompt to ensure comprehensive perspective collection
 */
import { LLMOptimizer } from './llm-optimizer';
import { HallucinationDetector, CrewPerspective } from './hallucination-detector';
export interface CrewActivationConfig {
    enableUniversalActivation: boolean;
    parallelProcessing: boolean;
    timeoutMs: number;
    maxRetries: number;
    fallbackEnabled: boolean;
}
export interface CrewActivationResult {
    perspectives: CrewPerspective[];
    activationTime: number;
    successCount: number;
    failureCount: number;
    averageConfidence: number;
    consensusReached: boolean;
    errors: string[];
}
export interface CrewMemberResponse {
    crewMember: string;
    response: string;
    confidence: number;
    processingTime: number;
    llmUsed: string;
    success: boolean;
    error?: string;
}
export declare class UniversalCrewActivation {
    private llmOptimizer;
    private hallucinationDetector;
    private config;
    private crewMembers;
    constructor(llmOptimizer: LLMOptimizer, hallucinationDetector: HallucinationDetector, config: CrewActivationConfig);
    /**
     * Activate all crew members for a prompt
     */
    activateAllCrewMembers(prompt: string): Promise<CrewActivationResult>;
    /**
     * Process individual crew member
     */
    private processCrewMember;
    /**
     * Process prompt with optimized LLM
     */
    private processWithOptimizedLLM;
    /**
     * Call LLM with retry logic
     */
    private callLLMWithRetry;
    /**
     * Simulate LLM call (placeholder for actual implementation)
     */
    private simulateLLMCall;
    /**
     * Generate crew member specific response
     */
    private generateCrewMemberResponse;
    /**
     * Build crew member specific prompt
     */
    private buildCrewMemberPrompt;
    /**
     * Get crew member persona
     */
    private getCrewMemberPersona;
    /**
     * Generate fallback response when primary processing fails
     */
    private generateFallbackResponse;
    /**
     * Calculate average confidence
     */
    private calculateAverageConfidence;
    /**
     * Delay utility
     */
    private delay;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<CrewActivationConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): CrewActivationConfig;
    /**
     * Get crew members
     */
    getCrewMembers(): string[];
    /**
     * Add custom crew member
     */
    addCrewMember(name: string, expertise: string[]): void;
    /**
     * Remove crew member
     */
    removeCrewMember(name: string): void;
}
//# sourceMappingURL=universal-crew-activation.d.ts.map