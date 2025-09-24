/**
 * Anti-Hallucination System Module
 * Exports all anti-hallucination components and types
 */
import { AntiHallucinationSystem } from './anti-hallucination-system';
import type { AntiHallucinationConfig, SystemMetrics } from './anti-hallucination-system';
export { AntiHallucinationSystem } from './anti-hallucination-system';
export type { AntiHallucinationConfig, AntiHallucinationResult, SystemMetrics } from './anti-hallucination-system';
export { LLMOptimizer } from './llm-optimizer';
export type { LLMOptimizationConfig, OpenRouterModel, PromptContext } from './llm-optimizer';
export { HallucinationDetector } from './hallucination-detector';
export type { CrewPerspective, HallucinationAnalysis, ConsensusData } from './hallucination-detector';
export { UniversalCrewActivation } from './universal-crew-activation';
export type { CrewActivationConfig, CrewActivationResult, CrewMemberResponse } from './universal-crew-activation';
export { HallucinationCorrector } from './hallucination-corrector';
export type { CorrectedResponse, HallucinationLearning, CorrectionPrompt } from './hallucination-corrector';
export declare function createAntiHallucinationSystem(config: AntiHallucinationConfig): AntiHallucinationSystem;
export declare const DEFAULT_ANTI_HALLUCINATION_CONFIG: AntiHallucinationConfig;
export declare class AntiHallucinationUtils {
    /**
     * Validate configuration
     */
    static validateConfig(config: Partial<AntiHallucinationConfig>): string[];
    /**
     * Merge configurations
     */
    static mergeConfigs(baseConfig: AntiHallucinationConfig, overrideConfig: Partial<AntiHallucinationConfig>): AntiHallucinationConfig;
    /**
     * Create configuration from environment variables
     */
    static createConfigFromEnv(): AntiHallucinationConfig;
    /**
     * Format system metrics for display
     */
    static formatMetrics(metrics: SystemMetrics): string;
    /**
     * Generate test prompts for system testing
     */
    static generateTestPrompts(): string[];
    /**
     * Create sample configuration for testing
     */
    static createTestConfig(): AntiHallucinationConfig;
}
//# sourceMappingURL=index.d.ts.map