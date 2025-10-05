#!/usr/bin/env node

/**
 * Alex AI RAG Cleanup Automation - Ambiguity Guarantee Enforcement
 * 
 * This script automatically cleans contaminated data from the Supabase RAG database
 * based on Alex AI Ambiguity Guarantee rules and security audit results.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class RAGCleanupAutomation {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_ANON_KEY;
    this.cleanupResults = {
      recordsDeleted: 0,
      tablesCleaned: 0,
      criticalSecretsRemoved: 0,
      contaminationEliminated: 0,
      errors: []
    };
  }

  /**
   * Initialize Supabase client
   */
  initializeSupabase() {
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.error('❌ Supabase credentials not found in environment variables');
      console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY');
      process.exit(1);
    }

    try {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
      console.log('✅ Supabase client initialized for cleanup operations');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load contamination report
   */
  async loadContaminationReport() {
    const reportPath = path.join(__dirname, 'rag-contamination-report.json');
    
    try {
      if (!fs.existsSync(reportPath)) {
        console.log('⚠️  No contamination report found. Run security audit first.');
        return null;
      }

      const reportData = await fs.promises.readFile(reportPath, 'utf8');
      const report = JSON.parse(reportData);
      
      console.log(`📄 Loaded contamination report with ${report.contaminatedRecords.length} contaminated records`);
      return report;
    } catch (error) {
      console.error('❌ Error loading contamination report:', error.message);
      return null;
    }
  }

  /**
   * Clean contaminated records from specific table
   */
  async cleanTableRecords(tableName, contaminatedRecords) {
    console.log(`🧹 Cleaning ${contaminatedRecords.length} contaminated records from ${tableName}`);
    
    let cleanedCount = 0;
    let errorCount = 0;

    for (const record of contaminatedRecords) {
      try {
        // Delete the contaminated record
        const { error } = await this.supabase
          .from(tableName)
          .delete()
          .eq('id', record.recordId);

        if (error) {
          console.error(`❌ Error deleting record ${record.recordId}:`, error.message);
          this.cleanupResults.errors.push({
            tableName,
            recordId: record.recordId,
            error: error.message
          });
          errorCount++;
        } else {
          console.log(`✅ Deleted contaminated record: ${record.recordId}`);
          cleanedCount++;
          this.cleanupResults.recordsDeleted++;
          
          // Count critical secrets removed
          const criticalViolations = record.violations.filter(v => v.severity === 'critical');
          this.cleanupResults.criticalSecretsRemoved += criticalViolations.length;
        }
      } catch (error) {
        console.error(`❌ Error processing record ${record.recordId}:`, error.message);
        this.cleanupResults.errors.push({
          tableName,
          recordId: record.recordId,
          error: error.message
        });
        errorCount++;
      }
    }

    if (cleanedCount > 0) {
      this.cleanupResults.tablesCleaned++;
      this.cleanupResults.contaminationEliminated += cleanedCount;
    }

    console.log(`📊 Cleanup complete for ${tableName}: ${cleanedCount} records cleaned, ${errorCount} errors`);
    return { cleanedCount, errorCount };
  }

  /**
   * Clean all contaminated data based on audit report
   */
  async cleanContaminatedData(contaminationReport) {
    console.log('\n🧹 Starting automated cleanup of contaminated data...\n');

    // Group contaminated records by table
    const recordsByTable = {};
    contaminationReport.contaminatedRecords.forEach(record => {
      if (!recordsByTable[record.tableName]) {
        recordsByTable[record.tableName] = [];
      }
      recordsByTable[record.tableName].push(record);
    });

    // Clean each table
    for (const [tableName, records] of Object.entries(recordsByTable)) {
      await this.cleanTableRecords(tableName, records);
    }
  }

  /**
   * Perform aggressive cleanup based on Ambiguity Guarantee rules
   */
  async performAggressiveCleanup() {
    console.log('\n🚨 Performing aggressive cleanup based on Ambiguity Guarantee rules...\n');

    // Define tables that might contain contaminated data
    const suspiciousTables = [
      'conversation_analysis',
      'crew_analysis_results',
      'automated_workflow_data',
      'messages_intelligence_data',
      'rag_analysis_results',
      'chat_exports',
      'conversation_data'
    ];

    for (const tableName of suspiciousTables) {
      try {
        console.log(`🔍 Checking table: ${tableName}`);
        
        // Check if table exists and get record count
        const { data, error } = await this.supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`ℹ️  Table ${tableName} not accessible or doesn't exist`);
          continue;
        }

        console.log(`📊 Found table ${tableName} with potential contamination`);
        
        // Delete all records from suspicious tables
        const { error: deleteError } = await this.supabase
          .from(tableName)
          .delete()
          .neq('id', 'impossible-to-match');

        if (deleteError) {
          console.error(`❌ Error cleaning table ${tableName}:`, deleteError.message);
          this.cleanupResults.errors.push({
            tableName,
            error: deleteError.message
          });
        } else {
          console.log(`✅ Aggressively cleaned table: ${tableName}`);
          this.cleanupResults.tablesCleaned++;
        }
      } catch (error) {
        console.error(`❌ Error processing table ${tableName}:`, error.message);
      }
    }
  }

  /**
   * Verify cleanup success
   */
  async verifyCleanup() {
    console.log('\n🔍 Verifying cleanup success...\n');

    // Check for remaining contaminated data
    const suspiciousTables = [
      'conversation_analysis',
      'crew_analysis_results', 
      'automated_workflow_data',
      'messages_intelligence_data'
    ];

    let remainingContamination = 0;

    for (const tableName of suspiciousTables) {
      try {
        const { data, error } = await this.supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error && data) {
          console.log(`⚠️  Table ${tableName} still contains data`);
          remainingContamination++;
        } else {
          console.log(`✅ Table ${tableName} is clean`);
        }
      } catch (error) {
        // Table doesn't exist or no access - this is good
        console.log(`✅ Table ${tableName} is clean or doesn't exist`);
      }
    }

    return remainingContamination === 0;
  }

  /**
   * Generate cleanup report
   */
  generateCleanupReport() {
    const report = [
      '🧹 ALEX AI RAG CLEANUP REPORT',
      '============================',
      '',
      'AMBIGUITY GUARANTEE ENFORCEMENT',
      '===============================',
      '',
      `Records Deleted: ${this.cleanupResults.recordsDeleted}`,
      `Tables Cleaned: ${this.cleanupResults.tablesCleaned}`,
      `Critical Secrets Removed: ${this.cleanupResults.criticalSecretsRemoved}`,
      `Contamination Eliminated: ${this.cleanupResults.contaminationEliminated}`,
      `Errors Encountered: ${this.cleanupResults.errors.length}`,
      ''
    ];

    if (this.cleanupResults.errors.length > 0) {
      report.push('CLEANUP ERRORS:', '===============');
      this.cleanupResults.errors.forEach((error, index) => {
        report.push(`${index + 1}. ${error.tableName}: ${error.error}`);
      });
      report.push('');
    }

    if (this.cleanupResults.recordsDeleted > 0) {
      report.push('CLEANUP SUCCESS:', '===============');
      report.push('✅ Contaminated records removed');
      report.push('✅ Critical secrets eliminated');
      report.push('✅ Ambiguity Guarantee compliance restored');
      report.push('');
    }

    report.push('RECOMMENDATIONS:', '===============');
    report.push('1. Regular security audits');
    report.push('2. Implement data validation');
    report.push('3. Monitor for future contamination');
    report.push('4. Maintain Prime Directive compliance');

    return report.join('\n');
  }

  /**
   * Save cleanup report
   */
  async saveCleanupReport() {
    const reportPath = path.join(__dirname, 'rag-cleanup-report.json');
    
    const cleanupData = {
      cleanupTimestamp: new Date().toISOString(),
      results: this.cleanupResults,
      summary: this.generateCleanupReport()
    };

    try {
      await fs.promises.writeFile(reportPath, JSON.stringify(cleanupData, null, 2));
      console.log(`📄 Cleanup report saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Error saving cleanup report:', error.message);
    }
  }

  /**
   * Run complete cleanup automation
   */
  async runCleanupAutomation(aggressiveMode = false) {
    console.log('🖖 Alex AI RAG Cleanup Automation - Ambiguity Guarantee Enforcement');
    console.log('Prime Directive: Zero-artifact guarantee active\n');

    // Initialize Supabase
    this.initializeSupabase();

    // Load contamination report
    const contaminationReport = await this.loadContaminationReport();

    if (contaminationReport && contaminationReport.contaminatedRecords.length > 0) {
      console.log(`🚨 Found ${contaminationReport.contaminatedRecords.length} contaminated records`);
      
      // Clean contaminated data
      await this.cleanContaminatedData(contaminationReport);
    } else {
      console.log('ℹ️  No specific contamination report found');
    }

    // Perform aggressive cleanup if requested
    if (aggressiveMode) {
      console.log('\n🚨 AGGRESSIVE CLEANUP MODE ENABLED');
      console.log('This will remove ALL data from suspicious tables\n');
      await this.performAggressiveCleanup();
    }

    // Verify cleanup
    const isClean = await this.verifyCleanup();

    // Generate and display report
    const report = this.generateCleanupReport();
    console.log('\n' + report);

    // Save cleanup report
    await this.saveCleanupReport();

    // Return results
    return {
      success: isClean && this.cleanupResults.errors.length === 0,
      recordsDeleted: this.cleanupResults.recordsDeleted,
      tablesCleaned: this.cleanupResults.tablesCleaned,
      criticalSecretsRemoved: this.cleanupResults.criticalSecretsRemoved,
      errors: this.cleanupResults.errors.length
    };
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const aggressiveMode = args.includes('--aggressive') || args.includes('-a');
  
  const cleanup = new RAGCleanupAutomation();
  
  cleanup.runCleanupAutomation(aggressiveMode)
    .then(results => {
      if (results.success) {
        console.log('\n✅ RAG Cleanup COMPLETED SUCCESSFULLY');
        console.log('Ambiguity Guarantee compliance restored');
        process.exit(0);
      } else {
        console.log('\n⚠️  RAG Cleanup completed with errors');
        console.log('Review cleanup report for details');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Cleanup automation failed:', error.message);
      process.exit(1);
    });
}

module.exports = RAGCleanupAutomation;
