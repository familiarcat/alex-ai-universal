'use client';

import DevNavigation from '@/components/DevNavigation';
import CommandPalette from '@/components/CommandPalette';
import StatusRibbon from '@/components/StatusRibbon';
import { usePathname } from 'next/navigation';

export default function DashboardChrome() {
  const pathname = usePathname() || '';
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const isProjectPreview = pathname.startsWith('/projects');

  return (
    <>
      {!isEmbed && !isProjectPreview && <DevNavigation />}
      {!isEmbed && !isProjectPreview && <StatusRibbon />}
      {!isEmbed && !isProjectPreview && <CommandPalette />}
      {/* spacer for fixed nav height */}
      {!isEmbed && !isProjectPreview && <div style={{ height: 80 }} />}
    </>
  );
}



