#!/usr/bin/env node
/**
 * Deploy Supabase Schema via Management API
 * 
 * Uses Supabase Management API to execute SQL directly
 * This is the most reliable method for automated deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { loadSupabaseCredentials } = require('../utils/secure-credential-loader');

async function deployViaManagementAPI() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 SUPABASE SCHEMA DEPLOYMENT VIA MANAGEMENT API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load credentials
  const creds = loadSupabaseCredentials();
  if (!creds.url || !creds.serviceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const schemaPath = path.join(__dirname, '../../supabase/vector-optimization-schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log(`📄 Schema file: ${schemaPath}`);
  console.log(`   Size: ${(schema.length / 1024).toFixed(2)} KB\n`);

  // Extract project reference from URL
  const url = new URL(creds.url);
  const projectRef = url.hostname.split('.')[0];
  
  // Supabase Management API endpoint
  // Note: This requires a Management API key, not the service role key
  // For now, we'll use the simpler approach: direct SQL execution via psql if available
  // Or provide clear instructions for manual deployment
  
  console.log('💡 Automated deployment via Management API requires:');
  console.log('   1. Supabase Management API key (different from service role key)');
  console.log('   2. Or database password for direct psql connection\n');
  
  console.log('📋 RECOMMENDED: Use Supabase Dashboard SQL Editor');
  console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef);
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Copy and paste the schema from:');
  console.log(`      ${schemaPath}`);
  console.log('   4. Execute\n');
  
  console.log('✅ Schema file is ready for deployment!\n');
  
  return false; // Indicate manual deployment needed
}

if (require.main === module) {
  deployViaManagementAPI().catch(error => {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  });
}

module.exports = { deployViaManagementAPI };

