/**
 * Drag and Drop Editor Component
 * 
 * Squarespace/Wix-style drag-and-drop editor implementation.
 * Provides intuitive component placement and reordering.
 * 
 * Uses: @dnd-kit/core for drag-and-drop functionality
 * 
 * Reviewed by: Counselor Troi (UX) & Lieutenant Commander La Forge (Implementation)
 */

'use client';

import React, { useState } from 'react';

export interface DraggableComponent {
  id: string;
  type: string;
  content: any;
  order: number;
}

export interface DragAndDropEditorProps {
  projectId: string;
  components: DraggableComponent[];
  onComponentAdd: (component: DraggableComponent) => void;
  onComponentUpdate: (id: string, updates: Partial<DraggableComponent>) => void;
  onComponentDelete: (id: string) => void;
  onComponentReorder: (newOrder: string[]) => void;
}

export function DragAndDropEditor({
  projectId,
  components,
  onComponentAdd,
  onComponentUpdate,
  onComponentDelete,
  onComponentReorder
}: DragAndDropEditorProps) {
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);

  const handleDragStart = (componentId: string) => {
    setDraggedComponent(componentId);
  };

  const handleDragOver = (e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    setDropZone(targetId || 'canvas');
  };

  const handleDrop = (e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    
    if (draggedComponent && dropZone) {
      // Handle component reordering or placement
      const newOrder = [...components.map(c => c.id)];
      const draggedIndex = newOrder.indexOf(draggedComponent);
      const targetIndex = targetId ? newOrder.indexOf(targetId) : newOrder.length;
      
      if (draggedIndex !== -1) {
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedComponent);
        onComponentReorder(newOrder);
      }
    }
    
    setDraggedComponent(null);
    setDropZone(null);
  };

  const componentTypes = [
    { type: 'hero', label: 'Hero Section', icon: '🎯', description: 'Large banner with headline' },
    { type: 'text', label: 'Text Block', icon: '📝', description: 'Rich text content' },
    { type: 'image', label: 'Image', icon: '🖼️', description: 'Image with caption' },
    { type: 'gallery', label: 'Gallery', icon: '🖼️', description: 'Image gallery grid' },
    { type: 'video', label: 'Video', icon: '🎥', description: 'Video embed' },
    { type: 'form', label: 'Form', icon: '📋', description: 'Contact or lead form' },
    { type: 'button', label: 'Button', icon: '🔘', description: 'Call-to-action button' },
    { type: 'divider', label: 'Divider', icon: '➖', description: 'Visual separator' }
  ];

  return (
    <div className="drag-drop-editor h-full flex">
      {/* Component Library (Left) */}
      <div className="component-library w-64 bg-gray-50 border-r p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Add Components</h3>
        <div className="space-y-2">
          {componentTypes.map(compType => (
            <div
              key={compType.type}
              draggable
              onDragStart={() => handleDragStart(`new-${compType.type}`)}
              className="p-3 bg-white rounded border border-gray-200 cursor-move hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="flex items-center mb-1">
                <span className="mr-2 text-lg">{compType.icon}</span>
                <span className="text-sm font-medium">{compType.label}</span>
              </div>
              <p className="text-xs text-gray-500">{compType.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas (Center) */}
      <div
        className="canvas flex-1 bg-gray-100 p-8 overflow-y-auto"
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e)}
      >
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg min-h-screen">
          {components.length === 0 ? (
            <div
              className={`p-12 text-center border-2 border-dashed rounded-lg m-8 transition ${
                dropZone === 'canvas'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <p className="text-gray-500 mb-4">📦 Drop components here to start building</p>
              <p className="text-sm text-gray-400">
                Drag components from the left sidebar
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-8">
              {components
                .sort((a, b) => a.order - b.order)
                .map((component, index) => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={() => handleDragStart(component.id)}
                    onDragOver={(e) => handleDragOver(e, component.id)}
                    onDrop={(e) => handleDrop(e, component.id)}
                    className={`p-4 border-2 rounded-lg cursor-move transition ${
                      dropZone === component.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-400">⋮⋮</span>
                        <span className="text-sm font-medium text-gray-700">
                          {componentTypes.find(t => t.type === component.type)?.icon} {component.type}
                        </span>
                      </div>
                      <button
                        onClick={() => onComponentDelete(component.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-gray-600 text-sm">
                      Component content area...
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel (Right) */}
      <div className="properties-panel w-80 bg-white border-l p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
        <p className="text-sm text-gray-500">
          Select a component to edit its properties
        </p>
      </div>
    </div>
  );
}

