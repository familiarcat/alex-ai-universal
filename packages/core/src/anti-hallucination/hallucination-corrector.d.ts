/**
 * Hallucination Correction System
 * Corrects hallucinations using crew-informed prompts and stores learning opportunities
 */
import { CrewPerspective, HallucinationAnalysis } from './hallucination-detector';
import { LLMOptimizer } from './llm-optimizer';
export interface CorrectedResponse {
    crewMember: string;
    originalResponse: string;
    correctedResponse: string;
    correctionReason: string;
    confidence: number;
    correctionTime: Date;
    learningStored: boolean;
}
export interface HallucinationLearning {
    crewMember: string;
    originalResponse: string;
    correctedResponse: string;
    deviationScore: number;
    learningContext: string;
    crewInsights: CrewPerspective[];
    timestamp: Date;
    learningType: 'factual' | 'logical' | 'contextual' | 'domain-specific';
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface CorrectionPrompt {
    crewMember: string;
    originalPrompt: string;
    correctionPrompt: string;
    crewConsensus: string;
    crewInsights: string[];
    focusAreas: string[];
}
export declare class HallucinationCorrector {
    private llmOptimizer;
    private learningStorage;
    constructor(llmOptimizer: LLMOptimizer);
    /**
     * Correct hallucination using crew insights
     */
    correctHallucination(hallucinatingMember: string, originalResponse: string, consensus: string, crewInsights: CrewPerspective[], analysis: HallucinationAnalysis): Promise<CorrectedResponse>;
    /**
     * Generate correction prompt
     */
    private generateCorrectionPrompt;
    /**
     * Build correction prompt
     */
    private buildCorrectionPrompt;
    /**
     * Identify focus areas for correction
     */
    private identifyFocusAreas;
    /**
     * Process correction with optimized LLM
     */
    private processCorrection;
    /**
     * Simulate correction call
     */
    private simulateCorrectionCall;
    /**
     * Create learning opportunity
     */
    private createLearningOpportunity;
    /**
     * Store learning opportunity
     */
    private storeLearningOpportunity;
    /**
     * Classify learning type
     */
    private classifyLearningType;
    /**
     * Generate learning context
     */
    private generateLearningContext;
    /**
     * Calculate correction confidence
     */
    private calculateCorrectionConfidence;
    /**
     * Calculate text similarity
     */
    private calculateTextSimilarity;
    /**
     * Check for factual contradictions
     */
    private hasFactualContradictions;
    /**
     * Check for logical inconsistencies
     */
    private hasLogicalInconsistencies;
    /**
     * Check if sentences are contradictory
     */
    private areContradictory;
    /**
     * Check if missing key points
     */
    private isMissingKeyPoints;
    /**
     * Check for contextual deviation
     */
    private isContextualDeviation;
    /**
     * Extract topics from text
     */
    private extractTopics;
    /**
     * Get crew member persona for correction prompts
     */
    private getCrewMemberPersona;
    /**
     * Get learning opportunities for crew member
     */
    getLearningOpportunities(crewMember: string): HallucinationLearning[];
    /**
     * Get all learning opportunities
     */
    getAllLearningOpportunities(): Map<string, HallucinationLearning[]>;
    /**
     * Clear learning opportunities
     */
    clearLearningOpportunities(crewMember?: string): void;
    /**
     * Get learning statistics
     */
    getLearningStatistics(): {
        totalLearnings: number;
        learningsByCrewMember: Map<string, number>;
        learningsByType: Map<string, number>;
        learningsBySeverity: Map<string, number>;
    };
}
//# sourceMappingURL=hallucination-corrector.d.ts.map