/**
 * Project Manager Component
 * 
 * Dashboard component for managing Alex AI projects
 * Allows creating, editing, deleting, and viewing projects
 */

import * as React from 'react';
import { BaseCard, BaseCardProps } from './BaseCard';
import { DashboardComponent, DashboardTheme } from '../types';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status?: 'active' | 'inactive' | 'archived';
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ProjectManagerProps extends Omit<BaseCardProps, 'component' | 'children'> {
  component: DashboardComponent;
  projects?: Project[];
  onProjectCreate?: (project: Partial<Project>) => void;
  onProjectUpdate?: (projectId: string, updates: Partial<Project>) => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectSelect?: (projectId: string) => void;
  editable?: boolean;
}

export function ProjectManager({
  component,
  theme,
  projects = [],
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onProjectSelect,
  editable = false,
  onEdit,
  onDelete,
  className = ''
}: ProjectManagerProps) {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [newProject, setNewProject] = React.useState<Partial<Project>>({
    name: '',
    description: '',
    type: 'alex-ai'
  });
  const [editingProject, setEditingProject] = React.useState<string | null>(null);

  const handleCreate = () => {
    if (newProject.name && onProjectCreate) {
      onProjectCreate(newProject);
      setNewProject({ name: '', description: '', type: 'alex-ai' });
      setShowCreateForm(false);
    }
  };

  const handleUpdate = (projectId: string, updates: Partial<Project>) => {
    if (onProjectUpdate) {
      onProjectUpdate(projectId, updates);
      setEditingProject(null);
    }
  };

  const handleDelete = (projectId: string) => {
    if (onProjectDelete && confirm('Are you sure you want to delete this project?')) {
      onProjectDelete(projectId);
    }
  };

  return (
    <BaseCard
      component={component}
      theme={theme}
      editable={editable}
      onEdit={onEdit}
      onDelete={onDelete}
      className={className}
    >
      <div style={{ marginBottom: '16px' }}>
        {editable && onProjectCreate && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '8px 16px',
              backgroundColor: theme?.colors.primary || '#0070f3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: theme?.typography?.fontSize?.base || '14px'
            }}
          >
            ➕ Create New Project
          </button>
        )}
      </div>

      {showCreateForm && (
        <div style={{
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: theme?.colors.surface || '#f5f5f5',
          borderRadius: '8px',
          border: `1px solid ${theme?.colors.border || '#e0e0e0'}`
        }}>
          <h4 style={{ marginTop: 0, color: theme?.colors.text || '#000000' }}>
            Create New Alex AI Project
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name || ''}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              style={{
                padding: '8px',
                border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
                borderRadius: '4px',
                fontSize: theme?.typography?.fontSize?.base || '14px'
              }}
            />
            <textarea
              placeholder="Description (optional)"
              value={newProject.description || ''}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              style={{
                padding: '8px',
                border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
                borderRadius: '4px',
                fontSize: theme?.typography?.fontSize?.base || '14px',
                minHeight: '60px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCreate}
                disabled={!newProject.name}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme?.colors.primary || '#0070f3',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: newProject.name ? 'pointer' : 'not-allowed',
                  opacity: newProject.name ? 1 : 0.5
                }}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProject({ name: '', description: '', type: 'alex-ai' });
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme?.colors.surface || '#f5f5f5',
                  color: theme?.colors.text || '#000000',
                  border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {projects.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: theme?.colors.textMuted || '#666666'
          }}>
            No projects yet. Create your first project!
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              style={{
                padding: '16px',
                backgroundColor: theme?.colors.surface || '#f5f5f5',
                borderRadius: '8px',
                border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
                cursor: onProjectSelect ? 'pointer' : 'default'
              }}
              onClick={() => onProjectSelect && onProjectSelect(project.id)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: 0,
                    marginBottom: '4px',
                    color: theme?.colors.text || '#000000',
                    fontSize: theme?.typography?.fontSize?.lg || '18px'
                  }}>
                    {project.name}
                  </h4>
                  {project.description && (
                    <p style={{
                      margin: 0,
                      color: theme?.colors.textMuted || '#666666',
                      fontSize: theme?.typography?.fontSize?.sm || '12px'
                    }}>
                      {project.description}
                    </p>
                  )}
                  {project.type && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '2px 8px',
                      backgroundColor: theme?.colors.primary || '#0070f3',
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontSize: theme?.typography?.fontSize?.sm || '12px'
                    }}>
                      {project.type}
                    </span>
                  )}
                </div>
                {editable && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {onProjectUpdate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(editingProject === project.id ? null : project.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: theme?.colors.secondary || '#00d4ff',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️
                      </button>
                    )}
                    {onProjectDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: '#ff4444',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {editingProject === project.id && onProjectUpdate && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: theme?.colors.background || '#ffffff',
                  borderRadius: '4px',
                  border: `1px solid ${theme?.colors.border || '#e0e0e0'}`
                }}>
                  <input
                    type="text"
                    defaultValue={project.name}
                    onBlur={(e) => {
                      if (e.target.value !== project.name) {
                        handleUpdate(project.id, { name: e.target.value });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '8px',
                      border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
                      borderRadius: '4px'
                    }}
                  />
                  <textarea
                    defaultValue={project.description}
                    onBlur={(e) => {
                      if (e.target.value !== project.description) {
                        handleUpdate(project.id, { description: e.target.value });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
                      borderRadius: '4px',
                      minHeight: '60px'
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </BaseCard>
  );
}

