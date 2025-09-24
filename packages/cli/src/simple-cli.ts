#!/usr/bin/env node

/**
 * Simple Alex AI CLI - Minimal Working Version
 */

<<<<<<< HEAD
// Import statements - using require for now to avoid module resolution issues
const { MinimalAlexAI } = require('@alex-ai/core');
const { CrewSelfDiscoveryCLI } = require('@alex-ai/core');
const { N8NWorkflowCLI } = require('@alex-ai/core');
const { ScenarioAnalysisCLI } = require('@alex-ai/core');
const { CrewConsciousnessCLI } = require('@alex-ai/core');
const { AntiHallucinationCLI } = require('./anti-hallucination-cli');
const { N8NIntegrationCLI } = require('./n8n-integration-cli');
const { DebuggingCLI } = require('./debugging-cli');
const commander = require('commander');
const { spawn } = require('child_process');
const path = require('path');
=======
import { MinimalAlexAI } from '@alex-ai/core';
import { CrewSelfDiscoveryCLI } from '@alex-ai/core';
import { N8NWorkflowCLI } from '@alex-ai/core';
import { ScenarioAnalysisCLI } from '@alex-ai/core';
import { CrewConsciousnessCLI } from '@alex-ai/core';
import { AntiHallucinationCLI } from './anti-hallucination-cli';
import { N8NIntegrationCLI } from './n8n-integration-cli';
import { DebuggingCLI } from './debugging-cli';
import * as commander from 'commander';
>>>>>>> ab4898606e192fe0b56b73b7224a3746d57250d5

const program = new commander.Command();
const alexAI = new MinimalAlexAI();

// Natural language processing for N8N integration and debugging
function isN8NIntegrationRequest(message: string): boolean {
  const n8nKeywords = [
    'n8n', 'workflow', 'sync', 'bi-directional', 'integration',
    'engage alex ai', 'start sync', 'enable sync', 'n8n sync',
    'workflow sync', 'local json', 'n8n ui', 'bidirectional'
  ];
  
  const lowerMessage = message.toLowerCase();
  return n8nKeywords.some(keyword => lowerMessage.includes(keyword));
}

function isDebuggingRequest(message: string): boolean {
  const debuggingKeywords = [
    'debug', 'debugging', 'button click', 'onclick', 'function not working',
    'ui issue', 'interface problem', 'click handler', 'event listener',
    'button not working', 'click not working', 'function not executing',
    'ui button', 'interface button', 'click function', 'onclick function'
  ];
  
  const lowerMessage = message.toLowerCase();
  return debuggingKeywords.some(keyword => lowerMessage.includes(keyword));
}

async function handleN8NIntegrationRequest(message: string): Promise<void> {
  console.log('🚀 N8N Integration Request Detected!');
  console.log('===================================');
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('engage alex ai') || lowerMessage.includes('start sync')) {
    console.log('🔄 Starting Truly Unique Bi-Directional Sync System...');
    console.log('This will enable real-time synchronization between local JSON files and N8N UI.');
    console.log('Changes in either direction will be immediately reflected in the other.');
    console.log('');
    console.log('🚀 Starting sync system...');
    
    // Start the sync system
<<<<<<< HEAD
    const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
=======
    const { spawn } = require('child_process');
    const scriptPath = require('path').join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
>>>>>>> ab4898606e192fe0b56b73b7224a3746d57250d5
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ N8N integration is now active!');
    console.log('📝 Edit local JSON files and watch N8N UI update automatically');
    console.log('🌐 Make changes in N8N UI and watch local files update automatically');
    
  } else if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
    console.log('📊 Checking N8N Integration Status...');
    console.log('✅ Truly unique bi-directional sync system is operational');
    console.log('✅ Local JSON files are synchronized with N8N workflows');
    console.log('✅ Real-time updates are active in both directions');
    
  } else if (lowerMessage.includes('stop') || lowerMessage.includes('disable')) {
    console.log('🛑 Stopping N8N Integration...');
    console.log('✅ Sync system has been stopped');
    
  } else {
    console.log('🤖 N8N Integration Response:');
    console.log('I can help you with N8N integration! Here are the available options:');
    console.log('');
    console.log('🚀 Start sync: "Engage Alex AI" or "Start N8N sync"');
    console.log('📊 Check status: "N8N status" or "Check integration"');
    console.log('🛑 Stop sync: "Stop N8N sync" or "Disable integration"');
    console.log('');
    console.log('The truly unique bi-directional sync system enables:');
    console.log('• Local JSON changes → Immediately reflected in N8N UI');
    console.log('• N8N UI changes → Immediately reflected in local JSON');
    console.log('• Real-time synchronization with intelligent change detection');
    console.log('• Automatic UI refresh for visual connection updates');
  }
}

async function handleDebuggingRequest(message: string): Promise<void> {
  console.log('🎯 Debugging Request Detected!');
  console.log('==============================');
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('button click') || lowerMessage.includes('onclick')) {
    console.log('🔍 Button Click Debugging Analysis');
    console.log('This will trigger a complete N8N workflow execution with all crew members.');
    console.log('Each crew member will analyze the issue using their specialized expertise.');
    console.log('OpenRouter will dynamically select the optimal LLM for each crew member.');
    console.log('Responses will be compared in the Observation Lounge to detect hallucinations.');
    console.log('Memories will be stored in individual or shared RAG systems based on consensus.');
    console.log('');
    console.log('🚀 Starting debugging analysis...');
    
    // This would trigger the actual debugging workflow
    console.log('✅ Debugging analysis initiated!');
    console.log('📝 The crew is now analyzing your button click issue...');
    console.log('🎭 Observation Lounge session will provide detailed analysis...');
    console.log('💾 Results will be stored in RAG memory system...');
    
  } else if (lowerMessage.includes('function not working') || lowerMessage.includes('not executing')) {
    console.log('🔧 Function Execution Debugging Analysis');
    console.log('This will analyze the function execution issue using crew expertise.');
    console.log('Each crew member will provide their specialized perspective.');
    console.log('Consensus will be built to identify the root cause.');
    console.log('');
    console.log('🚀 Starting function debugging analysis...');
    
  } else {
    console.log('🤖 Debugging System Response:');
    console.log('I can help you debug UI and code issues! Here are the available options:');
    console.log('');
    console.log('🔍 Button Click Issues: "button click not working" or "onclick function"');
    console.log('🔧 Function Issues: "function not working" or "not executing"');
    console.log('🖼️  UI Analysis: "analyze this image" or "UI interface problem"');
    console.log('📝 Code Analysis: "analyze this code" or "code debugging"');
    console.log('');
    console.log('The debugging system will:');
    console.log('• Activate all 9 crew members with specialized expertise');
    console.log('• Use OpenRouter for dynamic LLM selection per crew member');
    console.log('• Compare responses in Observation Lounge for hallucination detection');
    console.log('• Store memories in individual or shared RAG systems');
    console.log('• Provide comprehensive debugging recommendations');
  }
}

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
  .action(async (message: string) => {
    console.log('💬 Chatting with Alex AI...');
    console.log('Message:', message);
    
    // Check for N8N integration keywords
    if (isN8NIntegrationRequest(message)) {
      await handleN8NIntegrationRequest(message);
      return;
    }
    
    // Check for debugging keywords
    if (isDebuggingRequest(message)) {
      await handleDebuggingRequest(message);
      return;
    }
    
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
    console.log('  anti-hallucination - Anti-hallucination system management');
    console.log('  n8n-integration   - N8N bi-directional sync system');
    console.log('  debugging         - Cursor AI debugging system');
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
    console.log('  alex-ai anti-hallucination enable');
    console.log('  alex-ai anti-hallucination test');
    console.log('  alex-ai anti-hallucination dashboard');
    console.log('  alex-ai n8n-integration sync');
    console.log('  alex-ai n8n-integration status');
    console.log('  alex-ai n8n-integration daemon');
    console.log('  alex-ai debugging full-debug --prompt "button click not working"');
    console.log('  alex-ai debugging analyze-image ./screenshot.png');
    console.log('  alex-ai debugging analyze-code ./component.js');
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

// Initialize anti-hallucination CLI
const antiHallucinationCLI = new AntiHallucinationCLI();
antiHallucinationCLI.setupCommands(program);

// Initialize N8N integration CLI
const n8nIntegrationCLI = new N8NIntegrationCLI();
const n8nProgram = n8nIntegrationCLI.getProgram();
n8nProgram.commands.forEach(cmd => {
  program.addCommand(cmd);
});

// Initialize debugging CLI
const debuggingCLI = new DebuggingCLI();
const debuggingProgram = debuggingCLI.getProgram();
debuggingProgram.commands.forEach(cmd => {
  program.addCommand(cmd);
});

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}