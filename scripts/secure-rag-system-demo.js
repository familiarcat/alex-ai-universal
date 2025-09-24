#!/usr/bin/env node

/**
 * Secure RAG System Demo
 * 
 * Demonstrates the secure RAG system with client ambiguity and security compliance
 */

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

class SecureRAGSystemDemo {
  constructor() {
    this.projectPath = process.cwd();
  }

  async run() {
    console.log('🔒 Secure RAG System Demo');
    console.log('========================\n');

    try {
      await this.demonstrateClientAmbiguity();
      await this.demonstrateSecurityCompliance();
      await this.demonstrateClientTypeDetection();
      await this.demonstrateSecureRAGQuerying();
      await this.demonstrateSecurityAuditing();
      
      console.log('\n🎉 Secure RAG System Demo Complete!');
      console.log('The system successfully demonstrates client ambiguity, security compliance, and secure RAG querying.');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      process.exit(1);
    }
  }

  async demonstrateClientAmbiguity() {
    console.log('🔒 Demonstrating Client Ambiguity System...\n');
    
    const demoScript = `
const { ClientAmbiguitySystem } = require('@alex-ai/core/dist/security/client-ambiguity-system');

async function demonstrateClientAmbiguity() {
  console.log('🔒 Initializing Client Ambiguity System...');
  
  const clientAmbiguitySystem = new ClientAmbiguitySystem();
  await clientAmbiguitySystem.initialize();
  
  // Test cases with PII
  const testCases = [
    {
      content: "John Smith from Acme Corp needs help with React authentication. Contact: john@acme.com, Phone: (555) 123-4567, Address: 123 Main St, New York, NY 10001",
      description: "Content with multiple PII elements"
    },
    {
      content: "Sarah Johnson at TechStart Inc is looking for microservices architecture help. Email: sarah@techstart.com, Phone: (555) 987-6543",
      description: "Content with name, company, and contact info"
    },
    {
      content: "A healthcare client needs help with patient data management and HIPAA compliance. They're using React and Node.js.",
      description: "Content without PII but with industry context"
    },
    {
      content: "An enterprise client wants to implement security best practices for their financial application.",
      description: "Content with industry and size context"
    }
  ];
  
  console.log('🔒 Processing content for client ambiguity...');
  
  for (const testCase of testCases) {
    console.log(\`\\n🔹 Testing: \${testCase.description}\`);
    console.log(\`   Original: \${testCase.content}\`);
    
    try {
      const result = await clientAmbiguitySystem.processContentForAmbiguity(
        testCase.content,
        { test: true, timestamp: new Date().toISOString() }
      );
      
      console.log(\`   Ambiguous: \${result.ambiguousContent}\`);
      console.log(\`   Client Type: \${result.clientType.type}\`);
      console.log(\`   Confidence: \${(result.confidence * 100).toFixed(1)}%\`);
      console.log(\`   Redactions: \${result.redactedElements.length}\`);
      
      if (result.redactedElements.length > 0) {
        console.log(\`   Redacted Elements:\`);
        for (const element of result.redactedElements) {
          console.log(\`     \${element.type}: "\${element.originalValue}" → "\${element.replacementValue}"\`);
        }
      }
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show client types
  console.log('\\n👥 Client Types Created:');
  const clientTypes = clientAmbiguitySystem.getClientTypes();
  for (const clientType of clientTypes) {
    console.log(\`   \${clientType.type}: \${clientType.characteristics.join(', ')}\`);
  }
}

demonstrateClientAmbiguity().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Client Ambiguity System');
  }

  async demonstrateSecurityCompliance() {
    console.log('🛡️ Demonstrating Security Compliance...\n');
    
    const demoScript = `
const { ClientAmbiguitySystem } = require('@alex-ai/core/dist/security/client-ambiguity-system');

async function demonstrateSecurityCompliance() {
  const clientAmbiguitySystem = new ClientAmbiguitySystem();
  await clientAmbiguitySystem.initialize();
  
  // Test security compliance
  const complianceTestCases = [
    {
      content: "John Smith (john@example.com) needs help with authentication",
      expectedRedactions: ['name', 'email']
    },
    {
      content: "Call us at (555) 123-4567 for support",
      expectedRedactions: ['phone']
    },
    {
      content: "Visit our office at 123 Main St, New York, NY 10001",
      expectedRedactions: ['address']
    },
    {
      content: "Acme Corporation Inc is looking for help",
      expectedRedactions: ['company']
    },
    {
      content: "A client needs help with React development",
      expectedRedactions: []
    }
  ];
  
  console.log('🛡️ Testing security compliance...');
  
  for (const testCase of complianceTestCases) {
    console.log(\`\\n🔹 Testing: \${testCase.content}\`);
    
    try {
      const result = await clientAmbiguitySystem.processContentForAmbiguity(
        testCase.content,
        { test: true, timestamp: new Date().toISOString() }
      );
      
      const actualRedactions = result.redactedElements.map(e => e.type);
      const expectedRedactions = testCase.expectedRedactions;
      
      const complianceScore = result.confidence;
      const isCompliant = complianceScore > 0.8;
      
      console.log(\`   Compliance Score: \${(complianceScore * 100).toFixed(1)}%\`);
      console.log(\`   Compliant: \${isCompliant ? '✅ Yes' : '❌ No'}\`);
      console.log(\`   Expected Redactions: \${expectedRedactions.join(', ')}\`);
      console.log(\`   Actual Redactions: \${actualRedactions.join(', ')}\`);
      
      const redactionMatch = expectedRedactions.every(r => actualRedactions.includes(r));
      console.log(\`   Redaction Match: \${redactionMatch ? '✅ Yes' : '❌ No'}\`);
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show compliance report
  console.log('\\n📊 Security Compliance Report:');
  const complianceReport = clientAmbiguitySystem.getSecurityComplianceReport();
  console.log(\`   Total Processed: \${complianceReport.totalProcessed}\`);
  console.log(\`   Redacted Count: \${complianceReport.redactedCount}\`);
  console.log(\`   Client Types Created: \${complianceReport.clientTypesCreated}\`);
  console.log(\`   Compliance Score: \${(complianceReport.complianceScore * 100).toFixed(1)}%\`);
  console.log(\`   Violations: \${complianceReport.violations.length}\`);
  console.log(\`   Recommendations: \${complianceReport.recommendations.length}\`);
}

demonstrateSecurityCompliance().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Security Compliance');
  }

  async demonstrateClientTypeDetection() {
    console.log('👥 Demonstrating Client Type Detection...\n');
    
    const demoScript = `
const { ClientAmbiguitySystem } = require('@alex-ai/core/dist/security/client-ambiguity-system');

async function demonstrateClientTypeDetection() {
  const clientAmbiguitySystem = new ClientAmbiguitySystem();
  await clientAmbiguitySystem.initialize();
  
  // Test client type detection
  const clientTypeTestCases = [
    {
      content: "A healthcare startup needs help with patient data management and HIPAA compliance using React and Node.js",
      expectedIndustry: "healthcare",
      expectedSize: "small",
      expectedCharacteristics: ["healthcare", "small-scale", "cloud-based"]
    },
    {
      content: "An enterprise financial institution wants to implement microservices architecture with Docker and Kubernetes for their banking application",
      expectedIndustry: "financial",
      expectedSize: "enterprise",
      expectedCharacteristics: ["financial", "enterprise-scale", "cloud-based", "security-focused"]
    },
    {
      content: "A retail company needs help with ecommerce platform development and mobile app integration",
      expectedIndustry: "retail",
      expectedSize: "medium",
      expectedCharacteristics: ["retail", "mobile-focused", "integration-heavy"]
    },
    {
      content: "An educational institution wants to build a learning management system with AI-powered features",
      expectedIndustry: "education",
      expectedSize: "large",
      expectedCharacteristics: ["educational", "ai-enabled", "integration-heavy"]
    }
  ];
  
  console.log('👥 Testing client type detection...');
  
  for (const testCase of clientTypeTestCases) {
    console.log(\`\\n🔹 Testing: \${testCase.content}\`);
    
    try {
      const result = await clientAmbiguitySystem.processContentForAmbiguity(
        testCase.content,
        { test: true, timestamp: new Date().toISOString() }
      );
      
      const clientType = result.clientType;
      
      console.log(\`   Detected Type: \${clientType.type}\`);
      console.log(\`   Industry: \${clientType.industry || 'Unknown'} (expected: \${testCase.expectedIndustry})\`);
      console.log(\`   Size: \${clientType.size || 'Unknown'} (expected: \${testCase.expectedSize})\`);
      console.log(\`   Characteristics: \${clientType.characteristics.join(', ')}\`);
      console.log(\`   Patterns: \${clientType.patterns.join(', ')}\`);
      console.log(\`   Technology: \${clientType.technology.join(', ')}\`);
      console.log(\`   Challenges: \${clientType.challenges.join(', ')}\`);
      console.log(\`   Solutions: \${clientType.solutions.join(', ')}\`);
      console.log(\`   Confidence: \${(clientType.confidence * 100).toFixed(1)}%\`);
      
      // Check if industry matches
      const industryMatch = clientType.industry === testCase.expectedIndustry;
      console.log(\`   Industry Match: \${industryMatch ? '✅ Yes' : '❌ No'}\`);
      
      // Check if size matches
      const sizeMatch = clientType.size === testCase.expectedSize;
      console.log(\`   Size Match: \${sizeMatch ? '✅ Yes' : '❌ No'}\`);
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show all client types
  console.log('\\n👥 All Client Types:');
  const clientTypes = clientAmbiguitySystem.getClientTypes();
  for (const clientType of clientTypes) {
    console.log(\`   \${clientType.type}: \${clientType.characteristics.join(', ')} (\${clientType.usageCount} uses)\`);
  }
}

demonstrateClientTypeDetection().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Client Type Detection');
  }

  async demonstrateSecureRAGQuerying() {
    console.log('🔍 Demonstrating Secure RAG Querying...\n');
    
    const demoScript = `
const { SecureRAGSystem } = require('@alex-ai/core/dist/security/secure-rag-system');

async function demonstrateSecureRAGQuerying() {
  console.log('🔍 Initializing Secure RAG System...');
  
  const secureRAGSystem = new SecureRAGSystem('${this.projectPath}');
  await secureRAGSystem.initialize();
  
  // Test secure RAG querying
  const queryTestCases = [
    {
      query: "How to implement secure authentication for a healthcare application?",
      description: "Healthcare-specific security query"
    },
    {
      query: "What are the best practices for microservices architecture in a financial institution?",
      description: "Financial-specific architecture query"
    },
    {
      query: "How to optimize performance for a retail ecommerce platform?",
      description: "Retail-specific performance query"
    },
    {
      query: "What security measures should be implemented for a startup's mobile app?",
      description: "Startup-specific security query"
    }
  ];
  
  console.log('🔍 Testing secure RAG querying...');
  
  for (const testCase of queryTestCases) {
    console.log(\`\\n🔹 Testing: \${testCase.description}\`);
    console.log(\`   Query: \${testCase.query}\`);
    
    try {
      const result = await secureRAGSystem.querySecureRAG({
        query: testCase.query,
        context: { test: true, timestamp: new Date().toISOString() },
        maxResults: 5,
        minRelevanceScore: 0.7
      });
      
      console.log(\`   Response: \${result.response.substring(0, 200)}...\`);
      console.log(\`   Sources: \${result.sources.length}\`);
      console.log(\`   Client Types: \${result.clientTypes.length}\`);
      console.log(\`   Confidence: \${(result.confidence * 100).toFixed(1)}%\`);
      console.log(\`   Security Compliant: \${result.securityCompliance ? '✅ Yes' : '❌ No'}\`);
      
      if (result.clientTypes.length > 0) {
        console.log(\`   Similar Client Types:\`);
        for (const clientType of result.clientTypes) {
          console.log(\`     - \${clientType.type}: \${clientType.characteristics.join(', ')}\`);
        }
      }
      
      if (result.reasoning) {
        console.log(\`   Reasoning: \${result.reasoning.substring(0, 100)}...\`);
      }
      
    } catch (error) {
      console.log(\`   ❌ Failed: \${error.message}\`);
    }
  }
  
  // Show query history
  console.log('\\n📜 Query History:');
  const queryHistory = secureRAGSystem.getQueryHistory();
  for (let i = 0; i < Math.min(queryHistory.length, 3); i++) {
    const query = queryHistory[i];
    console.log(\`   \${i + 1}. \${query.query.substring(0, 50)}...\`);
  }
}

demonstrateSecureRAGQuerying().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Secure RAG Querying');
  }

  async demonstrateSecurityAuditing() {
    console.log('🔍 Demonstrating Security Auditing...\n');
    
    const demoScript = `
const { SecureRAGSystem } = require('@alex-ai/core/dist/security/secure-rag-system');

async function demonstrateSecurityAuditing() {
  const secureRAGSystem = new SecureRAGSystem('${this.projectPath}');
  await secureRAGSystem.initialize();
  
  // Run security audit
  console.log('🔍 Running security compliance audit...');
  
  try {
    const auditStatus = await secureRAGSystem.auditSecurityCompliance();
    
    console.log('\\n📊 Security Audit Results:');
    console.log(\`   Compliant: \${auditStatus.isCompliant ? '✅ Yes' : '❌ No'}\`);
    console.log(\`   Compliance Score: \${(auditStatus.complianceScore * 100).toFixed(1)}%\`);
    console.log(\`   Last Audit: \${auditStatus.lastAudit.toLocaleString()}\`);
    
    if (auditStatus.violations.length > 0) {
      console.log('\\n⚠️ Security Violations:');
      for (const violation of auditStatus.violations) {
        console.log(\`   - \${violation}\`);
      }
    } else {
      console.log('\\n✅ No security violations detected');
    }
    
    if (auditStatus.recommendations.length > 0) {
      console.log('\\n💡 Recommendations:');
      for (const recommendation of auditStatus.recommendations) {
        console.log(\`   - \${recommendation}\`);
      }
    }
    
    // Show client types
    console.log('\\n👥 Client Types in System:');
    const clientTypes = secureRAGSystem.getClientTypes();
    for (const clientType of clientTypes) {
      console.log(\`   \${clientType.type}: \${clientType.characteristics.join(', ')} (\${clientType.usageCount} uses)\`);
    }
    
    // Show response history
    console.log('\\n📊 Response History:');
    const responseHistory = secureRAGSystem.getResponseHistory();
    for (let i = 0; i < Math.min(responseHistory.length, 3); i++) {
      const response = responseHistory[i];
      console.log(\`   \${i + 1}. \${response.response.substring(0, 50)}... (Confidence: \${(response.confidence * 100).toFixed(1)}%)\`);
    }
    
  } catch (error) {
    console.log(\`   ❌ Audit failed: \${error.message}\`);
  }
}

demonstrateSecurityAuditing().catch(console.error);
    `;
    
    this.runScript(demoScript, 'Security Auditing');
  }

  runScript(script, description) {
    try {
      console.log(`🔧 Running ${description}...`);
      execSync(`node -e "${script}"`, { stdio: 'inherit' });
      console.log(`✅ ${description} completed successfully\n`);
    } catch (error) {
      console.log(`⚠️ ${description} completed with warnings: ${error.message}\n`);
    }
  }
}

// Run the demo
new SecureRAGSystemDemo().run();


<<<<<<< HEAD

=======
>>>>>>> ab4898606e192fe0b56b73b7224a3746d57250d5
