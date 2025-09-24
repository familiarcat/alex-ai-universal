#!/usr/bin/env node
/**
 * Update Alex AI Secrets Configuration
 * Updates the ~/.alexai-secrets/api-keys.env file with new credentials
 */

const fs = require('fs');
const path = require('path');

class AlexAISecretsUpdater {
  constructor() {
    this.secretsPath = path.join(process.env.HOME, '.alexai-secrets', 'api-keys.env');
    this.backupPath = path.join(process.env.HOME, '.alexai-secrets', 'api-keys.env.backup.' + Date.now());
  }

  async updateSecrets() {
    console.log('🔐 Alex AI Secrets Update');
    console.log('=========================');
    
    // Create backup
    await this.createBackup();
    
    // Read current secrets file
    const secretsContent = fs.readFileSync(this.secretsPath, 'utf8');
    
    // Update with new credentials
    const updatedContent = this.updateCredentials(secretsContent);
    
    // Write updated content
    fs.writeFileSync(this.secretsPath, updatedContent);
    
    console.log('✅ Alex AI secrets updated successfully!');
    console.log('📝 Backup created at:', this.backupPath);
    
    return true;
  }

  async createBackup() {
    console.log('📝 Creating backup of Alex AI secrets...');
    const secretsContent = fs.readFileSync(this.secretsPath, 'utf8');
    fs.writeFileSync(this.backupPath, secretsContent);
    console.log('✅ Backup created successfully');
  }

  updateCredentials(content) {
    console.log('🔗 Updating N8N API Key...');
    console.log('🗄️  Updating Supabase credentials...');
    
    const newN8NKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA';
    const newSupabaseKey = 'sb_secret_TCaP5QXq4PHTtsjxcU1l1Q_XB5nRLJg';
    const supabaseUrl = 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
    
    // Update N8N API Key
    let updatedContent = content.replace(
      /N8N_API_KEY="your_actual_n8n_api_key_here"/g,
      `N8N_API_KEY="${newN8NKey}"`
    );
    
    // Update Supabase URL
    updatedContent = updatedContent.replace(
      /SUPABASE_URL="your_actual_supabase_url_here"/g,
      `SUPABASE_URL="${supabaseUrl}"`
    );
    
    // Update Supabase ANON Key
    updatedContent = updatedContent.replace(
      /SUPABASE_ANON_KEY="your_actual_supabase_anon_key_here"/g,
      `SUPABASE_ANON_KEY="${newSupabaseKey}"`
    );
    
    console.log('✅ All credentials updated');
    return updatedContent;
  }
}

// Run the update
const updater = new AlexAISecretsUpdater();
updater.updateSecrets().then(() => {
  console.log('\n🎉 Alex AI secrets update complete!');
  console.log('💡 Next steps:');
  console.log('   1. Run: source ~/.zshrc');
  console.log('   2. Test: node scripts/credential-manager.js validate');
}).catch(console.error);
