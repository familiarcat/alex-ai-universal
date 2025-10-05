'use client'

import { useState } from 'react'

const availableThemes = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright interface for daytime use',
    colors: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      accent: '#1e293b',
      role: '#1a5a1a',
      component: '#8b4513',
      enhancements: '#374151'
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

export default function Themes() {
  const [currentTheme, setCurrentTheme] = useState(availableThemes[1]) // Default to dark theme
  const [customTheme, setCustomTheme] = useState({
    name: '',
    description: '',
    colors: {
      primary: '#1e293b',
      secondary: '#334155',
      accent: '#f1f5f9',
      role: '#4ade80',
      component: '#fbbf24',
      enhancements: '#e5e7eb'
    }
  })

  const applyTheme = (theme: typeof availableThemes[0]) => {
    setCurrentTheme(theme)
    // In a real application, you would apply the theme globally
    console.log('Applied theme:', theme)
  }

  const saveCustomTheme = () => {
    if (customTheme.name && customTheme.description) {
      // In a real application, you would save this to localStorage or a backend
      console.log('Saved custom theme:', customTheme)
      alert('Custom theme saved! (This is a demo)')
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎨 Theme Manager
        </h1>
        <p className="text-xl text-gray-300">
          Manage and customize themes for the Alex AI Universal platform
        </p>
      </div>

      {/* Current Theme Preview */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Current Theme</h2>
        <div 
          className="rounded-lg p-6 border-2 border-white/20"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: currentTheme.colors.accent }} className="text-xl font-bold">
              {currentTheme.name}
            </h3>
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: currentTheme.colors.accent,
                color: currentTheme.colors.primary
              }}
            >
              Active
            </div>
          </div>
          <p style={{ color: currentTheme.colors.enhancements }} className="mb-4">
            {currentTheme.description}
          </p>
          
          {/* Theme Preview Components */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: currentTheme.colors.secondary, opacity: 0.8 }}
            >
              <div 
                className="text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.role }}
              >
                Role Text
              </div>
              <div style={{ color: currentTheme.colors.role }}>
                Strategic Commander
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: currentTheme.colors.secondary, opacity: 0.8 }}
            >
              <div 
                className="text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.component }}
              >
                Component Text
              </div>
              <div style={{ color: currentTheme.colors.component }}>
                Status Indicator
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: currentTheme.colors.secondary, opacity: 0.8 }}
            >
              <div 
                className="text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.enhancements }}
              >
                Enhancement Text
              </div>
              <div style={{ color: currentTheme.colors.enhancements }}>
                Connection metrics
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Themes */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Available Themes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableThemes.map((theme) => (
            <div
              key={theme.id}
              className={`rounded-lg p-6 border-2 transition-all duration-300 cursor-pointer ${
                currentTheme.id === theme.id
                  ? 'border-blue-400 bg-blue-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
              onClick={() => applyTheme(theme)}
            >
              <div 
                className="h-20 rounded mb-4 border"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
                }}
              ></div>
              
              <h3 className="text-lg font-bold text-white mb-2">{theme.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{theme.description}</p>
              
              <div className="flex space-x-1 mb-4">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Primary"
                ></div>
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: theme.colors.secondary }}
                  title="Secondary"
                ></div>
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent"
                ></div>
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: theme.colors.role }}
                  title="Role"
                ></div>
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: theme.colors.component }}
                  title="Component"
                ></div>
              </div>
              
              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  currentTheme.id === theme.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  applyTheme(theme)
                }}
              >
                {currentTheme.id === theme.id ? 'Active' : 'Apply Theme'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Theme Creator */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Custom Theme Creator</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Theme Name</label>
                <input
                  type="text"
                  value={customTheme.name}
                  onChange={(e) => setCustomTheme({...customTheme, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter theme name"
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={customTheme.description}
                  onChange={(e) => setCustomTheme({...customTheme, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  rows={3}
                  placeholder="Enter theme description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customTheme.colors.primary}
                      onChange={(e) => setCustomTheme({
                        ...customTheme, 
                        colors: {...customTheme.colors, primary: e.target.value}
                      })}
                      className="w-10 h-10 rounded border border-white/20"
                    />
                    <input
                      type="text"
                      value={customTheme.colors.primary}
                      onChange={(e) => setCustomTheme({
                        ...customTheme, 
                        colors: {...customTheme.colors, primary: e.target.value}
                      })}
                      className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customTheme.colors.secondary}
                      onChange={(e) => setCustomTheme({
                        ...customTheme, 
                        colors: {...customTheme.colors, secondary: e.target.value}
                      })}
                      className="w-10 h-10 rounded border border-white/20"
                    />
                    <input
                      type="text"
                      value={customTheme.colors.secondary}
                      onChange={(e) => setCustomTheme({
                        ...customTheme, 
                        colors: {...customTheme.colors, secondary: e.target.value}
                      })}
                      className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={saveCustomTheme}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
              >
                Save Custom Theme
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
            <div 
              className="rounded-lg p-6 border-2 border-white/20"
              style={{
                background: `linear-gradient(135deg, ${customTheme.colors.primary} 0%, ${customTheme.colors.secondary} 100%)`
              }}
            >
              <h4 
                className="text-lg font-bold mb-2"
                style={{ color: customTheme.colors.accent }}
              >
                {customTheme.name || 'Custom Theme'}
              </h4>
              <p 
                className="text-sm mb-4"
                style={{ color: customTheme.colors.enhancements }}
              >
                {customTheme.description || 'Custom theme description'}
              </p>
              
              <div className="space-y-2">
                <div 
                  className="p-2 rounded text-sm"
                  style={{ 
                    backgroundColor: customTheme.colors.secondary, 
                    opacity: 0.8,
                    color: customTheme.colors.role
                  }}
                >
                  Role Text Example
                </div>
                <div 
                  className="p-2 rounded text-sm"
                  style={{ 
                    backgroundColor: customTheme.colors.secondary, 
                    opacity: 0.8,
                    color: customTheme.colors.component
                  }}
                >
                  Component Text Example
                </div>
                <div 
                  className="p-2 rounded text-sm"
                  style={{ 
                    backgroundColor: customTheme.colors.secondary, 
                    opacity: 0.8,
                    color: customTheme.colors.enhancements
                  }}
                >
                  Enhancement Text Example
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
