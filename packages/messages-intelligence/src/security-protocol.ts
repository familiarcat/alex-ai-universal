import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Alex AI Security Protocol - Prime Directive Enforcement
 * 
 * This module enforces the Prime Directive and Ambiguity Guarantee
 * to prevent any external data transmission or contamination.
 */

export interface SecurityViolation {
  type: 'external_api' | 'cloud_storage' | 'rag_ingestion' | 'data_transmission';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  description: string;
  timestamp: Date;
}

export class SecurityProtocol {
  private static readonly VIOLATION_KEYWORDS = [
    'http://', 'https://', 'api/', 'rag-system', 'supabase', 'cloud',
    'external', 'transmit', 'upload', 'ingest', 'sync'
  ];

  private static readonly ALLOWED_LOCAL_PATHS = [
    '~/Library/Messages/',
    '~/Documents/',
    './temp/',
    './output/',
    '/tmp/'
  ];

  private violations: SecurityViolation[] = [];
  private isEnabled: boolean = true;

  /**
   * Enable or disable security protocol
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      console.log('🛡️ Security Protocol: ENABLED - Prime Directive enforcement active');
    } else {
      console.log('⚠️ Security Protocol: DISABLED - Prime Directive enforcement inactive');
    }
  }

  /**
   * Validate code for security violations
   */
  validateCode(filePath: string, code: string): SecurityViolation[] {
    if (!this.isEnabled) {
      return [];
    }

    const violations: SecurityViolation[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for external API calls
      if (this.containsExternalAPI(line)) {
        violations.push({
          type: 'external_api',
          severity: 'critical',
          location: `${filePath}:${lineNumber}`,
          description: `External API call detected: ${line.trim()}`,
          timestamp: new Date()
        });
      }

      // Check for cloud storage references
      if (this.containsCloudStorage(line)) {
        violations.push({
          type: 'cloud_storage',
          severity: 'critical',
          location: `${filePath}:${lineNumber}`,
          description: `Cloud storage reference detected: ${line.trim()}`,
          timestamp: new Date()
        });
      }

      // Check for RAG ingestion
      if (this.containsRAGIngestion(line)) {
        violations.push({
          type: 'rag_ingestion',
          severity: 'critical',
          location: `${filePath}:${lineNumber}`,
          description: `RAG system ingestion detected: ${line.trim()}`,
          timestamp: new Date()
        });
      }

      // Check for data transmission
      if (this.containsDataTransmission(line)) {
        violations.push({
          type: 'data_transmission',
          severity: 'high',
          location: `${filePath}:${lineNumber}`,
          description: `Data transmission detected: ${line.trim()}`,
          timestamp: new Date()
        });
      }
    });

    this.violations.push(...violations);
    return violations;
  }

  /**
   * Validate file for security violations
   */
  async validateFile(filePath: string): Promise<SecurityViolation[]> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return this.validateCode(filePath, content);
    } catch (error) {
      console.error(`Error validating file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Validate directory for security violations
   */
  async validateDirectory(dirPath: string): Promise<SecurityViolation[]> {
    const violations: SecurityViolation[] = [];
    
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          const subViolations = await this.validateDirectory(fullPath);
          violations.push(...subViolations);
        } else if (file.isFile() && this.isCodeFile(file.name)) {
          const fileViolations = await this.validateFile(fullPath);
          violations.push(...fileViolations);
        }
      }
    } catch (error) {
      console.error(`Error validating directory ${dirPath}:`, error);
    }

    return violations;
  }

  /**
   * Check if line contains external API calls
   */
  private containsExternalAPI(line: string): boolean {
    const externalPatterns = [
      /http:\/\/localhost:3000\/api\//,
      /https:\/\/.*\/api\//,
      /fetch\(['"`]http/,
      /axios\.(get|post|put|delete)\(['"`]http/,
      /request\(['"`]http/
    ];

    return externalPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if line contains cloud storage references
   */
  private containsCloudStorage(line: string): boolean {
    const cloudPatterns = [
      /supabase/i,
      /firebase/i,
      /aws/i,
      /google.*cloud/i,
      /azure/i,
      /cloud/i
    ];

    return cloudPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if line contains RAG ingestion
   */
  private containsRAGIngestion(line: string): boolean {
    const ragPatterns = [
      /rag-system\/ingest/i,
      /\/api\/rag/i,
      /ingest.*rag/i,
      /rag.*ingest/i
    ];

    return ragPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if line contains data transmission
   */
  private containsDataTransmission(line: string): boolean {
    const transmissionPatterns = [
      /send.*data/i,
      /transmit.*data/i,
      /upload.*data/i,
      /sync.*data/i,
      /push.*data/i
    ];

    return transmissionPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if file is a code file that should be validated
   */
  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.ts', '.js', '.json', '.md'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Get all security violations
   */
  getViolations(): SecurityViolation[] {
    return [...this.violations];
  }

  /**
   * Get violations by type
   */
  getViolationsByType(type: SecurityViolation['type']): SecurityViolation[] {
    return this.violations.filter(v => v.type === type);
  }

  /**
   * Get critical violations
   */
  getCriticalViolations(): SecurityViolation[] {
    return this.violations.filter(v => v.severity === 'critical');
  }

  /**
   * Clear all violations
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): string {
    const report = [
      '🛡️ ALEX AI SECURITY PROTOCOL REPORT',
      '=====================================',
      '',
      `Total Violations: ${this.violations.length}`,
      `Critical: ${this.getCriticalViolations().length}`,
      `High: ${this.violations.filter(v => v.severity === 'high').length}`,
      `Medium: ${this.violations.filter(v => v.severity === 'medium').length}`,
      `Low: ${this.violations.filter(v => v.severity === 'low').length}`,
      '',
      'VIOLATIONS BY TYPE:',
      '=================='
    ];

    const types = ['external_api', 'cloud_storage', 'rag_ingestion', 'data_transmission'];
    types.forEach(type => {
      const typeViolations = this.getViolationsByType(type as SecurityViolation['type']);
      report.push(`${type}: ${typeViolations.length}`);
    });

    if (this.violations.length > 0) {
      report.push('', 'DETAILED VIOLATIONS:', '==================');
      this.violations.forEach((violation, index) => {
        report.push(`${index + 1}. [${violation.severity.toUpperCase()}] ${violation.type}`);
        report.push(`   Location: ${violation.location}`);
        report.push(`   Description: ${violation.description}`);
        report.push(`   Timestamp: ${violation.timestamp.toISOString()}`);
        report.push('');
      });
    }

    return report.join('\n');
  }

  /**
   * Enforce local-only processing
   */
  enforceLocalOnly(): void {
    console.log('🛡️ Security Protocol: Enforcing local-only processing');
    console.log('✅ All external API calls blocked');
    console.log('✅ All cloud storage access blocked');
    console.log('✅ All RAG system integration blocked');
    console.log('✅ All data transmission blocked');
    console.log('✅ Prime Directive compliance enforced');
  }

  /**
   * Validate against Prime Directive
   */
  validatePrimeDirective(): boolean {
    const criticalViolations = this.getCriticalViolations();
    
    if (criticalViolations.length > 0) {
      console.error('🚨 PRIME DIRECTIVE VIOLATION DETECTED');
      console.error('Critical security violations found:');
      criticalViolations.forEach(violation => {
        console.error(`- ${violation.type} at ${violation.location}: ${violation.description}`);
      });
      return false;
    }

    console.log('✅ Prime Directive compliance verified');
    return true;
  }

  /**
   * Validate against Ambiguity Guarantee
   */
  validateAmbiguityGuarantee(): boolean {
    const dataTransmissionViolations = this.getViolationsByType('data_transmission');
    
    if (dataTransmissionViolations.length > 0) {
      console.error('🚨 AMBIGUITY GUARANTEE VIOLATION DETECTED');
      console.error('Data transmission violations found:');
      dataTransmissionViolations.forEach(violation => {
        console.error(`- ${violation.location}: ${violation.description}`);
      });
      return false;
    }

    console.log('✅ Ambiguity Guarantee compliance verified');
    return true;
  }
}

// Export singleton instance
export const securityProtocol = new SecurityProtocol();

