#!/usr/bin/env node
/**
 * Webhook Health Monitor
 * 
 * Checks the health of critical n8n webhooks
 * Created by: Dr. Beverly Crusher (System Health & Diagnostics)
 * 
 * Usage: npm run n8n:health
 */

const axios = require('axios');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';

const CRITICAL_WEBHOOKS = [
  { name: 'Knowledge Ingest (RAG)', path: '/webhook/knowledge-ingest', method: 'POST' },
  { name: 'Knowledge Query (RAG)', path: '/webhook/knowledge-query', method: 'POST' },
  { name: 'Observation Lounge', path: '/webhook/observation-lounge', method: 'POST' },
  { name: 'Captain Picard', path: '/webhook/crew-captain-jean-luc-picard', method: 'POST' },
  { name: 'Commander Data', path: '/webhook/crew-commander-data', method: 'POST' },
  { name: 'Geordi La Forge', path: '/webhook/crew-lieutenant-commander-geordi-la-forge', method: 'POST' },
  { name: 'Lieutenant Worf', path: '/webhook/crew-lieutenant-worf', method: 'POST' },
  { name: 'Lieutenant Uhura', path: '/webhook/crew-lieutenant-uhura', method: 'POST' },
  { name: 'Counselor Troi', path: '/webhook/crew-counselor-deanna-troi', method: 'POST' },
  { name: 'Dr. Crusher', path: '/webhook/crew-dr-beverly-crusher', method: 'POST' },
  { name: 'Chief O\'Brien', path: '/webhook/crew-chief-obrien', method: 'POST' },
  { name: 'Commander Riker', path: '/webhook/crew-commander-william-riker', method: 'POST' },
];

async function checkWebhook(webhook) {
  try {
    const response = await axios.post(
      `${N8N_URL}${webhook.path}`,
      { 
        health_check: true,
        test: true,
        message: 'Health check from monitoring system'
      },
      { 
        timeout: 5000, 
        validateStatus: () => true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const isHealthy = response.status === 200 || response.status === 201;
    const status = isHealthy ? '✅' : (response.status === 404 ? '❌' : '⚠️');
    const statusText = isHealthy ? 'HEALTHY' : (response.status === 404 ? 'NOT REGISTERED' : `HTTP ${response.status}`);
    
    return {
      name: webhook.name,
      path: webhook.path,
      status: response.status,
      healthy: isHealthy,
      statusText,
      icon: status
    };
  } catch (error) {
    return {
      name: webhook.name,
      path: webhook.path,
      status: 0,
      healthy: false,
      statusText: `ERROR: ${error.message}`,
      icon: '❌'
    };
  }
}

async function main() {
  console.log('🏥 N8N Webhook Health Monitor\n');
  console.log(`Target: ${N8N_URL}`);
  console.log(`Checking ${CRITICAL_WEBHOOKS.length} webhooks...\n`);
  
  const results = [];
  
  for (const webhook of CRITICAL_WEBHOOKS) {
    const result = await checkWebhook(webhook);
    results.push(result);
    
    console.log(`${result.icon} ${result.name.padEnd(30)} ${result.statusText}`);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const healthy = results.filter(r => r.healthy).length;
  const unhealthy = results.filter(r => !r.healthy).length;
  const total = results.length;
  
  console.log(`📊 Summary:`);
  console.log(`   Total Webhooks: ${total}`);
  console.log(`   Healthy: ${healthy} ✅`);
  console.log(`   Unhealthy: ${unhealthy} ❌`);
  console.log(`   Health Rate: ${((healthy / total) * 100).toFixed(1)}%`);
  
  if (unhealthy > 0) {
    console.log('\n⚠️  Action Required:');
    console.log('   Some webhooks are not registered.');
    console.log('   Run: npm run n8n:activate-all');
    console.log('   Or manually toggle workflows in n8n UI');
  } else {
    console.log('\n✅ All webhooks are healthy!');
  }
  
  // Exit with error code if any webhooks are unhealthy
  process.exit(unhealthy > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
});

