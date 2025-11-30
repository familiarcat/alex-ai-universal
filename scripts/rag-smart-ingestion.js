#!/usr/bin/env node
/**
 * 🖖 RAG Smart Ingestion System
 * 
 * Intelligent knowledge ingestion that prevents bloat by:
 * 1. Checking for redundancy before storing
 * 2. Only storing truly new/valuable knowledge
 * 3. Adding proper context and metadata
 * 4. Cost-aware: cheap checks, expensive only for hard problems
 * 
 * Crew Coordination:
 * - Data: Semantic similarity analysis
 * - Quark: Cost-benefit analysis
 * - Riker: Decision coordination
 * - Dr. Crusher: Knowledge health monitoring
 * 
 * Usage:
 *   node scripts/rag-smart-ingestion.js --title "Title" --content "Content" [--crew=data] [--force]
 */

const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('./utils/secure-credential-loader');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

class SmartRAGIngestion {
  constructor() {
    this.supabase = null;
    this.optimizer = null;
    this.similarityThreshold = 0.85; // High threshold to avoid false positives
    this.costThreshold = 0.01; // $0.01 for expensive operations
  }

  async initialize() {
    const creds = loadSupabaseCredentials();
    if (!creds.url || !creds.serviceKey) {
      throw new Error('Supabase credentials not found');
    }
    this.supabase = createClient(creds.url, creds.serviceKey);
    
    this.optimizer = getMCPOpenRouterOptimizer();
    this.optimizer.initialize();
  }

  /**
   * Quick redundancy check (cheap - no LLM calls)
   */
  async quickRedundancyCheck(title, content) {
    // Check for exact title match
    const { data: titleMatches } = await this.supabase
      .from('knowledge_base')
      .select('id, title, content, created_at')
      .ilike('title', title)
      .limit(5);
    
    if (titleMatches && titleMatches.length > 0) {
      // Check content similarity (simple Jaccard)
      for (const match of titleMatches) {
        const similarity = this.jaccardSimilarity(
          content.toLowerCase().substring(0, 500),
          (this.getContent(match) || '').toLowerCase().substring(0, 500)
        );
        
        if (similarity > 0.9) {
          return {
            redundant: true,
            reason: 'exact_duplicate',
            existing: match,
            similarity,
            cost: 0 // Free check
          };
        }
      }
    }
    
    return { redundant: false, cost: 0 };
  }

  /**
   * Semantic similarity check (moderate cost - uses embeddings if available)
   */
  async semanticRedundancyCheck(title, content, maxCost = 0.001) {
    // First, try to use existing embeddings for similarity
    const { data: recentMemories } = await this.supabase
      .from('knowledge_base')
      .select('id, title, content, embedding, created_at')
      .order('created_at', { ascending: false })
      .limit(20); // Check recent 20 memories
    
    if (!recentMemories || recentMemories.length === 0) {
      return { redundant: false, cost: 0 };
    }
    
    // Simple content-based similarity (no embedding generation)
    let highestSimilarity = 0;
    let mostSimilar = null;
    
    for (const memory of recentMemories) {
      const similarity = this.calculateContentSimilarity(content, memory);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        mostSimilar = memory;
      }
    }
    
    if (highestSimilarity > this.similarityThreshold) {
      return {
        redundant: true,
        reason: 'high_semantic_overlap',
        existing: mostSimilar,
        similarity: highestSimilarity,
        cost: 0 // Free - used existing data
      };
    }
    
    return { redundant: false, cost: 0 };
  }

  /**
   * Crew evaluation for hard problems (expensive - uses LLM)
   * Only called when quick checks pass but we need crew judgment
   */
  async crewEvaluation(title, content, context = {}) {
    const isHardProblem = context.isHardProblem || false;
    const crewWorkingTogether = context.crewWorkingTogether || false;
    
    // Only use expensive LLM evaluation for hard problems with crew coordination
    if (!isHardProblem || !crewWorkingTogether) {
      return {
        shouldStore: true,
        reason: 'standard_ingestion',
        cost: 0,
        crewRecommendation: null
      };
    }
    
    console.log('🤖 Crew evaluating knowledge for hard problem...\n');
    
    // Data: Technical value assessment
    const dataPrompt = `You are Commander Data. Evaluate this knowledge for technical value:

Title: ${title}
Content: ${content.substring(0, 1000)}...

Assess:
1. Is this truly new knowledge or redundant?
2. What technical value does it add?
3. Should it be stored?

Respond with: STORE or SKIP, then brief reasoning.`;

    const dataAnalysis = await this.optimizer.optimizeAndCall(dataPrompt, {
      crewMember: 'data',
      complexity: 'medium',
      taskType: 'quick_analysis',
      temperature: 0.7,
      maxTokens: 200
    });

    // Quark: Cost-benefit analysis
    const quarkPrompt = `You are Quark. Evaluate cost-benefit of storing this knowledge:

Title: ${title}
Content: ${content.substring(0, 500)}...

Assess:
1. Storage cost vs value
2. Will this prevent future redundant storage?
3. ROI of storing this knowledge

Respond with: STORE or SKIP, then brief reasoning.`;

    const quarkAnalysis = await this.optimizer.optimizeAndCall(quarkPrompt, {
      crewMember: 'quark',
      complexity: 'low',
      taskType: 'business_analysis',
      temperature: 0.7,
      maxTokens: 200
    });

    // Parse responses
    const dataDecision = this.parseCrewDecision(dataAnalysis);
    const quarkDecision = this.parseCrewDecision(quarkAnalysis);
    
    const shouldStore = dataDecision === 'STORE' && quarkDecision === 'STORE';
    const cost = 0.0004 + 0.0004; // ~$0.0008 for both crew members
    
    return {
      shouldStore,
      reason: shouldStore ? 'crew_approved' : 'crew_rejected',
      cost,
      crewRecommendation: {
        data: dataDecision,
        quark: quarkDecision
      }
    };
  }

  /**
   * Parse crew decision from LLM response
   */
  parseCrewDecision(response) {
    const text = response.choices?.[0]?.message?.content || response.body || response || '';
    const upper = text.toUpperCase();
    if (upper.includes('STORE')) return 'STORE';
    if (upper.includes('SKIP')) return 'SKIP';
    return 'STORE'; // Default to store if unclear
  }

  /**
   * Calculate content similarity
   */
  calculateContentSimilarity(content1, memory) {
    const content2 = this.getContent(memory);
    const title1 = content1.substring(0, 100).toLowerCase();
    const title2 = (memory.title || '').toLowerCase();
    
    // Title similarity
    const titleSim = this.jaccardSimilarity(title1, title2);
    
    // Content similarity
    const contentSim = this.jaccardSimilarity(
      content1.toLowerCase().substring(0, 500),
      content2.toLowerCase().substring(0, 500)
    );
    
    return (titleSim * 0.4) + (contentSim * 0.6);
  }

  /**
   * Jaccard similarity
   */
  jaccardSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
    
    if (words1.size === 0 && words2.size === 0) return 1.0;
    if (words1.size === 0 || words2.size === 0) return 0.0;
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Get content from memory record
   */
  getContent(record) {
    if (typeof record.content === 'string') {
      return record.content;
    } else if (typeof record.content === 'object') {
      return JSON.stringify(record.content);
    } else if (record.detailed_analysis) {
      return record.detailed_analysis;
    } else if (record.summary) {
      return record.summary;
    }
    return '';
  }

  /**
   * Add context to knowledge before storing
   */
  async addContext(title, content, metadata = {}) {
    const context = {
      ingestionDate: new Date().toISOString(),
      crewMember: metadata.crewMember || null,
      category: metadata.category || 'knowledge',
      tags: metadata.tags || [],
      source: metadata.source || 'manual',
      problemComplexity: metadata.isHardProblem ? 'high' : 'standard',
      crewCoordination: metadata.crewWorkingTogether || false,
      ...metadata
    };
    
    // If crew member provided, add their perspective
    if (metadata.crewMember) {
      const crewContext = this.getCrewContext(metadata.crewMember);
      context.crewPerspective = crewContext;
    }
    
    return context;
  }

  /**
   * Get crew member context
   */
  getCrewContext(crewMember) {
    const contexts = {
      data: 'Technical analysis and logical reasoning',
      quark: 'Cost optimization and business value',
      riker: 'Tactical coordination and operations',
      picard: 'Strategic leadership and vision',
      crusher: 'System health and diagnostics',
      la_forge: 'Infrastructure and engineering',
      worf: 'Security and threat assessment',
      troi: 'User experience and psychology',
      uhura: 'Communication and networking',
      obrien: 'Pragmatic solutions and quick fixes'
    };
    
    return contexts[crewMember] || 'General knowledge';
  }

  /**
   * Store knowledge with proper context
   */
  async storeKnowledge(title, content, metadata = {}) {
    const context = await this.addContext(title, content, metadata);
    
    // Match knowledge_base schema (no metadata column, use JSONB fields)
    const payload = {
      session_id: `smart-ingestion-${Date.now()}`,
      title: title,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      category: context.category,
      tags: Array.isArray(context.tags) ? context.tags : [],
      executive_summary: context.crewPerspective || null,
      // Store context in content as JSONB if content is object
      ...(typeof content === 'object' ? { content: JSON.stringify(content) } : {})
    };
    
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .insert([payload])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      id: data.id,
      context: context
    };
  }

  /**
   * Main ingestion flow
   */
  async ingest(title, content, options = {}) {
    const {
      crewMember = null,
      category = 'knowledge',
      tags = [],
      force = false,
      isHardProblem = false,
      crewWorkingTogether = false,
      source = 'manual'
    } = options;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖖 SMART RAG INGESTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Title: ${title}`);
    console.log(`Content: ${content.substring(0, 100)}...\n`);
    
    let totalCost = 0;
    
    // Step 1: Quick redundancy check (free)
    console.log('🔍 Step 1: Quick redundancy check (free)...');
    const quickCheck = await this.quickRedundancyCheck(title, content);
    totalCost += quickCheck.cost;
    
    if (quickCheck.redundant && !force) {
      console.log(`   ⚠️  Redundant: ${quickCheck.reason}`);
      console.log(`   📋 Existing: ${quickCheck.existing.title} (similarity: ${(quickCheck.similarity * 100).toFixed(1)}%)\n`);
      return {
        stored: false,
        reason: quickCheck.reason,
        existing: quickCheck.existing,
        cost: totalCost
      };
    }
    console.log('   ✅ Not an exact duplicate\n');
    
    // Step 2: Semantic redundancy check (free - uses existing data)
    console.log('🔍 Step 2: Semantic similarity check (free)...');
    const semanticCheck = await this.semanticRedundancyCheck(title, content);
    totalCost += semanticCheck.cost;
    
    if (semanticCheck.redundant && !force) {
      console.log(`   ⚠️  High semantic overlap: ${(semanticCheck.similarity * 100).toFixed(1)}%`);
      console.log(`   📋 Similar to: ${semanticCheck.existing.title}\n`);
      return {
        stored: false,
        reason: semanticCheck.reason,
        existing: semanticCheck.existing,
        cost: totalCost
      };
    }
    console.log('   ✅ No high semantic overlap\n');
    
    // Step 3: Crew evaluation (only for hard problems with crew coordination)
    let crewEval = null;
    if (isHardProblem && crewWorkingTogether) {
      console.log('🤖 Step 3: Crew evaluation (cost: ~$0.0008)...');
      crewEval = await this.crewEvaluation(title, content, {
        isHardProblem,
        crewWorkingTogether
      });
      totalCost += crewEval.cost;
      
      if (!crewEval.shouldStore && !force) {
        console.log(`   ⚠️  Crew recommendation: ${crewEval.reason}`);
        console.log(`   📋 Data: ${crewEval.crewRecommendation?.data}`);
        console.log(`   📋 Quark: ${crewEval.crewRecommendation?.quark}\n`);
        return {
          stored: false,
          reason: crewEval.reason,
          crewRecommendation: crewEval.crewRecommendation,
          cost: totalCost
        };
      }
      console.log('   ✅ Crew approved storage\n');
    } else {
      console.log('   ℹ️  Standard ingestion (no crew evaluation needed)\n');
    }
    
    // Step 4: Store with context
    console.log('💾 Step 4: Storing with context...');
    const result = await this.storeKnowledge(title, content, {
      crewMember,
      category,
      tags,
      isHardProblem,
      crewWorkingTogether,
      source
    });
    
    console.log(`   ✅ Stored successfully (ID: ${result.id})`);
    console.log(`   📋 Category: ${result.context.category}`);
    console.log(`   🏷️  Tags: ${result.context.tags.join(', ') || 'none'}`);
    console.log(`   💰 Total cost: $${totalCost.toFixed(6)}\n`);
    
    return {
      stored: true,
      id: result.id,
      context: result.context,
      cost: totalCost
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let title = null;
  let content = null;
  let crewMember = null;
  let category = 'knowledge';
  let tags = [];
  let force = false;
  let isHardProblem = false;
  let crewWorkingTogether = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      title = args[i + 1];
      i++;
    } else if (args[i] === '--content' && args[i + 1]) {
      content = args[i + 1];
      i++;
    } else if (args[i] === '--crew' && args[i + 1]) {
      crewMember = args[i + 1];
      i++;
    } else if (args[i] === '--category' && args[i + 1]) {
      category = args[i + 1];
      i++;
    } else if (args[i] === '--tags' && args[i + 1]) {
      tags = args[i + 1].split(',');
      i++;
    } else if (args[i] === '--force') {
      force = true;
    } else if (args[i] === '--hard-problem') {
      isHardProblem = true;
    } else if (args[i] === '--crew-together') {
      crewWorkingTogether = true;
    }
  }
  
  if (!title || !content) {
    console.error('Usage: node scripts/rag-smart-ingestion.js --title "Title" --content "Content" [options]');
    console.error('Options:');
    console.error('  --crew <member>        Crew member (data, quark, riker, etc.)');
    console.error('  --category <cat>       Category (default: knowledge)');
    console.error('  --tags <tag1,tag2>     Comma-separated tags');
    console.error('  --force                Force storage even if redundant');
    console.error('  --hard-problem         Mark as hard problem (enables crew evaluation)');
    console.error('  --crew-together        Crew working together (enables crew evaluation)');
    process.exit(1);
  }
  
  const ingestion = new SmartRAGIngestion();
  await ingestion.initialize();
  
  const result = await ingestion.ingest(title, content, {
    crewMember,
    category,
    tags,
    force,
    isHardProblem,
    crewWorkingTogether
  });
  
  if (result.stored) {
    console.log('✅ Knowledge ingested successfully!\n');
  } else {
    console.log(`⚠️  Knowledge not stored: ${result.reason}\n`);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = { SmartRAGIngestion };

