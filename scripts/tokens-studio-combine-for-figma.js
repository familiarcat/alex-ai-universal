#!/usr/bin/env node
/**
 * Combine per-theme Tokens Studio JSON into a single file with theme-prefixed groups.
 * Input: universal-theme-system/figma-export/*.tokens.json
 * Output: universal-theme-system/figma-export/_combined.all-themes.tokens.json
 *
 * Structure produced (so variable names can be gradient/color/text, etc.):
 * {
 *   $schema: ..., $metadata: ..., $themes: [...],
 *   global: {
 *     gradient: { color: { text: {type:'color', value:'#...'} } },
 *     material: { color: { ... } },
 *     ...
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = path.join(root, 'universal-theme-system', 'figma-export');
const outFile = path.join(srcDir, '_combined.all-themes.tokens.json');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function getThemeIdFromFile(json, filename) {
  const id = json?.$themes?.[0]?.id || json?.$themes?.[0]?.name;
  if (id) return String(id);
  return path.basename(filename).replace(/\.tokens\.json$/i, '');
}

function ensure(obj, key, init) {
  if (!obj[key]) obj[key] = typeof init === 'function' ? init() : init;
  return obj[key];
}

function main() {
  const files = fs.readdirSync(srcDir).filter((f) => /\.tokens\.json$/i.test(f) && !f.startsWith('_combined.'));
  if (files.length === 0) {
    console.error('No *.tokens.json files found in figma-export.');
    process.exit(1);
  }

  const combined = {
    $schema: 'https://tokens.studio/schemas/figma.tokens.json',
    $metadata: { tokenSetOrder: ['global'] },
    $themes: [],
    global: {},
  };

  for (const file of files) {
    const full = path.join(srcDir, file);
    const json = readJson(full);
    const themeId = getThemeIdFromFile(json, file);

    // Record theme in $themes
    combined.$themes.push({
      id: themeId,
      name: themeId,
      selectedTokenSets: { global: 'enabled' },
      $figmaStyleReferences: {},
    });

    // Gather categories from source (color, spacing, radius, type)
    const srcGlobal = json.global || {};
    const themeGroup = ensure(combined.global, themeId, {});

    for (const category of Object.keys(srcGlobal)) {
      const srcCategory = srcGlobal[category];
      if (!srcCategory || typeof srcCategory !== 'object') continue;
      const dstCategory = ensure(themeGroup, category, {});
      // Shallow copy tokens; nested structures are preserved
      Object.assign(dstCategory, srcCategory);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(combined, null, 2));
  console.log('COMBINED_OK', outFile);
}

if (require.main === module) {
  main();
}


