"use strict";
/**
 * Universal Alex AI Package - Ultra Minimal Working Version
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ANTI_HALLUCINATION_CONFIG = exports.AntiHallucinationUtils = exports.createAntiHallucinationSystem = exports.HallucinationCorrector = exports.UniversalCrewActivation = exports.HallucinationDetector = exports.LLMOptimizer = exports.AntiHallucinationSystem = exports.CrewConsciousnessCLI = exports.CrewConsciousnessWorkflow = exports.ScenarioAnalysisCLI = exports.ComprehensiveProjectScenarioAnalyzer = exports.N8NWorkflowCLI = exports.CrewWorkflowUpdater = exports.CrewSelfDiscoveryCLI = exports.CrewSelfDiscoverySystem = exports.MinimalAlexAI = void 0;
class MinimalAlexAI {
    constructor() {
        console.log('Alex AI Core initialized');
    }
    async initialize() {
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
exports.MinimalAlexAI = MinimalAlexAI;
// Crew Self-Discovery System
var crew_self_discovery_1 = require("./crew-self-discovery");
Object.defineProperty(exports, "CrewSelfDiscoverySystem", { enumerable: true, get: function () { return crew_self_discovery_1.CrewSelfDiscoverySystem; } });
var crew_self_discovery_cli_1 = require("./crew-self-discovery-cli");
Object.defineProperty(exports, "CrewSelfDiscoveryCLI", { enumerable: true, get: function () { return crew_self_discovery_cli_1.CrewSelfDiscoveryCLI; } });
// N8N Workflow Integration
var crew_workflow_updater_1 = require("./n8n/crew-workflow-updater");
Object.defineProperty(exports, "CrewWorkflowUpdater", { enumerable: true, get: function () { return crew_workflow_updater_1.CrewWorkflowUpdater; } });
var n8n_workflow_cli_1 = require("./n8n/n8n-workflow-cli");
Object.defineProperty(exports, "N8NWorkflowCLI", { enumerable: true, get: function () { return n8n_workflow_cli_1.N8NWorkflowCLI; } });
// Scenario Analysis
var comprehensive_project_scenario_1 = require("./scenario-analysis/comprehensive-project-scenario");
Object.defineProperty(exports, "ComprehensiveProjectScenarioAnalyzer", { enumerable: true, get: function () { return comprehensive_project_scenario_1.ComprehensiveProjectScenarioAnalyzer; } });
var scenario_analysis_cli_1 = require("./scenario-analysis/scenario-analysis-cli");
Object.defineProperty(exports, "ScenarioAnalysisCLI", { enumerable: true, get: function () { return scenario_analysis_cli_1.ScenarioAnalysisCLI; } });
// Crew Consciousness System
var crew_consciousness_workflow_1 = require("./crew-consciousness/crew-consciousness-workflow");
Object.defineProperty(exports, "CrewConsciousnessWorkflow", { enumerable: true, get: function () { return crew_consciousness_workflow_1.CrewConsciousnessWorkflow; } });
var crew_consciousness_cli_1 = require("./crew-consciousness/crew-consciousness-cli");
Object.defineProperty(exports, "CrewConsciousnessCLI", { enumerable: true, get: function () { return crew_consciousness_cli_1.CrewConsciousnessCLI; } });
// Anti-Hallucination System
var anti_hallucination_1 = require("./anti-hallucination");
Object.defineProperty(exports, "AntiHallucinationSystem", { enumerable: true, get: function () { return anti_hallucination_1.AntiHallucinationSystem; } });
Object.defineProperty(exports, "LLMOptimizer", { enumerable: true, get: function () { return anti_hallucination_1.LLMOptimizer; } });
Object.defineProperty(exports, "HallucinationDetector", { enumerable: true, get: function () { return anti_hallucination_1.HallucinationDetector; } });
Object.defineProperty(exports, "UniversalCrewActivation", { enumerable: true, get: function () { return anti_hallucination_1.UniversalCrewActivation; } });
Object.defineProperty(exports, "HallucinationCorrector", { enumerable: true, get: function () { return anti_hallucination_1.HallucinationCorrector; } });
Object.defineProperty(exports, "createAntiHallucinationSystem", { enumerable: true, get: function () { return anti_hallucination_1.createAntiHallucinationSystem; } });
Object.defineProperty(exports, "AntiHallucinationUtils", { enumerable: true, get: function () { return anti_hallucination_1.AntiHallucinationUtils; } });
Object.defineProperty(exports, "DEFAULT_ANTI_HALLUCINATION_CONFIG", { enumerable: true, get: function () { return anti_hallucination_1.DEFAULT_ANTI_HALLUCINATION_CONFIG; } });
//# sourceMappingURL=index.js.map