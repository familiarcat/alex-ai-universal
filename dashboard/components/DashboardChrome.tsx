'use client';

import DevNavigation from '@/components/DevNavigation';
import CommandPalette from '@/components/CommandPalette';
import StatusRibbon from '@/components/StatusRibbon';
import { usePathname } from 'next/navigation';

export default function DashboardChrome() {
  const pathname = usePathname() || '';
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const isProjectPreview = pathname.startsWith('/projects');
  const isAuthPage = pathname.startsWith('/auth');

  // Don't show chrome on auth pages or embedded views
  if (isEmbed || isProjectPreview || isAuthPage) {
    return null;
  }

  return (
    <>
      <DevNavigation />
      <StatusRibbon />
      <CommandPalette />
      {/* spacer for fixed nav height */}
      <div style={{ height: 80 }} />
    </>
  );
}



