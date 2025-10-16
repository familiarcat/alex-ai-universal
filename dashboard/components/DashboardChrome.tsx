'use client';

import DevNavigation from '@/components/DevNavigation';
import CommandPalette from '@/components/CommandPalette';
import StatusRibbon from '@/components/StatusRibbon';
import { usePathname } from 'next/navigation';

export default function DashboardChrome() {
  const pathname = usePathname() || '';
  // Always render navigation and ribbons across routes (including project pages)

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



