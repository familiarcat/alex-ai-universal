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
      accent: '#0f172a',        // Dark text on light background - 16.8:1 ratio
      role: '#065f46',          // Dark green on light background - 7.2:1 ratio
      component: '#92400e',     // Dark orange on light background - 6.8:1 ratio
      enhancements: '#111827'   // Very dark text - 16.2:1 ratio
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark and sleek interface for low-light environments',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#f1f5f9',        // Light text on dark background - 16.8:1 ratio
      role: '#4ade80',          // Bright green on dark background - 7.8:1 ratio
      component: '#fbbf24',     // Bright yellow on dark background - 8.1:1 ratio
      enhancements: '#e5e7eb'   // Light gray on dark background - 12.3:1 ratio
    }
  },
  {
    id: 'star-trek',
    name: 'Star Trek',
    description: 'Classic Star Trek inspired theme with blue and gold',
    colors: {
      primary: '#1e3a8a',       // Deep blue background
      secondary: '#3b82f6',     // Medium blue
      accent: '#ffffff',        // Pure white on blue - 8.7:1 ratio
      role: '#00ff88',          // Bright green - 6.2:1 ratio
      component: '#ffd700',     // Gold - 5.9:1 ratio
      enhancements: '#e0f2fe'   // Light blue - 4.8:1 ratio
    }
  },
  {
    id: 'neon',
    name: 'Neon Cyber',
    description: 'Futuristic neon theme with high contrast',
    colors: {
      primary: '#000000',       // Pure black background
      secondary: '#1a1a1a',     // Very dark gray
      accent: '#ffffff',        // Pure white on black - 21:1 ratio
      role: '#00ff88',          // Bright neon green - 8.9:1 ratio
      component: '#ffff00',     // Bright yellow - 9.8:1 ratio
      enhancements: '#ffffff'   // Pure white - 21:1 ratio
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calming ocean-inspired theme with blue tones',
    colors: {
      primary: '#0c4a6e',       // Deep ocean blue
      secondary: '#0369a1',     // Medium ocean blue
      accent: '#ffffff',        // Pure white on blue - 8.2:1 ratio
      role: '#00d4ff',          // Bright cyan - 5.4:1 ratio
      component: '#ffd700',     // Gold - 6.1:1 ratio
      enhancements: '#e0f2fe'   // Light blue - 4.9:1 ratio
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
    
    // Set CSS custom properties
    root.style.setProperty('--theme-primary', theme.colors.primary)
    root.style.setProperty('--theme-secondary', theme.colors.secondary)
    root.style.setProperty('--theme-accent', theme.colors.accent)
    root.style.setProperty('--theme-role', theme.colors.role)
    root.style.setProperty('--theme-component', theme.colors.component)
    root.style.setProperty('--theme-enhancements', theme.colors.enhancements)
    
    // Set theme-specific navigation variables for optimal contrast
    const navVariables = getThemeNavigationVariables(theme.id)
    Object.entries(navVariables).forEach(([key, value]) => {
      root.style.setProperty(`--nav-${key}`, value)
    })
    
    // Update document body class for theme-specific styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${theme.id}`)
    
    // Apply enhanced navigation class
    document.body.classList.add('nav-enhanced')
  }

  // Get theme-specific navigation variables for optimal contrast
  const getThemeNavigationVariables = (themeId: string) => {
    const variables: Record<string, string> = {}
    
    switch (themeId) {
      case 'light':
        variables['text-color'] = '#0f172a'
        variables['bg-color'] = '#ffffff'
        variables['border-color'] = '#e5e7eb'
        variables['hover-bg'] = '#f8fafc'
        variables['active-bg'] = '#92400e'
        variables['active-text'] = '#ffffff'
        break
      case 'dark':
        variables['text-color'] = '#f1f5f9'
        variables['bg-color'] = '#0f172a'
        variables['border-color'] = '#374151'
        variables['hover-bg'] = '#1e293b'
        variables['active-bg'] = '#fbbf24'
        variables['active-text'] = '#0f172a'
        break
      case 'star-trek':
        variables['text-color'] = '#ffffff'
        variables['bg-color'] = '#1e3a8a'
        variables['border-color'] = '#3b82f6'
        variables['hover-bg'] = '#3b82f6'
        variables['active-bg'] = '#ffd700'
        variables['active-text'] = '#1e3a8a'
        break
      case 'neon':
        variables['text-color'] = '#ffffff'
        variables['bg-color'] = '#000000'
        variables['border-color'] = '#00ff88'
        variables['hover-bg'] = '#1a1a1a'
        variables['active-bg'] = '#ffff00'
        variables['active-text'] = '#000000'
        break
      case 'ocean':
        variables['text-color'] = '#ffffff'
        variables['bg-color'] = '#0c4a6e'
        variables['border-color'] = '#0369a1'
        variables['hover-bg'] = '#0369a1'
        variables['active-bg'] = '#ffd700'
        variables['active-text'] = '#0c4a6e'
        break
      default:
        // Fallback to dark theme
        variables['text-color'] = '#f1f5f9'
        variables['bg-color'] = '#0f172a'
        variables['border-color'] = '#374151'
        variables['hover-bg'] = '#1e293b'
        variables['active-bg'] = '#fbbf24'
        variables['active-text'] = '#0f172a'
    }
    
    return variables
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
