/**
 * Short-Term Memory System for Alex AI
 * Tracks changes, modifications, and temporary operations for rollback/forward capability
 */

export interface MemoryEntry {
  id: string;
  type: 'modification' | 'temp_file' | 'analysis' | 'recommendation';
  crewMember: string;
  timestamp: Date;
  description: string;
  data: any;
  rollback?: string;
  forward?: string;
  status: 'active' | 'completed' | 'rolled_back' | 'archived';
}

export interface SessionMemory {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  entries: MemoryEntry[];
  status: 'active' | 'completed' | 'archived';
  summary: SessionSummary;
}

export interface SessionSummary {
  totalModifications: number;
  totalTempFiles: number;
  totalAnalyses: number;
  totalRecommendations: number;
  crewMemberActivity: Map<string, number>;
  rollbackAvailable: boolean;
  cleanupRequired: boolean;
}

export class ShortTermMemory {
  private sessionMemory: SessionMemory;
  private memoryEntries: Map<string, MemoryEntry> = new Map();
  private maxMemorySize: number = 1000; // Maximum entries per session

  constructor(sessionId: string) {
    this.sessionMemory = {
      sessionId,
      startTime: new Date(),
      entries: [],
      status: 'active',
      summary: {
        totalModifications: 0,
        totalTempFiles: 0,
        totalAnalyses: 0,
        totalRecommendations: 0,
        crewMemberActivity: new Map(),
        rollbackAvailable: false,
        cleanupRequired: false
      }
    };
  }

  /**
   * Add memory entry for file modification
   */
  addModificationMemory(
    file: string,
    crewMember: string,
    reason: string,
    rollback: string,
    forward: string,
    data: any = {}
  ): string {
    const entry: MemoryEntry = {
      id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'modification',
      crewMember,
      timestamp: new Date(),
      description: `Modified ${file}: ${reason}`,
      data: { file, reason, ...data },
      rollback,
      forward,
      status: 'active'
    };

    return this.addMemoryEntry(entry);
  }

  /**
   * Add memory entry for temporary file
   */
  addTempFileMemory(
    path: string,
    purpose: string,
    crewMember: string,
    data: any = {}
  ): string {
    const entry: MemoryEntry = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'temp_file',
      crewMember,
      timestamp: new Date(),
      description: `Temp file: ${path} (${purpose})`,
      data: { path, purpose, ...data },
      rollback: `rm -f ${path}`,
      forward: `verify cleanup of ${path}`,
      status: 'active'
    };

    return this.addMemoryEntry(entry);
  }

  /**
   * Add memory entry for analysis
   */
  addAnalysisMemory(
    subject: string,
    crewMember: string,
    findings: any,
    data: any = {}
  ): string {
    const entry: MemoryEntry = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'analysis',
      crewMember,
      timestamp: new Date(),
      description: `Analysis: ${subject}`,
      data: { subject, findings, ...data },
      status: 'active'
    };

    return this.addMemoryEntry(entry);
  }

  /**
   * Add memory entry for recommendation
   */
  addRecommendationMemory(
    recommendation: string,
    crewMember: string,
    reasoning: string,
    data: any = {}
  ): string {
    const entry: MemoryEntry = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'recommendation',
      crewMember,
      timestamp: new Date(),
      description: `Recommendation: ${recommendation}`,
      data: { recommendation, reasoning, ...data },
      status: 'active'
    };

    return this.addMemoryEntry(entry);
  }

  /**
   * Add memory entry (internal)
   */
  private addMemoryEntry(entry: MemoryEntry): string {
    // Check memory size limit
    if (this.sessionMemory.entries.length >= this.maxMemorySize) {
      // Remove oldest entries
      const oldestEntries = this.sessionMemory.entries
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(0, 10); // Remove 10 oldest entries
      
      oldestEntries.forEach(oldEntry => {
        this.memoryEntries.delete(oldEntry.id);
      });
      
      this.sessionMemory.entries = this.sessionMemory.entries
        .filter(e => !oldestEntries.includes(e));
    }

    // Add new entry
    this.memoryEntries.set(entry.id, entry);
    this.sessionMemory.entries.push(entry);
    
    // Update summary
    this.updateSummary(entry);

    console.log(`🧠 Memory added: ${entry.description} by ${entry.crewMember}`);
    return entry.id;
  }

  /**
   * Update session summary
   */
  private updateSummary(entry: MemoryEntry): void {
    const summary = this.sessionMemory.summary;
    
    // Update counters
    switch (entry.type) {
      case 'modification':
        summary.totalModifications++;
        summary.rollbackAvailable = true;
        break;
      case 'temp_file':
        summary.totalTempFiles++;
        summary.cleanupRequired = true;
        break;
      case 'analysis':
        summary.totalAnalyses++;
        break;
      case 'recommendation':
        summary.totalRecommendations++;
        break;
    }

    // Update crew member activity
    const currentActivity = summary.crewMemberActivity.get(entry.crewMember) || 0;
    summary.crewMemberActivity.set(entry.crewMember, currentActivity + 1);
  }

  /**
   * Mark entry as completed
   */
  markEntryCompleted(entryId: string): void {
    const entry = this.memoryEntries.get(entryId);
    if (entry) {
      entry.status = 'completed';
      console.log(`✅ Memory entry completed: ${entry.description}`);
    }
  }

  /**
   * Rollback entry
   */
  rollbackEntry(entryId: string): string | null {
    const entry = this.memoryEntries.get(entryId);
    if (entry && entry.rollback) {
      entry.status = 'rolled_back';
      console.log(`🔄 Memory entry rolled back: ${entry.description}`);
      return entry.rollback;
    }
    return null;
  }

  /**
   * Get rollback instructions for all modifications
   */
  getAllRollbackInstructions(): string[] {
    return this.sessionMemory.entries
      .filter(entry => entry.type === 'modification' && entry.rollback)
      .map(entry => entry.rollback!);
  }

  /**
   * Get forward progression steps
   */
  getAllForwardSteps(): string[] {
    return this.sessionMemory.entries
      .filter(entry => entry.forward)
      .map(entry => entry.forward!);
  }

  /**
   * Get cleanup instructions for temp files
   */
  getCleanupInstructions(): string[] {
    return this.sessionMemory.entries
      .filter(entry => entry.type === 'temp_file' && entry.status === 'active')
      .map(entry => entry.rollback!)
      .filter(instruction => instruction);
  }

  /**
   * Get memory summary
   */
  getMemorySummary(): SessionMemory {
    return {
      ...this.sessionMemory,
      summary: { ...this.sessionMemory.summary }
    };
  }

  /**
   * Get entries by crew member
   */
  getEntriesByCrewMember(crewMember: string): MemoryEntry[] {
    return this.sessionMemory.entries
      .filter(entry => entry.crewMember === crewMember);
  }

  /**
   * Get entries by type
   */
  getEntriesByType(type: MemoryEntry['type']): MemoryEntry[] {
    return this.sessionMemory.entries
      .filter(entry => entry.type === type);
  }

  /**
   * Archive session
   */
  archiveSession(): SessionMemory {
    this.sessionMemory.status = 'archived';
    this.sessionMemory.endTime = new Date();
    
    // Mark all active entries as archived
    this.sessionMemory.entries
      .filter(entry => entry.status === 'active')
      .forEach(entry => entry.status = 'archived');

    console.log(`📁 Session archived: ${this.sessionMemory.sessionId}`);
    return this.sessionMemory;
  }

  /**
   * Get natural language summary
   */
  getNaturalLanguageSummary(): string {
    const summary = this.sessionMemory.summary;
    const duration = this.sessionMemory.endTime 
      ? this.sessionMemory.endTime.getTime() - this.sessionMemory.startTime.getTime()
      : Date.now() - this.sessionMemory.startTime.getTime();
    
    const durationMinutes = Math.round(duration / (1000 * 60));
    
    let report = `🧠 Alex AI Session Memory Summary\n`;
    report += `===============================\n`;
    report += `Session: ${this.sessionMemory.sessionId}\n`;
    report += `Duration: ${durationMinutes} minutes\n`;
    report += `Status: ${this.sessionMemory.status}\n\n`;
    
    report += `📊 Activity Summary:\n`;
    report += `   • Modifications: ${summary.totalModifications}\n`;
    report += `   • Temp Files: ${summary.totalTempFiles}\n`;
    report += `   • Analyses: ${summary.totalAnalyses}\n`;
    report += `   • Recommendations: ${summary.totalRecommendations}\n\n`;
    
    report += `👥 Crew Member Activity:\n`;
    for (const [crewMember, activity] of summary.crewMemberActivity) {
      report += `   • ${crewMember}: ${activity} actions\n`;
    }
    
    report += `\n🔧 Actions Required:\n`;
    if (summary.rollbackAvailable) {
      report += `   • Rollback available for ${summary.totalModifications} modifications\n`;
    }
    if (summary.cleanupRequired) {
      report += `   • Cleanup required for ${summary.totalTempFiles} temp files\n`;
    }
    
    return report;
  }
}

