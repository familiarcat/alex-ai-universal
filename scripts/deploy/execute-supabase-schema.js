#!/usr/bin/env node
/**
 * Execute Supabase Schema Deployment
 * 
 * Attempts to deploy the vector optimization schema to Supabase
 * Falls back to manual instructions if automated deployment fails
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadSupabaseCredentials } = require('../utils/secure-credential-loader');
const { AutomatedSupabaseDeployer } = require('./automated-supabase-deploy');

async function deploySupabaseSchema() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUPABASE SCHEMA DEPLOYMENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Try automated deployment first
  try {
    console.log('🤖 Attempting automated deployment using credentials from ~/.zshrc...\n');
    const deployer = new AutomatedSupabaseDeployer();
    const success = await deployer.deploy();
    
    if (success) {
      return true;
    }
  } catch (error) {
    console.log(`⚠️  Automated deployment failed: ${error.message}`);
    console.log('📋 Falling back to manual deployment instructions...\n');
  }

  const schemaPath = path.join(__dirname, '../../supabase/vector-optimization-schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }

  console.log('✅ Schema file found:', schemaPath);
  console.log('');

  // Fallback: Provide manual instructions
  console.log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Option 1: Supabase Dashboard');
  console.log('  1. Go to your Supabase project dashboard');
  console.log('  2. Navigate to SQL Editor');
  console.log('  3. Copy and paste the contents of:');
  console.log(`     ${schemaPath}`);
  console.log('  4. Execute the SQL script\n');

  console.log('Option 2: Supabase CLI (if configured)');
  console.log(`  supabase db push --file ${schemaPath}\n`);

  console.log('Option 3: psql (if you have direct database access)');
  console.log(`  psql <connection_string> < ${schemaPath}\n`);

  // Show schema preview
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const lineCount = schema.split('\n').length;
  console.log(`📄 Schema Details:`);
  console.log(`   - File: ${schemaPath}`);
  console.log(`   - Lines: ${lineCount}`);
  console.log(`   - Size: ${(schema.length / 1024).toFixed(2)} KB`);
  console.log(`   - Tables: ${(schema.match(/CREATE TABLE/g) || []).length}`);
  console.log(`   - Functions: ${(schema.match(/CREATE FUNCTION/g) || []).length}`);
  console.log(`   - Views: ${(schema.match(/CREATE VIEW/g) || []).length}\n`);

  return false;
}

if (require.main === module) {
  deploySupabaseSchema().then(success => {
    if (success) {
      console.log('\n✅ Deployment complete!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Manual deployment required - see instructions above');
      process.exit(0);
    }
  }).catch(error => {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  });
}

module.exports = { deploySupabaseSchema };

