'use client'

import { useState } from 'react'
import HoverTooltip from '@/components/HoverTooltip'
import { hoverDescriptions } from '@/data/hoverDescriptions'

interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'inactive' | 'busy' | 'maintenance'
  performance: number
  missions: number
  lastActive: string
  avatar: string
  capabilities: string[]
  currentTask?: string
}

const crewMembers: CrewMember[] = [
  {
    id: 'captain_picard',
    name: 'Captain Jean-Luc Picard',
    role: 'Strategic Commander',
    specialization: ['Strategic Leadership', 'Mission Planning', 'Decision Making'],
    status: 'active',
    performance: 95,
    missions: 127,
    lastActive: '2 minutes ago',
    avatar: '🖖',
    capabilities: ['Command', 'Diplomacy', 'Tactical Analysis'],
    currentTask: 'Overseeing system optimization'
  },
  {
    id: 'commander_riker',
    name: 'Commander William Riker',
    role: 'First Officer',
    specialization: ['Tactical Operations', 'Workflow Management', 'Execution'],
    status: 'active',
    performance: 92,
    missions: 98,
    lastActive: '1 minute ago',
    avatar: '🎯',
    capabilities: ['Operations', 'Team Leadership', 'Crisis Management'],
    currentTask: 'Coordinating crew assignments'
  },
  {
    id: 'commander_data',
    name: 'Commander Data',
    role: 'Operations Officer',
    specialization: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
    status: 'active',
    performance: 98,
    missions: 156,
    lastActive: '30 seconds ago',
    avatar: '🤖',
    capabilities: ['Data Analysis', 'Pattern Recognition', 'System Optimization'],
    currentTask: 'Processing user interaction data'
  },
  {
    id: 'geordi_la_forge',
    name: 'Lieutenant Commander Geordi La Forge',
    role: 'Chief Engineer',
    specialization: ['Infrastructure', 'System Integration', 'Technical Solutions'],
    status: 'active',
    performance: 94,
    missions: 89,
    lastActive: '5 minutes ago',
    avatar: '🔧',
    capabilities: ['Engineering', 'System Maintenance', 'Innovation'],
    currentTask: 'Implementing new features'
  },
  {
    id: 'lieutenant_worf',
    name: 'Lieutenant Worf',
    role: 'Security Officer',
    specialization: ['Security Protocols', 'Access Control', 'Threat Assessment'],
    status: 'active',
    performance: 96,
    missions: 73,
    lastActive: '3 minutes ago',
    avatar: '🛡️',
    capabilities: ['Security', 'Combat Systems', 'Threat Analysis'],
    currentTask: 'Monitoring system security'
  },
  {
    id: 'dr_crusher',
    name: 'Dr. Beverly Crusher',
    role: 'Chief Medical Officer',
    specialization: ['System Health', 'Performance Monitoring', 'Diagnostics'],
    status: 'active',
    performance: 91,
    missions: 65,
    lastActive: '4 minutes ago',
    avatar: '⚕️',
    capabilities: ['System Health', 'Performance Analysis', 'Preventive Care'],
    currentTask: 'System health diagnostics'
  },
  {
    id: 'counselor_troi',
    name: 'Counselor Deanna Troi',
    role: 'Ship\'s Counselor',
    specialization: ['User Experience', 'Interface Design', 'Emotional Intelligence'],
    status: 'active',
    performance: 93,
    missions: 54,
    lastActive: '2 minutes ago',
    avatar: '💭',
    capabilities: ['UX Design', 'User Psychology', 'Interface Optimization'],
    currentTask: 'Analyzing user feedback'
  },
  {
    id: 'wesley_crusher',
    name: 'Ensign Wesley Crusher',
    role: 'Acting Ensign',
    specialization: ['Learning Systems', 'Development', 'Innovation'],
    status: 'active',
    performance: 88,
    missions: 23,
    lastActive: '1 minute ago',
    avatar: '🎓',
    capabilities: ['Learning', 'Development', 'Research'],
    currentTask: 'Studying user interaction patterns'
  },
  {
    id: 'guinan',
    name: 'Guinan',
    role: 'Bartender & Advisor',
    specialization: ['User Support', 'Problem Solving', 'Wisdom'],
    status: 'inactive',
    performance: 90,
    missions: 45,
    lastActive: '2 hours ago',
    avatar: '🍸',
    capabilities: ['Support', 'Problem Solving', 'Guidance'],
    currentTask: 'Off duty'
  }
]

export default function CrewManagement() {
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detailed'>('grid')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'busy' | 'maintenance'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'missions' | 'lastActive'>('performance')

  const filteredMembers = crewMembers
    .filter(member => filterStatus === 'all' || member.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'performance':
          return b.performance - a.performance
        case 'missions':
          return b.missions - a.missions
        case 'lastActive':
          return a.lastActive.localeCompare(b.lastActive)
        default:
          return 0
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-gray-500'
      case 'busy':
        return 'bg-yellow-500'
      case 'maintenance':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-400'
    if (performance >= 90) return 'text-yellow-400'
    if (performance >= 80) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            👥 Crew Management System
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Monitor, manage, and coordinate your Alex AI Universal crew members.
            Track performance, assign tasks, and optimize crew operations.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
                <option value="detailed">Detailed View</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Members</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="busy">Busy</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="performance">Performance</option>
                <option value="name">Name</option>
                <option value="missions">Missions</option>
                <option value="lastActive">Last Active</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <HoverTooltip
                title={hoverDescriptions['crew-analytics'].title}
                description={hoverDescriptions['crew-analytics'].description}
                status={hoverDescriptions['crew-analytics'].status}
                implementationLevel={hoverDescriptions['crew-analytics'].implementationLevel}
                requirements={hoverDescriptions['crew-analytics'].requirements}
              >
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300">
                  📊 Analytics
                </button>
              </HoverTooltip>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Crew Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Crew Members ({filteredMembers.length})</h2>
              
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedMember?.id === member.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{member.avatar}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{member.name}</h3>
                          <p className="text-sm text-gray-300">{member.role}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Performance:</span>
                          <span className={`font-medium ${getPerformanceColor(member.performance)}`}>
                            {member.performance}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Missions:</span>
                          <span className="text-white font-medium">{member.missions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Last Active:</span>
                          <span className="text-white font-medium">{member.lastActive}</span>
                        </div>
                      </div>
                      
                      {member.currentTask && (
                        <div className="mt-3 p-2 bg-white/5 rounded-lg">
                          <p className="text-xs text-gray-300">Current Task:</p>
                          <p className="text-sm text-white">{member.currentTask}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedMember?.id === member.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{member.avatar}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{member.name}</h3>
                          <p className="text-sm text-gray-300">{member.role}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getPerformanceColor(member.performance)}`}>
                              {member.performance}%
                            </div>
                            <div className="text-xs text-gray-300">Performance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">{member.missions}</div>
                            <div className="text-xs text-gray-300">Missions</div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'detailed' && (
                <div className="space-y-4">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedMember?.id === member.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-start space-x-4">
                        <span className="text-3xl">{member.avatar}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
                            <span className="text-sm text-gray-300">{member.status}</span>
                          </div>
                          <p className="text-gray-300 mb-3">{member.role}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className={`text-xl font-bold ${getPerformanceColor(member.performance)}`}>
                                {member.performance}%
                              </div>
                              <div className="text-xs text-gray-300">Performance</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">{member.missions}</div>
                              <div className="text-xs text-gray-300">Missions</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">{member.specialization.length}</div>
                              <div className="text-xs text-gray-300">Specializations</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">{member.capabilities.length}</div>
                              <div className="text-xs text-gray-300">Capabilities</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {member.specialization.slice(0, 3).map((spec, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-full"
                              >
                                {spec}
                              </span>
                            ))}
                            {member.specialization.length > 3 && (
                              <span className="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded-full">
                                +{member.specialization.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          {member.currentTask && (
                            <div className="mt-3 p-3 bg-white/5 rounded-lg">
                              <p className="text-sm text-gray-300">Current Task:</p>
                              <p className="text-white">{member.currentTask}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Member Details */}
          <div className="lg:col-span-1">
            {selectedMember ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-center mb-6">
                  <span className="text-4xl mb-2 block">{selectedMember.avatar}</span>
                  <h2 className="text-2xl font-bold text-white">{selectedMember.name}</h2>
                  <p className="text-gray-300">{selectedMember.role}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white mt-2 ${getStatusColor(selectedMember.status)}`}>
                    {selectedMember.status}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Performance Metrics</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Overall Performance</span>
                          <span className={`font-medium ${getPerformanceColor(selectedMember.performance)}`}>
                            {selectedMember.performance}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              selectedMember.performance >= 95 ? 'bg-green-500' :
                              selectedMember.performance >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedMember.performance}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{selectedMember.missions}</div>
                          <div className="text-xs text-gray-300">Total Missions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{selectedMember.lastActive}</div>
                          <div className="text-xs text-gray-300">Last Active</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Specializations</h3>
                    <div className="space-y-2">
                      {selectedMember.specialization.map((spec, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-green-400">✅</span>
                          <span className="text-white text-sm">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Capabilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.capabilities.map((capability, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Current Task */}
                  {selectedMember.currentTask && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Current Task</h3>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white text-sm">{selectedMember.currentTask}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <HoverTooltip
                      title={hoverDescriptions['assign-task'].title}
                      description={hoverDescriptions['assign-task'].description}
                      status={hoverDescriptions['assign-task'].status}
                      implementationLevel={hoverDescriptions['assign-task'].implementationLevel}
                      requirements={hoverDescriptions['assign-task'].requirements}
                    >
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300">
                        📋 Assign Task
                      </button>
                    </HoverTooltip>
                    
                    <HoverTooltip
                      title={hoverDescriptions['view-performance'].title}
                      description={hoverDescriptions['view-performance'].description}
                      status={hoverDescriptions['view-performance'].status}
                      implementationLevel={hoverDescriptions['view-performance'].implementationLevel}
                      requirements={hoverDescriptions['view-performance'].requirements}
                    >
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300">
                        📊 Performance Report
                      </button>
                    </HoverTooltip>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h2 className="text-2xl font-bold text-white mb-4">Select a Crew Member</h2>
                <p className="text-gray-300">
                  Choose a crew member from the list to view detailed information, performance metrics, and management options.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Crew Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Crew Management Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <HoverTooltip
              title={hoverDescriptions['crew-scheduling'].title}
              description={hoverDescriptions['crew-scheduling'].description}
              status={hoverDescriptions['crew-scheduling'].status}
              implementationLevel={hoverDescriptions['crew-scheduling'].implementationLevel}
              requirements={hoverDescriptions['crew-scheduling'].requirements}
            >
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                📅 Crew Scheduling
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['mission-assignment'].title}
              description={hoverDescriptions['mission-assignment'].description}
              status={hoverDescriptions['mission-assignment'].status}
              implementationLevel={hoverDescriptions['mission-assignment'].implementationLevel}
              requirements={hoverDescriptions['mission-assignment'].requirements}
            >
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                🎯 Mission Assignment
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['performance-review'].title}
              description={hoverDescriptions['performance-review'].description}
              status={hoverDescriptions['performance-review'].status}
              implementationLevel={hoverDescriptions['performance-review'].implementationLevel}
              requirements={hoverDescriptions['performance-review'].requirements}
            >
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                📈 Performance Review
              </button>
            </HoverTooltip>
            
            <HoverTooltip
              title={hoverDescriptions['crew-training'].title}
              description={hoverDescriptions['crew-training'].description}
              status={hoverDescriptions['crew-training'].status}
              implementationLevel={hoverDescriptions['crew-training'].implementationLevel}
              requirements={hoverDescriptions['crew-training'].requirements}
            >
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                🎓 Crew Training
              </button>
            </HoverTooltip>
          </div>
        </div>
      </div>
    </div>
  )
}




