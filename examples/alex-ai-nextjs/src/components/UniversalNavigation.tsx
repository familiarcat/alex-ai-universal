'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
    <nav className="bg-gradient-to-r from-blue-800 to-purple-800 border-b border-blue-600/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🖖</span>
            <h1 className="text-xl font-bold text-white">Alex AI Universal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ADMIN
                </span>
              )}
              {isPublic && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  PUBLIC
                </span>
              )}
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Crew Count */}
            <div className="flex items-center space-x-1 text-gray-300">
              <span className="text-sm">👥</span>
              <span className="text-sm font-medium">{crewMembers.length}</span>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex flex-wrap gap-2 pb-4">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isActive('/') 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            🎛️ Dashboard
          </Link>
          
          <Link
            href="/live"
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isActive('/live') 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            🌐 Live Frontend
          </Link>
          
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive('/admin') 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              🔐 Admin Panel
            </Link>
          )}
          
          <Link
            href="/public"
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isActive('/public') 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            👁️ Public View
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-blue-600/30 pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <Link
              href="/health"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive('/health') 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white'
              }`}
            >
              🏥 Health Check
            </Link>
            
            <Link
              href="/config"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive('/config') 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white'
              }`}
            >
              ⚙️ Configuration
            </Link>
            
            <Link
              href="/crew-status"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive('/crew-status') 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white'
              }`}
            >
              👥 Crew Status
            </Link>
            
            <Link
              href="/contrast-test"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive('/contrast-test') 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white'
              }`}
            >
              🎨 Contrast Test
            </Link>
            
            {isAdmin && (
              <>
                <Link
                  href="/themes"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive('/themes') 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white'
                  }`}
                >
                  🎨 Theme Manager
                </Link>
                
                <Link
                  href="/navigation-demo"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive('/navigation-demo') 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white'
                  }`}
                >
                  🧭 Navigation Demo
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Role Switcher (for demo purposes) */}
        <div className="border-t border-blue-600/30 pt-4 pb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Role:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setUserRole('public')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  userRole === 'public' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setUserRole('user')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  userRole === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                User
              </button>
              <button
                onClick={() => setUserRole('admin')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  userRole === 'admin' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
