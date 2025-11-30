#!/usr/bin/env node

/**
 * 🎯 Debugging CLI
 * 
 * Provides CLI commands for the Cursor AI debugging system
 */

import { Command } from 'commander';
import { DebuggingCoordinator, DebuggingRequest } from '@alex-ai/core';
import * as fs from 'fs';
import * as path from 'path';

export class DebuggingCLI {
  private program: Command;
  private debuggingCoordinator: DebuggingCoordinator;

  constructor() {
    this.program = new Command('debugging');
    this.debuggingCoordinator = new DebuggingCoordinator();
    this.setupCommands();
  }

  private setupCommands() {
    // Main debugging command
    this.program
      .command('analyze')
      .description('Analyze debugging request with image and code analysis')
      .option('-i, --image <path>', 'Path to UI screenshot image')
      .option('-c, --code <path>', 'Path to code file to analyze')
      .option('-p, --prompt <text>', 'User prompt describing the debugging issue')
      .option('-x, --context <text>', 'Additional context for analysis')
      .option('--priority <level>', 'Priority level (low, medium, high, critical)', 'medium')
      .action(async (options) => {
        await this.analyzeDebuggingRequest(options);
      });

    // Image analysis command
    this.program
      .command('analyze-image <imagePath>')
      .description('Analyze UI screenshot for debugging')
      .option('-c, --context <text>', 'Additional context for analysis')
      .action(async (imagePath, options) => {
        await this.analyzeImage(imagePath, options);
      });

    // Code analysis command
    this.program
      .command('analyze-code <codePath>')
      .description('Analyze code file for debugging')
      .option('-e, --elements <elements>', 'UI elements to map to code')
      .option('-c, --context <text>', 'Additional context for analysis')
      .action(async (codePath, options) => {
        await this.analyzeCode(codePath, options);
      });

    // Crew orchestration command
    this.program
      .command('orchestrate')
      .description('Orchestrate crew debugging session')
      .option('-i, --image <path>', 'Path to image analysis result')
      .option('-c, --code <path>', 'Path to code analysis result')
      .option('-p, --prompt <text>', 'User prompt for debugging')
      .action(async (options) => {
        await this.orchestrateCrewSession(options);
      });

    // Observation lounge command
    this.program
      .command('observation-lounge')
      .description('Conduct observation lounge session')
      .option('-s, --session <id>', 'Debugging session ID')
      .action(async (options) => {
        await this.conductObservationLounge(options);
      });

    // Full debugging workflow
    this.program
      .command('full-debug')
      .description('Run complete debugging workflow')
      .option('-i, --image <path>', 'Path to UI screenshot image')
      .option('-c, --code <path>', 'Path to code file to analyze')
      .option('-p, --prompt <text>', 'User prompt describing the debugging issue')
      .option('-x, --context <text>', 'Additional context for analysis')
      .option('--priority <level>', 'Priority level (low, medium, high, critical)', 'medium')
      .action(async (options) => {
        await this.runFullDebuggingWorkflow(options);
      });

    // Get session summary
    this.program
      .command('session-summary <sessionId>')
      .description('Get debugging session summary')
      .action(async (sessionId) => {
        await this.getSessionSummary(sessionId);
      });

    // Get crew expertise
    this.program
      .command('crew-expertise')
      .description('Get crew member expertise summary')
      .action(async () => {
        await this.getCrewExpertise();
      });

    // Test debugging system
    this.program
      .command('test-debugging')
      .description('Test debugging system with sample data')
      .action(async () => {
        await this.testDebuggingSystem();
      });
  }

  /**
   * Analyze debugging request
   */
  private async analyzeDebuggingRequest(options: any) {
    console.log('🎯 Analyzing Debugging Request');
    console.log('==============================');
    
    if (!options.prompt) {
      console.error('❌ Prompt is required. Use --prompt to specify the debugging issue.');
      return;
    }
    
    try {
      const request: DebuggingRequest = {
        userPrompt: options.prompt,
        imagePath: options.image,
        codeFilePath: options.code,
        context: options.context,
        priority: options.priority
      };
      
      console.log('📝 Request Details:');
      console.log(`  Prompt: ${request.userPrompt}`);
      console.log(`  Image: ${request.imagePath || 'Not provided'}`);
      console.log(`  Code: ${request.codeFilePath || 'Not provided'}`);
      console.log(`  Context: ${request.context || 'Not provided'}`);
      console.log(`  Priority: ${request.priority}`);
      console.log('');
      
      const response = await this.debuggingCoordinator.processDebuggingRequest(request);
      
      console.log('✅ Debugging Analysis Complete');
      console.log('=============================');
      console.log(`Session ID: ${response.sessionId}`);
      console.log(`Confidence: ${response.confidence}%`);
      console.log(`Hallucination Detected: ${response.hallucinationDetected ? 'Yes' : 'No'}`);
      console.log(`Memory Storage: ${response.memoryStorageDecision}`);
      console.log('');
      
      console.log('🎯 Final Recommendations:');
      response.finalRecommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      console.log('');
      
      console.log('🔧 Debugging Steps:');
      response.debuggingSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
      
    } catch (error) {
      console.error('❌ Debugging analysis failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Analyze image
   */
  private async analyzeImage(imagePath: string, options: any) {
    console.log('🖼️  Analyzing Image');
    console.log('==================');
    
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image file not found: ${imagePath}`);
      return;
    }
    
    try {
      const { ImageAnalyzer } = await import('@alex-ai/core');
      const imageAnalyzer = new ImageAnalyzer();
      
      const result = await imageAnalyzer.analyzeImage(imagePath, options.context);
      
      console.log('✅ Image Analysis Complete');
      console.log('=========================');
      console.log(`Image: ${result.imagePath}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log(`UI Elements Found: ${result.uiElements.length}`);
      console.log(`Buttons Found: ${result.buttons.length}`);
      console.log('');
      
      if (result.buttons.length > 0) {
        console.log('🔘 Button Analysis:');
        result.buttons.forEach((button, index) => {
          console.log(`  ${index + 1}. ${button.element.text || 'Unnamed Button'}`);
          console.log(`     Click Handler: ${button.clickHandler || 'Not found'}`);
          console.log(`     Function: ${button.functionName || 'Not found'}`);
          console.log(`     Issues: ${button.potentialIssues.length}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Image analysis failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Analyze code
   */
  private async analyzeCode(codePath: string, options: any) {
    console.log('🔍 Analyzing Code');
    console.log('=================');
    
    if (!fs.existsSync(codePath)) {
      console.error(`❌ Code file not found: ${codePath}`);
      return;
    }
    
    try {
      const { CodeAnalyzer } = await import('@alex-ai/core');
      const codeAnalyzer = new CodeAnalyzer();
      
      const elements = options.elements ? options.elements.split(',') : undefined;
      const result = await codeAnalyzer.analyzeCode(codePath, elements, options.context);
      
      console.log('✅ Code Analysis Complete');
      console.log('========================');
      console.log(`File: ${result.filePath}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log(`Functions Found: ${result.functions.length}`);
      console.log(`Click Handlers: ${result.clickHandlers.length}`);
      console.log('');
      
      if (result.functions.length > 0) {
        console.log('🔧 Functions:');
        result.functions.forEach((func, index) => {
          console.log(`  ${index + 1}. ${func.name} (${func.type})`);
          console.log(`     File: ${func.file}:${func.line}`);
          console.log(`     Async: ${func.isAsync ? 'Yes' : 'No'}`);
          console.log(`     Error Handling: ${func.hasErrorHandling ? 'Yes' : 'No'}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Code analysis failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Orchestrate crew session
   */
  private async orchestrateCrewSession(options: any) {
    console.log('🎭 Orchestrating Crew Session');
    console.log('==============================');
    
    if (!options.prompt) {
      console.error('❌ Prompt is required. Use --prompt to specify the debugging issue.');
      return;
    }
    
    try {
      // This would load image and code analysis results
      // For now, create mock data
      const mockImageAnalysis = {
        imagePath: options.image || 'mock-image.png',
        timestamp: new Date().toISOString(),
        uiElements: [],
        buttons: [],
        potentialClickIssues: [],
        debuggingRecommendations: [],
        confidence: 85
      };
      
      const mockCodeAnalysis = {
        filePath: options.code || 'mock-code.js',
        functions: [],
        clickHandlers: [],
        potentialIssues: [],
        debuggingSuggestions: [],
        confidence: 90,
        timestamp: new Date().toISOString()
      };
      
      const { DebuggingOrchestrator } = await import('@alex-ai/core');
      const orchestrator = new DebuggingOrchestrator();
      
      const session = await orchestrator.orchestrateDebuggingSession(
        mockImageAnalysis,
        mockCodeAnalysis,
        options.prompt
      );
      
      console.log('✅ Crew Session Complete');
      console.log('=======================');
      console.log(`Session ID: ${session.sessionId}`);
      console.log(`Crew Responses: ${session.crewResponses.length}`);
      console.log(`Consensus: ${session.consensus}`);
      console.log(`Hallucination Detected: ${session.hallucinationDetected ? 'Yes' : 'No'}`);
      
    } catch (error) {
      console.error('❌ Crew orchestration failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Conduct observation lounge
   */
  private async conductObservationLounge(options: any) {
    console.log('🎭 Conducting Observation Lounge Session');
    console.log('========================================');
    
    if (!options.session) {
      console.error('❌ Session ID is required. Use --session to specify the session ID.');
      return;
    }
    
    try {
      // This would load the debugging session
      // For now, create mock data
      const mockDebuggingSession = {
        sessionId: options.session,
        imageAnalysis: {} as any,
        codeAnalysis: {} as any,
        crewResponses: [],
        consensus: 'Mock consensus',
        finalRecommendations: [],
        hallucinationDetected: false,
        memoryStorageDecision: 'individual' as const,
        timestamp: new Date().toISOString()
      };
      
      const { DebuggingObservationLounge } = await import('@alex-ai/core');
      const observationLounge = new DebuggingObservationLounge();
      
      const session = await observationLounge.conductObservationLoungeSession(mockDebuggingSession);
      
      console.log('✅ Observation Lounge Session Complete');
      console.log('=====================================');
      console.log(`Session ID: ${session.sessionId}`);
      console.log(`Crew Discussions: ${session.crewDiscussions.length}`);
      console.log(`Hallucination Analysis: ${session.hallucinationAnalysis.detected ? 'Detected' : 'Not detected'}`);
      console.log(`Consensus Level: ${session.consensusBuilding.consensusLevel}%`);
      console.log(`Memory Storage: ${session.memoryStorageDecision.strategy}`);
      
    } catch (error) {
      console.error('❌ Observation lounge failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Run full debugging workflow
   */
  private async runFullDebuggingWorkflow(options: any) {
    console.log('🎯 Running Full Debugging Workflow');
    console.log('==================================');
    
    if (!options.prompt) {
      console.error('❌ Prompt is required. Use --prompt to specify the debugging issue.');
      return;
    }
    
    try {
      const request: DebuggingRequest = {
        userPrompt: options.prompt,
        imagePath: options.image,
        codeFilePath: options.code,
        context: options.context,
        priority: options.priority
      };
      
      console.log('🚀 Starting complete debugging workflow...');
      console.log('');
      
      const response = await this.debuggingCoordinator.processDebuggingRequest(request);
      
      console.log('🎉 Full Debugging Workflow Complete!');
      console.log('===================================');
      console.log(`Session ID: ${response.sessionId}`);
      console.log(`Overall Confidence: ${response.confidence}%`);
      console.log(`Hallucination Detected: ${response.hallucinationDetected ? 'Yes' : 'No'}`);
      console.log(`Memory Storage Decision: ${response.memoryStorageDecision}`);
      console.log('');
      
      // Display crew responses
      console.log('🎭 Crew Member Responses:');
      response.debuggingSession.crewResponses.forEach((response, index) => {
        console.log(`  ${index + 1}. ${response.crewMember} (${response.specialization})`);
        console.log(`     LLM Used: ${response.llmUsed}`);
        console.log(`     Confidence: ${response.confidence}%`);
        console.log(`     Analysis: ${response.analysis.substring(0, 100)}...`);
        console.log('');
      });
      
      // Display final recommendations
      console.log('🎯 Final Recommendations:');
      response.finalRecommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      console.log('');
      
      // Display debugging steps
      console.log('🔧 Debugging Steps:');
      response.debuggingSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
      
    } catch (error) {
      console.error('❌ Full debugging workflow failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get session summary
   */
  private async getSessionSummary(sessionId: string) {
    console.log('📊 Debugging Session Summary');
    console.log('============================');
    
    try {
      const summary = this.debuggingCoordinator.getDebuggingSessionSummary(sessionId);
      console.log(summary);
      
    } catch (error) {
      console.error('❌ Failed to get session summary:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get crew expertise
   */
  private async getCrewExpertise() {
    console.log('🎭 Alex AI Crew Expertise');
    console.log('=========================');
    
    try {
      const expertise = this.debuggingCoordinator.getCrewMemberExpertiseSummary();
      console.log(expertise);
      
    } catch (error) {
      console.error('❌ Failed to get crew expertise:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Test debugging system
   */
  private async testDebuggingSystem() {
    console.log('🧪 Testing Debugging System');
    console.log('===========================');
    
    try {
      const testRequest: DebuggingRequest = {
        userPrompt: 'Test debugging request - button click not working',
        priority: 'medium'
      };
      
      console.log('Running test with mock data...');
      const response = await this.debuggingCoordinator.processDebuggingRequest(testRequest);
      
      console.log('✅ Test completed successfully!');
      console.log(`Session ID: ${response.sessionId}`);
      console.log(`Confidence: ${response.confidence}%`);
      console.log(`Crew Responses: ${response.debuggingSession.crewResponses.length}`);
      
    } catch (error) {
      console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get the CLI program
   */
  getProgram(): Command {
    return this.program;
  }
}

// Export for use in main CLI
export default DebuggingCLI;
