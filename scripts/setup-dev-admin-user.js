#!/usr/bin/env node

/**
 * Setup Development Admin User
 * 
 * Creates admin user in Supabase Auth and adds to authorized_users table
 * Development mode: Auto-creates user with simple credentials
 * Production mode: Requires manual setup with verified users
 * 
 * Reviewed by: Lieutenant Worf (Security) & Chief O'Brien (Operations)
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

async function setupAdminUser() {
  console.log('\n🖖 Setting Up Development Admin User');
  console.log('═'.repeat(60));
  console.log('⚠️  DEVELOPMENT MODE ONLY');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const { supabaseUrl, supabaseServiceKey } = loadCredentials();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('✅ Connected to Supabase\n');
    
    const adminEmail = 'admin@alex-ai.local';
    const adminPassword = 'admin';
    
    // Step 1: Create user in Supabase Auth
    console.log('👤 Step 1: Creating admin user in Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm for development
      user_metadata: {
        username: 'admin',
        role: 'admin',
        development_only: true
      }
    });
    
    if (authError) {
      const errorMsg = authError.message?.toLowerCase() || '';
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('user already registered') ||
          errorMsg.includes('email address has already been registered')) {
        console.log('   ⚠️  Admin user already exists in Supabase Auth');
        console.log('   ✅ Using existing user');
        
        // Try to get existing user
        try {
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
          if (!listError && existingUsers?.users) {
            const existingUser = existingUsers.users.find(
              u => u.email?.toLowerCase() === adminEmail.toLowerCase()
            );
            if (existingUser) {
              console.log(`   User ID: ${existingUser.id}\n`);
            } else {
              console.log('   (User exists but could not retrieve ID)\n');
            }
          } else {
            console.log('   (Could not list users to get ID)\n');
          }
        } catch (err) {
          console.log('   (Could not retrieve user details)\n');
        }
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
    } else {
      console.log('   ✅ Admin user created in Supabase Auth');
      console.log(`   User ID: ${authUser.user.id}\n`);
    }
    
    // Step 2: Add to authorized_users table
    console.log('🔐 Step 2: Adding to authorized_users table...');
    const { data: authorizedUser, error: authorizedError } = await supabase
      .from('authorized_users')
      .upsert({
        email: adminEmail,
        active: true,
        role: 'admin',
        development_only: true,
        verified: true
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
    
    // Step 3: Verify setup
    console.log('✅ Step 3: Verifying setup...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('authorized_users')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (verifyError || !verifyUser) {
      console.log('   ⚠️  Could not verify user (may need migration)\n');
    } else {
      console.log('   ✅ User verified in authorized_users table\n');
    }
    
    // Summary
    console.log('═'.repeat(60));
    console.log('✅ ADMIN USER SETUP COMPLETE');
    console.log('═'.repeat(60) + '\n');
    console.log('📋 Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: admin`);
    console.log(`   Development Only: true\n`);
    
    console.log('🔄 Next Steps:');
    console.log('   1. Add to AUTHORIZED_USERS environment variable:');
    console.log(`      export AUTHORIZED_USERS="${adminEmail}"`);
    console.log('   2. Restart dev server if running');
    console.log('   3. Sign in at: http://localhost:3000/auth/signin');
    console.log('   4. Use the credentials above\n');
    
    console.log('🛡️  SECURITY REMINDER (Lieutenant Worf):');
    console.log('   ⚠️  These credentials are for DEVELOPMENT ONLY');
    console.log('   ⚠️  Must be changed or removed before production');
    console.log('   ⚠️  Production requires verified users with strong passwords\n');
    
  } catch (error) {
    console.error('\n❌ Error setting up admin user:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

setupAdminUser().catch(console.error);

