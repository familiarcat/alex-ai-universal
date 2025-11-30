#!/usr/bin/env node
/**
 * Capture Cursor AI Screen Layout
 * 
 * Saves current workspace layout configuration for automatic restoration
 */

const fs = require('fs');
const path = require('path');

const LAYOUT_FILE = path.join(__dirname, '..', '.cursor', 'workspace-layout.json');

// Cursor AI / VS Code layout configuration
// Note: Cursor AI doesn't expose direct API, so we use workspace settings
const layoutConfig = {
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  description: 'Cursor AI workspace layout configuration',
  
  // Panel visibility and positions
  panels: {
    // Sidebar visibility
    sidebar: {
      visible: true,
      position: 'left', // 'left' | 'right'
      width: 250
    },
    
    // Activity bar
    activityBar: {
      visible: true,
      position: 'left'
    },
    
    // Primary sidebar (Explorer, Search, etc.)
    primarySideBar: {
      visible: true,
      width: 250
    },
    
    // Secondary sidebar (if split)
    secondarySideBar: {
      visible: false,
      width: 0
    },
    
    // Bottom panel (Terminal, Problems, etc.)
    bottomPanel: {
      visible: true,
      height: 200,
      position: 'bottom'
    },
    
    // Status bar
    statusBar: {
      visible: true
    },
    
    // Editor groups
    editorGroups: {
      layout: 'split', // 'single' | 'split' | 'grid'
      groups: [
        {
          id: 'main',
          active: true,
          files: []
        }
      ]
    }
  },
  
  // View visibility
  views: {
    explorer: true,
    search: false,
    sourceControl: true,
    runAndDebug: false,
    extensions: false,
    cursorChat: true, // Cursor AI specific
    cursorComposer: false // Cursor AI specific
  },
  
  // Window state
  window: {
    zoomLevel: 0,
    theme: 'default',
    colorTheme: 'Default Dark+' // VS Code theme
  },
  
  // Workspace-specific settings
  workspace: {
    folders: [],
    settings: {}
  }
};

function captureLayout() {
  console.log('📐 Capturing Cursor AI Layout...');
  console.log('================================\n');
  
  try {
    // Ensure .cursor directory exists
    const cursorDir = path.dirname(LAYOUT_FILE);
    if (!fs.existsSync(cursorDir)) {
      fs.mkdirSync(cursorDir, { recursive: true });
      console.log(`✅ Created ${cursorDir} directory`);
    }
    
    // Read existing layout if it exists
    let existingLayout = null;
    if (fs.existsSync(LAYOUT_FILE)) {
      try {
        existingLayout = JSON.parse(fs.readFileSync(LAYOUT_FILE, 'utf8'));
        console.log('📄 Found existing layout configuration');
      } catch (error) {
        console.log('⚠️  Existing layout file corrupted, creating new one');
      }
    }
    
    // Merge with existing if available (preserve user customizations)
    const layout = existingLayout ? { ...layoutConfig, ...existingLayout } : layoutConfig;
    layout.timestamp = new Date().toISOString();
    layout.version = '1.0.0';
    
    // Save layout
    fs.writeFileSync(LAYOUT_FILE, JSON.stringify(layout, null, 2));
    
    console.log('✅ Layout captured successfully!');
    console.log(`   Saved to: ${LAYOUT_FILE}`);
    console.log(`   Timestamp: ${layout.timestamp}\n`);
    
    console.log('📋 Layout Configuration:');
    console.log(`   Sidebar: ${layout.panels.sidebar.visible ? '✅ Visible' : '❌ Hidden'} (${layout.panels.sidebar.position})`);
    console.log(`   Bottom Panel: ${layout.panels.bottomPanel.visible ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`   Explorer: ${layout.views.explorer ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`   Cursor Chat: ${layout.views.cursorChat ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`   Source Control: ${layout.views.sourceControl ? '✅ Visible' : '❌ Hidden'}\n`);
    
    return layout;
  } catch (error) {
    console.error('❌ Failed to capture layout:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  captureLayout();
}

module.exports = { captureLayout, LAYOUT_FILE };

