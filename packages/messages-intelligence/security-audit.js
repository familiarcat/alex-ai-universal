#!/usr/bin/env node

/**
 * Alex AI Security Audit - Prime Directive Compliance Check
 * 
 * This script audits the Messages Intelligence system for security violations
 * and ensures Prime Directive compliance.
 */

const fs = require('fs');
const path = require('path');

// Security violation patterns
const SECURITY_PATTERNS = {
  external_api: [
    /http:\/\/localhost:3000\/api\//,
    /https:\/\/.*\/api\//,
    /fetch\(['"`]http/,
    /axios\.(get|post|put|delete)\(['"`]http/,
    /request\(['"`]http/
  ],
  cloud_storage: [
    /supabase/i,
    /firebase/i,
    /aws/i,
    /google.*cloud/i,
    /azure/i,
    /cloud/i
  ],
  rag_ingestion: [
    /rag-system\/ingest/i,
    /\/api\/rag/i,
    /ingest.*rag/i,
    /rag.*ingest/i
  ],
  data_transmission: [
    /send.*data/i,
    /transmit.*data/i,
    /upload.*data/i,
    /sync.*data/i,
    /push.*data/i
  ]
};

// Code file extensions to check
const CODE_EXTENSIONS = ['.ts', '.js', '.json', '.md'];

class SecurityAuditor {
  constructor() {
    this.violations = [];
    this.filesScanned = 0;
    this.violationsFound = 0;
  }

  async auditDirectory(dirPath) {
    console.log(`🔍 Scanning directory: ${dirPath}`);
    
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          await this.auditDirectory(fullPath);
        } else if (file.isFile() && this.isCodeFile(file.name)) {
          await this.auditFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  async auditFile(filePath) {
    this.filesScanned++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        // Check each security pattern type
        Object.entries(SECURITY_PATTERNS).forEach(([type, patterns]) => {
          patterns.forEach(pattern => {
            if (pattern.test(line)) {
              this.violationsFound++;
              this.violations.push({
                type,
                severity: this.getSeverity(type),
                file: filePath,
                line: lineNumber,
                content: line.trim(),
                timestamp: new Date()
              });
            }
          });
        });
      });
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }

  isCodeFile(filename) {
    return CODE_EXTENSIONS.some(ext => filename.endsWith(ext));
  }

  getSeverity(type) {
    switch (type) {
      case 'external_api':
      case 'cloud_storage':
      case 'rag_ingestion':
        return 'critical';
      case 'data_transmission':
        return 'high';
      default:
        return 'medium';
    }
  }

  generateReport() {
    console.log('\n🛡️ ALEX AI SECURITY AUDIT REPORT');
    console.log('=====================================');
    console.log(`Files Scanned: ${this.filesScanned}`);
    console.log(`Violations Found: ${this.violationsFound}`);
    console.log('');

    if (this.violations.length === 0) {
      console.log('✅ NO SECURITY VIOLATIONS DETECTED');
      console.log('✅ Prime Directive compliance verified');
      console.log('✅ Ambiguity Guarantee compliance verified');
      return true;
    }

    // Group violations by type
    const violationsByType = {};
    this.violations.forEach(violation => {
      if (!violationsByType[violation.type]) {
        violationsByType[violation.type] = [];
      }
      violationsByType[violation.type].push(violation);
    });

    console.log('🚨 SECURITY VIOLATIONS DETECTED:');
    console.log('');

    Object.entries(violationsByType).forEach(([type, violations]) => {
      console.log(`${type.toUpperCase()} (${violations.length} violations):`);
      violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. [${violation.severity.toUpperCase()}] ${violation.file}:${violation.line}`);
        console.log(`     Content: ${violation.content}`);
      });
      console.log('');
    });

    // Check for critical violations
    const criticalViolations = this.violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      console.log('🚨 CRITICAL SECURITY VIOLATIONS:');
      console.log('❌ Prime Directive VIOLATION detected');
      console.log('❌ Ambiguity Guarantee VIOLATION detected');
      console.log('');
      console.log('IMMEDIATE ACTION REQUIRED:');
      console.log('- Remove all external API calls');
      console.log('- Remove all cloud storage references');
      console.log('- Remove all RAG system integration');
      console.log('- Ensure local-only processing');
      return false;
    }

    console.log('⚠️  Security violations detected but none are critical');
    console.log('✅ Prime Directive compliance maintained');
    return true;
  }
}

// Run security audit
async function runSecurityAudit() {
  console.log('🖖 Alex AI Security Audit - Prime Directive Compliance Check');
  console.log('Prime Directive: Zero-artifact guarantee enforcement\n');

  const auditor = new SecurityAuditor();
  const messagesIntelligencePath = path.join(__dirname);
  
  await auditor.auditDirectory(messagesIntelligencePath);
  
  const isCompliant = auditor.generateReport();
  
  if (!isCompliant) {
    console.log('\n🚨 SECURITY AUDIT FAILED');
    console.log('Prime Directive violations detected. System must be secured immediately.');
    process.exit(1);
  } else {
    console.log('\n✅ SECURITY AUDIT PASSED');
    console.log('Prime Directive compliance verified. System is secure.');
    process.exit(0);
  }
}

// Run the audit
runSecurityAudit().catch(console.error);
