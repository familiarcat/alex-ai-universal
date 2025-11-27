/**
 * 🖖 Variation Manager
 * 
 * React hooks and utilities for managing project variations
 * Used in project-specific dashboards
 * 
 * Crew: Counselor Troi (UX) + Commander Data (Logic)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ProjectTemplate,
  ProjectVariations,
  getMergedProjectData,
  detectVariations,
  canVaryField,
  isFieldLocked,
  resetToTemplate,
  getTemplate,
} from './template-system';
import { useAppState } from './state-manager';

export interface VariationState {
  template: ProjectTemplate | null;
  variations: ProjectVariations;
  mergedData: any;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to manage project variations
 */
export function useProjectVariations(projectId: string): {
  state: VariationState;
  updateVariation: (field: string, value: any) => void;
  resetField: (field: string) => void;
  resetAll: () => void;
  hasVariations: boolean;
  getFieldValue: (field: string) => any;
  isFieldCustomized: (field: string) => boolean;
} {
  const { projects } = useAppState();
  const project = projects[projectId];

  const [state, setState] = useState<VariationState>({
    template: null,
    variations: {},
    mergedData: null,
    isLoading: true,
    error: null,
  });

  // Load template and compute variations
  useEffect(() => {
    if (!project) {
      setState((prev) => ({ ...prev, isLoading: false, error: 'Project not found' }));
      return;
    }

    const loadTemplate = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Get template
        const templateId = (project as any).template_id || null;
        const template = templateId ? await getTemplate(templateId) : null;

        // Get current variations from project
        const variations = (project as any).variations || {};

        // Compute merged data
        const mergedData = getMergedProjectData(template, {
          project_id: projectId,
          template_id: templateId,
          template_version: (project as any).template_version || null,
          variations,
          headline: project.headline,
          subheadline: project.subheadline,
          description: project.description,
          theme: project.theme,
          project_type: project.projectType,
          components: project.components,
        });

        setState({
          template,
          variations,
          mergedData,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error loading template:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load template',
        }));
      }
    };

    loadTemplate();
    // Only depend on projectId and key project fields to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, project?.headline, project?.theme, (project as any)?.template_id, (project as any)?.variations]);

  // Update a variation
  const updateVariation = useCallback(
    (field: string, value: any) => {
      if (!state.template) {
        // No template = update project directly
        // This will be handled by state manager
        return;
      }

      if (!canVaryField(state.template, field)) {
        console.warn(`Field ${field} cannot be varied (locked or not in variation_fields)`);
        return;
      }

      const newVariations = {
        ...state.variations,
        [field]: value,
      };

      setState((prev) => ({
        ...prev,
        variations: newVariations,
        mergedData: getMergedProjectData(prev.template, {
          project_id: projectId,
          template_id: prev.template?.template_id || null,
          template_version: (project as any).template_version || null,
          variations: newVariations,
          headline: project.headline,
          subheadline: project.subheadline,
          description: project.description,
          theme: project.theme,
          project_type: project.projectType,
          components: project.components,
        }),
      }));
    },
    [state.template, state.variations, projectId, project?.headline, project?.subheadline, project?.description, project?.theme, project?.projectType, project?.components]
  );

  // Reset a field to template baseline
  const resetField = useCallback(
    (field: string) => {
      if (!state.template) return;

      const newVariations = { ...state.variations };
      delete newVariations[field];

      setState((prev) => ({
        ...prev,
        variations: newVariations,
        mergedData: getMergedProjectData(prev.template, {
          project_id: projectId,
          template_id: prev.template?.template_id || null,
          template_version: (project as any).template_version || null,
          variations: newVariations,
          headline: project.headline,
          subheadline: project.subheadline,
          description: project.description,
          theme: project.theme,
          project_type: project.projectType,
          components: project.components,
        }),
      }));
    },
    [state.template, state.variations, projectId, project?.headline, project?.subheadline, project?.description, project?.theme, project?.projectType, project?.components]
  );

  // Reset all variations
  const resetAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      variations: {},
      mergedData: getMergedProjectData(prev.template, {
        project_id: projectId,
        template_id: prev.template?.template_id || null,
        template_version: (project as any).template_version || null,
        variations: {},
        headline: project.headline,
        subheadline: project.subheadline,
        description: project.description,
        theme: project.theme,
        project_type: project.projectType,
        components: project.components,
      }),
    }));
  }, [state.template, projectId, project?.headline, project?.subheadline, project?.description, project?.theme, project?.projectType, project?.components]);

  // Get field value (from merged data)
  const getFieldValue = useCallback(
    (field: string) => {
      return state.mergedData?.[field] ?? null;
    },
    [state.mergedData]
  );

  // Check if field is customized
  const isFieldCustomized = useCallback(
    (field: string) => {
      return field in state.variations;
    },
    [state.variations]
  );

  const hasVariations = Object.keys(state.variations).length > 0;

  return {
    state,
    updateVariation,
    resetField,
    resetAll,
    hasVariations,
    getFieldValue,
    isFieldCustomized,
  };
}

