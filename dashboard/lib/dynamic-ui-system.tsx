'use client';

/**
 * 🖖 Dynamic UI System
 * 
 * Builds dynamic UI structures based on data and component structure
 * Uses crew memories for design trends and best practices
 * 
 * Crew Integration:
 * - Troi: UX design trends and accessibility
 * - Data: Technical best practices and component structure
 * - La Forge: Infrastructure and performance
 * - Riker: Tactical organization and workflow
 * 
 * Features:
 * - Deeply nested UI structures
 * - Relative back button navigation
 * - Dynamic component rendering based on data
 * - Design system templates
 */

import React, { useState, useMemo } from 'react';

export interface NavigationPath {
  label: string;
  path: string;
  component?: string;
  data?: any;
}

export interface DynamicUIConfig {
  data: any;
  componentStructure: ComponentStructure;
  navigationPath: NavigationPath[];
  designSystem?: DesignSystemConfig;
}

export interface ComponentStructure {
  id?: string; // Unique identifier for React keys
  type: string;
  props?: Record<string, any>;
  children?: ComponentStructure[];
  dataPath?: string; // Path to data in the data object
  template?: string; // Template name from design system
}

export interface DesignSystemConfig {
  theme?: string;
  spacing?: 'compact' | 'comfortable' | 'spacious';
  density?: 'low' | 'medium' | 'high';
  accessibility?: boolean;
  trends?: string[]; // Design trends from crew memories
}

/**
 * Dynamic Component Renderer
 * Renders components based on data structure and component structure
 */
export function DynamicComponentRenderer({ config }: { config: DynamicUIConfig }) {
  const [navigationStack, setNavigationStack] = useState<NavigationPath[]>(config.navigationPath);
  const currentPath = navigationStack[navigationStack.length - 1];

  const handleBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const handleNavigate = (path: NavigationPath) => {
    setNavigationStack(prev => [...prev, path]);
  };

  // Get data for current path
  const currentData = useMemo(() => {
    if (!currentPath?.data) return config.data;
    return currentPath.data;
  }, [currentPath, config.data]);

  // Render component structure
  const renderedComponent = useMemo(() => {
    return renderComponentStructure(
      config.componentStructure,
      currentData,
      config.designSystem,
      handleNavigate
    );
  }, [config.componentStructure, currentData, config.designSystem]);

  return (
    <div className="dynamic-ui-container" style={getContainerStyles(config.designSystem)}>
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation
        path={navigationStack}
        onNavigate={handleNavigate}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div className="dynamic-ui-content" style={getContentStyles(config.designSystem)}>
        {renderedComponent}
      </div>
    </div>
  );
}

/**
 * Breadcrumb Navigation Component
 */
function BreadcrumbNavigation({
  path,
  onNavigate,
  onBack
}: {
  path: NavigationPath[];
  onNavigate: (path: NavigationPath) => void;
  onBack: () => void;
}) {
  return (
    <nav
      className="breadcrumb-navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        borderBottom: 'var(--border)',
        background: 'var(--card-alt)',
        fontSize: 'var(--font-sm)'
      }}
      aria-label="Breadcrumb navigation"
    >
      {path.map((item, index) => {
        const isLast = index === path.length - 1;
        return (
          <React.Fragment key={`breadcrumb-${index}-${item.path}`}>
            {index > 0 && (
              <span style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                /
              </span>
            )}
            {isLast ? (
              <span
                style={{
                  color: 'var(--accent)',
                  fontWeight: 600
                }}
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
      {path.length > 1 && (
        <button
          onClick={onBack}
          style={{
            marginLeft: 'auto',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            background: 'var(--card)',
            border: 'var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: 'var(--font-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
          }}
          aria-label="Go back"
        >
          ← Back
        </button>
      )}
    </nav>
  );
}

/**
 * Render component structure recursively
 */
function renderComponentStructure(
  structure: ComponentStructure,
  data: any,
  designSystem?: DesignSystemConfig,
  onNavigate?: (path: NavigationPath) => void
): React.ReactNode {
  const componentData = structure.dataPath
    ? getNestedValue(data, structure.dataPath)
    : data;

  // Apply design system template if specified
  const templateStyles = designSystem?.template
    ? getTemplateStyles(designSystem.template, designSystem)
    : {};

  switch (structure.type) {
    case 'container':
      return (
        <div
          style={{
            ...getContainerStyles(designSystem),
            ...templateStyles,
            ...structure.props?.style
          }}
        >
          {structure.children?.map((child, index) => (
            <React.Fragment key={child.id || `child-${index}`}>
              {renderComponentStructure(child, componentData, designSystem, onNavigate)}
            </React.Fragment>
          ))}
        </div>
      );

    case 'grid':
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: structure.props?.columns || 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: getSpacing(designSystem?.spacing || 'comfortable'),
            ...templateStyles,
            ...structure.props?.style
          }}
        >
          {structure.children?.map((child, index) => (
            <React.Fragment key={child.id || `child-${index}`}>
              {renderComponentStructure(child, componentData, designSystem, onNavigate)}
            </React.Fragment>
          ))}
        </div>
      );

    case 'card':
      return (
        <div
          style={{
            background: 'var(--card)',
            border: 'var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: getSpacing(designSystem?.spacing || 'comfortable'),
            ...templateStyles,
            ...structure.props?.style
          }}
        >
          {structure.children?.map((child, index) => (
            <React.Fragment key={child.id || `child-${index}`}>
              {renderComponentStructure(child, componentData, designSystem, onNavigate)}
            </React.Fragment>
          ))}
        </div>
      );

    case 'list':
      const listData = Array.isArray(componentData) ? componentData : [];
      return (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: getSpacing(designSystem?.spacing || 'comfortable'),
            ...templateStyles,
            ...structure.props?.style
          }}
        >
          {listData.map((item: any, index: number) => (
            <li key={item.id || item.key || `list-item-${index}`}>
              {structure.children?.map((child, childIndex) => (
                <React.Fragment key={child.id || `list-child-${index}-${childIndex}`}>
                  {renderComponentStructure(child, item, designSystem, onNavigate)}
                </React.Fragment>
              ))}
            </li>
          ))}
        </ul>
      );

    case 'button':
      return (
        <button
          onClick={() => {
            if (structure.props?.navigate && onNavigate) {
              onNavigate({
                label: structure.props.navigate.label || 'Navigate',
                path: structure.props.navigate.path || '',
                data: structure.props.navigate.data
              });
            }
            structure.props?.onClick?.(componentData);
          }}
          style={{
            padding: `${getSpacing(designSystem?.spacing || 'comfortable', 'sm')} ${getSpacing(designSystem?.spacing || 'comfortable', 'md')}`,
            background: structure.props?.variant === 'primary' ? 'var(--accent)' : 'var(--card)',
            color: structure.props?.variant === 'primary' ? 'var(--button-text)' : 'var(--text)',
            border: 'var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: 'var(--font-sm)',
            fontWeight: structure.props?.variant === 'primary' ? 600 : 400,
            transition: 'all var(--transition-base)',
            ...templateStyles,
            ...structure.props?.style
          }}
        >
          {structure.props?.label || 'Button'}
        </button>
      );

    case 'text':
      // Ensure we only render strings/numbers, not objects
      const textContent = (typeof componentData === 'string' || typeof componentData === 'number')
        ? String(componentData)
        : (structure.props?.text || '');
      return (
        <span
          style={{
            color: structure.props?.variant === 'muted' ? 'var(--text-muted)' : 'var(--text)',
            fontSize: structure.props?.size ? `var(--font-${structure.props.size})` : 'var(--font-md)',
            fontWeight: structure.props?.weight || 400,
            ...templateStyles,
            ...structure.props?.style
          }}
        >
          {textContent}
        </span>
      );

    case 'heading':
      const headingLevel = structure.props?.level || 1;
      const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;
      // Ensure we only render strings/numbers, not objects
      const headingText = (typeof componentData === 'string' || typeof componentData === 'number')
        ? String(componentData)
        : (structure.props?.text || '');
      return (
        <HeadingTag
          style={{
            color: 'var(--heading, var(--text))',
            fontSize: structure.props?.size
              ? `var(--font-${structure.props.size})`
              : headingLevel === 1
              ? 'var(--font-2xl)'
              : headingLevel === 2
              ? 'var(--font-xl)'
              : 'var(--font-lg)',
            fontWeight: 600,
            marginBottom: getSpacing(designSystem?.spacing || 'comfortable', 'sm'),
            ...templateStyles,
            ...structure.props?.style
          }}
        >
          {headingText}
        </HeadingTag>
      );

    default:
      return (
        <div style={templateStyles}>
          {JSON.stringify(componentData, null, 2)}
        </div>
      );
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Get spacing value based on spacing mode
 */
function getSpacing(mode: 'compact' | 'comfortable' | 'spacious', size: 'xs' | 'sm' | 'md' | 'lg' = 'md'): string {
  const spacingMap = {
    compact: { xs: '4px', sm: '8px', md: '12px', lg: '16px' },
    comfortable: { xs: '8px', sm: '12px', md: '16px', lg: '24px' },
    spacious: { xs: '12px', sm: '16px', md: '24px', lg: '32px' }
  };
  return spacingMap[mode][size];
}

/**
 * Get container styles based on design system
 */
function getContainerStyles(designSystem?: DesignSystemConfig): React.CSSProperties {
  return {
    width: '100%',
    minHeight: '100vh',
    background: 'var(--background)',
    color: 'var(--text)'
  };
}

/**
 * Get content styles
 */
function getContentStyles(designSystem?: DesignSystemConfig): React.CSSProperties {
  return {
    padding: getSpacing(designSystem?.spacing || 'comfortable', 'lg'),
    maxWidth: '1400px',
    margin: '0 auto'
  };
}

/**
 * Get template styles based on template name and design trends
 */
function getTemplateStyles(template: string, designSystem?: DesignSystemConfig): React.CSSProperties {
  // Base template styles
  const templates: Record<string, React.CSSProperties> = {
    modern: {
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      backdropFilter: 'blur(10px)'
    },
    minimal: {
      border: 'none',
      boxShadow: 'none',
      background: 'transparent'
    },
    card: {
      background: 'var(--card)',
      border: 'var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-lg)'
    },
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 'var(--radius-lg)'
    }
  };

  let styles = templates[template] || {};

  // Apply design trends from crew memories
  if (designSystem?.trends) {
    if (designSystem.trends.includes('rounded-corners')) {
      styles.borderRadius = 'var(--radius-xl)';
    }
    if (designSystem.trends.includes('soft-shadows')) {
      styles.boxShadow = 'var(--shadow-lg)';
    }
    if (designSystem.trends.includes('transparency')) {
      styles.background = styles.background || 'rgba(255, 255, 255, 0.05)';
    }
  }

  return styles;
}

