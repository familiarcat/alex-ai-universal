/**
 * Revised Prime Directive System
 * Alex AI assistant with practical development capabilities and clean file system management
 */

export interface ChangeMemory {
  sessionId: string;
  modifications: FileModification[];
  tempFiles: TempFile[];
  status: 'active' | 'clean' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface FileModification {
  file: string;
  crewMember: string;
  reason: string;
  timestamp: Date;
  rollback: string;
  forward: string;
  originalContent?: string;
  newContent?: string;
}

export interface TempFile {
  path: string;
  purpose: string;
  crewMember: string;
  createdAt: Date;
  status: 'active' | 'deleted';
}

export class RevisedPrimeDirective {
  private changeMemory: ChangeMemory;
  private tempFileRegistry: Map<string, TempFile> = new Map();

  constructor(sessionId: string) {
    this.changeMemory = {
      sessionId,
      modifications: [],
      tempFiles: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create temporary file with immediate cleanup tracking
   */
  async createTempFile(
    content: string, 
    purpose: string, 
    crewMember: string,
    extension: string = '.tmp'
  ): Promise<string> {
    const tempPath = `/tmp/alex-ai-${this.changeMemory.sessionId}-${Date.now()}${extension}`;
    
    const tempFile: TempFile = {
      path: tempPath,
      purpose,
      crewMember,
      createdAt: new Date(),
      status: 'active'
    };

    // Register for cleanup
    this.tempFileRegistry.set(tempPath, tempFile);
    this.changeMemory.tempFiles.push(tempFile);

    // Write content
    await this.writeFile(tempPath, content);
    
    console.log(`📄 Temp file created: ${tempPath} (${purpose}) by ${crewMember}`);
    return tempPath;
  }

  /**
   * Delete temporary file immediately after use
   */
  async deleteTempFile(path: string): Promise<void> {
    const tempFile = this.tempFileRegistry.get(path);
    if (tempFile) {
      tempFile.status = 'deleted';
      await this.deleteFile(path);
      this.tempFileRegistry.delete(path);
      console.log(`🗑️  Temp file deleted: ${path}`);
    }
  }

  /**
   * Track file modification with rollback capability
   */
  async modifyFile(
    filePath: string,
    newContent: string,
    reason: string,
    crewMember: string
  ): Promise<void> {
    // Read original content for rollback
    const originalContent = await this.readFile(filePath);
    
    // Create modification record
    const modification: FileModification = {
      file: filePath,
      crewMember,
      reason,
      timestamp: new Date(),
      rollback: `git checkout HEAD -- ${filePath}`,
      forward: `validate changes in ${filePath}`,
      originalContent,
      newContent
    };

    // Apply modification
    await this.writeFile(filePath, newContent);
    
    // Track in memory
    this.changeMemory.modifications.push(modification);
    this.changeMemory.updatedAt = new Date();

    console.log(`📝 File modified: ${filePath} by ${crewMember} (${reason})`);
    console.log(`🔄 Rollback: ${modification.rollback}`);
  }

  /**
   * Clean up all temporary files
   */
  async cleanupTempFiles(): Promise<void> {
    const activeTempFiles = Array.from(this.tempFileRegistry.values())
      .filter(file => file.status === 'active');

    for (const tempFile of activeTempFiles) {
      await this.deleteTempFile(tempFile.path);
    }

    // Update memory
    this.changeMemory.tempFiles = this.changeMemory.tempFiles
      .filter(file => file.status === 'deleted');
    this.changeMemory.status = 'clean';
    this.changeMemory.updatedAt = new Date();

    console.log(`🧹 Cleanup complete: ${activeTempFiles.length} temp files removed`);
  }

  /**
   * Get rollback instructions for all modifications
   */
  getRollbackInstructions(): string[] {
    return this.changeMemory.modifications.map(mod => mod.rollback);
  }

  /**
   * Get forward progression steps
   */
  getForwardSteps(): string[] {
    return this.changeMemory.modifications.map(mod => mod.forward);
  }

  /**
   * Get change memory summary
   */
  getChangeMemorySummary(): ChangeMemory {
    return {
      ...this.changeMemory,
      tempFiles: this.changeMemory.tempFiles.filter(f => f.status === 'active')
    };
  }

  /**
   * Archive session memory
   */
  archiveSession(): ChangeMemory {
    this.changeMemory.status = 'archived';
    this.changeMemory.updatedAt = new Date();
    return this.changeMemory;
  }

  /**
   * Check if file system is clean
   */
  isFileSystemClean(): boolean {
    const activeTempFiles = this.changeMemory.tempFiles
      .filter(file => file.status === 'active');
    
    return activeTempFiles.length === 0 && this.changeMemory.status === 'clean';
  }

  /**
   * Get cleanup report
   */
  getCleanupReport(): string {
    const activeTempFiles = this.changeMemory.tempFiles
      .filter(file => file.status === 'active');
    
    const modifications = this.changeMemory.modifications.length;
    
    return `
🧹 Alex AI Cleanup Report
========================
Session: ${this.changeMemory.sessionId}
Status: ${this.changeMemory.status}
Modifications: ${modifications}
Active Temp Files: ${activeTempFiles.length}
File System Clean: ${this.isFileSystemClean()}

${activeTempFiles.length > 0 ? '⚠️  Active temp files need cleanup!' : '✅ All temp files cleaned up'}
${modifications > 0 ? `📝 ${modifications} files modified (rollback available)` : '📝 No permanent modifications'}
    `.trim();
  }

  // File system operations (to be implemented with actual file system access)
  private async writeFile(path: string, content: string): Promise<void> {
    // Implementation would use actual file system
    console.log(`Writing to ${path}: ${content.length} characters`);
  }

  private async readFile(path: string): Promise<string> {
    // Implementation would use actual file system
    console.log(`Reading from ${path}`);
    return 'original content';
  }

  private async deleteFile(path: string): Promise<void> {
    // Implementation would use actual file system
    console.log(`Deleting ${path}`);
  }
}

/**
 * Crew Member Integration
 */
export class CrewPrimeDirective {
  private crewDirectives: Map<string, RevisedPrimeDirective> = new Map();

  constructor() {
    this.initializeCrewDirectives();
  }

  private initializeCrewDirectives(): void {
    const crewMembers = [
      'captain_picard', 'commander_data', 'geordi_la_forge', 'lieutenant_worf',
      'counselor_troi', 'commander_riker', 'dr_crusher', 'la_forge', 'spock'
    ];

    crewMembers.forEach(crewMember => {
      const sessionId = `${crewMember}-${Date.now()}`;
      this.crewDirectives.set(crewMember, new RevisedPrimeDirective(sessionId));
    });
  }

  /**
   * Get directive for specific crew member
   */
  getCrewDirective(crewMember: string): RevisedPrimeDirective {
    return this.crewDirectives.get(crewMember) || 
           new RevisedPrimeDirective(`${crewMember}-${Date.now()}`);
  }

  /**
   * Clean up all crew member temp files
   */
  async cleanupAllCrewFiles(): Promise<void> {
    for (const [crewMember, directive] of this.crewDirectives) {
      await directive.cleanupTempFiles();
      console.log(`🧹 ${crewMember} files cleaned up`);
    }
  }

  /**
   * Get system-wide cleanup report
   */
  getSystemCleanupReport(): string {
    let report = '🧹 Alex AI System Cleanup Report\n';
    report += '================================\n\n';

    for (const [crewMember, directive] of this.crewDirectives) {
      const summary = directive.getChangeMemorySummary();
      report += `👤 ${crewMember}:\n`;
      report += `   Status: ${summary.status}\n`;
      report += `   Modifications: ${summary.modifications.length}\n`;
      report += `   Temp Files: ${summary.tempFiles.length}\n`;
      report += `   Clean: ${directive.isFileSystemClean()}\n\n`;
    }

    return report;
  }
}

