#!/usr/bin/env node

/**
 * Verify Quark Workflow Changes
 * Checks if the Quark workflow changes are properly reflected in N8N
 */

const https = require('https');

class QuarkWorkflowVerifier {
  constructor() {
    this.loadZshrcEnv();
    this.n8nBaseUrl = process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1';
    this.apiKey = process.env.N8N_API_KEY;
    
    if (!this.apiKey) {
      console.error('❌ N8N_API_KEY not found in ~/.zshrc or environment variables');
      process.exit(1);
    }
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
        if (line.includes('export N8N_API_URL=')) {
          process.env.N8N_API_URL = line.split('=')[1].replace(/['"]/g, '');
        }
        if (line.includes('export N8N_API_KEY=')) {
          process.env.N8N_API_KEY = line.split('=')[1].replace(/['"]/g, '');
        }
      });
      
      console.log('✅ Environment variables loaded from ~/.zshrc');
    } catch (error) {
      console.error('❌ Failed to load ~/.zshrc:', error.message);
    }
  }

  /**
   * Get workflow details
   */
  async getWorkflowDetails() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/workflows/L6K4bzSKlGC36ABL',
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const workflow = JSON.parse(data);
            resolve(workflow);
          } catch (error) {
            reject(new Error(`Failed to parse workflow: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Verify workflow changes
   */
  async verifyChanges() {
    try {
      console.log('🔍 Verifying Quark workflow changes in N8N...\n');
      
      const workflow = await this.getWorkflowDetails();
      
      console.log(`📋 Workflow Name: ${workflow.name}`);
      console.log(`🆔 Workflow ID: ${workflow.id}`);
      console.log(`🔄 Active Status: ${workflow.active}`);
      console.log(`📊 Node Count: ${workflow.nodes ? workflow.nodes.length : 'Unknown'}`);
      
      // Check for expected nodes
      const expectedNodes = [
        'quark-directive-webhook',
        'business-context-analysis',
        'quark-memory-retrieval',
        'llm-optimization-quark',
        'quark-ai-agent-optimized',
        'quark-memory-storage-optimized',
        'observation-lounge-quark',
        'quark-response-optimized'
      ];
      
      console.log('\n📋 Node Verification:');
      if (workflow.nodes) {
        const nodeIds = workflow.nodes.map(node => node.id);
        
        expectedNodes.forEach(expectedId => {
          if (nodeIds.includes(expectedId)) {
            console.log(`   ✅ ${expectedId}`);
          } else {
            console.log(`   ❌ ${expectedId} - MISSING`);
          }
        });
        
        // Check for unexpected nodes
        const unexpectedNodes = nodeIds.filter(id => !expectedNodes.includes(id));
        if (unexpectedNodes.length > 0) {
          console.log('\n⚠️  Unexpected nodes found:');
          unexpectedNodes.forEach(id => console.log(`   ${id}`));
        }
      }
      
      // Check connections
      console.log('\n🔗 Connection Verification:');
      if (workflow.connections) {
        const connectionCount = Object.keys(workflow.connections).length;
        console.log(`   Connection Count: ${connectionCount}`);
        
        // Check for expected connections
        const expectedConnections = [
          'quark-directive-webhook',
          'business-context-analysis',
          'llm-optimization-quark',
          'quark-ai-agent-optimized',
          'quark-memory-storage-optimized',
          'observation-lounge-quark'
        ];
        
        expectedConnections.forEach(sourceNode => {
          if (workflow.connections[sourceNode]) {
            console.log(`   ✅ ${sourceNode} has connections`);
          } else {
            console.log(`   ❌ ${sourceNode} - NO CONNECTIONS`);
          }
        });
      }
      
      // Check for OpenRouter integration
      console.log('\n🤖 OpenRouter Integration Check:');
      if (workflow.nodes) {
        const openRouterNodes = workflow.nodes.filter(node => 
          node.type === 'n8n-nodes-base.httpRequest' && 
          node.parameters && 
          node.parameters.url && 
          node.parameters.url.includes('openrouter.ai')
        );
        
        console.log(`   OpenRouter API Nodes: ${openRouterNodes.length}`);
        openRouterNodes.forEach(node => {
          console.log(`   ✅ ${node.name} - ${node.parameters.url}`);
        });
      }
      
      // Check for new function nodes
      console.log('\n⚙️  Function Nodes Check:');
      if (workflow.nodes) {
        const functionNodes = workflow.nodes.filter(node => 
          node.type === 'n8n-nodes-base.function'
        );
        
        console.log(`   Function Nodes: ${functionNodes.length}`);
        functionNodes.forEach(node => {
          console.log(`   ✅ ${node.name} (${node.id})`);
        });
      }
      
      // Summary
      console.log('\n🎯 Verification Summary:');
      const nodeCount = workflow.nodes ? workflow.nodes.length : 0;
      const connectionCount = workflow.connections ? Object.keys(workflow.connections).length : 0;
      
      if (nodeCount === 8) {
        console.log('   ✅ Correct node count (8 nodes)');
      } else {
        console.log(`   ❌ Incorrect node count: ${nodeCount} (expected 8)`);
      }
      
      if (connectionCount >= 6) {
        console.log('   ✅ Sufficient connections');
      } else {
        console.log(`   ❌ Insufficient connections: ${connectionCount} (expected 6+)`);
      }
      
      if (workflow.active) {
        console.log('   ✅ Workflow is active');
      } else {
        console.log('   ❌ Workflow is not active');
      }
      
      // Check if this looks like the optimized version
      const hasBusinessAnalysis = workflow.nodes && workflow.nodes.some(node => 
        node.id === 'business-context-analysis'
      );
      const hasLLMOptimization = workflow.nodes && workflow.nodes.some(node => 
        node.id === 'llm-optimization-quark'
      );
      
      if (hasBusinessAnalysis && hasLLMOptimization) {
        console.log('   ✅ OpenRouter optimization detected');
        console.log('\n🎉 SUCCESS: Quark workflow changes are properly reflected in N8N!');
        console.log('🖖 The workflow is ready for complete query unification from Alex AI to N8N!');
      } else {
        console.log('   ❌ OpenRouter optimization not detected');
        console.log('\n⚠️  The workflow may not have been updated properly.');
        console.log('💡 Try running: node scripts/update-quark-workflow.js');
      }
      
    } catch (error) {
      console.error('❌ Failed to verify workflow changes:', error.message);
      
      if (error.message.includes('unauthorized')) {
        console.log('\n💡 Authentication issue detected.');
        console.log('🔧 Please check your N8N_API_KEY in ~/.zshrc');
      }
    }
  }
}

// Main execution
async function main() {
  const verifier = new QuarkWorkflowVerifier();
  await verifier.verifyChanges();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = QuarkWorkflowVerifier;
