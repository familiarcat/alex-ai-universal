import { NextResponse } from 'next/server';
import { getDashboardThemeId, getTokensForTheme } from '@/lib/themes';

export async function GET() {
  const id = getDashboardThemeId();
  const tokens = getTokensForTheme(id);
  return NextResponse.json({ theme: id, tokens });
}


