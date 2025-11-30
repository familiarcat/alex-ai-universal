#!/usr/bin/env node

/**
 * Fix Button Contrast Issues
 * 
 * Updates all button components to use contrast-aware styling
 * Replaces hardcoded color values with CSS variables
 * 
 * Usage:
 *   node scripts/fix-button-contrast.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const componentDir = path.join(__dirname, '../dashboard/components');

// Find all component files
const files = glob.sync('**/*.{tsx,ts}', { cwd: componentDir });

console.log('🔍 Scanning for button components with contrast issues...\n');

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(componentDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: Hardcoded color: '#0a0015' or '#0a0a0a' on accent buttons
  // Replace with var(--button-text)
  if (content.includes("background: 'var(--accent)'") || content.includes('background: "var(--accent)"')) {
    // Check if it has hardcoded dark text color
    const patterns = [
      { old: /color:\s*['"]#0a0015['"]/g, new: "color: 'var(--button-text)'" },
      { old: /color:\s*['"]#0a0a0a['"]/g, new: "color: 'var(--button-text)'" },
      { old: /color:\s*['"]#0b1020['"]/g, new: "color: 'var(--button-text)'" },
      { old: /color:\s*['"]#000000['"]/g, new: "color: 'var(--button-text)'" },
    ];
    
    patterns.forEach(({ old, new: newVal }) => {
      if (old.test(content)) {
        content = content.replace(old, newVal);
        modified = true;
        console.log(`   ✅ Fixed hardcoded text color in ${file}`);
      }
    });
  }
  
  // Pattern 2: Inline styles with accent background but no proper text color
  // Add color: var(--button-text) if missing
  if (content.includes('var(--accent)') && !content.includes('var(--button-text)')) {
    // This is a heuristic - we'll note it but not auto-fix (too risky)
    // Just log for manual review
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ Fixed ${fixedCount} component file(s)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

