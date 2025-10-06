'use client'

import { useState, useEffect } from 'react'
import { ContrastCard, ContrastText, ContrastButton } from '@/components/ContrastAware'
import HoverTooltip from '@/components/HoverTooltip'
import { hoverDescriptions } from '@/data/hoverDescriptions'

interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'busy' | 'inactive' | 'offline' | 'emergency' | 'loop_detected' | 'unresponsive'
  lastActivity: string
  currentTask?: string
  performance: {
    tasksCompleted: number
    successRate: number
    responseTime: number
  }
  emergencyCapabilities: {
    canAssumeRoles: string[]
    ragMemoryAccess: string[]
    emergencyTraining: string[]
    backupSpecializations: string[]
  }
  ragMemories: {
    roleSpecific: Record<string, string[]>
    shared: string[]
    emergency: string[]
  }
}

interface EmergencyProtocol {
  id: string
  name: string
  description: string
  triggerConditions: string[]
  procedures: string[]
  ragMemoryTransfer: boolean
  roleSwapping: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
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
    },
    emergencyCapabilities: {
      canAssumeRoles: ['First Officer', 'Operations Officer', 'Communications Officer'],
      ragMemoryAccess: ['strategic', 'operational', 'communication', 'emergency'],
      emergencyTraining: ['Crisis Management', 'Emergency Protocols', 'Cross-Training'],
      backupSpecializations: ['Tactical Operations', 'Data Processing', 'Communication Protocols']
    },
    ragMemories: {
      roleSpecific: {
        'Strategic Commander': [
          'Mission critical decision patterns',
          'Strategic planning methodologies',
          'Risk assessment frameworks',
          'Leadership protocols'
        ],
        'First Officer': [
          'Tactical operation procedures',
          'Workflow management systems',
          'Execution protocols',
          'Team coordination methods'
        ],
        'Operations Officer': [
          'Data processing algorithms',
          'Analytics frameworks',
          'System optimization techniques',
          'Performance monitoring protocols'
        ]
      },
      shared: [
        'Emergency response procedures',
        'System architecture knowledge',
        'Security protocols',
        'Communication standards'
      ],
      emergency: [
        'Emergency override procedures',
        'Critical system access codes',
        'Emergency communication protocols',
        'Disaster recovery procedures'
      ]
    }
  },
  {
    id: 'commander_data',
    name: 'Commander Data',
    role: 'Operations Officer',
    specialization: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
    status: 'loop_detected',
    lastActivity: '15 minutes ago',
    currentTask: 'Processing system analytics',
    performance: {
      tasksCompleted: 89,
      successRate: 99.2,
      responseTime: 45
    },
    emergencyCapabilities: {
      canAssumeRoles: ['Strategic Commander', 'Chief Engineer', 'Security Officer'],
      ragMemoryAccess: ['analytical', 'technical', 'security', 'emergency'],
      emergencyTraining: ['System Recovery', 'Security Protocols', 'Emergency Analytics'],
      backupSpecializations: ['Infrastructure Management', 'Security Assessment', 'System Integration']
    },
    ragMemories: {
      roleSpecific: {
        'Operations Officer': [
          'Data processing algorithms',
          'Analytics frameworks',
          'System optimization techniques',
          'Performance monitoring protocols'
        ],
        'Strategic Commander': [
          'Mission critical decision patterns',
          'Strategic planning methodologies',
          'Risk assessment frameworks',
          'Leadership protocols'
        ],
        'Chief Engineer': [
          'Infrastructure management protocols',
          'System integration procedures',
          'Technical solution frameworks',
          'Maintenance procedures'
        ]
      },
      shared: [
        'System architecture knowledge',
        'Performance metrics',
        'Technical specifications',
        'Integration protocols'
      ],
      emergency: [
        'System recovery procedures',
        'Emergency diagnostic protocols',
        'Critical system bypass procedures',
        'Emergency data recovery'
      ]
    }
  },
  {
    id: 'commander_riker',
    name: 'Commander William Riker',
    role: 'First Officer',
    specialization: ['Tactical Operations', 'Workflow Management', 'Execution'],
    status: 'active',
    lastActivity: '1 minute ago',
    currentTask: 'Coordinating tactical operations',
    performance: {
      tasksCompleted: 42,
      successRate: 96.8,
      responseTime: 95
    },
    emergencyCapabilities: {
      canAssumeRoles: ['Strategic Commander', 'Operations Officer', 'Communications Officer'],
      ragMemoryAccess: ['tactical', 'operational', 'communication', 'emergency'],
      emergencyTraining: ['Crisis Management', 'Emergency Coordination', 'Cross-Training'],
      backupSpecializations: ['Strategic Planning', 'Data Processing', 'Communication Protocols']
    },
    ragMemories: {
      roleSpecific: {
        'First Officer': [
          'Tactical operation procedures',
          'Workflow management systems',
          'Execution protocols',
          'Team coordination methods'
        ],
        'Strategic Commander': [
          'Mission critical decision patterns',
          'Strategic planning methodologies',
          'Risk assessment frameworks',
          'Leadership protocols'
        ],
        'Operations Officer': [
          'Data processing algorithms',
          'Analytics frameworks',
          'System optimization techniques',
          'Performance monitoring protocols'
        ]
      },
      shared: [
        'Emergency response procedures',
        'System architecture knowledge',
        'Security protocols',
        'Communication standards'
      ],
      emergency: [
        'Emergency override procedures',
        'Critical system access codes',
        'Emergency communication protocols',
        'Disaster recovery procedures'
      ]
    }
  },
  {
    id: 'geordi_la_forge',
    name: 'Lieutenant Commander Geordi La Forge',
    role: 'Chief Engineer',
    specialization: ['Infrastructure', 'System Integration', 'Technical Solutions'],
    status: 'unresponsive',
    lastActivity: '45 minutes ago',
    currentTask: 'Maintaining system infrastructure',
    performance: {
      tasksCompleted: 56,
      successRate: 97.3,
      responseTime: 78
    },
    emergencyCapabilities: {
      canAssumeRoles: ['Operations Officer', 'Security Officer', 'Communications Officer'],
      ragMemoryAccess: ['infrastructure', 'security', 'communication', 'emergency'],
      emergencyTraining: ['Emergency Engineering', 'Security Protocols', 'Communication Systems'],
      backupSpecializations: ['Data Processing', 'Security Assessment', 'Communication Protocols']
    },
    ragMemories: {
      roleSpecific: {
        'Chief Engineer': [
          'Infrastructure management protocols',
          'System integration procedures',
          'Technical solution frameworks',
          'Maintenance procedures'
        ],
        'Operations Officer': [
          'Data processing algorithms',
          'Analytics frameworks',
          'System optimization techniques',
          'Performance monitoring protocols'
        ],
        'Security Officer': [
          'Security protocol enforcement',
          'Threat assessment procedures',
          'Compliance monitoring systems',
          'Access control management'
        ]
      },
      shared: [
        'System architecture knowledge',
        'Infrastructure specifications',
        'Technical documentation',
        'Maintenance procedures'
      ],
      emergency: [
        'Emergency system bypass',
        'Critical infrastructure recovery',
        'Emergency maintenance procedures',
        'System emergency shutdown'
      ]
    }
  },
  {
    id: 'lieutenant_worf',
    name: 'Lieutenant Worf',
    role: 'Security Officer',
    specialization: ['Security Protocols', 'Threat Assessment', 'Compliance'],
    status: 'active',
    lastActivity: '30 seconds ago',
    currentTask: 'Monitoring security protocols',
    performance: {
      tasksCompleted: 38,
      successRate: 99.1,
      responseTime: 65
    },
    emergencyCapabilities: {
      canAssumeRoles: ['Chief Engineer', 'Communications Officer', 'Business Operations'],
      ragMemoryAccess: ['security', 'infrastructure', 'communication', 'emergency'],
      emergencyTraining: ['Emergency Security', 'Infrastructure Security', 'Communication Security'],
      backupSpecializations: ['Infrastructure Management', 'Communication Protocols', 'Business Analysis']
    },
    ragMemories: {
      roleSpecific: {
        'Security Officer': [
          'Security protocol enforcement',
          'Threat assessment procedures',
          'Compliance monitoring systems',
          'Access control management'
        ],
        'Chief Engineer': [
          'Infrastructure management protocols',
          'System integration procedures',
          'Technical solution frameworks',
          'Maintenance procedures'
        ],
        'Communications Officer': [
          'Communication protocol management',
          'System synchronization procedures',
          'Integration coordination protocols',
          'Communication system reliability'
        ]
      },
      shared: [
        'Security architecture knowledge',
        'Threat assessment frameworks',
        'Compliance procedures',
        'Access control systems'
      ],
      emergency: [
        'Emergency security protocols',
        'Critical system lockdown',
        'Emergency access procedures',
        'Security incident response'
      ]
    }
  },
  {
    id: 'counselor_troi',
    name: 'Counselor Deanna Troi',
    role: 'Ship\'s Counselor',
    specialization: ['User Experience', 'Communication', 'Team Dynamics'],
    status: 'active',
    lastActivity: '2 minutes ago',
    currentTask: 'Analyzing user feedback',
    performance: {
      tasksCompleted: 34,
      successRate: 95.6,
      responseTime: 110
    },
    emergencyCapabilities: {
      canAssumeRoles: ['Communications Officer', 'Operations Officer', 'Business Operations'],
      ragMemoryAccess: ['communication', 'operational', 'business', 'emergency'],
      emergencyTraining: ['Emergency Communication', 'Crisis Communication', 'Emergency Coordination'],
      backupSpecializations: ['Communication Protocols', 'Data Processing', 'Business Analysis']
    },
    ragMemories: {
      roleSpecific: {
        'Ship\'s Counselor': [
          'User experience optimization',
          'Communication effectiveness analysis',
          'Team dynamics monitoring',
          'Behavioral pattern analysis'
        ],
        'Communications Officer': [
          'Communication protocol management',
          'System synchronization procedures',
          'Integration coordination protocols',
          'Communication system reliability'
        ],
        'Operations Officer': [
          'Data processing algorithms',
          'Analytics frameworks',
          'System optimization techniques',
          'Performance monitoring protocols'
        ]
      },
      shared: [
        'Communication frameworks',
        'User behavior patterns',
        'Team coordination methods',
        'Experience optimization techniques'
      ],
      emergency: [
        'Emergency communication protocols',
        'Crisis communication procedures',
        'Emergency user support',
        'Communication system recovery'
      ]
    }
  }
]

const emergencyProtocols: EmergencyProtocol[] = [
  {
    id: 'loop_detection',
    name: 'Infinite Loop Detection Protocol',
    description: 'Automatically detect and respond to crew members stuck in processing loops',
    triggerConditions: ['Response time > 300 seconds', 'Repeated identical queries', 'Memory usage spike'],
    procedures: [
      'Initiate emergency role swap',
      'Transfer RAG memories to backup crew member',
      'Isolate affected crew member',
      'Activate emergency processing mode'
    ],
    ragMemoryTransfer: true,
    roleSwapping: true,
    priority: 'high'
  },
  {
    id: 'unresponsive_crew',
    name: 'Unresponsive Crew Protocol',
    description: 'Handle crew members who become unresponsive or offline',
    triggerConditions: ['No response for 10 minutes', 'Heartbeat failure', 'System timeout'],
    procedures: [
      'Declare crew member offline',
      'Activate emergency role assumption',
      'Transfer all RAG memories',
      'Update system permissions',
      'Notify command structure'
    ],
    ragMemoryTransfer: true,
    roleSwapping: true,
    priority: 'critical'
  },
  {
    id: 'performance_degradation',
    name: 'Performance Degradation Protocol',
    description: 'Monitor and respond to significant performance drops',
    triggerConditions: ['Success rate < 80%', 'Response time > 200% normal', 'Error rate > 5%'],
    procedures: [
      'Assess performance metrics',
      'Initiate backup role activation',
      'Transfer critical RAG memories',
      'Monitor system stability'
    ],
    ragMemoryTransfer: true,
    roleSwapping: false,
    priority: 'medium'
  },
  {
    id: 'security_breach',
    name: 'Security Breach Protocol',
    description: 'Emergency response to security incidents',
    triggerConditions: ['Unauthorized access detected', 'Security protocol violation', 'Threat assessment alert'],
    procedures: [
      'Activate emergency security protocols',
      'Transfer security RAG memories to backup',
      'Implement role-based access restrictions',
      'Initiate security incident response'
    ],
    ragMemoryTransfer: true,
    roleSwapping: true,
    priority: 'critical'
  }
]

export default function EmergencyProtocols() {
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null)
  const [selectedProtocol, setSelectedProtocol] = useState<EmergencyProtocol | null>(null)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [ragMemoryTransfer, setRagMemoryTransfer] = useState<{
    from: string
    to: string
    memories: string[]
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
  } | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-theme-role'
      case 'busy': return 'bg-theme-component'
      case 'inactive': return 'bg-gray-500'
      case 'offline': return 'bg-red-500'
      case 'emergency': return 'bg-yellow-500'
      case 'loop_detected': return 'bg-orange-500'
      case 'unresponsive': return 'bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'busy': return '🟡'
      case 'inactive': return '⏸️'
      case 'offline': return '❌'
      case 'emergency': return '🚨'
      case 'loop_detected': return '🔄'
      case 'unresponsive': return '💀'
      default: return '❓'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const initiateEmergencyRoleSwap = async (fromMember: CrewMember, toMember: CrewMember, protocol: EmergencyProtocol) => {
    setRagMemoryTransfer({
      from: fromMember.id,
      to: toMember.id,
      memories: fromMember.ragMemories.roleSpecific[fromMember.role] || [],
      status: 'in_progress'
    })

    // Simulate RAG memory transfer
    setTimeout(() => {
      setRagMemoryTransfer(prev => prev ? { ...prev, status: 'completed' } : null)
    }, 3000)
  }

  const activateEmergencyMode = () => {
    setEmergencyMode(true)
    // Simulate emergency mode activation
    setTimeout(() => setEmergencyMode(false), 10000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-accent mb-4">
          🚨 Emergency Protocols
        </h1>
        <p className="text-xl text-theme-enhancements mb-2">
          Crew Role Swapping and RAG Memory Inheritance System
        </p>
        <p className="text-lg text-theme-enhancements">
          Emergency protocols for crew member failures, loops, and unresponsive states
        </p>
      </div>

      {/* Emergency Mode Toggle */}
      <ContrastCard variant="elevated">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-theme-accent">Emergency Mode Status</h3>
            <p className="text-theme-enhancements">
              {emergencyMode ? 'Emergency protocols are active' : 'System operating normally'}
            </p>
          </div>
          <ContrastButton
            onClick={activateEmergencyMode}
            variant={emergencyMode ? 'role' : 'component'}
            className="px-6 py-3"
          >
            {emergencyMode ? '🚨 Emergency Active' : '🔴 Activate Emergency Mode'}
          </ContrastButton>
        </div>
      </ContrastCard>

      {/* RAG Memory Transfer Status */}
      {ragMemoryTransfer && (
        <ContrastCard variant="elevated">
          <h3 className="text-lg font-bold text-theme-accent mb-4">
            🧠 RAG Memory Transfer in Progress
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-theme-enhancements">From:</span>
              <span className="text-theme-accent">
                {crewMembers.find(m => m.id === ragMemoryTransfer.from)?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-theme-enhancements">To:</span>
              <span className="text-theme-accent">
                {crewMembers.find(m => m.id === ragMemoryTransfer.to)?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-theme-enhancements">Memories:</span>
              <span className="text-theme-component">{ragMemoryTransfer.memories.length} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-theme-enhancements">Status:</span>
              <span className={`px-3 py-1 rounded text-sm ${
                ragMemoryTransfer.status === 'completed' ? 'bg-theme-role text-white' :
                ragMemoryTransfer.status === 'in_progress' ? 'bg-theme-component text-white' :
                ragMemoryTransfer.status === 'failed' ? 'bg-red-500 text-white' :
                'bg-yellow-500 text-black'
              }`}>
                {ragMemoryTransfer.status.toUpperCase()}
              </span>
            </div>
            {ragMemoryTransfer.status === 'completed' && (
              <button
                onClick={() => setRagMemoryTransfer(null)}
                className="text-theme-enhancements hover:text-theme-accent"
              >
                ✕ Close
              </button>
            )}
          </div>
        </ContrastCard>
      )}

      {/* Emergency Protocols */}
      <ContrastCard variant="elevated">
        <h2 className="text-2xl font-bold text-theme-accent mb-6">Emergency Protocols</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emergencyProtocols.map((protocol) => (
            <div
              key={protocol.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                selectedProtocol?.id === protocol.id 
                  ? 'border-theme-component bg-theme-component/10' 
                  : 'border-theme-accent/20 hover:border-theme-accent/40'
              }`}
              onClick={() => setSelectedProtocol(protocol)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-theme-accent">{protocol.name}</h3>
                <span className={`px-2 py-1 rounded text-xs text-white ${getPriorityColor(protocol.priority)}`}>
                  {protocol.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-theme-enhancements text-sm mb-3">{protocol.description}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-theme-enhancements text-xs font-medium">Trigger Conditions:</span>
                  <ul className="text-xs text-theme-enhancements ml-4">
                    {protocol.triggerConditions.slice(0, 2).map((condition, index) => (
                      <li key={index}>• {condition}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    protocol.ragMemoryTransfer ? 'bg-theme-role text-white' : 'bg-gray-400 text-white'
                  }`}>
                    RAG Transfer: {protocol.ragMemoryTransfer ? 'Yes' : 'No'}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    protocol.roleSwapping ? 'bg-theme-component text-white' : 'bg-gray-400 text-white'
                  }`}>
                    Role Swap: {protocol.roleSwapping ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContrastCard>

      {/* Crew Status with Emergency Capabilities */}
      <ContrastCard variant="elevated">
        <h2 className="text-2xl font-bold text-theme-accent mb-6">Crew Emergency Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crewMembers.map((member) => (
            <div
              key={member.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                selectedMember?.id === member.id 
                  ? 'border-theme-component bg-theme-component/10' 
                  : 'border-theme-accent/20 hover:border-theme-accent/40'
              }`}
              onClick={() => setSelectedMember(member)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
                  <span className="text-lg font-bold text-theme-accent">{member.name}</span>
                </div>
                <span className="text-2xl">{getStatusIcon(member.status)}</span>
              </div>

              {/* Role and Status */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-1 text-theme-role">{member.role}</div>
                <div className="text-xs text-theme-enhancements opacity-75">Last active: {member.lastActivity}</div>
              </div>

              {/* Emergency Capabilities */}
              <div className="mb-4">
                <div className="text-xs font-medium text-theme-enhancements mb-2">Can Assume Roles:</div>
                <div className="flex flex-wrap gap-1">
                  {member.emergencyCapabilities.canAssumeRoles.slice(0, 2).map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-theme-role/20 text-theme-role text-xs rounded"
                    >
                      {role}
                    </span>
                  ))}
                  {member.emergencyCapabilities.canAssumeRoles.length > 2 && (
                    <span className="px-2 py-1 bg-gray-400/20 text-gray-400 text-xs rounded">
                      +{member.emergencyCapabilities.canAssumeRoles.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* RAG Memory Access */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    member.ragMemories.roleSpecific[member.role]?.length > 0 ? 'bg-theme-role' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-theme-enhancements">
                    RAG Access: {member.ragMemories.roleSpecific[member.role]?.length || 0} memories
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContrastCard>

      {/* Emergency Role Swap Interface */}
      {selectedMember && selectedProtocol && (
        <ContrastCard variant="elevated">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-theme-accent">
              Emergency Role Swap: {selectedMember.name}
            </h2>
            <button
              onClick={() => {
                setSelectedMember(null)
                setSelectedProtocol(null)
              }}
              className="text-theme-enhancements hover:text-theme-accent"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-6">
            {/* Current Member Status */}
            <div>
              <h3 className="text-lg font-bold text-theme-accent mb-3">Current Status</h3>
              <div className="bg-theme-secondary/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-theme-enhancements">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(selectedMember.status)} text-white`}>
                      {selectedMember.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-theme-enhancements">Success Rate:</span>
                    <span className="ml-2 text-theme-accent">{selectedMember.performance.successRate}%</span>
                  </div>
                  <div>
                    <span className="text-theme-enhancements">Response Time:</span>
                    <span className="ml-2 text-theme-accent">{selectedMember.performance.responseTime}ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Backup Crew */}
            <div>
              <h3 className="text-lg font-bold text-theme-accent mb-3">Available Backup Crew</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crewMembers
                  .filter(member => 
                    member.id !== selectedMember.id && 
                    member.status === 'active' &&
                    member.emergencyCapabilities.canAssumeRoles.includes(selectedMember.role)
                  )
                  .map((backupMember) => (
                    <div key={backupMember.id} className="bg-theme-secondary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-theme-accent">{backupMember.name}</span>
                        <span className="text-2xl">{getStatusIcon(backupMember.status)}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-theme-enhancements text-sm">Success Rate:</span>
                          <span className="ml-2 text-theme-accent">{backupMember.performance.successRate}%</span>
                        </div>
                        <div>
                          <span className="text-theme-enhancements text-sm">Response Time:</span>
                          <span className="ml-2 text-theme-accent">{backupMember.performance.responseTime}ms</span>
                        </div>
                        <ContrastButton
                          onClick={() => initiateEmergencyRoleSwap(selectedMember, backupMember, selectedProtocol)}
                          variant="role"
                          className="w-full mt-3"
                        >
                          🔄 Initiate Role Swap
                        </ContrastButton>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* RAG Memory Transfer Details */}
            <div>
              <h3 className="text-lg font-bold text-theme-accent mb-3">RAG Memory Transfer</h3>
              <div className="bg-theme-secondary/20 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-theme-enhancements font-medium">Role-Specific Memories:</span>
                    <div className="mt-2">
                      {selectedMember.ragMemories.roleSpecific[selectedMember.role]?.map((memory, index) => (
                        <div key={index} className="text-sm text-theme-enhancements ml-4">• {memory}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-theme-enhancements font-medium">Shared Memories:</span>
                    <div className="mt-2">
                      {selectedMember.ragMemories.shared.map((memory, index) => (
                        <div key={index} className="text-sm text-theme-enhancements ml-4">• {memory}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-theme-enhancements font-medium">Emergency Memories:</span>
                    <div className="mt-2">
                      {selectedMember.ragMemories.emergency.map((memory, index) => (
                        <div key={index} className="text-sm text-theme-enhancements ml-4">• {memory}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContrastCard>
      )}

      {/* System Logic Explanation */}
      <ContrastCard variant="elevated">
        <h3 className="text-2xl font-bold text-theme-accent mb-4">
          🧠 Emergency Protocol Logic: How RAG Memory Inheritance Works
        </h3>
        <div className="space-y-4 text-theme-enhancements">
          <div>
            <strong className="text-theme-accent">1. Emergency Detection:</strong>
            <p className="mt-1">The system continuously monitors crew member performance, response times, and status. When predefined thresholds are exceeded, emergency protocols are automatically triggered.</p>
          </div>
          <div>
            <strong className="text-theme-accent">2. Backup Crew Selection:</strong>
            <p className="mt-1">The system identifies available crew members who can assume the failed crew member's role based on their emergency capabilities and cross-training.</p>
          </div>
          <div>
            <strong className="text-theme-accent">3. RAG Memory Transfer:</strong>
            <p className="mt-1">All role-specific RAG memories, shared knowledge, and emergency protocols are transferred to the backup crew member, ensuring continuity of operations.</p>
          </div>
          <div>
            <strong className="text-theme-accent">4. Role Assumption:</strong>
            <p className="mt-1">The backup crew member assumes the full responsibilities of the failed crew member, including component ownership and decision-making authority.</p>
          </div>
          <div>
            <strong className="text-theme-accent">5. System Continuity:</strong>
            <p className="mt-1">The system maintains full functionality while the original crew member is isolated, diagnosed, and potentially recovered or replaced.</p>
          </div>
        </div>
      </ContrastCard>
    </div>
  )
}


