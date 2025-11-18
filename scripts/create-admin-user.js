#!/usr/bin/env node

/**
 * Create Admin User - Development Only
 * 
 * Creates admin user with username "admin" and password "admin"
 * Admiral's Override: Development purposes only
 * 
 * Security Note: Lieutenant Worf has logged this as a security concern
 * This must NOT be used in production.
 * 
 * Reviewed by: Lieutenant Worf (Security) - Under Admiral's Override
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load credentials from environment or ~/.zshrc
function loadCredentials() {
  // Try environment variables first
  let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseKey = process.env.SUPABASE_KEY || 
                    process.env.SUPABASE_SERVICE_KEY || 
                    process.env.SUPABASE_SERVICE_ROLE_KEY ||
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If not in environment, try ~/.zshrc
  if (!supabaseUrl || !supabaseKey) {
    try {
      const zshrcPath = path.join(process.env.HOME, '.zshrc');
      const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
      
      supabaseUrl = supabaseUrl || zshrcContent.match(/export SUPABASE_URL="([^"]+)"/)?.[1] ||
                                zshrcContent.match(/export SUPABASE_URL=([^\s]+)/)?.[1];
      supabaseKey = supabaseKey || 
                    zshrcContent.match(/export SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1] ||
                    zshrcContent.match(/export SUPABASE_SERVICE_ROLE_KEY=([^\s]+)/)?.[1] ||
                    zshrcContent.match(/export SUPABASE_SERVICE_KEY="([^"]+)"/)?.[1] ||
                    zshrcContent.match(/export SUPABASE_SERVICE_KEY=([^\s]+)/)?.[1] ||
                    zshrcContent.match(/export SUPABASE_KEY="([^"]+)"/)?.[1] ||
                    zshrcContent.match(/export SUPABASE_KEY=([^\s]+)/)?.[1];
    } catch (error) {
      // ~/.zshrc not found or not readable
    }
  }
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
  }
  
  return { supabaseUrl, supabaseKey };
}

async function addToAuthorizedUsers(supabase, adminEmail) {
  console.log('🔐 Adding to authorized users...');
  try {
    const { error: insertError } = await supabase
      .from('authorized_users')
      .insert({
        email: adminEmail,
        active: true,
        role: 'admin',
        development_only: true
      });
    
    if (insertError) {
      if (insertError.code === '42P01') {
        console.log('⚠️  authorized_users table does not exist (this is okay)');
        console.log('   User will be authorized via AUTHORIZED_USERS environment variable\n');
      } else if (insertError.code === '23505') {
        console.log('✅ User already in authorized_users table\n');
      } else {
        console.error('⚠️  Error adding to authorized_users:', insertError.message);
        console.log('   User will be authorized via AUTHORIZED_USERS environment variable\n');
      }
    } else {
      console.log('✅ Added to authorized_users table\n');
    }
  } catch (error) {
    console.log('⚠️  Could not add to authorized_users table (this is okay)');
    console.log('   User will be authorized via AUTHORIZED_USERS environment variable\n');
  }
}

async function createAdminUser() {
  console.log('🖖 Creating Admin User (Development Only)');
  console.log('═'.repeat(60));
  console.log('⚠️  ADMIRAL\'S OVERRIDE: Development purposes only');
  console.log('⚠️  SECURITY WARNING: This must NOT be used in production\n');
  
  try {
    const { supabaseUrl, supabaseKey } = loadCredentials();
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Connected to Supabase\n');
    
    const adminEmail = 'admin@alex-ai.local';
    const adminPassword = 'admin';
    
    // Create admin user (will fail if already exists)
    console.log('👤 Creating admin user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        username: 'admin',
        role: 'admin',
        development_only: true
      }
    });
    
    if (createError) {
      if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
        console.log('⚠️  Admin user already exists');
        console.log('   Email: ' + adminEmail);
        console.log('   Password: ' + adminPassword);
        console.log('\n💡 User credentials are ready to use');
        console.log('   If you need to reset the password, use Supabase dashboard\n');
        
        // Still add to authorized users
        await addToAuthorizedUsers(supabase, adminEmail);
        return;
      }
      console.error('❌ Error creating user:', createError.message);
      return;
    }
    
    console.log('✅ Admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   User ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin`);
    console.log(`   Role: admin`);
    console.log(`   Development Only: true\n`);
    
    // Add to authorized users
    await addToAuthorizedUsers(supabase, adminEmail);
    
    // Security reminder
    console.log('═'.repeat(60));
    console.log('🛡️  SECURITY REMINDER (Lieutenant Worf):');
    console.log('═'.repeat(60));
    console.log('⚠️  This admin user is for DEVELOPMENT ONLY');
    console.log('⚠️  Username: admin, Password: admin - NOT PRODUCTION SECURE');
    console.log('⚠️  This must be removed or changed before production deployment');
    console.log('⚠️  Admiral\'s Override acknowledged for development purposes');
    console.log('═'.repeat(60) + '\n');
    
    console.log('✅ Admin user setup complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Add "admin@alex-ai.local" to AUTHORIZED_USERS environment variable');
    console.log('   2. Use email "admin@alex-ai.local" and password "admin" to sign in');
    console.log('   3. REMEMBER: Change credentials before production!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
createAdminUser().catch(console.error);

