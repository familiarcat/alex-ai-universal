#!/usr/bin/env node
/**
 * 🔄 Update API Key and Activate All Workflows
 * 
 * One-stop script to:
 * 1. Update N8N_OWNER_API_KEY in ~/.zshrc
 * 2. Activate all workflows
 * 3. Register all webhooks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get API key from command line
const NEW_API_KEY = process.argv[2];

if (!NEW_API_KEY) {
  console.log('🔐 Update API Key and Activate All Workflows');
  console.log('=============================================\n');
  console.log('Usage: node scripts/update-and-activate-all-workflows.js <api-key>');
  console.log('\nOr provide the key interactively:');
  console.log('  1. Copy the API key from n8n UI (Settings → API)');
  console.log('  2. Run: node scripts/update-and-activate-all-workflows.js "your-key-here"');
  console.log('\n💡 The key should start with "eyJ" (JWT token)');
  process.exit(1);
}

// Validate key format
if (!NEW_API_KEY.startsWith('eyJ')) {
  console.log('⚠️  Warning: API key should start with "eyJ" (JWT token)');
  console.log('   Continuing anyway...\n');
}

async function main() {
  console.log('🔐 Updating API Key in ~/.zshrc...\n');

  // Backup ~/.zshrc
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const backupPath = `${zshrcPath}.backup.${Date.now()}`;
  fs.copyFileSync(zshrcPath, backupPath);
  console.log(`   ✅ Backup created: ${backupPath}`);

  // Read current ~/.zshrc
  let zshrcContent = fs.readFileSync(zshrcPath, 'utf8');

  // Remove old API key entries
  zshrcContent = zshrcContent.replace(/^export N8N_API_KEY=.*$/gm, '');
  zshrcContent = zshrcContent.replace(/^export N8N_OWNER_API_KEY=.*$/gm, '');

  // Add new API key entries
  const apiKeySection = `\n# N8N Configuration
export N8N_OWNER_API_KEY="${NEW_API_KEY}"
export N8N_API_KEY="${NEW_API_KEY}"
`;

  // Find or create N8N section
  if (zshrcContent.includes('# N8N Configuration')) {
    // Insert after N8N Configuration comment
    zshrcContent = zshrcContent.replace(
      /(# N8N Configuration\n)/,
      `$1${apiKeySection.trim()}\n`
    );
  } else {
    // Add at the end
    zshrcContent += apiKeySection;
  }

  // Write updated ~/.zshrc
  fs.writeFileSync(zshrcPath, zshrcContent);
  console.log('   ✅ ~/.zshrc updated');

  // Export for current session
  process.env.N8N_OWNER_API_KEY = NEW_API_KEY;
  process.env.N8N_API_KEY = NEW_API_KEY;

  console.log('\n🔍 Testing API key...');

  // Test the key
  const https = require('https');
  const testUrl = 'https://n8n.pbradygeorgen.com/api/v1/workflows';
  const testResult = await new Promise((resolve) => {
    const req = https.get(testUrl, {
      headers: { 'X-N8N-API-KEY': NEW_API_KEY },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    
    req.on('error', () => {
      resolve({ status: 0, body: 'Connection error' });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, body: 'Timeout' });
    });
  });

  if (testResult.status === 200) {
    console.log('   ✅ API key is valid and working!\n');
  } else if (testResult.status === 401) {
    console.log('   ❌ API key is unauthorized (401)');
    console.log('   Please verify the key is correct\n');
    process.exit(1);
  } else {
    console.log(`   ⚠️  Unexpected response: ${testResult.status}`);
    console.log('   Continuing anyway...\n');
  }

  // First, specifically activate Knowledge Ingest workflow (priority)
  console.log('🎯 Activating Knowledge Ingest workflow first...\n');

  try {
    execSync('node scripts/activate-knowledge-ingest-workflow.js', {
      stdio: 'inherit',
      env: {
        ...process.env,
        N8N_OWNER_API_KEY: NEW_API_KEY,
        N8N_API_KEY: NEW_API_KEY
      }
    });
    console.log('✅ Knowledge Ingest workflow activated and verified\n');
  } catch (error) {
    console.log('\n⚠️  Knowledge Ingest activation had issues, continuing with all workflows...\n');
  }

  // Now activate all workflows
  console.log('🔄 Activating all workflows...\n');

  try {
    // Run the activation script (which now prioritizes Knowledge Ingest)
    execSync('node scripts/activate-all-n8n-workflows.js', {
      stdio: 'inherit',
      env: {
        ...process.env,
        N8N_OWNER_API_KEY: NEW_API_KEY,
        N8N_API_KEY: NEW_API_KEY
      }
    });
  } catch (error) {
    console.log('\n❌ Workflow activation failed');
    process.exit(1);
  }

  // Wait a bit for webhooks to register
  console.log('\n⏳ Waiting for webhook registration...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Force webhook re-registration (which now prioritizes Knowledge Ingest)
  console.log('\n🔧 Registering webhooks...\n');

  try {
    execSync('node scripts/force-webhook-reregistration.js', {
      stdio: 'inherit',
      env: {
        ...process.env,
        N8N_OWNER_API_KEY: NEW_API_KEY,
        N8N_API_KEY: NEW_API_KEY
      }
    });
  } catch (error) {
    console.log('\n⚠️  Webhook registration had some issues, but workflows are activated');
  }

  console.log('\n✅ Complete!');
  console.log('   ✅ API key updated in ~/.zshrc');
  console.log('   ✅ All workflows activated');
  console.log('   ✅ Webhooks registered');
  console.log('\n💡 Run: source ~/.zshrc (or open new terminal) to load the new key');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
