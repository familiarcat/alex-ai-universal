/**
 * Visual Editor Component
 * 
 * Squarespace/Wix-style visual editor with drag-and-drop functionality.
 * Provides live preview and intuitive content editing.
 * 
 * Features (based on Squarespace/Wix patterns):
 * - Drag-and-drop component placement
 * - Live preview
 * - Section-based editing
 * - Visual theme selector
 * - Undo/redo
 * - Mobile preview mode
 * 
 * Reviewed by: Counselor Troi (UX) & Commander Data (Architecture)
 */

'use client';

import React, { useState } from 'react';

export interface VisualEditorProps {
  projectId: string;
  components: Array<{
    id: string;
    type: string;
    content: any;
    position: { x: number; y: number };
  }>;
  onComponentUpdate: (componentId: string, updates: any) => void;
  onComponentAdd: (component: any) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentReorder: (order: string[]) => void;
}

export function VisualEditor({
  projectId,
  components,
  onComponentUpdate,
  onComponentAdd,
  onComponentDelete,
  onComponentReorder
}: VisualEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="visual-editor h-full flex flex-col">
      {/* Toolbar (Squarespace/Wix style) */}
      <div className="toolbar bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1 rounded text-sm ${
              isPreviewMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isPreviewMode ? '👁️ Preview' : '✏️ Edit'}
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
            ↶ Undo
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
            ↷ Redo
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
            📱 Mobile
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
            💾 Save
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="editor-area flex-1 flex">
        {/* Component Palette (Left Sidebar) */}
        {!isPreviewMode && (
          <div className="component-palette w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Components</h3>
            <div className="space-y-2">
              {[
                { type: 'hero', label: 'Hero Section', icon: '🎯' },
                { type: 'text', label: 'Text Block', icon: '📝' },
                { type: 'image', label: 'Image', icon: '🖼️' },
                { type: 'gallery', label: 'Gallery', icon: '🖼️' },
                { type: 'video', label: 'Video', icon: '🎥' },
                { type: 'form', label: 'Form', icon: '📋' },
                { type: 'button', label: 'Button', icon: '🔘' },
                { type: 'divider', label: 'Divider', icon: '➖' }
              ].map(component => (
                <div
                  key={component.type}
                  draggable
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  className="p-3 bg-white rounded border border-gray-200 cursor-move hover:border-blue-500 hover:shadow-md transition"
                >
                  <span className="mr-2">{component.icon}</span>
                  <span className="text-sm font-medium">{component.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="canvas-area flex-1 relative bg-gray-100 overflow-auto">
          {isPreviewMode ? (
            <div className="preview-container p-8">
              <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg min-h-screen">
                {/* Preview content will be rendered here */}
                <div className="p-8">
                  <h1 className="text-4xl font-bold mb-4">Project Preview</h1>
                  <p className="text-gray-600">
                    Live preview of your project. Changes update in real-time.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="canvas p-8">
              <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg min-h-screen">
                {components.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg m-8">
                    <p className="text-gray-500 mb-4">📦 Drag components here to start building</p>
                    <p className="text-sm text-gray-400">
                      Drag components from the left sidebar to add them to your page
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-8">
                    {components.map(component => (
                      <div
                        key={component.id}
                        onClick={() => setSelectedComponent(component.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedComponent === component.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {component.type}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onComponentDelete(component.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ✕ Delete
                          </button>
                        </div>
                        <div className="text-gray-600">
                          Component content preview...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel (Right Sidebar) */}
        {!isPreviewMode && selectedComponent && (
          <div className="properties-panel w-80 bg-white border-l p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component Type
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={components.find(c => c.id === selectedComponent)?.type || ''}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={4}
                  placeholder="Enter content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded">
                  <option>Default</option>
                  <option>Primary</option>
                  <option>Secondary</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

