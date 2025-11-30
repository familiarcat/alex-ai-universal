/**
 * Project Configuration System
 * 
 * Defines configuration for each project's dashboard and website output.
 * This enables the dashboard to be a reusable base that generates unique websites.
 */

function createDefaultProjectConfig(
  projectId,
  projectName,
  businessType = 'platform',
  theme = 'gradient'
) {
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

async function loadProjectConfig(projectId) {
  // In future: load from Supabase or file system
  // For now: return null
  return null;
}

async function saveProjectConfig(config) {
  // In future: save to Supabase or file system
  // For now: no-op
}

module.exports = {
  createDefaultProjectConfig,
  loadProjectConfig,
  saveProjectConfig
};

