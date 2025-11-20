#!/usr/bin/env node

/**
 * 🎯 Push Milestone to Supabase Vector Database via N8N
 * 
 * Stores milestone information in Supabase RAG system via n8n knowledge-ingest webhook
 * Includes vector embedding generation for semantic search
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load credentials
function loadCrewCredentials() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const n8nUrlMatch = zshrcContent.match(/export N8N_URL=['"]?([^'"\n]+)['"]?/);
    const n8nBaseUrl = n8nUrlMatch ? n8nUrlMatch[1] : 'https://n8n.pbradygeorgen.com';
    
    return { n8nBaseUrl };
  } catch (error) {
    console.error('❌ Failed to load credentials:', error.message);
    return { n8nBaseUrl: 'https://n8n.pbradygeorgen.com' };
  }
}

// Read milestone file
function readMilestoneFile(milestonePath) {
  try {
    const content = fs.readFileSync(milestonePath, 'utf8');
    
    // Extract key information from markdown
    const titleMatch = content.match(/#\s+(.+)/);
    const dateMatch = content.match(/\*\*Date:\*\*\s+(.+)/);
    
    // Extract achievements section
    const achievementsMatch = content.match(/## 📊 Achievements([\s\S]*?)(?=##|$)/);
    
    // Extract crew contributions
    const crewMatch = content.match(/## 🎭 Crew Contributions([\s\S]*?)(?=##|$)/);
    
    // Extract metrics
    const metricsMatch = content.match(/## 📈 Metrics([\s\S]*?)(?=##|$)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : 'Milestone',
      date: dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0],
      content: content,
      achievements: achievementsMatch ? achievementsMatch[1].trim() : '',
      crewContributions: crewMatch ? crewMatch[1].trim() : '',
      metrics: metricsMatch ? metricsMatch[1].trim() : ''
    };
  } catch (error) {
    console.error('❌ Failed to read milestone file:', error.message);
    return null;
  }
}

// Create RAG payload
function createRAGPayload(milestoneData) {
  // Generate semantic text for vector embedding
  const semanticText = `
Milestone Achievement: ${milestoneData.title}
Date: ${milestoneData.date}

${milestoneData.achievements}

Crew Contributions:
${milestoneData.crewContributions}

Metrics:
${milestoneData.metrics}

This milestone represents significant progress in the Alex AI project. The crew has successfully completed comprehensive status briefing and action items execution. All systems are operational and ready for next phase of development.
`;

  return {
    body: {
      title: milestoneData.title,
      text: semanticText,
      content: milestoneData.content,
      tags: [
        'milestone',
        'observation-lounge',
        'crew-briefing',
        'action-items',
        'ddd-architecture',
        'n8n-integration',
        'supabase-migration',
        'project-status',
        'infrastructure',
        'git-milestone',
        'role-infrastructure',
        'intention-milestone_tracking'
      ],
      source: 'milestone',
      doc_id: `MILESTONE_${milestoneData.date.replace(/-/g, '_')}`,
      crewMember: 'data', // Commander Data for technical milestones
      knowledgeType: 'milestone',
      priority: 'high',
      platform: 'git',
      sessionId: `milestone-${milestoneData.date}`,
      metadata: {
        date: milestoneData.date,
        type: 'milestone',
        category: 'project-status',
        crew_relevance: {
          all_crew: 0.9,
          commander_data: 0.95,
          chief_obrien: 0.9,
          lieutenant_commander_la_forge: 0.9
        }
      }
    }
  };
}

// Push to n8n webhook
function pushToN8N(n8nBaseUrl, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL('/webhook/knowledge-ingest', n8nBaseUrl);
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
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
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

// Store locally for later push
function storeForLaterPush(payload, milestonePath) {
  const pendingDir = path.join(__dirname, '..', '.backup-ec2-emergency', 'pending-rag-pushes');
  if (!fs.existsSync(pendingDir)) {
    fs.mkdirSync(pendingDir, { recursive: true });
  }
  
  const filename = `milestone-${Date.now()}.json`;
  const filepath = path.join(pendingDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify({
    payload,
    milestonePath,
    timestamp: new Date().toISOString(),
    retryCount: 0
  }, null, 2));
  
  return filepath;
}

// Main execution
async function main() {
  console.log('🎯 Push Milestone to Supabase Vector Database via N8N');
  console.log('=====================================================\n');
  
  // Get milestone file path
  const milestonePath = process.argv[2] || path.join(__dirname, '..', 'MILESTONE_2025-11-19_OBSERVATION_LOUNGE_STATUS_BRIEFING.md');
  
  if (!fs.existsSync(milestonePath)) {
    console.error(`❌ Milestone file not found: ${milestonePath}`);
    process.exit(1);
  }
  
  console.log(`📄 Reading milestone: ${path.basename(milestonePath)}`);
  const milestoneData = readMilestoneFile(milestonePath);
  
  if (!milestoneData) {
    console.error('❌ Failed to parse milestone file');
    process.exit(1);
  }
  
  console.log(`   Title: ${milestoneData.title}`);
  console.log(`   Date: ${milestoneData.date}\n`);
  
  // Load credentials
  const { n8nBaseUrl } = loadCrewCredentials();
  console.log(`🔗 N8N Base URL: ${n8nBaseUrl}\n`);
  
  // Create RAG payload
  console.log('📦 Creating RAG payload...');
  const payload = createRAGPayload(milestoneData);
  console.log('   ✅ Payload created\n');
  
  // Try to push to n8n
  console.log('🚀 Pushing to N8N webhook...');
  try {
    const result = await pushToN8N(n8nBaseUrl, payload);
    console.log(`✅ Success! Status: ${result.status}`);
    console.log(`📊 Response: ${result.body.substring(0, 200)}...\n`);
    console.log('🎉 Milestone successfully pushed to Supabase vector database via N8N!');
    console.log('🖖 The milestone is now searchable in the RAG system.\n');
    return;
  } catch (error) {
    console.log(`⚠️  Push failed: ${error.message}\n`);
    
    if (error.message.includes('404') || error.message.includes('not registered')) {
      console.log('📋 WORKFLOW NOT ACTIVE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('The knowledge-ingest webhook is not registered (workflow inactive).');
      console.log('\nTo activate:');
      console.log('1. Visit: https://n8n.pbradygeorgen.com');
      console.log('2. Open the "Knowledge Ingest (Crew Memories => Supabase RAG)" workflow');
      console.log('3. Toggle the activation switch (top-right)');
      console.log('4. Wait for webhook registration');
      console.log('5. Re-run this script\n');
      
      // Store for later push
      const pendingPath = storeForLaterPush(payload, milestonePath);
      console.log(`💾 Milestone payload saved for later push:`);
      console.log(`   ${pendingPath}\n`);
      console.log('Once the workflow is active, you can retry the push.');
    } else {
      console.log('❌ Unexpected error occurred');
      console.log('   Error:', error.message);
      
      // Store for later push anyway
      const pendingPath = storeForLaterPush(payload, milestonePath);
      console.log(`\n💾 Milestone payload saved for later push:`);
      console.log(`   ${pendingPath}`);
    }
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
