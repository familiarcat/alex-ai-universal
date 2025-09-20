#!/usr/bin/env node

/**
 * Simple Alex AI CLI - Minimal Working Version
 */

import { MinimalAlexAI } from '@alex-ai/core';
import { CrewSelfDiscoveryCLI } from '@alex-ai/core';
import { N8NWorkflowCLI } from '@alex-ai/core';
import { ScenarioAnalysisCLI } from '@alex-ai/core';
import { CrewConsciousnessCLI } from '@alex-ai/core';
import * as commander from 'commander';

const program = new commander.Command();
const alexAI = new MinimalAlexAI();

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
  .action((message: string) => {
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
const crewDiscoveryCLI = new CrewSelfDiscoveryCLI();
crewDiscoveryCLI.initializeCommands(program);

// Initialize N8N workflow CLI
const n8nWorkflowCLI = new N8NWorkflowCLI();
n8nWorkflowCLI.initializeCommands(program);

// Initialize scenario analysis CLI
const scenarioAnalysisCLI = new ScenarioAnalysisCLI();
scenarioAnalysisCLI.initializeCommands(program);

// Initialize crew consciousness CLI
const crewConsciousnessCLI = new CrewConsciousnessCLI();
crewConsciousnessCLI.initializeCommands(program);

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}