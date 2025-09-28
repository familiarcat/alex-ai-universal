/**
 * Documentation to RAG Converter
 * 
 * Converts Alex AI summary .md files into referential vectors stored in N8N ↔ Supabase data flow
 * Prevents documentation files from cluttering project file systems
 * Maintains all documentation as searchable RAG memory vectors
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { SupabaseRAGPropagation } from '../rag/supabase-rag-propagation';

export interface DocumentationMetadata {
  title: string;
  summary: string;
  tags: string[];
  crewMembers: string[];
  sessionId: string;
  projectType: string;
  timestamp: string;
  filePath: string;
  contentHash: string;
  vectorEmbedding?: number[];
}

export interface DocumentationChunk {
  id: string;
  content: string;
  metadata: DocumentationMetadata;
  chunkIndex: number;
  totalChunks: number;
  parentDocumentId: string;
}

export class DocumentationToRAGConverter {
  private ragPropagation: SupabaseRAGPropagation;
  private sessionId: string;
  private projectRoot: string;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    sessionId: string,
    projectRoot: string
  ) {
    this.ragPropagation = new SupabaseRAGPropagation(supabaseUrl, supabaseKey);
    this.sessionId = sessionId;
    this.projectRoot = projectRoot;
  }

  /**
   * Convert all Alex AI documentation files to RAG vectors
   */
  async convertDocumentationToRAG(): Promise<void> {
    console.log('📚 Converting Alex AI documentation to RAG vectors...');
    
    try {
      // Initialize RAG schema
      await this.ragPropagation.initializeSchema();
      
      // Find all Alex AI documentation files
      const documentationFiles = await this.findAlexAIDocumentationFiles();
      console.log(`   📄 Found ${documentationFiles.length} documentation files`);
      
      // Convert each file to RAG vectors
      for (const filePath of documentationFiles) {
        await this.convertFileToRAG(filePath);
      }
      
      // Clean up documentation files from project
      await this.cleanupDocumentationFiles(documentationFiles);
      
      console.log('✅ Documentation conversion to RAG complete');
      
    } catch (error) {
      console.error('❌ Documentation conversion failed:', error);
      throw error;
    }
  }

  /**
   * Find all Alex AI documentation files in project
   */
  private async findAlexAIDocumentationFiles(): Promise<string[]> {
    const documentationFiles: string[] = [];
    
    try {
      // Common Alex AI documentation patterns
      const patterns = [
        '**/ALEX_AI_*.md',
        '**/*ALEX_AI*.md',
        '**/MILESTONE_*.md',
        '**/CURSOR_AI_*.md',
        '**/N8N_*.md',
        '**/SUPABASE_*.md',
        '**/CREW_*.md',
        '**/REAL_*.md',
        '**/*_FIX.md',
        '**/*_SOLUTION.md',
        '**/*_DEMONSTRATION.md',
        '**/*_SUMMARY.md'
      ];
      
      // Search for files matching patterns
      for (const pattern of patterns) {
        const matches = await this.globSearch(pattern);
        documentationFiles.push(...matches);
      }
      
      // Remove duplicates
      return [...new Set(documentationFiles)];
      
    } catch (error) {
      console.error('Error finding documentation files:', error);
      return [];
    }
  }

  /**
   * Convert a single documentation file to RAG vectors
   */
  private async convertFileToRAG(filePath: string): Promise<void> {
    try {
      console.log(`   📄 Converting: ${path.basename(filePath)}`);
      
      // Read file content
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract metadata from file
      const metadata = this.extractDocumentationMetadata(filePath, content);
      
      // Split content into chunks for better vector storage
      const chunks = this.splitContentIntoChunks(content, metadata);
      
      // Store each chunk as RAG memory
      for (const chunk of chunks) {
        await this.storeChunkAsRAGMemory(chunk);
      }
      
      console.log(`   ✅ Converted ${chunks.length} chunks from ${path.basename(filePath)}`);
      
    } catch (error) {
      console.error(`   ❌ Failed to convert ${filePath}:`, error);
    }
  }

  /**
   * Extract metadata from documentation file
   */
  private extractDocumentationMetadata(filePath: string, content: string): DocumentationMetadata {
    const fileName = path.basename(filePath, '.md');
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // Extract title from content or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : fileName;
    
    // Extract summary from first paragraph
    const summaryMatch = content.match(/^#\s+.*?\n\n(.+?)(?:\n\n|$)/s);
    const summary = summaryMatch ? summaryMatch[1].substring(0, 200) : `${title} documentation`;
    
    // Extract tags from filename and content
    const tags = this.extractTags(fileName, content);
    
    // Determine crew members involved
    const crewMembers = this.extractCrewMembers(content);
    
    // Generate content hash for deduplication
    const contentHash = this.generateContentHash(content);
    
    return {
      title,
      summary,
      tags,
      crewMembers,
      sessionId: this.sessionId,
      projectType: this.detectProjectType(),
      timestamp: new Date().toISOString(),
      filePath: relativePath,
      contentHash
    };
  }

  /**
   * Extract tags from filename and content
   */
  private extractTags(fileName: string, content: string): string[] {
    const tags = new Set<string>();
    
    // Extract tags from filename
    const filenameTags = fileName.split(/[-_]/).filter(tag => 
      tag.length > 2 && 
      !tag.match(/^\d+$/) && // Not just numbers
      !tag.match(/^(ALEX|AI|CURSOR|N8N|SUPABASE|CREW|MILESTONE)$/i) // Not common prefixes
    );
    filenameTags.forEach(tag => tags.add(tag.toLowerCase()));
    
    // Extract tags from content
    const tagMatches = content.match(/#\w+/g);
    if (tagMatches) {
      tagMatches.forEach(tag => tags.add(tag.substring(1).toLowerCase()));
    }
    
    // Add common tags based on content analysis
    if (content.toLowerCase().includes('fix')) tags.add('fix');
    if (content.toLowerCase().includes('solution')) tags.add('solution');
    if (content.toLowerCase().includes('demonstration')) tags.add('demonstration');
    if (content.toLowerCase().includes('milestone')) tags.add('milestone');
    if (content.toLowerCase().includes('cursor')) tags.add('cursor-ai');
    if (content.toLowerCase().includes('n8n')) tags.add('n8n');
    if (content.toLowerCase().includes('supabase')) tags.add('supabase');
    if (content.toLowerCase().includes('crew')) tags.add('crew');
    if (content.toLowerCase().includes('rag')) tags.add('rag');
    if (content.toLowerCase().includes('zero-artifact')) tags.add('zero-artifact');
    
    return Array.from(tags);
  }

  /**
   * Extract crew members mentioned in content
   */
  private extractCrewMembers(content: string): string[] {
    const crewMembers = [
      'Captain Picard', 'Commander Data', 'Commander Riker',
      'Lieutenant Commander Geordi', 'Lieutenant Worf', 'Counselor Troi',
      'Dr. Crusher', 'Lieutenant Uhura', 'Quark'
    ];
    
    const mentionedCrew = crewMembers.filter(crew => 
      content.toLowerCase().includes(crew.toLowerCase())
    );
    
    // If no specific crew mentioned, add system
    return mentionedCrew.length > 0 ? mentionedCrew : ['system'];
  }

  /**
   * Split content into chunks for better vector storage
   */
  private splitContentIntoChunks(content: string, metadata: DocumentationMetadata): DocumentationChunk[] {
    const chunks: DocumentationChunk[] = [];
    const chunkSize = 1000; // Characters per chunk
    const overlap = 200; // Character overlap between chunks
    
    // Split content into chunks
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + chunkSize, content.length);
      let chunkContent = content.substring(startIndex, endIndex);
      
      // Try to break at paragraph boundaries
      if (endIndex < content.length) {
        const lastParagraphBreak = chunkContent.lastIndexOf('\n\n');
        if (lastParagraphBreak > chunkSize * 0.7) { // If we can break at a reasonable point
          chunkContent = chunkContent.substring(0, lastParagraphBreak);
        }
      }
      
      const chunk: DocumentationChunk = {
        id: `${metadata.contentHash}-chunk-${chunkIndex}`,
        content: chunkContent.trim(),
        metadata: { ...metadata },
        chunkIndex,
        totalChunks: Math.ceil(content.length / chunkSize),
        parentDocumentId: metadata.contentHash
      };
      
      chunks.push(chunk);
      
      // Move to next chunk with overlap
      startIndex = Math.max(startIndex + chunkContent.length - overlap, startIndex + chunkContent.length);
      chunkIndex++;
    }
    
    return chunks;
  }

  /**
   * Store chunk as RAG memory
   */
  private async storeChunkAsRAGMemory(chunk: DocumentationChunk): Promise<void> {
    try {
      // Create enhanced content for RAG storage
      const enhancedContent = this.createEnhancedContent(chunk);
      
      // Store in Supabase RAG
      await this.ragPropagation.storeMemory(
        enhancedContent,
        chunk.metadata.crewMembers.join(', '),
        this.sessionId,
        `Documentation: ${chunk.metadata.title}`,
        `Chunk ${chunk.chunkIndex + 1} of ${chunk.totalChunks}`,
        {
          type: 'documentation',
          chunkId: chunk.id,
          parentDocumentId: chunk.parentDocumentId,
          chunkIndex: chunk.chunkIndex,
          totalChunks: chunk.totalChunks,
          title: chunk.metadata.title,
          tags: chunk.metadata.tags,
          projectType: chunk.metadata.projectType,
          filePath: chunk.metadata.filePath,
          contentHash: chunk.metadata.contentHash,
          timestamp: chunk.metadata.timestamp
        }
      );
      
    } catch (error) {
      console.error(`Failed to store chunk ${chunk.id}:`, error);
    }
  }

  /**
   * Create enhanced content for RAG storage
   */
  private createEnhancedContent(chunk: DocumentationChunk): string {
    let enhancedContent = `# ${chunk.metadata.title}\n\n`;
    
    // Add metadata context
    enhancedContent += `**Documentation Type:** Alex AI Solution Documentation\n`;
    enhancedContent += `**Tags:** ${chunk.metadata.tags.join(', ')}\n`;
    enhancedContent += `**Crew Members:** ${chunk.metadata.crewMembers.join(', ')}\n`;
    enhancedContent += `**Project Type:** ${chunk.metadata.projectType}\n`;
    enhancedContent += `**Chunk:** ${chunk.chunkIndex + 1} of ${chunk.totalChunks}\n`;
    enhancedContent += `**Timestamp:** ${chunk.metadata.timestamp}\n\n`;
    
    // Add content
    enhancedContent += `## Content\n\n${chunk.content}`;
    
    return enhancedContent;
  }

  /**
   * Clean up documentation files from project
   */
  private async cleanupDocumentationFiles(filePaths: string[]): Promise<void> {
    console.log('🧹 Cleaning up documentation files from project...');
    
    for (const filePath of filePaths) {
      try {
        // Move to isolated storage instead of deleting
        const fileName = path.basename(filePath);
        const isolatedPath = path.join(this.projectRoot, '.alex-ai-artifacts', 'documentation', fileName);
        
        // Ensure isolated directory exists
        await fs.mkdir(path.dirname(isolatedPath), { recursive: true });
        
        // Move file to isolated storage
        await fs.rename(filePath, isolatedPath);
        
        console.log(`   📁 Moved ${fileName} to isolated storage`);
        
      } catch (error) {
        console.error(`   ❌ Failed to cleanup ${filePath}:`, error);
      }
    }
    
    console.log('✅ Documentation cleanup complete');
  }

  /**
   * Search for files using glob patterns
   */
  private async globSearch(pattern: string): Promise<string[]> {
    const matches: string[] = [];
    
    try {
      const files = await fs.readdir(this.projectRoot, { recursive: true });
      
      for (const file of files) {
        if (typeof file === 'string' && file.includes('.md')) {
          const filePath = path.join(this.projectRoot, file);
          const fileName = path.basename(file);
          
          // Check if file matches pattern
          if (this.matchesPattern(fileName, pattern)) {
            matches.push(filePath);
          }
        }
      }
      
    } catch (error) {
      // If recursive readdir fails, try simple readdir
      try {
        const files = await fs.readdir(this.projectRoot);
        
        for (const file of files) {
          if (file.includes('.md') && this.matchesPattern(file, pattern)) {
            matches.push(path.join(this.projectRoot, file));
          }
        }
        
      } catch (error2) {
        console.error('Glob search failed:', error2);
      }
    }
    
    return matches;
  }

  /**
   * Check if filename matches pattern
   */
  private matchesPattern(fileName: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(fileName);
  }

  /**
   * Generate content hash for deduplication
   */
  private generateContentHash(content: string): string {
    // Simple hash function for content deduplication
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Detect project type
   */
  private detectProjectType(): string {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (require('fs').existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        return packageJson.name || 'unknown';
      }
    } catch (error) {
      // Ignore errors
    }
    
    return 'unknown';
  }

  /**
   * Search documentation in RAG system
   */
  async searchDocumentation(query: string, limit: number = 10): Promise<any[]> {
    try {
      const results = await this.ragPropagation.searchMemories({
        query,
        limit,
        crewMember: null,
        sessionId: null,
        filters: {
          type: 'documentation'
        }
      });
      
      return results;
      
    } catch (error) {
      console.error('Documentation search failed:', error);
      return [];
    }
  }

  /**
   * Get documentation statistics
   */
  async getDocumentationStatistics(): Promise<any> {
    try {
      const stats = await this.ragPropagation.getMemoryStatistics();
      return {
        ...stats,
        documentationType: 'rag_vectors',
        storageLocation: 'supabase_rag_system',
        zeroArtifactCompliant: true
      };
      
    } catch (error) {
      console.error('Failed to get documentation statistics:', error);
      return null;
    }
  }
}

export { DocumentationToRAGConverter };
