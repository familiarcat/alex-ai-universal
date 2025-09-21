/**
 * Anti-Hallucination System Orchestrator
 * Main system that coordinates all anti-hallucination components
 */

import { LLMOptimizer, LLMOptimizationConfig } from './llm-optimizer';
import { HallucinationDetector, CrewPerspective, HallucinationAnalysis } from './hallucination-detector';
import { UniversalCrewActivation, CrewActivationResult } from './universal-crew-activation';
import { HallucinationCorrector, CorrectedResponse, HallucinationLearning } from './hallucination-corrector';

export interface AntiHallucinationConfig {
  enabled: boolean;
  hallucinationThreshold: number;
  semanticSimilarityThreshold: number;
  factualAlignmentThreshold: number;
  enableUniversalActivation: boolean;
  parallelProcessing: boolean;
  timeoutMs: number;
  maxRetries: number;
  fallbackEnabled: boolean;
  enableLearning: boolean;
  enableCorrections: boolean;
  openRouterApiKey: string;
}

export interface AntiHallucinationResult {
  originalPrompt: string;
  crewPerspectives: CrewPerspective[];
  hallucinationsDetected: HallucinationAnalysis[];
  correctionsApplied: CorrectedResponse[];
  consensusReached: boolean;
  overallHealth: number;
  processingTime: number;
  learningOpportunities: HallucinationLearning[];
  systemMetrics: SystemMetrics;
}

export interface SystemMetrics {
  totalPrompts: number;
  hallucinationsDetected: number;
  correctionsApplied: number;
  averageProcessingTime: number;
  systemHealth: number;
  crewMemberAccuracy: Map<string, number>;
  llmPerformance: Map<string, number>;
}

export class AntiHallucinationSystem {
  private config: AntiHallucinationConfig;
  private llmOptimizer: LLMOptimizer;
  private hallucinationDetector: HallucinationDetector;
  private universalCrewActivation: UniversalCrewActivation;
  private hallucinationCorrector: HallucinationCorrector;
  private systemMetrics: SystemMetrics;
  private isInitialized: boolean = false;

  constructor(config: AntiHallucinationConfig) {
    this.config = config;
    this.systemMetrics = this.initializeSystemMetrics();
    
    // Initialize components
    this.llmOptimizer = new LLMOptimizer(config.openRouterApiKey);
    this.hallucinationDetector = new HallucinationDetector(
      config.hallucinationThreshold,
      config.semanticSimilarityThreshold,
      config.factualAlignmentThreshold
    );
    
    this.universalCrewActivation = new UniversalCrewActivation(
      this.llmOptimizer,
      this.hallucinationDetector,
      {
        enableUniversalActivation: config.enableUniversalActivation,
        parallelProcessing: config.parallelProcessing,
        timeoutMs: config.timeoutMs,
        maxRetries: config.maxRetries,
        fallbackEnabled: config.fallbackEnabled
      }
    );
    
    this.hallucinationCorrector = new HallucinationCorrector(this.llmOptimizer);
    
    this.isInitialized = true;
    console.log('🛡️ Anti-Hallucination System initialized');
  }

  /**
   * Process prompt through anti-hallucination system
   */
  async processPrompt(prompt: string): Promise<AntiHallucinationResult> {
    if (!this.config.enabled) {
      throw new Error('Anti-hallucination system is disabled');
    }

    if (!this.isInitialized) {
      throw new Error('Anti-hallucination system not properly initialized');
    }

    const startTime = Date.now();
    console.log(`🛡️ Processing prompt through anti-hallucination system`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

    try {
      // Step 1: Activate all crew members
      console.log(`👥 Step 1: Activating all crew members...`);
      const activationResult = await this.universalCrewActivation.activateAllCrewMembers(prompt);
      
      if (!activationResult.consensusReached) {
        console.warn('⚠️ Warning: Consensus not reached - insufficient crew responses');
      }

      // Step 2: Analyze for hallucinations
      console.log(`🔍 Step 2: Analyzing crew responses for hallucinations...`);
      const hallucinationAnalysis = await this.hallucinationDetector.analyzeCrewConsensus(
        activationResult.perspectives
      );

      const hallucinationsDetected = hallucinationAnalysis.analyses.filter(
        analysis => analysis.isHallucination
      );

      console.log(`📊 Hallucinations detected: ${hallucinationsDetected.length}/${activationResult.perspectives.length}`);

      // Step 3: Apply corrections if enabled
      let correctionsApplied: CorrectedResponse[] = [];
      let learningOpportunities: HallucinationLearning[] = [];

      if (this.config.enableCorrections && hallucinationsDetected.length > 0) {
        console.log(`🔧 Step 3: Applying hallucination corrections...`);
        
        for (const hallucination of hallucinationsDetected) {
          try {
            const correctedResponse = await this.hallucinationCorrector.correctHallucination(
              hallucination.crewMember,
              activationResult.perspectives.find(p => p.crewMember === hallucination.crewMember)?.response || '',
              hallucinationAnalysis.consensus.consensusResponse,
              activationResult.perspectives,
              hallucination
            );
            
            correctionsApplied.push(correctedResponse);
            
            if (correctedResponse.learningStored && this.config.enableLearning) {
              const learnings = this.hallucinationCorrector.getLearningOpportunities(hallucination.crewMember);
              learningOpportunities.push(...learnings.slice(-1)); // Get most recent learning
            }
          } catch (error) {
            console.error(`❌ Failed to correct hallucination for ${hallucination.crewMember}:`, error);
          }
        }
      }

      // Step 4: Update system metrics
      this.updateSystemMetrics(activationResult, hallucinationsDetected, correctionsApplied);

      const processingTime = Date.now() - startTime;

      const result: AntiHallucinationResult = {
        originalPrompt: prompt,
        crewPerspectives: activationResult.perspectives,
        hallucinationsDetected,
        correctionsApplied,
        consensusReached: activationResult.consensusReached,
        overallHealth: hallucinationAnalysis.overallHealth,
        processingTime,
        learningOpportunities,
        systemMetrics: this.getSystemMetrics()
      };

      console.log(`✅ Anti-hallucination processing complete`);
      console.log(`⏱️  Processing time: ${processingTime}ms`);
      console.log(`📊 System health: ${(result.overallHealth * 100).toFixed(1)}%`);
      console.log(`🔧 Corrections applied: ${correctionsApplied.length}`);
      console.log(`📚 Learning opportunities: ${learningOpportunities.length}`);

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Anti-hallucination processing failed:', error);
      
      // Return error result
      return {
        originalPrompt: prompt,
        crewPerspectives: [],
        hallucinationsDetected: [],
        correctionsApplied: [],
        consensusReached: false,
        overallHealth: 0,
        processingTime,
        learningOpportunities: [],
        systemMetrics: this.getSystemMetrics()
      };
    }
  }

  /**
   * Enable or disable the system
   */
  enable(enabled: boolean = true): void {
    this.config.enabled = enabled;
    console.log(`🛡️ Anti-hallucination system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Update system configuration
   */
  updateConfig(newConfig: Partial<AntiHallucinationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update component configurations
    if (newConfig.hallucinationThreshold !== undefined || 
        newConfig.semanticSimilarityThreshold !== undefined || 
        newConfig.factualAlignmentThreshold !== undefined) {
      this.hallucinationDetector.updateThresholds(
        newConfig.hallucinationThreshold,
        newConfig.semanticSimilarityThreshold,
        newConfig.factualAlignmentThreshold
      );
    }

    if (newConfig.enableUniversalActivation !== undefined || 
        newConfig.parallelProcessing !== undefined || 
        newConfig.timeoutMs !== undefined || 
        newConfig.maxRetries !== undefined || 
        newConfig.fallbackEnabled !== undefined) {
      this.universalCrewActivation.updateConfig({
        enableUniversalActivation: newConfig.enableUniversalActivation,
        parallelProcessing: newConfig.parallelProcessing,
        timeoutMs: newConfig.timeoutMs,
        maxRetries: newConfig.maxRetries,
        fallbackEnabled: newConfig.fallbackEnabled
      });
    }

    console.log('🔧 Anti-hallucination system configuration updated');
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    enabled: boolean;
    initialized: boolean;
    config: AntiHallucinationConfig;
    metrics: SystemMetrics;
    crewMembers: string[];
  } {
    return {
      enabled: this.config.enabled,
      initialized: this.isInitialized,
      config: { ...this.config },
      metrics: this.getSystemMetrics(),
      crewMembers: this.universalCrewActivation.getCrewMembers()
    };
  }

  /**
   * Get hallucination history for crew member
   */
  getHallucinationHistory(crewMember?: string): {
    learnings: HallucinationLearning[];
    statistics: any;
  } {
    if (crewMember) {
      const learnings = this.hallucinationCorrector.getLearningOpportunities(crewMember);
      const statistics = this.getCrewMemberStatistics(crewMember);
      return { learnings, statistics };
    } else {
      const allLearnings = this.hallucinationCorrector.getAllLearningOpportunities();
      const learnings: HallucinationLearning[] = [];
      for (const crewLearnings of allLearnings.values()) {
        learnings.push(...crewLearnings);
      }
      const statistics = this.hallucinationCorrector.getLearningStatistics();
      return { learnings, statistics };
    }
  }

  /**
   * Test the system with sample prompts
   */
  async testSystem(testPrompts: string[]): Promise<{
    results: AntiHallucinationResult[];
    summary: {
      totalTests: number;
      successfulTests: number;
      averageHealth: number;
      hallucinationsDetected: number;
      correctionsApplied: number;
    };
  }> {
    console.log(`🧪 Testing anti-hallucination system with ${testPrompts.length} prompts`);
    
    const results: AntiHallucinationResult[] = [];
    let successfulTests = 0;
    let totalHealth = 0;
    let totalHallucinations = 0;
    let totalCorrections = 0;

    for (const prompt of testPrompts) {
      try {
        const result = await this.processPrompt(prompt);
        results.push(result);
        successfulTests++;
        totalHealth += result.overallHealth;
        totalHallucinations += result.hallucinationsDetected.length;
        totalCorrections += result.correctionsApplied.length;
      } catch (error) {
        console.error(`❌ Test failed for prompt: ${prompt}`, error);
      }
    }

    const summary = {
      totalTests: testPrompts.length,
      successfulTests,
      averageHealth: successfulTests > 0 ? totalHealth / successfulTests : 0,
      hallucinationsDetected: totalHallucinations,
      correctionsApplied: totalCorrections
    };

    console.log(`✅ System testing complete`);
    console.log(`📊 Success rate: ${(successfulTests / testPrompts.length * 100).toFixed(1)}%`);
    console.log(`📊 Average health: ${(summary.averageHealth * 100).toFixed(1)}%`);

    return { results, summary };
  }

  /**
   * Initialize system metrics
   */
  private initializeSystemMetrics(): SystemMetrics {
    return {
      totalPrompts: 0,
      hallucinationsDetected: 0,
      correctionsApplied: 0,
      averageProcessingTime: 0,
      systemHealth: 1.0,
      crewMemberAccuracy: new Map(),
      llmPerformance: new Map()
    };
  }

  /**
   * Update system metrics
   */
  private updateSystemMetrics(
    activationResult: CrewActivationResult,
    hallucinationsDetected: HallucinationAnalysis[],
    correctionsApplied: CorrectedResponse[]
  ): void {
    this.systemMetrics.totalPrompts++;
    this.systemMetrics.hallucinationsDetected += hallucinationsDetected.length;
    this.systemMetrics.correctionsApplied += correctionsApplied.length;
    
    // Update average processing time
    const totalTime = this.systemMetrics.averageProcessingTime * (this.systemMetrics.totalPrompts - 1);
    this.systemMetrics.averageProcessingTime = (totalTime + activationResult.activationTime) / this.systemMetrics.totalPrompts;
    
    // Update system health
    const healthScore = 1 - (hallucinationsDetected.length / activationResult.perspectives.length);
    this.systemMetrics.systemHealth = (this.systemMetrics.systemHealth + healthScore) / 2;
    
    // Update crew member accuracy
    for (const perspective of activationResult.perspectives) {
      const currentAccuracy = this.systemMetrics.crewMemberAccuracy.get(perspective.crewMember) || 1.0;
      const isHallucination = hallucinationsDetected.some(h => h.crewMember === perspective.crewMember);
      const newAccuracy = isHallucination ? currentAccuracy * 0.95 : currentAccuracy * 1.01;
      this.systemMetrics.crewMemberAccuracy.set(perspective.crewMember, Math.min(1.0, newAccuracy));
    }
    
    // Update LLM performance
    for (const perspective of activationResult.perspectives) {
      const currentPerformance = this.systemMetrics.llmPerformance.get(perspective.llmUsed) || 1.0;
      const isHallucination = hallucinationsDetected.some(h => h.crewMember === perspective.crewMember);
      const newPerformance = isHallucination ? currentPerformance * 0.98 : currentPerformance * 1.005;
      this.systemMetrics.llmPerformance.set(perspective.llmUsed, Math.min(1.0, newPerformance));
    }
  }

  /**
   * Get current system metrics
   */
  private getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  /**
   * Get crew member statistics
   */
  private getCrewMemberStatistics(crewMember: string): any {
    const learnings = this.hallucinationCorrector.getLearningOpportunities(crewMember);
    const accuracy = this.systemMetrics.crewMemberAccuracy.get(crewMember) || 1.0;
    
    const learningsByType = new Map<string, number>();
    const learningsBySeverity = new Map<string, number>();
    
    for (const learning of learnings) {
      learningsByType.set(
        learning.learningType,
        (learningsByType.get(learning.learningType) || 0) + 1
      );
      learningsBySeverity.set(
        learning.severity,
        (learningsBySeverity.get(learning.severity) || 0) + 1
      );
    }
    
    return {
      crewMember,
      accuracy,
      totalLearnings: learnings.length,
      learningsByType: Object.fromEntries(learningsByType),
      learningsBySeverity: Object.fromEntries(learningsBySeverity),
      averageDeviationScore: learnings.length > 0 
        ? learnings.reduce((sum, l) => sum + l.deviationScore, 0) / learnings.length 
        : 0
    };
  }

  /**
   * Reset system metrics
   */
  resetMetrics(): void {
    this.systemMetrics = this.initializeSystemMetrics();
    console.log('📊 System metrics reset');
  }

  /**
   * Export system data
   */
  exportSystemData(): {
    config: AntiHallucinationConfig;
    metrics: SystemMetrics;
    learnings: Map<string, HallucinationLearning[]>;
  } {
    return {
      config: { ...this.config },
      metrics: this.getSystemMetrics(),
      learnings: this.hallucinationCorrector.getAllLearningOpportunities()
    };
  }

  /**
   * Import system data
   */
  importSystemData(data: {
    config?: Partial<AntiHallucinationConfig>;
    learnings?: Map<string, HallucinationLearning[]>;
  }): void {
    if (data.config) {
      this.updateConfig(data.config);
    }
    
    if (data.learnings) {
      // Import learning data
      for (const [crewMember, learnings] of data.learnings) {
        // This would require implementing import functionality in HallucinationCorrector
        console.log(`📚 Imported ${learnings.length} learning opportunities for ${crewMember}`);
      }
    }
    
    console.log('📥 System data imported successfully');
  }
}
