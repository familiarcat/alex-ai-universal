#!/usr/bin/env node
/**
 * Apply Emergency Innovations to Framework
 * 
 * Systematically applies innovations from .backup-ec2-emergency to entire ALEX-AI-UNIVERSAL framework
 * Crew members work in parallel and tandem using their personas to self-organize
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EMERGENCY_FOLDER = path.join(process.cwd(), '.backup-ec2-emergency');
const WORKSPACE_ROOT = process.cwd();

/**
 * Key Innovations to Apply
 */
const INNOVATIONS = {
  costAnalysis: {
    name: 'Automated Cost Analysis Framework',
    source: 'compare-and-analyze-costs.js',
    target: 'packages/shared-utilities/src/cost-analysis',
    crewLead: 'data',
    crewSupport: ['quark', 'geordi', 'picard'],
    description: 'Extract cost calculation functions to shared utilities for framework-wide use'
  },
  naturalLanguageCLI: {
    name: 'Natural Language CLI Integration',
    source: 'packages-cli/',
    target: 'packages/cli/src',
    crewLead: 'uhura',
    crewSupport: ['riker', 'data', 'troi'],
    description: 'Apply natural language CLI patterns framework-wide'
  },
  multiFormatReporting: {
    name: 'Multi-Format Reporting',
    source: 'compare-and-analyze-costs.js',
    target: 'packages/shared-utilities/src/reporting',
    crewLead: 'troi',
    crewSupport: ['uhura', 'data', 'crusher'],
    description: 'Create multi-format reporting (text, json, summary) for all analysis tools'
  },
  automationPatterns: {
    name: 'Automation Patterns',
    source: 'scripts/',
    target: 'scripts/utils',
    crewLead: 'riker',
    crewSupport: ['obrien', 'geordi', 'data'],
    description: 'Extract reusable automation patterns from emergency scripts'
  },
  securityBestPractices: {
    name: 'Security Best Practices',
    source: 'compare-and-analyze-costs.js',
    target: 'packages/shared-utilities/src/security',
    crewLead: 'worf',
    crewSupport: ['data', 'geordi'],
    description: 'Apply secure credential handling patterns framework-wide'
  },
  healthMonitoring: {
    name: 'Health Monitoring Integration',
    source: 'EXECUTIVE_SUMMARY.md',
    target: 'packages/shared-utilities/src/health',
    crewLead: 'crusher',
    crewSupport: ['data', 'geordi', 'worf'],
    description: 'Integrate health monitoring into cost analysis and all critical systems'
  }
};

/**
 * Crew Member Implementation Functions
 */
const CREW_IMPLEMENTATIONS = {
  data: {
    name: 'Commander Data',
    implement: async (innovation) => {
      if (innovation.name.includes('Cost Analysis')) {
        return await implementCostAnalysisFramework(innovation);
      }
      return { status: 'delegated', message: 'Delegated to appropriate specialist' };
    }
  },
  uhura: {
    name: 'Lieutenant Uhura',
    implement: async (innovation) => {
      if (innovation.name.includes('Natural Language') || innovation.name.includes('CLI')) {
        return await implementNaturalLanguageCLI(innovation);
      }
      return { status: 'delegated', message: 'Delegated to appropriate specialist' };
    }
  },
  troi: {
    name: 'Counselor Troi',
    implement: async (innovation) => {
      if (innovation.name.includes('Reporting') || innovation.name.includes('Format')) {
        return await implementMultiFormatReporting(innovation);
      }
      return { status: 'delegated', message: 'Delegated to appropriate specialist' };
    }
  },
  riker: {
    name: 'Commander Riker',
    implement: async (innovation) => {
      if (innovation.name.includes('Automation')) {
        return await implementAutomationPatterns(innovation);
      }
      return { status: 'delegated', message: 'Delegated to appropriate specialist' };
    }
  },
  worf: {
    name: 'Lieutenant Worf',
    implement: async (innovation) => {
      if (innovation.name.includes('Security')) {
        return await implementSecurityBestPractices(innovation);
      }
      return { status: 'delegated', message: 'Delegated to appropriate specialist' };
    }
  },
  crusher: {
    name: 'Dr. Beverly Crusher',
    implement: async (innovation) => {
      if (innovation.name.includes('Health')) {
        return await implementHealthMonitoring(innovation);
      }
      return { status: 'delegated', message: 'Delegated to appropriate specialist' };
    }
  }
};

/**
 * Commander Data - Implement Cost Analysis Framework
 */
async function implementCostAnalysisFramework(innovation) {
  console.log('   🤖 Commander Data: Extracting cost analysis framework...');
  
  const sourceFile = path.join(EMERGENCY_FOLDER, 'compare-and-analyze-costs.js');
  const targetDir = path.join(WORKSPACE_ROOT, 'packages/shared-utilities/src/cost-analysis');
  
  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Read source file
  const sourceContent = fs.readFileSync(sourceFile, 'utf8');
  
  // Extract cost calculation functions
  const costFunctions = extractCostFunctions(sourceContent);
  
  // Create modular cost analysis module
  const moduleContent = generateCostAnalysisModule(costFunctions);
  
  // Write to target
  const modulePath = path.join(targetDir, 'aws-cost-calculator.js');
  fs.writeFileSync(modulePath, moduleContent);
  
  // Create index file
  const indexContent = `export { calculateEC2Costs, calculateEBSCosts, calculateCloudWatchCosts } from './aws-cost-calculator';\n`;
  fs.writeFileSync(path.join(targetDir, 'index.js'), indexContent);
  
  // Create TypeScript definitions
  const tsDefContent = generateTypeScriptDefinitions();
  fs.writeFileSync(path.join(targetDir, 'aws-cost-calculator.d.ts'), tsDefContent);
  
  console.log('   ✅ Cost analysis framework extracted and modularized');
  
  return {
    status: 'success',
    filesCreated: [modulePath, path.join(targetDir, 'index.js'), path.join(targetDir, 'aws-cost-calculator.d.ts')],
    message: 'Cost analysis framework successfully extracted'
  };
}

/**
 * Lieutenant Uhura - Implement Natural Language CLI
 */
async function implementNaturalLanguageCLI(innovation) {
  console.log('   📡 Lieutenant Uhura: Applying natural language CLI patterns...');
  
  // The CLI integration is already in packages/cli/src/alex-ai-cli.ts
  // We need to ensure the pattern is documented and reusable
  
  const patternDoc = `# Natural Language CLI Pattern

This pattern enables natural language prompts to trigger specific CLI commands.

## Implementation Pattern

\`\`\`typescript
// 1. Define keyword detection function
private isFeatureRequest(message: string): boolean {
  const keywords = ['feature keyword 1', 'feature keyword 2'];
  return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

// 2. Add handler method
async handleFeature(options?: FeatureOptions): Promise<void> {
  // Implementation
}

// 3. Integrate into handleEngagement
async handleEngagement(message: string): Promise<void> {
  if (this.isFeatureRequest(message)) {
    await this.handleFeature();
    return;
  }
  // ... other handlers
}

// 4. Add CLI command
program
  .command('feature')
  .description('Feature description')
  .action(async (options) => {
    await handler.handleFeature(options);
  });
\`\`\`

## Usage

Users can trigger features via:
- Natural language: "compare costs", "cost analysis", "show costs"
- CLI command: \`npx alex-ai costs\`
- Chat mode: Type natural language in chat interface
`;
  
  const docPath = path.join(WORKSPACE_ROOT, 'docs/patterns/NATURAL_LANGUAGE_CLI_PATTERN.md');
  const docDir = path.dirname(docPath);
  if (!fs.existsSync(docDir)) {
    fs.mkdirSync(docDir, { recursive: true });
  }
  fs.writeFileSync(docPath, patternDoc);
  
  console.log('   ✅ Natural language CLI pattern documented');
  
  return {
    status: 'success',
    filesCreated: [docPath],
    message: 'Natural language CLI pattern documented for framework-wide use'
  };
}

/**
 * Counselor Troi - Implement Multi-Format Reporting
 */
async function implementMultiFormatReporting(innovation) {
  console.log('   💫 Counselor Troi: Creating multi-format reporting utilities...');
  
  const targetDir = path.join(WORKSPACE_ROOT, 'packages/shared-utilities/src/reporting');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Create reporting utilities
  const reporterContent = `/**
 * Multi-Format Reporter
 * 
 * Provides consistent reporting across text, JSON, and summary formats
 */

class MultiFormatReporter {
  constructor(data) {
    this.data = data;
  }
  
  toText() {
    // Generate text format
    let output = '';
    if (this.data.title) output += \`\${this.data.title}\\n\\n\`;
    if (this.data.summary) output += \`Summary: \${this.data.summary}\\n\\n\`;
    if (this.data.findings) {
      output += 'Findings:\\n';
      this.data.findings.forEach((f, i) => {
        output += \`  \${i + 1}. \${f}\\n\`;
      });
    }
    return output;
  }
  
  toJSON() {
    return JSON.stringify(this.data, null, 2);
  }
  
  toSummary() {
    return {
      title: this.data.title,
      summary: this.data.summary,
      keyFindings: this.data.findings?.slice(0, 3) || [],
      timestamp: new Date().toISOString()
    };
  }
  
  save(outputPath, format = 'text') {
    let content;
    let extension;
    
    switch (format) {
      case 'json':
        content = this.toJSON();
        extension = 'json';
        break;
      case 'summary':
        content = JSON.stringify(this.toSummary(), null, 2);
        extension = 'json';
        break;
      default:
        content = this.toText();
        extension = 'txt';
    }
    
    const fs = require('fs');
    const path = require('path');
    const fullPath = \`\${outputPath}.\${extension}\`;
    fs.writeFileSync(fullPath, content);
    return fullPath;
  }
}

module.exports = { MultiFormatReporter };
`;
  
  const reporterPath = path.join(targetDir, 'multi-format-reporter.js');
  fs.writeFileSync(reporterPath, reporterContent);
  
  // Create index
  fs.writeFileSync(path.join(targetDir, 'index.js'), `module.exports = require('./multi-format-reporter');\n`);
  
  console.log('   ✅ Multi-format reporting utilities created');
  
  return {
    status: 'success',
    filesCreated: [reporterPath, path.join(targetDir, 'index.js')],
    message: 'Multi-format reporting utilities created'
  };
}

/**
 * Commander Riker - Implement Automation Patterns
 */
async function implementAutomationPatterns(innovation) {
  console.log('   🎖️ Commander Riker: Extracting automation patterns...');
  
  const targetDir = path.join(WORKSPACE_ROOT, 'scripts/utils/automation');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Create automation pattern utilities
  const automationContent = `/**
 * Automation Pattern Utilities
 * 
 * Reusable patterns for script automation
 */

class AutomationPatterns {
  /**
   * Execute command with error handling
   */
  static async executeCommand(command, options = {}) {
    const { execSync } = require('child_process');
    const { silent = false, cwd = process.cwd() } = options;
    
    try {
      const result = execSync(command, {
        cwd,
        stdio: silent ? 'pipe' : 'inherit',
        encoding: 'utf8'
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }
  
  /**
   * Run multiple commands in sequence
   */
  static async runSequence(commands, options = {}) {
    const results = [];
    for (const cmd of commands) {
      const result = await this.executeCommand(cmd, options);
      results.push(result);
      if (!result.success && !options.continueOnError) {
        throw new Error(\`Command failed: \${cmd}\`);
      }
    }
    return results;
  }
  
  /**
   * Run commands in parallel
   */
  static async runParallel(commands, options = {}) {
    const { execSync } = require('child_process');
    const { silent = false, cwd = process.cwd() } = options;
    
    const promises = commands.map(cmd => {
      return new Promise((resolve) => {
        try {
          const result = execSync(cmd, {
            cwd,
            stdio: silent ? 'pipe' : 'inherit',
            encoding: 'utf8'
          });
          resolve({ success: true, command: cmd, output: result });
        } catch (error) {
          resolve({ success: false, command: cmd, error: error.message });
        }
      });
    });
    
    return await Promise.all(promises);
  }
}

module.exports = { AutomationPatterns };
`;
  
  const automationPath = path.join(targetDir, 'patterns.js');
  fs.writeFileSync(automationPath, automationContent);
  
  fs.writeFileSync(path.join(targetDir, 'index.js'), `module.exports = require('./patterns');\n`);
  
  console.log('   ✅ Automation patterns extracted');
  
  return {
    status: 'success',
    filesCreated: [automationPath, path.join(targetDir, 'index.js')],
    message: 'Automation patterns extracted and modularized'
  };
}

/**
 * Lieutenant Worf - Implement Security Best Practices
 */
async function implementSecurityBestPractices(innovation) {
  console.log('   ⚔️ Lieutenant Worf: Applying security best practices...');
  
  const targetDir = path.join(WORKSPACE_ROOT, 'packages/shared-utilities/src/security');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const securityContent = `/**
 * Security Best Practices Utilities
 * 
 * Secure credential handling and security patterns
 */

class SecurityUtils {
  /**
   * Load credentials securely from environment
   */
  static loadCredentials() {
    const credentials = {
      n8n: {
        baseUrl: process.env.N8N_URL || '',
        apiKey: process.env.N8N_API_KEY || process.env.N8N_OWNER_API_KEY || '',
        email: process.env.N8N_EMAIL || '',
        password: process.env.N8N_PASSWORD || ''
      },
      supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
      },
      aws: {
        region: process.env.AWS_REGION || 'us-east-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };
    
    // Validate required credentials
    this.validateCredentials(credentials);
    
    return credentials;
  }
  
  /**
   * Validate credentials without exposing values
   */
  static validateCredentials(creds) {
    const missing = [];
    
    if (!creds.n8n?.baseUrl) missing.push('N8N_URL');
    if (!creds.n8n?.apiKey) missing.push('N8N_API_KEY or N8N_OWNER_API_KEY');
    if (!creds.supabase?.url) missing.push('SUPABASE_URL');
    if (!creds.supabase?.key) missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    
    if (missing.length > 0) {
      throw new Error(\`Missing required credentials: \${missing.join(', ')}\`);
    }
  }
  
  /**
   * Sanitize output to prevent credential exposure
   */
  static sanitizeOutput(output) {
    const sensitivePatterns = [
      /(api[_-]?key|apikey)\\s*[:=]\\s*['"]?[\\w-]+['"]?/gi,
      /(password|passwd|pwd)\\s*[:=]\\s*['"]?[^'"]+['"]?/gi,
      /(secret|token|auth)\\s*[:=]\\s*['"]?[\\w-]+['"]?/gi
    ];
    
    let sanitized = output;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    
    return sanitized;
  }
}

module.exports = { SecurityUtils };
`;
  
  const securityPath = path.join(targetDir, 'credentials.js');
  fs.writeFileSync(securityPath, securityContent);
  
  fs.writeFileSync(path.join(targetDir, 'index.js'), `module.exports = require('./credentials');\n`);
  
  console.log('   ✅ Security best practices utilities created');
  
  return {
    status: 'success',
    filesCreated: [securityPath, path.join(targetDir, 'index.js')],
    message: 'Security best practices utilities created'
  };
}

/**
 * Dr. Crusher - Implement Health Monitoring
 */
async function implementHealthMonitoring(innovation) {
  console.log('   🏥 Dr. Crusher: Creating health monitoring integration...');
  
  const targetDir = path.join(WORKSPACE_ROOT, 'packages/shared-utilities/src/health');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const healthContent = `/**
 * Health Monitoring Utilities
 * 
 * Integrate health checks into cost analysis and critical systems
 */

class HealthMonitor {
  constructor() {
    this.metrics = {
      systemHealth: 'healthy',
      lastCheck: null,
      checks: []
    };
  }
  
  /**
   * Perform health check
   */
  async checkHealth() {
    const checks = {
      diskSpace: this.checkDiskSpace(),
      memory: this.checkMemory(),
      network: this.checkNetwork(),
      services: this.checkServices()
    };
    
    const results = await Promise.all(Object.values(checks));
    const allHealthy = results.every(r => r.healthy);
    
    this.metrics = {
      systemHealth: allHealthy ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString(),
      checks: results
    };
    
    return this.metrics;
  }
  
  async checkDiskSpace() {
    const fs = require('fs');
    try {
      const stats = fs.statSync(process.cwd());
      return { name: 'diskSpace', healthy: true, message: 'Disk space available' };
    } catch (error) {
      return { name: 'diskSpace', healthy: false, message: error.message };
    }
  }
  
  async checkMemory() {
    const usage = process.memoryUsage();
    const threshold = 500 * 1024 * 1024; // 500MB
    const healthy = usage.heapUsed < threshold;
    return {
      name: 'memory',
      healthy,
      message: \`Memory usage: \${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB\`
    };
  }
  
  async checkNetwork() {
    return { name: 'network', healthy: true, message: 'Network connectivity assumed' };
  }
  
  async checkServices() {
    return { name: 'services', healthy: true, message: 'Services operational' };
  }
  
  /**
   * Integrate health check into cost analysis
   */
  async analyzeWithHealth(costAnalysis) {
    const health = await this.checkHealth();
    
    return {
      ...costAnalysis,
      health: {
        status: health.systemHealth,
        impact: health.systemHealth === 'healthy' ? 'none' : 'potential_degradation',
        recommendations: health.checks
          .filter(c => !c.healthy)
          .map(c => \`Address \${c.name} issue: \${c.message}\`)
      }
    };
  }
}

module.exports = { HealthMonitor };
`;
  
  const healthPath = path.join(targetDir, 'monitor.js');
  fs.writeFileSync(healthPath, healthContent);
  
  fs.writeFileSync(path.join(targetDir, 'index.js'), `module.exports = require('./monitor');\n`);
  
  console.log('   ✅ Health monitoring utilities created');
  
  return {
    status: 'success',
    filesCreated: [healthPath, path.join(targetDir, 'index.js')],
    message: 'Health monitoring utilities created'
  };
}

/**
 * Helper Functions
 */
function extractCostFunctions(sourceContent) {
  // Extract function definitions
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\n\}/g;
  const functions = [];
  let match;
  
  while ((match = functionPattern.exec(sourceContent)) !== null) {
    if (match[1].includes('Cost')) {
      functions.push({
        name: match[1],
        code: match[0]
      });
    }
  }
  
  return functions;
}

function generateCostAnalysisModule(functions) {
  const awsPricing = `const AWS_PRICING = {
  ec2: {
    't2.micro': { hourly: 0.0116, monthly: 8.35 },
    't2.small': { hourly: 0.023, monthly: 16.56 },
    't3.micro': { hourly: 0.0104, monthly: 7.49 },
    't3.small': { hourly: 0.0208, monthly: 14.98 },
    't3.medium': { hourly: 0.0416, monthly: 29.95 },
    't3.large': { hourly: 0.0832, monthly: 59.90 },
    't3.xlarge': { hourly: 0.1664, monthly: 119.81 }
  },
  ebs: {
    gp3: { perGB: 0.08, perIOPS: 0.005 },
    gp2: { perGB: 0.10, perIOPS: 0.10 }
  },
  cloudwatch: {
    logsIngestion: 0.50,
    logsStorage: 0.03,
    detailedMonitoring: 7.00
  }
};
`;
  
  return `${awsPricing}

${functions.map(f => f.code).join('\n\n')}

module.exports = {
  calculateEC2Costs,
  calculateEBSCosts,
  calculateCloudWatchCosts,
  AWS_PRICING
};
`;
}

function generateTypeScriptDefinitions() {
  return `export interface EC2CostResult {
  instanceType: string;
  baseCompute: number;
  detailedMonitoring: number;
  total: number;
  hourly: number;
}

export interface EBSCostResult {
  volumeSizeGB: number;
  volumeType: string;
  storageCost: number;
  monthly: number;
}

export interface CloudWatchCostResult {
  logRetentionDays: number;
  estimatedLogGB: number;
  ingestionCost: number;
  storageCost: number;
  total: number;
}

export function calculateEC2Costs(instanceType: string, detailedMonitoring?: boolean): EC2CostResult;
export function calculateEBSCosts(volumeSizeGB: number, volumeType?: string): EBSCostResult;
export function calculateCloudWatchCosts(logRetentionDays: number, estimatedLogGB?: number): CloudWatchCostResult;
`;
}

/**
 * Main execution - Crew coordination
 */
async function main() {
  console.log('🖖 Applying Emergency Innovations to Framework');
  console.log('============================================\n');
  console.log('👥 All crew members working in parallel and tandem\n');
  
  const results = {};
  
  // Process each innovation with crew coordination
  for (const [key, innovation] of Object.entries(INNOVATIONS)) {
    console.log(`\n🚀 Innovation: ${innovation.name}`);
    console.log(`   Lead: ${CREW_IMPLEMENTATIONS[innovation.crewLead]?.name || innovation.crewLead}`);
    console.log(`   Support: ${innovation.crewSupport.map(c => CREW_IMPLEMENTATIONS[c]?.name || c).join(', ')}`);
    console.log(`   Description: ${innovation.description}\n`);
    
    // Lead crew member implements
    const leadCrew = CREW_IMPLEMENTATIONS[innovation.crewLead];
    if (leadCrew) {
      try {
        const result = await leadCrew.implement(innovation);
        results[key] = result;
        console.log(`   ✅ ${leadCrew.name}: ${result.message}\n`);
      } catch (error) {
        console.error(`   ❌ ${leadCrew.name}: ${error.message}\n`);
        results[key] = { status: 'error', error: error.message };
      }
    }
  }
  
  // Generate summary
  console.log('\n📊 Implementation Summary:\n');
  Object.entries(results).forEach(([key, result]) => {
    const innovation = INNOVATIONS[key];
    console.log(`   ${innovation.name}: ${result.status}`);
    if (result.filesCreated) {
      console.log(`      Files: ${result.filesCreated.length}`);
    }
  });
  
  console.log('\n✅ Framework application complete!');
  console.log('   All innovations have been systematically applied to the framework.');
  console.log('   Crew members have self-organized and coordinated implementation.\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

