#!/usr/bin/env node

/**
 * Create User in Supabase
 * 
 * Creates a user in Supabase Auth and adds to authorized_users table
 * 
 * Usage:
 *   node scripts/create-user.js <email> <password> [role] [development_only]
 * 
 * Example:
 *   node scripts/create-user.js brady@pbradygeorgen.com "g3t1t0nC@t!" user false
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load credentials
function loadCredentials() {
  let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 
                          process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Try ~/.zshrc if not in environment
  if (!supabaseUrl || !supabaseServiceKey) {
    try {
      const zshrcPath = path.join(process.env.HOME, '.zshrc');
      const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
      
      supabaseUrl = supabaseUrl || 
        zshrcContent.match(/export SUPABASE_URL=["']?([^"'\n]+)["']?/)?.[1] ||
        zshrcContent.match(/export NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n]+)["']?/)?.[1];
      
      supabaseServiceKey = supabaseServiceKey ||
        zshrcContent.match(/export SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\n]+)["']?/)?.[1] ||
        zshrcContent.match(/export SUPABASE_SERVICE_KEY=["']?([^"'\n]+)["']?/)?.[1];
    } catch (error) {
      // ~/.zshrc not found
    }
  }
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  
  return { supabaseUrl, supabaseServiceKey };
}

async function createUser(email, password, role = 'user', developmentOnly = false) {
  console.log('\n🖖 Creating User in Supabase');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const { supabaseUrl, supabaseServiceKey } = loadCredentials();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('✅ Connected to Supabase\n');
    console.log('📋 User Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    console.log(`   Development Only: ${developmentOnly}`);
    console.log(`   Verified: ${!developmentOnly}\n`);
    
    // Step 1: Create user in Supabase Auth
    console.log('👤 Step 1: Creating user in Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: !developmentOnly, // Auto-confirm for production, manual for dev
      user_metadata: {
        username: email.split('@')[0],
        role: role,
        development_only: developmentOnly
      }
    });
    
    if (authError) {
      const errorMsg = authError.message?.toLowerCase() || '';
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('email address has already been registered')) {
        console.log('   ⚠️  User already exists in Supabase Auth');
        console.log('   ✅ Using existing user');
        
        // Try to get existing user
        try {
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
          if (!listError && existingUsers?.users) {
            const existingUser = existingUsers.users.find(
              u => u.email?.toLowerCase() === email.toLowerCase()
            );
            if (existingUser) {
              console.log(`   User ID: ${existingUser.id}\n`);
            } else {
              console.log('   (User exists but could not retrieve ID)\n');
            }
          }
        } catch (err) {
          console.log('   (Could not retrieve user details)\n');
        }
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
    } else {
      console.log('   ✅ User created in Supabase Auth');
      console.log(`   User ID: ${authUser.user.id}\n`);
    }
    
    // Step 2: Add to authorized_users table
    console.log('🔐 Step 2: Adding to authorized_users table...');
    const { data: authorizedUser, error: authorizedError } = await supabase
      .from('authorized_users')
      .upsert({
        email: email.toLowerCase(),
        active: true,
        role: role,
        development_only: developmentOnly,
        verified: !developmentOnly // Production users must be verified
      }, {
        onConflict: 'email'
      })
      .select()
      .single();
    
    if (authorizedError) {
      const errorCode = authorizedError.code || '';
      const errorMsg = authorizedError.message || String(authorizedError);
      
      if (errorCode === '42P01' || errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
        console.log('   ⚠️  authorized_users table does not exist');
        console.log('   💡 Run migration: supabase/migrations/012_create_authorized_users_table.sql');
        console.log('   ⚠️  User will be authorized via AUTHORIZED_USERS environment variable\n');
      } else if (errorCode === '23505' || errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
        console.log('   ⚠️  User already in authorized_users table');
        console.log('   ✅ User is authorized\n');
      } else {
        console.log(`   ⚠️  Error adding to authorized_users: ${errorMsg}`);
        console.log('   ⚠️  User will be authorized via AUTHORIZED_USERS environment variable\n');
      }
    } else {
      console.log('   ✅ Added to authorized_users table');
      if (authorizedUser) {
        console.log(`   ID: ${authorizedUser.id}\n`);
      } else {
        console.log('   (User may already exist)\n');
      }
    }
    
    // Summary
    console.log('═'.repeat(60));
    console.log('✅ USER SETUP COMPLETE');
    console.log('═'.repeat(60) + '\n');
    console.log('📋 Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   Development Only: ${developmentOnly}\n`);
    
    console.log('🔄 Next Steps:');
    console.log('   1. Add to AUTHORIZED_USERS environment variable:');
    console.log(`      export AUTHORIZED_USERS="${email}"`);
    console.log('   2. Restart dev server if running');
    console.log('   3. Sign in at: http://localhost:3000/auth/signin');
    console.log(`   4. Use email: ${email}\n`);
    
  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/create-user.js <email> <password> [role] [development_only]');
  console.error('\nExample:');
  console.error('  node scripts/create-user.js brady@pbradygeorgen.com "g3t1t0nC@t!" user false');
  process.exit(1);
}

const email = args[0];
const password = args[1];
const role = args[2] || 'user';
const developmentOnly = args[3] === 'true' || args[3] === '1';

createUser(email, password, role, developmentOnly).catch(console.error);

