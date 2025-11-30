#!/usr/bin/env node
/**
 * Test Chief O'Brien Webhook
 */

const https = require('https');

function env(key, fallback = '') {
  return process.env[key] || fallback;
}

function postJSON(urlString, body) {
  const url = new URL(urlString);
  const payload = Buffer.from(JSON.stringify(body));
  
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const N8N_URL = env('N8N_URL', 'https://n8n.pbradygeorgen.com');
  
  console.log('');
  console.log('🔧 Testing Chief Miles O\'Brien...');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  const testPayload = {
    userRequest: "We have hydration errors in our dashboard. Should we use cookies, Supabase server components, or client-only rendering?",
    context: {
      currentApproach: "suppressHydrationWarning bandaids everywhere",
      issue: "Complex multi-layer sync, console errors",
      systemType: "authenticated dashboard",
      requiresSEO: false
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('📤 Sending request to Chief O\'Brien...');
  console.log('   URL:', `${N8N_URL}/webhook/crew-chief-obrien`);
  console.log('');
  
  try {
    const response = await postJSON(`${N8N_URL}/webhook/crew-chief-obrien`, testPayload);
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log('');
    
    if (response.status === 200 && response.data?.choices) {
      console.log('✅ Chief O\'Brien is OPERATIONAL!');
      console.log('');
      console.log('🔧 O\'Brien\'s Pragmatic Advice:');
      console.log('   ═══════════════════════════════════════');
      const advice = response.data.choices[0].message.content;
      console.log('');
      console.log(advice);
      console.log('');
      console.log('   ═══════════════════════════════════════');
      console.log('');
      console.log('✅ Integration successful!');
      console.log('✅ Chief O\'Brien is ready to serve with Alex AI');
    } else {
      console.log('⚠️  Unexpected response format:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('  - Workflow may not be activated');
    console.error('  - Webhook path may be incorrect');
    console.error('  - Network connectivity issue');
    console.error('');
    console.error('Manual activation: https://n8n.pbradygeorgen.com/workflow/MuaWfFowlkSDefSP');
  }
  
  console.log('');
}

main();

