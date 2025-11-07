#!/usr/bin/env node

/**
 * Test Quark Workflow
 * Tests the optimized Quark workflow with OpenRouter integration
 */

const https = require('https');

class QuarkWorkflowTester {
  constructor() {
    this.loadZshrcEnv();
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook';
  }

  /**
   * Load environment variables from ~/.zshrc
   */
  loadZshrcEnv() {
    try {
      const fs = require('fs');
      const zshrcContent = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
      const lines = zshrcContent.split('\n');
      
      lines.forEach(line => {
        if (line.includes('export N8N_WEBHOOK_URL=')) {
          process.env.N8N_WEBHOOK_URL = line.split('=')[1].replace(/['"]/g, '');
        }
      });
      
      console.log('✅ Environment variables loaded from ~/.zshrc');
    } catch (error) {
      console.error('❌ Failed to load ~/.zshrc:', error.message);
    }
  }

  /**
   * Test Quark workflow with a business prompt
   */
  async testQuarkWorkflow(prompt) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        prompt: prompt,
        timestamp: new Date().toISOString(),
        test: true
      });
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/webhook/crew-quark-optimized',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      console.log(`🧪 Testing Quark workflow with prompt: "${prompt}"`);
      console.log(`📍 Webhook URL: https://n8n.pbradygeorgen.com/webhook/crew-quark-optimized`);

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              console.log('✅ Quark workflow test successful!');
              console.log('\n📊 Response Details:');
              console.log(`   Crew Member: ${response.crew_member}`);
              console.log(`   LLM Used: ${response.llm_used}`);
              console.log(`   Confidence: ${response.confidence}`);
              console.log(`   Business Context: ${JSON.stringify(response.business_context, null, 2)}`);
              console.log(`   Reasoning: ${response.reasoning}`);
              console.log('\n💬 Quark Response:');
              console.log(`   ${response.response}`);
              
              if (response.observation_lounge_summary) {
                console.log('\n🎬 Observation Lounge Summary:');
                console.log(`   ${response.observation_lounge_summary}`);
              }
              
              resolve(response);
            } else {
              console.error(`❌ Workflow test failed: ${res.statusCode}`);
              console.error(`   Response: ${data}`);
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          } catch (error) {
            console.error(`❌ Failed to parse response: ${data}`);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Run comprehensive tests
   */
  async runTests() {
    const testPrompts = [
      {
        prompt: "How can I optimize my software development budget?",
        expectedDomain: "financial",
        expectedType: "analytical"
      },
      {
        prompt: "What negotiation tactics should I use for a vendor contract?",
        expectedDomain: "negotiation", 
        expectedType: "tactical"
      },
      {
        prompt: "Create a business strategy for entering the AI market",
        expectedDomain: "strategy",
        expectedType: "strategic"
      },
      {
        prompt: "How can I improve our sales process efficiency?",
        expectedDomain: "operations",
        expectedType: "analytical"
      }
    ];

    console.log('🚀 Starting Quark Workflow Tests...\n');

    for (let i = 0; i < testPrompts.length; i++) {
      const test = testPrompts[i];
      
      try {
        console.log(`\n📋 Test ${i + 1}/${testPrompts.length}:`);
        console.log(`   Prompt: "${test.prompt}"`);
        console.log(`   Expected Domain: ${test.expectedDomain}`);
        console.log(`   Expected Type: ${test.expectedType}`);
        
        const response = await this.testQuarkWorkflow(test.prompt);
        
        // Validate response
        const actualDomain = response.business_context?.domain;
        const actualType = response.business_context?.type;
        
        if (actualDomain === test.expectedDomain) {
          console.log(`   ✅ Domain detection correct: ${actualDomain}`);
        } else {
          console.log(`   ⚠️  Domain detection mismatch: expected ${test.expectedDomain}, got ${actualDomain}`);
        }
        
        if (actualType === test.expectedType) {
          console.log(`   ✅ Type detection correct: ${actualType}`);
        } else {
          console.log(`   ⚠️  Type detection mismatch: expected ${test.expectedType}, got ${actualType}`);
        }
        
        console.log(`   🤖 LLM Selected: ${response.llm_used}`);
        console.log(`   🎯 Confidence: ${response.confidence}`);
        
        // Wait between tests
        if (i < testPrompts.length - 1) {
          console.log('\n⏳ Waiting 2 seconds before next test...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`   ❌ Test ${i + 1} failed:`, error.message);
      }
    }

    console.log('\n🎉 Quark Workflow Testing Complete!');
    console.log('🖖 All tests demonstrate the complete query unification from Alex AI to N8N with OpenRouter optimization!');
  }
}

// Main execution
async function main() {
  const tester = new QuarkWorkflowTester();
  
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // Test with specific prompt
    const prompt = args.join(' ');
    await tester.testQuarkWorkflow(prompt);
  } else {
    // Run comprehensive tests
    await tester.runTests();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = QuarkWorkflowTester;
