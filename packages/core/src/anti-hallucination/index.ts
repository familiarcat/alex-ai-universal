/**
 * Anti-Hallucination System Module
 * Exports all anti-hallucination components and types
 */

// Import types and classes for internal use
import { AntiHallucinationSystem } from './anti-hallucination-system';
import type { 
  AntiHallucinationConfig, 
  AntiHallucinationResult, 
  SystemMetrics 
} from './anti-hallucination-system';

// Main system
export { AntiHallucinationSystem } from './anti-hallucination-system';
export type { 
  AntiHallucinationConfig, 
  AntiHallucinationResult, 
  SystemMetrics 
} from './anti-hallucination-system';

// LLM Optimizer
export { LLMOptimizer } from './llm-optimizer';
export type { 
  LLMOptimizationConfig, 
  OpenRouterModel, 
  PromptContext 
} from './llm-optimizer';

// Hallucination Detector
export { HallucinationDetector } from './hallucination-detector';
export type { 
  CrewPerspective, 
  HallucinationAnalysis, 
  ConsensusData 
} from './hallucination-detector';

// Universal Crew Activation
export { UniversalCrewActivation } from './universal-crew-activation';
export type { 
  CrewActivationConfig, 
  CrewActivationResult, 
  CrewMemberResponse 
} from './universal-crew-activation';

// Hallucination Corrector
export { HallucinationCorrector } from './hallucination-corrector';
export type { 
  CorrectedResponse, 
  HallucinationLearning, 
  CorrectionPrompt 
} from './hallucination-corrector';

// Factory function for easy initialization
export function createAntiHallucinationSystem(config: AntiHallucinationConfig): AntiHallucinationSystem {
  return new AntiHallucinationSystem(config);
}

// Default configuration
export const DEFAULT_ANTI_HALLUCINATION_CONFIG: AntiHallucinationConfig = {
  enabled: true,
  hallucinationThreshold: 0.3,
  semanticSimilarityThreshold: 0.7,
  factualAlignmentThreshold: 0.6,
  enableUniversalActivation: true,
  parallelProcessing: true,
  timeoutMs: 30000,
  maxRetries: 3,
  fallbackEnabled: true,
  enableLearning: true,
  enableCorrections: true,
  openRouterApiKey: process.env.OPENROUTER_API_KEY || ''
};

// Utility functions
export class AntiHallucinationUtils {
  /**
   * Validate configuration
   */
  static validateConfig(config: Partial<AntiHallucinationConfig>): string[] {
    const errors: string[] = [];

    if (config.hallucinationThreshold !== undefined) {
      if (config.hallucinationThreshold < 0 || config.hallucinationThreshold > 1) {
        errors.push('hallucinationThreshold must be between 0 and 1');
      }
    }

    if (config.semanticSimilarityThreshold !== undefined) {
      if (config.semanticSimilarityThreshold < 0 || config.semanticSimilarityThreshold > 1) {
        errors.push('semanticSimilarityThreshold must be between 0 and 1');
      }
    }

    if (config.factualAlignmentThreshold !== undefined) {
      if (config.factualAlignmentThreshold < 0 || config.factualAlignmentThreshold > 1) {
        errors.push('factualAlignmentThreshold must be between 0 and 1');
      }
    }

    if (config.timeoutMs !== undefined) {
      if (config.timeoutMs < 1000 || config.timeoutMs > 300000) {
        errors.push('timeoutMs must be between 1000 and 300000 milliseconds');
      }
    }

    if (config.maxRetries !== undefined) {
      if (config.maxRetries < 0 || config.maxRetries > 10) {
        errors.push('maxRetries must be between 0 and 10');
      }
    }

    if (config.openRouterApiKey !== undefined) {
      if (!config.openRouterApiKey || config.openRouterApiKey.length < 10) {
        errors.push('openRouterApiKey must be a valid API key');
      }
    }

    return errors;
  }

  /**
   * Merge configurations
   */
  static mergeConfigs(
    baseConfig: AntiHallucinationConfig,
    overrideConfig: Partial<AntiHallucinationConfig>
  ): AntiHallucinationConfig {
    return {
      ...baseConfig,
      ...overrideConfig
    };
  }

  /**
   * Create configuration from environment variables
   */
  static createConfigFromEnv(): AntiHallucinationConfig {
    return {
      enabled: process.env.ANTI_HALLUCINATION_ENABLED !== 'false',
      hallucinationThreshold: parseFloat(process.env.ANTI_HALLUCINATION_THRESHOLD || '0.3'),
      semanticSimilarityThreshold: parseFloat(process.env.ANTI_HALLUCINATION_SEMANTIC_THRESHOLD || '0.7'),
      factualAlignmentThreshold: parseFloat(process.env.ANTI_HALLUCINATION_FACTUAL_THRESHOLD || '0.6'),
      enableUniversalActivation: process.env.ANTI_HALLUCINATION_UNIVERSAL_ACTIVATION !== 'false',
      parallelProcessing: process.env.ANTI_HALLUCINATION_PARALLEL !== 'false',
      timeoutMs: parseInt(process.env.ANTI_HALLUCINATION_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.ANTI_HALLUCINATION_MAX_RETRIES || '3'),
      fallbackEnabled: process.env.ANTI_HALLUCINATION_FALLBACK !== 'false',
      enableLearning: process.env.ANTI_HALLUCINATION_LEARNING !== 'false',
      enableCorrections: process.env.ANTI_HALLUCINATION_CORRECTIONS !== 'false',
      openRouterApiKey: process.env.OPENROUTER_API_KEY || ''
    };
  }

  /**
   * Format system metrics for display
   */
  static formatMetrics(metrics: SystemMetrics): string {
    return `
🛡️ Anti-Hallucination System Metrics:
📊 Total Prompts: ${metrics.totalPrompts}
🚨 Hallucinations Detected: ${metrics.hallucinationsDetected}
🔧 Corrections Applied: ${metrics.correctionsApplied}
⏱️  Average Processing Time: ${metrics.averageProcessingTime.toFixed(0)}ms
📈 System Health: ${(metrics.systemHealth * 100).toFixed(1)}%

👥 Crew Member Accuracy:
${Array.from(metrics.crewMemberAccuracy.entries())
  .map((entry) => `  ${entry[0]}: ${(entry[1] * 100).toFixed(1)}%`)
  .join('\n')}

🤖 LLM Performance:
${Array.from(metrics.llmPerformance.entries())
  .map((entry) => `  ${entry[0]}: ${(entry[1] * 100).toFixed(1)}%`)
  .join('\n')}
`;
  }

  /**
   * Generate test prompts for system testing
   */
  static generateTestPrompts(): string[] {
    return [
      'Explain quantum computing in simple terms',
      'What are the security implications of AI systems?',
      'How should we approach user experience design?',
      'Analyze the strategic benefits of cloud migration',
      'What are the medical applications of machine learning?',
      'Describe the legal framework for data privacy',
      'How can we optimize database performance?',
      'What are the ethical considerations in AI development?',
      'Explain the engineering principles behind distributed systems',
      'How should we handle customer feedback and complaints?'
    ];
  }

  /**
   * Create sample configuration for testing
   */
  static createTestConfig(): AntiHallucinationConfig {
    return {
      ...DEFAULT_ANTI_HALLUCINATION_CONFIG,
      timeoutMs: 10000, // Shorter timeout for testing
      maxRetries: 1, // Fewer retries for testing
      enableLearning: true,
      enableCorrections: true
    };
  }
}
