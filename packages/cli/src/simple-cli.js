#!/usr/bin/env node
"use strict";
/**
 * Simple Alex AI CLI - Minimal Working Version
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@alex-ai/core");
const core_2 = require("@alex-ai/core");
const core_3 = require("@alex-ai/core");
const core_4 = require("@alex-ai/core");
const core_5 = require("@alex-ai/core");
const commander = __importStar(require("commander"));
const program = new commander.Command();
const alexAI = new core_1.MinimalAlexAI();
program
    .name('alex-ai')
    .description('Alex AI Universal - AI Code Assistant')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize Alex AI')
    .action(async () => {
    console.log('🚀 Initializing Alex AI...');
    await alexAI.initialize();
    console.log('✅ Alex AI initialized successfully!');
});
program
    .command('status')
    .description('Check Alex AI status')
    .action(() => {
    console.log('📊 Checking Alex AI status...');
    const status = alexAI.getStatus();
    console.log('Status:', status);
});
program
    .command('chat <message>')
    .description('Chat with Alex AI')
    .action((message) => {
    console.log('💬 Chatting with Alex AI...');
    console.log('Message:', message);
    console.log('Response: Hello! I am Alex AI, your AI code assistant. How can I help you today?');
});
program
    .command('help')
    .description('Show help information')
    .action(() => {
    console.log('🖖 Alex AI Universal - AI Code Assistant');
    console.log('');
    console.log('Available commands:');
    console.log('  init              - Initialize Alex AI');
    console.log('  status            - Check Alex AI status');
    console.log('  chat              - Chat with Alex AI');
    console.log('  crew-discovery    - Crew self-discovery system');
    console.log('  n8n-workflows     - N8N workflow management');
    console.log('  scenario-analysis - Comprehensive project scenario analysis');
    console.log('  crew-consciousness - Crew consciousness and project analysis');
    console.log('  help              - Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  alex-ai init');
    console.log('  alex-ai status');
    console.log('  alex-ai chat "Hello Alex AI"');
    console.log('  alex-ai crew-discovery demo');
    console.log('  alex-ai n8n-workflows demo');
    console.log('  alex-ai scenario-analysis end-to-end-test');
    console.log('  alex-ai crew-consciousness demo');
    console.log('  alex-ai crew-consciousness quick-analyze');
});
// Initialize crew self-discovery CLI
const crewDiscoveryCLI = new core_2.CrewSelfDiscoveryCLI();
crewDiscoveryCLI.initializeCommands(program);
// Initialize N8N workflow CLI
const n8nWorkflowCLI = new core_3.N8NWorkflowCLI();
n8nWorkflowCLI.initializeCommands(program);
// Initialize scenario analysis CLI
const scenarioAnalysisCLI = new core_4.ScenarioAnalysisCLI();
scenarioAnalysisCLI.initializeCommands(program);
// Initialize crew consciousness CLI
const crewConsciousnessCLI = new core_5.CrewConsciousnessCLI();
crewConsciousnessCLI.initializeCommands(program);
// Parse command line arguments
program.parse();
// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=simple-cli.js.map