import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import UniversalNavigation from '@/components/UniversalNavigation'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { HealthProvider } from '@/contexts/HealthContext'

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
        <ThemeProvider>
          <ConfigProvider>
            <HealthProvider>
              <div className="min-h-screen theme-background">
                <UniversalNavigation />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
              </div>
            </HealthProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}