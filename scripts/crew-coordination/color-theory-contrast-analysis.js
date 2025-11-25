#!/usr/bin/env node

/**
 * Crew Color Theory & Contrast Analysis
 * 
 * Deep dive into color theory to ensure "+ New Project" button
 * is always legible across all themes
 * 
 * Crew Members:
 * - Data: Technical analysis of contrast ratios
 * - Troi: UX and human perception considerations
 * - La Forge: Implementation and CSS updates
 * - Worf: Security/accessibility compliance (WCAG)
 */

const fs = require('fs');
const path = require('path');

// Load contrast utilities
const { getContrastRatio, extractColor, getButtonTextColor, meetsWCAGAA } = require('../../dashboard/lib/contrast-utils');

// Load theme colors
function loadThemeColors() {
  try {
    const themeColorsPath = path.join(__dirname, '../../dashboard/lib/theme-colors.ts');
    const content = fs.readFileSync(themeColorsPath, 'utf8');
    
    // Extract theme definitions (simplified - we'll need to parse the actual structure)
    const themes = {};
    
    // For now, let's read the actual theme colors file properly
    return require('../../dashboard/lib/theme-colors');
  } catch (error) {
    console.error('Error loading theme colors:', error);
    return {};
  }
}

// Crew Analysis Functions

/**
 * Data's Technical Analysis
 * Calculates precise contrast ratios and identifies issues
 */
function dataContrastAnalysis(themes) {
  const issues = [];
  const recommendations = [];
  
  for (const [themeId, themeColors] of Object.entries(themes)) {
    const accentColor = extractColor(themeColors.accent);
    const bgColor = extractColor(themeColors.background);
    
    if (!accentColor || !bgColor) {
      issues.push({
        theme: themeId,
        severity: 'high',
        issue: 'Cannot extract colors for contrast analysis',
        colors: { accent: themeColors.accent, background: themeColors.background }
      });
      continue;
    }
    
    // Test white text on accent (button background)
    const whiteContrast = getContrastRatio('#FFFFFF', accentColor);
    const blackContrast = getContrastRatio('#000000', accentColor);
    
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    const meetsAA = whiteContrast >= 4.5 || blackContrast >= 4.5;
    const meetsAALarge = whiteContrast >= 3.0 || blackContrast >= 3.0;
    
    if (!meetsAA) {
      issues.push({
        theme: themeId,
        severity: 'high',
        issue: `Contrast ratio too low: white=${whiteContrast.toFixed(2)}:1, black=${blackContrast.toFixed(2)}:1`,
        whiteContrast,
        blackContrast,
        accentColor,
        recommendedTextColor: whiteContrast > blackContrast ? '#FFFFFF' : '#000000'
      });
    }
    
    recommendations.push({
      theme: themeId,
      accentColor,
      whiteContrast: whiteContrast.toFixed(2),
      blackContrast: blackContrast.toFixed(2),
      optimalTextColor: whiteContrast > blackContrast ? '#FFFFFF' : '#000000',
      meetsWCAGAA: meetsAA,
      meetsWCAGLarge: meetsAALarge
    });
  }
  
  return { issues, recommendations };
}

/**
 * Troi's UX & Human Perception Analysis
 * Considers visual comfort, readability, and user experience
 */
function troiPerceptionAnalysis(recommendations) {
  const uxIssues = [];
  
  recommendations.forEach(rec => {
    // Check if contrast is comfortable (not just meeting minimum)
    const minComfortableContrast = 4.5;
    const maxContrast = Math.max(parseFloat(rec.whiteContrast), parseFloat(rec.blackContrast));
    
    if (maxContrast < minComfortableContrast) {
      uxIssues.push({
        theme: rec.theme,
        issue: 'Contrast may be technically compliant but uncomfortable to read',
        contrast: maxContrast,
        recommendation: 'Increase contrast for better readability'
      });
    }
    
    // Check for color combinations that cause eye strain
    const accentColor = rec.accentColor;
    if (accentColor) {
      // Very bright colors can cause eye strain
      const rgb = hexToRgb(accentColor);
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      
      if (brightness > 240 && rec.optimalTextColor === '#FFFFFF') {
        uxIssues.push({
          theme: rec.theme,
          issue: 'Very bright background with white text may cause eye strain',
          recommendation: 'Consider slightly darker background or use dark text'
        });
      }
    }
  });
  
  return uxIssues;
}

/**
 * Worf's Accessibility Compliance Check
 * Ensures WCAG AA/AAA compliance
 */
function worfAccessibilityCheck(recommendations) {
  const complianceIssues = [];
  
  recommendations.forEach(rec => {
    if (!rec.meetsWCAGAA) {
      complianceIssues.push({
        theme: rec.theme,
        severity: 'critical',
        issue: 'Does not meet WCAG AA standards (4.5:1 minimum)',
        currentContrast: Math.max(parseFloat(rec.whiteContrast), parseFloat(rec.blackContrast)),
        required: 4.5
      });
    }
    
    // Check for AAA compliance (7:1 for normal text)
    const maxContrast = Math.max(parseFloat(rec.whiteContrast), parseFloat(rec.blackContrast));
    if (maxContrast < 7.0) {
      complianceIssues.push({
        theme: rec.theme,
        severity: 'warning',
        issue: 'Does not meet WCAG AAA standards (7:1 recommended)',
        currentContrast: maxContrast,
        recommendation: 'Consider improving contrast for AAA compliance'
      });
    }
  });
  
  return complianceIssues;
}

/**
 * La Forge's Implementation Plan
 * Generates CSS updates for each theme
 */
function laForgeImplementationPlan(recommendations, issues) {
  const cssUpdates = [];
  
  recommendations.forEach(rec => {
    const themeId = rec.theme;
    const optimalTextColor = rec.optimalTextColor;
    
    // Check if there's an issue that needs fixing
    const hasIssue = issues.some(i => i.theme === themeId);
    
    if (hasIssue || !rec.meetsWCAGAA) {
      cssUpdates.push({
        theme: themeId,
        cssVariable: '--button-text',
        value: optimalTextColor,
        reason: `Ensures WCAG AA compliance (contrast: ${Math.max(parseFloat(rec.whiteContrast), parseFloat(rec.blackContrast)).toFixed(2)}:1)`
      });
    }
  });
  
  return cssUpdates;
}

// Helper function
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Main analysis function
async function main() {
  console.log('\n🖖 Crew Color Theory & Contrast Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Load themes - we need to import the actual theme colors
  // For now, let's read the theme-colors.ts file and extract theme definitions
  const themeColorsPath = path.join(__dirname, '../../dashboard/lib/theme-colors.ts');
  const themeColorsContent = fs.readFileSync(themeColorsPath, 'utf8');
  
  // Parse theme definitions from the file
  // This is a simplified approach - we'll need to actually parse the TypeScript
  // For now, let's create a script that can be run to analyze themes
  
  console.log('📊 Loading theme definitions...\n');
  
  // We'll need to actually run this in the dashboard context to get real theme data
  // For now, let's create the analysis framework
  
  console.log('✅ Analysis framework ready');
  console.log('\n💡 This script needs to be run in the dashboard context to access theme definitions.');
  console.log('   Creating a Next.js API route version for runtime analysis...\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  dataContrastAnalysis,
  troiPerceptionAnalysis,
  worfAccessibilityCheck,
  laForgeImplementationPlan
};

