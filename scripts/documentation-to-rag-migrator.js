#!/usr/bin/env node

/**
 * Documentation to RAG Migration System
 * Migrates verbose .md documentation to Supabase vector RAG system
 * Enhances crew members' ability to find best answers
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

class DocumentationToRAGMigrator {
  constructor() {
    this.supabase = null;
    this.projectRoot = process.cwd();
    this.documentationDir = path.join(this.projectRoot, 'docs');
    this.milestonesDir = path.join(this.projectRoot);
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🖖 Initializing Documentation to RAG Migration System...');
      
      // Load environment variables
      require('dotenv').config({ path: path.join(this.projectRoot, '.env.local') });
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase credentials not found in environment variables');
        console.log('💡 Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set');
        return false;
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test connection
      const { data, error } = await this.supabase.from('documents').select('count').limit(1);
      if (error) {
        console.error('❌ Failed to connect to Supabase:', error.message);
        return false;
      }

      console.log('✅ Connected to Supabase successfully');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async findDocumentationFiles() {
    const files = [];
    
    // Find milestone files
    const milestoneFiles = fs.readdirSync(this.projectRoot)
      .filter(file => file.startsWith('MILESTONE_') && file.endsWith('.md'))
      .map(file => ({
        path: path.join(this.projectRoot, file),
        type: 'milestone',
        category: 'milestones',
        priority: 'high'
      }));

    // Find other documentation files
    const docFiles = fs.readdirSync(this.projectRoot)
      .filter(file => file.endsWith('.md') && !file.startsWith('MILESTONE_'))
      .map(file => ({
        path: path.join(this.projectRoot, file),
        type: 'documentation',
        category: 'general',
        priority: 'medium'
      }));

    // Find files in docs directory if it exists
    let docsFiles = [];
    if (fs.existsSync(this.documentationDir)) {
      docsFiles = this.getAllMarkdownFiles(this.documentationDir)
        .map(file => ({
          path: file,
          type: 'documentation',
          category: 'docs',
          priority: 'medium'
        }));
    }

    files.push(...milestoneFiles, ...docFiles, ...docsFiles);
    
    console.log(`📚 Found ${files.length} documentation files to migrate:`);
    files.forEach(file => {
      console.log(`  📄 ${path.basename(file.path)} (${file.type}/${file.category})`);
    });

    return files;
  }

  getAllMarkdownFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getAllMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async processDocumentationFile(fileInfo) {
    try {
      console.log(`📄 Processing: ${path.basename(fileInfo.path)}`);
      
      const content = fs.readFileSync(fileInfo.path, 'utf8');
      const filename = path.basename(fileInfo.path);
      
      // Extract key information from content
      const metadata = this.extractMetadata(content, filename, fileInfo);
      
      // Create document record
      const { data: document, error: docError } = await this.supabase
        .from('documents')
        .insert({
          filename: filename,
          file_type: 'markdown',
          file_size: content.length,
          content: content,
          metadata: metadata
        })
        .select()
        .single();

      if (docError) {
        console.error(`❌ Failed to create document record:`, docError.message);
        return null;
      }

      console.log(`✅ Document created with ID: ${document.id}`);

      // Split content into chunks and create embeddings
      const chunks = this.splitIntoChunks(content, 1000); // 1000 chars per chunk
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Generate embedding (in real implementation, this would call OpenAI API)
        const embedding = await this.generateEmbedding(chunk.content);
        
        const { error: chunkError } = await this.supabase
          .from('document_chunks')
          .insert({
            document_id: document.id,
            content: chunk.content,
            metadata: {
              ...chunk.metadata,
              chunk_index: i,
              total_chunks: chunks.length,
              crew_relevance: this.analyzeCrewRelevance(chunk.content),
              keywords: this.extractKeywords(chunk.content)
            },
            embedding: embedding
          });

        if (chunkError) {
          console.error(`❌ Failed to create chunk ${i}:`, chunkError.message);
        } else {
          console.log(`  ✅ Chunk ${i + 1}/${chunks.length} processed`);
        }
      }

      return document;
    } catch (error) {
      console.error(`❌ Error processing ${fileInfo.path}:`, error.message);
      return null;
    }
  }

  extractMetadata(content, filename, fileInfo) {
    const metadata = {
      file_type: fileInfo.type,
      category: fileInfo.category,
      priority: fileInfo.priority,
      filename: filename,
      created_at: new Date().toISOString(),
      crew_relevant: false,
      tags: [],
      summary: ''
    };

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }

    // Extract summary from first paragraph
    const summaryMatch = content.match(/^(.+)$/m);
    if (summaryMatch) {
      metadata.summary = summaryMatch[1].substring(0, 200) + '...';
    }

    // Check for crew member mentions
    const crewMembers = [
      'Captain Picard', 'Commander Data', 'Commander Riker', 'Lieutenant Geordi',
      'Lieutenant Worf', 'Counselor Troi', 'Dr. Crusher', 'Lieutenant Uhura', 'Quark'
    ];
    
    crewMembers.forEach(member => {
      if (content.includes(member)) {
        metadata.crew_relevant = true;
        metadata.tags.push(member.toLowerCase().replace(/\s+/g, '_'));
      }
    });

    // Extract milestone information
    if (fileInfo.type === 'milestone') {
      const milestoneMatch = filename.match(/MILESTONE_(.+)\.md/);
      if (milestoneMatch) {
        metadata.milestone_id = milestoneMatch[1];
        metadata.tags.push('milestone');
      }
    }

    // Extract status information
    if (content.includes('✅ COMPLETE') || content.includes('Status: ✅ COMPLETE')) {
      metadata.status = 'complete';
      metadata.tags.push('complete');
    } else if (content.includes('🚧 IN PROGRESS') || content.includes('Status: IN PROGRESS')) {
      metadata.status = 'in_progress';
      metadata.tags.push('in_progress');
    }

    return metadata;
  }

  splitIntoChunks(content, chunkSize) {
    const chunks = [];
    const lines = content.split('\n');
    let currentChunk = '';
    let currentMetadata = {};

    for (const line of lines) {
      // Check for section headers
      if (line.startsWith('#')) {
        if (currentChunk.length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: { ...currentMetadata }
          });
          currentChunk = '';
        }
        currentMetadata.section = line.replace(/^#+\s*/, '');
      }

      currentChunk += line + '\n';

      if (currentChunk.length >= chunkSize) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { ...currentMetadata }
        });
        currentChunk = '';
        currentMetadata = {};
      }
    }

    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { ...currentMetadata }
      });
    }

    return chunks;
  }

  async generateEmbedding(content) {
    // In a real implementation, this would call OpenAI's embedding API
    // For now, we'll create a mock embedding
    const mockEmbedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
    return `[${mockEmbedding.join(',')}]`;
  }

  analyzeCrewRelevance(content) {
    const crewKeywords = {
      'captain_picard': ['strategic', 'leadership', 'command', 'decision', 'mission'],
      'commander_data': ['data', 'analysis', 'logic', 'processing', 'analytics'],
      'commander_riker': ['operations', 'tactical', 'execution', 'workflow'],
      'lieutenant_geordi': ['engineering', 'technical', 'infrastructure', 'system'],
      'lieutenant_worf': ['security', 'threat', 'compliance', 'vulnerability'],
      'counselor_troi': ['user experience', 'communication', 'team dynamics'],
      'dr_crusher': ['performance', 'health', 'diagnostics', 'optimization'],
      'lieutenant_uhura': ['communication', 'integration', 'synchronization'],
      'quark': ['business', 'cost', 'efficiency', 'metrics', 'optimization']
    };

    const relevance = {};
    const lowerContent = content.toLowerCase();

    for (const [crew, keywords] of Object.entries(crewKeywords)) {
      relevance[crew] = keywords.filter(keyword => lowerContent.includes(keyword)).length;
    }

    return relevance;
  }

  extractKeywords(content) {
    // Simple keyword extraction - in real implementation, use NLP libraries
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'may', 'say', 'its', 'now', 'find', 'long', 'down', 'own', 'think', 'back', 'much', 'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'tell', 'does', 'set', 'three', 'small', 'home', 'read', 'hand', 'port', 'large', 'spell', 'add', 'even', 'land', 'here', 'must', 'big', 'high', 'such', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'us', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self', 'earth', 'father'].includes(word));

    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  async migrateAllDocumentation() {
    if (!this.initialized) {
      console.error('❌ System not initialized. Run initialize() first.');
      return false;
    }

    console.log('🚀 Starting documentation migration to RAG system...');
    
    const files = await this.findDocumentationFiles();
    let successCount = 0;
    let failureCount = 0;

    for (const fileInfo of files) {
      const result = await this.processDocumentationFile(fileInfo);
      if (result) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${successCount} files`);
    console.log(`❌ Failed to migrate: ${failureCount} files`);
    
    return successCount > 0;
  }

  async createCrewQueryInterface() {
    console.log('🖖 Creating crew query interface...');
    
    // Create a simple query interface for crew members
    const queryInterface = `
// Crew Documentation Query Interface
export class CrewDocumentationQuery {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async queryForCrewMember(crewMember, query, limit = 5) {
    const { data, error } = await this.supabase.rpc('match_document_chunks', {
      query_embedding: await this.generateEmbedding(query),
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) {
      throw new Error(\`Query failed: \${error.message}\`);
    }

    // Filter results by crew relevance
    return data.filter(chunk => 
      chunk.metadata.crew_relevance && 
      chunk.metadata.crew_relevance[crewMember.toLowerCase()] > 0
    );
  }

  async getMilestoneInformation(milestoneId) {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('metadata->>milestone_id', milestoneId)
      .single();

    return data;
  }

  async getCrewRelevantDocuments(crewMember, limit = 10) {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('metadata->>crew_relevant', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data;
  }
}`;

    const interfacePath = path.join(this.projectRoot, 'src/lib/crew-documentation-query.ts');
    fs.writeFileSync(interfacePath, queryInterface);
    console.log('✅ Crew query interface created');
  }
}

// Run if called directly
if (require.main === module) {
  const migrator = new DocumentationToRAGMigrator();
  
  migrator.initialize().then(async (initialized) => {
    if (initialized) {
      const success = await migrator.migrateAllDocumentation();
      if (success) {
        await migrator.createCrewQueryInterface();
        console.log('🎉 Documentation migration and crew interface setup complete!');
      }
    }
  });
}

module.exports = DocumentationToRAGMigrator;


