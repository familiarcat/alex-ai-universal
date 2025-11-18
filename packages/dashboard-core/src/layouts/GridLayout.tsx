/**
 * Grid Layout Component
 * 
 * Responsive grid layout for dashboard components
 * Supports drag-and-drop reordering and responsive breakpoints
 * 
 * Crew Recommendation: dnd-kit for optimal UX and accessibility
 */

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardComponent, DashboardTheme, LayoutConfig } from '../types';

export interface GridLayoutProps {
  components: DashboardComponent[];
  config?: LayoutConfig;
  theme?: DashboardTheme;
  renderComponent: (component: DashboardComponent) => React.ReactNode;
  onComponentReorder?: (componentIds: string[]) => void;
  editable?: boolean;
  className?: string;
}

interface SortableItemProps {
  component: DashboardComponent;
  renderComponent: (component: DashboardComponent) => React.ReactNode;
  theme?: DashboardTheme;
  editable?: boolean;
}

function SortableItem({ component, renderComponent, theme, editable }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: component.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: editable ? 'grab' : 'default',
    touchAction: 'none'
  };

  const dragHandleStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    display: editable ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    opacity: 0.6,
    borderRadius: 4,
    background: theme?.colors?.cardAlt || 'rgba(255,255,255,0.1)',
    border: `1px solid ${theme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
    zIndex: 10
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(editable ? { ...attributes, ...listeners } : {})}
    >
      <div style={{ position: 'relative' }}>
        {editable && (
          <div
            style={dragHandleStyle}
            aria-label={`Drag to reorder ${component.title}`}
            role="button"
            tabIndex={0}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ pointerEvents: 'none' }}
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" />
              <circle cx="6" cy="2" r="1" fill="currentColor" />
              <circle cx="10" cy="2" r="1" fill="currentColor" />
              <circle cx="2" cy="6" r="1" fill="currentColor" />
              <circle cx="6" cy="6" r="1" fill="currentColor" />
              <circle cx="10" cy="6" r="1" fill="currentColor" />
              <circle cx="2" cy="10" r="1" fill="currentColor" />
              <circle cx="6" cy="10" r="1" fill="currentColor" />
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </svg>
          </div>
        )}
        {renderComponent(component)}
      </div>
    </div>
  );
}

export function GridLayout({
  components,
  config,
  theme,
  renderComponent,
  onComponentReorder,
  editable = false,
  className = ''
}: GridLayoutProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState(components);

  // Update items when components change
  React.useEffect(() => {
    setItems(components);
  }, [components]);

  const columns = config?.columns || 3;
  const gap = config?.gap || theme?.spacing?.gap || 16;

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Notify parent of reorder
        if (onComponentReorder) {
          onComponentReorder(newItems.map(item => item.id));
        }

        return newItems;
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    padding: `${config?.padding || theme?.spacing?.padding || 16}px`
  };

  // Responsive breakpoints
  const responsiveStyle = `
    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: repeat(${Math.max(1, columns - 1)}, 1fr) !important;
      }
    }
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr !important;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .dashboard-grid * {
        transition: none !important;
        animation: none !important;
      }
    }
  `;

  const activeComponent = activeId ? items.find(c => c.id === activeId) : null;

  if (!editable) {
    // Non-editable mode: render without drag-and-drop
    return (
      <>
        <style>{responsiveStyle}</style>
        <div 
          className={`dashboard-grid ${className}`}
          style={gridStyle}
        >
          {items.map(component => (
            <div
              key={component.id}
              data-component-id={component.id}
              style={{
                minHeight: '100px'
              }}
            >
              {renderComponent(component)}
            </div>
          ))}
        </div>
      </>
    );
  }

  // Editable mode: render with drag-and-drop
  return (
    <>
      <style>{responsiveStyle}</style>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={items.map(c => c.id)}
          strategy={rectSortingStrategy}
        >
          <div 
            className={`dashboard-grid ${className}`}
            style={gridStyle}
          >
            {items.map(component => (
              <SortableItem
                key={component.id}
                component={component}
                renderComponent={renderComponent}
                theme={theme}
                editable={editable}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeComponent ? (
            <div
              style={{
                opacity: 0.8,
                transform: 'rotate(5deg)',
                boxShadow: theme?.boxShadow?.lg || '0 8px 24px rgba(0,0,0,0.4)',
                borderRadius: theme?.borderRadius || '8px',
                overflow: 'hidden'
              }}
            >
              {renderComponent(activeComponent)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}

