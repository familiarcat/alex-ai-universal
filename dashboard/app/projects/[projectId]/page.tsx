/**
 * Universal Project Homepage (Server Component)
 * Proper DDD: Server => n8n => Supabase (single source of truth!)
 * NO cookies needed - Supabase has the data!
 */

import { getServerProject, getDefaultTheme } from '@/lib/theme-server-supabase';
import { getThemeColors, isThemeDark } from '@/lib/theme-colors';
import ClientProjectPage from './client-page';

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UniversalProjectPage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const search = await searchParams;
  
  // 🎯 PROPER DDD: Fetch from Supabase via n8n (single source of truth)
  const projectData = await getServerProject(projectId);
  
  // Query params override for live preview
  const queryTheme = typeof search.theme === 'string' ? search.theme : null;
  
  let theme;
  if (queryTheme) {
    // Live preview: use query param theme
    theme = {
      themeId: queryTheme,
      colors: getThemeColors(queryTheme),
      isDark: isThemeDark(queryTheme)
    };
  } else if (projectData) {
    // Use theme from Supabase
    theme = projectData.theme;
  } else {
    // Fallback for new/not-yet-synced projects
    theme = getDefaultTheme();
  }
  
  // Pass server-resolved theme to client
  // Server and client both use Supabase as source of truth!
  return (
    <ClientProjectPage
      projectId={projectId}
      initialTheme={theme}
      initialContent={projectData?.content || null}
      searchParams={search as Record<string, string>}
    />
  );
}

