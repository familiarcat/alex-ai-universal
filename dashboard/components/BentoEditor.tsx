'use client';

/**
 * BentoEditor Component with Drag-and-Drop
 * 
 * Crew Recommendation: dnd-kit for optimal UX and accessibility
 * Features: Drag to reorder components, visual feedback, keyboard support
 */

import React, { useState } from 'react';
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
import { useAppState } from '@/lib/state-manager';
import { getProfessionalSuggestion, getAdvisorOptions, AdvisorCode } from '@/lib/suggestion-engine';
import ThemeSelector from '@/components/ThemeSelector';

interface SortableCardProps {
  component: any;
  projectId: string;
  project: any;
  updateComponent: (projectId: string, componentId: string, updates: any) => void;
  advisorOverride: AdvisorCode | '';
  advisorOptions: any[];
  intentOptions: readonly string[];
  toneOptions: readonly string[];
  roleOptions: readonly string[];
  cardSize: (priority: number, role: string) => any;
  select: any;
  getProfessionalSuggestion: (component: any, project: any, advisor?: AdvisorCode) => any;
  setAdvisorOverride: (value: AdvisorCode | '') => void;
}

function SortableCard({
  component: c,
  projectId,
  project,
  updateComponent,
  advisorOverride,
  advisorOptions,
  intentOptions,
  toneOptions,
  roleOptions,
  cardSize,
  select,
  getProfessionalSuggestion,
  setAdvisorOverride
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: c.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    touchAction: 'none'
  };

  const dragHandleStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    opacity: 0.7,
    borderRadius: 6,
    background: 'var(--card-alt)',
    border: '1px solid var(--border)',
    zIndex: 10,
    transition: 'opacity 0.2s'
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: 'var(--border)',
        borderRadius: 12,
        background: 'var(--surface)',
        padding: 12,
        position: 'relative',
        ...cardSize(c.priority, c.role)
      }}
      {...attributes}
    >
      <div
        {...listeners}
        style={dragHandleStyle}
        aria-label={`Drag to reorder ${c.title || 'component'}`}
        role="button"
        tabIndex={0}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '0.7';
        }}
      >
        <svg
          width="16"
          height="16"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <input
          value={c.title}
          onChange={(e) => updateComponent(projectId, c.id, { title: e.target.value })}
          style={{ width: '70%', padding: 8, background: 'var(--card)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}
        />
        <select value={c.role} onChange={(e) => updateComponent(projectId, c.id, { role: e.target.value as any })} style={select as any}>
          {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <textarea
        value={c.body}
        onChange={(e) => updateComponent(projectId, c.id, { body: e.target.value })}
        style={{ width: '100%', minHeight: 80, padding: 8, background: 'var(--card)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' as const }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Priority</label>
        <input
          type="range"
          min={1}
          max={5}
          value={c.priority}
          onChange={(e) => updateComponent(projectId, c.id, { priority: Number(e.target.value) })}
        />
        <label style={{ fontSize: 12, opacity: 0.8 }}>Intent</label>
        <select value={c.intent || ''} onChange={(e) => updateComponent(projectId, c.id, { intent: e.target.value as any })} style={select as any}>
          <option value="">—</option>
          {intentOptions.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Tone</label>
        <select value={c.tone || ''} onChange={(e) => updateComponent(projectId, c.id, { tone: e.target.value as any })} style={select as any}>
          <option value="">—</option>
          {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ gridColumn: 'span 2' }}>
          <ThemeSelector
            value={c.theme || ''}
            onChange={(themeId) => updateComponent(projectId, c.id, { theme: themeId })}
            mode="dropdown"
            showInherit={true}
            inheritLabel={`Use project theme (${project?.theme || 'gradient'})`}
            label="Theme Override"
          />
        </div>
        <select
          value={advisorOverride}
          onChange={(e) => setAdvisorOverride((e.target.value || '') as AdvisorCode | '')}
          style={select as any}
          title="Advisor (professional title)"
        >
          <option value="">Auto (role-based)</option>
          {advisorOptions.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.title}</option>
          ))}
        </select>
        <button
          onClick={() => {
            const suggestion = getProfessionalSuggestion(c as any, project as any, advisorOverride || undefined);
            updateComponent(projectId, c.id, {
              title: suggestion.title,
              body: suggestion.body
            });
          }}
          title="Get professional suggestion"
          style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#0b1020', border: 'none', cursor: 'pointer' }}
        >
          Get professional suggestion
        </button>
      </div>
    </div>
  );
}

export default function BentoEditor({ projectId }: { projectId: string }) {
  const { projects, updateComponent, reorderComponents } = useAppState();
  const project = projects[projectId];
  const [components, setComponents] = useState(project?.components || []);
  const advisorOptions = React.useMemo(() => getAdvisorOptions(), []);
  const [advisorOverride, setAdvisorOverride] = useState<AdvisorCode | ''>('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Update components when project changes
  React.useEffect(() => {
    setComponents(project?.components || []);
  }, [project?.components]);

  const gridTemplate = React.useMemo(() => {
    return 'repeat(auto-fill, minmax(260px, 1fr))';
  }, []);

  const cardSize = (priority: number, role: string) => {
    if (role === 'hero') return { gridColumn: 'span 2', gridRow: 'span 2' };
    if (priority >= 4) return { gridColumn: 'span 2' };
    return {};
  };

  const select = {
    padding: '8px 10px',
    background: 'var(--card)',
    color: 'var(--text)',
    border: 'var(--border)',
    borderRadius: 8
  } as const;

  const intentOptions = ['acquire','convert','educate','trust','delight'] as const;
  const toneOptions = ['bold','calm','playful','serious','futuristic'] as const;
  const roleOptions = ['header','hero','feature','testimonial','cta','gallery','content','footer', 'project-manager'] as const;

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
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update state manager with new order
        if (reorderComponents) {
          reorderComponents(projectId, newItems.map(item => item.id));
        }

        return newItems;
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeComponent = activeId ? components.find(c => c.id === activeId) : null;

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={components.map(c => c.id)}
          strategy={rectSortingStrategy}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate as any,
            gap: 16
          }}>
            {components.map((c) => (
              <SortableCard
                key={c.id}
                component={c}
                projectId={projectId}
                project={project}
                updateComponent={updateComponent}
                advisorOverride={advisorOverride}
                advisorOptions={advisorOptions}
                intentOptions={intentOptions}
                toneOptions={toneOptions}
                roleOptions={roleOptions}
                cardSize={cardSize}
                select={select}
                getProfessionalSuggestion={getProfessionalSuggestion}
                setAdvisorOverride={setAdvisorOverride}
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
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                borderRadius: 12,
                overflow: 'hidden',
                border: 'var(--border)',
                background: 'var(--surface)',
                padding: 12,
                ...cardSize(activeComponent.priority, activeComponent.role)
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <input
                  value={activeComponent.title}
                  readOnly
                  style={{ width: '70%', padding: 8, background: 'var(--card)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}
                />
                <select value={activeComponent.role} readOnly style={select as any}>
                  {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <textarea
                value={activeComponent.body}
                readOnly
                style={{ width: '100%', minHeight: 80, padding: 8, background: 'var(--card)', color: 'var(--text)', border: 'var(--border)', borderRadius: 8 }}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}


