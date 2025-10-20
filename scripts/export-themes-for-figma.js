#!/usr/bin/env node
/**
 * Export Universal Theme tokens to a Tokens Studio (Figma) compatible JSON.
 * This lets designers import tokens via the Tokens Studio plugin and bind to Variables.
 *
 * Usage:
 *   node scripts/export-themes-for-figma.js [themeId ...]
 * Output:
 *   universal-theme-system/figma-export/<theme>.tokens.json
 */

const fs = require('fs');
const path = require('path');
const { THEME_DEFINITIONS } = require('../universal-theme-system/theme-definitions');

const THEMES = Object.keys(THEME_DEFINITIONS).filter((k) => k !== '_a11y');
const selected = process.argv.slice(2);
const toExport = selected.length ? selected : THEMES;

function hslToHex(h, s, l) {
  // h in [0..360], s,l in [0..100]
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function extractFirstColorFromGradient(str) {
  // Find first hex/rgb(a)/hsl(a) occurrence
  const hex = /#(?:[0-9a-fA-F]{3}){1,2}/.exec(str);
  if (hex) return hex[0];
  const rgb = /(rgba?\([^\)]+\))/.exec(str);
  if (rgb) return rgb[1];
  const hsl = /(hsla?\([^\)]+\))/.exec(str);
  if (hsl) return hsl[1];
  // Fallback: attempt to find raw H S% L% pattern
  const raw = /(\d{1,3})\s+(\d{1,3})%\s+(\d{1,3})%/.exec(str);
  if (raw) return hslToHex(Number(raw[1]), Number(raw[2]), Number(raw[3]));
  return null;
}

function normalizeColor(value) {
  if (!value || typeof value !== 'string') return value;
  const v = value.trim();
  if (v.startsWith('#')) return v;
  if (/^rgba?\(/i.test(v)) return v; // allow rgb/rgba
  if (/^hsla?\(/i.test(v)) {
    // convert to hex for broader compatibility
    const m = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%/.exec(v);
    if (m) return hslToHex(Number(m[1]), Number(m[2]), Number(m[3]));
    return v;
  }
  if (/linear-gradient/i.test(v)) {
    const first = extractFirstColorFromGradient(v);
    return first || v;
  }
  // Raw H S% L% (e.g., "210 100% 45%")
  const raw = /^(\d{1,3})\s+(\d{1,3})%\s+(\d{1,3})%$/.exec(v);
  if (raw) return hslToHex(Number(raw[1]), Number(raw[2]), Number(raw[3]));
  return v;
}

function toTokensStudio(themeCss, themeName) {
  // Map CSS vars we use → token groups
  const color = {};
  const addColor = (name, cssVar) => {
    if (themeCss[cssVar]) color[name] = { type: 'color', value: normalizeColor(themeCss[cssVar]) };
  };
  addColor('text', '--text');
  addColor('heading', '--heading');
  addColor('text-muted', '--text-muted');
  addColor('surface', '--surface');
  addColor('border', '--border');
  addColor('primary', '--primary');
  addColor('on-primary', '--on-primary');
  addColor('scrim', '--scrim');

  // Tokens Studio schema expects token sets (e.g., "global")
  return {
    $schema: 'https://tokens.studio/schemas/figma.tokens.json',
    $metadata: { tokenSetOrder: ['global'] },
    $themes: [
      {
        id: themeName,
        name: themeName,
        selectedTokenSets: { global: 'enabled' },
        $figmaStyleReferences: {}
      }
    ],
    global: {
      color,
    },
  };
}

function main() {
  const outDir = path.join(process.cwd(), 'universal-theme-system', 'figma-export');
  fs.mkdirSync(outDir, { recursive: true });

  let ok = 0;
  for (const id of toExport) {
    const def = THEME_DEFINITIONS[id];
    if (!def || !def.css) continue;
    const tokens = toTokensStudio(def.css, id);
    const out = path.join(outDir, `${id}.tokens.json`);
    fs.writeFileSync(out, JSON.stringify(tokens, null, 2));
    console.log('EXPORTED', id, '→', out);
    ok += 1;
  }
  console.log(`Done. Exported ${ok} theme token files.`);
}

main();


