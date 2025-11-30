#!/usr/bin/env node
/**
 * Universal N8N Webhook Manager
 * 
 * This comprehensive script:
 * 1. Verifies current webhook activation status for all workflows
 * 2. Activates all inactive workflows
 * 3. Forces webhook registration via deactivate/reactivate cycle
 * 4. Automatically creates webhook nodes for workflows without them
 * 5. Creates/ensures webhooks exist for all workflows with webhook nodes
 * 6. Verifies all webhook endpoints are accessible
 * 7. Provides comprehensive reporting
 * 
 * Usage:
 *   node scripts/universal-webhook-manager.js [--force] [--skip-verification] [--create-webhooks]
 * 
 * Options:
 *   --force: Force re-registration even for already registered webhooks
 *   --skip-verification: Skip final webhook verification step
 *   --create-webhooks: Automatically create webhook nodes for workflows without them
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read API key directly from ~/.zshrc (reliable method)
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1] || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in ~/.zshrc');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const SKIP_VERIFICATION = args.includes('--skip-verification');
const CREATE_WEBHOOKS = args.includes('--create-webhooks');

console.log('\n' + '═'.repeat(80));
console.log('🎯 UNIVERSAL N8N WEBHOOK MANAGER');
console.log('═'.repeat(80));
console.log(`📍 N8N URL: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 20)}...`);
console.log(`🔄 Force Mode: ${FORCE ? 'YES' : 'NO'}`);
console.log(`⏭️  Skip Verification: ${SKIP_VERIFICATION ? 'YES' : 'NO'}`);
console.log(`✨ Create Webhooks: ${CREATE_WEBHOOKS ? 'YES' : 'NO'}`);
console.log('═'.repeat(80) + '\n');

// Make HTTPS request
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test webhook endpoint
function testWebhook(webhookPath, method = 'POST') {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const testPayload = { test: true, timestamp: Date.now(), source: 'universal-webhook-manager' };
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + (method === 'GET' ? '?test=true' : ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
          response: body.substring(0, 200),
        });
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, registered: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false, error: 'Request timeout' });
    });

    if (method === 'POST') {
      req.write(JSON.stringify(testPayload));
    }
    req.end();
  });
}

// Extract webhook paths from workflow
function extractWebhooks(workflow) {
  const webhooks = [];
  
  if (!workflow.nodes) return webhooks;
  
  workflow.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.webhook') {
      const path = node.parameters?.path;
      const method = (node.parameters?.httpMethod || 'POST').toUpperCase();
      
      if (path) {
        // Clean up webhook path (remove leading/trailing slashes)
        const cleanPath = path.replace(/^\/+|\/+$/g, '');
        
        webhooks.push({
          path: cleanPath,
          method: method,
          nodeId: node.id,
          nodeName: node.name,
          webhookId: node.webhookId,
        });
      }
    }
  });
  
  return webhooks;
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate a slugified webhook path from workflow name
function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'webhook';
}

// Generate webhook path from workflow name
function generateWebhookPath(workflowName) {
  // Remove common prefixes
  let cleanName = workflowName
    .replace(/^(CREW|COORDINATION|SYSTEM|PROJECT|UTILITY|ANTI-HALLUCINATION)\s*-\s*/i, '')
    .replace(/\s*-\s*(OpenRouter|Production|Optimized).*$/i, '')
    .trim();
  
  return slugify(cleanName);
}

// Generate unique node ID
function generateNodeId() {
  return `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create webhook node and respond node for a workflow
function createWebhookNodes(workflowName, webhookPath, existingNodes = []) {
  const webhookNodeId = generateNodeId();
  const respondNodeId = generateNodeId();
  
  // Find existing node positions to place new nodes appropriately
  const defaultX = 240;
  const defaultY = 300;
  
  // Ensure unique node names
  const existingNames = new Set((existingNodes || []).map(n => n.name));
  let webhookNodeName = 'Webhook';
  let respondNodeName = 'Respond to Webhook';
  let counter = 1;
  
  while (existingNames.has(webhookNodeName)) {
    webhookNodeName = `Webhook ${counter}`;
    counter++;
  }
  
  counter = 1;
  while (existingNames.has(respondNodeName)) {
    respondNodeName = `Respond to Webhook ${counter}`;
    counter++;
  }
  
  const webhookNode = {
    id: webhookNodeId,
    name: webhookNodeName,
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1,
    position: [defaultX, defaultY],
    parameters: {
      httpMethod: 'POST',
      path: webhookPath,
      responseMode: 'responseNode',
      options: {},
    },
    webhookId: `${slugify(workflowName)}-webhook`,
  };
  
  const respondNode = {
    id: respondNodeId,
    name: respondNodeName,
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1,
    position: [defaultX + 300, defaultY],
    parameters: {
      respondWith: 'json',
      responseBody: '={{ $json }}',
      options: {},
    },
  };
  
  return {
    webhookNode,
    respondNode,
    connections: {
      [webhookNode.name]: {
        main: [[{ node: respondNode.name, type: 'main', index: 0 }]]
      }
    }
  };
}

// Add webhook nodes to a workflow
async function addWebhookToWorkflow(workflow, webhookPath) {
  const existingNodes = workflow.nodes || [];
  const { webhookNode, respondNode, connections } = createWebhookNodes(workflow.name, webhookPath, existingNodes);
  
  // Get current workflow structure
  const currentNodes = workflow.nodes || [];
  const currentConnections = workflow.connections || {};
  
  // Add new nodes
  const updatedNodes = [...currentNodes, webhookNode, respondNode];
  
  // Merge connections
  const updatedConnections = {
    ...currentConnections,
    ...connections,
  };
  
  // Prepare update payload - only include fields allowed by N8N API
  // N8N API only accepts: name, nodes, connections, settings, staticData
  // Note: tags is read-only and cannot be updated via PUT
  const updatePayload = {
    name: workflow.name,
    nodes: updatedNodes,
    connections: updatedConnections,
    settings: workflow.settings || {},
    staticData: workflow.staticData || null,
  };
  
  // Update workflow via PUT
  const updateResponse = await makeRequest('PUT', `/api/v1/workflows/${workflow.id}`, updatePayload);
  
  if (updateResponse.status === 200 || updateResponse.status === 204) {
    return {
      success: true,
      webhookPath,
      webhookNodeId: webhookNode.id,
      respondNodeId: respondNode.id,
    };
  } else {
    // Extract error message from response
    const errorMessage = updateResponse.data?.message || 
                        updateResponse.data?.error || 
                        JSON.stringify(updateResponse.data).substring(0, 200) ||
                        `Update failed with status ${updateResponse.status}`;
    return {
      success: false,
      error: errorMessage,
      status: updateResponse.status,
      response: updateResponse.data,
    };
  }
}

// Main function
async function main() {
  const results = {
    workflows: {
      total: 0,
      active: 0,
      inactive: 0,
      activated: 0,
      activationFailed: 0,
    },
    webhooks: {
      total: 0,
      registered: 0,
      unregistered: 0,
      forced: 0,
      verificationFailed: 0,
      created: 0,
      creationFailed: 0,
      autoActivated: 0,
      autoActivationFailed: 0,
    },
    details: [],
  };

  try {
    // Step 1: Fetch all workflows
    console.log('📋 Step 1: Fetching all workflows...');
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
    
    if (workflowsResponse.status !== 200) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      console.error(`   Response: ${JSON.stringify(workflowsResponse.data)}`);
      process.exit(1);
    }

    const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];
    results.workflows.total = workflows.length;
    console.log(`   Found ${workflows.length} workflows\n`);

    // Step 2: Analyze workflow status and extract webhooks
    console.log('🔍 Step 2: Analyzing workflows and extracting webhook information...\n');
    const workflowDetails = [];

    for (const workflow of workflows) {
      if (workflow.active) {
        results.workflows.active++;
      } else {
        results.workflows.inactive++;
      }

      try {
        const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
        if (detailResponse.status === 200) {
          const workflowData = detailResponse.data?.data || detailResponse.data;
          const webhooks = extractWebhooks(workflowData);
          
          workflowDetails.push({
            id: workflow.id,
            name: workflow.name,
            active: workflow.active,
            webhooks: webhooks,
            workflowData: workflowData, // Store full workflow data for potential updates
          });

          if (webhooks.length > 0) {
            results.webhooks.total += webhooks.length;
            console.log(`   ✅ ${workflow.name}: ${webhooks.length} webhook(s) found`);
          } else {
            console.log(`   ⚠️  ${workflow.name}: No webhooks found`);
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Failed to fetch details for: ${workflow.name} - ${error.message}`);
      }

      await sleep(100);
    }

    console.log(`\n   Summary: ${workflowDetails.length} workflows analyzed, ${results.webhooks.total} total webhooks found\n`);

    // Step 2.5: Create webhooks for workflows without them (if flag is set)
    if (CREATE_WEBHOOKS) {
      console.log('✨ Step 2.5: Creating webhooks for workflows without them...\n');
      
      for (const workflow of workflowDetails) {
        if (workflow.webhooks.length > 0) {
          continue; // Skip workflows that already have webhooks
        }

        try {
          const webhookPath = generateWebhookPath(workflow.name);
          console.log(`   🔧 Creating webhook for: ${workflow.name}`);
          console.log(`      Path: /webhook/${webhookPath}`);
          
          const createResult = await addWebhookToWorkflow(workflow.workflowData, webhookPath);
          
          if (createResult.success) {
            console.log(`      ✅ Webhook created successfully`);
            results.webhooks.created++;
            
            // Update the workflow details with the new webhook
            workflow.webhooks.push({
              path: webhookPath,
              method: 'POST',
              nodeId: createResult.webhookNodeId,
              nodeName: 'Webhook',
            });
            results.webhooks.total++;
            
            // Refresh workflow data
            const refreshResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
            if (refreshResponse.status === 200) {
              workflow.workflowData = refreshResponse.data?.data || refreshResponse.data;
            }
          } else {
            console.log(`      ❌ Failed to create webhook: ${createResult.error}`);
            if (createResult.response) {
              console.log(`         Response: ${JSON.stringify(createResult.response).substring(0, 200)}`);
            }
            results.webhooks.creationFailed++;
          }
        } catch (error) {
          console.log(`      ❌ Error creating webhook: ${error.message}`);
          results.webhooks.creationFailed++;
        }

        await sleep(500);
      }

      console.log(`\n📊 Webhook Creation Summary: ${results.webhooks.created} created, ${results.webhooks.creationFailed} failed\n`);
    }

    // Step 3: Activate inactive workflows
    console.log('⚡ Step 3: Activating inactive workflows...\n');
    
    for (const workflow of workflowDetails) {
      if (workflow.active && !FORCE) {
        console.log(`⏭️  Already active: ${workflow.name}`);
        continue;
      }

      // If force mode, deactivate first to force re-registration
      if (FORCE && workflow.active) {
        try {
          console.log(`🔄 Force re-registration: ${workflow.name}...`);
          await makeRequest('POST', `/api/v1/workflows/${workflow.id}/deactivate`);
          await sleep(1000);
          results.webhooks.forced++;
        } catch (error) {
          console.log(`   ⚠️  Failed to deactivate: ${workflow.name} - ${error.message}`);
        }
      }

      // Activate workflow
      try {
        const activateResponse = await makeRequest('POST', `/api/v1/workflows/${workflow.id}/activate`);
        if (activateResponse.status === 200 || activateResponse.status === 204) {
          if (!workflow.active) {
            console.log(`✅ Activated: ${workflow.name}`);
            results.workflows.activated++;
          } else if (FORCE) {
            console.log(`✅ Re-activated: ${workflow.name}`);
            results.webhooks.forced++;
          }
        } else {
          console.log(`⚠️  Activation returned ${activateResponse.status}: ${workflow.name}`);
          results.workflows.activationFailed++;
        }
      } catch (error) {
        console.log(`❌ Failed to activate: ${workflow.name} - ${error.message}`);
        results.workflows.activationFailed++;
      }

      await sleep(250);
    }

    console.log(`\n📊 Activation Summary: ${results.workflows.activated} activated, ${results.webhooks.forced} force re-registered, ${results.workflows.activationFailed} failed\n`);

    // Step 4: Wait for webhook registration
    console.log('⏳ Step 4: Waiting 15 seconds for webhook registration...');
    await sleep(15000);
    console.log('   Wait complete\n');

    // Step 5: Verify webhook endpoints (if not skipped)
    if (!SKIP_VERIFICATION) {
      console.log('🧪 Step 5: Verifying webhook endpoints...\n');
      
      for (const workflow of workflowDetails) {
        if (!workflow.active || workflow.webhooks.length === 0) {
          continue;
        }

        for (const webhook of workflow.webhooks) {
          const testResult = await testWebhook(webhook.path, webhook.method);
          
          const result = {
            workflowId: workflow.id,
            workflowName: workflow.name,
            webhook: webhook.path,
            method: webhook.method,
            status: testResult.status,
            registered: testResult.registered,
          };

          results.details.push(result);

          if (testResult.registered) {
            console.log(`✅ ${workflow.name} - /webhook/${webhook.path} (${webhook.method}) - HTTP ${testResult.status}`);
            results.webhooks.registered++;
          } else {
            console.log(`❌ ${workflow.name} - /webhook/${webhook.path} (${webhook.method}) - HTTP ${testResult.status} (NOT REGISTERED)`);
            results.webhooks.unregistered++;
            results.webhooks.verificationFailed++;
          }

          await sleep(200);
        }
      }

      console.log(`\n📊 Verification Summary: ${results.webhooks.registered} registered, ${results.webhooks.unregistered} unregistered\n`);

      // Step 5.5: Automatically activate unregistered webhooks
      if (results.webhooks.unregistered > 0) {
        console.log('🔄 Step 5.5: Automatically activating unregistered webhooks...\n');
        
        // Group unregistered webhooks by workflow
        const unregisteredWorkflows = new Map();
        for (const result of results.details) {
          if (!result.registered) {
            if (!unregisteredWorkflows.has(result.workflowId)) {
              unregisteredWorkflows.set(result.workflowId, {
                workflowId: result.workflowId,
                workflowName: result.workflowName,
                webhooks: [],
              });
            }
            unregisteredWorkflows.get(result.workflowId).webhooks.push(result);
          }
        }

        // Force re-registration for each workflow with unregistered webhooks
        for (const [workflowId, workflowInfo] of unregisteredWorkflows) {
          try {
            console.log(`   🔧 Activating webhooks for: ${workflowInfo.workflowName}`);
            
            // Find the workflow in workflowDetails
            const workflow = workflowDetails.find(w => w.id === workflowId);
            if (!workflow) {
              console.log(`      ⚠️  Workflow not found in details`);
              continue;
            }

            // Strategy: Update workflow to force webhook re-registration
            // This is more reliable than just deactivate/reactivate
            try {
              // Get fresh workflow data
              const freshResponse = await makeRequest('GET', `/api/v1/workflows/${workflowId}`);
              if (freshResponse.status !== 200) {
                throw new Error(`Failed to fetch workflow: ${freshResponse.status}`);
              }
              
              const freshWorkflow = freshResponse.data?.data || freshResponse.data;
              
              // Update workflow with a minor change to trigger re-registration
              // Only include fields allowed by N8N API: name, nodes, connections, settings, staticData
              const updatePayload = {
                name: freshWorkflow.name,
                nodes: freshWorkflow.nodes || [],
                connections: freshWorkflow.connections || {},
                settings: {
                  ...(freshWorkflow.settings || {}),
                  // Add a timestamp to settings to force update
                  _lastWebhookActivation: Date.now(),
                },
                staticData: freshWorkflow.staticData || null,
              };
              
              // Remove any read-only or invalid fields that might be in the workflow
              delete updatePayload.id;
              delete updatePayload.active;
              delete updatePayload.createdAt;
              delete updatePayload.updatedAt;
              delete updatePayload.tags;
              delete updatePayload.versionId;
              
              // Try simple deactivate/reactivate first (more reliable)
              // If that doesn't work, we'll try the update approach
              try {
                await makeRequest('POST', `/api/v1/workflows/${workflowId}/deactivate`);
                await sleep(1500);
                
                const activateResponse = await makeRequest('POST', `/api/v1/workflows/${workflowId}/activate`);
                if (activateResponse.status === 200 || activateResponse.status === 204) {
                  console.log(`      ✅ Workflow reactivated`);
                  results.webhooks.autoActivated++;
                } else {
                  // Fallback: Try update approach
                  const updateResponse = await makeRequest('PUT', `/api/v1/workflows/${workflowId}`, updatePayload);
                  if (updateResponse.status === 200 || updateResponse.status === 204) {
                    await makeRequest('POST', `/api/v1/workflows/${workflowId}/deactivate`);
                    await sleep(1500);
                    const activateResponse2 = await makeRequest('POST', `/api/v1/workflows/${workflowId}/activate`);
                    if (activateResponse2.status === 200 || activateResponse2.status === 204) {
                      console.log(`      ✅ Workflow updated and reactivated`);
                      results.webhooks.autoActivated++;
                    } else {
                      console.log(`      ⚠️  Activation returned ${activateResponse2.status}`);
                      results.webhooks.autoActivationFailed++;
                    }
                  } else {
                    const errorMsg = updateResponse.data?.message || JSON.stringify(updateResponse.data).substring(0, 100);
                    console.log(`      ⚠️  Update returned ${updateResponse.status}: ${errorMsg}`);
                    results.webhooks.autoActivationFailed++;
                  }
                }
              } catch (error) {
                console.log(`      ❌ Failed: ${error.message}`);
                results.webhooks.autoActivationFailed++;
              }
            } catch (error) {
              console.log(`      ❌ Failed to update/reactivate: ${error.message}`);
              results.webhooks.autoActivationFailed++;
            }

            await sleep(500);
          } catch (error) {
            console.log(`   ❌ Error processing ${workflowInfo.workflowName}: ${error.message}`);
            results.webhooks.autoActivationFailed++;
          }
        }

        console.log(`\n📊 Auto-Activation Summary: ${results.webhooks.autoActivated} workflows reactivated, ${results.webhooks.autoActivationFailed} failed\n`);

        // Step 5.6: Wait and re-verify unregistered webhooks
        if (results.webhooks.autoActivated > 0) {
          console.log('⏳ Step 5.6: Waiting 15 seconds for webhook registration...');
          await sleep(15000);
          console.log('   Wait complete\n');

          console.log('🔍 Step 5.7: Re-verifying previously unregistered webhooks...\n');
          
          let reRegistered = 0;
          let stillUnregistered = 0;

          for (const result of results.details) {
            if (!result.registered) {
              const testResult = await testWebhook(result.webhook, result.method);
              
              if (testResult.registered) {
                console.log(`✅ ${result.workflowName} - /webhook/${result.webhook} (${result.method}) - HTTP ${testResult.status} - NOW REGISTERED`);
                result.registered = true;
                result.status = testResult.status;
                results.webhooks.registered++;
                results.webhooks.unregistered--;
                reRegistered++;
              } else {
                console.log(`❌ ${result.workflowName} - /webhook/${result.webhook} (${result.method}) - HTTP ${testResult.status} - STILL NOT REGISTERED`);
                stillUnregistered++;
              }

              await sleep(200);
            }
          }

          console.log(`\n📊 Re-verification Summary: ${reRegistered} now registered, ${stillUnregistered} still unregistered\n`);
        }
      }
    } else {
      console.log('⏭️  Step 5: Skipping webhook verification (--skip-verification flag)\n');
    }

    // Final Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\n📋 Workflows:`);
    console.log(`   Total: ${results.workflows.total}`);
    console.log(`   Active: ${results.workflows.active}`);
    console.log(`   Inactive: ${results.workflows.inactive}`);
    console.log(`   Activated: ${results.workflows.activated}`);
    console.log(`   Activation Failed: ${results.workflows.activationFailed}`);
    
    console.log(`\n🔗 Webhooks:`);
    console.log(`   Total: ${results.webhooks.total}`);
    console.log(`   Registered: ${results.webhooks.registered}`);
    console.log(`   Unregistered: ${results.webhooks.unregistered}`);
    if (CREATE_WEBHOOKS) {
      console.log(`   Created: ${results.webhooks.created}`);
      if (results.webhooks.creationFailed > 0) {
        console.log(`   Creation Failed: ${results.webhooks.creationFailed}`);
      }
    }
    if (results.webhooks.autoActivated > 0) {
      console.log(`   Auto-Activated: ${results.webhooks.autoActivated}`);
      if (results.webhooks.autoActivationFailed > 0) {
        console.log(`   Auto-Activation Failed: ${results.webhooks.autoActivationFailed}`);
      }
    }
    if (FORCE) {
      console.log(`   Force Re-registered: ${results.webhooks.forced}`);
    }
    
    console.log(`\n🎯 Next Steps:`);
    if (results.webhooks.unregistered > 0) {
      console.log(`   1. Review unregistered webhooks above`);
      console.log(`   2. Try running with --force flag: node scripts/universal-webhook-manager.js --force`);
      if (!CREATE_WEBHOOKS && results.webhooks.total < results.workflows.total) {
        console.log(`   3. Create missing webhooks: node scripts/universal-webhook-manager.js --create-webhooks`);
        console.log(`   4. Visit ${N8N_URL} to manually activate any failed workflows`);
      } else {
        console.log(`   3. Visit ${N8N_URL} to manually activate any failed workflows`);
      }
    } else {
      console.log(`   ✅ All webhooks are registered and operational!`);
    }
    console.log(`   ${results.webhooks.unregistered > 0 ? '5' : '4'}. Test webhook endpoints: curl -X POST ${N8N_URL}/webhook/<path>`);
    console.log(`   ${results.webhooks.unregistered > 0 ? '6' : '5'}. Monitor webhook health: node scripts/webhook-status-report.js\n`);
    console.log('═'.repeat(80) + '\n');

    // Exit with appropriate code
    if (results.webhooks.unregistered > 0 || results.workflows.activationFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();

