# 🖖 Dynamic UI System

## Overview

The Dynamic UI System builds deeply nested UI structures based on data and component structure, using crew memories for design trends and best practices. It provides relative back button navigation and core templated design system integration.

## Architecture

```
Data Structure
    ↓
Component Structure Analysis
    ↓
Crew Design Trends (Troi, Data, La Forge, Riker)
    ↓
Dynamic Component Rendering
    ↓
Nested Navigation with Back Buttons
```

## Core Components

### 1. Dynamic UI System (`lib/dynamic-ui-system.tsx`)

**Features:**
- Dynamic component rendering based on data structure
- Deeply nested UI structures
- Relative back button navigation
- Breadcrumb navigation
- Design system template integration

**Component Types:**
- `container` - Basic container
- `grid` - Grid layout
- `card` - Card component
- `list` - List rendering
- `button` - Interactive button with navigation
- `text` - Text display
- `heading` - Heading elements

### 2. Crew Design Trends (`lib/crew-design-trends.ts`)

**Sources:**
- **Troi**: UX design trends, accessibility, user experience
- **Data**: Technical best practices, component patterns
- **La Forge**: Performance, infrastructure patterns
- **Riker**: Tactical organization, workflow patterns

**Design Trends:**
- Rounded Corners (Troi)
- Soft Shadows (Troi)
- Transparency & Blur (Troi)
- Accessibility First (Troi)
- Consistent Spacing Scale (Troi)
- Component Composition (Data)
- Performance Optimization (Data)
- Type Safety (Data)
- Responsive Design (La Forge)
- CSS Variables (La Forge)
- Clear Navigation (Riker)
- Information Architecture (Riker)

### 3. Dynamic Data Renderer (`components/DynamicDataRenderer.tsx`)

**Features:**
- Auto-generates component structure from data
- Integrates crew design trends
- Handles loading states
- Provides fallback UI

### 4. useDynamicUI Hook (`lib/useDynamicUI.tsx`)

**Features:**
- Easy React hook integration
- Automatic structure generation
- Navigation management
- Design trend loading

## Usage

### Basic Usage

```tsx
import { DynamicDataRenderer } from '@/components/DynamicDataRenderer';

function MyComponent() {
  const data = {
    sources: [
      { name: 'Supabase', status: 'connected' },
      { name: 'n8n', status: 'connected' }
    ]
  };

  return <DynamicDataRenderer data={data} />;
}
```

### With Custom Structure

```tsx
import { DynamicComponentRenderer, DynamicUIConfig } from '@/lib/dynamic-ui-system';

const structure = {
  type: 'grid',
  props: { columns: 'repeat(auto-fit, minmax(300px, 1fr))' },
  children: [
    {
      type: 'card',
      children: [
        {
          type: 'heading',
          props: { level: 3 },
          dataPath: 'name'
        },
        {
          type: 'text',
          dataPath: 'description'
        }
      ]
    }
  ]
};

const config: DynamicUIConfig = {
  data: myData,
  componentStructure: structure,
  navigationPath: [],
  designSystem: {
    template: 'modern',
    spacing: 'comfortable',
    trends: ['rounded-corners', 'soft-shadows']
  }
};

<DynamicComponentRenderer config={config} />
```

### Using the Hook

```tsx
import { useDynamicUI } from '@/lib/useDynamicUI';
import { DynamicComponentRenderer } from '@/lib/dynamic-ui-system';

function MyComponent() {
  const { config, navigate, goBack, loading } = useDynamicUI({
    data: myData,
    autoGenerateStructure: true
  });

  if (loading) return <div>Loading...</div>;

  return <DynamicComponentRenderer config={config} />;
}
```

## Navigation System

### Breadcrumb Navigation

Automatically generated based on navigation path:

```
Dashboard > Data Sources > Supabase > Details
```

### Back Button

Relative back button appears when navigation depth > 1:

```tsx
<button onClick={goBack}>← Back</button>
```

### Navigation Path

```tsx
interface NavigationPath {
  label: string;
  path: string;
  component?: string;
  data?: any;
}
```

## Design System Integration

### Templates

- `modern` - Modern UI with rounded corners, soft shadows
- `minimal` - Clean, minimal design
- `card` - Card-based layout
- `glassmorphism` - Glass effect with blur

### Spacing Modes

- `compact` - Tight spacing (4px, 8px, 12px, 16px)
- `comfortable` - Standard spacing (8px, 12px, 16px, 24px)
- `spacious` - Loose spacing (12px, 16px, 24px, 32px)

### Design Trends

Applied automatically from crew memories:
- `rounded-corners` - Larger border radius
- `soft-shadows` - Subtle shadow effects
- `transparency` - Glassmorphism effects

## Data Structure Analysis

The system automatically analyzes data structure:

**Array of Objects:**
```json
[
  { "name": "Item 1", "description": "..." },
  { "name": "Item 2", "description": "..." }
]
```
→ Renders as grid of cards

**Nested Object:**
```json
{
  "section1": { "title": "...", "content": "..." },
  "section2": { "title": "...", "content": "..." }
}
```
→ Renders as grid of sections

**Primitive:**
```json
"Simple text"
```
→ Renders as text component

## Crew Memory Integration

### Design Trends from Troi

- Icon sizing system (16px, 24px, 32px, 48px)
- Universal spacing scale
- Accessibility standards
- User experience patterns

### Best Practices from Data

- Component composition patterns
- Performance optimization
- Type safety
- Code organization

### Infrastructure from La Forge

- Responsive design patterns
- CSS variable usage
- Performance optimization
- System architecture

### Organization from Riker

- Navigation patterns
- Information architecture
- Workflow organization
- Tactical structure

## Examples

### Data Source Panel

```tsx
<DynamicDataRenderer
  data={{
    sources: dataSources,
    opportunities: integrationOpportunities
  }}
  initialPath={[
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Data Sources', path: '/dashboard/data-sources' }
  ]}
/>
```

### Nested Navigation

```tsx
const structure = {
  type: 'container',
  children: [
    {
      type: 'list',
      dataPath: 'sources',
      children: [
        {
          type: 'card',
          children: [
            {
              type: 'heading',
              props: { level: 3 },
              dataPath: 'name'
            },
            {
              type: 'button',
              props: {
                label: 'View Details',
                navigate: {
                  label: 'Source Details',
                  path: '/source/{id}',
                  data: 'currentItem'
                }
              }
            }
          ]
        }
      ]
    }
  ]
};
```

## Best Practices

1. **Use semantic data structures** - Well-structured data generates better UI
2. **Define custom structures** - For complex layouts, define structure explicitly
3. **Leverage crew trends** - System automatically applies design trends
4. **Maintain navigation paths** - Keep breadcrumbs clear and logical
5. **Test with real data** - Ensure structure works with actual data shapes

## Future Enhancements

- [ ] Visual structure builder
- [ ] Template library expansion
- [ ] Animation system
- [ ] Advanced filtering and sorting
- [ ] Real-time data updates
- [ ] Custom component registration

---

**Crew Integration:**
- Troi: UX design and accessibility
- Data: Technical implementation
- La Forge: Infrastructure and performance
- Riker: Organization and navigation

