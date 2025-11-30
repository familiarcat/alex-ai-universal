#!/usr/bin/env node
/**
 * Run Alex AI Universal Litmus Tests
 * 
 * Executes all litmus tests and generates comprehensive reports.
 * Tests are stored in memory and associated with functional roles.
 */

const fs = require('fs');
const path = require('path');
const { LitmusTest } = require('./alex-ai-litmus-test');

// Load test definitions
function loadTestDefinitions() {
  const definitionsPath = path.join(__dirname, 'litmus-test-definitions.json');
  const definitions = JSON.parse(fs.readFileSync(definitionsPath, 'utf8'));
  return definitions.tests.map(testDef => new LitmusTest(testDef));
}

// Generate test report
function generateReport(results, outputPath) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    errors: results.filter(r => r.status === 'error').length,
    results: results,
    summary: {
      memoryVerification: {
        total: results.length,
        verified: results.filter(r => r.memoryVerified).length,
        failed: results.filter(r => !r.memoryVerified).length
      },
      functionalRoleVerification: {
        total: results.length,
        verified: results.filter(r => r.functionalRoleVerified).length,
        failed: results.filter(r => !r.functionalRoleVerified).length
      }
    }
  };

  // Write JSON report
  fs.writeFileSync(outputPath + '.json', JSON.stringify(report, null, 2));

  // Write human-readable report
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(outputPath + '.md', markdown);

  return report;
}

// Generate markdown report
function generateMarkdownReport(report) {
  let md = `# Alex AI Universal Litmus Test Report\n\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  md += `## Summary\n\n`;
  md += `- **Total Tests:** ${report.totalTests}\n`;
  md += `- **Passed:** ${report.passed} ✅\n`;
  md += `- **Failed:** ${report.failed} ❌\n`;
  md += `- **Errors:** ${report.errors} ⚠️\n\n`;

  md += `## Memory Verification\n\n`;
  md += `- **Verified:** ${report.summary.memoryVerification.verified}/${report.summary.memoryVerification.total}\n`;
  md += `- **Failed:** ${report.summary.memoryVerification.failed}\n\n`;

  md += `## Functional Role Verification\n\n`;
  md += `- **Verified:** ${report.summary.functionalRoleVerification.verified}/${report.summary.functionalRoleVerification.total}\n`;
  md += `- **Failed:** ${report.summary.functionalRoleVerification.failed}\n\n`;

  md += `## Test Results\n\n`;

  report.results.forEach((result, index) => {
    const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    md += `### ${index + 1}. ${result.testName} ${statusIcon}\n\n`;
    md += `- **Status:** ${result.status.toUpperCase()}\n`;
    md += `- **Test ID:** ${result.testId}\n`;
    md += `- **Memory Verified:** ${result.memoryVerified ? 'Yes' : 'No'}\n`;
    md += `- **Functional Role Verified:** ${result.functionalRoleVerified ? 'Yes' : 'No'}\n\n`;

    if (result.steps.length > 0) {
      md += `#### Steps:\n\n`;
      result.steps.forEach((step, stepIndex) => {
        const stepIcon = step.status === 'passed' ? '✅' : '❌';
        md += `${stepIndex + 1}. ${step.stepName} ${stepIcon}\n`;
        if (step.error) {
          md += `   - Error: ${step.error}\n`;
        }
      });
      md += `\n`;
    }

    if (result.errors.length > 0) {
      md += `#### Errors:\n\n`;
      result.errors.forEach(error => {
        md += `- ${error}\n`;
      });
      md += `\n`;
    }
  });

  return md;
}

// Main execution
async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🧪 ALEX AI UNIVERSAL LITMUS TEST HARNESS');
  console.log('═'.repeat(80));
  console.log('\n📋 Loading test definitions...\n');

  const tests = loadTestDefinitions();
  console.log(`✅ Loaded ${tests.length} litmus test(s)\n`);

  console.log('🚀 Executing tests...\n');
  console.log('═'.repeat(80) + '\n');

  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n[${i + 1}/${tests.length}] ${test.name}`);
    console.log('─'.repeat(80));
    
    const result = await test.execute();
    results.push(result);

    // Brief pause between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 GENERATING TEST REPORT');
  console.log('═'.repeat(80) + '\n');

  const reportsDir = path.join(process.cwd(), 'docs', 'testing');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportsDir, `litmus-test-report-${timestamp}`);

  const report = generateReport(results, reportPath);

  console.log(`✅ Test report generated:`);
  console.log(`   JSON: ${reportPath}.json`);
  console.log(`   Markdown: ${reportPath}.md\n`);

  console.log('═'.repeat(80));
  console.log('📈 TEST SUMMARY');
  console.log('═'.repeat(80));
  console.log(`\n📋 Total Tests: ${report.totalTests}`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`⚠️  Errors: ${report.errors}`);
  console.log(`\n💾 Memory Verification: ${report.summary.memoryVerification.verified}/${report.summary.memoryVerification.total}`);
  console.log(`🏷️  Functional Role Verification: ${report.summary.functionalRoleVerification.verified}/${report.summary.functionalRoleVerification.total}\n`);

  // Store test execution in memory
  console.log('💾 Storing test execution in memory...\n');
  await storeTestExecutionMemory(report);

  // Exit with appropriate code
  const exitCode = report.failed > 0 || report.errors > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Store test execution in memory
async function storeTestExecutionMemory(report) {
  const https = require('https');
  const { loadCrewCredentials } = require('../utils/load-crew-credentials');
  const creds = loadCrewCredentials();
  const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';

  const memoryPayload = {
    title: `Litmus Test Execution Report - ${new Date().toISOString().split('T')[0]}`,
    summary: `Executed ${report.totalTests} litmus tests: ${report.passed} passed, ${report.failed} failed`,
    detailedAnalysis: JSON.stringify({
      totalTests: report.totalTests,
      passed: report.passed,
      failed: report.failed,
      errors: report.errors,
      memoryVerification: report.summary.memoryVerification,
      functionalRoleVerification: report.summary.functionalRoleVerification,
      results: report.results.map(r => ({
        testId: r.testId,
        testName: r.testName,
        status: r.status,
        memoryVerified: r.memoryVerified,
        functionalRoleVerified: r.functionalRoleVerified
      }))
    }, null, 2),
    crewMember: 'data',
    knowledgeType: 'testing',
    priority: 'high',
    tags: ['litmus-test', 'testing', 'end-to-end', 'test-harness', 'system-validation'],
    sessionId: `litmus-execution-${Date.now()}`,
    platform: 'test-harness',
    timestamp: new Date().toISOString(),
    vectorOptimization: {
      enabled: true,
      fragmentationEnabled: true,
      deduplicationEnabled: true
    }
  };

  return new Promise((resolve) => {
    const url = new URL(`${N8N_BASE_URL}/webhook/crew-memory-storage`);
    const data = JSON.stringify(memoryPayload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Test execution stored in memory');
        } else {
          console.log('⚠️  Failed to store test execution in memory');
        }
        resolve();
      });
    });

    req.on('error', () => {
      console.log('⚠️  Failed to store test execution in memory (network error)');
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('⚠️  Failed to store test execution in memory (timeout)');
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  });
}

module.exports = { main, loadTestDefinitions, generateReport };

