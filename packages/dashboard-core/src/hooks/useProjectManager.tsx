/**
 * useProjectManager Hook
 * 
 * Hook for managing Alex AI projects
 * Provides project CRUD operations and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { Project } from '../components/ProjectManager';

export interface UseProjectManagerOptions {
  storageKey?: string;
  autoSave?: boolean;
  onProjectChange?: (projects: Project[]) => void;
}

export interface UseProjectManagerReturn {
  projects: Project[];
  createProject: (project: Partial<Project>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  getProject: (projectId: string) => Project | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useProjectManager(options: UseProjectManagerOptions = {}): UseProjectManagerReturn {
  const {
    storageKey = 'alex-ai-projects',
    autoSave = true,
    onProjectChange
  } = options;

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load projects from storage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProjects(Array.isArray(parsed) ? parsed : []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load projects'));
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Save projects to storage
  const saveProjects = useCallback((updatedProjects: Project[]) => {
    if (autoSave && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedProjects));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save projects'));
      }
    }
    if (onProjectChange) {
      onProjectChange(updatedProjects);
    }
  }, [storageKey, autoSave, onProjectChange]);

  // Create project
  const createProject = useCallback((project: Partial<Project>): Project => {
    const newProject: Project = {
      id: project.id || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: project.name || 'Untitled Project',
      description: project.description,
      type: project.type || 'alex-ai',
      status: project.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...project
    };

    setProjects(prev => {
      const updated = [...prev, newProject];
      saveProjects(updated);
      return updated;
    });

    return newProject;
  }, [saveProjects]);

  // Update project
  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const updated = prev.map(project =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      );
      saveProjects(updated);
      return updated;
    });
  }, [saveProjects]);

  // Delete project
  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => {
      const updated = prev.filter(project => project.id !== projectId);
      saveProjects(updated);
      return updated;
    });
  }, [saveProjects]);

  // Get project
  const getProject = useCallback((projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  }, [projects]);

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    isLoading,
    error
  };
}

