'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import HoverTooltip from './HoverTooltip'
import { hoverDescriptions } from '../data/hoverDescriptions'
import ThemeSelector from './ThemeSelector'

interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'inactive'
}

const crewMembers: CrewMember[] = [
  {
    id: 'captain_picard',
    name: 'Captain Jean-Luc Picard',
    role: 'Strategic Commander',
    specialization: ['Strategic Leadership', 'Mission Planning', 'Decision Making'],
    status: 'active'
  },
  {
    id: 'commander_riker',
    name: 'Commander William Riker',
    role: 'First Officer',
    specialization: ['Tactical Operations', 'Workflow Management', 'Execution'],
    status: 'active'
  },
  {
    id: 'commander_data',
    name: 'Commander Data',
    role: 'Operations Officer',
    specialization: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
    status: 'active'
  },
  {
    id: 'geordi_la_forge',
    name: 'Lieutenant Commander Geordi La Forge',
    role: 'Chief Engineer',
    specialization: ['Infrastructure', 'System Integration', 'Technical Solutions'],
    status: 'active'
  },
  {
    id: 'lieutenant_worf',
    name: 'Lieutenant Worf',
    role: 'Security Officer',
    specialization: ['Security Protocols', 'Threat Assessment', 'Compliance'],
    status: 'active'
  },
  {
    id: 'counselor_troi',
    name: 'Counselor Deanna Troi',
    role: 'Ship\'s Counselor',
    specialization: ['User Experience', 'Communication', 'Team Dynamics'],
    status: 'active'
  },
  {
    id: 'dr_crusher',
    name: 'Dr. Beverly Crusher',
    role: 'Chief Medical Officer',
    specialization: ['System Health', 'Diagnostics', 'Wellness'],
    status: 'active'
  },
  {
    id: 'lieutenant_uhura',
    name: 'Lieutenant Uhura',
    role: 'Communications Officer',
    specialization: ['Communication Protocols', 'Synchronization', 'Integration'],
    status: 'active'
  },
  {
    id: 'quark',
    name: 'Quark',
    role: 'Business Operations',
    specialization: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics'],
    status: 'active'
  }
]

export default function UniversalNavigation() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'public'>('user')
  const [isConnected, setIsConnected] = useState(true)

  const isActive = (path: string) => pathname === path
  const isAdmin = userRole === 'admin'
  const isPublic = userRole === 'public'

  return (
    <nav className="nav-enhanced backdrop-blur-sm relative z-[10000]"
         style={{ 
           background: 'var(--nav-bg-color)',
           color: 'var(--nav-text-color)',
           borderBottom: `2px solid var(--nav-border-color)` 
         }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🖖</span>
            <h1 className="text-xl font-bold"
                style={{ color: 'var(--nav-text-color)' }}>Alex AI Universal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#dc2626', color: 'var(--theme-accent)' }}>
                  ADMIN
                </span>
              )}
              {isPublic && (
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'var(--theme-role)', color: 'var(--theme-primary)' }}>
                  PUBLIC
                </span>
              )}
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse"
                   style={{ backgroundColor: isConnected ? 'var(--theme-role)' : '#dc2626' }}></div>
              <span className="text-sm font-medium"
                    style={{ color: 'var(--nav-text-color)' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Crew Count */}
            <div className="flex items-center space-x-1"
                 style={{ color: 'var(--nav-text-color)' }}>
              <span className="text-sm">👥</span>
              <span className="text-sm font-medium">{crewMembers.length}</span>
            </div>
            
            {/* Theme Selector */}
            <ThemeSelector />
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex flex-wrap gap-2 pb-4">
          <HoverTooltip
            title={hoverDescriptions.dashboard.title}
            description={hoverDescriptions.dashboard.description}
            status={hoverDescriptions.dashboard.status}
            implementationLevel={hoverDescriptions.dashboard.implementationLevel}
            requirements={hoverDescriptions.dashboard.requirements}
          >
                    <Link
                      href="/"
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                        isActive('/') 
                          ? 'nav-link-active' 
                          : 'nav-link-inactive'
                      }`}
                    >
              🎛️ Dashboard
            </Link>
          </HoverTooltip>
          
          <HoverTooltip
            title={hoverDescriptions['live-frontend'].title}
            description={hoverDescriptions['live-frontend'].description}
            status={hoverDescriptions['live-frontend'].status}
            implementationLevel={hoverDescriptions['live-frontend'].implementationLevel}
            requirements={hoverDescriptions['live-frontend'].requirements}
          >
            <Link
              href="/live"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                isActive('/live') 
                  ? 'nav-link-active' 
                  : 'nav-link-inactive'
              }`}
            >
              🌐 Live Frontend
            </Link>
          </HoverTooltip>
          
          <HoverTooltip
            title="Unified Dashboard"
            description="Combined Next.js and demo project integration with real-time synchronization"
            status="active"
            implementationLevel="complete"
            requirements="Next.js 15, WebSocket integration, API bridge"
          >
            <Link
              href="/unified"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                isActive('/unified') 
                  ? 'nav-link-active' 
                  : 'nav-link-inactive'
              }`}
            >
              🖖 Unified Dashboard
            </Link>
          </HoverTooltip>
          
          <HoverTooltip
            title={hoverDescriptions['agentic-system'].title}
            description={hoverDescriptions['agentic-system'].description}
            status={hoverDescriptions['agentic-system'].status}
            implementationLevel={hoverDescriptions['agentic-system'].implementationLevel}
            requirements={hoverDescriptions['agentic-system'].requirements}
          >
            <Link
              href="/agentic-system"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                isActive('/agentic-system') 
                  ? 'nav-link-active' 
                  : 'nav-link-inactive'
              }`}
            >
              🖖 Agentic System
            </Link>
          </HoverTooltip>
          
          {isAdmin && (
            <HoverTooltip
              title={hoverDescriptions['admin-panel'].title}
              description={hoverDescriptions['admin-panel'].description}
              status={hoverDescriptions['admin-panel'].status}
              implementationLevel={hoverDescriptions['admin-panel'].implementationLevel}
              requirements={hoverDescriptions['admin-panel'].requirements}
            >
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/admin') 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                🔐 Admin Panel
              </Link>
            </HoverTooltip>
          )}
          
          <HoverTooltip
            title={hoverDescriptions['public-view'].title}
            description={hoverDescriptions['public-view'].description}
            status={hoverDescriptions['public-view'].status}
            implementationLevel={hoverDescriptions['public-view'].implementationLevel}
            requirements={hoverDescriptions['public-view'].requirements}
          >
            <Link
              href="/public"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                isActive('/public') 
                  ? 'nav-link-active' 
                  : 'nav-link-inactive'
              }`}
            >
              👁️ Public View
            </Link>
          </HoverTooltip>
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-blue-600/30 pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            <HoverTooltip
              title={hoverDescriptions['health-check'].title}
              description={hoverDescriptions['health-check'].description}
              status={hoverDescriptions['health-check'].status}
              implementationLevel={hoverDescriptions['health-check'].implementationLevel}
              requirements={hoverDescriptions['health-check'].requirements}
            >
              <Link
                href="/health"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/health') 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                🏥 Health Check
              </Link>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions.configuration.title}
              description={hoverDescriptions.configuration.description}
              status={hoverDescriptions.configuration.status}
              implementationLevel={hoverDescriptions.configuration.implementationLevel}
              requirements={hoverDescriptions.configuration.requirements}
            >
              <Link
                href="/config"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/config') 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                ⚙️ Configuration
              </Link>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['crew-status'].title}
              description={hoverDescriptions['crew-status'].description}
              status={hoverDescriptions['crew-status'].status}
              implementationLevel={hoverDescriptions['crew-status'].implementationLevel}
              requirements={hoverDescriptions['crew-status'].requirements}
            >
              <Link
                href="/crew-status"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/crew-status') 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                👥 Crew Status
              </Link>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['contrast-test'].title}
              description={hoverDescriptions['contrast-test'].description}
              status={hoverDescriptions['contrast-test'].status}
              implementationLevel={hoverDescriptions['contrast-test'].implementationLevel}
              requirements={hoverDescriptions['contrast-test'].requirements}
            >
              <Link
                href="/contrast-test"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/contrast-test') 
                    ? 'nav-link-active' 
                    : 'nav-link-inactive'
                }`}
              >
                🎨 Contrast Test
              </Link>
            </HoverTooltip>
            
            {isAdmin && (
              <>
                <HoverTooltip
                  title={hoverDescriptions['theme-manager'].title}
                  description={hoverDescriptions['theme-manager'].description}
                  status={hoverDescriptions['theme-manager'].status}
                  implementationLevel={hoverDescriptions['theme-manager'].implementationLevel}
                  requirements={hoverDescriptions['theme-manager'].requirements}
                >
                  <Link
                    href="/themes"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      isActive('/themes') 
                        ? 'nav-link-active' 
                        : 'nav-link-inactive'
                    }`}
                  >
                    🎨 Theme Manager
                  </Link>
                </HoverTooltip>
                
                <HoverTooltip
                  title={hoverDescriptions['navigation-demo'].title}
                  description={hoverDescriptions['navigation-demo'].description}
                  status={hoverDescriptions['navigation-demo'].status}
                  implementationLevel={hoverDescriptions['navigation-demo'].implementationLevel}
                  requirements={hoverDescriptions['navigation-demo'].requirements}
                >
                  <Link
                    href="/navigation-demo"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      isActive('/navigation-demo') 
                        ? 'nav-link-active' 
                        : 'nav-link-inactive'
                    }`}
                  >
                    🧭 Navigation Demo
                  </Link>
                </HoverTooltip>
              </>
            )}
            
            {/* Role Management */}
            <HoverTooltip
              title={hoverDescriptions['edit-role'].title}
              description={hoverDescriptions['edit-role'].description}
              status={hoverDescriptions['edit-role'].status}
              implementationLevel={hoverDescriptions['edit-role'].implementationLevel}
              requirements={hoverDescriptions['edit-role'].requirements}
            >
              <Link
                href="/role-management"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/role-management') 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'nav-link-inactive'
                }`}
              >
                🔐 Role Management
              </Link>
            </HoverTooltip>

            {/* Theme Customization */}
            <HoverTooltip
              title={hoverDescriptions['create-theme'].title}
              description={hoverDescriptions['create-theme'].description}
              status={hoverDescriptions['create-theme'].status}
              implementationLevel={hoverDescriptions['create-theme'].implementationLevel}
              requirements={hoverDescriptions['create-theme'].requirements}
            >
              <Link
                href="/theme-customization"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/theme-customization') 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'nav-link-inactive'
                }`}
              >
                🎨 Theme Studio
              </Link>
            </HoverTooltip>

            {/* Crew Management */}
            <HoverTooltip
              title={hoverDescriptions['crew-analytics'].title}
              description={hoverDescriptions['crew-analytics'].description}
              status={hoverDescriptions['crew-analytics'].status}
              implementationLevel={hoverDescriptions['crew-analytics'].implementationLevel}
              requirements={hoverDescriptions['crew-analytics'].requirements}
            >
              <Link
                href="/crew-management"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/crew-management') 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'nav-link-inactive'
                }`}
              >
                👥 Crew Management
              </Link>
            </HoverTooltip>

            {/* Crew Responsibilities */}
            <HoverTooltip
              title={hoverDescriptions['crew-responsibilities'].title}
              description={hoverDescriptions['crew-responsibilities'].description}
              status={hoverDescriptions['crew-responsibilities'].status}
              implementationLevel={hoverDescriptions['crew-responsibilities'].implementationLevel}
              requirements={hoverDescriptions['crew-responsibilities'].requirements}
            >
              <Link
                href="/crew-responsibilities"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/crew-responsibilities') 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'nav-link-inactive'
                }`}
              >
                🧠 Crew Responsibilities
              </Link>
            </HoverTooltip>

            {/* Emergency Protocols */}
            <HoverTooltip
              title={hoverDescriptions['emergency-protocols'].title}
              description={hoverDescriptions['emergency-protocols'].description}
              status={hoverDescriptions['emergency-protocols'].status}
              implementationLevel={hoverDescriptions['emergency-protocols'].implementationLevel}
              requirements={hoverDescriptions['emergency-protocols'].requirements}
            >
              <Link
                href="/emergency-protocols"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/emergency-protocols') 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'nav-link-inactive'
                }`}
              >
                🚨 Emergency Protocols
              </Link>
            </HoverTooltip>

            {/* N8N Integration */}
            <HoverTooltip
              title={hoverDescriptions['n8n-integration'].title}
              description={hoverDescriptions['n8n-integration'].description}
              status={hoverDescriptions['n8n-integration'].status}
              implementationLevel={hoverDescriptions['n8n-integration'].implementationLevel}
              requirements={hoverDescriptions['n8n-integration'].requirements}
            >
              <Link
                href="/n8n-integration"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive('/n8n-integration') 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'nav-link-inactive'
                }`}
              >
                🖖 N8N Integration
              </Link>
            </HoverTooltip>
          </div>
        </div>

            {/* Role Switcher (for demo purposes) */}
            <div className="pt-4 pb-4"
                 style={{ borderTop: `2px solid var(--nav-border-color)` }}>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium"
                      style={{ color: 'var(--nav-text-color)' }}>Role:</span>
            <div className="flex space-x-2">
              <HoverTooltip
                title={hoverDescriptions['role-switcher'].title}
                description={hoverDescriptions['role-switcher'].description}
                status={hoverDescriptions['role-switcher'].status}
                implementationLevel={hoverDescriptions['role-switcher'].implementationLevel}
                requirements={hoverDescriptions['role-switcher'].requirements}
              >
                    <button
                      onClick={() => setUserRole('public')}
                      className="px-3 py-1 rounded text-xs font-medium transition-all border-2"
                      style={{
                        backgroundColor: userRole === 'public' ? 'var(--nav-active-bg)' : 'transparent',
                        color: userRole === 'public' ? 'var(--nav-active-text)' : 'var(--nav-text-color)',
                        borderColor: userRole === 'public' ? 'var(--nav-active-bg)' : 'var(--nav-border-color)'
                      }}
                      onMouseEnter={(e) => {
                        if (userRole !== 'public') {
                          e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)'
                          e.currentTarget.style.borderColor = 'var(--nav-text-color)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (userRole !== 'public') {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.borderColor = 'var(--nav-border-color)'
                        }
                      }}
                    >
                      Public
                    </button>
              </HoverTooltip>
              <HoverTooltip
                title={hoverDescriptions['role-switcher'].title}
                description={hoverDescriptions['role-switcher'].description}
                status={hoverDescriptions['role-switcher'].status}
                implementationLevel={hoverDescriptions['role-switcher'].implementationLevel}
                requirements={hoverDescriptions['role-switcher'].requirements}
              >
                    <button
                      onClick={() => setUserRole('user')}
                      className="px-3 py-1 rounded text-xs font-medium transition-all border-2"
                      style={{
                        backgroundColor: userRole === 'user' ? 'var(--nav-active-bg)' : 'transparent',
                        color: userRole === 'user' ? 'var(--nav-active-text)' : 'var(--nav-text-color)',
                        borderColor: userRole === 'user' ? 'var(--nav-active-bg)' : 'var(--nav-border-color)'
                      }}
                      onMouseEnter={(e) => {
                        if (userRole !== 'user') {
                          e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)'
                          e.currentTarget.style.borderColor = 'var(--nav-text-color)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (userRole !== 'user') {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.borderColor = 'var(--nav-border-color)'
                        }
                      }}
                    >
                      User
                    </button>
              </HoverTooltip>
              <HoverTooltip
                title={hoverDescriptions['role-switcher'].title}
                description={hoverDescriptions['role-switcher'].description}
                status={hoverDescriptions['role-switcher'].status}
                implementationLevel={hoverDescriptions['role-switcher'].implementationLevel}
                requirements={hoverDescriptions['role-switcher'].requirements}
              >
                    <button
                      onClick={() => setUserRole('admin')}
                      className="px-3 py-1 rounded text-xs font-medium transition-all border-2"
                      style={{
                        backgroundColor: userRole === 'admin' ? '#dc2626' : 'transparent',
                        color: userRole === 'admin' ? '#ffffff' : 'var(--nav-text-color)',
                        borderColor: userRole === 'admin' ? '#dc2626' : 'var(--nav-border-color)'
                      }}
                      onMouseEnter={(e) => {
                        if (userRole !== 'admin') {
                          e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)'
                          e.currentTarget.style.borderColor = 'var(--nav-text-color)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (userRole !== 'admin') {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.borderColor = 'var(--nav-border-color)'
                        }
                      }}
                    >
                      Admin
                    </button>
              </HoverTooltip>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
