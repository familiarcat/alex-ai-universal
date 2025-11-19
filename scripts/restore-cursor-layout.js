#!/usr/bin/env node
/**
 * Restore Cursor AI Screen Layout
 * 
 * Applies saved workspace layout configuration
 */

const fs = require('fs');
const path = require('path');

const LAYOUT_FILE = path.join(__dirname, '..', '.cursor', 'workspace-layout.json');

function restoreLayout() {
  console.log('📐 Restoring Cursor AI Layout...');
  console.log('================================\n');
  
  try {
    // Check if layout file exists
    if (!fs.existsSync(LAYOUT_FILE)) {
      console.log('⚠️  No saved layout found');
      console.log(`   Run: node scripts/capture-cursor-layout.js`);
      console.log('   Or: npm run cursor:layout:capture\n');
      return false;
    }
    
    // Read layout configuration
    const layout = JSON.parse(fs.readFileSync(LAYOUT_FILE, 'utf8'));
    
    console.log('✅ Layout file found!');
    console.log(`   Version: ${layout.version || '1.0.0'}`);
    console.log(`   Saved: ${layout.timestamp || 'Unknown'}\n`);
    
    // Display layout configuration
    console.log('📋 Layout Configuration:');
    console.log(`   Sidebar: ${layout.panels?.sidebar?.visible ? '✅ Visible' : '❌ Hidden'} (${layout.panels?.sidebar?.position || 'left'})`);
    console.log(`   Bottom Panel: ${layout.panels?.bottomPanel?.visible ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`   Explorer: ${layout.views?.explorer ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`   Cursor Chat: ${layout.views?.cursorChat ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`   Source Control: ${layout.views?.sourceControl ? '✅ Visible' : '❌ Hidden'}\n`);
    
    // Apply layout via workspace settings
    applyLayoutToSettings(layout);
    
    console.log('✅ Layout restoration instructions:');
    console.log('   1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)');
    console.log('   2. Run: "View: Restore Editor Layout"');
    console.log('   3. Or manually adjust panels to match saved layout\n');
    
    console.log('💡 Tip: Use Command Palette commands:');
    console.log('   • "View: Toggle Primary Side Bar Visibility"');
    console.log('   • "View: Toggle Panel Visibility"');
    console.log('   • "View: Toggle Activity Bar Visibility"');
    console.log('   • "View: Show Explorer"');
    console.log('   • "View: Show Source Control"\n');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to restore layout:', error.message);
    return false;
  }
}

function applyLayoutToSettings(layout) {
  const settingsFile = path.join(__dirname, '..', '.vscode', 'settings.json');
  const cursorSettingsFile = path.join(__dirname, '..', '.cursor', 'settings.json');
  
  // Read existing settings
  let vscodeSettings = {};
  let cursorSettings = {};
  
  if (fs.existsSync(settingsFile)) {
    try {
      vscodeSettings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } catch (error) {
      console.warn('⚠️  Could not read .vscode/settings.json');
    }
  }
  
  if (fs.existsSync(cursorSettingsFile)) {
    try {
      cursorSettings = JSON.parse(fs.readFileSync(cursorSettingsFile, 'utf8'));
    } catch (error) {
      console.warn('⚠️  Could not read .cursor/settings.json');
    }
  }
  
  // Apply layout preferences to settings
  if (layout.views) {
    // Store view visibility preferences
    cursorSettings['cursor.layout'] = {
      views: layout.views,
      panels: layout.panels,
      restored: new Date().toISOString()
    };
  }
  
  // Save updated settings
  try {
    // Ensure directories exist
    const vscodeDir = path.dirname(settingsFile);
    const cursorDir = path.dirname(cursorSettingsFile);
    
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir, { recursive: true });
    }
    if (!fs.existsSync(cursorDir)) {
      fs.mkdirSync(cursorDir, { recursive: true });
    }
    
    fs.writeFileSync(cursorSettingsFile, JSON.stringify(cursorSettings, null, 2));
    console.log('✅ Layout preferences saved to .cursor/settings.json');
  } catch (error) {
    console.warn('⚠️  Could not save layout preferences:', error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  restoreLayout();
}

module.exports = { restoreLayout, applyLayoutToSettings };

