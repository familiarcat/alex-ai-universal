#!/usr/bin/env node

/**
 * 🎨 Theme Contrast Analyzer
 * 
 * Analyzes contrast ratios across all themes and components
 * Identifies contrast issues and provides optimization recommendations
 * 
 * Usage:
 *   node scripts/theme-contrast-analyzer.js
 *   node scripts/theme-contrast-analyzer.js --fix
 */

const fs = require('fs');
const path = require('path');

// WCAG contrast ratio calculation
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Calculate relative luminance
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Convert hex to RGB
function hexToRgb(hex) {
  // Handle gradient strings
  if (hex.includes('gradient') || hex.includes('linear-gradient')) {
    // Extract first color from gradient
    const match = hex.match(/#([0-9A-Fa-f]{6})/);
    if (match) {
      hex = match[1];
    } else {
      // Default to white for gradients we can't parse
      return { r: 255, g: 255, b: 255 };
    }
  }
  
  // Remove # if present
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

// Extract color from CSS variable or gradient
function extractColor(colorString) {
  if (!colorString) return null;
  
  // If it's a hex color
  if (colorString.startsWith('#')) {
    return colorString;
  }
  
  // If it's a gradient, extract first color
  if (colorString.includes('gradient')) {
    const match = colorString.match(/#([0-9A-Fa-f]{6})/);
    if (match) return `#${match[1]}`;
  }
  
  // If it's rgba/rgb, convert to hex approximation
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

// WCAG contrast requirements
const WCAG_AA_NORMAL = 4.5; // Normal text
const WCAG_AA_LARGE = 3.0;  // Large text (18pt+ or 14pt+ bold)
const WCAG_AAA_NORMAL = 7.0; // Enhanced
const WCAG_AAA_LARGE = 4.5;  // Enhanced large

class ThemeContrastAnalyzer {
  constructor() {
    this.themes = this.loadThemes();
    this.components = this.findComponents();
    this.issues = [];
  }
  
  loadThemes() {
    const themeFile = path.join(__dirname, '../dashboard/lib/theme-colors.ts');
    const content = fs.readFileSync(themeFile, 'utf8');
    
    const themes = {};
    
    // Extract theme definitions
    const themeIds = [
      'mochaEarth', 'verdantNature', 'chromeMetallic', 'brutalist', 'mutedNeon',
      'monochromeBlue', 'gradient', 'pastel', 'cyberpunk', 'glassmorphism',
      'midnight', 'offworld'
    ];
    
    themeIds.forEach(themeId => {
      // Extract colors from theme-colors.ts
      const backgroundMatch = content.match(new RegExp(`${themeId}:\\s*['"]([^'"]+)['"]`, 'm'));
      const textMatch = content.match(new RegExp(`THEME_TEXT_COLORS[\\s\\S]*?${themeId}:\\s*['"]([^'"]+)['"]`, 'm'));
      const headingMatch = content.match(new RegExp(`THEME_HEADING_COLORS[\\s\\S]*?${themeId}:\\s*['"]([^'"]+)['"]`, 'm'));
      const accentMatch = content.match(new RegExp(`THEME_ACCENT_COLORS[\\s\\S]*?${themeId}:\\s*['"]([^'"]+)['"]`, 'm'));
      
      themes[themeId] = {
        background: backgroundMatch ? backgroundMatch[1] : null,
        text: textMatch ? textMatch[1] : null,
        heading: headingMatch ? headingMatch[1] : null,
        accent: accentMatch ? accentMatch[1] : null
      };
    });
    
    return themes;
  }
  
  findComponents() {
    const componentDir = path.join(__dirname, '../dashboard/components');
    const files = fs.readdirSync(componentDir);
    return files
      .filter(f => (f.endsWith('.tsx') || f.endsWith('.ts')) && !f.includes('workflows'))
      .map(f => path.join(componentDir, f));
  }
  
  analyzeTheme(themeId) {
    const theme = this.themes[themeId];
    if (!theme) return null;
    
    const analysis = {
      themeId,
      issues: [],
      recommendations: []
    };
    
    // Analyze button contrast (accent on background)
    const accentColor = extractColor(theme.accent);
    const bgColor = extractColor(theme.background);
    
    if (accentColor && bgColor) {
      const buttonContrast = getContrastRatio(accentColor, bgColor);
      
      if (buttonContrast < WCAG_AA_LARGE) {
        analysis.issues.push({
          type: 'button_contrast',
          severity: 'critical',
          message: `Button contrast (${buttonContrast.toFixed(2)}) fails WCAG AA Large Text (needs ${WCAG_AA_LARGE})`,
          current: buttonContrast,
          required: WCAG_AA_LARGE,
          fix: this.suggestButtonFix(themeId, accentColor, bgColor)
        });
      } else if (buttonContrast < WCAG_AA_NORMAL) {
        analysis.issues.push({
          type: 'button_contrast',
          severity: 'warning',
          message: `Button contrast (${buttonContrast.toFixed(2)}) passes Large Text but fails Normal Text (needs ${WCAG_AA_NORMAL})`,
          current: buttonContrast,
          required: WCAG_AA_NORMAL
        });
      }
    }
    
    // Analyze text contrast (text on background)
    const textColor = extractColor(theme.text);
    if (textColor && bgColor) {
      const textContrast = getContrastRatio(textColor, bgColor);
      
      if (textContrast < WCAG_AA_NORMAL) {
        analysis.issues.push({
          type: 'text_contrast',
          severity: 'critical',
          message: `Text contrast (${textContrast.toFixed(2)}) fails WCAG AA Normal Text (needs ${WCAG_AA_NORMAL})`,
          current: textContrast,
          required: WCAG_AA_NORMAL,
          fix: this.suggestTextFix(themeId, textColor, bgColor)
        });
      }
    }
    
    // Analyze heading contrast
    const headingColor = extractColor(theme.heading);
    if (headingColor && bgColor) {
      const headingContrast = getContrastRatio(headingColor, bgColor);
      
      if (headingContrast < WCAG_AA_NORMAL) {
        analysis.issues.push({
          type: 'heading_contrast',
          severity: 'critical',
          message: `Heading contrast (${headingContrast.toFixed(2)}) fails WCAG AA Normal Text (needs ${WCAG_AA_NORMAL})`,
          current: headingContrast,
          required: WCAG_AA_NORMAL
        });
      }
    }
    
    return analysis;
  }
  
  suggestButtonFix(themeId, accentColor, bgColor) {
    // Calculate what accent color would work
    const targetContrast = WCAG_AA_LARGE;
    
    // For light backgrounds, use darker accent
    // For dark backgrounds, use lighter accent
    const bgLum = getLuminance(bgColor);
    const isLightBg = bgLum > 0.5;
    
    if (isLightBg) {
      // Need darker accent
      return {
        suggestion: 'Use darker accent color for better contrast',
        example: this.darkenColor(accentColor, 0.3)
      };
    } else {
      // Need lighter accent
      return {
        suggestion: 'Use lighter accent color for better contrast',
        example: this.lightenColor(accentColor, 0.3)
      };
    }
  }
  
  suggestTextFix(themeId, textColor, bgColor) {
    const bgLum = getLuminance(bgColor);
    const isLightBg = bgLum > 0.5;
    
    if (isLightBg) {
      return {
        suggestion: 'Use darker text color',
        example: this.darkenColor(textColor, 0.2)
      };
    } else {
      return {
        suggestion: 'Use lighter text color',
        example: this.lightenColor(textColor, 0.2)
      };
    }
  }
  
  darkenColor(hex, amount) {
    const rgb = hexToRgb(hex);
    const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
    const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
    const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }
  
  lightenColor(hex, amount) {
    const rgb = hexToRgb(hex);
    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount));
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }
  
  analyzeAllThemes() {
    console.log('🎨 Theme Contrast Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = {};
    let totalIssues = 0;
    
    Object.keys(this.themes).forEach(themeId => {
      const analysis = this.analyzeTheme(themeId);
      if (analysis) {
        results[themeId] = analysis;
        totalIssues += analysis.issues.length;
        
        if (analysis.issues.length > 0) {
          console.log(`\n❌ ${themeId}: ${analysis.issues.length} contrast issue(s)`);
          analysis.issues.forEach(issue => {
            console.log(`   ${issue.severity === 'critical' ? '🔴' : '🟡'} ${issue.message}`);
            if (issue.fix) {
              console.log(`      💡 Fix: ${issue.fix.suggestion}`);
              if (issue.fix.example) {
                console.log(`      📝 Example: ${issue.fix.example}`);
              }
            }
          });
        } else {
          console.log(`✅ ${themeId}: No contrast issues`);
        }
      }
    });
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 Summary: ${totalIssues} total contrast issues found`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return results;
  }
}

// Main execution
function main() {
  const analyzer = new ThemeContrastAnalyzer();
  const results = analyzer.analyzeAllThemes();
  
  // Save results
  const outputPath = path.join(__dirname, '../reports/theme-contrast-analysis.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`📄 Results saved to: ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { ThemeContrastAnalyzer, getContrastRatio, getLuminance };

