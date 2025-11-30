#!/usr/bin/env node

/**
 * 🚨 Emergency Workflow Restoration
 * 
 * Restores workflows from git when API returns unauthorized
 * Uses direct database access if possible, or provides manual instructions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Find all workflow JSON files
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Load credentials
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export\s+N8N_URL=['"]?([^'"\s]+)['"]?/)?.[1] || 'https://n8n.pbradygeorgen.com';
const N8N_OWNER_API_KEY = zshrc.match(/export\s+N8N_OWNER_API_KEY=['"]?([^'"\s]+)['"]?/)?.[1];
const N8N_API_KEY = N8N_OWNER_API_KEY || zshrc.match(/export\s+N8N_API_KEY=['"]?([^'"\s]+)['"]?/)?.[1];

console.log('\n🚨 Emergency Workflow Restoration');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`📍 N8N URL: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY ? N8N_API_KEY.substring(0, 20) + '...' : 'NOT FOUND'}\n`);

// Find workflow files
const workflowsDir = path.join(process.cwd(), 'n8n-workflows');
const workflowFiles = findJsonFiles(workflowsDir);

console.log(`📦 Found ${workflowFiles.length} workflow files in git\n`);

// Test API access
console.log('🔍 Testing API access...');
try {
  const testResponse = execSync(
    `curl -s "${N8N_URL}/api/v1/workflows" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`,
    { encoding: 'utf8' }
  );
  const testData = JSON.parse(testResponse);
  
  if (testData.message === 'unauthorized') {
    console.log('❌ API returned unauthorized\n');
    console.log('💡 Solutions:');
    console.log('   1. Generate new API key in n8n UI: Settings → API');
    console.log('   2. Update ~/.zshrc with new N8N_API_KEY');
    console.log('   3. Or restore workflows manually via n8n UI import\n');
    console.log('📋 Workflow files ready for import:');
    workflowFiles.slice(0, 10).forEach((file, i) => {
      const name = path.basename(file, '.json');
      console.log(`   ${i + 1}. ${name}`);
    });
    if (workflowFiles.length > 10) {
      console.log(`   ... and ${workflowFiles.length - 10} more`);
    }
    console.log('\n📁 Location: n8n-workflows/');
    console.log('💡 Import via n8n UI: Workflows → Import from File\n');
    process.exit(1);
  } else {
    console.log('✅ API access working\n');
    // Continue with restoration
    console.log('🚀 Starting workflow restoration...\n');
    
    let success = 0;
    let failed = 0;
    
    workflowFiles.forEach((file, index) => {
      try {
        const workflowJson = JSON.parse(fs.readFileSync(file, 'utf8'));
        const workflowName = workflowJson.name || path.basename(file, '.json');
        
        // Remove read-only fields
        delete workflowJson.id;
        delete workflowJson.createdAt;
        delete workflowJson.updatedAt;
        delete workflowJson.versionId;
        delete workflowJson.active;
        delete workflowJson.tags;
        
        // Create workflow
        const createResponse = JSON.parse(
          execSync(
            `curl -s -X POST "${N8N_URL}/api/v1/workflows" ` +
            `-H "X-N8N-API-KEY: ${N8N_API_KEY}" ` +
            `-H "Content-Type: application/json" ` +
            `-d '${JSON.stringify(workflowJson).replace(/'/g, "'\\''")}'`,
            { encoding: 'utf8' }
          )
        );
        
        if (createResponse.id) {
          console.log(`✅ [${index + 1}/${workflowFiles.length}] ${workflowName} (ID: ${createResponse.id})`);
          success++;
        } else {
          console.log(`❌ [${index + 1}/${workflowFiles.length}] ${workflowName} - ${createResponse.message || 'Failed'}`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ [${index + 1}/${workflowFiles.length}] Error: ${error.message}`);
        failed++;
      }
    });
    
    console.log(`\n📊 Summary: ${success} restored, ${failed} failed\n`);
  }
} catch (error) {
  console.log(`❌ API test failed: ${error.message}\n`);
  console.log('💡 Manual restoration required via n8n UI\n');
  process.exit(1);
}

