#!/usr/bin/env node

const { THEME_DEFINITIONS } = require('../universal-theme-system/theme-definitions.js');

function hexToRgb(hex){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if(!m) return null;
  return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) };
}

function relativeLuminance({r,g,b}){
  const srgb=[r,g,b].map(v=>{
    v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);
  });
  return 0.2126*srgb[0]+0.7152*srgb[1]+0.0722*srgb[2];
}

function contrastRatio(fg,bg){
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [light,dark] = L1>L2? [L1,L2] : [L2,L1];
  return (light+0.05)/(dark+0.05);
}

function parseColor(value){
  // Accept hex or rgba/hsla with hex fallback only for this audit
  if(typeof value !== 'string') return null;
  const hexMatch = value.match(/#([0-9a-fA-F]{6})/);
  if(hexMatch) return hexToRgb(`#${hexMatch[1]}`);
  return null;
}

function audit(){
  const results=[];
  for(const [key,def] of Object.entries(THEME_DEFINITIONS)){
    if(key.startsWith('_')) continue;
    const css=def.css||{};
    const text=parseColor(css['--text']);
    const surface=parseColor(css['--surface']) || parseColor(css['--background']) || {r:26,g:26,b:26};
    if(!text||!surface){
      results.push({theme:key, status:'warn', note:'missing colors for audit'});
      continue;
    }
    const ratio = contrastRatio(text,surface);
    const passAA = ratio>= (THEME_DEFINITIONS._a11y?.minContrastAA || 4.5);
    const passAAA = ratio>= (THEME_DEFINITIONS._a11y?.minContrastAAA || 7.0);
    results.push({theme:key, ratio:+ratio.toFixed(2), AA:passAA, AAA:passAAA});
  }
  // Pretty print
  const bad = results.filter(r=>r.AA===false);
  console.log('WCAG Contrast Audit');
  for(const r of results){
    if(r.status==='warn') { console.log(`- ${r.theme}: warn (${r.note})`); continue; }
    console.log(`- ${r.theme}: ${r.ratio}: ${r.AA?'AA✓':'AA✗'} ${r.AAA?'AAA✓':'AAA✗'}`);
  }
  if(bad.length){
    console.log(`\nThemes failing AA: ${bad.map(b=>b.theme).join(', ')}`);
    process.exitCode=1;
  }
}

if(require.main===module){ audit(); }
