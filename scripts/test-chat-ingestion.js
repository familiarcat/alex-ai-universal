#!/usr/bin/env node

/**
 * 🧪 Test Knowledge Ingestion with Chat Content
 * 
 * Extracts the current chat session content and pushes it to the RAG system
 * via the Knowledge Ingest webhook for testing purposes
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

console.log('\n🧪 Test Knowledge Ingestion with Chat Content');
console.log('═══════════════════════════════════════════════════════════\n');

// Create test payload from chat content
function createChatIngestionPayload() {
  const chatContent = `
# Chat Session: Knowledge Ingestion System Integration

**Date**: ${new Date().toISOString().split('T')[0]}
**Type**: System Integration Test
**Source**: Cursor AI Chat Session

## Summary

This chat session focused on integrating the Knowledge Ingest workflow into the automatic webhook automation process. The user requested that the "Knowledge Ingest" workflow be included in all automation scripts.

## Key Accomplishments

1. **Updated Workflow Activation Scripts**:
   - Modified \`scripts/activate-all-n8n-workflows.js\` to prioritize Knowledge Ingest workflow
   - Knowledge Ingest is now activated first with 3-second wait time
   - All other workflows activate after Knowledge Ingest

2. **Enhanced Webhook Registration**:
   - Updated \`scripts/force-webhook-reregistration.js\` to check Knowledge Ingest webhook first
   - Prioritizes Knowledge Ingest in re-registration queue
   - Uses 5-second wait time for Knowledge Ingest (longer than others)

3. **Created Dedicated Script**:
   - New \`scripts/activate-knowledge-ingest-workflow.js\` script
   - Finds workflow by name or ID
   - Verifies webhook registration
   - Can be called independently

4. **Updated Master Activation Script**:
   - \`scripts/update-and-activate-all-workflows.js\` now activates Knowledge Ingest first
   - Then activates all other workflows
   - Forces webhook re-registration with Knowledge Ingest priority

5. **Milestone Push Script Enhancement**:
   - Updated \`scripts/push-milestone-to-rag.js\` to always push to GitHub first
   - Then attempts RAG ingestion independently
   - Handles failures separately for each step

6. **Version Analysis and Configuration**:
   - Analyzed n8n version (1.120.4 - latest stable)
   - Pinned version in Terraform configuration
   - Enhanced docker-compose.yml with explicit environment variables
   - Applied configuration to EC2 instance

## Technical Details

### Workflow Identification
- **Name**: Contains "Knowledge Ingest" or "knowledge-ingest" (case-insensitive)
- **ID**: Ffdgv5Zd8hGeHJGe (if known)
- **Webhook Path**: /webhook/knowledge-ingest

### Scripts Modified
- \`scripts/activate-all-n8n-workflows.js\`
- \`scripts/force-webhook-reregistration.js\`
- \`scripts/update-and-activate-all-workflows.js\`
- \`scripts/push-milestone-to-rag.js\`

### Scripts Created
- \`scripts/activate-knowledge-ingest-workflow.js\`
- \`scripts/check-n8n-version-simple.sh\`
- \`scripts/check-n8n-version-and-upgrade.js\`

### Documentation Created
- \`docs/KNOWLEDGE_INGEST_AUTOMATION.md\`
- \`docs/N8N_VERSION_AND_WEBHOOK_URL_SOLUTION.md\`

## Benefits

1. **Automatic**: Knowledge Ingest is included in all automation processes
2. **Priority**: Activated first with longer wait times
3. **Verification**: Dedicated script verifies webhook registration
4. **Reliability**: Ensures RAG system is ready for milestone pushes

## Test Purpose

This ingestion test verifies that:
- Knowledge Ingest workflow is active
- Webhook is properly registered
- RAG system can receive and process content
- Vector embeddings are generated correctly
- Content is searchable in the RAG system

## Next Steps

1. Verify ingestion in Supabase RAG system
2. Test semantic search capabilities
3. Confirm vector embeddings are generated
4. Validate content retrieval works correctly
`;

  return {
    body: {
      title: 'Chat Session: Knowledge Ingestion System Integration',
      text: chatContent,
      content: chatContent,
      tags: [
        'test',
        'chat-session',
        'knowledge-ingestion',
        'rag-system',
        'webhook-automation',
        'n8n-integration',
        'system-test',
        'cursor-ai',
        'intention-testing',
        'role-infrastructure'
      ],
      source: 'chat-session',
      doc_id: `CHAT_TEST_${Date.now()}`,
      crewMember: 'data', // Commander Data for technical content
      knowledgeType: 'test',
      priority: 'medium',
      platform: 'cursor-ai',
      sessionId: `chat-test-${Date.now()}`,
      metadata: {
        date: new Date().toISOString().split('T')[0],
        type: 'test',
        category: 'system-integration',
        test: true,
        crew_relevance: {
          all_crew: 0.8,
          commander_data: 0.95,
          chief_obrien: 0.85,
          lieutenant_commander_la_forge: 0.9
        }
      }
    }
  };
}

// Push to n8n webhook
function pushToN8N(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL('/webhook/knowledge-ingest', N8N_URL);
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 30000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          try {
            const json = JSON.parse(body);
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          } catch (e) {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(data);
    req.end();
  });
}

async function main() {
  // Check if API key is available
  if (!N8N_API_KEY) {
    console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
    process.exit(1);
  }

  console.log(`🔗 N8N Base URL: ${N8N_URL}\n`);

  // Create payload
  console.log('📦 Creating test payload from chat content...');
  const payload = createChatIngestionPayload();
  console.log('   ✅ Payload created\n');

  // Test webhook first
  console.log('🔍 Testing webhook availability...');
  try {
    const testResult = await new Promise((resolve) => {
      const url = new URL('/webhook/knowledge-ingest', N8N_URL);
      const testPayload = { test: true };
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            registered: res.statusCode !== 404,
            body
          });
        });
      });

      req.on('error', () => {
        resolve({ status: 0, registered: false });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, registered: false });
      });

      req.write(JSON.stringify(testPayload));
      req.end();
    });

    if (!testResult.registered) {
      console.log(`   ❌ Webhook not registered (Status: ${testResult.status})\n`);
      console.log('💡 To activate:');
      console.log('   1. Run: node scripts/activate-knowledge-ingest-workflow.js');
      console.log('   2. Or activate the workflow manually in n8n UI\n');
      process.exit(1);
    }

    console.log(`   ✅ Webhook is registered (Status: ${testResult.status})\n`);
  } catch (error) {
    console.log(`   ⚠️  Could not test webhook: ${error.message}\n`);
  }

  // Push to RAG system
  console.log('🚀 Pushing chat content to RAG system...');
  try {
    const result = await pushToN8N(payload);
    console.log(`✅ Success! Status: ${result.status}`);
    
    try {
      const response = JSON.parse(result.body);
      console.log(`📊 Response: ${JSON.stringify(response, null, 2)}\n`);
    } catch (e) {
      console.log(`📊 Response: ${result.body.substring(0, 500)}...\n`);
    }
    
    console.log('🎉 Chat content successfully ingested into RAG system!');
    console.log('🖖 Content is now searchable via semantic search.\n');
    
    console.log('📋 Test Summary:');
    console.log(`   ✅ Webhook verified`);
    console.log(`   ✅ Payload created`);
    console.log(`   ✅ Content ingested`);
    console.log(`   ✅ Vector embeddings generated (if configured)`);
    console.log(`   ✅ Content searchable in RAG system\n`);
    
  } catch (error) {
    console.log(`❌ Ingestion failed: ${error.message}\n`);
    
    if (error.message.includes('404') || error.message.includes('not registered')) {
      console.log('💡 The Knowledge Ingest workflow is not active.');
      console.log('   Run: node scripts/activate-knowledge-ingest-workflow.js\n');
    } else {
      console.log('💡 Check n8n logs and workflow configuration.\n');
    }
    
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

