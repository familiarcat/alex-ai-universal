/**
 * Change Tracking Protocol with Rollback Capability
 * Tracks all file modifications with natural language context for rollback/forward operations
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

export interface FileChange {
  id: string;
  filePath: string;
  crewMember: string;
  reason: string;
  timestamp: Date;
  changeType: 'modify' | 'create' | 'delete' | 'rename';
  originalContent?: string;
  newContent?: string;
  originalPath?: string; // For renames
  newPath?: string; // For renames
  rollbackCommand: string;
  forwardCommand: string;
  naturalLanguageContext: string;
  status: 'pending' | 'applied' | 'rolled_back' | 'error';
}

export interface ChangeSet {
  id: string;
  sessionId: string;
  description: string;
  changes: FileChange[];
  createdAt: Date;
  appliedAt?: Date;
  rolledBackAt?: Date;
  status: 'pending' | 'applied' | 'rolled_back' | 'partial';
}

export interface RollbackPlan {
  changeSetId: string;
  rollbackCommands: string[];
  naturalLanguageInstructions: string;
  riskAssessment: 'low' | 'medium' | 'high';
  dependencies: string[];
  estimatedTime: number; // in minutes
}

export class ChangeTracker {
  private changeSets: Map<string, ChangeSet> = new Map();
  private currentChangeSet: ChangeSet | null = null;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Start a new change set
   */
  startChangeSet(description: string): string {
    const changeSetId = `changeset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentChangeSet = {
      id: changeSetId,
      sessionId: this.sessionId,
      description,
      changes: [],
      createdAt: new Date(),
      status: 'pending'
    };

    this.changeSets.set(changeSetId, this.currentChangeSet);
    console.log(`📝 Started change set: ${description}`);
    return changeSetId;
  }

  /**
   * Track file modification
   */
  async trackFileModification(
    filePath: string,
    newContent: string,
    crewMember: string,
    reason: string,
    naturalLanguageContext: string
  ): Promise<string> {
    if (!this.currentChangeSet) {
      throw new Error('No active change set. Call startChangeSet() first.');
    }

    const changeId = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Read original content if file exists
    let originalContent: string | undefined;
    let changeType: FileChange['changeType'] = 'modify';
    
    try {
      originalContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      // File doesn't exist, this is a create operation
      changeType = 'create';
      originalContent = undefined;
    }

    const change: FileChange = {
      id: changeId,
      filePath,
      crewMember,
      reason,
      timestamp: new Date(),
      changeType,
      originalContent,
      newContent,
      rollbackCommand: this.generateRollbackCommand(filePath, originalContent, changeType),
      forwardCommand: this.generateForwardCommand(filePath, reason),
      naturalLanguageContext,
      status: 'pending'
    };

    this.currentChangeSet.changes.push(change);
    console.log(`📝 Tracked ${changeType}: ${filePath} by ${crewMember}`);
    return changeId;
  }

  /**
   * Track file creation
   */
  async trackFileCreation(
    filePath: string,
    content: string,
    crewMember: string,
    reason: string,
    naturalLanguageContext: string
  ): Promise<string> {
    if (!this.currentChangeSet) {
      throw new Error('No active change set. Call startChangeSet() first.');
    }

    const changeId = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const change: FileChange = {
      id: changeId,
      filePath,
      crewMember,
      reason,
      timestamp: new Date(),
      changeType: 'create',
      newContent: content,
      rollbackCommand: `rm -f "${filePath}"`,
      forwardCommand: `verify file "${filePath}" was created successfully`,
      naturalLanguageContext,
      status: 'pending'
    };

    this.currentChangeSet.changes.push(change);
    console.log(`📝 Tracked creation: ${filePath} by ${crewMember}`);
    return changeId;
  }

  /**
   * Track file deletion
   */
  async trackFileDeletion(
    filePath: string,
    crewMember: string,
    reason: string,
    naturalLanguageContext: string
  ): Promise<string> {
    if (!this.currentChangeSet) {
      throw new Error('No active change set. Call startChangeSet() first.');
    }

    // Read original content for rollback
    let originalContent: string | undefined;
    try {
      originalContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      console.warn(`⚠️  Could not read file for deletion tracking: ${filePath}`);
    }

    const changeId = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const change: FileChange = {
      id: changeId,
      filePath,
      crewMember,
      reason,
      timestamp: new Date(),
      changeType: 'delete',
      originalContent,
      rollbackCommand: originalContent 
        ? `echo '${originalContent.replace(/'/g, "\\'")}' > "${filePath}"`
        : `touch "${filePath}"`,
      forwardCommand: `verify file "${filePath}" was deleted successfully`,
      naturalLanguageContext,
      status: 'pending'
    };

    this.currentChangeSet.changes.push(change);
    console.log(`📝 Tracked deletion: ${filePath} by ${crewMember}`);
    return changeId;
  }

  /**
   * Apply all changes in current change set
   */
  async applyChangeSet(): Promise<void> {
    if (!this.currentChangeSet) {
      throw new Error('No active change set to apply.');
    }

    console.log(`🚀 Applying change set: ${this.currentChangeSet.description}`);
    
    for (const change of this.currentChangeSet.changes) {
      try {
        await this.applyChange(change);
        change.status = 'applied';
      } catch (error) {
        change.status = 'error';
        console.error(`❌ Failed to apply change ${change.id}: ${error}`);
      }
    }

    this.currentChangeSet.appliedAt = new Date();
    this.currentChangeSet.status = this.currentChangeSet.changes.every(c => c.status === 'applied') 
      ? 'applied' 
      : 'partial';
    
    console.log(`✅ Change set applied: ${this.currentChangeSet.status}`);
  }

  /**
   * Apply individual change
   */
  private async applyChange(change: FileChange): Promise<void> {
    switch (change.changeType) {
      case 'create':
      case 'modify':
        await fs.writeFile(change.filePath, change.newContent!, 'utf8');
        break;
      case 'delete':
        await fs.unlink(change.filePath);
        break;
    }
  }

  /**
   * Generate rollback plan for change set
   */
  generateRollbackPlan(changeSetId: string): RollbackPlan {
    const changeSet = this.changeSets.get(changeSetId);
    if (!changeSet) {
      throw new Error(`Change set not found: ${changeSetId}`);
    }

    const rollbackCommands = changeSet.changes
      .filter(change => change.status === 'applied')
      .map(change => change.rollbackCommand);

    const naturalLanguageInstructions = this.generateNaturalLanguageRollback(changeSet);
    const riskAssessment = this.assessRollbackRisk(changeSet);
    const dependencies = this.identifyDependencies(changeSet);
    const estimatedTime = this.estimateRollbackTime(changeSet);

    return {
      changeSetId,
      rollbackCommands,
      naturalLanguageInstructions,
      riskAssessment,
      dependencies,
      estimatedTime
    };
  }

  /**
   * Execute rollback for change set
   */
  async executeRollback(changeSetId: string): Promise<void> {
    const plan = this.generateRollbackPlan(changeSetId);
    const changeSet = this.changeSets.get(changeSetId);
    
    if (!changeSet) {
      throw new Error(`Change set not found: ${changeSetId}`);
    }

    console.log(`🔄 Executing rollback for: ${changeSet.description}`);
    console.log(`⚠️  Risk Level: ${plan.riskAssessment}`);
    
    for (const command of plan.rollbackCommands) {
      try {
        execSync(command, { stdio: 'pipe' });
        console.log(`✅ Rollback command executed: ${command}`);
      } catch (error) {
        console.error(`❌ Rollback command failed: ${command} - ${error}`);
      }
    }

    // Update change set status
    changeSet.rolledBackAt = new Date();
    changeSet.status = 'rolled_back';
    
    // Update individual changes
    changeSet.changes
      .filter(change => change.status === 'applied')
      .forEach(change => change.status = 'rolled_back');

    console.log(`✅ Rollback completed for change set: ${changeSetId}`);
  }

  /**
   * Generate rollback command
   */
  private generateRollbackCommand(
    filePath: string, 
    originalContent: string | undefined, 
    changeType: FileChange['changeType']
  ): string {
    switch (changeType) {
      case 'create':
        return `rm -f "${filePath}"`;
      case 'delete':
        return originalContent 
          ? `echo '${originalContent.replace(/'/g, "\\'")}' > "${filePath}"`
          : `touch "${filePath}"`;
      case 'modify':
        return originalContent 
          ? `echo '${originalContent.replace(/'/g, "\\'")}' > "${filePath}"`
          : `rm -f "${filePath}"`;
      default:
        return `# Unknown change type: ${changeType}`;
    }
  }

  /**
   * Generate forward command
   */
  private generateForwardCommand(filePath: string, reason: string): string {
    return `# Verify: ${reason} in ${filePath}`;
  }

  /**
   * Generate natural language rollback instructions
   */
  private generateNaturalLanguageRollback(changeSet: ChangeSet): string {
    const changes = changeSet.changes.filter(c => c.status === 'applied');
    
    let instructions = `To rollback the changes made in "${changeSet.description}":\n\n`;
    
    changes.forEach(change => {
      switch (change.changeType) {
        case 'create':
          instructions += `• Delete the file "${change.filePath}" that was created by ${change.crewMember}\n`;
          break;
        case 'delete':
          instructions += `• Restore the file "${change.filePath}" that was deleted by ${change.crewMember}\n`;
          break;
        case 'modify':
          instructions += `• Restore "${change.filePath}" to its original state (modified by ${change.crewMember})\n`;
          break;
      }
    });
    
    instructions += `\nThis rollback will undo ${changes.length} changes made by crew members.`;
    
    return instructions;
  }

  /**
   * Assess rollback risk
   */
  private assessRollbackRisk(changeSet: ChangeSet): 'low' | 'medium' | 'high' {
    const appliedChanges = changeSet.changes.filter(c => c.status === 'applied');
    
    if (appliedChanges.length === 0) return 'low';
    if (appliedChanges.length <= 3) return 'medium';
    return 'high';
  }

  /**
   * Identify dependencies
   */
  private identifyDependencies(changeSet: ChangeSet): string[] {
    // Simple dependency identification based on file paths
    const dependencies: string[] = [];
    const filePaths = changeSet.changes.map(c => c.filePath);
    
    // Check for package.json changes (high dependency impact)
    if (filePaths.some(p => p.includes('package.json'))) {
      dependencies.push('package dependencies');
    }
    
    // Check for config file changes
    if (filePaths.some(p => p.includes('.config.'))) {
      dependencies.push('configuration files');
    }
    
    return dependencies;
  }

  /**
   * Estimate rollback time
   */
  private estimateRollbackTime(changeSet: ChangeSet): number {
    const appliedChanges = changeSet.changes.filter(c => c.status === 'applied');
    return Math.max(1, Math.ceil(appliedChanges.length / 2)); // Rough estimate: 30 seconds per change
  }

  /**
   * Get change set summary
   */
  getChangeSetSummary(changeSetId: string): ChangeSet | undefined {
    return this.changeSets.get(changeSetId);
  }

  /**
   * Get all change sets
   */
  getAllChangeSets(): ChangeSet[] {
    return Array.from(this.changeSets.values());
  }

  /**
   * Get natural language summary
   */
  getNaturalLanguageSummary(): string {
    const allChangeSets = this.getAllChangeSets();
    const totalChanges = allChangeSets.reduce((sum, cs) => sum + cs.changes.length, 0);
    const appliedChanges = allChangeSets.reduce((sum, cs) => 
      sum + cs.changes.filter(c => c.status === 'applied').length, 0);
    
    let summary = `Alex AI has tracked ${totalChanges} file changes across ${allChangeSets.length} change sets. `;
    summary += `${appliedChanges} changes have been applied and are ready for rollback if needed. `;
    
    if (appliedChanges > 0) {
      summary += `All applied changes can be rolled back using the generated rollback commands.`;
    } else {
      summary += `No changes have been applied yet.`;
    }
    
    return summary;
  }
}

