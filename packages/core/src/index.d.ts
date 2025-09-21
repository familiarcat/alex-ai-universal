/**
 * Universal Alex AI Package - Ultra Minimal Working Version
 */
export declare class MinimalAlexAI {
    constructor();
    initialize(): Promise<void>;
    getStatus(): {
        connected: boolean;
        ready: boolean;
        version: string;
    };
}
export interface AlexAIConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
}
export interface AlexAIStatus {
    connected: boolean;
    ready: boolean;
    version: string;
}
export { CrewSelfDiscoverySystem, CrewMemberFeature, SelfDiscoveryReport } from './crew-self-discovery';
export { CrewSelfDiscoveryCLI } from './crew-self-discovery-cli';
export { CrewWorkflowUpdater, N8NCredentials, SupabaseConfig, CrewWorkflowUpdate, CrewMemoryEntry } from './n8n/crew-workflow-updater';
export { N8NWorkflowCLI } from './n8n/n8n-workflow-cli';
export { ComprehensiveProjectScenarioAnalyzer, ProjectScenario, ScenarioStep, CrewMemberLearning } from './scenario-analysis/comprehensive-project-scenario';
export { ScenarioAnalysisCLI } from './scenario-analysis/scenario-analysis-cli';
export { CrewConsciousnessWorkflow, ProjectAnalysisRequest, CrewConsciousnessSession, CrewMemberAnalysis, CollectiveInsights } from './crew-consciousness/crew-consciousness-workflow';
export { CrewConsciousnessCLI } from './crew-consciousness/crew-consciousness-cli';
export { AntiHallucinationSystem, LLMOptimizer, HallucinationDetector, UniversalCrewActivation, HallucinationCorrector, createAntiHallucinationSystem, AntiHallucinationUtils, DEFAULT_ANTI_HALLUCINATION_CONFIG } from './anti-hallucination';
export type { AntiHallucinationConfig, AntiHallucinationResult, SystemMetrics, LLMOptimizationConfig, CrewPerspective, HallucinationAnalysis, CrewActivationResult, CorrectedResponse, HallucinationLearning } from './anti-hallucination';
//# sourceMappingURL=index.d.ts.map