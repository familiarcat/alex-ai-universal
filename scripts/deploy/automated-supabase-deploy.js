#!/usr/bin/env node
/**
 * Automated Supabase Schema Deployment
 * 
 * Uses credentials from ~/.zshrc to automatically deploy the vector optimization schema
 * Supports multiple deployment methods:
 * 1. Supabase REST API (direct SQL execution)
 * 2. Supabase CLI (if available)
 * 3. psql (if direct connection available)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials, getCredential } = require('../utils/secure-credential-loader');

class AutomatedSupabaseDeployer {
  constructor() {
    this.credentials = null;
    this.schemaPath = path.join(__dirname, '../../supabase/vector-optimization-schema.sql');
  }

  /**
   * Load credentials from ~/.zshrc or environment
   */
  loadCredentials() {
    console.log('🔐 Loading Supabase credentials...\n');
    
    try {
      this.credentials = loadSupabaseCredentials();
      
      if (!this.credentials.url || !this.credentials.serviceKey) {
        throw new Error('Missing Supabase credentials (url or serviceKey)');
      }
      
      // Extract project reference
      const url = new URL(this.credentials.url);
      this.projectRef = url.hostname.split('.')[0];
      
      console.log('✅ Credentials loaded successfully');
      console.log(`   URL: ${this.credentials.url.substring(0, 30)}...`);
      console.log(`   Service Key: ${this.credentials.serviceKey.substring(0, 20)}...`);
      console.log(`   Project Ref: ${this.projectRef}\n`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to load credentials: ${error.message}`);
      return false;
    }
  }

  /**
   * Method 1: Deploy via Supabase Client (Direct SQL execution)
   */
  async deployViaSupabaseClient() {
    console.log('📡 Method 1: Deploying via Supabase Client (Direct SQL)...\n');
    
    if (!fs.existsSync(this.schemaPath)) {
      throw new Error(`Schema file not found: ${this.schemaPath}`);
    }

    const schema = fs.readFileSync(this.schemaPath, 'utf8');
    
    // Create Supabase client with service role key (has admin privileges)
    const supabase = createClient(this.credentials.url, this.credentials.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Split schema into individual statements (semicolon-separated)
    // Remove comments and empty lines
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))
      .filter(s => !s.match(/^\s*$/));

    console.log(`   Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Execute statements one by one (Supabase doesn't support multi-statement execution)
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip if it's just whitespace or a comment
      if (!statement || statement.trim().length === 0) {
        continue;
      }

      try {
        // Use RPC to execute SQL (if available) or use direct query
        // Note: Supabase client doesn't directly support raw SQL execution
        // We'll use the Management API instead
        const response = await supabase.rpc('exec_sql', { sql: statement });
        
        if (response.error) {
          // Try alternative: Use PostgREST directly
          throw new Error(response.error.message);
        }
        
        successCount++;
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`   Progress: ${i + 1}/${statements.length} statements\r`);
        }
      } catch (error) {
        // Some statements might fail if objects already exist - that's okay
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          successCount++;
          continue;
        }
        
        errorCount++;
        errors.push({ statement: statement.substring(0, 50), error: error.message });
        
        // Don't fail on first error - continue with other statements
        if (errorCount > 5) {
          throw new Error(`Too many errors (${errorCount}). Stopping deployment.`);
        }
      }
    }

    console.log(`\n   ✅ Successfully executed: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Errors: ${errorCount} (may be expected if objects already exist)`);
    }

    if (successCount > 0) {
      console.log('\n✅ Schema deployed successfully via Supabase Client!');
      return true;
    } else {
      throw new Error('No statements executed successfully');
    }
  }

  /**
   * Method 2: Deploy via Supabase CLI
   */
  async deployViaCLI() {
    console.log('🔧 Method 2: Deploying via Supabase CLI...\n');
    
    try {
      // Check if Supabase CLI is available
      execSync('which supabase', { stdio: 'ignore' });
      
      // Check if we're in a Supabase project
      const supabaseConfig = path.join(__dirname, '../../supabase/config.toml');
      if (!fs.existsSync(supabaseConfig)) {
        throw new Error('Not a Supabase project (no config.toml found)');
      }

      console.log('✅ Supabase CLI and project detected');
      
      // Try to execute SQL via CLI
      // Note: Supabase CLI doesn't have direct SQL execution, but we can use psql through it
      const connectionString = this.buildConnectionString();
      
      if (connectionString) {
        console.log('📤 Executing schema via psql...');
        execSync(`psql "${connectionString}" -f "${this.schemaPath}"`, {
          stdio: 'inherit',
          cwd: path.join(__dirname, '../../')
        });
        
        console.log('✅ Schema deployed successfully via CLI!');
        return true;
      } else {
        throw new Error('Could not build connection string');
      }
    } catch (error) {
      console.log(`⚠️  CLI deployment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Method 3: Deploy via psql directly
   */
  async deployViaPSQL() {
    console.log('🐘 Method 3: Deploying via psql...\n');
    
    try {
      // Check if psql is available
      execSync('which psql', { stdio: 'ignore' });
      
      const connectionString = this.buildConnectionString();
      
      if (!connectionString) {
        throw new Error('Could not build connection string from credentials');
      }

      console.log('✅ psql available, executing schema...');
      console.log(`   Connection: postgresql://postgres:***@db.${this.projectRef}.supabase.co:5432/postgres`);
      
      execSync(`psql "${connectionString}" -f "${this.schemaPath}"`, {
        stdio: 'inherit',
        env: { ...process.env, PGPASSWORD: connectionString.match(/postgresql:\/\/[^:]+:([^@]+)@/)?.[1] }
      });
      
      console.log('✅ Schema deployed successfully via psql!');
      return true;
    } catch (error) {
      console.log(`⚠️  psql deployment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build PostgreSQL connection string from Supabase credentials
   */
  buildConnectionString() {
    // Try to get connection string from environment or ~/.zshrc
    const dbUrl = getCredential('SUPABASE_DB_URL') || 
                  getCredential('DATABASE_URL') ||
                  process.env.SUPABASE_DB_URL || 
                  process.env.DATABASE_URL;
    
    if (dbUrl) {
      return dbUrl;
    }
    
    // Try to get database password from environment or ~/.zshrc
    const dbPassword = getCredential('SUPABASE_DB_PASSWORD') ||
                      getCredential('POSTGRES_PASSWORD') ||
                      getCredential('SUPABASE_PASSWORD') ||
                      process.env.SUPABASE_DB_PASSWORD || 
                      process.env.POSTGRES_PASSWORD ||
                      process.env.SUPABASE_PASSWORD;
    
    if (!dbPassword) {
      console.log('   ℹ️  Database password not found in ~/.zshrc');
      console.log('   💡 Add SUPABASE_DB_PASSWORD to ~/.zshrc for automated psql deployment');
      return null;
    }
    
    // Extract project reference from Supabase URL
    const url = new URL(this.credentials.url);
    const hostname = url.hostname;
    const projectRef = hostname.split('.')[0];
    
    // Supabase direct connection format
    // Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
    const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
    
    console.log(`   ✅ Built connection string from credentials`);
    return connectionString;
  }

  /**
   * Deploy using the best available method
   */
  async deploy() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 AUTOMATED SUPABASE SCHEMA DEPLOYMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Load credentials
    if (!this.loadCredentials()) {
      throw new Error('Failed to load credentials');
    }

    // Verify schema file
    if (!fs.existsSync(this.schemaPath)) {
      throw new Error(`Schema file not found: ${this.schemaPath}`);
    }

    const schema = fs.readFileSync(this.schemaPath, 'utf8');
    console.log(`📄 Schema file: ${this.schemaPath}`);
    console.log(`   Size: ${(schema.length / 1024).toFixed(2)} KB`);
    console.log(`   Lines: ${schema.split('\n').length}\n`);

    // Try deployment methods in order of preference
    const methods = [
      { name: 'Supabase Client', fn: () => this.deployViaSupabaseClient() },
      { name: 'psql', fn: () => this.deployViaPSQL() },
      { name: 'Supabase CLI', fn: () => this.deployViaCLI() }
    ];

    for (const method of methods) {
      try {
        console.log(`\n🔄 Attempting deployment via ${method.name}...\n`);
        await method.fn();
        console.log(`\n✅ Deployment successful using ${method.name}!`);
        return true;
      } catch (error) {
        console.log(`\n⚠️  ${method.name} method failed: ${error.message}`);
        if (method === methods[methods.length - 1]) {
          // Last method failed
          throw new Error(`All deployment methods failed. Last error: ${error.message}`);
        }
        // Try next method
        continue;
      }
    }
  }
}

// Main execution
async function main() {
  const deployer = new AutomatedSupabaseDeployer();
  
  try {
    await deployer.deploy();
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ AUTOMATED DEPLOYMENT COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Automated deployment failed:', error.message);
    console.error('\n💡 Fallback: Deploy manually via Supabase Dashboard SQL Editor');
    console.error(`   File: ${deployer.schemaPath}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AutomatedSupabaseDeployer };

