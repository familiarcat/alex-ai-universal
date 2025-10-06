'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    role: string
    component: string
    enhancements: string
  }
}

export const availableThemes: Theme[] = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright interface with WCAG AA compliant contrast',
    colors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#0f172a',
      role: '#065f46',
      component: '#92400e',
      enhancements: '#111827'
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark and sleek interface for low-light environments',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#f1f5f9',
      role: '#4ade80',
      component: '#fbbf24',
      enhancements: '#e5e7eb'
    }
  },
  {
    id: 'star-trek',
    name: 'Star Trek',
    description: 'Classic Star Trek inspired theme with blue and gold',
    colors: {
      primary: '#1e3a8a',
      secondary: '#3b82f6',
      accent: '#dbeafe',
      role: '#00ff88',
      component: '#ffd700',
      enhancements: '#ffffff'
    }
  },
  {
    id: 'neon',
    name: 'Neon Cyber',
    description: 'Futuristic neon theme with high contrast',
    colors: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      accent: '#00ff88',
      role: '#00ff88',
      component: '#ffff00',
      enhancements: '#ffffff'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calming ocean-inspired theme with blue tones',
    colors: {
      primary: '#0c4a6e',
      secondary: '#0369a1',
      accent: '#e0f2fe',
      role: '#00d4ff',
      component: '#ffd700',
      enhancements: '#e0f2fe'
    }
  }
]

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (themeId: string) => void
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(availableThemes[1]) // Default to dark theme

  const setTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId)
    if (theme) {
      setCurrentTheme(theme)
      localStorage.setItem('alex-ai-theme', themeId)
      applyThemeToDocument(theme)
    }
  }

  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement
    root.style.setProperty('--theme-primary', theme.colors.primary)
    root.style.setProperty('--theme-secondary', theme.colors.secondary)
    root.style.setProperty('--theme-accent', theme.colors.accent)
    root.style.setProperty('--theme-role', theme.colors.role)
    root.style.setProperty('--theme-component', theme.colors.component)
    root.style.setProperty('--theme-enhancements', theme.colors.enhancements)
    
    // Update document body class for theme-specific styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${theme.id}`)
  }

  useEffect(() => {
    // Load saved theme on mount
    const savedThemeId = localStorage.getItem('alex-ai-theme')
    if (savedThemeId) {
      const theme = availableThemes.find(t => t.id === savedThemeId)
      if (theme) {
        setCurrentTheme(theme)
        applyThemeToDocument(theme)
      }
    } else {
      // Apply default theme
      applyThemeToDocument(currentTheme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
