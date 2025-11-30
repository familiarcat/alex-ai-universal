/**
 * Dashboard Core - TypeScript Type Definitions
 * 
 * Shared type definitions for all dashboard components
 * Commander Data's recommendation: Type-safe component interfaces
 */

export type ComponentRole = 
  | 'hero' 
  | 'header' 
  | 'footer' 
  | 'feature' 
  | 'testimonial' 
  | 'cta' 
  | 'gallery' 
  | 'content'
  | 'chart'
  | 'table'
  | 'form'
  | 'card'
  | 'list'
  | 'project-manager';

export type Intent = 
  | 'acquire' 
  | 'convert' 
  | 'educate' 
  | 'trust' 
  | 'delight'
  | 'analyze'
  | 'monitor'
  | 'manage';

export type Tone = 
  | 'bold' 
  | 'calm' 
  | 'playful' 
  | 'serious' 
  | 'futuristic'
  | 'professional'
  | 'casual';

export interface DashboardComponent {
  id: string;
  type: ComponentRole;
  title?: string;
  data?: any; // Component-specific data
  config?: ComponentConfig;
  editable?: boolean;
  deletable?: boolean;
  reorderable?: boolean;
  updatedAt?: number;
}

export interface ComponentConfig {
  theme?: string;
  intent?: Intent;
  tone?: Tone;
  priority?: number; // 1-5 (5 = highest)
  layout?: 'grid' | 'list' | 'card' | 'table' | 'chart';
  columns?: number;
  responsive?: boolean;
  [key: string]: any; // Allow project-specific config
}

export interface DashboardLayout {
  id: string;
  name: string;
  components: DashboardComponent[];
  layout: 'grid' | 'sidebar' | 'fullwidth' | 'custom';
  config?: LayoutConfig;
}

export interface LayoutConfig {
  columns?: number;
  gap?: number;
  padding?: number;
  sidebarWidth?: number;
  headerHeight?: number;
  footerHeight?: number;
  [key: string]: any;
}

export interface DashboardTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    [key: string]: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: {
      base?: string;
      sm?: string;
      lg?: string;
      xl?: string;
    };
  };
  spacing?: {
    unit?: number;
    padding?: number;
    gap?: number;
  };
  borderRadius?: number;
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
}

export interface DashboardData {
  id: string;
  source: 'api' | 'local' | 'database' | 'file';
  endpoint?: string;
  transform?: (data: any) => any;
  refreshInterval?: number;
  cache?: boolean;
}

export interface DashboardProject {
  id: string;
  name: string;
  description?: string;
  theme: string;
  layout: DashboardLayout;
  components: DashboardComponent[];
  data?: DashboardData[];
  config?: ProjectConfig;
  updatedAt: number;
}

export interface ProjectConfig {
  editable?: boolean;
  deletable?: boolean;
  shareable?: boolean;
  exportable?: boolean;
  [key: string]: any;
}

export interface DashboardProps {
  project: DashboardProject;
  theme?: DashboardTheme;
  onUpdate?: (project: DashboardProject) => void;
  onComponentUpdate?: (componentId: string, updates: Partial<DashboardComponent>) => void;
  onComponentAdd?: (component: DashboardComponent) => void;
  onComponentDelete?: (componentId: string) => void;
  onComponentReorder?: (componentIds: string[]) => void;
  editable?: boolean;
  className?: string;
}

import * as React from 'react';

export interface ComponentRegistry {
  [type: string]: {
    component: React.ComponentType<any>;
    defaultConfig?: ComponentConfig;
    schema?: any; // JSON schema for validation
    icon?: string;
    label?: string;
    description?: string;
  };
}

