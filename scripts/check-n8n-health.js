#!/usr/bin/env node
/**
 * N8N Health Check Script
 * 
 * Checks N8N server health and returns status
 * Used by monitoring systems and automated restart procedures
 * 
 * Commander Data's recommendation: Health check every 30 seconds
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';

/**
 * Check N8N health endpoint
 */
function checkN8NHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_BASE_URL}/healthz`);
    const timeout = 5000; // 5 second timeout
    
    const options = {
      method: 'GET',
      timeout: timeout
    };
    
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            status: 'healthy',
            statusCode: res.statusCode,
            response: body,
            timestamp: new Date().toISOString()
          });
        } else {
          resolve({
            status: 'unhealthy',
            statusCode: res.statusCode,
            response: body,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
    
    req.on('error', (error) => {
      resolve({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
    
    req.setTimeout(timeout);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json') || args.includes('-j');
  
  try {
    const health = await checkN8NHealth();
    
    if (jsonOutput) {
      console.log(JSON.stringify(health, null, 2));
      process.exit(health.status === 'healthy' ? 0 : 1);
    } else {
      if (health.status === 'healthy') {
        console.log('✅ N8N server is healthy');
        console.log(`   Status Code: ${health.statusCode}`);
        console.log(`   Timestamp: ${health.timestamp}`);
        process.exit(0);
      } else {
        console.error('❌ N8N server is unhealthy');
        console.error(`   Status: ${health.status}`);
        if (health.statusCode) {
          console.error(`   Status Code: ${health.statusCode}`);
        }
        if (health.error) {
          console.error(`   Error: ${health.error}`);
        }
        console.error(`   Timestamp: ${health.timestamp}`);
        process.exit(1);
      }
    }
  } catch (error) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2));
    } else {
      console.error('❌ Health check failed:', error.message);
    }
    process.exit(1);
  }
}

main();

