/**
 * Project Configuration System
 * 
 * Defines configuration for each project's dashboard and website output.
 * This enables the dashboard to be a reusable base that generates unique websites.
 * 
 * Reviewed by: Lieutenant Commander La Forge (Infrastructure)
 */

export interface ProjectConfig {
  projectId: string;
  projectName: string;
  businessType: string;
  theme: string;
  
  // Dashboard Configuration
  dashboard: {
    enabled: boolean;
    components: string[]; // Component IDs to include
    layout: 'grid' | 'list' | 'custom';
    showProjectManager: boolean;
    showAnalytics: boolean;
    showWorkflows: boolean;
  };
  
  // Website Output Configuration
  website: {
    enabled: boolean;
    outputPath: string; // Where to generate the website
    exportFormat: 'static' | 'nextjs' | 'react' | 'html';
    pages: string[]; // Pages to generate (about, pricing, features, etc.)
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
    deployment: {
      type: 'static' | 'server' | 'cdn';
      target?: string; // S3, Vercel, Netlify, etc.
    };
  };
  
  // Metadata
  metadata: {
    created: Date;
    updated: Date;
    version: string;
  };
}

/**
 * Default project configuration
 */
export function createDefaultProjectConfig(
  projectId: string,
  projectName: string,
  businessType: string = 'platform',
  theme: string = 'gradient'
): ProjectConfig {
  return {
    projectId,
    projectName,
    businessType,
    theme,
    dashboard: {
      enabled: true,
      components: ['project-manager'], // Default: just project manager
      layout: 'grid',
      showProjectManager: true,
      showAnalytics: false,
      showWorkflows: false
    },
    website: {
      enabled: true,
      outputPath: `./output/${projectId}`,
      exportFormat: 'nextjs',
      pages: ['index', 'about', 'pricing', 'features'],
      seo: {
        title: projectName,
        description: `Professional ${businessType} platform built with Alex AI`,
        keywords: [businessType, 'platform', 'modern', 'professional']
      },
      deployment: {
        type: 'static',
        target: 'vercel'
      }
    },
    metadata: {
      created: new Date(),
      updated: new Date(),
      version: '1.0.0'
    }
  };
}

/**
 * Load project configuration
 */
export async function loadProjectConfig(projectId: string): Promise<ProjectConfig | null> {
  // In future: load from Supabase or file system
  // For now: return default
  return null;
}

/**
 * Save project configuration
 */
export async function saveProjectConfig(config: ProjectConfig): Promise<void> {
  // In future: save to Supabase or file system
  // For now: no-op
}

// Export for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ProjectConfig,
    createDefaultProjectConfig,
    loadProjectConfig,
    saveProjectConfig
  };
}

