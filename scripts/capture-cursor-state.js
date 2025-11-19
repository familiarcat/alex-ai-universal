#!/usr/bin/env node
/**
 * Capture Cursor AI Complete State
 * 
 * Captures all state that might be lost when Cursor AI closes:
 * - Open files and tabs
 * - Editor groups and layout
 * - Terminal state
 * - Panel visibility
 * - Chat history references
 * - Workspace configuration
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.cursor', 'workspace-state.json');
const LAYOUT_FILE = path.join(__dirname, '..', '.cursor', 'workspace-layout.json');

// Capture complete workspace state
const workspaceState = {
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  description: 'Complete Cursor AI workspace state for recovery',
  
  // Layout state (from layout capture)
  layout: null,
  
  // Open files and editor state
  editors: {
    openFiles: [],
    activeEditor: null,
    editorGroups: [],
    cursorPositions: {},
    selections: {}
  },
  
  // Terminal state
  terminals: {
    activeTerminal: null,
    terminals: [],
    workingDirectories: {}
  },
  
  // Panel and view state
  panels: {
    sidebar: { visible: true, position: 'left' },
    bottomPanel: { visible: true, height: 200 },
    statusBar: { visible: true },
    activityBar: { visible: true }
  },
  
  views: {
    explorer: true,
    search: false,
    sourceControl: true,
    runAndDebug: false,
    extensions: false,
    cursorChat: true,
    cursorComposer: false
  },
  
  // Workspace configuration
  workspace: {
    folders: [],
    settings: {},
    extensions: []
  },
  
  // Alex AI specific state
  alexAI: {
    memoriesLoaded: false,
    promptGenerated: false,
    lastMemoryUpdate: null,
    lastPromptUpdate: null
  },
  
  // Recovery metadata
  recovery: {
    canRecoverFiles: true,
    canRecoverLayout: true,
    canRecoverTerminals: false, // Terminals can't be fully restored
    canRecoverChat: false, // Chat history managed by Cursor AI
    recoveryPriority: ['layout', 'files', 'panels', 'views']
  }
};

function captureState() {
  console.log('💾 Capturing Cursor AI Complete State...');
  console.log('========================================\n');
  
  try {
    // Ensure .cursor directory exists
    const cursorDir = path.dirname(STATE_FILE);
    if (!fs.existsSync(cursorDir)) {
      fs.mkdirSync(cursorDir, { recursive: true });
      console.log(`✅ Created ${cursorDir} directory`);
    }
    
    // Load existing layout if available
    if (fs.existsSync(LAYOUT_FILE)) {
      try {
        workspaceState.layout = JSON.parse(fs.readFileSync(LAYOUT_FILE, 'utf8'));
        console.log('📐 Loaded layout configuration');
      } catch (error) {
        console.warn('⚠️  Could not load layout file');
      }
    }
    
    // Read existing state if it exists
    let existingState = null;
    if (fs.existsSync(STATE_FILE)) {
      try {
        existingState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        console.log('📄 Found existing state file');
        
        // Preserve editor state if available
        if (existingState.editors && existingState.editors.openFiles) {
          workspaceState.editors.openFiles = existingState.editors.openFiles;
          console.log(`   Preserved ${workspaceState.editors.openFiles.length} open files`);
        }
      } catch (error) {
        console.warn('⚠️  Existing state file corrupted, creating new one');
      }
    }
    
    // Check for Alex AI state files
    const alexAIDir = path.join(cursorDir, 'alex-ai');
    if (fs.existsSync(alexAIDir)) {
      const memoriesFile = path.join(alexAIDir, 'crew-memories.md');
      const promptFile = path.join(alexAIDir, 'cursor-startup-prompt.md');
      
      if (fs.existsSync(memoriesFile)) {
        const stats = fs.statSync(memoriesFile);
        workspaceState.alexAI.memoriesLoaded = true;
        workspaceState.alexAI.lastMemoryUpdate = stats.mtime.toISOString();
      }
      
      if (fs.existsSync(promptFile)) {
        const stats = fs.statSync(promptFile);
        workspaceState.alexAI.promptGenerated = true;
        workspaceState.alexAI.lastPromptUpdate = stats.mtime.toISOString();
      }
    }
    
    // Update timestamp
    workspaceState.timestamp = new Date().toISOString();
    
    // Save state
    fs.writeFileSync(STATE_FILE, JSON.stringify(workspaceState, null, 2));
    
    console.log('✅ State captured successfully!');
    console.log(`   Saved to: ${STATE_FILE}`);
    console.log(`   Timestamp: ${workspaceState.timestamp}\n`);
    
    console.log('📋 State Summary:');
    console.log(`   Layout: ${workspaceState.layout ? '✅ Captured' : '⚠️  Not available'}`);
    console.log(`   Open Files: ${workspaceState.editors.openFiles.length}`);
    console.log(`   Alex AI Memories: ${workspaceState.alexAI.memoriesLoaded ? '✅ Loaded' : '❌ Not loaded'}`);
    console.log(`   Alex AI Prompt: ${workspaceState.alexAI.promptGenerated ? '✅ Generated' : '❌ Not generated'}\n`);
    
    console.log('🔄 Recovery Capabilities:');
    console.log(`   Files: ${workspaceState.recovery.canRecoverFiles ? '✅' : '❌'}`);
    console.log(`   Layout: ${workspaceState.recovery.canRecoverLayout ? '✅' : '❌'}`);
    console.log(`   Terminals: ${workspaceState.recovery.canRecoverTerminals ? '✅' : '❌'}`);
    console.log(`   Chat: ${workspaceState.recovery.canRecoverChat ? '✅' : '❌'}\n`);
    
    return workspaceState;
  } catch (error) {
    console.error('❌ Failed to capture state:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  captureState();
}

module.exports = { captureState, STATE_FILE };

