'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import HoverTooltip from '@/components/HoverTooltip'
import { hoverDescriptions } from '@/data/hoverDescriptions'

interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  role: string
  component: string
  enhancements: string
}

interface CustomTheme {
  id: string
  name: string
  description: string
  colors: ColorPalette
  isCustom: boolean
}

export default function ThemeCustomization() {
  const { currentTheme, setTheme, availableThemes } = useTheme()
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColorKey, setSelectedColorKey] = useState<keyof ColorPalette | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const allThemes = [...availableThemes, ...customThemes]

  const handleCreateCustomTheme = () => {
    const newTheme: CustomTheme = {
      id: `custom_${Date.now()}`,
      name: 'Custom Theme',
      description: 'A custom theme created by the user',
      colors: {
        primary: '#1e293b',
        secondary: '#334155',
        accent: '#f1f5f9',
        role: '#4ade80',
        component: '#fbbf24',
        enhancements: '#e5e7eb'
      },
      isCustom: true
    }
    setCustomThemes([...customThemes, newTheme])
    setEditingTheme(newTheme)
  }

  const handleEditTheme = (theme: CustomTheme) => {
    setEditingTheme(theme)
  }

  const handleColorChange = (colorKey: keyof ColorPalette, color: string) => {
    if (editingTheme) {
      const updatedTheme = {
        ...editingTheme,
        colors: {
          ...editingTheme.colors,
          [colorKey]: color
        }
      }
      setEditingTheme(updatedTheme)
      
      // Update in custom themes array
      setCustomThemes(customThemes.map(t => 
        t.id === editingTheme.id ? updatedTheme : t
      ))
    }
  }

  const handleSaveTheme = () => {
    if (editingTheme) {
      setCustomThemes(customThemes.map(t => 
        t.id === editingTheme.id ? editingTheme : t
      ))
      setEditingTheme(null)
    }
  }

  const handleDeleteTheme = (themeId: string) => {
    setCustomThemes(customThemes.filter(t => t.id !== themeId))
    if (editingTheme?.id === themeId) {
      setEditingTheme(null)
    }
  }

  const applyTheme = (theme: any) => {
    setTheme(theme.id)
  }

  const colorKeys: (keyof ColorPalette)[] = ['primary', 'secondary', 'accent', 'role', 'component', 'enhancements']
  const colorLabels: Record<keyof ColorPalette, string> = {
    primary: 'Primary Background',
    secondary: 'Secondary Background',
    accent: 'Accent Text',
    role: 'Role Indicators',
    component: 'Component Highlights',
    enhancements: 'Enhancement Elements'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎨 Theme Customization Studio
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create, customize, and manage themes for the Alex AI Universal system.
            Design unique visual experiences with our advanced theme customization tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Theme Library */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Theme Library</h2>
                <HoverTooltip
                  title={hoverDescriptions['create-theme'].title}
                  description={hoverDescriptions['create-theme'].description}
                  status={hoverDescriptions['create-theme'].status}
                  implementationLevel={hoverDescriptions['create-theme'].implementationLevel}
                  requirements={hoverDescriptions['create-theme'].requirements}
                >
                  <button
                    onClick={handleCreateCustomTheme}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    ➕ Create
                  </button>
                </HoverTooltip>
              </div>

              <div className="space-y-4">
                {allThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      currentTheme.id === theme.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => applyTheme(theme)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{theme.name}</h3>
                        <p className="text-sm text-gray-300">{theme.description}</p>
                        {theme.isCustom && (
                          <span className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded-full mt-1">
                            Custom
                          </span>
                        )}
                      </div>
                      {theme.isCustom && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTheme(theme)
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTheme(theme.id)
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Editor */}
          <div className="lg:col-span-2">
            {editingTheme ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Theme Editor</h2>
                    <p className="text-gray-300">Customize colors and properties for your theme</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        previewMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {previewMode ? '👁️ Exit Preview' : '👁️ Preview'}
                    </button>
                    <button
                      onClick={handleSaveTheme}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    >
                      💾 Save
                    </button>
                  </div>
                </div>

                {/* Theme Properties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Theme Name</label>
                    <input
                      type="text"
                      value={editingTheme.name}
                      onChange={(e) => setEditingTheme({
                        ...editingTheme,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Enter theme name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <input
                      type="text"
                      value={editingTheme.description}
                      onChange={(e) => setEditingTheme({
                        ...editingTheme,
                        description: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Enter theme description"
                    />
                  </div>
                </div>

                {/* Color Palette */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Color Palette</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colorKeys.map((colorKey) => (
                      <div key={colorKey} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <label className="block text-white font-medium mb-2">
                          {colorLabels[colorKey]}
                        </label>
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer"
                            style={{ backgroundColor: editingTheme.colors[colorKey] }}
                            onClick={() => {
                              setSelectedColorKey(colorKey)
                              setShowColorPicker(true)
                            }}
                          />
                          <input
                            type="text"
                            value={editingTheme.colors[colorKey]}
                            onChange={(e) => handleColorChange(colorKey, e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-white mb-4">Theme Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="p-4 rounded-lg border-2"
                      style={{
                        backgroundColor: editingTheme.colors.primary,
                        borderColor: editingTheme.colors.secondary
                      }}
                    >
                      <h4 style={{ color: editingTheme.colors.accent }}>Sample Text</h4>
                      <p style={{ color: editingTheme.colors.accent }}>This is how your theme will look</p>
                      <div className="mt-2">
                        <span
                          className="inline-block px-2 py-1 rounded text-sm"
                          style={{
                            backgroundColor: editingTheme.colors.role,
                            color: editingTheme.colors.primary
                          }}
                        >
                          Role Indicator
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div
                        className="h-4 rounded"
                        style={{ backgroundColor: editingTheme.colors.primary }}
                      />
                      <div
                        className="h-4 rounded"
                        style={{ backgroundColor: editingTheme.colors.secondary }}
                      />
                      <div
                        className="h-4 rounded"
                        style={{ backgroundColor: editingTheme.colors.component }}
                      />
                      <div
                        className="h-4 rounded"
                        style={{ backgroundColor: editingTheme.colors.enhancements }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold text-white mb-4">Select a Theme to Edit</h2>
                <p className="text-gray-300 mb-6">
                  Choose a custom theme from the library to start editing, or create a new one to begin your design journey.
                </p>
                <HoverTooltip
                  title={hoverDescriptions['create-theme'].title}
                  description={hoverDescriptions['create-theme'].description}
                  status={hoverDescriptions['create-theme'].status}
                  implementationLevel={hoverDescriptions['create-theme'].implementationLevel}
                  requirements={hoverDescriptions['create-theme'].requirements}
                >
                  <button
                    onClick={handleCreateCustomTheme}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    ➕ Create New Theme
                  </button>
                </HoverTooltip>
              </div>
            )}
          </div>
        </div>

        {/* Theme Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Theme Management Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <HoverTooltip
              title={hoverDescriptions['export-theme'].title}
              description={hoverDescriptions['export-theme'].description}
              status={hoverDescriptions['export-theme'].status}
              implementationLevel={hoverDescriptions['export-theme'].implementationLevel}
              requirements={hoverDescriptions['export-theme'].requirements}
            >
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                📤 Export Theme
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['import-theme'].title}
              description={hoverDescriptions['import-theme'].description}
              status={hoverDescriptions['import-theme'].status}
              implementationLevel={hoverDescriptions['import-theme'].implementationLevel}
              requirements={hoverDescriptions['import-theme'].requirements}
            >
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                📥 Import Theme
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['theme-gallery'].title}
              description={hoverDescriptions['theme-gallery'].description}
              status={hoverDescriptions['theme-gallery'].status}
              implementationLevel={hoverDescriptions['theme-gallery'].implementationLevel}
              requirements={hoverDescriptions['theme-gallery'].requirements}
            >
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                🖼️ Theme Gallery
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['reset-defaults'].title}
              description={hoverDescriptions['reset-defaults'].description}
              status={hoverDescriptions['reset-defaults'].status}
              implementationLevel={hoverDescriptions['reset-defaults'].implementationLevel}
              requirements={hoverDescriptions['reset-defaults'].requirements}
            >
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                🔄 Reset Defaults
              </button>
            </HoverTooltip>
          </div>
        </div>
      </div>
    </div>
  )
}


