/**
 * Universal Project Homepage (Server Component)
 * Uses cookies for theme consistency between SSR and client hydration
 * NO suppressHydrationWarning needed - server and client always match!
 */

import { cookies } from 'next/headers';
import Link from 'next/link';
import { getThemeColors, isThemeDark } from '@/lib/theme-colors';
import ClientProjectPage from './client-page';

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UniversalProjectPage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const search = await searchParams;
  
  // 🎨 UNIVERSAL THEME: Read from cookies (same source as client!)
  const cookieStore = await cookies();
  const projectThemeCookie = cookieStore.get(`project-theme-${projectId}`);
  const globalThemeCookie = cookieStore.get('global-theme');
  
  // Query params override for live preview
  const queryTheme = typeof search.theme === 'string' ? search.theme : null;
  
  // Priority: query params > project cookie > global cookie > default
  const themeId = queryTheme || projectThemeCookie?.value || globalThemeCookie?.value || 'mochaEarth';
  
  // Compute theme values SERVER-SIDE (same as client will compute)
  const themeColors = getThemeColors(themeId);
  const isDark = isThemeDark(themeId);
  
  // Pass resolved theme to client component
  // This ensures NO MISMATCH between server and client!
  return (
    <ClientProjectPage
      projectId={projectId}
      initialTheme={{
        themeId,
        colors: themeColors,
        isDark
      }}
      searchParams={search as Record<string, string>}
    />
  );
}

