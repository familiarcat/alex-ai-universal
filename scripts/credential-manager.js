#!/usr/bin/env node
/**
 * Alex AI Credential Manager - Automated Credential Management
 * Automatically detects, validates, and updates API credentials
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class CredentialManager {
  constructor() {
    this.zshrcPath = path.join(process.env.HOME, '.zshrc');
    this.credentials = {
      n8n: {
        url: process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com',
        apiKey: process.env.N8N_API_KEY,
        status: 'unknown'
      },
      supabase: {
        url: process.env.SUPABASE_URL,
        apiKey: process.env.SUPABASE_ANON_KEY,
        status: 'unknown'
      }
    };
  }

  async validateCredentials() {
    console.log('🔐 Alex AI Credential Validation');
    console.log('=================================');
    
    const results = {
      n8n: await this.validateN8N(),
      supabase: await this.validateSupabase()
    };

    this.displayResults(results);
    return results;
  }

  async validateN8N() {
    console.log('🔗 Validating N8N credentials...');
    
    if (!this.credentials.n8n.apiKey) {
      return { status: 'missing', message: 'N8N API key not found' };
    }

    try {
      const response = await this.makeRequest(`${this.credentials.n8n.url}/api/v1/workflows`, {
        'X-N8N-API-KEY': this.credentials.n8n.apiKey,
        'Content-Type': 'application/json'
      });

      if (response.statusCode === 200) {
        return { status: 'valid', message: 'N8N connection successful' };
      } else if (response.statusCode === 401) {
        return { status: 'expired', message: 'N8N API key expired or invalid' };
      } else {
        return { status: 'error', message: `N8N connection failed: ${response.statusCode}` };
      }
    } catch (error) {
      return { status: 'error', message: `N8N connection error: ${error.message}` };
    }
  }

  async validateSupabase() {
    console.log('🗄️  Validating Supabase credentials...');
    
    if (!this.credentials.supabase.url || !this.credentials.supabase.apiKey) {
      return { status: 'missing', message: 'Supabase credentials not found' };
    }

    if (this.credentials.supabase.url.includes('your_actual_supabase_url_here')) {
      return { status: 'placeholder', message: 'Supabase URL is placeholder - needs real URL' };
    }

    try {
      const response = await this.makeRequest(`${this.credentials.supabase.url}/rest/v1/`, {
        'apikey': this.credentials.supabase.apiKey,
        'Authorization': `Bearer ${this.credentials.supabase.apiKey}`,
        'Content-Type': 'application/json'
      });

      if (response.statusCode === 200) {
        return { status: 'valid', message: 'Supabase connection successful' };
      } else if (response.statusCode === 401) {
        return { status: 'expired', message: 'Supabase API key expired or invalid' };
      } else {
        return { status: 'error', message: `Supabase connection failed: ${response.statusCode}` };
      }
    } catch (error) {
      return { status: 'error', message: `Supabase connection error: ${error.message}` };
    }
  }

  makeRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: headers
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  displayResults(results) {
    console.log('\n📊 Credential Validation Results:');
    console.log('==================================');
    
    Object.entries(results).forEach(([service, result]) => {
      const status = result.status === 'valid' ? '✅' : 
                    result.status === 'expired' ? '⚠️' : 
                    result.status === 'missing' ? '❌' : '🔧';
      
      console.log(`${status} ${service.toUpperCase()}: ${result.message}`);
    });

    const needsUpdate = Object.values(results).some(result => 
      result.status !== 'valid'
    );

    if (needsUpdate) {
      console.log('\n🔧 Credential Update Required');
      console.log('=============================');
      this.generateUpdateInstructions(results);
    } else {
      console.log('\n🎉 All credentials are valid and working!');
    }
  }

  generateUpdateInstructions(results) {
    if (results.n8n.status !== 'valid') {
      console.log('\n🔗 N8N Credential Update:');
      console.log('1. Go to your N8N instance: https://n8n.pbradygeorgen.com');
      console.log('2. Navigate to Settings > API Keys');
      console.log('3. Generate a new API key');
      console.log('4. Update ~/.zshrc with:');
      console.log('   export N8N_API_KEY="your_new_api_key_here"');
    }

    if (results.supabase.status !== 'valid') {
      console.log('\n🗄️  Supabase Credential Update:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to Settings > API');
      console.log('3. Copy your Project URL and anon key');
      console.log('4. Update ~/.zshrc with:');
      console.log('   export SUPABASE_URL="your_supabase_url_here"');
      console.log('   export SUPABASE_ANON_KEY="your_supabase_key_here"');
    }

    console.log('\n💡 After updating credentials, run:');
    console.log('   source ~/.zshrc');
    console.log('   node scripts/credential-manager.js validate');
  }

  async autoUpdateCredentials() {
    console.log('🤖 Alex AI Auto-Credential Update');
    console.log('==================================');
    
    const results = await this.validateCredentials();
    const needsUpdate = Object.values(results).some(result => 
      result.status !== 'valid'
    );

    if (needsUpdate) {
      console.log('\n🔄 Attempting automatic credential refresh...');
      
      // Try to refresh N8N credentials
      if (results.n8n.status === 'expired') {
        console.log('🔄 Refreshing N8N credentials...');
        // Here we could implement automatic credential refresh logic
        // For now, we'll provide the manual instructions
        this.generateUpdateInstructions(results);
      }

      // Try to refresh Supabase credentials
      if (results.supabase.status === 'expired' || results.supabase.status === 'placeholder') {
        console.log('🔄 Refreshing Supabase credentials...');
        // Here we could implement automatic credential refresh logic
        // For now, we'll provide the manual instructions
        this.generateUpdateInstructions(results);
      }
    } else {
      console.log('✅ All credentials are valid - no update needed!');
    }
  }
}

// CLI Interface
const credentialManager = new CredentialManager();
const command = process.argv[2];

switch (command) {
  case 'validate':
    credentialManager.validateCredentials();
    break;
    
  case 'auto-update':
    credentialManager.autoUpdateCredentials();
    break;
    
  default:
    console.log('🔐 Alex AI Credential Manager');
    console.log('=============================');
    console.log('Available commands:');
    console.log('  validate     - Validate current credentials');
    console.log('  auto-update  - Attempt automatic credential refresh');
    console.log('');
    console.log('Usage: node credential-manager.js <command>');
}
