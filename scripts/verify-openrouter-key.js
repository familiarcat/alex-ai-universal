#!/usr/bin/env node
/**
 * 🖖 Verify OpenRouter API Key
 * 
 * Tests the OpenRouter API key to verify it's valid and working.
 * 
 * Usage:
 *   node scripts/verify-openrouter-key.js
 */

const https = require('https');
const { getCredential } = require('./utils/secure-credential-loader');

async function verifyKey() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 VERIFYING OPENROUTER API KEY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const apiKey = getCredential('OPENROUTER_API_KEY');
  
  if (!apiKey) {
    console.log('❌ OPENROUTER_API_KEY not found in ~/.zshrc or environment');
    console.log('\n💡 To add your API key:');
    console.log('   1. Get API key from https://openrouter.ai/keys');
    console.log('   2. Add to ~/.zshrc: export OPENROUTER_API_KEY="sk-or-v1-..."');
    console.log('   3. Reload: source ~/.zshrc\n');
    process.exit(1);
  }
  
  console.log(`✅ API Key found (length: ${apiKey.length})`);
  console.log(`   Format: ${apiKey.startsWith('sk-or-v1-') ? '✅ Valid format' : '⚠️  Unexpected format'}`);
  console.log(`   Preview: ${apiKey.substring(0, 15)}...\n`);
  
  // Test the key with a simple API call
  console.log('🧪 Testing API key with OpenRouter...\n');
  
  const body = JSON.stringify({
    model: 'openai/gpt-3.5-turbo', // Cheapest model for testing
    messages: [
      { role: 'user', content: 'Say "test" if you can read this.' }
    ],
    max_tokens: 10
  });
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'HTTP-Referer': 'https://alex-ai-universal.local',
        'X-Title': 'Alex AI Key Verification'
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            console.log('✅ API Key is VALID and working!');
            console.log(`   Response: ${json.choices?.[0]?.message?.content || 'Success'}\n`);
            resolve(true);
          } catch (e) {
            console.log('⚠️  API responded but response format unexpected');
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${data.substring(0, 200)}\n`);
            resolve(false);
          }
        } else {
          try {
            const errorJson = JSON.parse(data);
            const errorMsg = errorJson.error?.message || 'Unknown error';
            const errorCode = errorJson.error?.code || res.statusCode;
            
            console.log(`❌ API Key validation FAILED`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Error: ${errorMsg} (${errorCode})\n`);
            
            if (res.statusCode === 401) {
              console.log('💡 This API key is invalid or expired.');
              console.log('💡 Get a new key from: https://openrouter.ai/keys\n');
            }
          } catch (e) {
            console.log(`❌ HTTP ${res.statusCode}: ${data.substring(0, 200)}\n`);
          }
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Network error: ${error.message}\n`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Request timeout\n');
      resolve(false);
    });
    
    req.write(body);
    req.end();
  });
}

if (require.main === module) {
  verifyKey().then(valid => {
    process.exit(valid ? 0 : 1);
  }).catch(err => {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { verifyKey };

