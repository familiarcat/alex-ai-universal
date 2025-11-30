/**
 * Shared Library Computer System
 * 
 * LCARS-based collective intelligence system where each crew member can
 * contribute their expertise, findings, and conclusions to a shared RAG vector memory.
 * Maintains Prime Directive compliance while building comprehensive knowledge base.
 */

import { EventEmitter } from 'events';

export enum CrewMember {
  PICARD = 'picard',
  RIKER = 'riker',
  DATA = 'data',
  LA_FORGE = 'la_forge',
  WORF = 'worf',
  TROI = 'troi',
  CRUSHER = 'crusher',
  UHURA = 'uhura',
  QUARK = 'quark'
}

export enum KnowledgeType {
  TECHNICAL_ANALYSIS = 'technical_analysis',
  STRATEGIC_ASSESSMENT = 'strategic_assessment',
  MEDICAL_ASSESSMENT = 'medical_assessment',
  SECURITY_ANALYSIS = 'security_analysis',
  ENGINEERING_SOLUTION = 'engineering_solution',
  COMMUNICATION_PROTOCOL = 'communication_protocol',
  BUSINESS_OPTIMIZATION = 'business_optimization',
  PROBLEM_SOLUTION = 'problem_solution',
  REFERENCE_DOCUMENTATION = 'reference_documentation',
  LESSON_LEARNED = 'lesson_learned',
  BEST_PRACTICE = 'best_practice',
  TROUBLESHOOTING_GUIDE = 'troubleshooting_guide'
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum PrimeDirectiveCompliance {
  COMPLIANT = 'compliant',
  AMBIGUOUS = 'ambiguous',
  NON_SPECIFIC = 'non_specific',
  GENERAL_PRINCIPLE = 'general_principle'
}

export interface CrewMemoryEntry {
  id: string;
  timestamp: Date;
  crewMember: CrewMember;
  knowledgeType: KnowledgeType;
  priority: PriorityLevel;
  
  // Core Knowledge Content
  title: string;
  summary: string;
  detailedAnalysis: string;
  keyFindings: string[];
  conclusions: string[];
  recommendations: string[];
  
  // Reference Information (Prime Directive Compliant)
  referencedDocuments: string[];
  relatedTopics: string[];
  applicableScenarios: string[];
  generalPrinciples: string[];
  
  // Technical Metadata
  tags: string[];
  keywords: string[];
  complexityLevel: number; // 1-10
  confidenceLevel: number; // 1-100
  
  // Prime Directive Compliance
  primeDirectiveCompliance: PrimeDirectiveCompliance;
  ambiguityLevel: number; // 1-10 (higher = more ambiguous/general)
  projectSpecificity: boolean; // false = general principle
  
  // Semantic Content for Vector Embedding
  semanticText: string;
  vectorEmbedding?: number[];
  
  // Collaboration Metadata
  relatedEntries: string[]; // IDs of related entries
  validatedBy: CrewMember[]; // Other crew members who validated
  conflictResolutions: ConflictResolution[];
  
  // Storage Metadata
  storageTimestamp: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface ConflictResolution {
  id: string;
  timestamp: Date;
  conflictingEntries: string[];
  resolutionMethod: string;
  resolvedBy: CrewMember[];
  finalConsensus: string;
}

export interface KnowledgeQuery {
  query: string;
  crewMember?: CrewMember;
  knowledgeTypes?: KnowledgeType[];
  priorityLevels?: PriorityLevel[];
  maxResults?: number;
  similarityThreshold?: number;
  includeReferences?: boolean;
}

export interface KnowledgeSearchResult {
  entry: CrewMemoryEntry;
  similarity: number;
  relevanceScore: number;
  crewValidation: number;
  recencyScore: number;
}

export class SharedLibraryComputerSystem extends EventEmitter {
  private crewMemories: Map<string, CrewMemoryEntry> = new Map();
  private crewExpertise: Map<CrewMember, string[]> = new Map();
  private knowledgeGraph: Map<string, string[]> = new Map(); // Entry ID -> Related Entry IDs
  private primeDirectiveFilters: PrimeDirectiveFilter[] = [];

  constructor() {
    super();
    this.initializeCrewExpertise();
    this.initializePrimeDirectiveFilters();
  }

  /**
   * Initialize crew member expertise areas
   */
  private initializeCrewExpertise(): void {
    this.crewExpertise.set(CrewMember.PICARD, [
      'strategic_planning', 'mission_coordination', 'crew_leadership',
      'diplomatic_solutions', 'ethical_decision_making', 'resource_allocation'
    ]);

    this.crewExpertise.set(CrewMember.RIKER, [
      'tactical_operations', 'workflow_management', 'team_coordination',
      'execution_planning', 'resource_management', 'operational_efficiency'
    ]);

    this.crewExpertise.set(CrewMember.DATA, [
      'technical_analysis', 'logical_reasoning', 'system_optimization',
      'data_processing', 'algorithm_design', 'performance_analysis'
    ]);

    this.crewExpertise.set(CrewMember.LA_FORGE, [
      'infrastructure_engineering', 'system_monitoring', 'preventive_maintenance',
      'troubleshooting', 'performance_optimization', 'technical_innovation'
    ]);

    this.crewExpertise.set(CrewMember.WORF, [
      'security_analysis', 'threat_assessment', 'defensive_strategies',
      'protocol_enforcement', 'risk_management', 'security_optimization'
    ]);

    this.crewExpertise.set(CrewMember.TROI, [
      'user_experience', 'psychological_assessment', 'communication_optimization',
      'interface_design', 'usability_analysis', 'human_factors'
    ]);

    this.crewExpertise.set(CrewMember.CRUSHER, [
      'system_health', 'medical_diagnosis', 'preventive_care',
      'health_monitoring', 'treatment_protocols', 'wellness_optimization'
    ]);

    this.crewExpertise.set(CrewMember.UHURA, [
      'communication_systems', 'data_transmission', 'network_optimization',
      'protocol_management', 'integration_coordination', 'information_flow'
    ]);

    this.crewExpertise.set(CrewMember.QUARK, [
      'business_optimization', 'cost_analysis', 'efficiency_metrics',
      'resource_utilization', 'roi_calculation', 'economic_assessment'
    ]);
  }

  /**
   * Initialize Prime Directive compliance filters
   */
  private initializePrimeDirectiveFilters(): void {
    this.primeDirectiveFilters = [
      {
        name: 'Project Ambiguity Filter',
        description: 'Ensures knowledge is stored as general principles rather than project-specific details',
        filter: (entry: CrewMemoryEntry) => {
          // Remove or generalize project-specific information
          entry.projectSpecificity = false;
          entry.ambiguityLevel = Math.max(entry.ambiguityLevel, 6); // Ensure sufficient ambiguity
          return this.generalizeContent(entry);
        }
      },
      {
        name: 'Reference Documentation Filter',
        description: 'Extracts and stores references to external documentation',
        filter: (entry: CrewMemoryEntry) => {
          // Extract references to documentation, tutorials, best practices
          entry.referencedDocuments = this.extractReferences(entry.detailedAnalysis);
          return entry;
        }
      },
      {
        name: 'General Principle Extraction',
        description: 'Extracts general principles from specific solutions',
        filter: (entry: CrewMemoryEntry) => {
          // Convert specific solutions to general principles
          entry.generalPrinciples = this.extractGeneralPrinciples(entry);
          return entry;
        }
      }
    ];
  }

  /**
   * Add crew member memory entry to shared library
   */
  async addCrewMemory(
    crewMember: CrewMember,
    knowledgeType: KnowledgeType,
    title: string,
    summary: string,
    detailedAnalysis: string,
    keyFindings: string[],
    conclusions: string[],
    recommendations: string[],
    tags: string[] = [],
    priority: PriorityLevel = PriorityLevel.MEDIUM
  ): Promise<string> {
    const entryId = this.generateEntryId();
    
    // Create base entry
    const entry: CrewMemoryEntry = {
      id: entryId,
      timestamp: new Date(),
      crewMember,
      knowledgeType,
      priority,
      title,
      summary,
      detailedAnalysis,
      keyFindings,
      conclusions,
      recommendations,
      referencedDocuments: [],
      relatedTopics: [],
      applicableScenarios: [],
      generalPrinciples: [],
      tags,
      keywords: this.extractKeywords(detailedAnalysis),
      complexityLevel: this.calculateComplexityLevel(detailedAnalysis),
      confidenceLevel: this.calculateConfidenceLevel(crewMember, knowledgeType),
      primeDirectiveCompliance: PrimeDirectiveCompliance.AMBIGUOUS,
      ambiguityLevel: 5,
      projectSpecificity: true,
      semanticText: '',
      relatedEntries: [],
      validatedBy: [],
      conflictResolutions: [],
      storageTimestamp: new Date(),
      lastAccessed: new Date(),
      accessCount: 0
    };

    // Apply Prime Directive filters
    let filteredEntry = entry;
    for (const filter of this.primeDirectiveFilters) {
      filteredEntry = filter.filter(filteredEntry);
    }

    // Generate semantic text for vector embedding
    filteredEntry.semanticText = this.generateSemanticText(filteredEntry);

    // Store entry
    this.crewMemories.set(entryId, filteredEntry);

    // Update knowledge graph
    this.updateKnowledgeGraph(entryId, filteredEntry);

    // Emit event for real-time updates
    this.emit('memoryAdded', filteredEntry);

    // Trigger vector embedding generation (would be async in real implementation)
    await this.generateVectorEmbedding(filteredEntry);

    return entryId;
  }

  /**
   * Search crew memories using semantic similarity
   */
  async searchCrewMemories(query: KnowledgeQuery): Promise<KnowledgeSearchResult[]> {
    const queryEmbedding = await this.generateQueryEmbedding(query.query);
    
    const results: KnowledgeSearchResult[] = [];
    
    for (const [entryId, entry] of this.crewMemories) {
      // Filter by criteria
      if (query.crewMember && entry.crewMember !== query.crewMember) continue;
      if (query.knowledgeTypes && !query.knowledgeTypes.includes(entry.knowledgeType)) continue;
      if (query.priorityLevels && !query.priorityLevels.includes(entry.priority)) continue;

      // Calculate similarity (simplified - would use actual vector similarity in production)
      const similarity = this.calculateSimilarity(queryEmbedding, entry.semanticText);
      
      if (similarity >= (query.similarityThreshold || 0.7)) {
        const relevanceScore = this.calculateRelevanceScore(entry, query);
        const crewValidation = this.calculateCrewValidation(entry);
        const recencyScore = this.calculateRecencyScore(entry);

        results.push({
          entry,
          similarity,
          relevanceScore,
          crewValidation,
          recencyScore
        });
      }
    }

    // Sort by combined score
    return results
      .sort((a, b) => {
        const scoreA = (a.similarity * 0.4) + (a.relevanceScore * 0.3) + (a.crewValidation * 0.2) + (a.recencyScore * 0.1);
        const scoreB = (b.similarity * 0.4) + (b.relevanceScore * 0.3) + (b.crewValidation * 0.2) + (b.recencyScore * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, query.maxResults || 10);
  }

  /**
   * Get LCARS terminal interface data for crew member
   */
  getLCARSTerminalInterface(crewMember: CrewMember): LCARSTerminalData {
    const crewEntries = Array.from(this.crewMemories.values())
      .filter(entry => entry.crewMember === crewMember)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const recentEntries = crewEntries.slice(0, 5);
    const expertiseAreas = this.crewExpertise.get(crewMember) || [];
    
    return {
      crewMember,
      expertiseAreas,
      recentEntries,
      totalEntries: crewEntries.length,
      knowledgeStats: this.calculateKnowledgeStats(crewMember),
      relatedMemories: this.findRelatedMemories(crewMember),
      searchSuggestions: this.generateSearchSuggestions(crewMember)
    };
  }

  /**
   * Validate memory entry by another crew member
   */
  validateMemoryEntry(entryId: string, validator: CrewMember, validation: string): boolean {
    const entry = this.crewMemories.get(entryId);
    if (!entry) return false;

    // Add validation
    if (!entry.validatedBy.includes(validator)) {
      entry.validatedBy.push(validator);
    }

    // Update confidence level based on validation
    entry.confidenceLevel = Math.min(100, entry.confidenceLevel + 5);

    this.emit('memoryValidated', { entryId, validator, validation });
    return true;
  }

  /**
   * Resolve conflicts between memory entries
   */
  resolveConflict(
    entryId1: string,
    entryId2: string,
    resolver: CrewMember,
    resolutionMethod: string,
    finalConsensus: string
  ): string {
    const conflictId = this.generateConflictId();
    
    const conflictResolution: ConflictResolution = {
      id: conflictId,
      timestamp: new Date(),
      conflictingEntries: [entryId1, entryId2],
      resolutionMethod,
      resolvedBy: [resolver],
      finalConsensus
    };

    // Add to both entries
    const entry1 = this.crewMemories.get(entryId1);
    const entry2 = this.crewMemories.get(entryId2);
    
    if (entry1) entry1.conflictResolutions.push(conflictResolution);
    if (entry2) entry2.conflictResolutions.push(conflictResolution);

    this.emit('conflictResolved', conflictResolution);
    return conflictId;
  }

  /**
   * Get collective intelligence insights
   */
  getCollectiveIntelligence(): CollectiveIntelligenceReport {
    const allEntries = Array.from(this.crewMemories.values());
    
    return {
      totalMemories: allEntries.length,
      crewContributions: this.calculateCrewContributions(),
      knowledgeDistribution: this.calculateKnowledgeDistribution(),
      expertiseOverlap: this.calculateExpertiseOverlap(),
      conflictResolutionRate: this.calculateConflictResolutionRate(),
      primeDirectiveCompliance: this.calculatePrimeDirectiveCompliance(),
      recentTrends: this.analyzeRecentTrends(),
      topInsights: this.extractTopInsights()
    };
  }

  // Private helper methods

  private generateEntryId(): string {
    return `MEMORY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `CONFLICT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - would use NLP in production
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private calculateComplexityLevel(text: string): number {
    // Simple complexity calculation based on text length and technical terms
    const technicalTerms = ['algorithm', 'optimization', 'architecture', 'implementation', 'configuration', 'integration'];
    const technicalCount = technicalTerms.filter(term => text.toLowerCase().includes(term)).length;
    const lengthFactor = Math.min(text.length / 1000, 10);
    
    return Math.min(10, Math.max(1, Math.round(technicalCount + lengthFactor)));
  }

  private calculateConfidenceLevel(crewMember: CrewMember, knowledgeType: KnowledgeType): number {
    const expertise = this.crewExpertise.get(crewMember) || [];
    const expertiseMatch = expertise.some(area => 
      knowledgeType.toLowerCase().includes(area.split('_')[0])
    );
    
    return expertiseMatch ? 85 : 70;
  }

  private generalizeContent(entry: CrewMemoryEntry): CrewMemoryEntry {
    // Remove project-specific details and generalize
    entry.detailedAnalysis = entry.detailedAnalysis
      .replace(/\b[A-Z]{2,}_[A-Z0-9_]+\b/g, '[PROJECT_REFERENCE]')
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[DATE_REFERENCE]')
      .replace(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, '[ID_REFERENCE]');
    
    return entry;
  }

  private extractReferences(text: string): string[] {
    const references: string[] = [];
    
    // Extract URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex);
    if (urls) references.push(...urls);

    // Extract documentation references
    const docRegex = /(?:see|refer to|according to|documented in)\s+([^.!?]+)/gi;
    const docMatches = text.match(docRegex);
    if (docMatches) references.push(...docMatches);

    return references;
  }

  private extractGeneralPrinciples(entry: CrewMemoryEntry): string[] {
    const principles: string[] = [];
    
    // Extract "always", "never", "should", "must" statements
    const principleRegex = /(?:always|never|should|must|generally|typically|usually)\s+([^.!?]+)/gi;
    const matches = entry.detailedAnalysis.match(principleRegex);
    if (matches) principles.push(...matches);

    return principles;
  }

  private generateSemanticText(entry: CrewMemoryEntry): string {
    return `
      ${entry.title}. ${entry.summary}. 
      Crew Member: ${entry.crewMember}. 
      Knowledge Type: ${entry.knowledgeType}. 
      Key Findings: ${entry.keyFindings.join(', ')}. 
      Conclusions: ${entry.conclusions.join(', ')}. 
      Recommendations: ${entry.recommendations.join(', ')}. 
      Tags: ${entry.tags.join(', ')}. 
      General Principles: ${entry.generalPrinciples.join(', ')}. 
      Referenced Documents: ${entry.referencedDocuments.join(', ')}.
    `.trim();
  }

  private updateKnowledgeGraph(entryId: string, entry: CrewMemoryEntry): void {
    // Find related entries based on keywords and topics
    const relatedEntries: string[] = [];
    
    for (const [otherId, otherEntry] of this.crewMemories) {
      if (otherId === entryId) continue;
      
      // Check for keyword overlap
      const keywordOverlap = entry.keywords.filter(keyword => 
        otherEntry.keywords.includes(keyword)
      ).length;
      
      if (keywordOverlap > 2) {
        relatedEntries.push(otherId);
      }
    }
    
    this.knowledgeGraph.set(entryId, relatedEntries);
  }

  private async generateVectorEmbedding(entry: CrewMemoryEntry): Promise<void> {
    // In production, this would call OpenAI embedding API
    // For now, we'll simulate the embedding
    entry.vectorEmbedding = Array.from({length: 1536}, () => Math.random());
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    // In production, this would call OpenAI embedding API
    // For now, we'll simulate the embedding
    return Array.from({length: 1536}, () => Math.random());
  }

  private calculateSimilarity(queryEmbedding: number[], entryText: string): number {
    // Simplified similarity calculation - would use actual vector similarity in production
    return Math.random() * 0.5 + 0.5; // Random similarity between 0.5 and 1.0
  }

  private calculateRelevanceScore(entry: CrewMemoryEntry, query: KnowledgeQuery): number {
    let score = 0.5; // Base score
    
    // Boost for matching knowledge type
    if (query.knowledgeTypes?.includes(entry.knowledgeType)) {
      score += 0.2;
    }
    
    // Boost for priority level
    if (query.priorityLevels?.includes(entry.priority)) {
      score += 0.1;
    }
    
    // Boost for recent entries
    const daysSinceCreated = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) score += 0.2;
    
    return Math.min(1.0, score);
  }

  private calculateCrewValidation(entry: CrewMemoryEntry): number {
    return entry.validatedBy.length / 9; // Normalize by total crew size
  }

  private calculateRecencyScore(entry: CrewMemoryEntry): number {
    const daysSinceCreated = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceCreated / 365)); // Decay over a year
  }

  private findRelatedMemories(crewMember: CrewMember): CrewMemoryEntry[] {
    const crewEntries = Array.from(this.crewMemories.values())
      .filter(entry => entry.crewMember === crewMember);
    
    // Find entries with shared keywords
    const relatedEntries: CrewMemoryEntry[] = [];
    
    for (const entry of crewEntries.slice(0, 3)) {
      const related = Array.from(this.crewMemories.values())
        .filter(other => other.id !== entry.id)
        .filter(other => {
          const keywordOverlap = entry.keywords.filter(keyword => 
            other.keywords.includes(keyword)
          ).length;
          return keywordOverlap > 2;
        })
        .slice(0, 2);
      
      relatedEntries.push(...related);
    }
    
    return relatedEntries.slice(0, 5);
  }

  private generateSearchSuggestions(crewMember: CrewMember): string[] {
    const expertise = this.crewExpertise.get(crewMember) || [];
    return expertise.map(area => `Search for ${area.replace('_', ' ')} solutions`);
  }

  private calculateKnowledgeStats(crewMember: CrewMember): KnowledgeStats {
    const entries = Array.from(this.crewMemories.values())
      .filter(entry => entry.crewMember === crewMember);
    
    return {
      totalEntries: entries.length,
      averageConfidence: entries.reduce((sum, entry) => sum + entry.confidenceLevel, 0) / entries.length,
      expertiseAreas: this.crewExpertise.get(crewMember) || [],
      recentActivity: entries.filter(entry => 
        (Date.now() - entry.timestamp.getTime()) < (7 * 24 * 60 * 60 * 1000)
      ).length
    };
  }

  private calculateCrewContributions(): Map<CrewMember, number> {
    const contributions = new Map<CrewMember, number>();
    
    for (const entry of this.crewMemories.values()) {
      contributions.set(entry.crewMember, (contributions.get(entry.crewMember) || 0) + 1);
    }
    
    return contributions;
  }

  private calculateKnowledgeDistribution(): Map<KnowledgeType, number> {
    const distribution = new Map<KnowledgeType, number>();
    
    for (const entry of this.crewMemories.values()) {
      distribution.set(entry.knowledgeType, (distribution.get(entry.knowledgeType) || 0) + 1);
    }
    
    return distribution;
  }

  private calculateExpertiseOverlap(): Map<string, number> {
    // Calculate overlap between crew member expertise areas
    const overlap = new Map<string, number>();
    
    const crewList = Array.from(this.crewExpertise.keys());
    for (let i = 0; i < crewList.length; i++) {
      for (let j = i + 1; j < crewList.length; j++) {
        const crew1 = crewList[i];
        const crew2 = crewList[j];
        const expertise1 = this.crewExpertise.get(crew1) || [];
        const expertise2 = this.crewExpertise.get(crew2) || [];
        
        const common = expertise1.filter(area => expertise2.includes(area));
        const overlapKey = `${crew1}-${crew2}`;
        overlap.set(overlapKey, common.length);
      }
    }
    
    return overlap;
  }

  private calculateConflictResolutionRate(): number {
    const totalEntries = this.crewMemories.size;
    const entriesWithConflicts = Array.from(this.crewMemories.values())
      .filter(entry => entry.conflictResolutions.length > 0).length;
    
    return totalEntries > 0 ? entriesWithConflicts / totalEntries : 0;
  }

  private calculatePrimeDirectiveCompliance(): number {
    const totalEntries = this.crewMemories.size;
    const compliantEntries = Array.from(this.crewMemories.values())
      .filter(entry => !entry.projectSpecificity).length;
    
    return totalEntries > 0 ? compliantEntries / totalEntries : 1.0;
  }

  private analyzeRecentTrends(): string[] {
    const recentEntries = Array.from(this.crewMemories.values())
      .filter(entry => (Date.now() - entry.timestamp.getTime()) < (30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const trends: string[] = [];
    
    // Analyze knowledge type trends
    const typeCount = new Map<KnowledgeType, number>();
    recentEntries.forEach(entry => {
      typeCount.set(entry.knowledgeType, (typeCount.get(entry.knowledgeType) || 0) + 1);
    });
    
    const topTypes = Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    topTypes.forEach(([type, count]) => {
      trends.push(`Increased focus on ${type.replace('_', ' ')} (${count} entries)`);
    });
    
    return trends;
  }

  private extractTopInsights(): string[] {
    const insights: string[] = [];
    
    // Extract insights from high-confidence entries
    const highConfidenceEntries = Array.from(this.crewMemories.values())
      .filter(entry => entry.confidenceLevel > 90)
      .sort((a, b) => b.confidenceLevel - a.confidenceLevel)
      .slice(0, 5);
    
    highConfidenceEntries.forEach(entry => {
      insights.push(`${entry.crewMember}: ${entry.summary}`);
    });
    
    return insights;
  }
}

// Supporting interfaces and types

interface PrimeDirectiveFilter {
  name: string;
  description: string;
  filter: (entry: CrewMemoryEntry) => CrewMemoryEntry;
}

interface LCARSTerminalData {
  crewMember: CrewMember;
  expertiseAreas: string[];
  recentEntries: CrewMemoryEntry[];
  totalEntries: number;
  knowledgeStats: KnowledgeStats;
  relatedMemories: CrewMemoryEntry[];
  searchSuggestions: string[];
}

interface KnowledgeStats {
  totalEntries: number;
  averageConfidence: number;
  expertiseAreas: string[];
  recentActivity: number;
}

interface CollectiveIntelligenceReport {
  totalMemories: number;
  crewContributions: Map<CrewMember, number>;
  knowledgeDistribution: Map<KnowledgeType, number>;
  expertiseOverlap: Map<string, number>;
  conflictResolutionRate: number;
  primeDirectiveCompliance: number;
  recentTrends: string[];
  topInsights: string[];
}

export default SharedLibraryComputerSystem;

