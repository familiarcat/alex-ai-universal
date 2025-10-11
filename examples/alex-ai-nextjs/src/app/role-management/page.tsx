'use client'

import { useState } from 'react'
import HoverTooltip from '@/components/HoverTooltip'
import { hoverDescriptions } from '@/data/hoverDescriptions'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
  icon: string
}

const roles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with administrative privileges',
    permissions: ['user_management', 'system_config', 'security_monitoring', 'data_access', 'crew_management'],
    color: 'bg-red-600',
    icon: '🔐'
  },
  {
    id: 'user',
    name: 'Standard User',
    description: 'Standard access with crew interaction capabilities',
    permissions: ['crew_interaction', 'dashboard_view', 'theme_customization', 'navigation_access'],
    color: 'bg-blue-600',
    icon: '👤'
  },
  {
    id: 'public',
    name: 'Public Viewer',
    description: 'Read-only access to public information',
    permissions: ['public_view', 'theme_view'],
    color: 'bg-green-600',
    icon: '👁️'
  },
  {
    id: 'crew_member',
    name: 'Crew Member',
    description: 'Specialized crew member with specific capabilities',
    permissions: ['crew_operations', 'mission_participation', 'data_analysis', 'system_interaction'],
    color: 'bg-purple-600',
    icon: '🖖'
  }
]

const permissions = [
  { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete user accounts' },
  { id: 'system_config', name: 'System Configuration', description: 'Modify system settings and configurations' },
  { id: 'security_monitoring', name: 'Security Monitoring', description: 'Monitor security events and access logs' },
  { id: 'data_access', name: 'Data Access', description: 'Access to all system data and databases' },
  { id: 'crew_management', name: 'Crew Management', description: 'Manage crew members and assignments' },
  { id: 'crew_interaction', name: 'Crew Interaction', description: 'Interact with crew members and view status' },
  { id: 'dashboard_view', name: 'Dashboard View', description: 'View dashboard and system overview' },
  { id: 'theme_customization', name: 'Theme Customization', description: 'Customize themes and visual settings' },
  { id: 'navigation_access', name: 'Navigation Access', description: 'Access to navigation features' },
  { id: 'public_view', name: 'Public View', description: 'View public information only' },
  { id: 'theme_view', name: 'Theme View', description: 'View theme options' },
  { id: 'crew_operations', name: 'Crew Operations', description: 'Participate in crew operations' },
  { id: 'mission_participation', name: 'Mission Participation', description: 'Participate in missions and tasks' },
  { id: 'data_analysis', name: 'Data Analysis', description: 'Analyze data and generate reports' },
  { id: 'system_interaction', name: 'System Interaction', description: 'Interact with system components' }
]

export default function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setEditingRole(null)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
  }

  const getPermissionDescription = (permissionId: string) => {
    return permissions.find(p => p.id === permissionId)?.description || 'Unknown permission'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔐 Role-Based Access Control
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Manage user roles, permissions, and access controls for the Alex AI Universal system.
            Configure granular permissions and role-based navigation for enhanced security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Role Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Available Roles</h2>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedRole?.id === role.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{role.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{role.name}</h3>
                        <p className="text-sm text-gray-300">{role.description}</p>
                      </div>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mt-2 ${role.color}`}>
                      {role.permissions.length} permissions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedRole.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedRole.name}</h2>
                      <p className="text-gray-300">{selectedRole.description}</p>
                    </div>
                  </div>
                  <HoverTooltip
                    title={hoverDescriptions['edit-role'].title}
                    description={hoverDescriptions['edit-role'].description}
                    status={hoverDescriptions['edit-role'].status}
                    implementationLevel={hoverDescriptions['edit-role'].implementationLevel}
                    requirements={hoverDescriptions['edit-role'].requirements}
                  >
                    <button
                      onClick={() => handleEditRole(selectedRole)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    >
                      ✏️ Edit Role
                    </button>
                  </HoverTooltip>
                </div>

                {/* Permissions Grid */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRole.permissions.map((permissionId) => (
                      <div
                        key={permissionId}
                        className="bg-white/5 border border-white/10 rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">✅</span>
                          <div>
                            <h4 className="text-white font-medium">
                              {permissions.find(p => p.id === permissionId)?.name || permissionId}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {getPermissionDescription(permissionId)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{selectedRole.permissions.length}</div>
                    <div className="text-sm text-gray-300">Total Permissions</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedRole.permissions.includes('user_management') ? 'High' : 'Standard'}
                    </div>
                    <div className="text-sm text-gray-300">Access Level</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedRole.id === 'admin' ? 'Full' : selectedRole.id === 'public' ? 'Read' : 'Write'}
                    </div>
                    <div className="text-sm text-gray-300">Access Type</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-white mb-4">Select a Role</h2>
                <p className="text-gray-300">
                  Choose a role from the left panel to view detailed information about permissions and access levels.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Role Management Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Role Management Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <HoverTooltip
              title={hoverDescriptions['create-role'].title}
              description={hoverDescriptions['create-role'].description}
              status={hoverDescriptions['create-role'].status}
              implementationLevel={hoverDescriptions['create-role'].implementationLevel}
              requirements={hoverDescriptions['create-role'].requirements}
            >
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                ➕ Create New Role
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['assign-roles'].title}
              description={hoverDescriptions['assign-roles'].description}
              status={hoverDescriptions['assign-roles'].status}
              implementationLevel={hoverDescriptions['assign-roles'].implementationLevel}
              requirements={hoverDescriptions['assign-roles'].requirements}
            >
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                👥 Assign Roles
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['audit-access'].title}
              description={hoverDescriptions['audit-access'].description}
              status={hoverDescriptions['audit-access'].status}
              implementationLevel={hoverDescriptions['audit-access'].implementationLevel}
              requirements={hoverDescriptions['audit-access'].requirements}
            >
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                🔍 Audit Access
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['security-settings'].title}
              description={hoverDescriptions['security-settings'].description}
              status={hoverDescriptions['security-settings'].status}
              implementationLevel={hoverDescriptions['security-settings'].implementationLevel}
              requirements={hoverDescriptions['security-settings'].requirements}
            >
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                🛡️ Security Settings
              </button>
            </HoverTooltip>
          </div>
        </div>
      </div>
    </div>
  )
}




