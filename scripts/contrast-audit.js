#!/usr/bin/env node

const { THEME_DEFINITIONS } = require('../universal-theme-system/theme-definitions.js');

function clamp01(v){ return Math.min(1, Math.max(0, v)); }

function hexToRgb(hex){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if(!m) return null;
  return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) };
}

function rgbStrToRgb(str){
  const m = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(str);
  if(!m) return null; return { r: +m[1], g: +m[2], b: +m[3] };
}

function hslToRgb(h, s, l){
  // h in [0,360], s,l in [0,1]
  h = ((h%360)+360)%360; s = clamp01(s); l = clamp01(l);
  const c = (1 - Math.abs(2*l-1)) * s;
  const x = c * (1 - Math.abs((h/60)%2 - 1));
  const m = l - c/2;
  let r=0,g=0,b=0;
  if (h<60){ r=c; g=x; b=0; }
  else if (h<120){ r=x; g=c; b=0; }
  else if (h<180){ r=0; g=c; b=x; }
  else if (h<240){ r=0; g=x; b=c; }
  else if (h<300){ r=x; g=0; b=c; }
  else { r=c; g=0; b=x; }
  return { r: Math.round((r+m)*255), g: Math.round((g+m)*255), b: Math.round((b+m)*255) };
}

function hslStrToRgb(str){
  const m = /hsla?\(([-\d.]+)\s*,\s*([-\d.]+)%\s*,\s*([-\d.]+)%/i.exec(str);
  if(!m) return null; return hslToRgb(parseFloat(m[1]), parseFloat(m[2])/100, parseFloat(m[3])/100);
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
  if(typeof value !== 'string') return null;
  // extract first workable color from string (handles gradients)
  const hexMatch = value.match(/#([0-9a-fA-F]{6})/);
  if(hexMatch) return hexToRgb(`#${hexMatch[1]}`);
  const rgbMatch = rgbStrToRgb(value); if(rgbMatch) return rgbMatch;
  const hslMatch = hslStrToRgb(value); if(hslMatch) return hslMatch;
  return null;
}

function audit(){
  const results=[];
  for(const [key,def] of Object.entries(THEME_DEFINITIONS)){
    if(key.startsWith('_')) continue;
    const css=def.css||{};
    const surface=parseColor(css['--surface']) || parseColor(css['--background']) || {r:26,g:26,b:26};
    const text=parseColor(css['--text']);
    const heading=parseColor(css['--heading']||css['--text']);
    const muted=parseColor(css['--text-muted']||css['--text']);
    const primaryBg=parseColor(css['--primary']);
    const onPrimary=parseColor(css['--on-primary']||css['--text']);

    if(!surface || !text){
      results.push({theme:key, status:'warn', note:'missing surface/text'});
      continue;
    }

    const ratios={
      text_vs_surface: contrastRatio(text,surface),
      heading_vs_surface: heading? contrastRatio(heading,surface): null,
      muted_vs_surface: muted? contrastRatio(muted,surface): null,
      onPrimary_vs_primary: (primaryBg && onPrimary)? contrastRatio(onPrimary, primaryBg) : null
    };

    const AA = THEME_DEFINITIONS._a11y?.minContrastAA || 4.5;
    const AAA = THEME_DEFINITIONS._a11y?.minContrastAAA || 7.0;

    results.push({
      theme:key,
      ratios:{
        text:+ratios.text_vs_surface.toFixed(2),
        heading: ratios.heading_vs_surface? +ratios.heading_vs_surface.toFixed(2): null,
        muted: ratios.muted_vs_surface? +ratios.muted_vs_surface.toFixed(2): null,
        onPrimary: ratios.onPrimary_vs_primary? +ratios.onPrimary_vs_primary.toFixed(2): null,
      },
      pass:{
        text_AA: ratios.text_vs_surface>=AA,
        text_AAA: ratios.text_vs_surface>=AAA,
        heading_AA: ratios.heading_vs_surface==null? true : ratios.heading_vs_surface>=AA,
        muted_min: ratios.muted_vs_surface==null? true : ratios.muted_vs_surface>=3.0, // allow 3.0 for metadata
        onPrimary_AA: ratios.onPrimary_vs_primary==null? true : ratios.onPrimary_vs_primary>=AA
      }
    });
  }
  // Pretty print
  console.log('WCAG Contrast Audit (text/heading/muted/onPrimary)');
  const failing=[];
  for(const r of results){
    if(r.status==='warn'){ console.log(`- ${r.theme}: warn (${r.note})`); continue; }
    const p=r.pass;
    const m=r.ratios;
    const line = `- ${r.theme}: text ${m.text} ${p.text_AA?'AA✓':'AA✗'} | heading ${m.heading??'–'} ${p.heading_AA?'AA✓':'AA✗'} | muted ${m.muted??'–'} ${p.muted_min?'ok':'low'} | onPrimary ${m.onPrimary??'–'} ${p.onPrimary_AA?'AA✓':'AA✗'}`;
    if(!p.text_AA || !p.heading_AA || !p.onPrimary_AA) failing.push(r.theme);
    console.log(line);
  }
  if(failing.length){
    console.log(`\nThemes failing key checks: ${failing.join(', ')}`);
    process.exitCode=1;
  }
}

if(require.main===module){ audit(); }
