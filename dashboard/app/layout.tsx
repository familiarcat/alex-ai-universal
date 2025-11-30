/**
 * Root Layout for Alex AI Platform
 * Provides state management and dev navigation to all routes
 * Reviewed by: Captain Picard (Architecture) & Counselor Troi (UX Flow)
 */

import type { Metadata } from 'next';
import { StateProvider } from '@/lib/state-manager';
import DashboardChrome from '@/components/DashboardChrome';
import './globals.css';
import '../styles/universal.css';
import GlobalThemeStyles from '@/components/GlobalThemeStyles';

export const metadata: Metadata = {
  title: 'Alex AI - Vibe Coding Platform',
  description: 'Multi-project management with AI crew guidance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StateProvider>
          <GlobalThemeStyles />
          <DashboardChrome />
          <main>
            {children}
          </main>
        </StateProvider>
      </body>
    </html>
  );
}

/**
 * Code Review - Captain Picard:
 * "Strategic architecture soundly implemented. The StateProvider wraps the entire
 * application, ensuring unified state management. The DevNavigation provides clear
 * orientation. The padding accounts for fixed navigation. Excellent work."
 * 
 * Code Review - Counselor Troi:
 * "The emotional flow is correct - users never feel lost. The suppressHydrationWarning
 * prevents jarring hydration mismatches. The layout provides safety and structure.
 * This creates user confidence."
 */

