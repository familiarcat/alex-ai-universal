/**
 * Universal Alex AI Package - Ultra Minimal Working Version
 */

export class MinimalAlexAI {
  constructor() {
    console.log('Alex AI Core initialized');
  }

  async initialize(): Promise<void> {
    console.log('Alex AI Core ready');
  }

  getStatus() {
    return {
      connected: true,
      ready: true,
      version: '1.0.0'
    };
  }
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

// Crew Self-Discovery System
export { CrewSelfDiscoverySystem, CrewMemberFeature, SelfDiscoveryReport } from './crew-self-discovery';
export { CrewSelfDiscoveryCLI } from './crew-self-discovery-cli';

// N8N Workflow Integration
export { CrewWorkflowUpdater, N8NCredentials, SupabaseConfig, CrewWorkflowUpdate, CrewMemoryEntry } from './n8n/crew-workflow-updater';
export { N8NWorkflowCLI } from './n8n/n8n-workflow-cli';

// Scenario Analysis
export { ComprehensiveProjectScenarioAnalyzer, ProjectScenario, ScenarioStep, CrewMemberLearning } from './scenario-analysis/comprehensive-project-scenario';
export { ScenarioAnalysisCLI } from './scenario-analysis/scenario-analysis-cli';

// Crew Consciousness System
export { CrewConsciousnessWorkflow, ProjectAnalysisRequest, CrewConsciousnessSession, CrewMemberAnalysis, CollectiveInsights } from './crew-consciousness/crew-consciousness-workflow';
export { CrewConsciousnessCLI } from './crew-consciousness/crew-consciousness-cli';














