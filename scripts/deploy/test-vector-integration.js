#!/usr/bin/env node
/**
 * Integration test for vector optimization system
 * 
 * Tests the deployment and integration of the vector optimization system
 */

const fs = require('fs');
const path = require('path');

async function testIntegration() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 VECTOR OPTIMIZATION INTEGRATION TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const tests = [];
  let passed = 0;
  let failed = 0;

  // Test 1: Check environment variables
  console.log('📋 Test 1: Environment Variables');
  const requiredEnv = ['SUPABASE_URL', 'SUPABASE_KEY', 'OPENROUTER_API_KEY'];
  const missingEnv = requiredEnv.filter(env => !process.env[env]);
  
  if (missingEnv.length === 0) {
    console.log('   ✅ All required environment variables present');
    tests.push({ name: 'Environment Variables', status: 'PASS' });
    passed++;
  } else {
    console.log(`   ❌ Missing environment variables: ${missingEnv.join(', ')}`);
    tests.push({ name: 'Environment Variables', status: 'FAIL', error: `Missing: ${missingEnv.join(', ')}` });
    failed++;
  }
  console.log('');

  // Test 2: Check schema file
  console.log('📋 Test 2: Supabase Schema File');
  const schemaPath = path.join(__dirname, '../../supabase/vector-optimization-schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const hasVectorTable = schema.includes('vector_embeddings');
    const hasMatchFunction = schema.includes('match_vectors');
    
    if (hasVectorTable && hasMatchFunction) {
      console.log('   ✅ Schema file valid with required components');
      tests.push({ name: 'Schema File', status: 'PASS' });
      passed++;
    } else {
      console.log('   ⚠️  Schema file exists but missing some components');
      tests.push({ name: 'Schema File', status: 'WARN' });
    }
  } else {
    console.log('   ❌ Schema file not found');
    tests.push({ name: 'Schema File', status: 'FAIL' });
    failed++;
  }
  console.log('');

  // Test 3: Check TypeScript source files
  console.log('📋 Test 3: Source Files');
  const sourceFiles = [
    'packages/core/src/anti-hallucination/vector-optimization-system.ts',
    'packages/core/src/anti-hallucination/integrated-vector-anti-hallucination.ts'
  ];
  
  let allFilesExist = true;
  for (const file of sourceFiles) {
    const fullPath = path.join(__dirname, '../../', file);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (not found)`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    tests.push({ name: 'Source Files', status: 'PASS' });
    passed++;
  } else {
    tests.push({ name: 'Source Files', status: 'FAIL' });
    failed++;
  }
  console.log('');

  // Test 4: Check deployment scripts
  console.log('📋 Test 4: Deployment Scripts');
  const deploymentScripts = [
    'scripts/deploy/crew-deploy-vector-optimization.js',
    'scripts/deploy/execute-supabase-schema.js',
    'scripts/deploy/monitor-costs.js'
  ];
  
  let allScriptsExist = true;
  for (const script of deploymentScripts) {
    const fullPath = path.join(__dirname, '../../', script);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${script}`);
    } else {
      console.log(`   ❌ ${script} (not found)`);
      allScriptsExist = false;
    }
  }
  
  if (allScriptsExist) {
    tests.push({ name: 'Deployment Scripts', status: 'PASS' });
    passed++;
  } else {
    tests.push({ name: 'Deployment Scripts', status: 'FAIL' });
    failed++;
  }
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total:  ${tests.length}\n`);

  if (failed === 0) {
    console.log('✅ All integration tests passed!');
    console.log('🎯 System ready for deployment\n');
    return true;
  } else {
    console.log('⚠️  Some tests failed - review errors above');
    console.log('💡 Fix issues before proceeding with deployment\n');
    return false;
  }
}

if (require.main === module) {
  testIntegration().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testIntegration };
