import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import UniversalNavigation from '@/components/UniversalNavigation'
import GlobalNavigationSystem from '@/components/GlobalNavigationSystem'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { HealthProvider } from '@/contexts/HealthContext'
import { AgenticProvider } from '@/contexts/AgenticContext'
import { N8NProvider } from '@/contexts/N8NContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alex AI Universal - Next.js 15',
  description: 'Advanced AI-powered development platform with crew integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalNavigationSystem>
          <ThemeProvider>
            <ConfigProvider>
              <HealthProvider>
                <AgenticProvider>
                  <N8NProvider>
                    <div className="min-h-screen theme-background">
                      <UniversalNavigation />
                      <main className="container mx-auto px-4 py-8">
                        {children}
                      </main>
                    </div>
                  </N8NProvider>
                </AgenticProvider>
              </HealthProvider>
            </ConfigProvider>
          </ThemeProvider>
        </GlobalNavigationSystem>
      </body>
    </html>
  )
}