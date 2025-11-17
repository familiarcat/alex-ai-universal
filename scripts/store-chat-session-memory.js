#!/usr/bin/env node
/**
 * Store Chat Session Memory to Supabase via N8N
 * 
 * DDD Architecture: Client (this script) => N8N (workflow processing) => Supabase (storage)
 * 
 * Maintains:
 * - Ambiguity workflows (Prime Directive compliance)
 * - Memory optimization workflows
 * - Vector embedding generation
 * - Cross-platform memory sync
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

// Load credentials
const creds = loadCrewCredentials();
const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';

/**
 * Send memory to N8N workflow for processing and storage
 */
function sendToN8N(webhookPath, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_BASE_URL}/webhook/${webhookPath}`);
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
          reject(new Error(`N8N workflow returned ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Extract and format chat session knowledge
 */
function formatChatSessionMemory(chatSummary) {
  // Format according to crew memory storage workflow expectations
  // This will be processed by N8N with ambiguity and optimization workflows
  
  return {
    // Core memory content
    title: chatSummary.title || 'Chat Session Memory',
    summary: chatSummary.summary || chatSummary.description || '',
    detailedAnalysis: chatSummary.detailedAnalysis || chatSummary.content || '',
    
    // Crew member information (Data for technical analysis)
    crewMember: 'data', // Commander Data for technical/system analysis
    knowledgeType: 'technical_analysis', // Can be: technical_analysis, strategic_assessment, etc.
    priority: chatSummary.priority || 'medium',
    
    // Key findings and conclusions
    keyFindings: chatSummary.keyFindings || [],
    conclusions: chatSummary.conclusions || [],
    recommendations: chatSummary.recommendations || [],
    
    // Tags and metadata
    tags: chatSummary.tags || ['chat-session', 'cursor-ai', 'milestone-automation'],
    
    // Session metadata
    sessionId: chatSummary.sessionId || `chat-${Date.now()}`,
    platform: 'cursor-ai',
    timestamp: new Date().toISOString(),
    
    // Prime Directive compliance - let N8N workflow handle ambiguity
    // The workflow will generalize content and extract principles
  };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Default chat session summary (can be overridden via command line or file)
  const defaultChatSummary = {
    title: 'Milestone Automation System Enhancement - Chat Session',
    summary: 'Enhanced milestone push system to be fully automated with zero prompts, error handling, and monitoring support. Implemented DDD architecture for memory storage.',
    detailedAnalysis: `
This chat session focused on enhancing the milestone push automation system:

1. **Fully Automated Milestone Creation**
   - Removed all prompts and interactive elements
   - Set non-interactive defaults (GIT_EDITOR, GIT_TERMINAL_PROMPT, etc.)
   - All Git commands run silently and automatically

2. **Error Handling**
   - Added error_exit() function for consistent error reporting
   - All failures exit with clear error messages
   - Error trap catches unexpected failures
   - No silent failures

3. **Handles Edge Cases**
   - Detects when there are no changes to commit
   - Creates empty commit with --allow-empty for milestone tracking
   - Provides clear status messages

4. **Monitoring Support**
   - Created monitor-milestone-failures.js for Data watch mode
   - Can monitor specific milestone executions
   - Watch mode for continuous monitoring
   - Logs all failures for analysis

5. **Memory Storage Integration**
   - Maintains DDD architecture: Client => N8N => Supabase
   - Preserves ambiguity workflows (Prime Directive compliance)
   - Preserves memory optimization workflows
   - Vector embedding generation via N8N

**Key Technical Decisions:**
- All automation runs without user interaction
- Error messages are clear and actionable
- Monitoring enables proactive failure detection
- Memory storage maintains architectural patterns
    `.trim(),
    keyFindings: [
      'Milestone automation can be fully non-interactive',
      'Error handling prevents silent failures',
      'Monitoring enables proactive issue detection',
      'DDD architecture maintains separation of concerns'
    ],
    conclusions: [
      'Fully automated milestone system is production-ready',
      'Error handling improves reliability',
      'Monitoring support enables operational excellence'
    ],
    recommendations: [
      'Use monitor-milestone-failures.js for production monitoring',
      'Continue maintaining DDD architecture for memory storage',
      'Leverage N8N workflows for ambiguity and optimization processing'
    ],
    tags: ['milestone-automation', 'error-handling', 'monitoring', 'ddd-architecture', 'cursor-ai'],
    priority: 'high'
  };
  
  let chatSummary = defaultChatSummary;
  
  // Allow override via JSON file
  if (args[0] && args[0].endsWith('.json')) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(process.cwd(), args[0]);
    chatSummary = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log('Usage:');
    console.log('  node scripts/store-chat-session-memory.js                    # Use default chat summary');
    console.log('  node scripts/store-chat-session-memory.js chat-summary.json  # Use JSON file');
    console.log('');
    console.log('The script sends chat session memory through N8N workflow to Supabase');
    console.log('Maintains DDD architecture: Client => N8N => Supabase');
    console.log('Preserves ambiguity and memory optimization workflows');
    process.exit(0);
  }
  
  console.log('📚 Storing Chat Session Memory...');
  console.log(`   Title: ${chatSummary.title}`);
  console.log(`   N8N URL: ${N8N_BASE_URL}`);
  console.log('');
  
  // Format memory according to workflow expectations
  const memoryPayload = formatChatSessionMemory(chatSummary);
  
  try {
    console.log('🔄 Sending to N8N workflow (crew-memory-storage)...');
    console.log('   This will process through ambiguity and optimization workflows');
    console.log('');
    
    const result = await sendToN8N('crew-memory-storage', memoryPayload);
    
    console.log('✅ Memory sent to N8N workflow successfully');
    console.log(`   Status: ${result.status}`);
    console.log('');
    console.log('📊 Processing Flow:');
    console.log('   1. Client (this script) => N8N workflow');
    console.log('   2. N8N => Prime Directive compliance processing');
    console.log('   3. N8N => Ambiguity handling & optimization');
    console.log('   4. N8N => Vector embedding generation');
    console.log('   5. N8N => Supabase storage');
    console.log('');
    console.log('✅ Chat session memory stored with DDD architecture intact');
    
  } catch (error) {
    console.error('❌ Failed to store chat session memory:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   - Check N8N workflow is active: https://n8n.pbradygeorgen.com');
    console.error('   - Verify webhook path: /webhook/crew-memory-storage');
    console.error('   - Check credentials in ~/.zshrc');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

