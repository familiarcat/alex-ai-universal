#!/usr/bin/env node
/**
 * Automate Supabase Database Password Setup
 * 
 * Automatically retrieves the database password from Supabase and adds it to ~/.zshrc
 * Uses browser automation to navigate the Supabase dashboard and extract the password
 * 
 * Methods:
 * 1. Supabase Management API (if available)
 * 2. Browser automation (Puppeteer) to navigate dashboard
 * 3. Supabase CLI connection string extraction
 * 
 * Usage:
 *   node scripts/deploy/automate-supabase-password-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadSupabaseCredentials, getCredential } = require('../utils/secure-credential-loader');

class SupabasePasswordAutomator {
  constructor() {
    this.zshrcPath = path.join(process.env.HOME, '.zshrc');
    this.credentials = null;
  }

  /**
   * Load Supabase credentials
   */
  loadCredentials() {
    this.credentials = loadSupabaseCredentials();
    
    if (!this.credentials.url || !this.credentials.serviceKey) {
      throw new Error('Missing Supabase credentials in ~/.zshrc');
    }
    
    // Extract project reference
    const url = new URL(this.credentials.url);
    this.projectRef = url.hostname.split('.')[0];
    
    return true;
  }

  /**
   * Method 1: Try Supabase CLI to get connection string
   */
  async getPasswordViaCLI() {
    console.log('🔧 Method 1: Attempting via Supabase CLI...\n');
    
    try {
      execSync('which supabase', { stdio: 'ignore' });
      
      // Try to get connection string from Supabase CLI
      // Note: This requires the project to be linked
      try {
        const output = execSync('supabase status', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        // Parse connection string from output
        const dbUrlMatch = output.match(/DB URL:\s*(postgresql:\/\/[^\s]+)/);
        if (dbUrlMatch) {
          const dbUrl = dbUrlMatch[1];
          const passwordMatch = dbUrl.match(/postgresql:\/\/[^:]+:([^@]+)@/);
          if (passwordMatch) {
            return passwordMatch[1];
          }
        }
      } catch (error) {
        // CLI not linked or not available
      }
    } catch (error) {
      // Supabase CLI not installed
    }
    
    return null;
  }

  /**
   * Method 2: Use browser automation to get password from Supabase dashboard
   */
  async getPasswordViaBrowser() {
    console.log('🌐 Method 2: Attempting via browser automation...\n');
    
    // Check if Puppeteer is available
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (error) {
      console.log('   ⚠️  Puppeteer not installed');
      console.log('   💡 Install with: npm install puppeteer');
      return null;
    }

    console.log('   📱 Launching browser...');
    
    const browser = await puppeteer.launch({ 
      headless: false, // Show browser so user can log in if needed
      defaultViewport: { width: 1280, height: 720 }
    });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to Supabase project settings
      const projectUrl = `https://supabase.com/dashboard/project/${this.projectRef}/settings/database`;
      console.log(`   🔗 Navigating to: ${projectUrl}`);
      
      await page.goto(projectUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for page to load and check if we need to log in
      await page.waitForTimeout(2000);
      
      // Check if we're on a login page
      const isLoginPage = await page.$('input[type="email"]') !== null;
      if (isLoginPage) {
        console.log('   ⚠️  Login required - please log in manually in the browser');
        console.log('   ⏳ Waiting for login...');
        
        // Wait for navigation away from login page
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 });
      }
      
      // Look for database password/connection string
      // Supabase shows it in various places - try multiple selectors
      console.log('   🔍 Searching for database password...');
      
      // Method A: Look for connection string input/display
      const connectionStringSelectors = [
        'input[value*="postgresql://"]',
        'code:has-text("postgresql://")',
        '[data-testid="connection-string"]',
        '.connection-string',
        'pre:has-text("postgresql://")'
      ];
      
      let password = null;
      
      for (const selector of connectionStringSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const text = await page.evaluate(el => el.value || el.textContent, element);
            if (text && text.includes('postgresql://')) {
              const match = text.match(/postgresql:\/\/[^:]+:([^@]+)@/);
              if (match) {
                password = decodeURIComponent(match[1]);
                console.log('   ✅ Found password in connection string!');
                break;
              }
            }
          }
        } catch (error) {
          // Continue to next selector
        }
      }
      
      // Method B: Look for password field or "Show password" button
      if (!password) {
        try {
          // Look for "Show" or "Reveal" button near password fields
          const showButtons = await page.$$('button:has-text("Show"), button:has-text("Reveal"), button:has-text("Copy")');
          
          for (const button of showButtons) {
            await button.click();
            await page.waitForTimeout(500);
            
            // Look for revealed password
            const passwordInput = await page.$('input[type="text"][value*="@"], input[type="password"]');
            if (passwordInput) {
              const value = await page.evaluate(el => el.value, passwordInput);
              if (value && value.length > 10) {
                password = value;
                console.log('   ✅ Found password via reveal button!');
                break;
              }
            }
          }
        } catch (error) {
          // Continue
        }
      }
      
      // Method C: Look for connection pooler settings
      if (!password) {
        try {
          // Navigate to connection pooler settings
          await page.goto(`https://supabase.com/dashboard/project/${this.projectRef}/settings/database`, {
            waitUntil: 'networkidle2'
          });
          
          // Look for connection strings in the page
          const pageContent = await page.content();
          const connectionStringRegex = /postgresql:\/\/[^:]+:([^@]+)@[^\s"']+/g;
          const matches = pageContent.match(connectionStringRegex);
          
          if (matches && matches.length > 0) {
            const match = matches[0].match(/postgresql:\/\/[^:]+:([^@]+)@/);
            if (match) {
              password = decodeURIComponent(match[1]);
              console.log('   ✅ Found password in page content!');
            }
          }
        } catch (error) {
          // Continue
        }
      }
      
      await browser.close();
      
      return password;
      
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * Method 3: Use Supabase Management API (if available)
   */
  async getPasswordViaAPI() {
    console.log('📡 Method 3: Attempting via Supabase Management API...\n');
    
    // Note: Supabase Management API typically requires a different key
    // and may not expose database passwords directly for security
    // This is a placeholder for future API integration
    
    console.log('   ℹ️  Management API method not yet implemented');
    console.log('   💡 Supabase doesn\'t expose database passwords via API for security');
    
    return null;
  }

  /**
   * Add password to ~/.zshrc
   */
  addPasswordToZshrc(password) {
    console.log('\n📝 Adding password to ~/.zshrc...\n');
    
    if (!fs.existsSync(this.zshrcPath)) {
      throw new Error('~/.zshrc file not found');
    }
    
    let zshrcContent = fs.readFileSync(this.zshrcPath, 'utf8');
    
    // Check if SUPABASE_DB_PASSWORD already exists
    if (zshrcContent.includes('SUPABASE_DB_PASSWORD')) {
      console.log('   ⚠️  SUPABASE_DB_PASSWORD already exists in ~/.zshrc');
      console.log('   🔄 Updating existing value...');
      
      // Replace existing value
      zshrcContent = zshrcContent.replace(
        /export\s+SUPABASE_DB_PASSWORD=["']?[^"'\n]*["']?/g,
        `export SUPABASE_DB_PASSWORD="${password}"`
      );
    } else {
      // Add new export statement
      // Find a good place to add it (after other Supabase exports)
      const supabaseSection = zshrcContent.match(/# Supabase[\s\S]*?(?=\n\n|\n#|$)/);
      
      if (supabaseSection) {
        // Add after Supabase section
        zshrcContent = zshrcContent.replace(
          supabaseSection[0],
          `${supabaseSection[0]}\nexport SUPABASE_DB_PASSWORD="${password}"`
        );
      } else {
        // Add at end of file
        zshrcContent += `\n# Supabase Database Password\nexport SUPABASE_DB_PASSWORD="${password}"\n`;
      }
    }
    
    // Write back to file
    fs.writeFileSync(this.zshrcPath, zshrcContent, 'utf8');
    
    console.log('   ✅ Password added to ~/.zshrc');
    console.log('   💡 Run: source ~/.zshrc (or restart terminal) to load the password\n');
    
    // Also set in current process
    process.env.SUPABASE_DB_PASSWORD = password;
  }

  /**
   * Main automation process
   */
  async automate() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 AUTOMATE SUPABASE DATABASE PASSWORD SETUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Load credentials
    this.loadCredentials();
    console.log(`✅ Project Reference: ${this.projectRef}\n`);

    // Check if password already exists
    const existingPassword = getCredential('SUPABASE_DB_PASSWORD');
    if (existingPassword) {
      console.log('✅ SUPABASE_DB_PASSWORD already exists in ~/.zshrc');
      console.log('   Current value: ' + existingPassword.substring(0, 10) + '...\n');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('   Do you want to update it? (y/n): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('   Skipping password update\n');
        return;
      }
    }

    // Try methods in order
    const methods = [
      { name: 'Supabase CLI', fn: () => this.getPasswordViaCLI() },
      { name: 'Browser Automation', fn: () => this.getPasswordViaBrowser() },
      { name: 'Management API', fn: () => this.getPasswordViaAPI() }
    ];

    let password = null;

    for (const method of methods) {
      try {
        console.log(`\n🔄 Trying ${method.name}...\n`);
        password = await method.fn();
        
        if (password) {
          console.log(`\n✅ Successfully retrieved password via ${method.name}!`);
          break;
        }
      } catch (error) {
        console.log(`\n⚠️  ${method.name} failed: ${error.message}`);
        if (method === methods[methods.length - 1]) {
          throw new Error('All methods failed to retrieve password');
        }
        continue;
      }
    }

    if (!password) {
      console.log('\n❌ Could not automatically retrieve password');
      console.log('\n💡 Manual Steps:');
      console.log(`   1. Go to: https://supabase.com/dashboard/project/${this.projectRef}/settings/database`);
      console.log('   2. Find the database password or connection string');
      console.log('   3. Copy the password');
      console.log('   4. Run: export SUPABASE_DB_PASSWORD="your-password"');
      console.log('   5. Or add to ~/.zshrc: export SUPABASE_DB_PASSWORD="your-password"\n');
      process.exit(1);
    }

    // Add to ~/.zshrc
    this.addPasswordToZshrc(password);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PASSWORD SETUP COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Source ~/.zshrc: source ~/.zshrc');
    console.log('   2. Deploy schema: node scripts/deploy/automated-supabase-deploy.js\n');
  }
}

// Main execution
async function main() {
  const automator = new SupabasePasswordAutomator();
  
  try {
    await automator.automate();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Automation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SupabasePasswordAutomator };

