#!/usr/bin/env node

/**
 * Observation Lounge Meeting Script
 * Calls all crew members to review RAG memories and provide honest observations
 */

const https = require('https');

const CREW_WEBHOOKS = {
  'Captain Picard': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-captain-jean-luc-picard',
    role: 'Strategic Leadership'
  },
  'Commander Data': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-commander-data',
    role: 'Android Analytics'
  },
  'Commander Riker': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-commander-william-riker',
    role: 'Tactical Execution'
  },
  'Geordi La Forge': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-lieutenant-commander-geordi-la-forge',
    role: 'Infrastructure'
  },
  'Lieutenant Worf': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-lieutenant-worf',
    role: 'Security & Compliance'
  },
  'Counselor Troi': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-counselor-deanna-troi',
    role: 'User Experience'
  },
  'Dr. Crusher': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-dr-beverly-crusher',
    role: 'Health & Diagnostics'
  },
  'Lieutenant Uhura': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-lieutenant-uhura',
    role: 'Communications & I/O'
  },
  'Quark': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-quark',
    role: 'Business Intelligence'
  },
  'Chief O\'Brien': {
    url: 'https://n8n.pbradygeorgen.com/webhook/crew-chief-obrien',
    role: 'Pragmatic Solutions'
  }
};

const OBSERVATION_PROMPT = `
OBSERVATION LOUNGE MEETING - POST-SYSTEM FAILURE ANALYSIS

We are reconvening after a system failure to reestablish our connections. 

Your mission:
1. Review available RAG memories about this project
2. Provide an HONEST observation about the current state of Alex AI Universal
3. Identify any concerns, opportunities, or recommendations from your specialty area
4. Comment on what you observe about the project's direction and health

Be candid. This is an observation lounge meeting - we need your genuine assessment, not just positivity.

Please provide your observations in the following format:
- Current State: What do you observe?
- Concerns: Any red flags or issues?
- Opportunities: What potential do you see?
- Recommendations: What should we prioritize?
`;

function callCrewMember(name, config) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.url);
    
    const postData = JSON.stringify({
      message: OBSERVATION_PROMPT,
      context: {
        meeting: 'observation_lounge',
        purpose: 'post_system_failure_analysis',
        timestamp: new Date().toISOString()
      }
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎭 Calling ${name} (${config.role})...`);
    console.log(`${'='.repeat(80)}\n`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${name} responded:\n`);
          console.log(response.response || response.message || data);
          console.log(`\n${'─'.repeat(80)}\n`);
          resolve({ name, role: config.role, response: response.response || response.message || data });
        } catch (e) {
          console.log(`✅ ${name} responded (raw):\n`);
          console.log(data);
          console.log(`\n${'─'.repeat(80)}\n`);
          resolve({ name, role: config.role, response: data });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ ${name} error:`, e.message);
      reject({ name, error: e.message });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject({ name, error: 'Request timeout' });
    });

    req.write(postData);
    req.end();
  });
}

async function runObservationLoungeMeeting() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(78) + '║');
  console.log('║' + '           🖖 OBSERVATION LOUNGE MEETING - CREW ASSEMBLY 🖖'.padEnd(78) + '║');
  console.log('║' + ' '.repeat(78) + '║');
  console.log('║' + '              Post-System Failure RAG Memory Analysis'.padEnd(78) + '║');
  console.log('║' + ' '.repeat(78) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');

  const startTime = Date.now();
  const results = [];
  const errors = [];

  // Call crew members sequentially for better readability
  for (const [name, config] of Object.entries(CREW_WEBHOOKS)) {
    try {
      const result = await callCrewMember(name, config);
      results.push(result);
    } catch (error) {
      errors.push(error);
    }
    
    // Small delay between calls to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Summary
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(78) + '║');
  console.log('║' + '                      📊 MEETING SUMMARY 📊'.padEnd(78) + '║');
  console.log('║' + ' '.repeat(78) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');
  console.log(`✅ Responses received: ${results.length}/${Object.keys(CREW_WEBHOOKS).length}`);
  console.log(`❌ Errors encountered: ${errors.length}`);
  console.log(`⏱️  Total duration: ${duration}s`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Failed crew members:');
    errors.forEach(err => {
      console.log(`   - ${err.name}: ${err.error}`);
    });
  }

  console.log('\n✨ Observation lounge meeting complete. All crew have reported.\n');
  
  return { results, errors, duration };
}

// Run the meeting
runObservationLoungeMeeting()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

