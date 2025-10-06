'use client'

import { useState } from 'react'
import { ContrastCard, ContrastText, ContrastButton } from '@/components/ContrastAware'

interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'busy' | 'inactive' | 'offline'
  component: string
  enhancements: string[]
  responsibilities: {
    primary: string[]
    secondary: string[]
    technical: string[]
  }
  vectorDataAccess: {
    canQuery: boolean
    specializedKnowledge: string[]
  }
}

const crewMembers: CrewMember[] = [
  {
    id: 'captain_picard',
    name: 'Captain Jean-Luc Picard',
    role: 'Strategic Commander',
    specialization: ['Strategic Leadership', 'Mission Planning', 'Decision Making'],
    status: 'active',
    component: 'Status Indicator',
    enhancements: [
      'Connection quality metrics',
      'Status history tracking',
      'Status change animations'
    ],
    responsibilities: {
      primary: [
        'Overall system status monitoring',
        'Strategic decision making',
        'Mission coordination',
        'High-level system oversight'
      ],
      secondary: [
        'User experience optimization',
        'System performance evaluation',
        'Crew coordination',
        'External communication'
      ],
      technical: [
        'Status indicator accuracy',
        'Real-time monitoring systems',
        'Alert and notification management',
        'System health metrics'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'Strategic planning data',
        'Mission success patterns',
        'System performance history',
        'Crew efficiency metrics'
      ]
    }
  },
  {
    id: 'commander_riker',
    name: 'Commander William Riker',
    role: 'First Officer',
    specialization: ['Tactical Operations', 'Workflow Management', 'Execution'],
    status: 'active',
    component: 'Control Groups',
    enhancements: [
      'Real-time validation feedback',
      'Input history tracking',
      'Autocomplete functionality'
    ],
    responsibilities: {
      primary: [
        'Control group management',
        'Input validation systems',
        'User interaction handling',
        'Operational workflow execution'
      ],
      secondary: [
        'Team coordination',
        'Task delegation',
        'Process optimization',
        'Quality assurance'
      ],
      technical: [
        'Form validation logic',
        'Input processing systems',
        'User feedback mechanisms',
        'Control state management'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'Operational procedures',
        'Workflow optimization patterns',
        'User interaction data',
        'Process efficiency metrics'
      ]
    }
  },
  {
    id: 'commander_data',
    name: 'Commander Data',
    role: 'Operations Officer',
    specialization: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
    status: 'active',
    component: 'Sidebar',
    enhancements: [
      'Collapsible sections',
      'Responsive width adjustment',
      'Keyboard navigation'
    ],
    responsibilities: {
      primary: [
        'Sidebar functionality management',
        'Navigation system optimization',
        'Data processing and analysis',
        'Logical system operations'
      ],
      secondary: [
        'User interface logic',
        'System responsiveness',
        'Accessibility compliance',
        'Performance optimization'
      ],
      technical: [
        'Sidebar state management',
        'Responsive design implementation',
        'Keyboard navigation systems',
        'Data processing algorithms'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'Analytical patterns',
        'Data processing algorithms',
        'User behavior analytics',
        'System performance metrics'
      ]
    }
  },
  {
    id: 'geordi_la_forge',
    name: 'Lieutenant Commander Geordi La Forge',
    role: 'Chief Engineer',
    specialization: ['Infrastructure', 'System Integration', 'Technical Solutions'],
    status: 'active',
    component: 'Connection Info',
    enhancements: [
      'Security status indicators',
      'Connection encryption status',
      'Threat detection alerts'
    ],
    responsibilities: {
      primary: [
        'Connection management systems',
        'Infrastructure monitoring',
        'Technical integration',
        'System reliability assurance'
      ],
      secondary: [
        'Security implementation',
        'Performance optimization',
        'Technical troubleshooting',
        'System maintenance'
      ],
      technical: [
        'Connection protocols',
        'Security implementations',
        'Infrastructure monitoring',
        'System integration APIs'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'Infrastructure patterns',
        'Technical integration data',
        'System reliability metrics',
        'Security implementation logs'
      ]
    }
  },
  {
    id: 'lieutenant_worf',
    name: 'Lieutenant Worf',
    role: 'Security Officer',
    specialization: ['Security Protocols', 'Threat Assessment', 'Compliance'],
    status: 'active',
    component: 'Crew Grid',
    enhancements: [
      'Individual status indicators',
      'Recent crew activities',
      'Detailed crew member views'
    ],
    responsibilities: {
      primary: [
        'Crew grid security management',
        'Access control enforcement',
        'Threat assessment and monitoring',
        'Security protocol implementation'
      ],
      secondary: [
        'Crew member oversight',
        'Activity monitoring',
        'Compliance verification',
        'Security incident response'
      ],
      technical: [
        'Access control systems',
        'Security monitoring tools',
        'Threat detection algorithms',
        'Compliance validation systems'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'Security threat patterns',
        'Access control logs',
        'Compliance metrics',
        'Security incident data'
      ]
    }
  },
  {
    id: 'counselor_troi',
    name: 'Counselor Deanna Troi',
    role: 'Ship\'s Counselor',
    specialization: ['User Experience', 'Communication', 'Team Dynamics'],
    status: 'active',
    component: 'System Logs',
    enhancements: [
      'Log filtering and search',
      'Log export functionality',
      'Log analytics dashboard'
    ],
    responsibilities: {
      primary: [
        'System log management and analysis',
        'User experience optimization',
        'Communication system oversight',
        'Team dynamics monitoring'
      ],
      secondary: [
        'User feedback analysis',
        'System behavior interpretation',
        'Team coordination support',
        'Experience improvement'
      ],
      technical: [
        'Log processing systems',
        'User experience analytics',
        'Communication protocols',
        'Behavioral analysis tools'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'User behavior patterns',
        'Communication effectiveness data',
        'Team dynamics metrics',
        'Experience optimization insights'
      ]
    }
  },
  {
    id: 'dr_crusher',
    name: 'Dr. Beverly Crusher',
    role: 'Chief Medical Officer',
    specialization: ['System Health', 'Diagnostics', 'Wellness'],
    status: 'active',
    component: 'Health Monitoring',
    enhancements: [
      'Real-time health metrics',
      'Diagnostic tools',
      'Wellness recommendations'
    ],
    responsibilities: {
      primary: [
        'System health monitoring',
        'Diagnostic system management',
        'Wellness optimization',
        'Health metric analysis'
      ],
      secondary: [
        'Preventive maintenance',
        'Health trend analysis',
        'System recovery support',
        'Performance optimization'
      ],
      technical: [
        'Health monitoring systems',
        'Diagnostic algorithms',
        'Wellness assessment tools',
        'Health metric processing'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'System health patterns',
        'Diagnostic procedures',
        'Wellness optimization data',
        'Health metric trends'
      ]
    }
  },
  {
    id: 'lieutenant_uhura',
    name: 'Lieutenant Uhura',
    role: 'Communications Officer',
    specialization: ['Communication Protocols', 'Synchronization', 'Integration'],
    status: 'active',
    component: 'Communication Hub',
    enhancements: [
      'Protocol management',
      'Synchronization monitoring',
      'Integration status tracking'
    ],
    responsibilities: {
      primary: [
        'Communication protocol management',
        'System synchronization oversight',
        'Integration coordination',
        'Communication system reliability'
      ],
      secondary: [
        'Network optimization',
        'Protocol standardization',
        'Integration testing',
        'Communication efficiency'
      ],
      technical: [
        'Protocol implementation',
        'Synchronization systems',
        'Integration APIs',
        'Communication monitoring'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'Communication patterns',
        'Protocol effectiveness data',
        'Synchronization metrics',
        'Integration success rates'
      ]
    }
  },
  {
    id: 'quark',
    name: 'Quark',
    role: 'Business Operations',
    specialization: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics'],
    status: 'active',
    component: 'Business Analytics',
    enhancements: [
      'Cost tracking systems',
      'Efficiency metrics',
      'Business intelligence dashboards'
    ],
    responsibilities: {
      primary: [
        'Business analytics management',
        'Cost optimization oversight',
        'Efficiency analysis and reporting',
        'Business metric monitoring'
      ],
      secondary: [
        'Resource allocation optimization',
        'Performance cost analysis',
        'Business intelligence gathering',
        'Operational efficiency improvement'
      ],
      technical: [
        'Analytics processing systems',
        'Cost tracking algorithms',
        'Efficiency calculation tools',
        'Business metric dashboards'
      ]
    },
    vectorDataAccess: {
      canQuery: true,
      specializedKnowledge: [
        'Business performance patterns',
        'Cost optimization strategies',
        'Efficiency improvement data',
        'Business intelligence insights'
      ]
    }
  }
]

export default function CrewResponsibilities() {
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'technical'>('overview')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-theme-role'
      case 'busy': return 'bg-theme-component'
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-accent mb-4">
          🖖 Crew Responsibility Matrix
        </h1>
        <p className="text-xl text-theme-enhancements mb-2">
          Internal System Logic: How Crew Members are Associated with Components
        </p>
        <p className="text-lg text-theme-enhancements">
          Understanding the computer's definition of crew responsibilities and component ownership
        </p>
      </div>

      {/* View Mode Selector */}
      <ContrastCard variant="elevated">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-theme-accent font-medium">View Mode:</span>
          <div className="flex space-x-2">
            {[
              { mode: 'overview', label: 'Overview', icon: '📊' },
              { mode: 'detailed', label: 'Detailed', icon: '🔍' },
              { mode: 'technical', label: 'Technical', icon: '⚙️' }
            ].map(({ mode, label, icon }) => (
              <ContrastButton
                key={mode}
                onClick={() => setViewMode(mode as any)}
                variant={viewMode === mode ? 'role' : 'secondary'}
                className="px-4 py-2"
              >
                {icon} {label}
              </ContrastButton>
            ))}
          </div>
        </div>
      </ContrastCard>

      {/* Crew Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crewMembers.map((member) => (
          <ContrastCard
            key={member.id}
            variant="elevated"
            className={`cursor-pointer hover:scale-105 transition-all duration-300 ${
              selectedMember?.id === member.id ? 'ring-2 ring-theme-component' : ''
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

            {/* Role and Component */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-1 text-theme-role">{member.role}</div>
              <div className="text-sm mb-2 text-theme-component">
                Component: {member.component}
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-4">
              <div className="text-xs font-medium text-theme-enhancements mb-2">Specializations:</div>
              <div className="flex flex-wrap gap-1">
                {member.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-theme-component/20 text-theme-component text-xs rounded"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Vector Data Access */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  member.vectorDataAccess.canQuery ? 'bg-theme-role' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-theme-enhancements">
                  Vector Access: {member.vectorDataAccess.canQuery ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <span className="text-xs text-theme-enhancements">
                {member.specialization.length} specializations
              </span>
            </div>
          </ContrastCard>
        ))}
      </div>

      {/* Detailed View */}
      {selectedMember && (
        <ContrastCard variant="elevated">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-theme-accent">
              {selectedMember.name} - {selectedMember.component}
            </h2>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-theme-enhancements hover:text-theme-accent"
            >
              ✕ Close
            </button>
          </div>

          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Component Association Logic */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  🧠 Computer's Logic for Component Assignment
                </h3>
                <div className="bg-theme-secondary/20 rounded-lg p-4">
                  <p className="text-theme-enhancements mb-3">
                    <strong className="text-theme-accent">Why {selectedMember.name} manages {selectedMember.component}:</strong>
                  </p>
                  <ul className="space-y-2 text-theme-enhancements">
                    <li>• <strong>Role Alignment:</strong> {selectedMember.role} aligns with {selectedMember.component} functionality</li>
                    <li>• <strong>Specialization Match:</strong> {selectedMember.specialization.join(', ')} directly relates to component requirements</li>
                    <li>• <strong>Responsibility Scope:</strong> Component falls within crew member's operational domain</li>
                    <li>• <strong>System Architecture:</strong> Modular assignment ensures clear ownership and accountability</li>
                  </ul>
                </div>
              </div>

              {/* Enhancement Recommendations */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  🚀 Enhancement Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMember.enhancements.map((enhancement, index) => (
                    <div key={index} className="bg-theme-secondary/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-theme-role">→</span>
                        <span className="text-theme-enhancements">{enhancement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'detailed' && (
            <div className="space-y-6">
              {/* Primary Responsibilities */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  🎯 Primary Responsibilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMember.responsibilities.primary.map((responsibility, index) => (
                    <div key={index} className="bg-theme-role/10 border-l-4 border-theme-role p-3 rounded">
                      <span className="text-theme-enhancements">{responsibility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Responsibilities */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  🔄 Secondary Responsibilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMember.responsibilities.secondary.map((responsibility, index) => (
                    <div key={index} className="bg-theme-component/10 border-l-4 border-theme-component p-3 rounded">
                      <span className="text-theme-enhancements">{responsibility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vector Data Access */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  🧬 Vector Data Access
                </h3>
                <div className="bg-theme-secondary/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedMember.vectorDataAccess.canQuery ? 'bg-theme-role' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-theme-enhancements">
                      Access Status: {selectedMember.vectorDataAccess.canQuery ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-theme-enhancements font-medium">Specialized Knowledge Areas:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMember.vectorDataAccess.specializedKnowledge.map((knowledge, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-theme-role/20 text-theme-role text-sm rounded-full"
                        >
                          {knowledge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'technical' && (
            <div className="space-y-6">
              {/* Technical Responsibilities */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  ⚙️ Technical Responsibilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMember.responsibilities.technical.map((responsibility, index) => (
                    <div key={index} className="bg-theme-secondary/20 border border-theme-accent/20 p-3 rounded">
                      <span className="text-theme-enhancements">{responsibility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Architecture */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  🏗️ System Architecture Integration
                </h3>
                <div className="bg-theme-secondary/20 rounded-lg p-4">
                  <div className="space-y-3 text-theme-enhancements">
                    <div>
                      <strong className="text-theme-accent">Component:</strong> {selectedMember.component}
                    </div>
                    <div>
                      <strong className="text-theme-accent">Integration Level:</strong> Deep Integration
                    </div>
                    <div>
                      <strong className="text-theme-accent">Access Level:</strong> Full Component Control
                    </div>
                    <div>
                      <strong className="text-theme-accent">Monitoring Scope:</strong> Real-time Component Health
                    </div>
                    <div>
                      <strong className="text-theme-accent">Decision Authority:</strong> Component Enhancement Approval
                    </div>
                  </div>
                </div>
              </div>

              {/* Vector Query Capabilities */}
              <div>
                <h3 className="text-lg font-bold text-theme-accent mb-3">
                  🔍 Vector Query Capabilities
                </h3>
                <div className="bg-theme-secondary/20 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-theme-enhancements">Can Query Vector Data:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        selectedMember.vectorDataAccess.canQuery 
                          ? 'bg-theme-role/20 text-theme-role' 
                          : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {selectedMember.vectorDataAccess.canQuery ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-enhancements font-medium">Query Specializations:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedMember.vectorDataAccess.specializedKnowledge.map((knowledge, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-theme-role/20 text-theme-role text-sm rounded-full"
                          >
                            {knowledge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ContrastCard>
      )}

      {/* System Logic Explanation */}
      <ContrastCard variant="elevated">
        <h3 className="text-2xl font-bold text-theme-accent mb-4">
          🧠 Computer's Internal Logic: Why This Architecture?
        </h3>
        <div className="space-y-4 text-theme-enhancements">
          <div>
            <strong className="text-theme-accent">1. Modular Responsibility Assignment:</strong>
            <p className="mt-1">Each crew member is assigned to a specific component to ensure clear ownership, accountability, and expertise development. This prevents overlapping responsibilities and ensures focused attention on component optimization.</p>
          </div>
          <div>
            <strong className="text-theme-accent">2. Role-Component Alignment:</strong>
            <p className="mt-1">Crew roles are mapped to components based on their specializations and operational domains. For example, Commander Data's analytical capabilities align perfectly with sidebar functionality and navigation logic.</p>
          </div>
          <div>
            <strong className="text-theme-accent">3. Enhancement Ownership:</strong>
            <p className="mt-1">Each crew member's "Enhancement Recommendations" represent their direct responsibility for improving their assigned component. This creates a clear development roadmap with accountable owners.</p>
          </div>
          <div>
            <strong className="text-theme-accent">4. Vector Data Specialization:</strong>
            <p className="mt-1">Each crew member has access to specialized vector data relevant to their component and responsibilities. This enables them to make informed decisions and provide expert insights within their domain.</p>
          </div>
          <div>
            <strong className="text-theme-accent">5. System Coherence:</strong>
            <p className="mt-1">This architecture ensures that every component has a dedicated expert who understands its purpose, can optimize its performance, and can communicate its status to other crew members effectively.</p>
          </div>
        </div>
      </ContrastCard>
    </div>
  )
}
