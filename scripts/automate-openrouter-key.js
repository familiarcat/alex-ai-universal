#!/usr/bin/env node
/**
 * 🖖 Automated OpenRouter API Key Management
 * 
 * Uses OpenRouter Provisioning API to programmatically:
 * - List existing API keys
 * - Create new API keys
 * - Rotate/update keys
 * - Update ~/.zshrc automatically
 * 
 * Requires: OPENROUTER_PROVISIONING_KEY in ~/.zshrc
 * 
 * Usage:
 *   node scripts/automate-openrouter-key.js [--create] [--list] [--update-zshrc]
 */

const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getCredential } = require('./utils/secure-credential-loader');

const PROVISIONING_API_BASE = 'https://openrouter.ai/api/v1/keys';
const ZSHRC_PATH = path.join(os.homedir(), '.zshrc');

function arg(name, def = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') 
    ? process.argv[i + 1] 
    : def;
}

function hasFlag(flag) {
  return process.argv.includes(`--${flag}`);
}

function makeRequest(method, path, data = null) {
  const provisioningKey = getCredential('OPENROUTER_PROVISIONING_KEY');
  
  if (!provisioningKey) {
    throw new Error('OPENROUTER_PROVISIONING_KEY not found in ~/.zshrc or environment');
  }

  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${provisioningKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          try {
            const error = JSON.parse(responseData);
            reject(new Error(`HTTP ${res.statusCode}: ${error.error?.message || responseData}`));
          } catch (e) {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function listKeys() {
  console.log('\n📋 Listing OpenRouter API Keys...\n');
  
  try {
    const response = await makeRequest('GET', '/api/v1/keys');
    const keys = response.data || [];
    
    if (keys.length === 0) {
      console.log('   No API keys found.\n');
      return null;
    }
    
    console.log(`   Found ${keys.length} key(s):\n`);
    keys.forEach((key, i) => {
      console.log(`   ${i + 1}. ${key.name || 'Unnamed'}`);
      console.log(`      ID: ${key.id}`);
      console.log(`      Created: ${key.created_at || 'Unknown'}`);
      console.log('');
    });
    
    return keys[0]; // Return most recent
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    throw error;
  }
}

async function createKey(name = 'Alex AI - Auto-generated') {
  console.log(`\n🔑 Creating new OpenRouter API Key: "${name}"...\n`);
  
  try {
    const response = await makeRequest('POST', '/api/v1/keys', { name });
    const newKey = response.data || response;
    
    console.log('   ✅ Key created successfully!\n');
    console.log(`   Name: ${newKey.name || name}`);
    console.log(`   Key: ${newKey.id}`);
    console.log('');
    
    return newKey;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    throw error;
  }
}

function updateZshrc(apiKey) {
  console.log('📝 Updating ~/.zshrc...\n');
  
  let zshrcContent = '';
  try {
    zshrcContent = fs.readFileSync(ZSHRC_PATH, 'utf8');
  } catch (e) {
    console.log('   ⚠️  ~/.zshrc not found, creating new file...\n');
    zshrcContent = '';
  }
  
  // Remove existing OPENROUTER_API_KEY line
  const lines = zshrcContent.split('\n');
  const filtered = lines.filter(line => 
    !line.trim().startsWith('export OPENROUTER_API_KEY=')
  );
  
  // Add new key
  filtered.push(`export OPENROUTER_API_KEY="${apiKey}"`);
  
  // Write back
  fs.writeFileSync(ZSHRC_PATH, filtered.join('\n') + '\n');
  
  console.log('   ✅ Updated ~/.zshrc');
  console.log(`   Added: export OPENROUTER_API_KEY="${apiKey.substring(0, 20)}..."`);
  console.log('');
  console.log('   💡 Run: source ~/.zshrc');
  console.log('   💡 Then verify: node scripts/verify-openrouter-key.js\n');
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 AUTOMATED OPENROUTER API KEY MANAGEMENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Check for provisioning key
    const provisioningKey = getCredential('OPENROUTER_PROVISIONING_KEY');
    if (!provisioningKey) {
      console.log('\n❌ OPENROUTER_PROVISIONING_KEY not found');
      console.log('\n💡 To enable automation:');
      console.log('   1. Visit: https://openrouter.ai/docs/features/provisioning-api-keys');
      console.log('   2. Create a Provisioning API Key');
      console.log('   3. Add to ~/.zshrc: export OPENROUTER_PROVISIONING_KEY="..."');
      console.log('   4. Run: source ~/.zshrc');
      console.log('   5. Run this script again\n');
      process.exit(1);
    }
    
    console.log('✅ Provisioning key found\n');
    
    let apiKey = null;
    
    if (hasFlag('create')) {
      const keyName = arg('name', 'Alex AI - Auto-generated');
      apiKey = await createKey(keyName);
      apiKey = apiKey.id;
    } else {
      // List and use most recent
      const keys = await listKeys();
      if (keys) {
        apiKey = keys.id;
        console.log(`   Using most recent key: ${keys.name || 'Unnamed'}\n`);
      } else {
        // No keys found, create one
        console.log('   No keys found, creating new one...\n');
        const newKey = await createKey();
        apiKey = newKey.id;
      }
    }
    
    if (hasFlag('update-zshrc') || hasFlag('auto-update')) {
      updateZshrc(apiKey);
    } else {
      console.log('💡 To update ~/.zshrc automatically, run with --update-zshrc flag\n');
      console.log(`   Current key: ${apiKey}\n`);
    }
    
    console.log('✅ Done!\n');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { listKeys, createKey, updateZshrc };

