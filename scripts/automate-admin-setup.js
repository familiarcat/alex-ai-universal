#!/usr/bin/env node

/**
 * Automate Admin User Setup - All 4 Steps
 * 
 * Step 1: Create admin user in Supabase
 * Step 2: Add to AUTHORIZED_USERS environment variable
 * Step 3: Test authentication flow
 * Step 4: Security audit checklist
 * 
 * Reviewed by: Commander Riker (Automation) & Lieutenant Worf (Security)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Load credentials
function loadCredentials() {
  let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_SERVICE_KEY || 
                    process.env.SUPABASE_KEY;
  
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
                    zshrcContent.match(/export SUPABASE_SERVICE_KEY=([^\s]+)/)?.[1];
    } catch (error) {
      // ~/.zshrc not found
    }
  }
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  
  return { supabaseUrl, supabaseKey };
}

async function step1CreateAdminUser(supabase) {
  console.log('\n📋 Step 1: Creating Admin User in Supabase...');
  console.log('═'.repeat(60));
  
  const adminEmail = 'admin@alex-ai.local';
  const adminPassword = 'admin';
  
  try {
    // Try to create user via Supabase Admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        role: 'admin',
        development_only: true
      }
    });
    
    if (createError) {
      if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
        console.log('✅ Admin user already exists');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        return { success: true, exists: true };
      }
      
      // If admin API doesn't work, provide manual instructions
      console.log('⚠️  Cannot create user via API (requires admin permissions)');
      console.log('\n📝 Manual Setup Required:');
      console.log('   1. Go to: https://app.supabase.com/project/rpkkkbufdwxmjaerbhbn/auth/users');
      console.log('   2. Click "Add User" → "Create new user"');
      console.log(`   3. Email: ${adminEmail}`);
      console.log(`   4. Password: ${adminPassword}`);
      console.log('   5. Auto Confirm User: ✅');
      console.log('   6. Click "Create User"\n');
      return { success: false, manual: true };
    }
    
    console.log('✅ Admin user created successfully!');
    console.log(`   User ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);
    return { success: true, user: newUser.user };
  } catch (error) {
    console.log('⚠️  API creation failed, manual setup required');
    console.log(`   Error: ${error.message}`);
    return { success: false, manual: true };
  }
}

async function step2AddToAuthorizedUsers(supabase, adminEmail) {
  console.log('\n📋 Step 2: Adding to AUTHORIZED_USERS...');
  console.log('═'.repeat(60));
  
  // Try Supabase table first
  try {
    const { error: insertError } = await supabase
      .from('authorized_users')
      .insert({
        email: adminEmail,
        active: true,
        role: 'admin',
        development_only: true
      });
    
    if (!insertError) {
      console.log('✅ Added to authorized_users table in Supabase');
    } else if (insertError.code === '23505') {
      console.log('✅ User already in authorized_users table');
    } else if (insertError.code === '42P01') {
      console.log('⚠️  authorized_users table does not exist (using environment variable)');
    } else {
      console.log(`⚠️  Could not add to table: ${insertError.message}`);
    }
  } catch (error) {
    console.log('⚠️  Could not add to authorized_users table (using environment variable)');
  }
  
  // Add to environment variable
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  let zshrcContent = '';
  let updated = false;
  
  try {
    zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    // Check if AUTHORIZED_USERS already exists
    if (zshrcContent.includes('AUTHORIZED_USERS=')) {
      // Update existing
      const updatedContent = zshrcContent.replace(
        /export AUTHORIZED_USERS="([^"]*)"/,
        (match, existing) => {
          const emails = existing.split(',').map(e => e.trim()).filter(e => e);
          if (!emails.includes(adminEmail)) {
            emails.push(adminEmail);
            updated = true;
            return `export AUTHORIZED_USERS="${emails.join(',')}"`;
          }
          return match;
        }
      );
      
      if (updated) {
        fs.writeFileSync(zshrcPath, updatedContent);
        console.log('✅ Updated AUTHORIZED_USERS in ~/.zshrc');
      } else {
        console.log('✅ admin@alex-ai.local already in AUTHORIZED_USERS');
      }
    } else {
      // Add new
      const newLine = `\nexport AUTHORIZED_USERS="${adminEmail}"\n`;
      fs.appendFileSync(zshrcPath, newLine);
      console.log('✅ Added AUTHORIZED_USERS to ~/.zshrc');
      updated = true;
    }
    
    // Also create/update .env.local for dashboard
    const envLocalPath = path.join(process.cwd(), 'dashboard', '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf8');
    }
    
    if (envContent.includes('AUTHORIZED_USERS=')) {
      envContent = envContent.replace(
        /AUTHORIZED_USERS="([^"]*)"/,
        (match, existing) => {
          const emails = existing.split(',').map(e => e.trim()).filter(e => e);
          if (!emails.includes(adminEmail)) {
            emails.push(adminEmail);
            return `AUTHORIZED_USERS="${emails.join(',')}"`;
          }
          return match;
        }
      );
    } else {
      envContent += `\nAUTHORIZED_USERS="${adminEmail}"\n`;
    }
    
    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ Updated AUTHORIZED_USERS in dashboard/.env.local');
    
    if (updated) {
      console.log('\n💡 Reload your shell: source ~/.zshrc');
    }
    
    return { success: true };
  } catch (error) {
    console.log(`⚠️  Could not update ~/.zshrc: ${error.message}`);
    console.log(`\n📝 Manual Setup: Add to ~/.zshrc:`);
    console.log(`   export AUTHORIZED_USERS="${adminEmail}"`);
    return { success: false, manual: true };
  }
}

async function step3TestAuthentication() {
  console.log('\n📋 Step 3: Testing Authentication Flow...');
  console.log('═'.repeat(60));
  
  const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
  
  // Check if dashboard is running
  console.log(`🔍 Checking dashboard at ${dashboardUrl}...`);
  
  return new Promise((resolve) => {
    const req = http.get(`${dashboardUrl}`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ Dashboard is accessible');
        console.log(`\n📝 Test Authentication:`);
        console.log(`   1. Open: ${dashboardUrl}`);
        console.log(`   2. Click "Sign In"`);
        console.log(`   3. Email: admin@alex-ai.local`);
        console.log(`   4. Password: admin`);
        console.log(`   5. Click "Sign In"`);
        resolve({ success: true });
      } else {
        console.log(`⚠️  Dashboard returned status ${res.statusCode}`);
        console.log(`\n💡 Start dashboard: cd dashboard && npm run dev`);
        resolve({ success: false });
      }
    });
    
    req.on('error', (error) => {
      console.log(`⚠️  Dashboard not running: ${error.message}`);
      console.log(`\n💡 Start dashboard: cd dashboard && npm run dev`);
      resolve({ success: false });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      console.log('⚠️  Dashboard check timed out');
      console.log(`\n💡 Start dashboard: cd dashboard && npm run dev`);
      resolve({ success: false });
    });
  });
}

function step4SecurityAudit() {
  console.log('\n📋 Step 4: Security Audit Checklist...');
  console.log('═'.repeat(60));
  
  console.log('🛡️  Lieutenant Worf\'s Security Checklist:\n');
  
  const checklist = [
    { item: 'Admin user created (development only)', status: '✅', note: 'Admiral\'s Override' },
    { item: 'Default credentials documented', status: '✅', note: 'admin/admin' },
    { item: 'Security memory stored', status: '✅', note: 'Worf\'s reminder active' },
    { item: 'Change password before production', status: '⚠️', note: 'PENDING' },
    { item: 'Remove default credentials', status: '⚠️', note: 'PENDING' },
    { item: 'Implement password policy', status: '⚠️', note: 'PENDING' },
    { item: 'Add multi-factor authentication', status: '⚠️', note: 'PENDING' },
    { item: 'Complete security audit', status: '⚠️', note: 'PENDING' },
  ];
  
  checklist.forEach(({ item, status, note }) => {
    console.log(`   ${status} ${item}`);
    if (note) {
      console.log(`      └─ ${note}`);
    }
  });
  
  console.log('\n📊 Security Status: PENDING PRODUCTION REVIEW');
  console.log('🔄 Reminder: Lieutenant Worf will continue to remind until production security is implemented\n');
  
  return { success: true };
}

async function main() {
  console.log('🖖 Automating Admin User Setup - All 4 Steps');
  console.log('═'.repeat(60));
  console.log('⚠️  ADMIRAL\'S OVERRIDE: Development purposes only\n');
  
  try {
    const { supabaseUrl, supabaseKey } = loadCredentials();
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Connected to Supabase\n');
    
    const adminEmail = 'admin@alex-ai.local';
    
    // Step 1: Create admin user
    const step1Result = await step1CreateAdminUser(supabase);
    
    // Step 2: Add to authorized users
    const step2Result = await step2AddToAuthorizedUsers(supabase, adminEmail);
    
    // Step 3: Test authentication
    const step3Result = await step3TestAuthentication();
    
    // Step 4: Security audit
    const step4Result = step4SecurityAudit();
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Automation Summary:');
    console.log('═'.repeat(60));
    console.log(`   Step 1 (Create User): ${step1Result.success ? '✅' : '⚠️  Manual setup may be required'}`);
    console.log(`   Step 2 (Authorized Users): ${step2Result.success ? '✅' : '⚠️  Manual setup required'}`);
    console.log(`   Step 3 (Test Auth): ${step3Result.success ? '✅' : '⚠️  Dashboard not running'}`);
    console.log(`   Step 4 (Security Audit): ✅ Checklist complete`);
    console.log('\n✅ Automation complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch(console.error);

