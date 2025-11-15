import { NextResponse } from 'next/server';
import { getProjectTheme, getTokensForTheme } from '@/lib/themes';

export async function GET(_req: Request, { params }: { params: { project: string } }) {
  const project = params?.project;
  if (!project) return NextResponse.json({ error: 'project required' }, { status: 400 });
  const themeId = getProjectTheme(project) || 'gradient';
  const tokens = getTokensForTheme(themeId);
  return NextResponse.json({ project, theme: themeId, tokens });
}


