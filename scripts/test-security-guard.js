#!/usr/bin/env node
/**
 * Test Security Memory Guard
 * 
 * Demonstrates the security system working with various test cases
 */

const SecurityMemoryGuard = require('./security-memory-guard');

async function testSecurityGuard() {
  const guard = new SecurityMemoryGuard();

  console.log('🔒 Testing Alex AI Security Memory Guard\n');

  // Test cases
  const testCases = [
    {
      name: 'Safe Content',
      content: 'This is safe content about React development and best practices',
      expected: 'SAFE'
    },
    {
      name: 'API Key (BLOCKED)',
      content: 'API_KEY=sk_test_1234567890abcdef',
      expected: 'BLOCKED'
    },
    {
      name: 'Database URL (BLOCKED)',
      content: 'Database URL: postgres://user:password@localhost:5432/db',
      expected: 'BLOCKED'
    },
    {
      name: 'Client Data with Learning (REDACTED)',
      content: 'Client: Acme Marketing Firm Inc. Revenue: $500,000, Profit: $100,000, Budget: $50,000',
      expected: 'REDACTED'
    },
    {
      name: 'Financial Data with Learning (REDACTED)',
      content: 'Tech startup revenue: $1,000,000 this quarter, ROI: 25%',
      expected: 'REDACTED'
    },
    {
      name: 'Business Strategy with Learning (REDACTED)',
      content: 'Client: XYZ Consulting LLC business plan includes growth strategy and market expansion',
      expected: 'REDACTED'
    },
    {
      name: 'Technical Content',
      content: 'Implemented user authentication with JWT tokens',
      expected: 'SAFE'
    },
    {
      name: 'Environment Variable (BLOCKED)',
      content: 'process.env.DATABASE_URL',
      expected: 'BLOCKED'
    },
    {
      name: 'Stripe Key (BLOCKED)',
      content: 'pk_test_1234567890abcdef',
      expected: 'BLOCKED'
    },
    {
      name: 'Complex Client Case (REDACTED)',
      content: 'Client: Digital Marketing Agency Inc. (contact@agency.com) - B2B SaaS company with revenue: $2M, profit: $400K, budget: $200K. Strategy includes market expansion and competitive positioning.',
      expected: 'REDACTED'
    }
  ];

  let passed = 0;
  let total = testCases.length;

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Content: ${testCase.content}`);
    
    const result = await guard.scanContent(testCase.content);
    let actual;
    if (result.blocked) {
      actual = 'BLOCKED';
    } else if (result.redactionApplied) {
      actual = 'REDACTED';
    } else {
      actual = 'SAFE';
    }
    const correct = actual === testCase.expected;
    
    console.log(`Result: ${correct ? '✅' : '❌'} ${actual}`);
    
    if (result.warnings.length > 0) {
      console.log('Warnings:', result.warnings.join(', '));
    }
    
    if (result.detectedPatterns.length > 0) {
      console.log('Detected Patterns:', result.detectedPatterns.join(', '));
    }

    if (result.learningData && (result.learningData.clientType || result.learningData.businessType || result.learningData.financialMetrics || result.learningData.strategyElements)) {
      console.log('Learning Data Extracted:');
      if (result.learningData.clientType) console.log(`  Client Type: ${result.learningData.clientType}`);
      if (result.learningData.businessType) console.log(`  Business Type: ${result.learningData.businessType}`);
      if (result.learningData.financialMetrics && Object.keys(result.learningData.financialMetrics).length > 0) {
        console.log(`  Financial Metrics: ${JSON.stringify(result.learningData.financialMetrics)}`);
      }
      if (result.learningData.strategyElements && result.learningData.strategyElements.length > 0) {
        console.log(`  Strategy Elements: ${result.learningData.strategyElements.join(', ')}`);
      }
    }

    if (result.redactionApplied) {
      console.log('Redacted Content:');
      console.log(result.sanitizedContent);
    }
    
    if (correct) passed++;
    console.log('---\n');
  }

  console.log(`🎯 Security Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All security tests passed! Alex AI is secure.');
  } else {
    console.log('❌ Some security tests failed. Review patterns.');
  }

  // Show security report
  console.log('\n📊 Security Report:');
  const report = guard.generateSecurityReport();
  console.log(JSON.stringify(report, null, 2));
}

// Run tests
testSecurityGuard().catch(console.error);
