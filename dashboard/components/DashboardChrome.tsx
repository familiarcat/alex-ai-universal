'use client';

import DevNavigation from '@/components/DevNavigation';
import CommandPalette from '@/components/CommandPalette';
import StatusRibbon from '@/components/StatusRibbon';
import { usePathname } from 'next/navigation';

export default function DashboardChrome() {
  const pathname = usePathname() || '';
  const isProjectRoute = pathname.startsWith('/projects/');

  if (isProjectRoute) return null;

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


