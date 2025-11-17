#!/bin/bash
# Create Project Dashboard Scaffolding
# 
# Commander Riker's recommendation: Dashboard scaffolding CLI tool
# Creates a project-specific dashboard package using dashboard-core

set -euo pipefail

PROJECT_NAME="${1:-}"
if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name>"
    echo "Example: $0 my-project"
    exit 1
fi

# Convert project name to package name format
PACKAGE_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
DASHBOARD_DIR="packages/${PACKAGE_NAME}-dashboard"

echo "🚀 Creating dashboard for project: $PROJECT_NAME"
echo "   Package: $PACKAGE_NAME-dashboard"
echo "   Directory: $DASHBOARD_DIR"
echo ""

# Create directory structure
mkdir -p "$DASHBOARD_DIR"/{src/{components,pages,theme,config},public}

# Create package.json
cat > "$DASHBOARD_DIR/package.json" << EOF
{
  "name": "@alex-ai/${PACKAGE_NAME}-dashboard",
  "version": "1.0.0",
  "description": "Dashboard for ${PROJECT_NAME}",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@alex-ai/dashboard-core": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
EOF

# Create Next.js config
cat > "$DASHBOARD_DIR/next.config.js" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@alex-ai/dashboard-core']
};

module.exports = nextConfig;
EOF

# Create TypeScript config
cat > "$DASHBOARD_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Create theme file
cat > "$DASHBOARD_DIR/src/theme/index.ts" << EOF
import { DashboardTheme } from '@alex-ai/dashboard-core';

export const ${PACKAGE_NAME}Theme: DashboardTheme = {
  id: '${PACKAGE_NAME}-theme',
  name: '${PROJECT_NAME} Theme',
  colors: {
    primary: '#0070f3',
    secondary: '#00d4ff',
    accent: '#00ffaa',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    textMuted: '#666666',
    border: '#e0e0e0'
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    fontSize: {
      base: '14px',
      sm: '12px',
      lg: '18px',
      xl: '24px'
    }
  },
  spacing: {
    unit: 8,
    padding: 16,
    gap: 16
  },
  borderRadius: 8,
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 2px 4px rgba(0,0,0,0.1)',
    lg: '0 4px 8px rgba(0,0,0,0.15)'
  }
};
EOF

# Create main dashboard page
cat > "$DASHBOARD_DIR/src/pages/dashboard.tsx" << EOF
'use client';

import { GridLayout, DataTable, DataChart, BaseCard } from '@alex-ai/dashboard-core';
import { DashboardProject, DashboardComponent } from '@alex-ai/dashboard-core';
import { ${PACKAGE_NAME}Theme as projectTheme } from '../theme';

interface DashboardPageProps {
  project: DashboardProject;
}

export default function DashboardPage({ project }: DashboardPageProps) {
  const renderComponent = (component: DashboardComponent) => {
    switch (component.type) {
      case 'table':
        return <DataTable component={component} theme={projectTheme} />;
      case 'chart':
        return <DataChart component={component} theme={projectTheme} />;
      default:
        return <BaseCard component={component} theme={projectTheme} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: projectTheme.colors.background }}>
      <GridLayout
        components={project.components}
        config={project.layout.config}
        theme={projectTheme}
        renderComponent={renderComponent}
        editable={project.config?.editable}
      />
    </div>
  );
}
EOF

# Create README
cat > "$DASHBOARD_DIR/README.md" << EOF
# ${PROJECT_NAME} Dashboard

Project-specific dashboard built on @alex-ai/dashboard-core.

## Development

\`\`\`bash
npm run dev
\`\`\`

## Customization

- **Theme**: Edit \`src/theme/index.ts\`
- **Components**: Add custom components in \`src/components/\`
- **Pages**: Add pages in \`src/pages/\`
- **Config**: Configure dashboard in \`src/config/\`

## Using Dashboard Core

This dashboard uses \`@alex-ai/dashboard-core\` for base components. See the core package documentation for available components and APIs.
EOF

echo "✅ Dashboard created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. cd $DASHBOARD_DIR"
echo "   2. npm install"
echo "   3. npm run dev"
echo ""
echo "🎨 Customize:"
echo "   - Theme: $DASHBOARD_DIR/src/theme/index.ts"
echo "   - Components: $DASHBOARD_DIR/src/components/"
echo "   - Pages: $DASHBOARD_DIR/src/pages/"
echo ""

