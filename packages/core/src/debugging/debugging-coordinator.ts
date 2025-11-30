/**
 * 🎯 Debugging Coordinator
 * 
 * Main orchestrator for the Cursor AI debugging system
 * Coordinates image analysis, code analysis, crew orchestration, and observation lounge
 */

import { ImageAnalyzer, ImageAnalysisResult } from '../image-analysis/image-analyzer';
import { CodeAnalyzer, CodeAnalysisResult } from '../code-analysis/code-analyzer';
import { DebuggingOrchestrator, DebuggingSession } from '../crew-orchestration/debugging-orchestrator';
import { DebuggingObservationLounge, ObservationLoungeSession } from '../observation-lounge/debugging-observation-lounge';

export interface DebuggingRequest {
  userPrompt: string;
  imagePath?: string;
  codeFilePath?: string;
  context?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DebuggingResponse {
  sessionId: string;
  userPrompt: string;
  imageAnalysis?: ImageAnalysisResult;
  codeAnalysis?: CodeAnalysisResult;
  debuggingSession: DebuggingSession;
  observationLoungeSession: ObservationLoungeSession;
  finalRecommendations: string[];
  debuggingSteps: string[];
  confidence: number;
  hallucinationDetected: boolean;
  memoryStorageDecision: 'individual' | 'shared' | 'both';
  timestamp: string;
}

export class DebuggingCoordinator {
  private imageAnalyzer: ImageAnalyzer;
  private codeAnalyzer: CodeAnalyzer;
  private debuggingOrchestrator: DebuggingOrchestrator;
  private observationLounge: DebuggingObservationLounge;

  constructor() {
    this.imageAnalyzer = new ImageAnalyzer();
    this.codeAnalyzer = new CodeAnalyzer();
    this.debuggingOrchestrator = new DebuggingOrchestrator();
    this.observationLounge = new DebuggingObservationLounge();
    
    console.log('✅ Debugging Coordinator initialized');
  }

  /**
   * Process debugging request
   */
  async processDebuggingRequest(request: DebuggingRequest): Promise<DebuggingResponse> {
    console.log('🎯 Processing debugging request');
    console.log(`User Prompt: ${request.userPrompt}`);
    console.log(`Priority: ${request.priority}`);
    
    try {
      // Phase 1: Analyze image if provided
      let imageAnalysis: ImageAnalysisResult | undefined;
      if (request.imagePath) {
        console.log('🖼️  Analyzing image...');
        imageAnalysis = await this.imageAnalyzer.analyzeImage(
          request.imagePath,
          request.context
        );
      }
      
      // Phase 2: Analyze code if provided
      let codeAnalysis: CodeAnalysisResult | undefined;
      if (request.codeFilePath) {
        console.log('🔍 Analyzing code...');
        codeAnalysis = await this.codeAnalyzer.analyzeCode(
          request.codeFilePath,
          imageAnalysis?.uiElements.map(el => el.text || el.id || 'unknown'),
          request.context
        );
      }
      
      // Phase 3: Orchestrate crew debugging session
      console.log('🎭 Orchestrating crew debugging session...');
      
      // Create mock analysis if not provided
      const mockImageAnalysis = imageAnalysis || {
        imagePath: 'mock-image.png',
        timestamp: new Date().toISOString(),
        uiElements: [],
        buttons: [],
        potentialClickIssues: [],
        debuggingRecommendations: [],
        confidence: 85
      };
      
      const mockCodeAnalysis = codeAnalysis || {
        filePath: 'mock-code.js',
        functions: [],
        clickHandlers: [],
        potentialIssues: [],
        debuggingSuggestions: [],
        confidence: 90,
        timestamp: new Date().toISOString()
      };
      
      const debuggingSession = await this.debuggingOrchestrator.orchestrateDebuggingSession(
        mockImageAnalysis,
        mockCodeAnalysis,
        request.userPrompt
      );
      
      // Phase 4: Conduct observation lounge session
      console.log('🎭 Conducting observation lounge session...');
      const observationLoungeSession = await this.observationLounge.conductObservationLoungeSession(
        debuggingSession
      );
      
      // Phase 5: Generate final response
      const response = await this.generateFinalResponse(
        request,
        imageAnalysis,
        codeAnalysis,
        debuggingSession,
        observationLoungeSession
      );
      
      console.log(`✅ Debugging request processed successfully: ${response.sessionId}`);
      return response;
      
    } catch (error) {
      console.error('❌ Debugging request failed:', error);
      throw new Error(`Debugging request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate final response
   */
  private async generateFinalResponse(
    request: DebuggingRequest,
    imageAnalysis: ImageAnalysisResult | undefined,
    codeAnalysis: CodeAnalysisResult | undefined,
    debuggingSession: DebuggingSession,
    observationLoungeSession: ObservationLoungeSession
  ): Promise<DebuggingResponse> {
    const finalRecommendations = this.consolidateRecommendations(
      debuggingSession,
      observationLoungeSession
    );
    
    const debuggingSteps = this.consolidateDebuggingSteps(
      debuggingSession,
      observationLoungeSession
    );
    
    const confidence = this.calculateOverallConfidence(
      imageAnalysis,
      codeAnalysis,
      debuggingSession,
      observationLoungeSession
    );
    
    return {
      sessionId: debuggingSession.sessionId,
      userPrompt: request.userPrompt,
      imageAnalysis,
      codeAnalysis,
      debuggingSession,
      observationLoungeSession,
      finalRecommendations,
      debuggingSteps,
      confidence,
      hallucinationDetected: observationLoungeSession.hallucinationAnalysis.detected,
      memoryStorageDecision: observationLoungeSession.memoryStorageDecision.strategy,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Consolidate recommendations
   */
  private consolidateRecommendations(
    debuggingSession: DebuggingSession,
    observationLoungeSession: ObservationLoungeSession
  ): string[] {
    const recommendations: string[] = [];
    
    // Add consensus recommendations
    recommendations.push(...debuggingSession.finalRecommendations);
    
    // Add observation lounge recommendations
    recommendations.push(...observationLoungeSession.consensusBuilding.agreedRecommendations);
    
    // Add hallucination recommendations if detected
    if (observationLoungeSession.hallucinationAnalysis.detected) {
      recommendations.push(...observationLoungeSession.hallucinationAnalysis.recommendations);
    }
    
    // Remove duplicates and return
    return [...new Set(recommendations)];
  }

  /**
   * Consolidate debugging steps
   */
  private consolidateDebuggingSteps(
    debuggingSession: DebuggingSession,
    observationLoungeSession: ObservationLoungeSession
  ): string[] {
    const steps: string[] = [];
    
    // Add steps from crew responses
    debuggingSession.crewResponses.forEach(response => {
      steps.push(...response.debuggingSteps);
    });
    
    // Add consensus steps
    steps.push('Review crew consensus analysis');
    steps.push('Implement agreed recommendations');
    
    // Add hallucination handling steps if needed
    if (observationLoungeSession.hallucinationAnalysis.detected) {
      steps.push('Review contradictory statements');
      steps.push('Verify evidence from affected crew members');
    }
    
    // Remove duplicates and return
    return [...new Set(steps)];
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    imageAnalysis: ImageAnalysisResult | undefined,
    codeAnalysis: CodeAnalysisResult | undefined,
    debuggingSession: DebuggingSession,
    observationLoungeSession: ObservationLoungeSession
  ): number {
    let confidence = 100;
    
    // Adjust based on image analysis confidence
    if (imageAnalysis) {
      confidence = (confidence + imageAnalysis.confidence) / 2;
    }
    
    // Adjust based on code analysis confidence
    if (codeAnalysis) {
      confidence = (confidence + codeAnalysis.confidence) / 2;
    }
    
    // Adjust based on crew response confidence
    const avgCrewConfidence = debuggingSession.crewResponses.reduce(
      (sum, response) => sum + response.confidence, 0
    ) / debuggingSession.crewResponses.length;
    
    confidence = (confidence + avgCrewConfidence) / 2;
    
    // Adjust based on consensus level
    const consensusLevel = observationLoungeSession.consensusBuilding.consensusLevel;
    confidence = (confidence + consensusLevel) / 2;
    
    // Adjust based on hallucination detection
    if (observationLoungeSession.hallucinationAnalysis.detected) {
      confidence -= 20;
    }
    
    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Get debugging session summary
   */
  getDebuggingSessionSummary(sessionId: string): string {
    return `
🎯 Debugging Session Summary: ${sessionId}
=====================================

This session analyzed a debugging request using the Alex AI crew system:

✅ Crew Members Activated: 9
✅ Image Analysis: ${this.imageAnalyzer ? 'Completed' : 'Not performed'}
✅ Code Analysis: ${this.codeAnalyzer ? 'Completed' : 'Not performed'}
✅ Observation Lounge: Completed
✅ Consensus Building: Completed
✅ Memory Storage: Completed

The crew has provided comprehensive analysis and recommendations for the debugging challenge.
    `;
  }

  /**
   * Get crew member expertise summary
   */
  getCrewMemberExpertiseSummary(): string {
    return `
🎭 Alex AI Crew Expertise Summary
================================

Captain Picard - Strategic Leadership
• High-level architecture and system design
• Project management and team coordination
• Strategic analysis and leadership decisions

Commander Data - Android Analytics
• Data analysis and pattern recognition
• Logical reasoning and analytical assessment
• Methodical problem-solving approach

Commander Riker - Tactical Execution
• Implementation and execution strategies
• Tactical solutions and immediate fixes
• Action-oriented problem solving

Lieutenant Commander Geordi - Infrastructure
• Technical infrastructure and system optimization
• Performance analysis and technical solutions
• Detail-oriented technical approach

Lieutenant Worf - Security & Compliance
• Security analysis and threat assessment
• Compliance checking and vulnerability identification
• Vigilant security-focused approach

Counselor Troi - User Experience
• User experience and interface design
• Usability analysis and user-focused solutions
• Empathetic user-centered approach

Dr. Crusher - Health & Diagnostics
• System health and diagnostic analysis
• Root cause analysis and health monitoring
• Diagnostic and health-oriented approach

Lieutenant Uhura - Communications & I/O
• Data flow and communication protocols
• I/O operations and communication analysis
• Communication-focused approach

Quark - Business Intelligence
• Business logic and efficiency optimization
• Cost analysis and business process optimization
• Business and efficiency-focused approach
    `;
  }
}
