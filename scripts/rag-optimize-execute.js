#!/usr/bin/env node
/**
 * 🖖 RAG Optimization Execution
 * 
 * Executes optimization plan to remove duplicates and consolidate overlaps
 * while preserving core knowledge.
 * 
 * Usage:
 *   node scripts/rag-optimize-execute.js [--dry-run] [--table=knowledge_base]
 */

const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('./utils/secure-credential-loader');

class RAGOptimizer {
  constructor() {
    this.supabase = null;
    this.dryRun = true;
    this.table = 'knowledge_base';
  }

  async initialize() {
    const creds = loadSupabaseCredentials();
    if (!creds.url || !creds.serviceKey) {
      throw new Error('Supabase credentials not found');
    }
    this.supabase = createClient(creds.url, creds.serviceKey);
  }

  /**
   * Remove exact duplicates (keep most recent)
   */
  async removeDuplicates() {
    console.log(`\n🔍 Finding duplicates in ${this.table}...\n`);
    
    const { data: allRecords, error } = await this.supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const seen = new Map();
    const toDelete = [];
    
    allRecords.forEach(record => {
      const title = (record.title || record.text || '').toLowerCase().trim();
      const content = this.getContent(record).substring(0, 200).toLowerCase().trim();
      const key = `${title}|${content}`;
      
      if (seen.has(key)) {
        // Keep the most recent, delete older
        const existing = seen.get(key);
        const existingDate = new Date(existing.created_at || existing.timestamp || 0);
        const currentDate = new Date(record.created_at || record.timestamp || 0);
        
        if (currentDate > existingDate) {
          // Current is newer, delete existing
          toDelete.push(existing);
          seen.set(key, record);
        } else {
          // Existing is newer, delete current
          toDelete.push(record);
        }
      } else {
        seen.set(key, record);
      }
    });
    
    console.log(`   Found ${toDelete.length} duplicates to remove`);
    
    if (!this.dryRun && toDelete.length > 0) {
      const ids = toDelete.map(r => r.id);
      const { error: deleteError } = await this.supabase
        .from(this.table)
        .delete()
        .in('id', ids);
      
      if (deleteError) throw deleteError;
      console.log(`   ✅ Removed ${toDelete.length} duplicates`);
    } else if (this.dryRun) {
      console.log(`   🔍 DRY RUN: Would remove ${toDelete.length} duplicates`);
      toDelete.slice(0, 5).forEach((dup, idx) => {
        console.log(`      ${idx + 1}. ${dup.title || 'Untitled'} (${new Date(dup.created_at || dup.timestamp).toLocaleDateString()})`);
      });
    }
    
    return toDelete.length;
  }

  /**
   * Consolidate high-overlap records (keep most complete)
   * Excludes records that were already marked for deletion as duplicates
   */
  async consolidateOverlaps(threshold = 0.85, excludeIds = new Set()) {
    console.log(`\n🔍 Finding overlaps in ${this.table} (threshold: ${threshold})...\n`);
    
    const { data: allRecords, error } = await this.supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Filter out records already marked for deletion
    const recordsToCheck = allRecords.filter(r => !excludeIds.has(r.id));
    
    const toDelete = [];
    const processed = new Set();
    
    for (let i = 0; i < recordsToCheck.length; i++) {
      if (processed.has(i)) continue;
      
      const record1 = recordsToCheck[i];
      const group = [record1];
      
      for (let j = i + 1; j < recordsToCheck.length; j++) {
        if (processed.has(j)) continue;
        
        const record2 = recordsToCheck[j];
        const similarity = this.calculateSimilarity(record1, record2);
        
        if (similarity >= threshold) {
          group.push(record2);
          processed.add(j);
        }
      }
      
      if (group.length > 1) {
        // Keep the most complete record (longest content)
        group.sort((a, b) => {
          const lenA = this.getContent(a).length;
          const lenB = this.getContent(b).length;
          if (lenA !== lenB) return lenB - lenA; // Longer first
          // If same length, keep most recent
          return new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp);
        });
        
        const keep = group[0];
        const remove = group.slice(1);
        
        toDelete.push(...remove);
        processed.add(i);
      }
    }
    
    console.log(`   Found ${toDelete.length} overlaps to consolidate`);
    
    if (!this.dryRun && toDelete.length > 0) {
      const ids = toDelete.map(r => r.id);
      const { error: deleteError } = await this.supabase
        .from(this.table)
        .delete()
        .in('id', ids);
      
      if (deleteError) throw deleteError;
      console.log(`   ✅ Consolidated ${toDelete.length} overlaps`);
    } else if (this.dryRun) {
      console.log(`   🔍 DRY RUN: Would consolidate ${toDelete.length} overlaps`);
    }
    
    return toDelete.length;
  }

  /**
   * Calculate similarity between two records
   */
  calculateSimilarity(record1, record2) {
    const title1 = (record1.title || record1.text || '').toLowerCase();
    const title2 = (record2.title || record2.text || '').toLowerCase();
    const content1 = this.getContent(record1).toLowerCase().substring(0, 500);
    const content2 = this.getContent(record2).toLowerCase().substring(0, 500);
    
    const titleSim = this.jaccardSimilarity(title1, title2);
    const contentSim = this.jaccardSimilarity(content1, content2);
    
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
   * Get content from record
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
   * Get statistics after optimization
   */
  async getStats() {
    const { count } = await this.supabase
      .from(this.table)
      .select('*', { count: 'exact', head: true });
    
    return {
      total: count || 0,
      table: this.table
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  const tableArg = args.find(arg => arg.startsWith('--table='));
  const table = tableArg ? tableArg.split('=')[1] : 'knowledge_base';
  
  const optimizer = new RAGOptimizer();
  optimizer.dryRun = dryRun;
  optimizer.table = table;
  
  await optimizer.initialize();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 RAG OPTIMIZATION EXECUTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nTable: ${table}`);
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '⚠️  EXECUTION'}\n`);
  
  const beforeStats = await optimizer.getStats();
  console.log(`📊 Before: ${beforeStats.total} records\n`);
  
  // Step 1: Remove duplicates
  const duplicatesRemoved = await optimizer.removeDuplicates();
  
  // Get IDs that will be deleted as duplicates (for overlap calculation)
  const { data: allRecords } = await optimizer.supabase
    .from(optimizer.table)
    .select('*')
    .order('created_at', { ascending: false });
  
  const duplicateIds = new Set();
  const seen = new Map();
  
  allRecords.forEach(record => {
    const title = (record.title || record.text || '').toLowerCase().trim();
    const content = optimizer.getContent(record).substring(0, 200).toLowerCase().trim();
    const key = `${title}|${content}`;
    
    if (seen.has(key)) {
      const existing = seen.get(key);
      const existingDate = new Date(existing.created_at || existing.timestamp || 0);
      const currentDate = new Date(record.created_at || record.timestamp || 0);
      
      if (currentDate > existingDate) {
        duplicateIds.add(existing.id);
        seen.set(key, record);
      } else {
        duplicateIds.add(record.id);
      }
    } else {
      seen.set(key, record);
    }
  });
  
  // Step 2: Consolidate overlaps (excluding records already marked as duplicates)
  const overlapsConsolidated = await optimizer.consolidateOverlaps(0.85, duplicateIds);
  
  const afterStats = await optimizer.getStats();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const totalRemoved = duplicatesRemoved + overlapsConsolidated;
  const reductionPercent = beforeStats.total > 0 
    ? Math.round((totalRemoved / beforeStats.total) * 100) 
    : 0;
  
  console.log(`Before: ${beforeStats.total} records`);
  console.log(`Duplicates removed: ${duplicatesRemoved} records`);
  console.log(`Overlaps consolidated: ${overlapsConsolidated} records`);
  console.log(`Total to remove: ${totalRemoved} records`);
  console.log(`Estimated after: ${Math.max(0, beforeStats.total - totalRemoved)} records`);
  console.log(`Reduction: ${reductionPercent}%\n`);
  
  if (dryRun) {
    console.log('🔍 This was a DRY RUN. Use --execute to apply changes.\n');
  } else {
    console.log('✅ Optimization complete!\n');
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = { RAGOptimizer };

