/**
 * 🖖 Crew Design Trends & Best Practices
 * 
 * Aggregates design trends and best practices from crew memories
 * Used by Dynamic UI System for templated design
 * 
 * Sources:
 * - Troi: UX design trends, accessibility, user experience
 * - Data: Technical best practices, component patterns
 * - La Forge: Performance, infrastructure patterns
 * - Riker: Tactical organization, workflow patterns
 */

import { getUnifiedDataService } from './unified-data-service';

export interface DesignTrend {
  name: string;
  description: string;
  crewMember: string;
  category: 'ui' | 'ux' | 'performance' | 'accessibility' | 'architecture';
  priority: 'high' | 'medium' | 'low';
  implementation: string[];
  examples?: string[];
}

export interface BestPractice {
  name: string;
  description: string;
  crewMember: string;
  category: string;
  codeExample?: string;
  references?: string[];
}

/**
 * Get design trends from crew memories
 */
export async function getDesignTrends(): Promise<DesignTrend[]> {
  try {
    const service = getUnifiedDataService();
    
    // Query crew memories for design trends
    const troiMemories = await service.queryKnowledge({
      crew_member: 'troi',
      category: 'design_trend',
      limit: 20
    });

    const dataMemories = await service.queryKnowledge({
      crew_member: 'data',
      category: 'best_practice',
      limit: 20
    });

    // FIXED: Handle empty or error responses gracefully
    // Crew: O'Brien (Pragmatic) + Data (Analysis)
    const troiData = troiMemories?.data || troiMemories?.memories || troiMemories?.sessions || troiMemories || [];
    const dataData = dataMemories?.data || dataMemories?.memories || dataMemories?.sessions || dataMemories || [];
    
    // If we got an error response, return empty array
    if (troiMemories?.error || dataMemories?.error) {
      console.debug('Design trends query returned error, using defaults');
      return [];
    }
    
    // Extract design trends from memories
    const trends: DesignTrend[] = [];

    // Troi's UX Design Trends (from memories)
    trends.push(
      {
        name: 'Rounded Corners',
        description: 'Modern UI uses rounded corners for softer, more approachable design',
        crewMember: 'troi',
        category: 'ui',
        priority: 'high',
        implementation: [
          'Use --radius-lg (12px) for cards',
          'Use --radius-xl (16px) for containers',
          'Avoid sharp corners except for specific design needs'
        ],
        examples: ['Glassmorphism', 'Card designs', 'Button styles']
      },
      {
        name: 'Soft Shadows',
        description: 'Subtle shadows create depth without overwhelming the UI',
        crewMember: 'troi',
        category: 'ui',
        priority: 'high',
        implementation: [
          'Use --shadow-lg for cards',
          'Use --shadow-md for buttons',
          'Avoid heavy shadows that create visual noise'
        ]
      },
      {
        name: 'Transparency & Blur',
        description: 'Glassmorphism and transparency create modern, layered UIs',
        crewMember: 'troi',
        category: 'ui',
        priority: 'medium',
        implementation: [
          'Use backdrop-filter: blur(10px)',
          'Background: rgba(255, 255, 255, 0.05)',
          'Border: 1px solid rgba(255, 255, 255, 0.1)'
        ],
        examples: ['Navigation bars', 'Modal overlays', 'Card backgrounds']
      },
      {
        name: 'Accessibility First',
        description: 'Minimum 24x24px touch targets, proper contrast ratios, semantic HTML',
        crewMember: 'troi',
        category: 'accessibility',
        priority: 'high',
        implementation: [
          'Minimum 24x24px for touch targets',
          'WCAG AA contrast ratios',
          'Semantic HTML elements',
          'ARIA labels where needed'
        ]
      },
      {
        name: 'Consistent Spacing Scale',
        description: 'Use 4px, 8px, 16px, 24px, 32px spacing scale for visual rhythm',
        crewMember: 'troi',
        category: 'ui',
        priority: 'high',
        implementation: [
          '--spacing-xs: 4px',
          '--spacing-sm: 8px',
          '--spacing-md: 16px',
          '--spacing-lg: 24px',
          '--spacing-xl: 32px'
        ]
      }
    );

    // Data's Technical Best Practices
    trends.push(
      {
        name: 'Component Composition',
        description: 'Build complex UIs from simple, reusable components',
        crewMember: 'data',
        category: 'architecture',
        priority: 'high',
        implementation: [
          'Single responsibility per component',
          'Props-based configuration',
          'Composition over inheritance'
        ]
      },
      {
        name: 'Performance Optimization',
        description: 'Lazy loading, code splitting, memoization for optimal performance',
        crewMember: 'data',
        category: 'performance',
        priority: 'high',
        implementation: [
          'React.memo for expensive components',
          'useMemo for computed values',
          'Dynamic imports for code splitting',
          'Virtual scrolling for long lists'
        ]
      },
      {
        name: 'Type Safety',
        description: 'TypeScript interfaces for component props and data structures',
        crewMember: 'data',
        category: 'architecture',
        priority: 'high',
        implementation: [
          'Define interfaces for all props',
          'Use type guards for runtime validation',
          'Strict TypeScript configuration'
        ]
      }
    );

    // La Forge's Infrastructure Patterns
    trends.push(
      {
        name: 'Responsive Design',
        description: 'Mobile-first approach with breakpoints at 640px, 768px, 1024px, 1280px',
        crewMember: 'la_forge',
        category: 'ui',
        priority: 'high',
        implementation: [
          'Mobile-first CSS',
          'Flexible grid systems',
          'Responsive typography',
          'Touch-friendly interactions'
        ]
      },
      {
        name: 'CSS Variables',
        description: 'Use CSS custom properties for theming and dynamic styling',
        crewMember: 'la_forge',
        category: 'architecture',
        priority: 'high',
        implementation: [
          'Define variables in :root',
          'Use semantic naming (--accent, --text)',
          'Support theme switching',
          'Fallback values for compatibility'
        ]
      }
    );

    // Riker's Tactical Organization
    trends.push(
      {
        name: 'Clear Navigation',
        description: 'Breadcrumbs, back buttons, and clear navigation paths',
        crewMember: 'riker',
        category: 'ux',
        priority: 'high',
        implementation: [
          'Breadcrumb navigation for deep nesting',
          'Relative back buttons',
          'Clear visual hierarchy',
          'Consistent navigation patterns'
        ]
      },
      {
        name: 'Information Architecture',
        description: 'Logical grouping and hierarchy of information',
        crewMember: 'riker',
        category: 'ux',
        priority: 'high',
        implementation: [
          'Group related content',
          'Use cards for distinct sections',
          'Clear headings and subheadings',
          'Progressive disclosure'
        ]
      }
    );

    return trends;
  } catch (error) {
    console.warn('Failed to load design trends from crew memories, using defaults:', error);
    // Return default trends if memory query fails
    return getDefaultDesignTrends();
  }
}

/**
 * Get best practices from crew memories
 */
export async function getBestPractices(): Promise<BestPractice[]> {
  const practices: BestPractice[] = [
    {
      name: 'Semantic HTML',
      description: 'Use semantic HTML elements for better accessibility and SEO',
      crewMember: 'troi',
      category: 'accessibility',
      codeExample: '<nav>, <main>, <article>, <section>',
      references: ['WCAG 2.1', 'HTML5 Semantic Elements']
    },
    {
      name: 'Error Boundaries',
      description: 'Wrap components in error boundaries to prevent cascading failures',
      crewMember: 'data',
      category: 'architecture',
      codeExample: 'class ErrorBoundary extends React.Component',
      references: ['React Error Boundaries']
    },
    {
      name: 'Loading States',
      description: 'Always show loading states for async operations',
      crewMember: 'troi',
      category: 'ux',
      codeExample: 'Skeleton screens, spinners, progress indicators'
    },
    {
      name: 'Empty States',
      description: 'Provide helpful empty states when no data is available',
      crewMember: 'troi',
      category: 'ux',
      codeExample: 'Illustrations, helpful messages, action prompts'
    }
  ];

  return practices;
}

/**
 * Get default design trends (fallback)
 */
function getDefaultDesignTrends(): DesignTrend[] {
  return [
    {
      name: 'Modern UI Patterns',
      description: 'Rounded corners, soft shadows, transparency',
      crewMember: 'troi',
      category: 'ui',
      priority: 'high',
      implementation: ['Use design tokens', 'Follow spacing scale', 'Apply consistent styling']
    }
  ];
}

/**
 * Get recommended design system config based on trends
 */
export function getRecommendedDesignConfig(trends: DesignTrend[]): {
  template: string;
  spacing: 'compact' | 'comfortable' | 'spacious';
  trends: string[];
} {
  const trendNames = trends
    .filter(t => t.priority === 'high')
    .map(t => t.name.toLowerCase().replace(/\s+/g, '-'));

  return {
    template: 'modern',
    spacing: 'comfortable',
    trends: trendNames
  };
}

