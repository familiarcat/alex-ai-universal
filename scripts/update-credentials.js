#!/usr/bin/env node
/**
 * Alex AI Credential Update Script
 * Automatically updates N8N and Supabase credentials in ~/.zshrc
 */

const fs = require('fs');
const path = require('path');

class CredentialUpdater {
  constructor() {
    this.zshrcPath = path.join(process.env.HOME, '.zshrc');
    this.backupPath = path.join(process.env.HOME, '.zshrc.backup.' + Date.now());
  }

  async updateCredentials() {
    console.log('🔐 Alex AI Credential Update System');
    console.log('===================================');
    
    // Create backup
    await this.createBackup();
    
    // Read current ~/.zshrc
    const zshrcContent = fs.readFileSync(this.zshrcPath, 'utf8');
    
    // Update N8N API Key
    const updatedContent = this.updateN8NCredentials(zshrcContent);
    
    // Update Supabase credentials
    const finalContent = this.updateSupabaseCredentials(updatedContent);
    
    // Write updated content
    fs.writeFileSync(this.zshrcPath, finalContent);
    
    console.log('✅ Credentials updated successfully!');
    console.log('📝 Backup created at:', this.backupPath);
    
    return true;
  }

  async createBackup() {
    console.log('📝 Creating backup of ~/.zshrc...');
    const zshrcContent = fs.readFileSync(this.zshrcPath, 'utf8');
    fs.writeFileSync(this.backupPath, zshrcContent);
    console.log('✅ Backup created successfully');
  }

  updateN8NCredentials(content) {
    console.log('🔗 Updating N8N API Key...');
    
    const newN8NKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA';
    
    // Remove all existing N8N_API_KEY entries
    let updatedContent = content.replace(/export N8N_API_KEY=.*\n/g, '');
    
    // Add the new N8N_API_KEY
    const n8nExport = `export N8N_API_KEY="${newN8NKey}"\n`;
    
    // Find the N8N section and add the key
    const n8nSectionIndex = updatedContent.indexOf('# N8N Workflow Automation Configuration');
    if (n8nSectionIndex !== -1) {
      const nextLineIndex = updatedContent.indexOf('\n', n8nSectionIndex);
      updatedContent = updatedContent.slice(0, nextLineIndex + 1) + n8nExport + updatedContent.slice(nextLineIndex + 1);
    } else {
      // If no N8N section found, add it at the end
      updatedContent += `\n# N8N Workflow Automation Configuration\nexport N8N_API_KEY="${newN8NKey}"\n`;
    }
    
    console.log('✅ N8N API Key updated');
    return updatedContent;
  }

  updateSupabaseCredentials(content) {
    console.log('🗄️  Updating Supabase credentials...');
    
    const newSupabaseKey = 'sb_secret_TCaP5QXq4PHTtsjxcU1l1Q_XB5nRLJg';
    const supabaseUrl = 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
    
    // Remove existing SUPABASE_ANON_KEY entries
    let updatedContent = content.replace(/export SUPABASE_ANON_KEY=.*\n/g, '');
    
    // Update SUPABASE_URL if it's a placeholder
    updatedContent = updatedContent.replace(
      /export SUPABASE_URL="your_actual_supabase_url_here"/g,
      `export SUPABASE_URL="${supabaseUrl}"`
    );
    
    // Add the new SUPABASE_ANON_KEY
    const supabaseExport = `export SUPABASE_ANON_KEY="${newSupabaseKey}"\n`;
    
    // Find the Supabase section and add the key
    const supabaseSectionIndex = updatedContent.indexOf('### === Supabase Configuration === ###');
    if (supabaseSectionIndex !== -1) {
      const nextLineIndex = updatedContent.indexOf('\n', supabaseSectionIndex);
      updatedContent = updatedContent.slice(0, nextLineIndex + 1) + supabaseExport + updatedContent.slice(nextLineIndex + 1);
    } else {
      // If no Supabase section found, add it
      updatedContent += `\n### === Supabase Configuration === ###\nexport SUPABASE_URL="${supabaseUrl}"\nexport SUPABASE_ANON_KEY="${newSupabaseKey}"\n`;
    }
    
    console.log('✅ Supabase credentials updated');
    return updatedContent;
  }

  async validateUpdatedCredentials() {
    console.log('\n🔍 Validating updated credentials...');
    
    // Reload environment
    const { execSync } = require('child_process');
    
    try {
      // Test N8N connection
      console.log('🔗 Testing N8N connection...');
      const n8nTest = execSync('node scripts/credential-manager.js validate', { 
        encoding: 'utf8',
        env: { ...process.env }
      });
      
      console.log('✅ Credential validation complete');
      return true;
    } catch (error) {
      console.log('⚠️  Credential validation failed - please check manually');
      return false;
    }
  }
}

// Run the update
const updater = new CredentialUpdater();
updater.updateCredentials().then(() => {
  console.log('\n🎉 Credential update complete!');
  console.log('💡 Next steps:');
  console.log('   1. Run: source ~/.zshrc');
  console.log('   2. Test: node scripts/credential-manager.js validate');
}).catch(console.error);
