import { NextResponse } from 'next/server';
import { THEME_DEFINITIONS } from '../../../../../../universal-theme-system/theme-definitions';
import fs from 'fs';
import path from 'path';

function readJson(p: string): any | null {
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: { project: string } }) {
  const projectId = params.project;
  const projectThemesPath = path.join(process.cwd(), 'universal-theme-system', 'project-themes.json');
  const projectThemes = readJson(projectThemesPath) || {};
  const themeId: string = projectThemes[projectId] || 'gradient';

  const baseCss = (THEME_DEFINITIONS as any)[themeId]?.css || {};

  const themeOverridePath = path.join(process.cwd(), 'universal-theme-system', 'overrides', `${themeId}.json`);
  const themeOverride = readJson(themeOverridePath)?.css || {};

  const projectOverridePath = path.join(process.cwd(), 'universal-theme-system', 'project-overrides', `${projectId}.json`);
  const projectOverride = readJson(projectOverridePath)?.css || {};

  const merged = { ...baseCss, ...themeOverride, ...projectOverride };
  return NextResponse.json({ project: projectId, theme: themeId, tokens: merged });
}


