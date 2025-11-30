"use strict";
/**
 * Anti-Hallucination System Module
 * Exports all anti-hallucination components and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiHallucinationUtils = exports.DEFAULT_ANTI_HALLUCINATION_CONFIG = exports.HallucinationCorrector = exports.UniversalCrewActivation = exports.HallucinationDetector = exports.LLMOptimizer = exports.AntiHallucinationSystem = void 0;
exports.createAntiHallucinationSystem = createAntiHallucinationSystem;
// Import types and classes for internal use
const anti_hallucination_system_1 = require("./anti-hallucination-system");
// Main system
var anti_hallucination_system_2 = require("./anti-hallucination-system");
Object.defineProperty(exports, "AntiHallucinationSystem", { enumerable: true, get: function () { return anti_hallucination_system_2.AntiHallucinationSystem; } });
// LLM Optimizer
var llm_optimizer_1 = require("./llm-optimizer");
Object.defineProperty(exports, "LLMOptimizer", { enumerable: true, get: function () { return llm_optimizer_1.LLMOptimizer; } });
// Hallucination Detector
var hallucination_detector_1 = require("./hallucination-detector");
Object.defineProperty(exports, "HallucinationDetector", { enumerable: true, get: function () { return hallucination_detector_1.HallucinationDetector; } });
// Universal Crew Activation
var universal_crew_activation_1 = require("./universal-crew-activation");
Object.defineProperty(exports, "UniversalCrewActivation", { enumerable: true, get: function () { return universal_crew_activation_1.UniversalCrewActivation; } });
// Hallucination Corrector
var hallucination_corrector_1 = require("./hallucination-corrector");
Object.defineProperty(exports, "HallucinationCorrector", { enumerable: true, get: function () { return hallucination_corrector_1.HallucinationCorrector; } });
// Factory function for easy initialization
function createAntiHallucinationSystem(config) {
    return new anti_hallucination_system_1.AntiHallucinationSystem(config);
}
// Default configuration
exports.DEFAULT_ANTI_HALLUCINATION_CONFIG = {
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
class AntiHallucinationUtils {
    /**
     * Validate configuration
     */
    static validateConfig(config) {
        const errors = [];
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
    static mergeConfigs(baseConfig, overrideConfig) {
        return {
            ...baseConfig,
            ...overrideConfig
        };
    }
    /**
     * Create configuration from environment variables
     */
    static createConfigFromEnv() {
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
    static formatMetrics(metrics) {
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
    static generateTestPrompts() {
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
    static createTestConfig() {
        return {
            ...exports.DEFAULT_ANTI_HALLUCINATION_CONFIG,
            timeoutMs: 10000, // Shorter timeout for testing
            maxRetries: 1, // Fewer retries for testing
            enableLearning: true,
            enableCorrections: true
        };
    }
}
exports.AntiHallucinationUtils = AntiHallucinationUtils;
//# sourceMappingURL=index.js.map