#!/usr/bin/env node
/**
 * Recover Cursor AI Complete State
 * 
 * Detects what's missing and recovers state after Cursor AI restart:
 * - Restores layout
 * - Recovers open files (via instructions)
 * - Restores panel visibility
 * - Verifies Alex AI state
 * - Provides recovery instructions
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.cursor', 'workspace-state.json');
const LAYOUT_FILE = path.join(__dirname, '..', '.cursor', 'workspace-layout.json');
const MEMORIES_FILE = path.join(__dirname, '..', '.cursor', 'alex-ai', 'crew-memories.md');
const PROMPT_FILE = path.join(__dirname, '..', '.cursor', 'alex-ai', 'cursor-startup-prompt.md');

function recoverState() {
  console.log('🔄 Recovering Cursor AI State...');
  console.log('================================\n');
  
  const recoveryReport = {
    stateFileExists: false,
    layoutFileExists: false,
    memoriesExist: false,
    promptExists: false,
    recovered: [],
    missing: [],
    instructions: []
  };
  
  try {
    // Check state file
    if (fs.existsSync(STATE_FILE)) {
      recoveryReport.stateFileExists = true;
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      
      console.log('✅ State file found');
      console.log(`   Version: ${state.version || '1.0.0'}`);
      console.log(`   Saved: ${state.timestamp || 'Unknown'}\n`);
      
      // Check layout
      if (state.layout || fs.existsSync(LAYOUT_FILE)) {
        recoveryReport.layoutFileExists = true;
        recoveryReport.recovered.push('Layout configuration');
        console.log('✅ Layout: Available for restoration');
      } else {
        recoveryReport.missing.push('Layout configuration');
        console.log('⚠️  Layout: Not found');
      }
      
      // Check Alex AI state
      if (state.alexAI) {
        console.log('\n📊 Alex AI State:');
        console.log(`   Memories Loaded: ${state.alexAI.memoriesLoaded ? '✅' : '❌'}`);
        console.log(`   Prompt Generated: ${state.alexAI.promptGenerated ? '✅' : '❌'}`);
        
        if (state.alexAI.lastMemoryUpdate) {
          console.log(`   Last Memory Update: ${state.alexAI.lastMemoryUpdate}`);
        }
        if (state.alexAI.lastPromptUpdate) {
          console.log(`   Last Prompt Update: ${state.alexAI.lastPromptUpdate}`);
        }
      }
      
      // Check open files
      if (state.editors && state.editors.openFiles && state.editors.openFiles.length > 0) {
        console.log(`\n📂 Open Files (${state.editors.openFiles.length}):`);
        state.editors.openFiles.slice(0, 5).forEach((file, idx) => {
          console.log(`   ${idx + 1}. ${file}`);
        });
        if (state.editors.openFiles.length > 5) {
          console.log(`   ... and ${state.editors.openFiles.length - 5} more`);
        }
        recoveryReport.recovered.push(`${state.editors.openFiles.length} open files`);
      }
      
    } else {
      recoveryReport.missing.push('State file');
      console.log('⚠️  State file not found');
      console.log('   Run: npm run cursor:state:capture\n');
    }
    
    // Check layout file directly
    if (fs.existsSync(LAYOUT_FILE)) {
      recoveryReport.layoutFileExists = true;
      if (!recoveryReport.recovered.includes('Layout configuration')) {
        recoveryReport.recovered.push('Layout configuration');
      }
    }
    
    // Check Alex AI files
    if (fs.existsSync(MEMORIES_FILE)) {
      recoveryReport.memoriesExist = true;
      recoveryReport.recovered.push('Alex AI memories');
      console.log('✅ Alex AI Memories: Found');
    } else {
      recoveryReport.missing.push('Alex AI memories');
      console.log('⚠️  Alex AI Memories: Missing');
      recoveryReport.instructions.push('Run: npm run cursor:memories');
    }
    
    if (fs.existsSync(PROMPT_FILE)) {
      recoveryReport.promptExists = true;
      recoveryReport.recovered.push('Alex AI prompt');
      console.log('✅ Alex AI Prompt: Found');
    } else {
      recoveryReport.missing.push('Alex AI prompt');
      console.log('⚠️  Alex AI Prompt: Missing');
      recoveryReport.instructions.push('Run: npm run cursor:prompt');
    }
    
    // Generate recovery instructions
    console.log('\n📋 Recovery Summary:');
    console.log('===================\n');
    
    if (recoveryReport.recovered.length > 0) {
      console.log('✅ Recovered:');
      recoveryReport.recovered.forEach(item => {
        console.log(`   • ${item}`);
      });
      console.log('');
    }
    
    if (recoveryReport.missing.length > 0) {
      console.log('⚠️  Missing:');
      recoveryReport.missing.forEach(item => {
        console.log(`   • ${item}`);
      });
      console.log('');
    }
    
    if (recoveryReport.instructions.length > 0) {
      console.log('🔧 Recovery Instructions:');
      recoveryReport.instructions.forEach(instruction => {
        console.log(`   ${instruction}`);
      });
      console.log('');
    }
    
    // Auto-recovery actions
    console.log('🔄 Auto-Recovery Actions:');
    console.log('========================\n');
    
    // Restore layout if available
    if (recoveryReport.layoutFileExists) {
      console.log('📐 Restoring layout...');
      try {
        const { restoreLayout } = require('./restore-cursor-layout.js');
        restoreLayout();
      } catch (error) {
        console.log('   ⚠️  Layout restore script not available');
      }
    }
    
    // Load memories if missing
    if (!recoveryReport.memoriesExist) {
      console.log('🧠 Loading Alex AI memories...');
      recoveryReport.instructions.push('Memories will be loaded by startup task');
    }
    
    // Generate prompt if missing
    if (!recoveryReport.promptExists) {
      console.log('📝 Generating Alex AI prompt...');
      recoveryReport.instructions.push('Prompt will be generated by startup task');
    }
    
    // Save recovery report
    const reportFile = path.join(__dirname, '..', '.cursor', 'recovery-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(recoveryReport, null, 2));
    console.log(`\n📄 Recovery report saved to: ${reportFile}`);
    
    return recoveryReport;
  } catch (error) {
    console.error('❌ Failed to recover state:', error.message);
    return recoveryReport;
  }
}

// Run if executed directly
if (require.main === module) {
  recoverState();
}

module.exports = { recoverState };

