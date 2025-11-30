#!/usr/bin/env node

/**
 * 🔄 Translate n8n Workflows to MCP System
 * 
 * Converts working n8n workflows to MCP format
 * Documents webhook execution points in MCP platform
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadCrewCredentials } = require('../../utils/load-crew-credentials');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 n8n to MCP Workflow Translation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const credentials = loadCrewCredentials();
const apiKey = credentials.n8n?.apiKey || process.env.N8N_API_KEY;

// Fetch n8n workflows
async function fetchN8NWorkflows() {
  console.log('📥 Fetching n8n workflows...\n');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'n8n.pbradygeorgen.com',
      port: 443,
      path: '/api/v1/workflows',
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.data && Array.isArray(data.data)) {
            console.log(`   ✅ Found ${data.data.length} workflows\n`);
            resolve(data.data);
          } else {
            reject(new Error('Invalid workflow data format'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Convert n8n node to MCP node
function convertN8NNodeToMCP(n8nNode) {
  const nodeType = n8nNode.type;
  const nodeName = n8nNode.name;
  const parameters = n8nNode.parameters || {};
  
  // Map n8n node types to MCP node types
  const nodeTypeMap = {
    'n8n-nodes-base.webhook': 'mcp.webhook',
    'n8n-nodes-base.httpRequest': 'mcp.http',
    'n8n-nodes-base.function': 'mcp.transform',
    'n8n-nodes-base.code': 'mcp.transform',
    'n8n-nodes-base.supabase': 'mcp.database',
    'n8n-nodes-base.postgres': 'mcp.database',
    'n8n-nodes-base.if': 'mcp.logic',
    'n8n-nodes-base.set': 'mcp.transform',
    'n8n-nodes-base.respondToWebhook': 'mcp.response',
    'n8n-nodes-base.executeCommand': 'mcp.execute',
  };
  
  const mcpType = nodeTypeMap[nodeType] || 'mcp.unknown';
  
  // Extract webhook information
  const webhookInfo = nodeType === 'n8n-nodes-base.webhook' ? {
    path: parameters.path || '',
    method: parameters.httpMethod || 'POST',
    responseMode: parameters.responseMode || 'responseNode',
    note: '⚠️ WEBHOOK EXECUTION POINT: This webhook can be executed via MCP at /api/workflows/execute with webhook path'
  } : null;
  
  return {
    id: n8nNode.id,
    name: nodeName,
    type: mcpType,
    originalType: nodeType,
    position: n8nNode.position || [0, 0],
    parameters: sanitizeParameters(parameters),
    webhookInfo,
    metadata: {
      converted: true,
      originalNode: nodeName
    }
  };
}

// Sanitize parameters (remove sensitive data)
function sanitizeParameters(params) {
  const sanitized = { ...params };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'credential'];
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

// Convert n8n workflow to MCP workflow
function convertWorkflowToMCP(n8nWorkflow) {
  const workflow = {
    id: `mcp-${n8nWorkflow.id}`,
    name: n8nWorkflow.name,
    description: `Converted from n8n workflow: ${n8nWorkflow.name}`,
    version: '1.0.0',
    active: n8nWorkflow.active || false,
    nodes: [],
    edges: [],
    webhookExecutionPoints: [],
    metadata: {
      originalWorkflowId: n8nWorkflow.id,
      convertedAt: new Date().toISOString(),
      originalName: n8nWorkflow.name
    }
  };
  
  // Convert nodes
  if (n8nWorkflow.nodes && Array.isArray(n8nWorkflow.nodes)) {
    workflow.nodes = n8nWorkflow.nodes.map(node => {
      const mcpNode = convertN8NNodeToMCP(node);
      
      // Track webhook execution points
      if (mcpNode.webhookInfo) {
        workflow.webhookExecutionPoints.push({
          nodeId: mcpNode.id,
          nodeName: mcpNode.name,
          webhookPath: mcpNode.webhookInfo.path,
          webhookMethod: mcpNode.webhookInfo.method,
          mcpExecutionPath: `/api/workflows/execute?webhook=${encodeURIComponent(mcpNode.webhookInfo.path)}`,
          note: mcpNode.webhookInfo.note
        });
      }
      
      return mcpNode;
    });
  }
  
  // Convert connections/edges
  if (n8nWorkflow.connections) {
    Object.keys(n8nWorkflow.connections).forEach(sourceNode => {
      const connections = n8nWorkflow.connections[sourceNode];
      if (connections.main && Array.isArray(connections.main)) {
        connections.main.forEach((connectionGroup, groupIndex) => {
          if (Array.isArray(connectionGroup)) {
            connectionGroup.forEach(connection => {
              if (connection.node) {
                workflow.edges.push({
                  id: `edge-${sourceNode}-${connection.node}`,
                  source: sourceNode,
                  target: connection.node,
                  sourceHandle: `main-${groupIndex}`,
                  targetHandle: 'input'
                });
              }
            });
          }
        });
      }
    });
  }
  
  return workflow;
}

// Generate webhook execution documentation
function generateWebhookDocumentation(workflows) {
  const doc = {
    title: 'MCP Webhook Execution Points',
    description: 'Documentation of webhook execution points in MCP system',
    workflows: [],
    executionMethods: {
      direct: {
        description: 'Execute webhook directly via MCP API',
        endpoint: '/api/workflows/execute',
        method: 'POST',
        example: {
          url: 'https://mcp.pbradygeorgen.com/api/workflows/execute',
          headers: {
            'X-MCP-API-KEY': '[API_KEY]',
            'Content-Type': 'application/json'
          },
          body: {
            webhookPath: '/webhook/knowledge-ingest',
            method: 'POST',
            payload: {}
          }
        }
      },
      viaWorkflow: {
        description: 'Execute as part of a workflow',
        endpoint: '/api/workflows/execute',
        method: 'POST',
        example: {
          url: 'https://mcp.pbradygeorgen.com/api/workflows/execute',
          headers: {
            'X-MCP-API-KEY': '[API_KEY]',
            'Content-Type': 'application/json'
          },
          body: {
            workflowId: 'mcp-[workflow-id]',
            input: {}
          }
        }
      }
    },
    notes: [
      'Webhooks in n8n are converted to MCP webhook nodes',
      'MCP webhooks can be executed directly via API or as part of workflows',
      'All webhook paths from n8n are preserved in MCP',
      'Authentication uses X-MCP-API-KEY header instead of n8n API key'
    ]
  };
  
  workflows.forEach(workflow => {
    if (workflow.webhookExecutionPoints && workflow.webhookExecutionPoints.length > 0) {
      doc.workflows.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        webhooks: workflow.webhookExecutionPoints
      });
    }
  });
  
  return doc;
}

// Main translation process
async function main() {
  try {
    // Fetch workflows
    const n8nWorkflows = await fetchN8NWorkflows();
    
    // Filter active workflows
    const activeWorkflows = n8nWorkflows.filter(w => w.active);
    console.log(`📊 Processing ${activeWorkflows.length} active workflows...\n`);
    
    // Convert workflows
    const mcpWorkflows = [];
    const outputDir = path.join(__dirname, '..', 'workflows', 'translated-from-n8n');
    fs.mkdirSync(outputDir, { recursive: true });
    
    console.log('🔄 Converting workflows...\n');
    
    activeWorkflows.forEach((n8nWorkflow, index) => {
      console.log(`   ${index + 1}. ${n8nWorkflow.name}`);
      
      const mcpWorkflow = convertWorkflowToMCP(n8nWorkflow);
      mcpWorkflows.push(mcpWorkflow);
      
      // Save individual workflow
      const workflowFile = path.join(outputDir, `${mcpWorkflow.id}.json`);
      fs.writeFileSync(workflowFile, JSON.stringify(mcpWorkflow, null, 2));
      console.log(`      ✅ Saved: ${workflowFile}`);
      
      // Log webhook execution points
      if (mcpWorkflow.webhookExecutionPoints.length > 0) {
        console.log(`      📍 Found ${mcpWorkflow.webhookExecutionPoints.length} webhook execution point(s)`);
        mcpWorkflow.webhookExecutionPoints.forEach(webhook => {
          console.log(`         • ${webhook.webhookPath} → ${webhook.mcpExecutionPath}`);
        });
      }
    });
    
    // Generate webhook documentation
    console.log('\n📚 Generating webhook execution documentation...\n');
    const webhookDoc = generateWebhookDocumentation(mcpWorkflows);
    const docFile = path.join(outputDir, 'WEBHOOK_EXECUTION_POINTS.md');
    fs.writeFileSync(docFile, JSON.stringify(webhookDoc, null, 2));
    console.log(`   ✅ Saved: ${docFile}`);
    
    // Generate summary
    const summary = {
      translationDate: new Date().toISOString(),
      totalWorkflows: n8nWorkflows.length,
      activeWorkflows: activeWorkflows.length,
      convertedWorkflows: mcpWorkflows.length,
      totalWebhookPoints: mcpWorkflows.reduce((sum, w) => sum + w.webhookExecutionPoints.length, 0),
      workflows: mcpWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        webhookCount: w.webhookExecutionPoints.length
      }))
    };
    
    const summaryFile = path.join(outputDir, 'TRANSLATION_SUMMARY.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`   ✅ Saved: ${summaryFile}`);
    
    // Print summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Translation Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`📊 Summary:`);
    console.log(`   • Total n8n workflows: ${n8nWorkflows.length}`);
    console.log(`   • Active workflows: ${activeWorkflows.length}`);
    console.log(`   • Converted to MCP: ${mcpWorkflows.length}`);
    console.log(`   • Total webhook execution points: ${summary.totalWebhookPoints}`);
    console.log(`\n📁 Output directory: ${outputDir}`);
    console.log(`\n📚 Next steps:`);
    console.log(`   1. Review converted workflows in ${outputDir}`);
    console.log(`   2. Check webhook execution points in WEBHOOK_EXECUTION_POINTS.md`);
    console.log(`   3. Test webhook execution via MCP API`);
    console.log(`   4. Deploy workflows to MCP system\n`);
    
  } catch (error) {
    console.error('❌ Translation failed:', error);
    process.exit(1);
  }
}

main();

