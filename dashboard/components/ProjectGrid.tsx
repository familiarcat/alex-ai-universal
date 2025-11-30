/**
 * 🖖 Project Grid Component
 * 
 * Master Dashboard: Visual grid of all projects
 * Shows project cards with quick actions
 * 
 * Crew: Counselor Troi (UX) + Commander Riker (Tactical)
 */

'use client';

import { useAppState } from '@/lib/state-manager';
import Link from 'next/link';
import { useState } from 'react';

interface ProjectCardProps {
  projectId: string;
  project: any;
  onDelete: (projectId: string) => void;
}

function ProjectCard({ projectId, project, onDelete }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 8px 24px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Project Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--heading)',
              marginBottom: '8px',
            }}
          >
            {project.headline || 'Untitled Project'}
          </h3>
          {project.subheadline && (
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--text-secondary)',
                opacity: 0.8,
              }}
            >
              {project.subheadline}
            </p>
          )}
        </div>
        <div
          style={{
            padding: '4px 12px',
            background: project.projectType === 'creative' ? 'var(--accent)' : 'var(--card-alt)',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            color: project.projectType === 'creative' ? 'var(--button-text)' : 'var(--text)',
          }}
        >
          {project.projectType || 'business'}
        </div>
      </div>

      {/* Project Description */}
      {project.description && (
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>
      )}

      {/* Template Badge */}
      {(project as any).template_id && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>📋</span>
          <span>Template: {(project as any).template_id}</span>
          {(project as any).variations &&
            Object.keys((project as any).variations).length > 0 && (
              <span style={{ marginLeft: '8px', color: 'var(--accent)' }}>
                ✏️ Customized
              </span>
            )}
        </div>
      )}

      {/* Quick Actions */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <Link
          href={`/dashboard/projects/${projectId}`}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'var(--accent)',
            color: 'var(--button-text)',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Edit
        </Link>
        <Link
          href={`/projects/${projectId}`}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'var(--card-alt)',
            color: 'var(--text)',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            textAlign: 'center',
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--card-alt)';
          }}
        >
          Preview
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete project "${project.headline}"?`)) {
              onDelete(projectId);
            }
          }}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--error)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'var(--error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default function ProjectGrid() {
  const { projects, deleteProject } = useAppState();
  const [filter, setFilter] = useState<'all' | 'business' | 'creative'>('all');

  const projectEntries = Object.entries(projects || {});
  const filteredProjects =
    filter === 'all'
      ? projectEntries
      : projectEntries.filter(([_, project]) => project.projectType === filter);

  return (
    <div style={{ width: '100%' }}>
      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              background: filter === 'all' ? 'var(--accent)' : 'var(--card-alt)',
              color: filter === 'all' ? 'var(--button-text)' : 'var(--text)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All ({projectEntries.length})
          </button>
          <button
            onClick={() => setFilter('business')}
            style={{
              padding: '8px 16px',
              background: filter === 'business' ? 'var(--accent)' : 'var(--card-alt)',
              color: filter === 'business' ? 'var(--button-text)' : 'var(--text)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Business ({projectEntries.filter(([_, p]) => p.projectType === 'business').length})
          </button>
          <button
            onClick={() => setFilter('creative')}
            style={{
              padding: '8px 16px',
              background: filter === 'creative' ? 'var(--accent)' : 'var(--card-alt)',
              color: filter === 'creative' ? 'var(--button-text)' : 'var(--text)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Creative ({projectEntries.filter(([_, p]) => p.projectType === 'creative').length})
          </button>
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            background: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            No projects found
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {filter === 'all'
              ? 'Create your first project to get started'
              : `No ${filter} projects found`}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredProjects.map(([projectId, project]) => (
            <ProjectCard
              key={projectId}
              projectId={projectId}
              project={project}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

