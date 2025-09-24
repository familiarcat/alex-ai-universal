/**
 * Hallucination Detector for Anti-Hallucination System
 * Detects hallucinations through crew consensus analysis
 */
import { LLMOptimizationConfig } from './llm-optimizer';
export interface CrewPerspective {
    crewMember: string;
    response: string;
    llmUsed: string;
    confidence: number;
    timestamp: Date;
    context: string;
    optimization: LLMOptimizationConfig;
}
export interface HallucinationAnalysis {
    crewMember: string;
    isHallucination: boolean;
    deviationScore: number;
    consensusAlignment: number;
    correctionPrompt: string;
    learningOpportunity: string;
    detectedAt: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface ConsensusData {
    consensusResponse: string;
    consensusConfidence: number;
    participantCount: number;
    agreementScore: number;
    dominantPerspective: string;
    outlierCount: number;
}
export declare class HallucinationDetector {
    private hallucinationThreshold;
    private semanticSimilarityThreshold;
    private factualAlignmentThreshold;
    constructor(hallucinationThreshold?: number, semanticSimilarityThreshold?: number, factualAlignmentThreshold?: number);
    /**
     * Analyze crew consensus and detect hallucinations
     */
    analyzeCrewConsensus(perspectives: CrewPerspective[]): Promise<{
        consensus: ConsensusData;
        analyses: HallucinationAnalysis[];
        overallHealth: number;
    }>;
    /**
     * Calculate crew consensus
     */
    private calculateConsensus;
    /**
     * Group similar responses using semantic similarity
     */
    private groupSimilarResponses;
    /**
     * Analyze individual perspective against consensus
     */
    private analyzePerspective;
    /**
     * Calculate deviation score for a perspective
     */
    private calculateDeviation;
    /**
     * Calculate semantic similarity between two responses
     */
    private calculateSemanticSimilarity;
    /**
     * Calculate factual alignment between responses
     */
    private calculateFactualAlignment;
    /**
     * Calculate confidence weight
     */
    private calculateConfidenceWeight;
    /**
     * Determine hallucination severity
     */
    private determineSeverity;
    /**
     * Generate correction prompt for hallucinating crew member
     */
    private generateCorrectionPrompt;
    /**
     * Identify learning opportunity from hallucination
     */
    private identifyLearningOpportunity;
    /**
     * Tokenize text into words
     */
    private tokenize;
    /**
     * Calculate keyword similarity
     */
    private calculateKeywordSimilarity;
    /**
     * Extract keywords from text
     */
    private extractKeywords;
    /**
     * Extract factual claims from response
     */
    private extractFactualClaims;
    /**
     * Check if two factual claims are aligned
     */
    private areFactsAligned;
    /**
     * Get crew member persona for correction prompts
     */
    private getCrewMemberPersona;
    /**
     * Calculate average confidence
     */
    private calculateAverageConfidence;
    /**
     * Calculate overall health score
     */
    private calculateOverallHealth;
    /**
     * Classify deviation type
     */
    private classifyDeviationType;
    /**
     * Check for contradictory facts
     */
    private hasContradictoryFacts;
    /**
     * Check if two facts are contradictory
     */
    private areFactsContradictory;
    /**
     * Check for logical inconsistency
     */
    private hasLogicalInconsistency;
    /**
     * Check if two sentences are contradictory
     */
    private areSentencesContradictory;
    /**
     * Generate learning points
     */
    private generateLearningPoint1;
    private generateLearningPoint2;
    private generateLearningPoint3;
    /**
     * Update thresholds
     */
    updateThresholds(hallucinationThreshold?: number, semanticSimilarityThreshold?: number, factualAlignmentThreshold?: number): void;
    /**
     * Get current thresholds
     */
    getThresholds(): {
        hallucinationThreshold: number;
        semanticSimilarityThreshold: number;
        factualAlignmentThreshold: number;
    };
}
//# sourceMappingURL=hallucination-detector.d.ts.map