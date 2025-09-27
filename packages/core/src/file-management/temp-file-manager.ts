/**
 * Temporary File Management System
 * Creates, tracks, and immediately cleans up temporary files with crew member accountability
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface TempFileInfo {
  id: string;
  path: string;
  purpose: string;
  crewMember: string;
  createdAt: Date;
  size: number;
  status: 'active' | 'deleted' | 'error';
  metadata?: any;
}

export interface TempFileRegistry {
  sessionId: string;
  files: Map<string, TempFileInfo>;
  totalCreated: number;
  totalDeleted: number;
  totalErrors: number;
  lastCleanup: Date;
}

export class TempFileManager {
  private registry: TempFileRegistry;
  private tempDir: string;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.tempDir = path.join(os.tmpdir(), 'alex-ai', sessionId);
    this.registry = {
      sessionId,
      files: new Map(),
      totalCreated: 0,
      totalDeleted: 0,
      totalErrors: 0,
      lastCleanup: new Date()
    };

    this.ensureTempDir();
  }

  /**
   * Ensure temp directory exists
   */
  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Create temporary file with immediate tracking
   */
  async createTempFile(
    content: string,
    purpose: string,
    crewMember: string,
    extension: string = '.tmp',
    metadata?: any
  ): Promise<TempFileInfo> {
    const fileName = `alex-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`;
    const filePath = path.join(this.tempDir, fileName);
    
    try {
      // Write file content
      await fs.writeFile(filePath, content, 'utf8');
      
      // Get file stats
      const stats = await fs.stat(filePath);
      
      // Create file info
      const fileInfo: TempFileInfo = {
        id: `${this.sessionId}-${fileName}`,
        path: filePath,
        purpose,
        crewMember,
        createdAt: new Date(),
        size: stats.size,
        status: 'active',
        metadata
      };

      // Register file
      this.registry.files.set(fileInfo.id, fileInfo);
      this.registry.totalCreated++;

      console.log(`📄 Temp file created: ${fileName} (${stats.size} bytes) by ${crewMember} for ${purpose}`);
      return fileInfo;

    } catch (error) {
      this.registry.totalErrors++;
      console.error(`❌ Failed to create temp file: ${error}`);
      throw error;
    }
  }

  /**
   * Create temporary file from existing file (copy)
   */
  async createTempFileFromExisting(
    sourcePath: string,
    purpose: string,
    crewMember: string,
    extension?: string
  ): Promise<TempFileInfo> {
    try {
      const content = await fs.readFile(sourcePath, 'utf8');
      const ext = extension || path.extname(sourcePath);
      return this.createTempFile(content, purpose, crewMember, ext, { sourcePath });
    } catch (error) {
      this.registry.totalErrors++;
      console.error(`❌ Failed to copy file to temp: ${error}`);
      throw error;
    }
  }

  /**
   * Read temporary file content
   */
  async readTempFile(fileId: string): Promise<string> {
    const fileInfo = this.registry.files.get(fileId);
    if (!fileInfo || fileInfo.status !== 'active') {
      throw new Error(`Temp file not found or deleted: ${fileId}`);
    }

    try {
      return await fs.readFile(fileInfo.path, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to read temp file: ${error}`);
      throw error;
    }
  }

  /**
   * Update temporary file content
   */
  async updateTempFile(fileId: string, content: string): Promise<void> {
    const fileInfo = this.registry.files.get(fileId);
    if (!fileInfo || fileInfo.status !== 'active') {
      throw new Error(`Temp file not found or deleted: ${fileId}`);
    }

    try {
      await fs.writeFile(fileInfo.path, content, 'utf8');
      const stats = await fs.stat(fileInfo.path);
      fileInfo.size = stats.size;
      console.log(`📝 Temp file updated: ${fileInfo.path} (${stats.size} bytes)`);
    } catch (error) {
      this.registry.totalErrors++;
      console.error(`❌ Failed to update temp file: ${error}`);
      throw error;
    }
  }

  /**
   * Delete temporary file immediately
   */
  async deleteTempFile(fileId: string): Promise<void> {
    const fileInfo = this.registry.files.get(fileId);
    if (!fileInfo) {
      console.warn(`⚠️  Temp file not found in registry: ${fileId}`);
      return;
    }

    try {
      await fs.unlink(fileInfo.path);
      fileInfo.status = 'deleted';
      this.registry.totalDeleted++;
      console.log(`🗑️  Temp file deleted: ${fileInfo.path}`);
    } catch (error) {
      fileInfo.status = 'error';
      this.registry.totalErrors++;
      console.error(`❌ Failed to delete temp file: ${error}`);
    }
  }

  /**
   * Clean up all temporary files for crew member
   */
  async cleanupCrewMemberFiles(crewMember: string): Promise<number> {
    const crewFiles = Array.from(this.registry.files.values())
      .filter(file => file.crewMember === crewMember && file.status === 'active');

    let cleaned = 0;
    for (const file of crewFiles) {
      try {
        await this.deleteTempFile(file.id);
        cleaned++;
      } catch (error) {
        console.error(`❌ Failed to cleanup file for ${crewMember}: ${error}`);
      }
    }

    console.log(`🧹 Cleaned up ${cleaned} temp files for ${crewMember}`);
    return cleaned;
  }

  /**
   * Clean up all temporary files
   */
  async cleanupAllTempFiles(): Promise<void> {
    const activeFiles = Array.from(this.registry.files.values())
      .filter(file => file.status === 'active');

    let cleaned = 0;
    for (const file of activeFiles) {
      try {
        await this.deleteTempFile(file.id);
        cleaned++;
      } catch (error) {
        console.error(`❌ Failed to cleanup file: ${error}`);
      }
    }

    this.registry.lastCleanup = new Date();
    console.log(`🧹 Cleaned up ${cleaned} temp files`);
  }

  /**
   * Get temporary file info
   */
  getTempFileInfo(fileId: string): TempFileInfo | undefined {
    return this.registry.files.get(fileId);
  }

  /**
   * Get all active temporary files
   */
  getActiveTempFiles(): TempFileInfo[] {
    return Array.from(this.registry.files.values())
      .filter(file => file.status === 'active');
  }

  /**
   * Get temporary files by crew member
   */
  getTempFilesByCrewMember(crewMember: string): TempFileInfo[] {
    return Array.from(this.registry.files.values())
      .filter(file => file.crewMember === crewMember);
  }

  /**
   * Get cleanup report
   */
  getCleanupReport(): string {
    const activeFiles = this.getActiveTempFiles();
    const totalSize = activeFiles.reduce((sum, file) => sum + file.size, 0);
    
    let report = `🧹 Temp File Cleanup Report\n`;
    report += `==========================\n`;
    report += `Session: ${this.sessionId}\n`;
    report += `Total Created: ${this.registry.totalCreated}\n`;
    report += `Total Deleted: ${this.registry.totalDeleted}\n`;
    report += `Total Errors: ${this.registry.totalErrors}\n`;
    report += `Active Files: ${activeFiles.length}\n`;
    report += `Total Size: ${(totalSize / 1024).toFixed(2)} KB\n`;
    report += `Last Cleanup: ${this.registry.lastCleanup.toISOString()}\n\n`;

    if (activeFiles.length > 0) {
      report += `📄 Active Temp Files:\n`;
      activeFiles.forEach(file => {
        report += `   • ${file.id}: ${file.purpose} (${file.crewMember}) - ${(file.size / 1024).toFixed(2)} KB\n`;
      });
    } else {
      report += `✅ No active temp files - system clean!\n`;
    }

    return report;
  }

  /**
   * Get registry summary
   */
  getRegistrySummary(): TempFileRegistry {
    return {
      ...this.registry,
      files: new Map(this.registry.files)
    };
  }

  /**
   * Check if file system is clean
   */
  isFileSystemClean(): boolean {
    return this.getActiveTempFiles().length === 0;
  }

  /**
   * Get natural language summary
   */
  getNaturalLanguageSummary(): string {
    const activeFiles = this.getActiveTempFiles();
    const crewActivity = new Map<string, number>();
    
    activeFiles.forEach(file => {
      const count = crewActivity.get(file.crewMember) || 0;
      crewActivity.set(file.crewMember, count + 1);
    });

    let summary = `Alex AI has created ${this.registry.totalCreated} temporary files during this session. `;
    
    if (activeFiles.length === 0) {
      summary += `All files have been cleaned up successfully. The file system is clean.`;
    } else {
      summary += `${activeFiles.length} files remain active and need cleanup. `;
      
      if (crewActivity.size > 0) {
        summary += `Crew member activity: `;
        const activities = Array.from(crewActivity.entries())
          .map(([crew, count]) => `${crew} (${count} files)`)
          .join(', ');
        summary += activities + '.';
      }
    }

    return summary;
  }
}
