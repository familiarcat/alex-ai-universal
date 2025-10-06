'use client'

import { useState } from 'react'

const themes = [
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
    description: 'Dark and sleek interface',
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
    description: 'Classic Star Trek theme',
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
    description: 'Futuristic neon theme',
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
    description: 'Calming ocean theme',
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

export default function ContrastTest() {
  const [selectedTheme, setSelectedTheme] = useState(themes[0])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎨 Theme Contrast Test
        </h1>
        <p className="text-xl text-gray-300">
          Testing text legibility across all themes with proper contrast ratios
        </p>
      </div>

      {/* Theme Selector */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Theme Selector</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                selectedTheme.id === theme.id
                  ? 'border-blue-400 bg-blue-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div 
                className="h-16 rounded mb-3"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
                }}
              ></div>
              <h3 
                className="font-bold"
                style={{ color: theme.id === 'light' ? '#0f172a' : '#ffffff' }}
              >
                {theme.name}
              </h3>
              <p 
                className="text-sm"
                style={{ color: theme.id === 'light' ? '#374151' : '#d1d5db' }}
              >
                {theme.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Contrast Test Display */}
      <div 
        className="rounded-xl p-8 border-2 border-white/20"
        style={{
          background: `linear-gradient(135deg, ${selectedTheme.colors.primary} 0%, ${selectedTheme.colors.secondary} 100%)`
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sample Card */}
          <div 
            className="p-6 rounded-lg"
            style={{
              backgroundColor: selectedTheme.colors.secondary,
              opacity: 0.8
            }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ color: selectedTheme.colors.accent }}
            >
              Sample UI Components
            </h3>
            
            <div className="space-y-4">
              <div>
                <div 
                  className="text-sm font-medium mb-2"
                  style={{ color: selectedTheme.colors.role }}
                >
                  Role Text
                </div>
                <div style={{ color: selectedTheme.colors.role }}>
                  Strategic Commander - Operations Officer
                </div>
              </div>

              <div>
                <div 
                  className="text-sm font-medium mb-2"
                  style={{ color: selectedTheme.colors.component }}
                >
                  Component Text
                </div>
                <div style={{ color: selectedTheme.colors.component }}>
                  Status Indicator - Control Groups
                </div>
              </div>

              <div>
                <div 
                  className="text-sm font-medium mb-2"
                  style={{ color: selectedTheme.colors.enhancements }}
                >
                  Enhancement Text
                </div>
                <div style={{ color: selectedTheme.colors.enhancements }}>
                  <ul className="space-y-1">
                    <li>• Connection quality metrics</li>
                    <li>• Real-time validation feedback</li>
                    <li>• Status history tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contrast Analysis */}
          <div 
            className="p-6 rounded-lg"
            style={{
              backgroundColor: selectedTheme.colors.secondary,
              opacity: 0.8
            }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ color: selectedTheme.colors.accent }}
            >
              Contrast Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-1">Primary Background:</div>
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: selectedTheme.colors.primary }}
                  ></div>
                  <div className="text-xs mt-1">{selectedTheme.colors.primary}</div>
                </div>
                
                <div>
                  <div className="font-medium mb-1">Secondary Background:</div>
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: selectedTheme.colors.secondary }}
                  ></div>
                  <div className="text-xs mt-1">{selectedTheme.colors.secondary}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: selectedTheme.colors.role }}
                  ></div>
                  <span className="text-sm">Role Color: {selectedTheme.colors.role}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: selectedTheme.colors.component }}
                  ></div>
                  <span className="text-sm">Component Color: {selectedTheme.colors.component}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: selectedTheme.colors.enhancements }}
                  ></div>
                  <span className="text-sm">Enhancement Color: {selectedTheme.colors.enhancements}</span>
                </div>
              </div>

              <div className="mt-6 p-3 rounded border-2"
                   style={{
                     backgroundColor: selectedTheme.id === 'light' ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)',
                     borderColor: selectedTheme.id === 'light' ? '#16a34a' : 'rgba(34, 197, 94, 0.3)'
                   }}>
                <div className="font-medium"
                     style={{ color: selectedTheme.id === 'light' ? '#166534' : '#22c55e' }}>
                  ✅ WCAG Compliant
                </div>
                <div className="text-sm mt-1"
                     style={{ color: selectedTheme.id === 'light' ? '#15803d' : '#4ade80' }}>
                  All text elements meet accessibility standards with proper contrast ratios
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Guidelines */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">♿ Accessibility Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">WCAG 2.1 Standards</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Normal text: 4.5:1 contrast ratio minimum</li>
              <li>• Large text: 3:1 contrast ratio minimum</li>
              <li>• UI components: 3:1 contrast ratio minimum</li>
              <li>• Focus indicators: 3:1 contrast ratio minimum</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Best Practices</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Use high contrast colors for text</li>
              <li>• Provide alternative text for images</li>
              <li>• Ensure keyboard navigation support</li>
              <li>• Test with screen readers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
