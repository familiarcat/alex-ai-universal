/**
 * Global Dashboard Component
 * 
 * Super User dashboard for managing all projects, AWS resources, users, and Scrum workflows.
 * 
 * Features:
 * - Project management (create, delete, configure)
 * - AWS resource management
 * - User management
 * - Agile Scrum workflow overview
 * - System health monitoring
 * 
 * Reviewed by: Counselor Troi (UX) & Commander Data (Architecture)
 */

'use client';

import React, { useState } from 'react';
import { UserRole, RoleBasedAccessControl } from '../auth/RoleBasedAccess';

export interface GlobalDashboardProps {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  projects: Array<{
    id: string;
    name: string;
    status: string;
    hostingStatus?: string;
    createdAt: Date;
  }>;
}

export function GlobalDashboard({ user, projects }: GlobalDashboardProps) {
  // Verify super user access
  if (!RoleBasedAccessControl.hasPermission(user, 'manage_all_projects')) {
    return <div>Access Denied: Super User privileges required</div>;
  }

  const [activeTab, setActiveTab] = useState<'projects' | 'aws' | 'users' | 'scrum' | 'health'>('projects');

  return (
    <div className="global-dashboard min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global Dashboard</h1>
              <p className="text-sm text-gray-500">Super User Control Center</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Super User
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'projects', label: 'Projects', icon: '📁' },
              { id: 'aws', label: 'AWS Resources', icon: '☁️' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'scrum', label: 'Scrum Workflows', icon: '📋' },
              { id: 'health', label: 'System Health', icon: '💊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'projects' && (
          <ProjectsTab projects={projects} />
        )}
        {activeTab === 'aws' && (
          <AWSTab />
        )}
        {activeTab === 'users' && (
          <UsersTab />
        )}
        {activeTab === 'scrum' && (
          <ScrumTab projects={projects} />
        )}
        {activeTab === 'health' && (
          <HealthTab />
        )}
      </main>
    </div>
  );
}

function ProjectsTab({ projects }: { projects: GlobalDashboardProps['projects'] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Create Project
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
            <p className="text-sm text-gray-500 mb-4">ID: {project.id}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded ${
                project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Manage →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AWSTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">AWS Resources</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">AWS resource management interface coming soon...</p>
        <ul className="mt-4 space-y-2">
          <li>• S3 Bucket Management</li>
          <li>• CloudFront Distribution Management</li>
          <li>• Lambda Function Management</li>
          <li>• Route53 DNS Management</li>
          <li>• Cost Monitoring</li>
        </ul>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Users</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Add User
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">User management interface coming soon...</p>
        <ul className="mt-4 space-y-2">
          <li>• User list with roles</li>
          <li>• Project access management</li>
          <li>• Role assignment</li>
          <li>• Activity logs</li>
        </ul>
      </div>
    </div>
  );
}

function ScrumTab({ projects }: { projects: GlobalDashboardProps['projects'] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Scrum Workflows</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{project.name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Sprint:</span>
                <span className="text-sm font-medium">Sprint 1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Velocity:</span>
                <span className="text-sm font-medium">12 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Backlog Items:</span>
                <span className="text-sm font-medium">8</span>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              View Scrum Board →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">System Status</h3>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-lg font-semibold">Healthy</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Projects</h3>
          <span className="text-2xl font-bold">12</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
          <span className="text-2xl font-bold">45</span>
        </div>
      </div>
    </div>
  );
}

