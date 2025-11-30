/**
 * Process-Level Hallucination Management System
 * 
 * Monitors the entire task execution process to detect hallucinations
 * across multiple prompts, responses, and crew member interactions.
 * 
 * Key Features:
 * - Process-level oversight (not just individual prompts)
 * - Pattern detection across task execution
 * - Consistency checking over time
 * - Cross-crew-member hallucination detection
 * - Task-level hallucination reporting
 * 
 * DDD Architecture: Process Monitor => Task Coordinator => Crew Responses
 */

import { HallucinationDetector, CrewPerspective, HallucinationAnalysis } from './hallucination-detector';

export interface ProcessHallucinationEvent {
  taskId: string;
  timestamp: number;
  type: 'contradiction' | 'inconsistency' | 'deviation' | 'pattern_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedCrewMembers: string[];
  evidence: string[];
  recommendations: string[];
}

export interface TaskExecutionState {
  taskId: string;
  description: string;
  crewMembers: string[];
  responses: CrewResponse[];
  hallucinationEvents: ProcessHallucinationEvent[];
  overallHealth: number;
  consistencyScore: number;
  startTime: number;
  lastUpdate: number;
}

export interface CrewResponse {
  crewMember: string;
  prompt: string;
  response: string;
  timestamp: number;
  tokens: number;
  cost: number;
}

export interface ProcessHallucinationReport {
  taskId: string;
  overallHealth: number;
  consistencyScore: number;
  hallucinationEvents: ProcessHallucinationEvent[];
  patterns: PatternAnalysis[];
  recommendations: string[];
  crewMemberReliability: Map<string, number>;
}

export interface PatternAnalysis {
  pattern: string;
  occurrences: number;
  affectedCrewMembers: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export class ProcessLevelHallucinationManager {
  private hallucinationDetector: HallucinationDetector;
  private taskStates: Map<string, TaskExecutionState>;
  private patternHistory: Map<string, PatternAnalysis[]>;
  private isInitialized: boolean = false;

  constructor(hallucinationDetector: HallucinationDetector) {
    this.hallucinationDetector = hallucinationDetector;
    this.taskStates = new Map();
    this.patternHistory = new Map();
    this.isInitialized = true;
    console.log('🛡️ Process-Level Hallucination Manager initialized');
  }

  /**
   * Initialize monitoring for a task
   */
  initializeTaskMonitoring(taskId: string, description: string, crewMembers: string[]): void {
    const taskState: TaskExecutionState = {
      taskId,
      description,
      crewMembers,
      responses: [],
      hallucinationEvents: [],
      overallHealth: 1.0,
      consistencyScore: 1.0,
      startTime: Date.now(),
      lastUpdate: Date.now()
    };

    this.taskStates.set(taskId, taskState);
    console.log(`🛡️ Process monitoring initialized for task: ${taskId}`);
  }

  /**
   * Record a crew member response and check for hallucinations
   */
  async recordResponse(
    taskId: string,
    crewMember: string,
    prompt: string,
    response: string,
    tokens: number,
    cost: number
  ): Promise<ProcessHallucinationEvent[]> {
    const taskState = this.taskStates.get(taskId);
    if (!taskState) {
      throw new Error(`Task ${taskId} not found. Initialize monitoring first.`);
    }

    // Record the response
    const crewResponse: CrewResponse = {
      crewMember,
      prompt,
      response,
      timestamp: Date.now(),
      tokens,
      cost
    };

    taskState.responses.push(crewResponse);
    taskState.lastUpdate = Date.now();

    // Analyze for process-level hallucinations
    const events = await this.analyzeProcessHallucinations(taskId);

    // Update task state
    taskState.hallucinationEvents.push(...events);
    taskState.overallHealth = this.calculateOverallHealth(taskState);
    taskState.consistencyScore = this.calculateConsistencyScore(taskState);

    return events;
  }

  /**
   * Analyze process-level hallucinations
   * Looks for patterns, contradictions, and inconsistencies across the entire task
   */
  private async analyzeProcessHallucinations(taskId: string): Promise<ProcessHallucinationEvent[]> {
    const taskState = this.taskStates.get(taskId);
    if (!taskState) {
      return [];
    }

    const events: ProcessHallucinationEvent[] = [];

    // 1. Check for contradictions between crew members
    const contradictions = await this.detectContradictions(taskState);
    events.push(...contradictions);

    // 2. Check for inconsistencies over time
    const inconsistencies = await this.detectInconsistencies(taskState);
    events.push(...inconsistencies);

    // 3. Check for deviations from expected patterns
    const deviations = await this.detectDeviations(taskState);
    events.push(...deviations);

    // 4. Check for pattern anomalies
    const anomalies = await this.detectPatternAnomalies(taskState);
    events.push(...anomalies);

    // 5. Update pattern history
    this.updatePatternHistory(taskId, events);

    return events;
  }

  /**
   * Detect contradictions between crew member responses
   */
  private async detectContradictions(taskState: TaskExecutionState): Promise<ProcessHallucinationEvent[]> {
    const events: ProcessHallucinationEvent[] = [];
    const responses = taskState.responses;

    if (responses.length < 2) {
      return events;
    }

    // Compare each pair of responses
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const response1 = responses[i];
        const response2 = responses[j];

        // Convert to crew perspectives for hallucination detector
        const perspectives: CrewPerspective[] = [
          {
            crewMember: response1.crewMember,
            response: response1.response,
            confidence: 0.8,
            reasoning: response1.prompt
          },
          {
            crewMember: response2.crewMember,
            response: response2.response,
            confidence: 0.8,
            reasoning: response2.prompt
          }
        ];

        // Use hallucination detector to find contradictions
        const analysis = await this.hallucinationDetector.analyzeCrewConsensus(perspectives);
        
        // Check for high deviation scores indicating contradictions
        const contradictions = analysis.analyses.filter(
          a => a.deviationScore > 0.5 && a.isHallucination
        );

        if (contradictions.length > 0) {
          for (const contradiction of contradictions) {
            events.push({
              taskId: taskState.taskId,
              timestamp: Date.now(),
              type: 'contradiction',
              severity: this.determineSeverity(contradiction.deviationScore),
              description: `Contradiction detected between ${response1.crewMember} and ${response2.crewMember}`,
              affectedCrewMembers: [response1.crewMember, response2.crewMember],
              evidence: [
                `${response1.crewMember}: ${response1.response.substring(0, 100)}...`,
                `${response2.crewMember}: ${response2.response.substring(0, 100)}...`
              ],
              recommendations: [
                `Review responses from ${response1.crewMember} and ${response2.crewMember}`,
                `Seek clarification on conflicting information`,
                `Consider consensus-building discussion`
              ]
            });
          }
        }
      }
    }

    return events;
  }

  /**
   * Detect inconsistencies over time (same crew member changing answers)
   */
  private async detectInconsistencies(taskState: TaskExecutionState): Promise<ProcessHallucinationEvent[]> {
    const events: ProcessHallucinationEvent[] = [];
    const responsesByMember = new Map<string, CrewResponse[]>();

    // Group responses by crew member
    for (const response of taskState.responses) {
      if (!responsesByMember.has(response.crewMember)) {
        responsesByMember.set(response.crewMember, []);
      }
      responsesByMember.get(response.crewMember)!.push(response);
    }

    // Check each crew member's responses for inconsistencies
    for (const [crewMember, responses] of responsesByMember.entries()) {
      if (responses.length < 2) {
        continue;
      }

      // Sort by timestamp
      responses.sort((a, b) => a.timestamp - b.timestamp);

      // Compare consecutive responses
      for (let i = 0; i < responses.length - 1; i++) {
        const earlier = responses[i];
        const later = responses[i + 1];

        // Check for significant changes in response (potential inconsistency)
        const similarity = this.calculateSimilarity(earlier.response, later.response);
        
        if (similarity < 0.5 && this.isRelatedPrompt(earlier.prompt, later.prompt)) {
          events.push({
            taskId: taskState.taskId,
            timestamp: Date.now(),
            type: 'inconsistency',
            severity: 'medium',
            description: `${crewMember} provided inconsistent responses over time`,
            affectedCrewMembers: [crewMember],
            evidence: [
              `Earlier (${new Date(earlier.timestamp).toISOString()}): ${earlier.response.substring(0, 100)}...`,
              `Later (${new Date(later.timestamp).toISOString()}): ${later.response.substring(0, 100)}...`
            ],
            recommendations: [
              `Review ${crewMember}'s response history`,
              `Clarify if this is intentional evolution or a hallucination`,
              `Consider asking ${crewMember} to reconcile the differences`
            ]
          });
        }
      }
    }

    return events;
  }

  /**
   * Detect deviations from expected patterns
   */
  private async detectDeviations(taskState: TaskExecutionState): Promise<ProcessHallucinationEvent[]> {
    const events: ProcessHallucinationEvent[] = [];

    // Analyze response patterns
    const responsePatterns = this.analyzeResponsePatterns(taskState);

    // Check for outliers
    for (const pattern of responsePatterns) {
      if (pattern.isOutlier) {
        events.push({
          taskId: taskState.taskId,
          timestamp: Date.now(),
          type: 'deviation',
          severity: pattern.severity,
          description: `Deviation from expected pattern: ${pattern.description}`,
          affectedCrewMembers: pattern.affectedCrewMembers,
          evidence: pattern.evidence,
          recommendations: [
            'Review the deviating response',
            'Compare with other crew member responses',
            'Consider if deviation is justified or a hallucination'
          ]
        });
      }
    }

    return events;
  }

  /**
   * Detect pattern anomalies
   */
  private async detectPatternAnomalies(taskState: TaskExecutionState): Promise<ProcessHallucinationEvent[]> {
    const events: ProcessHallucinationEvent[] = [];

    // Get historical patterns for this task type
    const historicalPatterns = this.patternHistory.get(taskState.taskId) || [];

    // Compare current patterns with historical
    const currentPatterns = this.analyzeResponsePatterns(taskState);

    for (const currentPattern of currentPatterns) {
      const historicalMatch = historicalPatterns.find(
        h => h.pattern === currentPattern.pattern
      );

      if (historicalMatch && currentPattern.severity !== historicalMatch.severity) {
        events.push({
          taskId: taskState.taskId,
          timestamp: Date.now(),
          type: 'pattern_anomaly',
          severity: 'medium',
          description: `Pattern anomaly detected: ${currentPattern.description}`,
          affectedCrewMembers: currentPattern.affectedCrewMembers,
          evidence: [
            `Historical pattern: ${historicalMatch.description}`,
            `Current pattern: ${currentPattern.description}`
          ],
          recommendations: [
            'Investigate why pattern changed',
            'Determine if this is expected evolution or a problem'
          ]
        });
      }
    }

    return events;
  }

  /**
   * Calculate overall health score for a task
   */
  private calculateOverallHealth(taskState: TaskExecutionState): number {
    if (taskState.hallucinationEvents.length === 0) {
      return 1.0;
    }

    const severityWeights = {
      low: 0.1,
      medium: 0.3,
      high: 0.6,
      critical: 1.0
    };

    let totalWeight = 0;
    for (const event of taskState.hallucinationEvents) {
      totalWeight += severityWeights[event.severity];
    }

    // Normalize to 0-1 scale (higher is better)
    const maxPossibleWeight = taskState.responses.length * severityWeights.critical;
    const health = 1.0 - (totalWeight / Math.max(maxPossibleWeight, 1));

    return Math.max(0, Math.min(1, health));
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(taskState: TaskExecutionState): number {
    if (taskState.responses.length < 2) {
      return 1.0;
    }

    // Calculate average similarity between responses
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < taskState.responses.length; i++) {
      for (let j = i + 1; j < taskState.responses.length; j++) {
        const similarity = this.calculateSimilarity(
          taskState.responses[i].response,
          taskState.responses[j].response
        );
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 1.0;
  }

  /**
   * Simple similarity calculation (can be enhanced with semantic similarity)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // Simple word overlap similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Check if two prompts are related
   */
  private isRelatedPrompt(prompt1: string, prompt2: string): boolean {
    const similarity = this.calculateSimilarity(prompt1, prompt2);
    return similarity > 0.3; // At least 30% word overlap
  }

  /**
   * Analyze response patterns
   */
  private analyzeResponsePatterns(taskState: TaskExecutionState): Array<{
    pattern: string;
    isOutlier: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedCrewMembers: string[];
    evidence: string[];
  }> {
    const patterns: Array<{
      pattern: string;
      isOutlier: boolean;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedCrewMembers: string[];
      evidence: string[];
    }> = [];

    // Analyze response lengths
    const lengths = taskState.responses.map(r => r.response.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const stdDev = Math.sqrt(
      lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length
    );

    for (let i = 0; i < taskState.responses.length; i++) {
      const response = taskState.responses[i];
      const length = response.response.length;
      
      if (Math.abs(length - avgLength) > 2 * stdDev) {
        patterns.push({
          pattern: 'response_length_outlier',
          isOutlier: true,
          severity: 'low',
          description: `${response.crewMember} provided unusually ${length > avgLength ? 'long' : 'short'} response`,
          affectedCrewMembers: [response.crewMember],
          evidence: [`Response length: ${length} (avg: ${avgLength.toFixed(0)})`]
        });
      }
    }

    return patterns;
  }

  /**
   * Update pattern history
   */
  private updatePatternHistory(taskId: string, events: ProcessHallucinationEvent[]): void {
    if (!this.patternHistory.has(taskId)) {
      this.patternHistory.set(taskId, []);
    }

    const patterns = this.patternHistory.get(taskId)!;

    for (const event of events) {
      const existingPattern = patterns.find(p => p.pattern === event.type);
      if (existingPattern) {
        existingPattern.occurrences++;
        existingPattern.affectedCrewMembers = [
          ...new Set([...existingPattern.affectedCrewMembers, ...event.affectedCrewMembers])
        ];
      } else {
        patterns.push({
          pattern: event.type,
          occurrences: 1,
          affectedCrewMembers: event.affectedCrewMembers,
          severity: event.severity,
          description: event.description
        });
      }
    }
  }

  /**
   * Determine severity from deviation score
   */
  private determineSeverity(deviationScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (deviationScore >= 0.8) return 'critical';
    if (deviationScore >= 0.6) return 'high';
    if (deviationScore >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Generate comprehensive process-level hallucination report
   */
  async generateReport(taskId: string): Promise<ProcessHallucinationReport> {
    const taskState = this.taskStates.get(taskId);
    if (!taskState) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Calculate crew member reliability
    const crewMemberReliability = new Map<string, number>();
    for (const member of taskState.crewMembers) {
      const memberEvents = taskState.hallucinationEvents.filter(
        e => e.affectedCrewMembers.includes(member)
      );
      const reliability = 1.0 - (memberEvents.length / Math.max(taskState.responses.length, 1));
      crewMemberReliability.set(member, Math.max(0, reliability));
    }

    // Get patterns
    const patterns = this.patternHistory.get(taskId) || [];

    // Generate recommendations
    const recommendations: string[] = [];
    if (taskState.overallHealth < 0.7) {
      recommendations.push('Task shows signs of hallucination - review all crew responses');
    }
    if (taskState.consistencyScore < 0.6) {
      recommendations.push('Low consistency detected - consider consensus-building discussion');
    }
    if (taskState.hallucinationEvents.some(e => e.severity === 'critical')) {
      recommendations.push('Critical hallucinations detected - immediate review required');
    }

    return {
      taskId,
      overallHealth: taskState.overallHealth,
      consistencyScore: taskState.consistencyScore,
      hallucinationEvents: taskState.hallucinationEvents,
      patterns,
      recommendations,
      crewMemberReliability
    };
  }

  /**
   * Get task state
   */
  getTaskState(taskId: string): TaskExecutionState | undefined {
    return this.taskStates.get(taskId);
  }
}

