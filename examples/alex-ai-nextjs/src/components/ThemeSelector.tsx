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
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <span className="text-lg">{themeIcons[currentTheme.id]}</span>
          <span className="text-sm font-medium text-white">{currentTheme.name}</span>
          <svg
            className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </HoverTooltip>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl z-50">
          <div className="p-4">
            <h3 className="text-sm font-bold text-white mb-3">Choose Theme</h3>
            <div className="space-y-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentTheme.id === theme.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{themeIcons[theme.id]}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{theme.name}</div>
                    <div className="text-xs opacity-75">{theme.description}</div>
                  </div>
                  {currentTheme.id === theme.id && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
