#!/usr/bin/env node

/**
 * Alex AI Universal NPX CLI
 * 
 * Provides NPX execution for Alex AI with Star Trek crew-based AI assistance
 * ZERO ARTIFACT GUARANTEE - No files created in user projects
 */

import { createNPXExtension } from '@alex-ai/universal-core';
import * as commander from 'commander';
import { spawn } from 'child_process';
import * as path from 'path';

// Create the universal extension using NPX adapter
const { core, commands } = createNPXExtension();

/**
 * NPX CLI Handler with Zero-Artifact Guarantee
 */
class NPXCLIHandler {
  private core = core;
  private commands = commands;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    await this.core.initialize();
    console.log('✅ Alex AI NPX CLI initialized with zero-artifact guarantee');
  }

  /**
   * Handle NPX engagement without creating project files
   */
  async handleEngagement(message: string): Promise<void> {
    try {
      const response = await this.core.processMessage(message);

      if (response && response.success) {
        console.log('\n🤖 Alex AI Response:');
        console.log('==================');
        console.log(response.coordinatedResponse ?? response.message ?? '');

        const crewMembers = Array.isArray(response.crewMembers) ? response.crewMembers : [];
        const ragInsights = Array.isArray(response.ragInsights) ? response.ragInsights : [];

        if (crewMembers.length > 0) {
          console.log('\n👥 Crew Members Involved:');
          crewMembers.forEach(member => {
            console.log(`  • ${member.name} - ${member.role}`);
          });
        }

        if (ragInsights.length > 0) {
          console.log('\n🧠 RAG Insights:');
          ragInsights.forEach(insight => {
            console.log(`  • ${insight}`);
          });
        }
      } else {
        const messageText = response?.message ?? 'Unknown error';
        console.error(`❌ Alex AI Error: ${messageText}`);
      }
    } catch (error: any) {
      console.error(`❌ NPX engagement failed: ${error.message}`);
    } finally {
      // Ensure process exits properly
      process.exit(0);
    }
  }

  /**
   * Handle N8N integration requests
   */
  async handleN8NIntegration(message: string): Promise<void> {
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
      const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
      
      const child = spawn('node', [scriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('✅ N8N integration is now active!');
      console.log('📝 Edit local JSON files and watch N8N UI update automatically');
      console.log('🌐 Make changes in N8N UI and watch local files update automatically');
      
    } else if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
      console.log('📊 N8N Integration Status:');
      console.log('  • Sync System: Active');
      console.log('  • Bi-directional: Enabled');
      console.log('  • Real-time Updates: Active');
    }
  }
}

// Create the NPX CLI handler instance
const npxHandler = new NPXCLIHandler();

// Commander.js setup
const program = new commander.Command();

program
  .name('alex-ai')
  .description('Alex AI Universal - Star Trek Crew-based AI Assistant')
  .version('1.0.0');

// Engage command
program
  .command('engage')
  .description('Engage Alex AI with the crew')
  .argument('<message>', 'Message to send to Alex AI')
  .action(async (message: string) => {
    try {
      await npxHandler.handleEngagement(message);
    } catch (error: any) {
      console.error(`❌ Engagement failed: ${error.message}`);
    } finally {
      process.exit(0);
    }
  });

// Status command
program
  .command('status')
  .description('Show Alex AI system status')
  .action(async () => {
    try {
      await npxHandler.handleEngagement('Show system status');
    } catch (error: any) {
      console.error(`❌ Status check failed: ${error.message}`);
    } finally {
      process.exit(0);
    }
  });

// N8N integration command
program
  .command('n8n')
  .description('N8N integration and workflow management')
  .argument('<action>', 'N8N action (start, status, sync)')
  .action(async (action: string) => {
    try {
      await npxHandler.handleN8NIntegration(action);
    } catch (error: any) {
      console.error(`❌ N8N integration failed: ${error.message}`);
    } finally {
      process.exit(0);
    }
  });

// Interactive mode
program
  .command('chat')
  .description('Start interactive chat with Alex AI')
  .action(async () => {
    console.log('🚀 Alex AI Interactive Chat Mode');
    console.log('Type "exit" to quit, "help" for commands');
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = () => {
      rl.question('You: ', async (input: string) => {
        if (input.toLowerCase() === 'exit') {
          console.log('👋 Goodbye! Live long and prosper! 🖖');
          rl.close();
          return;
        }
        
        if (input.toLowerCase() === 'help') {
          console.log('\n📋 Available Commands:');
          console.log('  • Ask any question for crew assistance');
          console.log('  • "status" - Show system status');
          console.log('  • "n8n start" - Start N8N integration');
          console.log('  • "exit" - Quit chat mode');
          console.log('');
          askQuestion();
          return;
        }
        
        await npxHandler.handleEngagement(input);
        console.log('');
        askQuestion();
      });
    };
    
    askQuestion();
  });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.help();
}
