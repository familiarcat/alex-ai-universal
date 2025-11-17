/**
 * Dashboard Core - Main Export
 * 
 * Reusable dashboard component library for Alex AI projects
 * 
 * Commander Data's recommendation: Modular component architecture
 * Geordi's recommendation: Infrastructure-level component reuse
 */

// Types
export * from './types';

// Components
export { BaseCard } from './components/BaseCard';
export { DataTable } from './components/DataTable';
export { DataChart } from './components/DataChart';
export type { BaseCardProps } from './components/BaseCard';
export type { DataTableProps } from './components/DataTable';
export type { DataChartProps, ChartType } from './components/DataChart';

// Layouts
export { GridLayout } from './layouts/GridLayout';
export type { GridLayoutProps } from './layouts/GridLayout';

// Hooks (to be implemented)
// export { useDashboard } from './hooks/useDashboard';
// export { useDashboardData } from './hooks/useDashboardData';
// export { useDashboardTheme } from './hooks/useDashboardTheme';

// Utils (to be implemented)
// export { validateComponent } from './utils/validation';
// export { transformData } from './utils/dataTransform';

