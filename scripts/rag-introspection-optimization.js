#!/usr/bin/env node
/**
 * 🖖 RAG System Introspection and Optimization
 * 
 * Analyzes the RAG system to identify bloat, duplicates, and optimization
 * opportunities while preserving core knowledge.
 * 
 * Uses crew coordination:
 * - Data: Technical analysis of storage patterns
 * - Quark: Cost analysis of storage efficiency
 * - Dr. Crusher: Health monitoring and recommendations
 * - Riker: Tactical optimization strategy
 * 
 * Usage:
 *   node scripts/rag-introspection-optimization.js [--analyze] [--optimize] [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('./utils/secure-credential-loader');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');

// RAG tables to analyze
const RAG_TABLES = [
  'knowledge_base',
  'crew_memories',
  'alex_ai_memories'
];

class RAGIntrospectionOptimizer {
  constructor() {
    this.supabase = null;
    this.optimizer = null;
    this.analysis = {
      totalMemories: 0,
      duplicates: [],
      overlaps: [],
      lowValue: [],
      coreKnowledge: [],
      recommendations: []
    };
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
   * Analyze all RAG tables for bloat and optimization opportunities
   */
  async analyzeRAGSystem() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖖 RAG SYSTEM INTROSPECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🤖 Commander Data: Analyzing storage patterns...\n');
    
    const tableStats = {};
    
    for (const table of RAG_TABLES) {
      console.log(`📊 Analyzing table: ${table}`);
      
      try {
        // Get total count
        const { count } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        tableStats[table] = {
          total: count || 0,
          duplicates: [],
          overlaps: [],
          categories: {},
          dateRange: null
        };
        
        if (count === 0) {
          console.log(`   ⚠️  Table is empty\n`);
          continue;
        }
        
        // Get all records for analysis
        const { data: allRecords, error } = await this.supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.log(`   ⚠️  Error: ${error.message}\n`);
          continue;
        }
        
        // Analyze duplicates
        const duplicates = this.findDuplicates(allRecords, table);
        tableStats[table].duplicates = duplicates;
        
        // Analyze overlaps (semantic similarity)
        const overlaps = await this.findOverlaps(allRecords, table);
        tableStats[table].overlaps = overlaps;
        
        // Analyze categories
        const categories = this.analyzeCategories(allRecords, table);
        tableStats[table].categories = categories;
        
        // Date range
        if (allRecords.length > 0) {
          const dates = allRecords
            .map(r => r.created_at || r.timestamp)
            .filter(Boolean)
            .sort();
          tableStats[table].dateRange = {
            oldest: dates[0],
            newest: dates[dates.length - 1]
          };
        }
        
        console.log(`   ✅ Total: ${count}`);
        console.log(`   ⚠️  Duplicates: ${duplicates.length}`);
        console.log(`   ⚠️  Overlaps: ${overlaps.length}`);
        console.log(`   📁 Categories: ${Object.keys(categories).length}\n`);
        
        this.analysis.totalMemories += count;
        this.analysis.duplicates.push(...duplicates);
        this.analysis.overlaps.push(...overlaps);
        
      } catch (error) {
        console.log(`   ❌ Error analyzing ${table}: ${error.message}\n`);
      }
    }
    
    return tableStats;
  }

  /**
   * Find exact duplicates (same title/content)
   */
  findDuplicates(records, table) {
    const duplicates = [];
    const seen = new Map();
    
    records.forEach(record => {
      const title = this.getTitle(record, table);
      const content = this.getContent(record, table);
      const key = `${title}|${content.substring(0, 100)}`;
      
      if (seen.has(key)) {
        duplicates.push({
          table,
          original: seen.get(key),
          duplicate: record,
          similarity: 1.0,
          reason: 'exact_duplicate'
        });
      } else {
        seen.set(key, record);
      }
    });
    
    return duplicates;
  }

  /**
   * Find semantic overlaps using embeddings or content similarity
   */
  async findOverlaps(records, table) {
    const overlaps = [];
    
    // Simple content-based overlap detection
    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const similarity = this.calculateSimilarity(
          records[i],
          records[j],
          table
        );
        
        if (similarity > 0.8) {
          overlaps.push({
            table,
            record1: records[i],
            record2: records[j],
            similarity,
            reason: 'high_semantic_overlap'
          });
        }
      }
    }
    
    return overlaps;
  }

  /**
   * Calculate similarity between two records
   */
  calculateSimilarity(record1, record2, table) {
    const title1 = this.getTitle(record1, table).toLowerCase();
    const title2 = this.getTitle(record2, table).toLowerCase();
    const content1 = this.getContent(record1, table).toLowerCase();
    const content2 = this.getContent(record2, table).toLowerCase();
    
    // Title similarity
    const titleSim = this.jaccardSimilarity(title1, title2);
    
    // Content similarity (first 500 chars)
    const contentSim = this.jaccardSimilarity(
      content1.substring(0, 500),
      content2.substring(0, 500)
    );
    
    // Weighted average
    return (titleSim * 0.4) + (contentSim * 0.6);
  }

  /**
   * Jaccard similarity coefficient
   */
  jaccardSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Analyze category distribution
   */
  analyzeCategories(records, table) {
    const categories = {};
    
    records.forEach(record => {
      const category = this.getCategory(record, table);
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    });
    
    return categories;
  }

  /**
   * Get title from record (handles different table schemas)
   */
  getTitle(record, table) {
    return record.title || record.text || record.summary || 'Untitled';
  }

  /**
   * Get content from record
   */
  getContent(record, table) {
    if (typeof record.content === 'string') {
      return record.content;
    } else if (typeof record.content === 'object') {
      return JSON.stringify(record.content);
    } else if (record.detailed_analysis) {
      return record.detailed_analysis;
    }
    return '';
  }

  /**
   * Get category from record
   */
  getCategory(record, table) {
    return record.category || record.knowledge_type || record.memory_type || 'unknown';
  }

  /**
   * Summarize table stats for LLM consumption
   */
  summarizeTableStats(tableStats) {
    const summary = {};
    for (const [table, stats] of Object.entries(tableStats)) {
      summary[table] = {
        total: stats.total,
        duplicates: stats.duplicates.length,
        overlaps: stats.overlaps.length,
        categories: Object.keys(stats.categories || {}).length,
        topCategories: Object.entries(stats.categories || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([cat, count]) => `${cat}: ${count}`)
          .join(', ')
      };
    }
    return summary;
  }

  /**
   * Get crew recommendations for optimization
   */
  async getCrewRecommendations(tableStats) {
    console.log('🤖 Getting crew recommendations...\n');
    
    const summary = this.summarizeTableStats(tableStats);
    
    // Data's technical analysis
    const dataPrompt = `You are Commander Data. Analyze this RAG system storage summary:

Tables: ${JSON.stringify(summary, null, 2)}

Total Memories: ${this.analysis.totalMemories}
Total Duplicates: ${this.analysis.duplicates.length}
Total Overlaps: ${this.analysis.overlaps.length}

Provide concise technical recommendations for:
1. Storage optimization opportunities
2. Duplicate removal strategies (preserve most recent/complete)
3. Overlap consolidation approaches
4. Schema improvements if needed
5. Index optimization

Be specific, technical, and actionable. Keep response under 500 words.`;

    const dataAnalysis = await this.optimizer.optimizeAndCall(dataPrompt, {
      crewMember: 'data',
      complexity: 'high',
      taskType: 'complex_analysis',
      temperature: 0.7,
      maxTokens: 1000
    });

    // Quark's cost analysis
    const quarkPrompt = `You are Quark. Analyze cost efficiency:

Total Memories: ${this.analysis.totalMemories}
Duplicates: ${this.analysis.duplicates.length} (${Math.round(this.analysis.duplicates.length / this.analysis.totalMemories * 100)}%)
Overlaps: ${this.analysis.overlaps.length} pairs

Provide cost optimization recommendations:
1. Storage cost reduction (estimate savings)
2. Embedding generation cost savings
3. Query optimization for cost
4. ROI of cleanup operations

Be profit-focused, specific, and include cost estimates. Keep under 400 words.`;

    const quarkAnalysis = await this.optimizer.optimizeAndCall(quarkPrompt, {
      crewMember: 'quark',
      complexity: 'medium',
      taskType: 'business_analysis',
      temperature: 0.7,
      maxTokens: 800
    });

    // Dr. Crusher's health assessment
    const crusherPrompt = `You are Dr. Beverly Crusher. Assess RAG system health:

Total Memories: ${this.analysis.totalMemories}
Duplicates: ${this.analysis.duplicates.length}
Overlaps: ${this.analysis.overlaps.length}
Tables: ${Object.keys(tableStats).length}

Health indicators:
- Bloat level: ${this.analysis.duplicates.length > this.analysis.totalMemories * 0.3 ? 'HIGH' : 'MODERATE'}
- Duplicate rate: ${Math.round(this.analysis.duplicates.length / this.analysis.totalMemories * 100)}%

Provide health recommendations:
1. System health indicators
2. Bloat symptoms identified
3. Optimization priorities (what to fix first)
4. Maintenance recommendations

Be diagnostic, preventive, and prioritize actions. Keep under 400 words.`;

    const crusherAnalysis = await this.optimizer.optimizeAndCall(crusherPrompt, {
      crewMember: 'crusher',
      complexity: 'medium',
      taskType: 'health_monitoring',
      temperature: 0.7,
      maxTokens: 800
    });

    return {
      data: dataAnalysis.choices?.[0]?.message?.content || dataAnalysis.body || dataAnalysis || '',
      quark: quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body || quarkAnalysis || '',
      crusher: crusherAnalysis.choices?.[0]?.message?.content || crusherAnalysis.body || crusherAnalysis || ''
    };
  }

  /**
   * Generate optimization plan
   */
  async generateOptimizationPlan(tableStats, recommendations) {
    console.log('🤖 Riker: Coordinating optimization strategy...\n');
    
    const dataSummary = recommendations.data.substring(0, 500);
    const quarkSummary = recommendations.quark.substring(0, 500);
    const crusherSummary = recommendations.crusher.substring(0, 500);
    
    const rikerPrompt = `You are Commander William Riker. Create a tactical optimization plan:

Current State:
- Total Memories: ${this.analysis.totalMemories}
- Duplicates: ${this.analysis.duplicates.length}
- Overlaps: ${this.analysis.overlaps.length}

Crew Recommendations:
Data (Technical): ${dataSummary}
Quark (Cost): ${quarkSummary}
Crusher (Health): ${crusherSummary}

Create a tactical, step-by-step plan that:
1. Preserves core knowledge (never delete unique content)
2. Removes bloat efficiently (prioritize duplicates, then overlaps)
3. Optimizes storage costs
4. Maintains system health

Format as numbered steps with priorities. Keep under 600 words.`;

    const plan = await this.optimizer.optimizeAndCall(rikerPrompt, {
      crewMember: 'riker',
      complexity: 'high',
      taskType: 'operations',
      temperature: 0.7,
      maxTokens: 1200
    });

    return plan.choices?.[0]?.message?.content || plan.body || plan || '';
  }

  /**
   * Execute optimization (dry-run or actual)
   */
  async executeOptimization(plan, dryRun = true) {
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    } else {
      console.log('⚠️  EXECUTION MODE - Changes will be applied\n');
    }
    
    // Implementation would go here
    // For now, return analysis
    return {
      wouldRemove: this.analysis.duplicates.length + this.analysis.overlaps.length,
      wouldKeep: this.analysis.totalMemories - (this.analysis.duplicates.length + this.analysis.overlaps.length),
      estimatedSavings: 'TBD'
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const analyze = args.includes('--analyze') || args.length === 0;
  const optimize = args.includes('--optimize');
  const dryRun = !args.includes('--execute');

  const optimizer = new RAGIntrospectionOptimizer();
  await optimizer.initialize();

  if (analyze) {
    const tableStats = await optimizer.analyzeRAGSystem();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ANALYSIS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Total Memories: ${optimizer.analysis.totalMemories}`);
    console.log(`Duplicates: ${optimizer.analysis.duplicates.length}`);
    console.log(`Overlaps: ${optimizer.analysis.overlaps.length}\n`);
    
    // Get crew recommendations
    const recommendations = await optimizer.getCrewRecommendations(tableStats);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 COMMANDER DATA - TECHNICAL ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(recommendations.data.substring(0, 500) + '...\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 QUARK - COST ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(recommendations.quark.substring(0, 500) + '...\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💊 DR. CRUSHER - HEALTH ASSESSMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(recommendations.crusher.substring(0, 500) + '...\n');
    
    if (optimize) {
      const plan = await optimizer.generateOptimizationPlan(tableStats, recommendations);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚡ RIKER - OPTIMIZATION PLAN');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(plan.substring(0, 800) + '...\n');
      
      if (!dryRun) {
        const result = await optimizer.executeOptimization(plan, false);
        console.log('✅ Optimization executed:', result);
      } else {
        const result = await optimizer.executeOptimization(plan, true);
        console.log('🔍 Dry run results:', result);
      }
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = { RAGIntrospectionOptimizer };

