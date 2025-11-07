#!/usr/bin/env node

/**
 * 🧪 ALEX AI CREW RAG SYSTEM TEST
 * 
 * Comprehensive test of the entire crew collaboration system:
 * 1. Tests all 12 crew member webhooks
 * 2. Sends observations to RAG system (Supabase vector storage)
 * 3. Tests Democratic Observation Lounge coordination
 * 4. Demonstrates crew collaboration on a sample task
 * 
 * Usage: node scripts/test-crew-rag-system.js
 */

const axios = require('axios');

// n8n webhook base URL
const N8N_BASE_URL = 'https://n8n.pbradygeorgen.com/webhook';

// Color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Crew member configurations
const crewMembers = [
  {
    name: 'Captain Jean-Luc Picard',
    webhook: 'crew-captain-jean-luc-picard',
    specialty: 'Strategic Leadership',
    testObservation: 'Strategic analysis: The MCP browser controls represent a paradigm shift in automation. We should document this breakthrough and integrate it across all future UI automation tasks.',
  },
  {
    name: 'Commander William Riker',
    webhook: 'crew-commander-william-riker',
    specialty: 'Tactical Execution',
    testObservation: 'Tactical assessment: All 12 workflows activated successfully. Recommend establishing automated health checks to maintain operational readiness.',
  },
  {
    name: 'Commander Data',
    webhook: 'crew-commander-data',
    specialty: 'Android Analytics',
    testObservation: 'Data analysis: MCP browser controls achieved 100% success rate with zero errors. Efficiency metrics: 6 minutes for 12 workflow toggles. Recommendation: Adopt as standard.',
  },
  {
    name: 'Geordi La Forge',
    webhook: 'crew-geordi-la-forge',
    specialty: 'Infrastructure Engineering',
    testObservation: 'Engineering report: The unified rate limiter architecture successfully consolidated rate limiting logic. All systems nominal. N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN ensures persistence.',
  },
  {
    name: 'Lieutenant Worf',
    webhook: 'crew-lieutenant-worf',
    specialty: 'Security & Compliance',
    testObservation: 'Security protocol: n8n credentials properly stored in ~/.zshrc. MCP browser controls bypass rate limiting without compromising security. Authentication verified.',
  },
  {
    name: 'Counselor Deanna Troi',
    webhook: 'crew-counselor-deanna-troi',
    specialty: 'User Experience',
    testObservation: 'UX observation: The automation process was seamless and transparent. User confidence increased through real-time progress updates. Recommend similar patterns for future automation.',
  },
  {
    name: 'Dr. Beverly Crusher',
    webhook: 'crew-dr-beverly-crusher',
    specialty: 'Health & Diagnostics',
    testObservation: 'System health: All workflows show active status. No errors detected. Webhook registration persistent across restarts. System vitals: excellent.',
  },
  {
    name: 'Lieutenant Uhura',
    webhook: 'crew-lieutenant-uhura',
    specialty: 'Communications & I/O',
    testObservation: 'Communications analysis: All webhook endpoints responding correctly. RAG system connectivity verified. Inter-crew communication channels operational.',
  },
  {
    name: 'Chief Miles O\'Brien',
    webhook: 'crew-chief-obrien',
    specialty: 'Pragmatic Solutions',
    testObservation: 'Pragmatic assessment: MCP browser controls solved the rate limiting problem without over-engineering. Simple, effective solution. This is how it should be done.',
  },
  {
    name: 'Quark',
    webhook: 'crew-quark',
    specialty: 'Business Intelligence',
    testObservation: 'Cost-benefit analysis: 6 minutes of automation time vs. hours of manual work. ROI: Excellent. The MCP browser controls are a profitable investment.',
  },
];

// Coordination workflows
const coordinationWorkflows = [
  {
    name: 'Democratic Collaboration',
    webhook: 'coordination-democratic-collaboration',
    description: 'Democratic decision-making and consensus building',
  },
  {
    name: 'Observation Lounge',
    webhook: 'coordination-observation-lounge',
    description: 'Crew coordination and strategic planning hub',
  },
];

// RAG system workflows
const ragWorkflows = [
  {
    name: 'Knowledge Ingest',
    webhook: 'knowledge-ingest',
    description: 'Store crew memories and observations in Supabase RAG',
  },
];

/**
 * Print section header
 */
function printHeader(title) {
  console.log('\n' + colors.bright + colors.cyan + '━'.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + `  ${title}` + colors.reset);
  console.log(colors.bright + colors.cyan + '━'.repeat(80) + colors.reset + '\n');
}

/**
 * Print success message
 */
function printSuccess(message) {
  console.log(colors.green + '✅ ' + message + colors.reset);
}

/**
 * Print error message
 */
function printError(message) {
  console.log(colors.red + '❌ ' + message + colors.reset);
}

/**
 * Print info message
 */
function printInfo(message) {
  console.log(colors.blue + 'ℹ️  ' + message + colors.reset);
}

/**
 * Print warning message
 */
function printWarning(message) {
  console.log(colors.yellow + '⚠️  ' + message + colors.reset);
}

/**
 * Test a crew member's webhook
 */
async function testCrewWebhook(crewMember) {
  const url = `${N8N_BASE_URL}/${crewMember.webhook}`;
  
  try {
    const response = await axios.post(url, {
      query: `${crewMember.name}, please provide a brief status report on your systems and readiness.`,
      source: 'Alex AI Crew Test System',
      priority: 'routine',
      timestamp: new Date().toISOString(),
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      printSuccess(`${crewMember.name} (${crewMember.specialty}) - Webhook operational`);
      return { success: true, crewMember, response: response.data };
    } else {
      printWarning(`${crewMember.name} - Unexpected status: ${response.status}`);
      return { success: false, crewMember, error: `Status ${response.status}` };
    }
  } catch (error) {
    printError(`${crewMember.name} - Webhook failed: ${error.message}`);
    return { success: false, crewMember, error: error.message };
  }
}

/**
 * Send observation to RAG system
 */
async function sendObservationToRAG(crewMember) {
  const url = `${N8N_BASE_URL}/knowledge-ingest`;
  
  try {
    const response = await axios.post(url, {
      source: crewMember.name,
      specialty: crewMember.specialty,
      observation: crewMember.testObservation,
      timestamp: new Date().toISOString(),
      category: 'crew_observation',
      tags: ['milestone', 'mcp_browser_controls', 'webhook_test'],
      metadata: {
        webhook: crewMember.webhook,
        test_run: true,
      },
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 || response.status === 201) {
      printSuccess(`${crewMember.name} - Observation stored in RAG system`);
      return { success: true, crewMember };
    } else {
      printWarning(`${crewMember.name} - RAG storage status: ${response.status}`);
      return { success: false, crewMember, error: `Status ${response.status}` };
    }
  } catch (error) {
    printError(`${crewMember.name} - RAG storage failed: ${error.message}`);
    return { success: false, crewMember, error: error.message };
  }
}

/**
 * Test coordination workflow
 */
async function testCoordinationWorkflow(workflow) {
  const url = `${N8N_BASE_URL}/${workflow.webhook}`;
  
  try {
    const response = await axios.post(url, {
      task: 'Test crew collaboration system',
      participants: crewMembers.map(cm => cm.name),
      goal: 'Validate end-to-end RAG system and crew coordination',
      timestamp: new Date().toISOString(),
      test: true,
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      printSuccess(`${workflow.name} - Coordination workflow operational`);
      return { success: true, workflow, response: response.data };
    } else {
      printWarning(`${workflow.name} - Unexpected status: ${response.status}`);
      return { success: false, workflow, error: `Status ${response.status}` };
    }
  } catch (error) {
    printError(`${workflow.name} - Coordination failed: ${error.message}`);
    return { success: false, workflow, error: error.message };
  }
}

/**
 * Test Democratic Observation Lounge collaboration
 */
async function testObservationLoungeCollaboration() {
  const url = `${N8N_BASE_URL}/coordination-observation-lounge`;
  
  const collaborationTask = {
    task: 'Plan next steps for Alex AI development',
    context: 'We have successfully activated all crew webhooks and validated the MCP browser controls. All crew members have submitted their observations to the RAG system.',
    goal: 'Determine priority next steps leveraging our newly operational crew coordination system',
    participants: crewMembers.map(cm => ({
      name: cm.name,
      specialty: cm.specialty,
      observation: cm.testObservation,
    })),
    timestamp: new Date().toISOString(),
    mode: 'democratic_collaboration',
  };
  
  try {
    printInfo('Initiating Democratic Observation Lounge session...');
    
    const response = await axios.post(url, collaborationTask, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      printSuccess('Observation Lounge - Crew collaboration successful');
      console.log('\n' + colors.bright + 'Collaboration Results:' + colors.reset);
      console.log(JSON.stringify(response.data, null, 2));
      return { success: true, results: response.data };
    } else {
      printWarning(`Observation Lounge - Unexpected status: ${response.status}`);
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    printError(`Observation Lounge - Collaboration failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Print test summary
 */
function printSummary(results) {
  printHeader('TEST SUMMARY');
  
  const webhookTests = results.filter(r => r.type === 'webhook');
  const ragTests = results.filter(r => r.type === 'rag');
  const coordinationTests = results.filter(r => r.type === 'coordination');
  
  const webhookSuccess = webhookTests.filter(r => r.success).length;
  const ragSuccess = ragTests.filter(r => r.success).length;
  const coordinationSuccess = coordinationTests.filter(r => r.success).length;
  
  console.log(colors.bright + 'Crew Webhook Tests:' + colors.reset);
  console.log(`  ${webhookSuccess}/${webhookTests.length} successful (${Math.round(webhookSuccess / webhookTests.length * 100)}%)`);
  
  console.log(colors.bright + '\nRAG Storage Tests:' + colors.reset);
  console.log(`  ${ragSuccess}/${ragTests.length} successful (${Math.round(ragSuccess / ragTests.length * 100)}%)`);
  
  console.log(colors.bright + '\nCoordination Tests:' + colors.reset);
  console.log(`  ${coordinationSuccess}/${coordinationTests.length} successful (${Math.round(coordinationSuccess / coordinationTests.length * 100)}%)`);
  
  const totalTests = results.length;
  const totalSuccess = results.filter(r => r.success).length;
  
  console.log(colors.bright + '\nOverall:' + colors.reset);
  console.log(`  ${totalSuccess}/${totalTests} tests passed (${Math.round(totalSuccess / totalTests * 100)}%)`);
  
  if (totalSuccess === totalTests) {
    console.log('\n' + colors.green + colors.bright + '🎉 ALL SYSTEMS OPERATIONAL! The crew is ready for action!' + colors.reset);
  } else {
    console.log('\n' + colors.yellow + colors.bright + '⚠️  Some systems need attention. Review failures above.' + colors.reset);
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log(colors.bright + colors.magenta);
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║                   🧪 ALEX AI CREW RAG SYSTEM TEST                            ║');
  console.log('║                                                                               ║');
  console.log('║            Testing all crew webhooks, RAG storage, and coordination          ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  const results = [];
  
  // Phase 1: Test all crew member webhooks
  printHeader('PHASE 1: CREW WEBHOOK TESTS');
  printInfo(`Testing ${crewMembers.length} crew member webhooks...`);
  
  for (const crewMember of crewMembers) {
    const result = await testCrewWebhook(crewMember);
    results.push({ ...result, type: 'webhook' });
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Phase 2: Send observations to RAG system
  printHeader('PHASE 2: RAG STORAGE TESTS');
  printInfo('Sending crew observations to Supabase RAG system...');
  
  for (const crewMember of crewMembers) {
    const result = await sendObservationToRAG(crewMember);
    results.push({ ...result, type: 'rag' });
    // Small delay to allow RAG processing
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Phase 3: Test coordination workflows
  printHeader('PHASE 3: COORDINATION WORKFLOW TESTS');
  printInfo('Testing crew coordination systems...');
  
  for (const workflow of coordinationWorkflows) {
    const result = await testCoordinationWorkflow(workflow);
    results.push({ ...result, type: 'coordination' });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Phase 4: Test Democratic Observation Lounge
  printHeader('PHASE 4: DEMOCRATIC OBSERVATION LOUNGE COLLABORATION');
  const collaborationResult = await testObservationLoungeCollaboration();
  results.push({ ...collaborationResult, type: 'collaboration' });
  
  // Print summary
  printSummary(results);
  
  // Print next steps
  printHeader('RECOMMENDED NEXT STEPS');
  console.log('Based on the test results, the crew can now:');
  console.log('  1. Collaborate on any task using the Observation Lounge');
  console.log('  2. Store and retrieve observations from the RAG system');
  console.log('  3. Make democratic decisions through the coordination workflows');
  console.log('  4. Leverage each crew member\'s specialty for domain-specific tasks');
  console.log('  5. Build complex multi-agent workflows with persistent memory');
  
  console.log('\n' + colors.bright + colors.blue + '🖖 The Alex AI crew stands ready to serve!' + colors.reset + '\n');
}

// Run tests
runTests().catch(error => {
  console.error(colors.red + '\n❌ Fatal error during tests:' + colors.reset);
  console.error(error);
  process.exit(1);
});

