'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import HoverTooltip from './HoverTooltip'
import { hoverDescriptions } from '@/data/hoverDescriptions'

export default function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themeIcons: Record<string, string> = {
    'light': '☀️',
    'dark': '🌙',
    'star-trek': '🖖',
    'neon': '⚡',
    'ocean': '🌊'
  }

  return (
    <div className="relative">
      <HoverTooltip
        title={hoverDescriptions['theme-manager'].title}
        description={hoverDescriptions['theme-manager'].description}
        status={hoverDescriptions['theme-manager'].status}
        implementationLevel={hoverDescriptions['theme-manager'].implementationLevel}
        requirements={hoverDescriptions['theme-manager'].requirements}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 border-2"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--nav-text-color)',
            borderColor: 'var(--nav-border-color)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)'
            e.currentTarget.style.borderColor = 'var(--nav-text-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'var(--nav-border-color)'
          }}
        >
          <span className="text-lg">{themeIcons[currentTheme.id]}</span>
          <span className="text-sm font-medium" style={{ color: 'var(--nav-text-color)' }}>
            {currentTheme.name}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--nav-text-color)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </HoverTooltip>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-64 backdrop-blur-md rounded-lg shadow-2xl z-50 border-2"
          style={{
            backgroundColor: 'var(--nav-bg-color)',
            borderColor: 'var(--nav-border-color)'
          }}
        >
          <div className="p-4">
            <h3 
              className="text-sm font-bold mb-3"
              style={{ color: 'var(--nav-text-color)' }}
            >
              Choose Theme
            </h3>
            <div className="space-y-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 border"
                  style={{
                    backgroundColor: currentTheme.id === theme.id 
                      ? 'var(--nav-active-bg)' 
                      : 'transparent',
                    color: currentTheme.id === theme.id 
                      ? 'var(--nav-active-text)' 
                      : 'var(--nav-text-color)',
                    borderColor: currentTheme.id === theme.id 
                      ? 'var(--nav-active-bg)' 
                      : 'var(--nav-border-color)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentTheme.id !== theme.id) {
                      e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)'
                      e.currentTarget.style.borderColor = 'var(--nav-text-color)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTheme.id !== theme.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'var(--nav-border-color)'
                    }
                  }}
                >
                  <span className="text-lg">{themeIcons[theme.id]}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{theme.name}</div>
                    <div 
                      className="text-xs"
                      style={{ 
                        opacity: 0.75,
                        color: 'var(--nav-text-color)'
                      }}
                    >
                      {theme.description}
                    </div>
                  </div>
                  {currentTheme.id === theme.id && (
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      style={{ color: 'var(--nav-active-text)' }}
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
