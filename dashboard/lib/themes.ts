import fs from 'fs';
import path from 'path';

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

export function getAllDefinitions(): any {
  return loadThemeDefinitions();
}

export function getTokensForTheme(themeId: string): Record<string, string> {
  const defs = loadThemeDefinitions();
  const base = (defs as any)[themeId]?.css || {};
  // support per-theme override files in universal-theme-system/overrides
  const overridePath = path.join(process.cwd(), 'universal-theme-system', 'overrides', `${themeId}.json`);
  let overrideCss: Record<string, string> = {};
  try {
    if (fs.existsSync(overridePath)) {
      const json = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
      overrideCss = json.css || {};
    }
  } catch {}
  return { ...base, ...overrideCss };
}

export function getProjectTheme(project: string): string | undefined {
  try {
    const mapPath = path.resolve(process.cwd(), '..', 'universal-theme-system', 'project-themes.json');
    const json = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    return json[project];
  } catch {
    return undefined;
  }
}

export function getDashboardThemeId(): string {
  // env override, else project-themes.json "dashboard", else default "gradient"
  const env = process.env.DASHBOARD_THEME_ID;
  if (env && env.trim()) return env.trim();
  const id = getProjectTheme('dashboard');
  return id || 'gradient';
}


