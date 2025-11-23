/**
 * Project Dashboard Component
 * 
 * Individual project dashboard for Admin/Client users.
 * Provides content management similar to Squarespace/Wix editor.
 * 
 * Features:
 * - Visual content editor (drag-and-drop)
 * - Live preview
 * - Project settings
 * - Analytics
 * - Deployment controls
 * - User management (project-level)
 * 
 * Reviewed by: Counselor Troi (UX) & Lieutenant Commander La Forge (Implementation)
 */

'use client';

import React, { useState } from 'react';
import { UserRole, RoleBasedAccessControl, Permission } from '../auth/RoleBasedAccess';

export interface ProjectDashboardProps {
  projectId: string;
  projectName: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  canManageContent: boolean;
  canManageSettings: boolean;
  canDeploy: boolean;
}

export function ProjectDashboard({
  projectId,
  projectName,
  user,
  canManageContent,
  canManageSettings,
  canDeploy
}: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'settings' | 'analytics' | 'deploy' | 'users'>('editor');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="project-dashboard min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{projectName}</h1>
              <p className="text-sm text-gray-500">Project Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                user.role === 'project_admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role === 'project_admin' ? 'Project Admin' : 'Project User'}
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
              { id: 'editor', label: 'Editor', icon: '✏️', requires: canManageContent },
              { id: 'preview', label: 'Preview', icon: '👁️', requires: true },
              { id: 'settings', label: 'Settings', icon: '⚙️', requires: canManageSettings },
              { id: 'analytics', label: 'Analytics', icon: '📊', requires: true },
              { id: 'deploy', label: 'Deploy', icon: '🚀', requires: canDeploy },
              { id: 'users', label: 'Users', icon: '👥', requires: canManageSettings }
            ]
            .filter(tab => tab.requires)
            .map(tab => (
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
        {activeTab === 'editor' && (
          <EditorTab projectId={projectId} isEditing={isEditing} setIsEditing={setIsEditing} />
        )}
        {activeTab === 'preview' && (
          <PreviewTab projectId={projectId} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab projectId={projectId} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab projectId={projectId} />
        )}
        {activeTab === 'deploy' && (
          <DeployTab projectId={projectId} />
        )}
        {activeTab === 'users' && (
          <UsersTab projectId={projectId} />
        )}
      </main>
    </div>
  );
}

function EditorTab({ 
  projectId, 
  isEditing, 
  setIsEditing 
}: { 
  projectId: string; 
  isEditing: boolean; 
  setIsEditing: (editing: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Content Editor</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium ${
            isEditing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditing ? '✓ Save Changes' : '✏️ Edit Content'}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          Visual drag-and-drop editor (Squarespace/Wix style) coming soon...
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">📦 Drag components here</p>
          <p className="text-sm text-gray-400">
            Visual editor with live preview will be implemented based on UI/UX analysis
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewTab({ projectId }: { projectId: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Preview</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50">
          <iframe
            src={`/projects/${projectId}`}
            className="w-full h-[600px] border-0 rounded"
            title="Project Preview"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Preview updates in real-time</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Open in New Tab →
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ projectId }: { projectId: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Settings</h2>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            defaultValue={projectId}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>Gradient</option>
            <option>Midnight</option>
            <option>Pastel</option>
            <option>Cyberpunk</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domain
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="example.com"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Settings
        </button>
      </div>
    </div>
  );
}

function AnalyticsTab({ projectId }: { projectId: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Views</h3>
          <span className="text-2xl font-bold">1,234</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Unique Visitors</h3>
          <span className="text-2xl font-bold">892</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bounce Rate</h3>
          <span className="text-2xl font-bold">42%</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Analytics charts and detailed metrics coming soon...</p>
      </div>
    </div>
  );
}

function DeployTab({ projectId }: { projectId: string }) {
  const [deploying, setDeploying] = useState(false);
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Deploy to AWS</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Deployment Status</h3>
          <div className="flex items-center space-x-4">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">Last deployed: 2 hours ago</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Deployment Options</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="radio" name="deploy-type" value="s3" className="mr-2" defaultChecked />
              <span>Deploy to S3 + CloudFront</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="deploy-type" value="lambda" className="mr-2" />
              <span>Deploy as Lambda Function</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="deploy-type" value="ec2" className="mr-2" />
              <span>Deploy to EC2 Instance</span>
            </label>
          </div>
        </div>
        
        <button
          onClick={() => setDeploying(true)}
          disabled={deploying}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {deploying ? 'Deploying...' : '🚀 Deploy Now'}
        </button>
      </div>
    </div>
  );
}

function UsersTab({ projectId }: { projectId: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Project Users</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Add User
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">User management for this project...</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">admin@example.com</p>
              <p className="text-sm text-gray-500">Project Admin</p>
            </div>
            <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
}

