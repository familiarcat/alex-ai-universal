import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROJECT_THEMES_PATH = path.join(process.cwd(), '..', 'universal-theme-system', 'project-themes.json');

export async function GET(req: NextRequest, { params }: { params: { project: string } }) {
  try {
    const projectId = params.project;
    const themesJson = JSON.parse(fs.readFileSync(PROJECT_THEMES_PATH, 'utf8'));
    const themeId = themesJson[projectId] || 'gradient';
    
    return NextResponse.json({ projectId, themeId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to get theme' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { project: string } }) {
  try {
    const projectId = params.project;
    const body = await req.json();
    const { themeId } = body;
    
    if (!themeId) {
      return NextResponse.json({ error: 'themeId is required' }, { status: 400 });
    }
    
    // Load current themes
    let themesJson: Record<string, string> = {};
    if (fs.existsSync(PROJECT_THEMES_PATH)) {
      themesJson = JSON.parse(fs.readFileSync(PROJECT_THEMES_PATH, 'utf8'));
    }
    
    // Update theme for this project
    themesJson[projectId] = themeId;
    
    // Save back to file
    fs.writeFileSync(PROJECT_THEMES_PATH, JSON.stringify(themesJson, null, 2));
    
    return NextResponse.json({ success: true, projectId, themeId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update theme' }, { status: 500 });
  }
}

