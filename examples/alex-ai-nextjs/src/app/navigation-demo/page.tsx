'use client'

import { useState } from 'react'

export default function NavigationDemo() {
  const [selectedRole, setSelectedRole] = useState<'public' | 'user' | 'admin'>('user')

  const roles = [
    {
      id: 'public',
      name: 'Public User',
      description: 'Limited access to public features and information',
      color: 'green',
      icon: '👁️',
      permissions: [
        'View public dashboard',
        'Access documentation',
        'View system status',
        'Contact support'
      ]
    },
    {
      id: 'user',
      name: 'Standard User',
      description: 'Full access to standard features and crew interactions',
      color: 'blue',
      icon: '👤',
      permissions: [
        'Access full dashboard',
        'Interact with crew members',
        'Configure basic settings',
        'View crew status',
        'Use contrast testing',
        'Access health monitoring'
      ]
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Complete system control and administrative capabilities',
      color: 'red',
      icon: '🔐',
      permissions: [
        'All user permissions',
        'System administration',
        'Crew management',
        'Theme management',
        'Security controls',
        'System logs access',
        'Database operations',
        'Emergency controls'
      ]
    }
  ]

  const currentRole = roles.find(role => role.id === selectedRole) || roles[1]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🧭 Navigation System Demo
        </h1>
        <p className="text-xl text-gray-300">
          Explore the role-based navigation system with different access levels
        </p>
      </div>

      {/* Role Selector */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Role Selection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id as 'public' | 'user' | 'admin')}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedRole === role.id
                  ? `border-${role.color}-400 bg-${role.color}-500/20`
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{role.icon}</span>
                <h3 className="text-lg font-bold text-white">{role.name}</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">{role.description}</p>
              <div className="text-xs text-gray-400">
                Click to select this role
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Role Info */}
      <div className={`bg-white/10 backdrop-blur-sm border-2 border-${currentRole.color}-400 rounded-xl p-6`}>
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-4xl">{currentRole.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{currentRole.name}</h2>
            <p className="text-gray-300">{currentRole.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Navigation */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Available Navigation</h3>
            <div className="space-y-2">
              {/* Primary Navigation */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-400 mb-2">Primary Navigation</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    🎛️ Dashboard
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    🌐 Live Frontend
                  </span>
                  {selectedRole === 'admin' && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                      🔐 Admin Panel
                    </span>
                  )}
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    👁️ Public View
                  </span>
                </div>
              </div>

              {/* Secondary Navigation */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-400 mb-2">Secondary Navigation</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">
                    🏥 Health Check
                  </span>
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">
                    ⚙️ Configuration
                  </span>
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">
                    👥 Crew Status
                  </span>
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-sm">
                    🎨 Contrast Test
                  </span>
                  {selectedRole === 'admin' && (
                    <>
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                        🎨 Theme Manager
                      </span>
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                        🧭 Navigation Demo
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Permissions & Access</h3>
            <div className="space-y-2">
              {currentRole.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span className="text-gray-300 text-sm">{permission}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Features */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Navigation Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Based Access</h3>
            <p className="text-gray-300 text-sm">
              Navigation adapts dynamically based on user role and permissions.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="text-lg font-bold text-white mb-2">Responsive Design</h3>
            <p className="text-gray-300 text-sm">
              Optimized for all screen sizes with mobile-first approach.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-white mb-2">Theme Integration</h3>
            <p className="text-gray-300 text-sm">
              Navigation seamlessly integrates with all available themes.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Updates</h3>
            <p className="text-gray-300 text-sm">
              Connection status and crew information update in real-time.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-white mb-2">Active State</h3>
            <p className="text-gray-300 text-sm">
              Clear visual indication of current page and active navigation.
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl mb-3">♿</div>
            <h3 className="text-lg font-bold text-white mb-2">Accessibility</h3>
            <p className="text-gray-300 text-sm">
              Full keyboard navigation and screen reader support.
            </p>
          </div>
        </div>
      </div>

      {/* Implementation Details */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Implementation Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Technical Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Next.js 15 App Router with TypeScript</li>
              <li>• Client-side navigation with usePathname hook</li>
              <li>• Dynamic role-based component rendering</li>
              <li>• Tailwind CSS for responsive styling</li>
              <li>• Real-time connection status monitoring</li>
              <li>• Theme-aware color system</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Security Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Role-based access control (RBAC)</li>
              <li>• Permission-based navigation filtering</li>
              <li>• Secure admin panel isolation</li>
              <li>• Public view with limited access</li>
              <li>• Session-based role management</li>
              <li>• Audit logging for admin actions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Actions */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Try Different Views</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all">
            🎛️ View Dashboard
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all">
            🌐 View Live Frontend
          </button>
          {selectedRole === 'admin' && (
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all">
              🔐 View Admin Panel
            </button>
          )}
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all">
            👁️ View Public Page
          </button>
        </div>
      </div>
    </div>
  )
}
