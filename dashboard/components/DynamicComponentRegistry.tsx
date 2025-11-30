'use client';

/**
 * Dynamic Component Registry System
 * 
 * Allows interchangeable Next.js components to be dynamically loaded
 * and rendered based on vector priority and project requirements
 * 
 * DDD Architecture: Registry => Component Loader => Dynamic Renderer
 */

import { ComponentType, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

export interface ComponentConfig {
  id: string;
  name: string;
  component: ComponentType<any>;
  priority: number;
  category: string;
  props?: Record<string, any>;
}

export class DynamicComponentRegistry {
  private static registry = new Map<string, ComponentConfig>();
  private static componentCache = new Map<string, ComponentType<any>>();

  /**
   * Register a component in the registry
   */
  static register(config: ComponentConfig): void {
    this.registry.set(config.id, config);
    
    // Cache the component for faster access
    if (!this.componentCache.has(config.id)) {
      this.componentCache.set(config.id, config.component);
    }
  }

  /**
   * Get component by ID
   */
  static get(id: string): ComponentType<any> | null {
    const config = this.registry.get(id);
    return config?.component || null;
  }

  /**
   * Get all components sorted by priority
   */
  static getAllByPriority(): ComponentConfig[] {
    return Array.from(this.registry.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get components by category
   */
  static getByCategory(category: string): ComponentConfig[] {
    return Array.from(this.registry.values())
      .filter(config => config.category === category);
  }

  /**
   * Unregister a component
   */
  static unregister(id: string): boolean {
    this.componentCache.delete(id);
    return this.registry.delete(id);
  }

  /**
   * Clear all components
   */
  static clear(): void {
    this.registry.clear();
    this.componentCache.clear();
  }
}

/**
 * Dynamic Component Renderer
 */
interface DynamicComponentRendererProps {
  componentId: string;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
}

export function DynamicComponentRenderer({
  componentId,
  props = {},
  fallback = <div>Loading component...</div>
}: DynamicComponentRendererProps) {
  const Component = DynamicComponentRegistry.get(componentId);

  if (!Component) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Component "{componentId}" not found in registry</p>
      </div>
    );
  }

  // Use dynamic import for code splitting
  const LazyComponent = dynamic(() => Promise.resolve(Component), {
    loading: () => <>{fallback}</>,
    ssr: false
  });

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Component Grid - Renders multiple dynamic components
 */
interface ComponentGridProps {
  componentIds: string[];
  layout?: 'grid' | 'list' | 'masonry';
  columns?: number;
}

export function ComponentGrid({
  componentIds,
  layout = 'grid',
  columns = 3
}: ComponentGridProps) {
  const gridClass = layout === 'grid' 
    ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`
    : layout === 'list'
    ? 'flex flex-col gap-4'
    : 'columns-1 md:columns-2 lg:columns-3 gap-4';

  return (
    <div className={gridClass}>
      {componentIds.map((id) => (
        <DynamicComponentRenderer
          key={id}
          componentId={id}
          fallback={
            <div className="p-4 border rounded-lg animate-pulse bg-gray-100">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          }
        />
      ))}
    </div>
  );
}

/**
 * Priority-Based Component Selector
 * Selects components based on vector priority
 */
interface PriorityComponentSelectorProps {
  vectors: Array<{ id: string; priority: number; domain: string }>;
  maxComponents?: number;
}

export function PriorityComponentSelector({
  vectors,
  maxComponents = 10
}: PriorityComponentSelectorProps) {
  // Sort by priority and select top components
  const sortedVectors = [...vectors]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxComponents);

  // Map vectors to component IDs (based on domain)
  const componentIds = sortedVectors.map(v => {
    // Map domain to component ID
    const domainMap: Record<string, string> = {
      'command': 'command-center',
      'tactical': 'tactical-display',
      'engineering': 'engineering-monitor',
      'operations': 'operations-dashboard',
      'budget': 'budget-visualizer',
      'security': 'security-monitor'
    };
    
    return domainMap[v.domain] || 'default-component';
  });

  return <ComponentGrid componentIds={componentIds} />;
}

