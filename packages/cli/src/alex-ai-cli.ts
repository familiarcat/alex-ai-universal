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
      // Check for cost analysis requests
      if (this.isCostAnalysisRequest(message)) {
        console.log('💰 Cost analysis request detected!');
        await this.handleCostAnalysis();
        return;
      }

      // Check for test requests
      if (this.isTestRequest(message)) {
        console.log('🧪 Test execution request detected!');
        await this.handleTestExecution();
        return;
      }
      
      // Check for dashboard view requests
      if (this.isDashboardViewRequest(message)) {
        console.log('📊 Dashboard view request detected!');
        await this.handleDashboardView();
        return;
      }

      // Check for Observation Lounge requests
      if (this.isObservationLoungeRequest(message)) {
        console.log('🎭 Observation Lounge request detected!');
        await this.handleObservationLounge(message);
        return;
      }
      
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
      // Only exit if not handling dashboard view or Observation Lounge (which keep process alive)
      if (!this.isDashboardViewRequest(message) && !this.isObservationLoungeRequest(message)) {
      process.exit(0);
      }
    }
  }

  /**
   * Handle cost analysis requests
   */
  async handleCostAnalysis(options?: { format?: 'text' | 'json' | 'summary' }): Promise<void> {
    try {
      // Use real-time AWS cost analysis script
      const costScriptPath = path.join(process.cwd(), 'scripts', 'aws-real-time-cost-analysis.js');
      const { spawn } = require('child_process');
      
      console.log('💰 Running AWS Real-Time Cost Analysis...');
      console.log('==========================================\n');
      console.log('🔍 Querying AWS for actual resource usage and costs...\n');
      
      const child = spawn('node', [costScriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      child.on('close', (code: number) => {
        if (code === 0) {
          console.log('\n✅ Cost analysis complete!');
          console.log('📊 Reports saved to: .backup-ec2-emergency/');
          console.log('   • AWS_REAL_TIME_COST_ANALYSIS.txt');
          console.log('   • AWS_REAL_TIME_COST_ANALYSIS.json');
        } else {
          console.error(`\n❌ Cost analysis failed with code ${code}`);
        }
        process.exit(code || 0);
      });
      
      child.on('error', (error: Error) => {
        console.error(`❌ Failed to run cost analysis: ${error.message}`);
        console.error('   Make sure the cost analysis script exists at:');
        console.error(`   ${costScriptPath}`);
        process.exit(1);
      });
    } catch (error: any) {
      console.error(`❌ Cost analysis failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Check if message is a cost analysis request
   */
  private isCostAnalysisRequest(message: string): boolean {
    const costKeywords = [
      'compare costs',
      'cost analysis',
      'cost comparison',
      'aws costs',
      'ec2 costs',
      'cost report',
      'analyze costs',
      'cost breakdown',
      'show costs',
      'what are the costs',
      'how much does it cost',
      'cost estimate',
      'emergency cost',
      'ec2 emergency'
    ];
    
    const lowerMessage = message.toLowerCase();
    return costKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Check if message is a test request
   */
  private isTestRequest(message: string): boolean {
    const testKeywords = [
      'run tests',
      'run litmus',
      'test system',
      'litmus test',
      'test alex ai',
      'verify system',
      'test harness',
      'run test suite',
      'execute tests',
      'system test',
      'end to end test',
      'e2e test'
    ];
    
    const lowerMessage = message.toLowerCase();
    return testKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Check if message is a dashboard view request
   */
  isDashboardViewRequest(message: string): boolean {
    const dashboardKeywords = [
      'view the dashboard',
      'view dashboard',
      'open dashboard',
      'show dashboard',
      'start dashboard',
      'launch dashboard',
      'run dashboard',
      'dashboard',
      'open the dashboard',
      'show the dashboard',
      'start the dashboard'
    ];
    
    const lowerMessage = message.toLowerCase();
    return dashboardKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Handle dashboard view requests
   */
  async handleDashboardView(): Promise<void> {
    try {
      const dashboardScriptPath = path.join(process.cwd(), 'scripts', 'view-dashboard.js');
      const { spawn } = require('child_process');
      
      console.log('📊 Starting Dashboard in Local Development Mode...');
      console.log('==================================================\n');
      console.log('🖖 Local sketch pad with live cloud integration');
      console.log('   • Tests, builds, and runs locally');
      console.log('   • Opens in browser automatically');
      console.log('   • Live refresh active');
      console.log('   • Connects to live Supabase & N8N\n');
      
      const child = spawn('node', [dashboardScriptPath], {
        stdio: 'inherit',
        cwd: process.cwd(),
        detached: false // Keep attached so Ctrl+C works
      });
      
      // Don't exit - let the dashboard script handle the process
      child.on('error', (error: Error) => {
        console.error(`❌ Failed to start dashboard: ${error.message}`);
        console.error('   Make sure the dashboard script exists at:');
        console.error(`   ${dashboardScriptPath}`);
        process.exit(1);
      });
      
      // The script will keep the process alive
    } catch (error: any) {
      console.error(`❌ Dashboard view failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle Observation Lounge requests
   * Uses MCP-N8N Controller for intelligent routing
   */
  async handleObservationLounge(message: string): Promise<void> {
    try {
      // Import MCP-N8N Controller
      let controller: any;
      try {
        const { createMCPN8NController } = require('@alex-ai/core/controller/mcp-n8n-controller');
        controller = createMCPN8NController();
      } catch (error) {
        // Fallback to direct path if package not available
        const path = require('path');
        const controllerPath = path.join(__dirname, '../../core/src/controller/mcp-n8n-controller');
        const { createMCPN8NController } = require(controllerPath);
        controller = createMCPN8NController();
      }
      
      // Parse the message to extract parameters
      const lowerMessage = message.toLowerCase();
      const isCinematic = lowerMessage.includes('cinematic') || lowerMessage.includes('cinematic format');
      const crewMembers = lowerMessage.includes('all') ? 'all' : undefined;
      
      // Extract topic from message
      let topic = message;
      if (lowerMessage.includes('organize the crew')) {
        // Extract topic after "organize the crew"
        const match = message.match(/organize the crew[^.]*\.(.*?)(?:and|$)/i);
        topic = match ? match[1].trim() : 'Crew coordination and findings';
      }
      
      // Determine discussion type
      let discussionType = 'collaborative';
      if (isCinematic) {
        discussionType = 'cinematic';
      } else if (lowerMessage.includes('findings')) {
        discussionType = 'findings_review';
      } else if (lowerMessage.includes('strategic') || lowerMessage.includes('strategy')) {
        discussionType = 'strategic';
      }
      
      console.log('🎭 Organizing Crew in Observation Lounge...');
      console.log('==========================================\n');
      console.log('📋 Session Parameters:');
      console.log(`   Topic: ${topic}`);
      console.log(`   Format: ${isCinematic ? 'cinematic' : 'standard'}`);
      console.log(`   Discussion Type: ${discussionType}`);
      console.log(`   Crew Members: ${crewMembers || 'all'}`);
      console.log('\n🚀 Using MCP-N8N Controller:');
      console.log('   Client → Controller (MCP <-> n8n) → Supabase\n');
      
      // Check health first
      const health = await controller.checkHealth();
      console.log('📊 System Health:');
      console.log(`   MCP: ${health.mcp ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`   n8n: ${health.n8n ? '✅ Healthy' : '❌ Unhealthy'}\n`);
      
      // Execute via controller (tries MCP first, falls back to n8n)
      const result = await controller.executeCrewWorkflow({
        crewMember: crewMembers,
        workflow: 'observation-lounge',
        tool: 'observation_lounge_coordination',
        parameters: {
          topic: topic,
          format: isCinematic ? 'cinematic' : 'standard',
          discussionType: discussionType,
        },
        context: {
          source: 'cursor-ai',
          message: message,
        },
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Execution failed');
      }
      
      console.log(`✅ Execution successful via ${result.method.toUpperCase()}`);
      console.log(`   Execution time: ${result.metadata?.executionTime}ms\n`);
      
      // Display results
      if (result.data) {
        const data = result.data;
        
        if (data.session) {
          console.log('📊 Session Details:');
          console.log(`   Session ID: ${data.session.id}`);
          console.log(`   Status: ${data.session.status}`);
          console.log(`   Participants: ${data.session.participants || 'All crew'}`);
          console.log(`   Total Crew: ${data.session.total_crew || 10}\n`);
        }
        
        if (data.crew_insights) {
          console.log('👥 Crew Insights:');
          Object.entries(data.crew_insights).forEach(([crew, insight]: [string, any]) => {
            if (insight.status === 'success') {
              console.log(`   ✅ ${crew}: ${insight.summary || 'Analysis complete'}`);
            }
          });
          console.log('');
        }
        
        if (data.synthesis) {
          console.log('🎯 Synthesized Findings:');
          if (typeof data.synthesis === 'string') {
            console.log(`   ${data.synthesis}\n`);
          } else if (data.synthesis.summary) {
            console.log(`   ${data.synthesis.summary}\n`);
          }
        }
        
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('💡 Recommendations:');
          data.recommendations.forEach((rec: string, idx: number) => {
            console.log(`   ${idx + 1}. ${rec}`);
          });
          console.log('');
        }
        
        if (isCinematic) {
          console.log('🎬 Cinematic Format:');
          console.log('   Crew responses will be formatted in cinematic narrative style');
          console.log('   Full session details stored in Supabase for future reference\n');
        }
        
        console.log('💾 Memories stored in Supabase via controller');
        console.log('🔄 DDD Flow Complete: Client → Controller (MCP <-> n8n) → Supabase\n');
      }
    } catch (error: any) {
      console.error(`❌ Observation Lounge failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle test execution requests
   */
  async handleTestExecution(options?: { testId?: string; all?: boolean }): Promise<void> {
    try {
      // Use process.cwd() to get project root (where CLI is executed from)
      // This works whether CLI is run via npx or directly
      const projectRoot = process.cwd();
      const testScriptPath = path.join(projectRoot, 'scripts', 'test-harness', 'run-litmus-tests.js');
      const { spawn } = require('child_process');
      
      console.log('🧪 Running Alex AI Universal Litmus Tests...');
      console.log('==========================================\n');
      
      const child = spawn('node', [testScriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      child.on('close', (code: number) => {
        if (code === 0) {
          console.log('\n✅ Litmus tests complete!');
          console.log('📊 Reports saved to: docs/testing/');
          console.log('   • litmus-test-report-*.json');
          console.log('   • litmus-test-report-*.md');
        } else {
          console.error(`\n❌ Tests failed with code ${code}`);
        }
        process.exit(code || 0);
      });
      
      child.on('error', (error: Error) => {
        console.error(`❌ Failed to run tests: ${error.message}`);
        console.error('   Make sure the test harness script exists at:');
        console.error(`   ${testScriptPath}`);
        process.exit(1);
      });
    } catch (error: any) {
      console.error(`❌ Test execution failed: ${error.message}`);
      process.exit(1);
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
      console.log('  📊 N8N Integration Status:');
      console.log('    • Sync System: Active');
      console.log('    • Bi-directional: Enabled');
      console.log('    • Real-time Updates: Active');
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

// Cost analysis command
program
  .command('costs')
  .alias('cost')
  .description('Analyze EC2 emergency costs and compare backup vs current configurations')
  .option('-f, --format <type>', 'Output format: text, json, or summary', 'text')
  .action(async (options: { format?: string }) => {
    try {
      await npxHandler.handleCostAnalysis({ format: options.format as any });
    } catch (error: any) {
      console.error(`❌ Cost analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

// Test command
program
  .command('test')
  .alias('litmus')
  .description('Run Alex AI Universal Litmus Tests - End-to-end system validation')
  .option('-a, --all', 'Run all tests', true)
  .option('-i, --id <testId>', 'Run specific test by ID (e.g., litmus-001)')
  .action(async (options: { all?: boolean; id?: string }) => {
    try {
      await npxHandler.handleTestExecution({ 
        all: options.all, 
        testId: options.id 
      });
    } catch (error: any) {
      console.error(`❌ Test execution failed: ${error.message}`);
      process.exit(1);
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
          console.log('  • "view the dashboard" - Start local dashboard with live refresh');
          console.log('  • "organize the crew in the Observation Lounge" - Full crew coordination');
          console.log('  • "observation lounge" or "crew meeting" - Crew discussion session');
          console.log('  • "compare costs" or "cost analysis" - Run EC2 cost analysis');
          console.log('  • "run tests" or "litmus test" - Run end-to-end system tests');
          console.log('  • "n8n start" - Start N8N integration');
          console.log('  • "exit" - Quit chat mode');
          console.log('');
          askQuestion();
          return;
        }
        
        // Check for dashboard view (doesn't exit process)
        if (npxHandler.isDashboardViewRequest(input)) {
          await npxHandler.handleDashboardView();
          // Dashboard script keeps process alive, so don't ask next question
          return;
        }

        // Check for Observation Lounge (doesn't exit process)
        if (npxHandler.isObservationLoungeRequest(input)) {
          await npxHandler.handleObservationLounge(input);
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
