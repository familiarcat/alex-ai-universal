# Dashboard Core Architecture

## Overview

`@alex-ai/dashboard-core` is a reusable component library that provides the foundation for all project dashboards in the Alex AI Universal framework.

## Design Principles

1. **Composition over Inheritance**: Components are designed to be composed together
2. **Data-Driven**: Components accept data and render dynamically
3. **Themeable**: All components support project-specific theming
4. **Editable**: Components support in-place editing when enabled
5. **Type-Safe**: Full TypeScript support for reliability

## Package Structure

```
packages/dashboard-core/
  src/
    components/     # Reusable UI components
      BaseCard.tsx  # Foundation card component
      DataTable.tsx # Table with sorting/filtering
      DataChart.tsx # Chart visualizations
    layouts/        # Layout components
      GridLayout.tsx # Responsive grid layout
    hooks/          # React hooks (to be implemented)
    utils/          # Utility functions (to be implemented)
    types/          # TypeScript type definitions
      index.ts      # All shared types
  examples/         # Usage examples
  docs/             # Documentation
```

## Component Types

### BaseCard
Foundation component for all dashboard cards. Provides:
- Theming support
- Edit/Delete actions
- Consistent styling
- Component metadata

### DataTable
Table component for structured data. Features:
- Sorting (ascending/descending)
- Filtering (text search)
- Editable cells (when enabled)
- Responsive design
- Custom column rendering

### DataChart
Chart component for data visualization. Supports:
- Bar charts
- Line charts
- Pie charts
- Area charts (planned)
- Scatter plots (planned)

### GridLayout
Responsive grid layout system. Features:
- Configurable columns
- Responsive breakpoints
- Gap and padding control
- Component reordering (planned)

## Type System

### Core Types

- `DashboardComponent`: Individual dashboard component
- `DashboardProject`: Complete dashboard project
- `DashboardTheme`: Theme configuration
- `DashboardLayout`: Layout configuration
- `ComponentConfig`: Component-specific configuration

### Component Roles

Components can have different roles:
- `hero`, `header`, `footer`
- `feature`, `testimonial`, `cta`
- `gallery`, `content`
- `chart`, `table`, `form`, `card`, `list`

## Usage Pattern

### 1. Create Project Dashboard

```bash
./scripts/create-project-dashboard.sh my-project
```

### 2. Use Core Components

```tsx
import { GridLayout, DataTable, BaseCard } from '@alex-ai/dashboard-core';
import { DashboardProject } from '@alex-ai/dashboard-core';

function MyDashboard({ project }: { project: DashboardProject }) {
  return (
    <GridLayout
      components={project.components}
      renderComponent={(component) => {
        if (component.type === 'table') {
          return <DataTable component={component} />;
        }
        return <BaseCard component={component} />;
      }}
    />
  );
}
```

### 3. Customize Theme

```tsx
import { DashboardTheme } from '@alex-ai/dashboard-core';

const myTheme: DashboardTheme = {
  id: 'my-theme',
  name: 'My Theme',
  colors: {
    primary: '#0070f3',
    // ... other colors
  }
};
```

## Extension Points

### Custom Components

Projects can create custom components that extend BaseCard:

```tsx
import { BaseCard, DashboardComponent, DashboardTheme } from '@alex-ai/dashboard-core';

function CustomComponent({ component, theme }: { 
  component: DashboardComponent; 
  theme?: DashboardTheme 
}) {
  return (
    <BaseCard component={component} theme={theme}>
      {/* Custom content */}
    </BaseCard>
  );
}
```

### Component Registry

Components can be registered for dynamic loading:

```tsx
import { ComponentRegistry } from '@alex-ai/dashboard-core';

const registry: ComponentRegistry = {
  'custom-type': {
    component: CustomComponent,
    defaultConfig: { /* ... */ },
    label: 'Custom Component',
    description: 'A custom component'
  }
};
```

## Data Flow

1. **Data Source**: Components receive data via props
2. **Transformation**: Data can be transformed before rendering
3. **Rendering**: Components render based on data and config
4. **Updates**: Changes trigger callbacks for persistence

## Theming

Themes are project-specific and can override:
- Colors (primary, secondary, accent, etc.)
- Typography (fonts, sizes)
- Spacing (padding, gaps)
- Border radius
- Shadows

## Future Enhancements

- [ ] Drag-and-drop component reordering
- [ ] Component plugin system
- [ ] Advanced chart types
- [ ] Form components
- [ ] Real-time data updates
- [ ] Component analytics
- [ ] Performance monitoring

## Migration Guide

To migrate existing dashboard to use dashboard-core:

1. Install `@alex-ai/dashboard-core`
2. Replace custom components with core components
3. Update theme to use `DashboardTheme` type
4. Refactor layout to use `GridLayout`
5. Test and customize as needed

