/**
 * Universal Theme Manager
 * Manages themes for dashboard and all projects independently
 * Allows global theme updates that propagate to all users
 */

const { THEME_DEFINITIONS } = require('./theme-definitions');
const fs = require('fs');
const path = require('path');

class UniversalThemeManager {
  constructor() {
    this.themesPath = path.join(__dirname, 'project-themes.json');
    this.loadProjectThemes();
  }

  loadProjectThemes() {
    try {
      if (fs.existsSync(this.themesPath)) {
        const data = fs.readFileSync(this.themesPath, 'utf8');
        this.projectThemes = JSON.parse(data);
      } else {
        // Default theme assignments
        this.projectThemes = {
          dashboard: 'midnight',
          alpha: 'gradient',
          beta: 'pastel',
          gamma: 'cyberpunk'
        };
        this.saveProjectThemes();
      }
    } catch (error) {
      console.error('Error loading project themes:', error);
      this.projectThemes = {
        dashboard: 'midnight',
        alpha: 'gradient',
        beta: 'pastel',
        gamma: 'cyberpunk'
      };
    }
  }

  saveProjectThemes() {
    try {
      fs.writeFileSync(this.themesPath, JSON.stringify(this.projectThemes, null, 2));
    } catch (error) {
      console.error('Error saving project themes:', error);
    }
  }

  // Get theme for a specific project
  getProjectTheme(projectId) {
    return this.projectThemes[projectId] || 'glassmorphism';
  }

  // Set theme for a specific project
  setProjectTheme(projectId, themeId) {
    if (!THEME_DEFINITIONS[themeId]) {
      throw new Error(`Theme ${themeId} not found`);
    }
    this.projectThemes[projectId] = themeId;
    this.saveProjectThemes();
    return this.getThemeCSS(themeId);
  }

  // Get all available themes
  getAllThemes() {
    return Object.entries(THEME_DEFINITIONS).map(([id, theme]) => ({
      id,
      name: theme.name,
      icon: theme.icon,
      description: theme.description,
      category: theme.category
    }));
  }

  // Get CSS for a specific theme
  getThemeCSS(themeId) {
    const theme = THEME_DEFINITIONS[themeId];
    if (!theme) return {};
    return theme.css;
  }

  // Get complete theme definition
  getThemeDefinition(themeId) {
    return THEME_DEFINITIONS[themeId];
  }

  // Get all project theme assignments
  getAllProjectThemes() {
    return Object.entries(this.projectThemes).map(([projectId, themeId]) => ({
      projectId,
      themeId,
      themeName: THEME_DEFINITIONS[themeId]?.name || 'Unknown',
      themeIcon: THEME_DEFINITIONS[themeId]?.icon || '🎨'
    }));
  }

  // Generate inline CSS for a project
  generateInlineCSS(projectId) {
    const themeId = this.getProjectTheme(projectId);
    const css = this.getThemeCSS(themeId);
    
    let styles = ':root {\n';
    for (const [key, value] of Object.entries(css)) {
      styles += `  ${key}: ${value};\n`;
    }
    styles += '}';
    
    return styles;
  }

  // Global theme update - updates definition and all projects using it get new styles
  updateThemeDefinition(themeId, updates) {
    if (!THEME_DEFINITIONS[themeId]) {
      throw new Error(`Theme ${themeId} not found`);
    }
    
    // Merge updates into theme definition
    Object.assign(THEME_DEFINITIONS[themeId].css, updates);
    
    // Find all projects using this theme
    const affectedProjects = Object.entries(this.projectThemes)
      .filter(([_, theme]) => theme === themeId)
      .map(([projectId, _]) => projectId);
    
    return {
      themeId,
      affectedProjects,
      message: `Theme ${themeId} updated. ${affectedProjects.length} projects will receive updates.`
    };
  }
}

module.exports = UniversalThemeManager;

