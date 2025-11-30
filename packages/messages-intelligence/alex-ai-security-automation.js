#!/usr/bin/env node

/**
 * Alex AI Security Automation - Complete Prime Directive Enforcement
 * 
 * This script provides a comprehensive security automation suite that:
 * 1. Audits the RAG database for contamination
 * 2. Cleans contaminated data using Ambiguity Guarantee rules
 * 3. Validates Prime Directive compliance
 * 4. Generates comprehensive security reports
 */

const RAGSecurityAuditor = require('./rag-security-audit.js');
const RAGCleanupAutomation = require('./rag-cleanup-automation.js');
const fs = require('fs');
const path = require('path');

class AlexAISecurityAutomation {
  constructor() {
    this.auditResults = null;
    this.cleanupResults = null;
    this.securityStatus = {
      auditCompleted: false,
      cleanupCompleted: false,
      violationsFound: false,
      contaminationDetected: false,
      complianceRestored: false
    };
  }

  /**
   * Run complete security automation workflow
   */
  async runSecurityAutomation(options = {}) {
    console.log('🖖 Alex AI Security Automation - Prime Directive Enforcement');
    console.log('Ambiguity Guarantee: Automated secret detection and cleanup\n');

    const {
      skipAudit = false,
      skipCleanup = false,
      aggressiveCleanup = false,
      generateReport = true
    } = options;

    try {
      // Step 1: Security Audit
      if (!skipAudit) {
        console.log('🔍 STEP 1: RAG SECURITY AUDIT');
        console.log('==============================\n');
        
        this.auditResults = await this.runSecurityAudit();
        this.securityStatus.auditCompleted = true;
        
        if (this.auditResults.violations > 0) {
          this.securityStatus.violationsFound = true;
          this.securityStatus.contaminationDetected = true;
        }
      }

      // Step 2: Automated Cleanup
      if (!skipCleanup && this.securityStatus.contaminationDetected) {
        console.log('\n🧹 STEP 2: AUTOMATED CLEANUP');
        console.log('=============================\n');
        
        this.cleanupResults = await this.runCleanup(aggressiveCleanup);
        this.securityStatus.cleanupCompleted = true;
        
        if (this.cleanupResults.success) {
          this.securityStatus.complianceRestored = true;
        }
      }

      // Step 3: Generate Comprehensive Report
      if (generateReport) {
        console.log('\n📊 STEP 3: SECURITY REPORT');
        console.log('===========================\n');
        
        await this.generateComprehensiveReport();
      }

      // Step 4: Final Validation
      const finalStatus = this.validateSecurityStatus();
      this.displayFinalStatus(finalStatus);

      return finalStatus;

    } catch (error) {
      console.error('\n❌ Security automation failed:', error.message);
      throw error;
    }
  }

  /**
   * Run security audit
   */
  async runSecurityAudit() {
    const auditor = new RAGSecurityAuditor();
    return await auditor.runSecurityAudit();
  }

  /**
   * Run cleanup automation
   */
  async runCleanup(aggressiveMode = false) {
    const cleanup = new RAGCleanupAutomation();
    return await cleanup.runCleanupAutomation(aggressiveMode);
  }

  /**
   * Generate comprehensive security report
   */
  async generateComprehensiveReport() {
    const reportData = {
      automationTimestamp: new Date().toISOString(),
      securityStatus: this.securityStatus,
      auditResults: this.auditResults,
      cleanupResults: this.cleanupResults,
      recommendations: this.generateSecurityRecommendations(),
      complianceStatus: this.getComplianceStatus()
    };

    // Save JSON report
    const jsonReportPath = path.join(__dirname, 'alex-ai-security-report.json');
    await fs.promises.writeFile(jsonReportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed security report saved to: ${jsonReportPath}`);

    // Generate human-readable report
    const humanReport = this.generateHumanReadableReport(reportData);
    const humanReportPath = path.join(__dirname, 'alex-ai-security-report.md');
    await fs.promises.writeFile(humanReportPath, humanReport);
    console.log(`📄 Human-readable report saved to: ${humanReportPath}`);

    // Display summary
    console.log('\n' + humanReport);
  }

  /**
   * Generate human-readable security report
   */
  generateHumanReadableReport(reportData) {
    const report = [
      '# 🛡️ Alex AI Security Automation Report',
      '',
      `**Generated:** ${reportData.automationTimestamp}`,
      `**Status:** ${reportData.complianceStatus.overall}`,
      '',
      '## 📊 Security Status Summary',
      '',
      '| Component | Status | Details |',
      '|-----------|--------|---------|',
      `| Security Audit | ${reportData.securityStatus.auditCompleted ? '✅ Completed' : '❌ Skipped'} | ${reportData.auditResults ? `${reportData.auditResults.violations} violations found` : 'N/A'} |`,
      `| Automated Cleanup | ${reportData.securityStatus.cleanupCompleted ? '✅ Completed' : '❌ Skipped'} | ${reportData.cleanupResults ? `${reportData.cleanupResults.recordsDeleted} records cleaned` : 'N/A'} |`,
      `| Violations Detected | ${reportData.securityStatus.violationsFound ? '🚨 Yes' : '✅ No'} | ${reportData.auditResults ? `${reportData.auditResults.violations} total violations` : 'N/A'} |`,
      `| Contamination Found | ${reportData.securityStatus.contaminationDetected ? '🚨 Yes' : '✅ No'} | ${reportData.auditResults ? `${reportData.auditResults.contaminatedRecords} contaminated records` : 'N/A'} |`,
      `| Compliance Restored | ${reportData.securityStatus.complianceRestored ? '✅ Yes' : '❌ No'} | ${reportData.cleanupResults ? `${reportData.cleanupResults.criticalSecretsRemoved} secrets removed` : 'N/A'} |`,
      '',
      '## 🔍 Audit Results',
      ''
    ];

    if (reportData.auditResults) {
      report.push(`- **Total Records Scanned:** ${reportData.auditResults.totalRecords || 'N/A'}`);
      report.push(`- **Violations Found:** ${reportData.auditResults.violations || 0}`);
      report.push(`- **Critical Violations:** ${reportData.auditResults.criticalViolations || 0}`);
      report.push(`- **Contaminated Records:** ${reportData.auditResults.contaminatedRecords || 0}`);
      report.push(`- **Secrets Exposed:** ${reportData.auditResults.secretsExposed || 0}`);
    } else {
      report.push('- Audit was skipped or failed');
    }

    report.push('', '## 🧹 Cleanup Results', '');

    if (reportData.cleanupResults) {
      report.push(`- **Records Deleted:** ${reportData.cleanupResults.recordsDeleted || 0}`);
      report.push(`- **Tables Cleaned:** ${reportData.cleanupResults.tablesCleaned || 0}`);
      report.push(`- **Critical Secrets Removed:** ${reportData.cleanupResults.criticalSecretsRemoved || 0}`);
      report.push(`- **Contamination Eliminated:** ${reportData.cleanupResults.contaminationEliminated || 0}`);
      report.push(`- **Errors Encountered:** ${reportData.cleanupResults.errors || 0}`);
    } else {
      report.push('- Cleanup was skipped or not needed');
    }

    report.push('', '## 🎯 Compliance Status', '');

    const compliance = reportData.complianceStatus;
    report.push(`- **Prime Directive:** ${compliance.primeDirective ? '✅ Compliant' : '❌ Violation'}`);
    report.push(`- **Ambiguity Guarantee:** ${compliance.ambiguityGuarantee ? '✅ Compliant' : '❌ Violation'}`);
    report.push(`- **Data Isolation:** ${compliance.dataIsolation ? '✅ Enforced' : '❌ Compromised'}`);
    report.push(`- **Local Processing:** ${compliance.localProcessing ? '✅ Enforced' : '❌ Compromised'}`);

    report.push('', '## 📋 Security Recommendations', '');

    reportData.recommendations.forEach((rec, index) => {
      report.push(`${index + 1}. **${rec.priority}:** ${rec.action}`);
      report.push(`   ${rec.description}`);
      report.push('');
    });

    report.push('## 🚨 Action Items', '');

    if (!compliance.primeDirective || !compliance.ambiguityGuarantee) {
      report.push('- 🚨 **IMMEDIATE:** Address Prime Directive violations');
      report.push('- 🚨 **IMMEDIATE:** Restore Ambiguity Guarantee compliance');
    }

    if (reportData.auditResults && reportData.auditResults.criticalViolations > 0) {
      report.push('- 🚨 **CRITICAL:** Remove all contaminated data');
      report.push('- 🚨 **CRITICAL:** Rotate exposed credentials');
    }

    report.push('- 📅 **SCHEDULED:** Regular security audits');
    report.push('- 🔧 **ONGOING:** Monitor for future violations');
    report.push('- 📚 **TRAINING:** Team security awareness');

    return report.join('\n');
  }

  /**
   * Generate security recommendations
   */
  generateSecurityRecommendations() {
    const recommendations = [];

    if (this.securityStatus.contaminationDetected) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Data Contamination Cleanup',
        description: 'Remove all contaminated data from RAG database'
      });
    }

    if (this.auditResults && this.auditResults.criticalViolations > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Credential Security',
        description: 'Rotate all exposed API keys and secrets'
      });
    }

    recommendations.push({
      priority: 'HIGH',
      action: 'Access Control Review',
      description: 'Review and restrict database access permissions'
    });

    recommendations.push({
      priority: 'HIGH',
      action: 'Input Validation',
      description: 'Implement data validation to prevent future contamination'
    });

    recommendations.push({
      priority: 'MEDIUM',
      action: 'Automated Monitoring',
      description: 'Set up continuous security monitoring'
    });

    recommendations.push({
      priority: 'MEDIUM',
      action: 'Security Training',
      description: 'Train team on Prime Directive and Ambiguity Guarantee'
    });

    return recommendations;
  }

  /**
   * Get compliance status
   */
  getComplianceStatus() {
    return {
      primeDirective: !this.securityStatus.violationsFound || this.securityStatus.complianceRestored,
      ambiguityGuarantee: !this.securityStatus.contaminationDetected || this.securityStatus.complianceRestored,
      dataIsolation: !this.securityStatus.contaminationDetected,
      localProcessing: !this.securityStatus.violationsFound,
      overall: this.securityStatus.complianceRestored ? 'SECURE' : 'COMPROMISED'
    };
  }

  /**
   * Validate final security status
   */
  validateSecurityStatus() {
    const compliance = this.getComplianceStatus();
    
    return {
      success: compliance.primeDirective && compliance.ambiguityGuarantee,
      compliance: compliance,
      status: compliance.overall,
      requiresAction: !compliance.primeDirective || !compliance.ambiguityGuarantee
    };
  }

  /**
   * Display final security status
   */
  displayFinalStatus(finalStatus) {
    console.log('\n🎯 FINAL SECURITY STATUS');
    console.log('========================');

    if (finalStatus.success) {
      console.log('✅ SECURITY AUTOMATION SUCCESSFUL');
      console.log('✅ Prime Directive compliance restored');
      console.log('✅ Ambiguity Guarantee enforced');
      console.log('✅ RAG database is secure');
    } else {
      console.log('🚨 SECURITY AUTOMATION REQUIRES ATTENTION');
      console.log('⚠️  Prime Directive violations detected');
      console.log('⚠️  Ambiguity Guarantee compromised');
      console.log('🚨 Immediate action required');
    }

    console.log('\n📊 Compliance Status:');
    console.log(`- Prime Directive: ${finalStatus.compliance.primeDirective ? '✅ Compliant' : '❌ Violation'}`);
    console.log(`- Ambiguity Guarantee: ${finalStatus.compliance.ambiguityGuarantee ? '✅ Compliant' : '❌ Violation'}`);
    console.log(`- Data Isolation: ${finalStatus.compliance.dataIsolation ? '✅ Enforced' : '❌ Compromised'}`);
    console.log(`- Local Processing: ${finalStatus.compliance.localProcessing ? '✅ Enforced' : '❌ Compromised'}`);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options = {
    skipAudit: args.includes('--skip-audit'),
    skipCleanup: args.includes('--skip-cleanup'),
    aggressiveCleanup: args.includes('--aggressive'),
    generateReport: !args.includes('--no-report')
  };

  const automation = new AlexAISecurityAutomation();
  
  automation.runSecurityAutomation(options)
    .then(results => {
      if (results.success) {
        console.log('\n🖖 Alex AI Security Automation - Mission Complete');
        console.log('Prime Directive and Ambiguity Guarantee compliance restored');
        process.exit(0);
      } else {
        console.log('\n🚨 Alex AI Security Automation - Action Required');
        console.log('Review security report and address violations');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Security automation failed:', error.message);
      process.exit(1);
    });
}

module.exports = AlexAISecurityAutomation;

