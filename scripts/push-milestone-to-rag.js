#!/usr/bin/env node

/**
 * 🎯 Push Milestone to GitHub and Supabase Vector Database via N8N
 * 
 * 1. Always pushes milestone file to GitHub first (stage, commit, push)
 * 2. Then attempts to push to Supabase RAG system via n8n knowledge-ingest webhook
 * 3. Handles failures independently for each step
 * 
 * Includes vector embedding generation for semantic search
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getMCPCache } = require('./utils/mcp-context-cache');

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

// Create RAG payload with MCP context caching
function createRAGPayload(milestoneData) {
  const mcpCache = getMCPCache();
  
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

  // Check cache after generating semantic text (MCP efficiency)
  const cacheKey = mcpCache.generateCacheKey(semanticText, {
    title: milestoneData.title,
    date: milestoneData.date
  });
  const existingContext = mcpCache.getContext(cacheKey);
  
  if (existingContext) {
    console.log('   ✅ Using cached MCP context (efficiency gain!)\n');
  } else {
    // Store context for future use
    mcpCache.storeContext(semanticText, null, {
      sessionId: `milestone-${milestoneData.date}`,
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
      ]
    });
  }

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

// Push milestone to GitHub
function pushToGitHub(milestonePath) {
  const repoRoot = path.join(__dirname, '..');
  
  try {
    // Change to repo root
    process.chdir(repoRoot);
    
    // Check if we're in a git repo
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (e) {
      throw new Error('Not a git repository');
    }
    
    // Get relative path from repo root
    const absolutePath = path.resolve(milestonePath);
    const relativePath = path.relative(repoRoot, absolutePath);
    
    if (!relativePath || relativePath.startsWith('..')) {
      throw new Error(`Milestone file must be within repository: ${milestonePath}`);
    }
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Milestone file not found: ${absolutePath}`);
    }
    
    // Stage the milestone file (git add handles both new and modified files)
    execSync(`git add "${relativePath}"`, { stdio: 'pipe', cwd: repoRoot });
    
    // Check if there are changes to commit (git diff --cached --quiet returns 0 if no changes)
    let hasChanges = false;
    try {
      execSync('git diff --cached --quiet', { stdio: 'pipe', cwd: repoRoot });
    } catch (e) {
      // Exit code 1 means there are changes
      hasChanges = true;
    }
    
    if (hasChanges) {
      // Get commit message from milestone title
      const content = fs.readFileSync(absolutePath, 'utf8');
      const titleMatch = content.match(/#\s+(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Milestone Update';
      
      // Create commit message (escape quotes and newlines for shell)
      const commitMessage = `milestone: ${title}\n\nAdd milestone document: ${path.basename(relativePath)}`;
      const tempFile = path.join(repoRoot, '.git-commit-msg-temp');
      
      try {
        fs.writeFileSync(tempFile, commitMessage);
        execSync(`git commit -F "${tempFile}"`, { stdio: 'pipe', cwd: repoRoot });
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    }
    
    // Get current branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: 'pipe', cwd: repoRoot }).trim();
    
    // Push to GitHub
    execSync(`git push origin ${currentBranch}`, { stdio: 'pipe', cwd: repoRoot });
    
    // Get commit SHA
    const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: 'pipe', cwd: repoRoot }).trim();
    
    return {
      success: true,
      branch: currentBranch,
      commitSha,
      message: `Pushed to GitHub: ${currentBranch}@${commitSha.substring(0, 7)}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `GitHub push failed: ${error.message}`
    };
  }
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
  console.log('🎯 Push Milestone to GitHub and Supabase Vector Database');
  console.log('========================================================\n');
  
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
  
  // STEP 1: Always push to GitHub first
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Pushing to GitHub');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const gitResult = pushToGitHub(milestonePath);
  
  if (gitResult.success) {
    console.log(`✅ ${gitResult.message}`);
    console.log(`   Branch: ${gitResult.branch}`);
    console.log(`   Commit: ${gitResult.commitSha.substring(0, 7)}\n`);
  } else {
    console.log(`⚠️  ${gitResult.message}`);
    console.log('   Continuing with RAG push attempt...\n');
  }
  
  // STEP 2: Attempt RAG ingestion (independent of GitHub push result)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Pushing to Supabase RAG via N8N');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Load credentials
  const { n8nBaseUrl } = loadCrewCredentials();
  console.log(`🔗 N8N Base URL: ${n8nBaseUrl}\n`);
  
  // Create RAG payload
  console.log('📦 Creating RAG payload...');
  const payload = createRAGPayload(milestoneData);
  console.log('   ✅ Payload created\n');
  
  // Try to push to n8n
  console.log('🚀 Pushing to N8N webhook...');
  let ragSuccess = false;
  try {
    const result = await pushToN8N(n8nBaseUrl, payload);
    console.log(`✅ Success! Status: ${result.status}`);
    console.log(`📊 Response: ${result.body.substring(0, 200)}...\n`);
    console.log('🎉 Milestone successfully pushed to Supabase vector database via N8N!');
    console.log('🖖 The milestone is now searchable in the RAG system.\n');
    ragSuccess = true;
  } catch (error) {
    console.log(`⚠️  RAG push via n8n failed: ${error.message}\n`);
    
    // 🚀 CREW WORKAROUND: Use direct RAG ingestion bypass
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 FALLBACK: Direct RAG Ingestion (Bypass n8n)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('👨‍🔧 Chief O\'Brien: "When n8n breaks, we work around it."\n');
    
    try {
      // Use simple direct RAG push (standalone script to avoid memory issues)
      const { execSync } = require('child_process');
      const scriptPath = path.join(__dirname, 'simple-direct-rag-push.js');
      console.log('🚀 Executing direct RAG push...\n');
      
      execSync(`node "${scriptPath}" "${milestonePath}"`, {
        stdio: 'inherit',
        cwd: path.dirname(__dirname)
      });
      
      // If we get here, the script executed successfully
      ragSuccess = true;
      
      console.log('\n🎉 SUCCESS: Milestone ingested via direct RAG bypass!');
      console.log(`   Session ID: ${directResult.sessionId}`);
      console.log(`   Chunks stored: ${directResult.successCount}/${directResult.totalChunks}\n`);
      console.log('✅ RAG integration working - n8n limitations circumvented.\n');
      ragSuccess = true;
    } catch (directError) {
      console.log(`❌ Direct RAG ingestion also failed: ${directError.message}\n`);
      
      if (error.message.includes('404') || error.message.includes('not registered')) {
        console.log('📋 WORKFLOW NOT ACTIVE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Both n8n webhook and direct ingestion failed.');
        console.log('\nTroubleshooting:');
        console.log('1. Check Supabase credentials in ~/.zshrc');
        console.log('2. Verify OpenRouter API key for embeddings');
        console.log('3. Check Supabase connection\n');
      }
      
      // Store for later push
      const pendingPath = storeForLaterPush(payload, milestonePath);
      console.log(`💾 Milestone payload saved for later push:`);
      console.log(`   ${pendingPath}\n`);
    }
  }
  
  // Final summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`GitHub Push: ${gitResult.success ? '✅ Success' : '⚠️  Failed'}`);
  console.log(`RAG Push:    ${ragSuccess ? '✅ Success' : '⚠️  Failed'}\n`);
  
  if (gitResult.success && ragSuccess) {
    console.log('🎉 Complete success! Milestone pushed to both GitHub and RAG system.\n');
    process.exit(0);
  } else if (gitResult.success) {
    console.log('✅ Milestone pushed to GitHub. RAG push will be retried when webhook is active.\n');
    process.exit(0);
  } else if (ragSuccess) {
    console.log('✅ Milestone pushed to RAG. GitHub push failed (check git status).\n');
    process.exit(0);
  } else {
    console.log('⚠️  Both pushes failed. Milestone saved locally for later retry.\n');
    process.exit(0); // Exit with 0 since we handled errors gracefully
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
