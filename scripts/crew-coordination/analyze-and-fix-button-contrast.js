#!/usr/bin/env node

/**
 * Crew Color Theory Analysis & Fix for "+ New Project" Button
 * 
 * Deep analysis of contrast ratios across all themes
 * Implements crew recommendations for WCAG AA/AAA compliance
 */

const fs = require('fs');
const path = require('path');

// Import contrast utilities (we'll need to adapt these for Node.js)
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractColor(colorString) {
  if (!colorString) return null;
  if (colorString.startsWith('#')) return colorString;
  
  // Extract from gradient
  if (colorString.includes('gradient')) {
    const match = colorString.match(/#([0-9A-Fa-f]{6})/);
    if (match) return `#${match[1]}`;
  }
  
  // Extract from rgba/rgb
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }
  
  return null;
}

function getButtonTextColor(buttonBackground, minContrast = 4.5) {
  const bgColor = extractColor(buttonBackground);
  if (!bgColor) return '#000000';
  
  const whiteContrast = getContrastRatio('#FFFFFF', bgColor);
  const blackContrast = getContrastRatio('#000000', bgColor);
  
  if (whiteContrast >= minContrast) return '#FFFFFF';
  if (blackContrast >= minContrast) return '#000000';
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

// Theme definitions from theme-colors.ts
const THEME_ACCENT_COLORS = {
  mochaEarth: '#556c52',
  verdantNature: '#2E7D32',
  chromeMetallic: '#00D4FF',
  brutalist: '#000000',
  mutedNeon: '#00b2a8',
  monochromeBlue: '#1565C0',
  gradient: '#f7c9fc',
  pastel: '#a27294',
  cyberpunk: '#ff0099',
  glassmorphism: '#a78bfa',
  midnight: '#00ffff',
  offworld: '#00d9ff'
};

// Crew Analysis
function analyzeAllThemes() {
  console.log('\n🖖 Crew Color Theory & Contrast Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const results = [];
  const issues = [];
  
  for (const [themeId, accentColor] of Object.entries(THEME_ACCENT_COLORS)) {
    const whiteContrast = getContrastRatio('#FFFFFF', accentColor);
    const blackContrast = getContrastRatio('#000000', accentColor);
    const maxContrast = Math.max(whiteContrast, blackContrast);
    
    const optimalTextColor = whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
    const meetsWCAGAA = maxContrast >= 4.5;
    const meetsWCAGAAA = maxContrast >= 7.0;
    
    const result = {
      theme: themeId,
      accentColor,
      whiteContrast: whiteContrast.toFixed(2),
      blackContrast: blackContrast.toFixed(2),
      maxContrast: maxContrast.toFixed(2),
      optimalTextColor,
      meetsWCAGAA,
      meetsWCAGAAA,
      status: meetsWCAGAA ? (meetsWCAGAAA ? '✅ AAA' : '✅ AA') : '❌ FAIL'
    };
    
    results.push(result);
    
    if (!meetsWCAGAA) {
      issues.push({
        theme: themeId,
        severity: 'CRITICAL',
        issue: `Contrast ratio ${maxContrast.toFixed(2)}:1 does not meet WCAG AA (4.5:1 required)`,
        recommendation: `Use ${optimalTextColor} text for better contrast`
      });
    } else if (!meetsWCAGAAA) {
      issues.push({
        theme: themeId,
        severity: 'WARNING',
        issue: `Contrast ratio ${maxContrast.toFixed(2)}:1 meets AA but not AAA (7.0:1 recommended)`,
        recommendation: `Consider improving contrast for AAA compliance`
      });
    }
  }
  
  // Display results
  console.log('📊 Data\'s Technical Analysis:\n');
  results.forEach(r => {
    console.log(`${r.status} ${r.theme.padEnd(20)} | Accent: ${r.accentColor} | White: ${r.whiteContrast}:1 | Black: ${r.blackContrast}:1 | Optimal: ${r.optimalTextColor}`);
  });
  
  console.log('\n⚠️  Issues Found:\n');
  if (issues.length === 0) {
    console.log('✅ All themes meet WCAG AA standards!');
  } else {
    issues.forEach(issue => {
      console.log(`${issue.severity}: ${issue.theme}`);
      console.log(`   ${issue.issue}`);
      console.log(`   💡 ${issue.recommendation}\n`);
    });
  }
  
  return { results, issues };
}

// Generate CSS fixes
function generateCSSFixes(results) {
  console.log('\n🔧 La Forge\'s Implementation Plan:\n');
  
  const fixes = [];
  
  results.forEach(result => {
    // The button should use var(--button-text) which is calculated in GlobalThemeStyles
    // But we need to ensure GlobalThemeStyles is using the optimal color
    fixes.push({
      theme: result.theme,
      cssVariable: '--button-text',
      value: result.optimalTextColor,
      contrast: result.maxContrast
    });
  });
  
  console.log('CSS Variable Updates Needed:\n');
  fixes.forEach(fix => {
    console.log(`  ${fix.theme}: --button-text = ${fix.value} (contrast: ${fix.contrast}:1)`);
  });
  
  return fixes;
}

// Main
function main() {
  const { results, issues } = analyzeAllThemes();
  const fixes = generateCSSFixes(results);
  
  console.log('\n📝 Summary:\n');
  console.log(`Total themes analyzed: ${results.length}`);
  console.log(`Themes meeting WCAG AA: ${results.filter(r => r.meetsWCAGAA).length}`);
  console.log(`Themes meeting WCAG AAA: ${results.filter(r => r.meetsWCAGAAA).length}`);
  console.log(`Issues found: ${issues.length}`);
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Update dashboard/app/dashboard/dashboard-content.tsx to use var(--button-text)');
  console.log('   2. Ensure GlobalThemeStyles.tsx calculates --button-text correctly');
  console.log('   3. Verify all themes have proper contrast\n');
  
  // Save results to file
  const reportPath = path.join(__dirname, '../../reports/button-contrast-analysis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({ results, issues, fixes }, null, 2));
  console.log(`✅ Analysis saved to: ${reportPath}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeAllThemes, generateCSSFixes };

