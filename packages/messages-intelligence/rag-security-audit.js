#!/usr/bin/env node

/**
 * Alex AI RAG Security Audit - Automated Protocol
 * 
 * This script performs automated security auditing of the Supabase RAG database
 * using Alex AI Ambiguity Guarantee rules to detect unauthorized secrets and contamination.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ambiguity Guarantee Rules for Secret Detection
const AMBIGUITY_RULES = {
  // ESAI Project Secrets
  esai_secrets: [
    /esai.*api.*key/i,
    /esai.*secret/i,
    /esai.*token/i,
    /esai.*credential/i,
    /esai.*password/i,
    /project.*esai/i,
    /esai.*database/i,
    /esai.*config/i
  ],
  
  // General API Keys and Secrets
  api_keys: [
    /api.*key.*[a-zA-Z0-9]{20,}/i,
    /secret.*key.*[a-zA-Z0-9]{20,}/i,
    /access.*token.*[a-zA-Z0-9]{20,}/i,
    /bearer.*token/i,
    /auth.*token/i,
    /private.*key/i,
    /client.*secret/i
  ],
  
  // Database Credentials
  database_creds: [
    /database.*url/i,
    /postgres.*connection/i,
    /supabase.*url/i,
    /db.*password/i,
    /connection.*string/i,
    /jdbc.*url/i
  ],
  
  // Cloud Service Credentials
  cloud_creds: [
    /aws.*access.*key/i,
    /aws.*secret.*key/i,
    /google.*service.*account/i,
    /azure.*key/i,
    /firebase.*config/i,
    /cloud.*credentials/i
  ],
  
  // Personal Information
  personal_info: [
    /phone.*number/i,
    /email.*address/i,
    /social.*security/i,
    /credit.*card/i,
    /bank.*account/i,
    /personal.*identification/i
  ],
  
  // Conversation Data Contamination
  conversation_contamination: [
    /messages.*intelligence/i,
    /conversation.*analysis/i,
    /chat.*export/i,
    /message.*thread/i,
    /apple.*messages/i,
    /conversation.*data/i
  ],
  
  // External Service References
  external_services: [
    /openai.*api/i,
    /anthropic.*api/i,
    /google.*ai/i,
    /external.*api/i,
    /third.*party.*service/i,
    /webhook.*url/i
  ]
};

class RAGSecurityAuditor {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_ANON_KEY;
    this.violations = [];
    this.contaminatedRecords = [];
    this.auditResults = {
      totalRecords: 0,
      violationsFound: 0,
      contaminationDetected: 0,
      secretsExposed: 0,
      criticalViolations: 0
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
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error.message);
      process.exit(1);
    }
  }

  /**
   * Scan content against Ambiguity Guarantee rules
   */
  scanContent(content, recordId, tableName) {
    const violations = [];
    
    Object.entries(AMBIGUITY_RULES).forEach(([ruleType, patterns]) => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          violations.push({
            ruleType,
            pattern: pattern.toString(),
            matches: matches,
            severity: this.getSeverity(ruleType),
            recordId,
            tableName,
            timestamp: new Date()
          });
        }
      });
    });

    return violations;
  }

  /**
   * Get severity level for violation type
   */
  getSeverity(ruleType) {
    switch (ruleType) {
      case 'esai_secrets':
      case 'api_keys':
      case 'database_creds':
      case 'cloud_creds':
        return 'critical';
      case 'personal_info':
      case 'conversation_contamination':
        return 'high';
      case 'external_services':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Audit specific table
   */
  async auditTable(tableName) {
    console.log(`🔍 Auditing table: ${tableName}`);
    
    try {
      // Get all records from table
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*');

      if (error) {
        console.error(`❌ Error accessing table ${tableName}:`, error.message);
        return;
      }

      console.log(`📊 Found ${data.length} records in ${tableName}`);
      this.auditResults.totalRecords += data.length;

      // Scan each record
      data.forEach((record, index) => {
        const recordId = record.id || `record_${index}`;
        
        // Convert record to string for scanning
        const content = JSON.stringify(record).toLowerCase();
        
        // Scan for violations
        const violations = this.scanContent(content, recordId, tableName);
        
        if (violations.length > 0) {
          this.violations.push(...violations);
          this.contaminatedRecords.push({
            tableName,
            recordId,
            violations,
            record: record
          });
          
          this.auditResults.violationsFound += violations.length;
          this.auditResults.contaminationDetected++;
          
          // Count critical violations
          const criticalViolations = violations.filter(v => v.severity === 'critical');
          this.auditResults.criticalViolations += criticalViolations.length;
          this.auditResults.secretsExposed += criticalViolations.length;
        }
      });

    } catch (error) {
      console.error(`❌ Error auditing table ${tableName}:`, error.message);
    }
  }

  /**
   * Get list of all tables in database
   */
  async getDatabaseTables() {
    console.log('🔍 Discovering database tables...');
    
    try {
      // Common table names to check
      const commonTables = [
        'documents',
        'embeddings',
        'chunks',
        'conversations',
        'messages',
        'analysis',
        'crew_analysis',
        'workflow_data',
        'rag_data',
        'knowledge_base',
        'memories',
        'milestones',
        'project_data',
        'esai_data'
      ];

      const existingTables = [];
      
      // Check each potential table
      for (const tableName of commonTables) {
        try {
          const { data, error } = await this.supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            existingTables.push(tableName);
            console.log(`✅ Table found: ${tableName}`);
          }
        } catch (error) {
          // Table doesn't exist or no access
        }
      }

      return existingTables;
    } catch (error) {
      console.error('❌ Error discovering tables:', error.message);
      return [];
    }
  }

  /**
   * Generate detailed security report
   */
  generateSecurityReport() {
    const report = [
      '🛡️ ALEX AI RAG SECURITY AUDIT REPORT',
      '=====================================',
      '',
      'AMBIGUITY GUARANTEE COMPLIANCE CHECK',
      '=====================================',
      '',
      `Total Records Scanned: ${this.auditResults.totalRecords}`,
      `Violations Found: ${this.auditResults.violationsFound}`,
      `Contaminated Records: ${this.auditResults.contaminationDetected}`,
      `Critical Violations: ${this.auditResults.criticalViolations}`,
      `Secrets Exposed: ${this.auditResults.secretsExposed}`,
      '',
      'VIOLATIONS BY TYPE:',
      '=================='
    ];

    // Group violations by type
    const violationsByType = {};
    this.violations.forEach(violation => {
      if (!violationsByType[violation.ruleType]) {
        violationsByType[violation.ruleType] = [];
      }
      violationsByType[violation.ruleType].push(violation);
    });

    Object.entries(violationsByType).forEach(([type, violations]) => {
      const severity = violations[0].severity;
      report.push(`${type.toUpperCase()} (${violations.length} violations) - [${severity.toUpperCase()}]`);
    });

    if (this.violations.length > 0) {
      report.push('', 'DETAILED VIOLATIONS:', '==================');
      
      this.contaminatedRecords.forEach((record, index) => {
        report.push(`\n${index + 1}. TABLE: ${record.tableName.toUpperCase()}`);
        report.push(`   RECORD ID: ${record.recordId}`);
        report.push(`   VIOLATIONS: ${record.violations.length}`);
        
        record.violations.forEach((violation, vIndex) => {
          report.push(`   ${vIndex + 1}. [${violation.severity.toUpperCase()}] ${violation.ruleType}`);
          report.push(`      Pattern: ${violation.pattern}`);
          report.push(`      Matches: ${violation.matches.join(', ')}`);
        });
      });
    }

    // Security recommendations
    report.push('\n', 'SECURITY RECOMMENDATIONS:', '=======================');
    
    if (this.auditResults.criticalViolations > 0) {
      report.push('🚨 CRITICAL ACTION REQUIRED:');
      report.push('1. IMMEDIATELY remove all contaminated records');
      report.push('2. Audit source systems for secret exposure');
      report.push('3. Rotate all exposed credentials');
      report.push('4. Implement strict access controls');
      report.push('5. Enable real-time monitoring');
    } else if (this.auditResults.violationsFound > 0) {
      report.push('⚠️  SECURITY CONCERNS DETECTED:');
      report.push('1. Review and clean contaminated data');
      report.push('2. Implement data validation rules');
      report.push('3. Add security scanning to CI/CD');
      report.push('4. Regular security audits');
    } else {
      report.push('✅ NO SECURITY VIOLATIONS DETECTED');
      report.push('✅ Ambiguity Guarantee compliance verified');
      report.push('✅ RAG database is clean');
    }

    return report.join('\n');
  }

  /**
   * Save contaminated records for review
   */
  async saveContaminationReport() {
    const reportPath = path.join(__dirname, 'rag-contamination-report.json');
    
    const contaminationData = {
      auditTimestamp: new Date().toISOString(),
      summary: this.auditResults,
      contaminatedRecords: this.contaminatedRecords.map(record => ({
        tableName: record.tableName,
        recordId: record.recordId,
        violations: record.violations,
        // Remove actual record content for security
        recordPreview: Object.keys(record.record)
      })),
      recommendations: this.getSecurityRecommendations()
    };

    try {
      await fs.promises.writeFile(reportPath, JSON.stringify(contaminationData, null, 2));
      console.log(`📄 Contamination report saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Error saving contamination report:', error.message);
    }
  }

  /**
   * Get security recommendations
   */
  getSecurityRecommendations() {
    const recommendations = [];

    if (this.auditResults.criticalViolations > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Immediate Data Cleanup',
        description: 'Remove all contaminated records containing secrets'
      });
      recommendations.push({
        priority: 'CRITICAL', 
        action: 'Credential Rotation',
        description: 'Rotate all exposed API keys and secrets'
      });
    }

    if (this.auditResults.contaminationDetected > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Access Control Review',
        description: 'Review and restrict database access permissions'
      });
      recommendations.push({
        priority: 'HIGH',
        action: 'Data Validation',
        description: 'Implement input validation to prevent future contamination'
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      action: 'Regular Audits',
      description: 'Schedule automated security audits'
    });

    return recommendations;
  }

  /**
   * Run complete security audit
   */
  async runSecurityAudit() {
    console.log('🖖 Alex AI RAG Security Audit - Ambiguity Guarantee Enforcement');
    console.log('Prime Directive: Zero-artifact guarantee active\n');

    // Initialize Supabase
    this.initializeSupabase();

    // Discover tables
    const tables = await this.getDatabaseTables();
    
    if (tables.length === 0) {
      console.log('⚠️  No accessible tables found in database');
      return;
    }

    console.log(`\n🔍 Starting security audit of ${tables.length} tables...\n`);

    // Audit each table
    for (const table of tables) {
      await this.auditTable(table);
    }

    // Generate and display report
    const report = this.generateSecurityReport();
    console.log('\n' + report);

    // Save detailed report
    if (this.contaminatedRecords.length > 0) {
      await this.saveContaminationReport();
    }

    // Return audit results
    return {
      success: this.auditResults.criticalViolations === 0,
      violations: this.auditResults.violationsFound,
      criticalViolations: this.auditResults.criticalViolations,
      contaminatedRecords: this.contaminatedRecords.length
    };
  }
}

// Run security audit if called directly
if (require.main === module) {
  const auditor = new RAGSecurityAuditor();
  
  auditor.runSecurityAudit()
    .then(results => {
      if (results.success) {
        console.log('\n✅ RAG Security Audit PASSED');
        console.log('Ambiguity Guarantee compliance verified');
        process.exit(0);
      } else {
        console.log('\n🚨 RAG Security Audit FAILED');
        console.log('Critical violations detected - immediate action required');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Security audit failed:', error.message);
      process.exit(1);
    });
}

module.exports = RAGSecurityAuditor;
