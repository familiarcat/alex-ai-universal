# 🖖 Service Container System

## Overview

The Service Container System provides ordered service initialization with role-based status tracking. Each service is a "mock container" that describes its role and loading status, allowing components to load on their own async timeline while respecting dependency order.

## Architecture

### Core Concepts

1. **Service Containers**: Each service is a container with:
   - `id`: Unique identifier
   - `name`: Human-readable name
   - `role`: Service role (e.g., "Database", "Controller", "Analytics")
   - `description`: What the service does
   - `dependencies`: Array of service IDs this service depends on
   - `status`: Current status (pending, initializing, loading, ready, error, offline)
   - `progress`: Current progress (current/total, message)

2. **Dependency Order**: Services load in topological order (dependencies first)

3. **Status Tracking**: Each service reports its own status independently

4. **Visual Display**: `ServiceStatusDisplay` component shows all services with their status

## Service Definitions

Services are defined in `dashboard/lib/services/define-services.ts`:

```typescript
{
  id: 'mcp',
  name: 'MCP Server',
  role: 'Controller (Primary)',
  description: 'Model Context Protocol server - primary controller',
  dependencies: []
}
```

### Service Hierarchy

1. **Foundation Services** (no dependencies):
   - `supabase`: Database and authentication
   - `n8n`: Workflow automation (fallback controller)
   - `mcp`: MCP server (primary controller)

2. **Data Services** (depend on controllers):
   - `unified-data-service`: Client-side data access layer

3. **Feature Services** (depend on data layer):
   - `crew-memory-service`: Memory retrieval
   - `learning-analytics-service`: Analytics
   - `rag-recommendations-service`: Recommendations
   - `security-assessment-service`: Security monitoring
   - `cost-optimization-service`: Cost management
   - `documentation-service`: Documentation browser

4. **UI Services**:
   - `live-refresh-service`: Real-time updates
   - `theme-service`: Theme management

## Usage

### 1. Provider Setup

The `ServiceContainerProvider` wraps the app in `app/layout.tsx`:

```tsx
<ServiceContainerProvider>
  <GlobalThemeStyles />
  <DashboardChrome />
  <main>{children}</main>
</ServiceContainerProvider>
```

### 2. Service Initialization

The `ServiceInitializer` component initializes all services:

```tsx
<ServiceInitializer />
```

### 3. Service Status Display

Show all services and their status:

```tsx
<ServiceStatusDisplay />
```

### 4. Using Services in Components

Components can check if a service is ready:

```tsx
import { useServiceContainers } from '@/lib/service-containers';

function MyComponent() {
  const { isServiceReady, getService } = useServiceContainers();
  
  const mcpService = getService('mcp');
  const isReady = isServiceReady('mcp');
  
  if (!isReady) {
    return <div>Waiting for MCP service...</div>;
  }
  
  // Service is ready, proceed with component logic
}
```

### 5. Initializing a Custom Service

Use the `useServiceInitialization` hook:

```tsx
import { useServiceInitialization } from '@/lib/service-containers';

function MyComponent() {
  useServiceInitialization(
    'my-service',
    {
      id: 'my-service',
      name: 'My Service',
      role: 'Custom Service',
      description: 'Does something custom',
      dependencies: ['mcp', 'supabase']
    },
    async () => {
      // Initialize service
      await initializeMyService();
    }
  );
  
  const { isReady } = useServiceContainers();
  // Component logic
}
```

## Status States

- **pending**: Waiting for dependencies or not started
- **initializing**: Starting up
- **loading**: Actively loading data
- **ready**: Fully operational
- **error**: Failed to initialize
- **offline**: Service unavailable

## Benefits

1. **Ordered Loading**: Services load in dependency order automatically
2. **Status Visibility**: Users see exactly what's loading and why
3. **Independent Timelines**: Each service loads on its own schedule
4. **Error Isolation**: One service failure doesn't block others
5. **Dependency Management**: Automatic dependency resolution
6. **Role Clarity**: Each service clearly describes its role

## Crew Notes

**Commander Data**: "The topological sort ensures optimal initialization order. Service containers provide clear abstraction boundaries."

**Lt. Cmdr. La Forge**: "The dependency system prevents race conditions. Each service reports its own status independently."

**Counselor Troi**: "Users feel informed, not frustrated. The status display provides transparency and builds confidence."

**Chief O'Brien**: "Pragmatic solution - services load when ready, no blocking. The system is resilient to failures."



