'use client';

import DevNavigation from '@/components/DevNavigation';
import CommandPalette from '@/components/CommandPalette';
import StatusRibbon from '@/components/StatusRibbon';
import { usePathname } from 'next/navigation';

export default function DashboardChrome() {
  const pathname = usePathname() || '';
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';

  return (
    <>
      {!isEmbed && <DevNavigation />}
      {!isEmbed && <StatusRibbon />}
      {!isEmbed && <CommandPalette />}
      {/* spacer for fixed nav height */}
      {!isEmbed && <div style={{ height: 80 }} />}
    </>
  );
}



