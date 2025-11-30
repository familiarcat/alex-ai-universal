/**
 * 🖖 Template System
 * 
 * Manages project templates and variation detection
 * Architecture: Template (baseline) + Variations (customizations)
 * 
 * Crew: Commander Data (Architecture) + Lieutenant Commander La Forge (Implementation)
 */

export interface ProjectTemplate {
  template_id: string;
  name: string;
  description?: string;
  type: 'business' | 'creative' | 'ecommerce' | 'saas';
  version: string;
  base_config: {
    headline: string;
    subheadline?: string;
    description?: string;
    theme: string;
    project_type: string;
    [key: string]: any;
  };
  base_components: any[];
  default_theme: string;
  variation_fields: string[];
  locked_fields: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProjectVariations {
  [field: string]: any;
}

export interface ProjectInstance {
  project_id: string;
  template_id: string | null;
  template_version: string | null;
  variations: ProjectVariations;
  template_customizations?: {
    componentOverrides?: any[];
    themeOverrides?: any;
  };
  // Original project fields (for backward compatibility)
  headline?: string;
  subheadline?: string;
  description?: string;
  theme?: string;
  project_type?: string;
  components?: any[];
}

/**
 * Get merged project data (template baseline + variations)
 */
export function getMergedProjectData(
  template: ProjectTemplate | null,
  project: ProjectInstance
): {
  headline: string;
  subheadline?: string;
  description?: string;
  theme: string;
  project_type: string;
  components: any[];
  [key: string]: any;
} {
  // If no template, return project data as-is (backward compatibility)
  if (!template) {
    return {
      headline: project.headline || 'Untitled Project',
      subheadline: project.subheadline,
      description: project.description,
      theme: project.theme || 'midnight',
      project_type: project.project_type || 'business',
      components: project.components || [],
    };
  }

  // Start with template baseline
  const merged = {
    ...template.base_config,
    components: [...template.base_components],
  };

  // Apply variations (variations override template)
  Object.keys(project.variations).forEach((field) => {
    if (field === 'components') {
      // Special handling for components: merge arrays
      const variationComponents = project.variations.components;
      if (Array.isArray(variationComponents)) {
        merged.components = variationComponents;
      }
    } else {
      merged[field] = project.variations[field];
    }
  });

  return merged;
}

/**
 * Detect variations (what differs from template)
 */
export function detectVariations(
  template: ProjectTemplate | null,
  projectData: {
    headline?: string;
    subheadline?: string;
    description?: string;
    theme?: string;
    components?: any[];
    [key: string]: any;
  }
): ProjectVariations {
  if (!template) {
    // No template = everything is a variation
    return {
      headline: projectData.headline,
      subheadline: projectData.subheadline,
      description: projectData.description,
      theme: projectData.theme,
      components: projectData.components,
    };
  }

  const variations: ProjectVariations = {};

  // Check each field that can be varied
  template.variation_fields.forEach((field) => {
    const templateValue = template.base_config[field];
    const projectValue = projectData[field];

    // Special handling for components
    if (field === 'components') {
      const templateComponents = template.base_components;
      const projectComponents = projectData.components || [];
      
      // Compare component arrays (deep comparison)
      if (JSON.stringify(templateComponents) !== JSON.stringify(projectComponents)) {
        variations.components = projectComponents;
      }
    } else if (templateValue !== projectValue) {
      // Field differs from template
      variations[field] = projectValue;
    }
  });

  return variations;
}

/**
 * Check if a field is locked (cannot be customized)
 */
export function isFieldLocked(template: ProjectTemplate | null, field: string): boolean {
  if (!template) return false;
  return template.locked_fields.includes(field);
}

/**
 * Check if a field can be varied
 */
export function canVaryField(template: ProjectTemplate | null, field: string): boolean {
  if (!template) return true; // No template = all fields can be varied
  if (isFieldLocked(template, field)) return false;
  return template.variation_fields.includes(field);
}

/**
 * Reset field to template baseline
 */
export function resetToTemplate(
  template: ProjectTemplate | null,
  field: string
): any {
  if (!template) return null;
  return template.base_config[field];
}

/**
 * Get template by ID (from Supabase via n8n)
 */
export async function getTemplate(templateId: string): Promise<ProjectTemplate | null> {
  try {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_API_URL || 'https://n8n.pbradygeorgen.com';
    const response = await fetch(`${n8nUrl}/webhook/get-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId }),
    });

    if (!response.ok) {
      console.warn(`Failed to fetch template ${templateId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.template || null;
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    return null;
  }
}

/**
 * Get all active templates
 */
export async function getAllTemplates(
  type?: 'business' | 'creative' | 'ecommerce' | 'saas'
): Promise<ProjectTemplate[]> {
  try {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_API_URL || 'https://n8n.pbradygeorgen.com';
    const response = await fetch(`${n8nUrl}/webhook/get-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, is_active: true }),
    });

    if (!response.ok) {
      console.warn(`Failed to fetch templates: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

