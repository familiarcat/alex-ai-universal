import { NextResponse } from 'next/server';
import { THEME_DEFINITIONS } from '@/../../universal-theme-system/theme-definitions';
import fs from 'fs';
import path from 'path';

export async function GET(_req: Request, { params }: { params: { theme: string } }) {
  const themeId = params.theme || 'gradient';
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


