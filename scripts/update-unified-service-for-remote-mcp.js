#!/usr/bin/env node

/**
 * 🖖 Update Unified Service Accessor for Remote MCP
 * 
 * Updates the unified service accessor to use remote MCP by default
 */

const fs = require('fs');
const path = require('path');

const UNIFIED_SERVICE_PATH = path.join(__dirname, 'utils', 'unified-service-accessor.js');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Update Unified Service Accessor for Remote MCP');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Read current file
let content = fs.readFileSync(UNIFIED_SERVICE_PATH, 'utf8');

// Update initialize method to use remote MCP by default
const oldInit = `  initialize(options = {}) {
    const { useRemoteMCP = false } = options;
    this.useRemoteMCP = useRemoteMCP;
    
    if (useRemoteMCP) {
      this.initializeRemoteMCP();
    } else {
      this.initializeMCP();
    }
    
    this.initializeN8N();
    this.initialized = true;
    return true;
  }`;

const newInit = `  initialize(options = {}) {
    const { useRemoteMCP = true } = options; // Default to remote MCP
    this.useRemoteMCP = useRemoteMCP;
    
    if (useRemoteMCP) {
      this.initializeRemoteMCP();
    } else {
      this.initializeMCP();
    }
    
    this.initializeN8N();
    this.initialized = true;
    return true;
  }`;

if (content.includes(oldInit)) {
  content = content.replace(oldInit, newInit);
  console.log('✅ Updated initialize() to use remote MCP by default');
} else {
  console.log('⚠️  Could not find initialize() method to update');
}

// Update remote MCP base URL to use mcp.pbradygeorgen.com
const oldRemoteMCP = `        const baseUrl = n8n.baseUrl.replace(':5678', ':5679').replace('n8n.', 'mcp.');
        config = {
          baseUrl: baseUrl || 'https://mcp.pbradygeorgen.com',`;

const newRemoteMCP = `        config = {
          baseUrl: 'https://mcp.pbradygeorgen.com',`;

if (content.includes('baseUrl = n8n.baseUrl.replace')) {
  content = content.replace(
    /const baseUrl = n8n\.baseUrl\.replace\([^;]+;/,
    `config = {
          baseUrl: 'https://mcp.pbradygeorgen.com',`
  );
  console.log('✅ Updated remote MCP base URL to mcp.pbradygeorgen.com');
} else {
  console.log('⚠️  Could not find remote MCP URL configuration');
}

// Write updated file
fs.writeFileSync(UNIFIED_SERVICE_PATH, content, 'utf8');

console.log('\n✅ Unified service accessor updated for remote MCP');
console.log('   Default behavior: Use remote MCP (mcp.pbradygeorgen.com)');
console.log('   Fallback: Local MCP → n8n');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

