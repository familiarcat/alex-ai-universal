#!/usr/bin/env node

/**
 * 🖖 RAG Vector Optimization System
 * 
 * Optimizes Supabase vector storage by:
 * 1. Processing milestone content for vector embeddings
 * 2. Associating crew memories with milestone vectors
 * 3. Creating efficient RAG structure for crew access
 * 4. Generating optimized vector records
 * 
 * E2E Flow:
 * Next.js → Controller (n8n/MCP) → Supabase Vector Storage
 */

const fs = require('fs');
const path = require('path');
const { integrateCrewMemoriesWithMilestones } = require('./crew-memory-milestone-integration');

// RAG Vector Record Structure
function createVectorRecord(milestone, crewAssociations, category) {
  // Extract semantic content for embedding
  const semanticContent = extractSemanticContent(milestone);
  
  // Create optimized vector record
  const vectorRecord = {
    // Core identification
    id: generateVectorId(milestone.fileName),
    type: 'milestone',
    category: category,
    
    // Content for embedding
    title: milestone.title,
    content: semanticContent.text,
    summary: semanticContent.summary,
    
    // Metadata
    timestamp: milestone.timestamp || new Date().toISOString(),
    fileName: milestone.fileName,
    filePath: milestone.filePath,
    
    // Crew associations
    crewAssociations: crewAssociations.map(assoc => ({
      crewMember: assoc.crewMember,
      relevance: assoc.relevance,
      score: assoc.score,
      memoryCount: assoc.memoryCount
    })),
    
    // Tags for filtering
    tags: [
      category,
      'milestone',
      ...semanticContent.keywords.slice(0, 10),
      ...crewAssociations.map(a => `crew-${a.crewMember.id}`)
    ],
    
    // RAG optimization metadata
    embedding_ready: true,
    chunk_size: semanticContent.text.length,
    priority: calculatePriority(crewAssociations, semanticContent),
    
    // Access optimization
    access_pattern: {
      primary_crew: crewAssociations
        .filter(a => a.relevance === 'high')
        .map(a => a.crewMember.id),
      secondary_crew: crewAssociations
        .filter(a => a.relevance === 'medium')
        .map(a => a.crewMember.id)
    },
    
    // Timestamp for vector storage
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return vectorRecord;
}

function extractSemanticContent(milestone) {
  const content = milestone.content || '';
  const title = milestone.title || '';
  
  // Extract summary (first paragraph or section)
  let summary = '';
  const summaryMatch = content.match(/##\s*(?:Summary|Overview)[\s\S]*?(?=##|$)/i);
  if (summaryMatch) {
    summary = summaryMatch[0].replace(/^##.*\n/, '').trim().substring(0, 500);
  } else {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
    if (paragraphs.length > 0) {
      summary = paragraphs[0].trim().substring(0, 500);
    }
  }
  
  // Extract keywords
  const fullText = (title + ' ' + content).toLowerCase();
  const keywords = extractKeywords(fullText);
  
  // Create semantic text for embedding
  const semanticText = `${title}. ${summary}. ` +
    `Keywords: ${keywords.slice(0, 10).join(', ')}. ` +
    `Category: ${milestone.category}.`;
  
  return {
    text: semanticText,
    summary,
    keywords
  };
}

function extractKeywords(text) {
  const words = text.toLowerCase().split(/\W+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
  const wordCount = new Map();
  
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function generateVectorId(fileName) {
  // Generate deterministic ID from filename
  const hash = require('crypto').createHash('md5').update(fileName).digest('hex');
  return `milestone-${hash.substring(0, 12)}`;
}

function calculatePriority(crewAssociations, semanticContent) {
  let priority = 'medium';
  
  // High priority if high relevance crew associations
  const highRelevanceCount = crewAssociations.filter(a => a.relevance === 'high').length;
  if (highRelevanceCount >= 2) {
    priority = 'high';
  } else if (highRelevanceCount === 1 && crewAssociations.length >= 3) {
    priority = 'high';
  } else if (crewAssociations.length === 0) {
    priority = 'low';
  }
  
  // Boost priority for recent milestones
  // (would need timestamp comparison in real implementation)
  
  return priority;
}

async function optimizeRAGVectors() {
  console.log('🖖 RAG Vector Optimization System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // First, integrate crew memories with milestones
  console.log('📊 Step 1: Integrating crew memories with milestones...\n');
  const integrationReport = await integrateCrewMemoriesWithMilestones();
  
  // Load milestones
  const rootDir = process.cwd();
  const milestonesOrganizedDir = path.join(rootDir, 'milestones-organized');
  
  function loadMilestones() {
    const milestones = [];
    
    function scanDirectory(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && entry.name !== '.git') {
          scanDirectory(fullPath);
        } else if ((entry.isFile() || entry.isSymbolicLink) && 
                   entry.name.endsWith('.md') && entry.name !== 'README.md') {
          try {
            const realPath = fs.realpathSync(fullPath);
            const content = fs.readFileSync(realPath, 'utf-8');
            
            const pathParts = fullPath.split(path.sep);
            const categoryIndex = pathParts.indexOf('milestones-organized');
            const category = categoryIndex >= 0 && pathParts[categoryIndex + 1] 
              ? pathParts[categoryIndex + 1] 
              : 'unknown';
            
            const timestampMatch = content.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
            const timestamp = timestampMatch ? timestampMatch[0].replace(/\//g, '-') : null;
            
            milestones.push({
              fileName: entry.name,
              filePath: fullPath,
              category,
              timestamp,
              content,
              title: content.split('\n')[0].replace(/^#+\s*/, '').trim()
            });
          } catch (error) {
            // Skip
          }
        }
      });
    }
    
    scanDirectory(milestonesOrganizedDir);
    return milestones;
  }
  
  console.log('\n🔍 Step 2: Creating optimized vector records...\n');
  const milestones = loadMilestones();
  const vectorRecords = [];
  
  milestones.forEach(milestone => {
    // Find crew associations from integration report
    const crewAssociations = [];
    
    integrationReport.crewSummaries.forEach(crewSummary => {
      const relevant = crewSummary.relevantMilestones.find(
        rm => rm.milestone === milestone.title
      );
      
      if (relevant) {
        crewAssociations.push({
          crewMember: {
            id: crewSummary.crewMemberId,
            name: crewSummary.crewMember
          },
          relevance: relevant.relevance,
          score: relevant.score,
          memoryCount: relevant.memoryCount
        });
      }
    });
    
    // Create vector record
    const vectorRecord = createVectorRecord(milestone, crewAssociations, milestone.category);
    vectorRecords.push(vectorRecord);
  });
  
  console.log(`✅ Created ${vectorRecords.length} optimized vector records\n`);
  
  // Generate Supabase-ready payload
  console.log('📦 Step 3: Generating Supabase-ready payload...\n');
  
  const supabasePayload = {
    timestamp: new Date().toISOString(),
    total_records: vectorRecords.length,
    records: vectorRecords.map(record => ({
      // Supabase table structure
      memory_id: record.id,
      title: record.title,
      description: record.summary,
      category: record.category,
      content: record.content,
      tags: record.tags,
      crew_member: record.crewAssociations.length > 0 
        ? record.crewAssociations[0].crewMember.id 
        : null,
      priority: record.priority,
      metadata: {
        fileName: record.fileName,
        timestamp: record.timestamp,
        crewAssociations: record.crewAssociations,
        accessPattern: record.access_pattern
      },
      embedding_ready: true,
      created_at: record.created_at,
      updated_at: record.updated_at
    }))
  };
  
  // Save payload
  const reportDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const payloadPath = path.join(reportDir, 'rag-vector-optimization-payload.json');
  fs.writeFileSync(payloadPath, JSON.stringify(supabasePayload, null, 2));
  
  console.log(`✅ Supabase payload saved to: ${payloadPath}\n`);
  
  // Generate summary
  const summary = {
    totalVectorRecords: vectorRecords.length,
    byCategory: {},
    byPriority: { high: 0, medium: 0, low: 0 },
    crewCoverage: {}
  };
  
  vectorRecords.forEach(record => {
    // By category
    if (!summary.byCategory[record.category]) {
      summary.byCategory[record.category] = 0;
    }
    summary.byCategory[record.category]++;
    
    // By priority
    summary.byPriority[record.priority]++;
    
    // Crew coverage
    record.crewAssociations.forEach(assoc => {
      if (!summary.crewCoverage[assoc.crewMember.id]) {
        summary.crewCoverage[assoc.crewMember.id] = 0;
      }
      summary.crewCoverage[assoc.crewMember.id]++;
    });
  });
  
  console.log('📊 Optimization Summary:\n');
  console.log(`   Total Records: ${summary.totalVectorRecords}`);
  console.log(`   High Priority: ${summary.byPriority.high}`);
  console.log(`   Medium Priority: ${summary.byPriority.medium}`);
  console.log(`   Low Priority: ${summary.byPriority.low}`);
  console.log(`   Crew Coverage: ${Object.keys(summary.crewCoverage).length} crew members\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ RAG vector optimization complete!\n');
  console.log('   Next: Send payload to Supabase via n8n/MCP controller layer\n');
  
  return { vectorRecords, supabasePayload, summary };
}

if (require.main === module) {
  optimizeRAGVectors().catch(console.error);
}

module.exports = { optimizeRAGVectors, createVectorRecord };

