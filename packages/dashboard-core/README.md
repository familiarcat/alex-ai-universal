# @alex-ai/dashboard-core

Reusable dashboard component library for Alex AI projects.

## Overview

This package provides a foundation of reusable dashboard components that can be used across all Alex AI projects. Each project can customize components while maintaining consistency and quality.

## Features

- **Component-Based Architecture**: Reusable, composable components
- **Type-Safe**: Full TypeScript support
- **Themeable**: Project-specific theme overrides
- **Editable**: Components support in-place editing
- **Data-Driven**: Flexible data binding per component
- **Responsive**: Built-in responsive layouts

## Installation

```bash
npm install @alex-ai/dashboard-core
```

## Usage

### Basic Dashboard

```tsx
import { GridLayout, BaseCard, DataTable } from '@alex-ai/dashboard-core';
import { DashboardProject, DashboardTheme } from '@alex-ai/dashboard-core';

function MyDashboard({ project, theme }: { project: DashboardProject; theme?: DashboardTheme }) {
  return (
    <GridLayout
      components={project.components}
      theme={theme}
      renderComponent={(component) => {
        switch (component.type) {
          case 'table':
            return <DataTable component={component} theme={theme} />;
          default:
            return <BaseCard component={component} theme={theme} />;
        }
      }}
    />
  );
}
```

### Custom Component

```tsx
import { BaseCard, DashboardComponent, DashboardTheme } from '@alex-ai/dashboard-core';

function CustomComponent({ 
  component, 
  theme 
}: { 
  component: DashboardComponent; 
  theme?: DashboardTheme 
}) {
  return (
    <BaseCard component={component} theme={theme}>
      {/* Your custom content */}
    </BaseCard>
  );
}
```

## Component Types

- **BaseCard**: Foundation card component
- **DataTable**: Table with sorting, filtering, editing
- **DataChart**: Charts (bar, line, pie, area, scatter)
- **GridLayout**: Responsive grid layout

## Theming

Components support project-specific themes:

```tsx
const customTheme: DashboardTheme = {
  id: 'my-theme',
  name: 'My Project Theme',
  colors: {
    primary: '#0070f3',
    secondary: '#00d4ff',
    accent: '#00ffaa',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    textMuted: '#666666',
    border: '#e0e0e0'
  }
};
```

## Architecture

```
packages/dashboard-core/
  src/
    components/     # Reusable components
    layouts/        # Layout components
    hooks/          # React hooks
    utils/          # Utility functions
    types/          # TypeScript types
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Test
npm test
```

## License

MIT

