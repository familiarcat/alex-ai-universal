#!/usr/bin/env node
/**
 * Integrate Cursor AI Chat with DDD Architecture and OpenRouter Optimization
 * 
 * This script:
 * 1. Integrates automatic DDD memory storage into Cursor chat handler
 * 2. Adds OpenRouter optimization to all crew workflows
 * 3. Ensures cost-effective model selection based on context
 * 
 * DDD: Cursor Chat => N8N => Supabase
 * OpenRouter: Context-aware, cost-optimized model selection
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = process.cwd();

/**
 * Step 1: Create Cursor Chat DDD Integration Hook
 */
function createCursorDDDIntegration() {
  console.log('📡 Creating Cursor AI DDD integration hook...');
  
  const integrationHook = `/**
 * Cursor AI Chat DDD Integration Hook
 * 
 * Automatically stores chat sessions to N8N => Supabase via DDD architecture
 * 
 * Usage: Import and call after each Cursor chat interaction
 */

const https = require('https');
const { loadCrewCredentials } = require('../utils/load-crew-credentials');

class CursorDDDIntegration {
  constructor() {
    const creds = loadCrewCredentials();
    this.n8nBaseUrl = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
  }
  
  /**
   * Store chat session automatically after Cursor interaction
   */
  async storeChatSession(chatContent, metadata = {}) {
    try {
      const memoryPayload = {
        title: metadata.title || 'Cursor AI Chat Session',
        summary: this.extractSummary(chatContent),
        detailedAnalysis: chatContent,
        crewMember: metadata.crewMember || 'data',
        knowledgeType: 'conversation',
        priority: metadata.priority || 'medium',
        tags: ['cursor-ai', 'chat-session', ...(metadata.tags || [])],
        sessionId: metadata.sessionId || \`cursor-\${Date.now()}\`,
        platform: 'cursor-ai',
        timestamp: new Date().toISOString(),
        // Vector fragmentation metadata
        vectorOptimization: {
          enabled: true,
          fragmentationEnabled: true,
          deduplicationEnabled: true,
          smartDeduplication: true,
          crewAccessOptimized: true
        }
      };
      
      await this.sendToN8N('crew-memory-storage', memoryPayload);
      
      return { success: true, message: 'Chat session stored via DDD' };
    } catch (error) {
      console.error('❌ Failed to store chat session:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  extractSummary(content) {
    // Extract first 200 characters as summary
    return content.substring(0, 200).replace(/\\n/g, ' ').trim() + '...';
  }
  
  async sendToN8N(webhookPath, payload) {
    return new Promise((resolve, reject) => {
      const url = new URL(\`\${this.n8nBaseUrl}/webhook/\${webhookPath}\`);
      const data = JSON.stringify(payload);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body });
          } else {
            reject(new Error(\`N8N workflow returned \${res.statusCode}: \${body}\`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = { CursorDDDIntegration };
`;
  
  const targetDir = path.join(WORKSPACE_ROOT, 'packages/shared-utilities/src/cursor-integration');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(targetDir, 'ddd-integration.js'), integrationHook);
  fs.writeFileSync(path.join(targetDir, 'index.js'), `module.exports = require('./ddd-integration');\n`);
  
  console.log('   ✅ Cursor DDD integration hook created');
  return { status: 'success', files: ['ddd-integration.js', 'index.js'] };
}

/**
 * Step 2: Create OpenRouter Optimization Integration for N8N Workflows
 */
function createOpenRouterOptimizationIntegration() {
  console.log('💰 Creating OpenRouter optimization integration for N8N workflows...');
  
  const optimizationCode = `/**
 * OpenRouter Optimization Code for N8N Workflows
 * 
 * Paste this code into N8N Function/Code nodes before OpenRouter HTTP requests
 * 
 * This code:
 * 1. Analyzes task context (crew member, task type, complexity)
 * 2. Selects optimal OpenRouter model based on cost and performance
 * 3. Generates optimized OpenRouter API request
 */

const { selectOptimalModel, generateOpenRouterRequest } = require('@alex-ai/shared-utilities/openrouter');

// Extract context from workflow data
const inputData = $input.all()[0].json;
const crewMember = inputData.crewMember || inputData.crew_member || 'data';
const taskType = inputData.taskType || inputData.task_type;
const complexity = inputData.complexity || 'medium';
const messages = inputData.messages || [{ role: 'user', content: inputData.prompt || inputData.message }];
const budgetConstraint = inputData.budgetConstraint || inputData.budget_constraint || null;
const estimatedTokens = inputData.estimatedTokens || inputData.estimated_tokens || 1500;

// Select optimal model
const modelSelection = selectOptimalModel({
  taskType,
  complexity,
  crewMember,
  budgetConstraint,
  estimatedTokens
});

// Generate optimized OpenRouter request
const openRouterRequest = generateOpenRouterRequest(modelSelection, messages, {
  temperature: inputData.temperature || 0.7,
  maxTokens: inputData.maxTokens || null
});

// Return optimized configuration
return {
  ...inputData,
  openRouterConfig: {
    model: modelSelection.modelId,
    messages: openRouterRequest.messages,
    temperature: openRouterRequest.temperature,
    max_tokens: openRouterRequest.max_tokens
  },
  optimization: {
    selectedModel: modelSelection.modelName,
    estimatedCost: modelSelection.estimatedCost,
    estimatedTokens: modelSelection.estimatedTokens,
    reasoning: modelSelection.reasoning
  }
};
`;
  
  const targetDir = path.join(WORKSPACE_ROOT, 'n8n-workflows/optimization-code');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(targetDir, 'openrouter-optimization-code.js'), optimizationCode);
  
  // Create documentation
  const doc = `# OpenRouter Optimization Integration Guide

## Overview

This optimization code enables context-aware, cost-effective OpenRouter model selection in N8N workflows.

## Usage in N8N Workflows

1. **Add Function/Code Node** before your OpenRouter HTTP Request node
2. **Paste the code** from \`openrouter-optimization-code.js\`
3. **Update your HTTP Request node** to use \`{{ $json.openRouterConfig }}\`

## Benefits

- ✅ Cost-effective model selection based on task requirements
- ✅ Context-aware routing (crew member, task type, complexity)
- ✅ Budget constraint support
- ✅ Automatic cost estimation

## Example Workflow Structure

\`\`\`
Webhook Trigger
  ↓
Extract Context (crew member, task type, complexity)
  ↓
OpenRouter Optimization Code Node ← ADD THIS
  ↓
OpenRouter HTTP Request (uses optimized config)
  ↓
Process Response
\`\`\`

## Model Selection Logic

- **Strategic Planning** → Claude 3.5 Sonnet (high performance)
- **Quick Analysis** → Claude 3 Haiku (cost-effective)
- **Code Generation** → Llama 3 70B or Claude 3.5 Sonnet
- **Optimization** → Gemini Pro 1.5 (specialized)
- **Budget Constrained** → Automatically selects lower-cost models

## Cost Optimization

The optimizer automatically:
- Selects cost-effective models for simple tasks
- Uses high-performance models only when needed
- Respects budget constraints
- Estimates costs before execution
`;
  
  fs.writeFileSync(path.join(targetDir, 'README.md'), doc);
  
  console.log('   ✅ OpenRouter optimization integration created');
  return { status: 'success', files: ['openrouter-optimization-code.js', 'README.md'] };
}

/**
 * Step 3: Update Cursor Integration to Use DDD
 */
function updateCursorIntegration() {
  console.log('🔧 Updating Cursor integration to use DDD...');
  
  // This would update the actual Cursor integration file
  // For now, we'll create a wrapper that can be integrated
  
  const wrapper = `/**
 * Cursor AI Integration Wrapper with DDD
 * 
 * Wraps Cursor chat interactions with automatic DDD memory storage
 */

const { CursorDDDIntegration } = require('@alex-ai/shared-utilities/cursor-integration');

class CursorChatWithDDD {
  constructor() {
    this.dddIntegration = new CursorDDDIntegration();
  }
  
  /**
   * Handle Cursor chat with automatic DDD storage
   */
  async handleChat(userMessage, assistantResponse, metadata = {}) {
    // Store chat session automatically
    const chatContent = \`User: \${userMessage}\\n\\nAssistant: \${assistantResponse}\`;
    
    await this.dddIntegration.storeChatSession(chatContent, {
      ...metadata,
      title: metadata.title || 'Cursor AI Chat Interaction'
    });
    
    return assistantResponse;
  }
}

module.exports = { CursorChatWithDDD };
`;
  
  const targetDir = path.join(WORKSPACE_ROOT, 'packages/shared-utilities/src/cursor-integration');
  fs.writeFileSync(path.join(targetDir, 'cursor-chat-wrapper.js'), wrapper);
  
  console.log('   ✅ Cursor integration wrapper created');
  return { status: 'success', files: ['cursor-chat-wrapper.js'] };
}

/**
 * Main execution
 */
async function main() {
  console.log('🖖 Integrating Cursor AI with DDD & OpenRouter Optimization');
  console.log('===========================================================\n');
  
  const results = {
    dddIntegration: await createCursorDDDIntegration(),
    openRouterOptimization: await createOpenRouterOptimizationIntegration(),
    cursorWrapper: await updateCursorIntegration()
  };
  
  console.log('\n✅ Integration Complete!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Import CursorDDDIntegration in your Cursor chat handler');
  console.log('   2. Call storeChatSession() after each chat interaction');
  console.log('   3. Add OpenRouter optimization code to N8N workflows');
  console.log('   4. Update HTTP Request nodes to use optimized config');
  console.log('\n📄 Documentation: n8n-workflows/optimization-code/README.md');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

