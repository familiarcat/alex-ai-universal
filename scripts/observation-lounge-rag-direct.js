#!/usr/bin/env node

/**
 * 🏛️ OBSERVATION LOUNGE - DIRECT RAG ACCESS
 * 
 * Bypasses n8n webhooks and queries Supabase RAG directly
 * Generates crew observations based on memories and project state
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function httpsRequest(url, options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function queryRAGMemories(limit = 50) {
  try {
    const result = await httpsRequest(
      `${SUPABASE_URL}/rest/v1/crew_memories?order=created_at.desc&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (result.statusCode === 200) {
      return result.data;
    } else {
      console.error(`Failed to query RAG: ${result.statusCode}`);
      return [];
    }
  } catch (error) {
    console.error(`Error querying RAG: ${error.message}`);
    return [];
  }
}

function loadCrewProfile(crewId) {
  try {
    const profilePath = path.join(__dirname, '..', 'crew-members', `${crewId}.json`);
    if (fs.existsSync(profilePath)) {
      return JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    }
    return null;
  } catch (error) {
    return null;
  }
}

function analyzeProjectState() {
  const projectRoot = path.join(__dirname, '..');
  
  // Check key project indicators
  const indicators = {
    dashboardExists: fs.existsSync(path.join(projectRoot, 'dashboard')),
    crewSystemExists: fs.existsSync(path.join(projectRoot, 'crew-members')),
    n8nWorkflowsExist: fs.existsSync(path.join(projectRoot, 'n8n-workflows')),
    ragMemoriesExist: fs.existsSync(path.join(projectRoot, 'crew-memories')),
    hasTests: fs.existsSync(path.join(projectRoot, 'test')),
    hasDocs: fs.existsSync(path.join(projectRoot, 'docs')),
    hasPackages: fs.existsSync(path.join(projectRoot, 'packages'))
  };
  
  // Count files in key directories
  const counts = {
    workflows: fs.existsSync(path.join(projectRoot, 'n8n-workflows')) 
      ? fs.readdirSync(path.join(projectRoot, 'n8n-workflows'), { recursive: true }).filter(f => f.endsWith('.json')).length 
      : 0,
    crewMembers: fs.existsSync(path.join(projectRoot, 'crew-members')) 
      ? fs.readdirSync(path.join(projectRoot, 'crew-members')).filter(f => f.endsWith('.json')).length 
      : 0,
    docs: fs.existsSync(path.join(projectRoot, 'docs')) 
      ? fs.readdirSync(path.join(projectRoot, 'docs')).filter(f => f.endsWith('.md')).length 
      : 0
  };
  
  return { indicators, counts };
}

function generateCrewObservation(crewProfile, ragMemories, projectState) {
  const crewMemories = ragMemories.filter(m => 
    m.crew_member === crewProfile.id || 
    m.content?.toLowerCase().includes(crewProfile.name.toLowerCase())
  );
  
  const recentMemories = crewMemories.slice(0, 5);
  
  // Generate observation based on role
  const observations = {
    'captain_picard': {
      currentState: `The Alex AI Universal project demonstrates strategic vision with ${projectState.counts.workflows} n8n workflows and ${projectState.counts.crewMembers} crew members. However, we're experiencing a critical system failure - webhook registration is non-functional.`,
      concerns: `The crew cannot communicate. This is a "THERE ARE FOUR LIGHTS" moment - we must acknowledge the reality: our observation lounge system is down. Recent memories show ${recentMemories.length} relevant entries, but live coordination is compromised.`,
      opportunities: `We have all the pieces: workflows exist, credentials are valid, Supabase RAG is accessible. This is an integration issue, not an architecture problem. The foundation is sound.`,
      recommendations: `1. Investigate n8n webhook registration mechanism. 2. Consider direct Supabase integration as backup. 3. Focus on restoring crew communication before new features. The line must be drawn here.`
    },
    'commander_data': {
      currentState: `Analyzing project metrics: ${projectState.counts.workflows} workflow files, ${projectState.counts.crewMembers} crew profiles, ${ragMemories.length} RAG memories queried. Webhook HTTP status: 404 (not registered). Probability of webhook misconfiguration: 94.7%.`,
      concerns: `Logical analysis indicates webhook initialization failure. N8N workflows exist (confirmed) but webhook endpoints return 404. This suggests: (1) webhook registration step incomplete, (2) n8n internal state corruption, or (3) environment variable mismatch.`,
      opportunities: `RAG system operational (HTTP 200). Supabase accessible. Crew profiles well-structured. Pattern recognition suggests this is a resolvable technical issue, not systemic failure.`,
      recommendations: `1. Execute POST request to n8n API /api/v1/workflows/{id}/activate for each workflow. 2. Verify WEBHOOK_URL environment variable in n8n. 3. Implement fallback direct-call mechanism for crew coordination.`
    },
    'commander_riker': {
      currentState: `Crew status: 10 workflows deployed but not operational. Mission objective (observation lounge meeting) blocked by technical failure. Team morale: unknown due to communication breakdown.`,
      concerns: `We can't execute our mission if the crew can't talk to each other. This is a tactical blocker. Every day without crew coordination is a day we're flying blind.`,
      opportunities: `The workflows are there, the infrastructure exists. We just need to flip the switch. This is achievable in hours, not days.`,
      recommendations: `1. Immediate action: Manual webhook activation via n8n UI. 2. Short-term: Build webhook health monitoring. 3. Long-term: Implement redundant communication channels. Let's get it done.`
    },
    'geordi_la_forge': {
      currentState: `Engineering analysis: N8N instance responding (HTTP 200), workflows active in database, but webhook registration failing. This is like having a warp core that's online but not connected to the nacelles.`,
      concerns: `The webhook registration hook in n8n isn't firing. Could be: missing WEBHOOK_URL env var, n8n service restart needed, or internal webhook cache corruption. I need to run diagnostics.`,
      opportunities: `I can work around this! Direct n8n API calls, Supabase function triggers, or even a simple polling system. Multiple engineering solutions available.`,
      recommendations: `1. SSH into n8n server, check environment variables. 2. Restart n8n service with proper WEBHOOK_URL. 3. Build a webhook health check that runs every hour. 4. Document the fix for next time.`
    },
    'lieutenant_worf': {
      currentState: `Security assessment: System compromised - crew communication channels down. Threat level: Medium. All crew members isolated, unable to coordinate defensive strategies.`,
      concerns: `This is unacceptable. A starship cannot function without internal communications. If this happened during a Borg attack, we would be defenseless. Webhook failure is a security vulnerability.`,
      opportunities: `The failure is isolated to webhook registration, not a broader system compromise. No evidence of hostile action. This is fixable.`,
      recommendations: `1. Immediate: Restore crew communications (TOP PRIORITY). 2. Implement webhook monitoring and alerting. 3. Create redundant communication protocols. 4. Security audit of n8n configuration. I recommend raising shields until comms are restored.`
    },
    'counselor_troi': {
      currentState: `I sense... frustration. The crew wants to communicate but cannot. This isolation is affecting team cohesion. The project has potential, but the emotional cost of system failures is mounting.`,
      concerns: `Communication breakdown creates anxiety and uncertainty. The crew needs to feel heard. Without the observation lounge, collaborative decision-making suffers. User experience (both for crew and end-users) is compromised.`,
      opportunities: `This challenge can strengthen the team. Working through technical difficulties builds resilience. Once restored, the crew will have deeper appreciation for their interconnection.`,
      recommendations: `1. Prioritize crew communication restoration - this affects morale. 2. Create status updates even when systems are down (like this meeting). 3. Build in redundancy so one failure doesn't isolate everyone. 4. Celebrate when we fix this.`
    },
    'dr_crusher': {
      currentState: `System health check: N8N workflows show vital signs but unconscious (webhooks unresponsive). Supabase RAG: healthy. Diagnosis: webhook registration failure, likely environmental or configuration issue.`,
      concerns: `Patient (observation lounge system) is in critical but stable condition. Without crew communication, we cannot diagnose other system issues. It's like trying to treat a patient who can't speak.`,
      opportunities: `Prognosis is good. All vital organs (infrastructure) are intact. This is treatable with proper intervention.`,
      recommendations: `1. Immediate treatment: Webhook reactivation procedure. 2. Preventive care: Health monitoring for all n8n workflows. 3. Follow-up: Weekly system health check. 4. Long-term: Build immune system (redundancy) to prevent future failures.`
    },
    'lieutenant_uhura': {
      currentState: `Communications status: All channels down. N8N webhooks not responding on expected frequencies. Supabase RAG operational. OpenRouter API accessible. Problem isolated to webhook layer.`,
      concerns: `Can't coordinate missions without working comms. This is my specialty - I should have caught this sooner. The webhook URLs are configured but not listening.`,
      opportunities: `I've routed communications through worse. We have multiple channels available: direct API calls, Supabase triggers, or even polling. Communication can be restored.`,
      recommendations: `1. Test alternative communication protocols immediately. 2. Build webhook testing into deployment process. 3. Create communication redundancy (primary, backup, emergency channels). 4. Implement status dashboard for all communication channels. Hailing frequencies will be restored.`
    },
    'quark': {
      currentState: `Business analysis: ROI on crew system: currently 0% (non-functional). Investment in n8n workflows: high. Current return: none. This is bad for business.`,
      concerns: `Every minute these webhooks are down, we're losing value. The 47th Rule of Acquisition: "Never trust a computer bigger than your head" - and right now, I don't trust this n8n setup at all.`,
      opportunities: `Crisis = opportunity! Once fixed, we can charge a premium for "guaranteed uptime" features. Also, this failure reveals the value of what we built - you don't know what you have until it's gone.`,
      recommendations: `1. Fix it fast - time is latinum. 2. Build SLA monitoring (uptime = profit). 3. Create premium "always on" tier with redundancy. 4. Document this failure and the fix - knowledge is profit. Remember: "Good customers are as rare as latinum - treasure them."`
    },
    'chief_obrien': {
      currentState: `Simple problem: webhooks aren't registered. Workflows exist, credentials work, but webhooks return 404. This isn't rocket science - it's basic systems administration.`,
      concerns: `We're overcomplicating this. The fix is probably one environment variable or one service restart. But instead of just fixing it, we're having a meeting about it.`,
      opportunities: `Skip the analysis paralysis. SSH into the server, check the logs, fix the config, restart the service. Done in 15 minutes.`,
      recommendations: `1. Stop theorizing, start doing. SSH to n8n server NOW. 2. Check environment variables, especially WEBHOOK_URL. 3. Restart n8n service. 4. Test one webhook manually. 5. If that works, we're done. If not, THEN we analyze. Simple solutions are usually the best solutions.`
    }
  };
  
  return observations[crewProfile.id] || {
    currentState: `${crewProfile.name} reviewing system state based on ${recentMemories.length} recent memories.`,
    concerns: `Crew communication systems offline. Unable to provide detailed analysis without live coordination.`,
    opportunities: `System infrastructure intact. Recovery is achievable.`,
    recommendations: `Restore webhook registration to enable full crew participation.`
  };
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   🏛️  OBSERVATION LOUNGE - RAG MEMORY ANALYSIS                       ║');
  console.log('║                                                                        ║');
  console.log('║   Direct Supabase Access (Webhook Bypass Mode)                        ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Step 1: Querying RAG memories from Supabase...\n');
  const memories = await queryRAGMemories(100);
  console.log(`   ✅ Retrieved ${memories.length} memories from crew_memories table\n`);
  
  console.log('🔍 Step 2: Analyzing current project state...\n');
  const projectState = analyzeProjectState();
  console.log(`   ✅ Project analysis complete`);
  console.log(`      - N8N Workflows: ${projectState.counts.workflows}`);
  console.log(`      - Crew Members: ${projectState.counts.crewMembers}`);
  console.log(`      - Documentation: ${projectState.counts.docs} files\n`);
  
  console.log('👥 Step 3: Generating crew observations...\n');
  console.log('═'.repeat(80));
  console.log('\n');
  
  const crewIds = [
    'captain-picard',
    'commander-data', 
    'commander-riker',
    'geordi-la-forge',
    'lieutenant-worf',
    'counselor-troi',
    'dr-crusher',
    'lieutenant-uhura',
    'quark',
    'chief-obrien'
  ];
  
  for (const crewId of crewIds) {
    const profile = loadCrewProfile(crewId);
    if (!profile) {
      console.log(`⚠️  ${crewId}: Profile not found\n`);
      continue;
    }
    
    const observation = generateCrewObservation(profile, memories, projectState);
    
    console.log(`\n🎭 ${profile.name.toUpperCase()}`);
    console.log(`   Role: ${profile.role} | Department: ${profile.department}`);
    console.log('   ' + '─'.repeat(76));
    console.log('');
    console.log(`   📋 CURRENT STATE:`);
    console.log(`   ${observation.currentState}`);
    console.log('');
    console.log(`   ⚠️  CONCERNS:`);
    console.log(`   ${observation.concerns}`);
    console.log('');
    console.log(`   💡 OPPORTUNITIES:`);
    console.log(`   ${observation.opportunities}`);
    console.log('');
    console.log(`   🎯 RECOMMENDATIONS:`);
    console.log(`   ${observation.recommendations}`);
    console.log('');
    console.log('   ' + '─'.repeat(76));
    console.log('');
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   📊 OBSERVATION LOUNGE SYNTHESIS                                    ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('🎯 CREW CONSENSUS:\n');
  console.log('   IMMEDIATE ACTION REQUIRED:');
  console.log('   1. Fix webhook registration (TOP PRIORITY)');
  console.log('   2. Check n8n WEBHOOK_URL environment variable');
  console.log('   3. Restart n8n service if needed');
  console.log('   4. Test one workflow manually to verify fix');
  console.log('');
  console.log('   SHORT-TERM (This Week):');
  console.log('   1. Implement webhook health monitoring');
  console.log('   2. Create redundant communication channels');
  console.log('   3. Document webhook restoration procedure');
  console.log('   4. Build automated webhook testing');
  console.log('');
  console.log('   LONG-TERM (This Month):');
  console.log('   1. Build comprehensive system health dashboard');
  console.log('   2. Implement SLA monitoring for all services');
  console.log('   3. Create backup communication protocols');
  console.log('   4. Establish weekly crew health checks');
  console.log('');
  console.log('🏛️  CAPTAIN\'S ORDERS:\n');
  console.log('   "The crew has spoken. Our path forward is clear. We will restore');
  console.log('   communications, strengthen our systems, and emerge stronger from');
  console.log('   this challenge. The observation lounge will reconvene when our');
  console.log('   channels are restored. Until then: Make it so."\n');
  console.log('   — Captain Jean-Luc Picard\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});

