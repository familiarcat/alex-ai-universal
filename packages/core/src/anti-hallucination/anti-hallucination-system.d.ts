/**
 * Anti-Hallucination System Orchestrator
 * Main system that coordinates all anti-hallucination components
 */
import { CrewPerspective, HallucinationAnalysis } from './hallucination-detector';
import { CorrectedResponse, HallucinationLearning } from './hallucination-corrector';
export interface AntiHallucinationConfig {
    enabled: boolean;
    hallucinationThreshold: number;
    semanticSimilarityThreshold: number;
    factualAlignmentThreshold: number;
    enableUniversalActivation: boolean;
    parallelProcessing: boolean;
    timeoutMs: number;
    maxRetries: number;
    fallbackEnabled: boolean;
    enableLearning: boolean;
    enableCorrections: boolean;
    openRouterApiKey: string;
}
export interface AntiHallucinationResult {
    originalPrompt: string;
    crewPerspectives: CrewPerspective[];
    hallucinationsDetected: HallucinationAnalysis[];
    correctionsApplied: CorrectedResponse[];
    consensusReached: boolean;
    overallHealth: number;
    processingTime: number;
    learningOpportunities: HallucinationLearning[];
    systemMetrics: SystemMetrics;
}
export interface SystemMetrics {
    totalPrompts: number;
    hallucinationsDetected: number;
    correctionsApplied: number;
    averageProcessingTime: number;
    systemHealth: number;
    crewMemberAccuracy: Map<string, number>;
    llmPerformance: Map<string, number>;
}
export declare class AntiHallucinationSystem {
    private config;
    private llmOptimizer;
    private hallucinationDetector;
    private universalCrewActivation;
    private hallucinationCorrector;
    private systemMetrics;
    private isInitialized;
    constructor(config: AntiHallucinationConfig);
    /**
     * Process prompt through anti-hallucination system
     */
    processPrompt(prompt: string): Promise<AntiHallucinationResult>;
    /**
     * Enable or disable the system
     */
    enable(enabled?: boolean): void;
    /**
     * Update system configuration
     */
    updateConfig(newConfig: Partial<AntiHallucinationConfig>): void;
    /**
     * Get system status
     */
    getSystemStatus(): {
        enabled: boolean;
        initialized: boolean;
        config: AntiHallucinationConfig;
        metrics: SystemMetrics;
        crewMembers: string[];
    };
    /**
     * Get hallucination history for crew member
     */
    getHallucinationHistory(crewMember?: string): {
        learnings: HallucinationLearning[];
        statistics: any;
    };
    /**
     * Test the system with sample prompts
     */
    testSystem(testPrompts: string[]): Promise<{
        results: AntiHallucinationResult[];
        summary: {
            totalTests: number;
            successfulTests: number;
            averageHealth: number;
            hallucinationsDetected: number;
            correctionsApplied: number;
        };
    }>;
    /**
     * Initialize system metrics
     */
    private initializeSystemMetrics;
    /**
     * Update system metrics
     */
    private updateSystemMetrics;
    /**
     * Get current system metrics
     */
    private getSystemMetrics;
    /**
     * Get crew member statistics
     */
    private getCrewMemberStatistics;
    /**
     * Reset system metrics
     */
    resetMetrics(): void;
    /**
     * Export system data
     */
    exportSystemData(): {
        config: AntiHallucinationConfig;
        metrics: SystemMetrics;
        learnings: Map<string, HallucinationLearning[]>;
    };
    /**
     * Import system data
     */
    importSystemData(data: {
        config?: Partial<AntiHallucinationConfig>;
        learnings?: Map<string, HallucinationLearning[]>;
    }): void;
}
//# sourceMappingURL=anti-hallucination-system.d.ts.map