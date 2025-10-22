import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Resolve THEME_DEFINITIONS from repo root without relying on TS path aliases
function loadThemeDefinitions(): any {
  try {
    const defsPath = path.resolve(process.cwd(), '..', 'universal-theme-system', 'theme-definitions.js');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(defsPath);
    return mod?.THEME_DEFINITIONS || {};
  } catch {
    return {};
  }
}

const THEME_DEFINITIONS: any = loadThemeDefinitions();

export async function GET(_req: Request, { params }: { params: { theme: string } }) {
  const themeId = params?.theme || 'gradient';
  const base = (THEME_DEFINITIONS as any)[themeId]?.css || {};

  // Load override if present
  const overridePath = path.join(process.cwd(), 'universal-theme-system', 'overrides', `${themeId}.json`);
  let overrideCss: Record<string, string> = {};
  try {
    if (fs.existsSync(overridePath)) {
      const json = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
      overrideCss = json.css || {};
    }
  } catch {}

  const merged = { ...base, ...overrideCss };
  return NextResponse.json({ theme: themeId, tokens: merged });
}


