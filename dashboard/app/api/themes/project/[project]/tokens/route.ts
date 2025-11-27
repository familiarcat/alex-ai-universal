import { NextResponse } from 'next/server';
import { getProjectTheme, getTokensForTheme } from '@/lib/themes';

export async function GET(_req: Request, { params }: { params: Promise<{ project: string }> }) {
  // FIXED: Next.js 16 requires awaiting params
  const { project } = await params;
  if (!project) return NextResponse.json({ error: 'project required' }, { status: 400 });
  const themeId = getProjectTheme(project) || 'gradient';
  const tokens = getTokensForTheme(themeId);
  return NextResponse.json({ project, theme: themeId, tokens });
}


