'use client'

import { useState } from 'react'

interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'inactive' | 'busy' | 'offline'
  lastActivity: string
  currentTask?: string
  performance: {
    tasksCompleted: number
    successRate: number
    responseTime: number
  }
}

const crewMembers: CrewMember[] = [
  {
    id: 'captain_picard',
    name: 'Captain Jean-Luc Picard',
    role: 'Strategic Commander',
    specialization: ['Strategic Leadership', 'Mission Planning', 'Decision Making'],
    status: 'active',
    lastActivity: '2 minutes ago',
    currentTask: 'Reviewing mission objectives',
    performance: {
      tasksCompleted: 47,
      successRate: 98.5,
      responseTime: 120
    }
  },
  {
    id: 'commander_riker',
    name: 'Commander William Riker',
    role: 'First Officer',
    specialization: ['Tactical Operations', 'Workflow Management', 'Execution'],
    status: 'busy',
    lastActivity: '5 minutes ago',
    currentTask: 'Coordinating tactical operations',
    performance: {
      tasksCompleted: 42,
      successRate: 96.8,
      responseTime: 95
    }
  },
  {
    id: 'commander_data',
    name: 'Commander Data',
    role: 'Operations Officer',
    specialization: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
    status: 'active',
    lastActivity: '1 minute ago',
    currentTask: 'Processing system analytics',
    performance: {
      tasksCompleted: 89,
      successRate: 99.2,
      responseTime: 45
    }
  },
  {
    id: 'geordi_la_forge',
    name: 'Lieutenant Commander Geordi La Forge',
    role: 'Chief Engineer',
    specialization: ['Infrastructure', 'System Integration', 'Technical Solutions'],
    status: 'active',
    lastActivity: '3 minutes ago',
    currentTask: 'Maintaining system infrastructure',
    performance: {
      tasksCompleted: 56,
      successRate: 97.3,
      responseTime: 78
    }
  },
  {
    id: 'lieutenant_worf',
    name: 'Lieutenant Worf',
    role: 'Security Officer',
    specialization: ['Security Protocols', 'Threat Assessment', 'Compliance'],
    status: 'active',
    lastActivity: '1 minute ago',
    currentTask: 'Monitoring security protocols',
    performance: {
      tasksCompleted: 38,
      successRate: 99.1,
      responseTime: 65
    }
  },
  {
    id: 'counselor_troi',
    name: 'Counselor Deanna Troi',
    role: 'Ship\'s Counselor',
    specialization: ['User Experience', 'Communication', 'Team Dynamics'],
    status: 'active',
    lastActivity: '4 minutes ago',
    currentTask: 'Analyzing user feedback',
    performance: {
      tasksCompleted: 34,
      successRate: 95.6,
      responseTime: 110
    }
  },
  {
    id: 'dr_crusher',
    name: 'Dr. Beverly Crusher',
    role: 'Chief Medical Officer',
    specialization: ['System Health', 'Diagnostics', 'Wellness'],
    status: 'active',
    lastActivity: '2 minutes ago',
    currentTask: 'Running system diagnostics',
    performance: {
      tasksCompleted: 41,
      successRate: 98.7,
      responseTime: 85
    }
  },
  {
    id: 'lieutenant_uhura',
    name: 'Lieutenant Uhura',
    role: 'Communications Officer',
    specialization: ['Communication Protocols', 'Synchronization', 'Integration'],
    status: 'busy',
    lastActivity: '6 minutes ago',
    currentTask: 'Managing communication protocols',
    performance: {
      tasksCompleted: 52,
      successRate: 96.9,
      responseTime: 72
    }
  },
  {
    id: 'quark',
    name: 'Quark',
    role: 'Business Operations',
    specialization: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics'],
    status: 'active',
    lastActivity: '1 minute ago',
    currentTask: 'Optimizing resource allocation',
    performance: {
      tasksCompleted: 29,
      successRate: 94.8,
      responseTime: 92
    }
  }
]

export default function CrewStatus() {
  const [filter, setFilter] = useState<'all' | 'active' | 'busy' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'performance'>('name')

  const filteredMembers = crewMembers.filter(member => 
    filter === 'all' || member.status === filter
  )

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case 'status':
        return a.status.localeCompare(b.status)
      case 'performance':
        return b.performance.successRate - a.performance.successRate
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'inactive': return 'bg-gray-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'busy': return '🟡'
      case 'inactive': return '⏸️'
      case 'offline': return '❌'
      default: return '❓'
    }
  }

  const totalMembers = crewMembers.length
  const activeMembers = crewMembers.filter(m => m.status === 'active').length
  const busyMembers = crewMembers.filter(m => m.status === 'busy').length
  const offlineMembers = crewMembers.filter(m => m.status === 'offline').length

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          👥 Crew Status Monitor
        </h1>
        <p className="text-xl text-gray-300">
          Real-time monitoring of all Alex AI crew members and their current status
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalMembers}</div>
          <div className="text-gray-300">Total Members</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{activeMembers}</div>
          <div className="text-gray-300">Active</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{busyMembers}</div>
          <div className="text-gray-300">Busy</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{offlineMembers}</div>
          <div className="text-gray-300">Offline</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'busy' | 'inactive')}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Members</option>
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'status' | 'performance')}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crew Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
                <span className="text-lg font-bold text-white">{member.name}</span>
              </div>
              <span className="text-2xl">{getStatusIcon(member.status)}</span>
            </div>

            {/* Role and Status */}
            <div className="mb-4">
              <div className="text-sm font-medium text-green-400 mb-1">{member.role}</div>
              <div className="text-xs text-gray-400">Last active: {member.lastActivity}</div>
            </div>

            {/* Current Task */}
            {member.currentTask && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-300 mb-1">Current Task:</div>
                <div className="text-sm text-white bg-white/5 rounded p-2">
                  {member.currentTask}
                </div>
              </div>
            )}

            {/* Specializations */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-300 mb-2">Specializations:</div>
              <div className="flex flex-wrap gap-1">
                {member.specialization.slice(0, 3).map((spec, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                  >
                    {spec}
                  </span>
                ))}
                {member.specialization.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{member.specialization.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-t border-white/10 pt-4">
              <div className="text-xs font-medium text-gray-300 mb-2">Performance</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{member.performance.tasksCompleted}</div>
                  <div className="text-xs text-gray-400">Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">{member.performance.successRate}%</div>
                  <div className="text-xs text-gray-400">Success</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-400">{member.performance.responseTime}ms</div>
                  <div className="text-xs text-gray-400">Response</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {Math.round(crewMembers.reduce((acc, m) => acc + m.performance.successRate, 0) / crewMembers.length)}%
            </div>
            <div className="text-gray-300">Average Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {crewMembers.reduce((acc, m) => acc + m.performance.tasksCompleted, 0)}
            </div>
            <div className="text-gray-300">Total Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {Math.round(crewMembers.reduce((acc, m) => acc + m.performance.responseTime, 0) / crewMembers.length)}ms
            </div>
            <div className="text-gray-300">Average Response Time</div>
          </div>
        </div>
      </div>
    </div>
  )
}
