'use client'

interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'inactive'
  component: string
  enhancements: string[]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    id: 'dr_crusher',
    name: 'Dr. Beverly Crusher',
    role: 'Chief Medical Officer',
    specialization: ['System Health', 'Diagnostics', 'Wellness'],
    status: 'active',
    component: 'Performance Monitor',
    enhancements: [
      'Real-time performance metrics',
      'Health trend analysis',
      'Automated health checks'
    ]
  },
  {
    id: 'lieutenant_uhura',
    name: 'Lieutenant Uhura',
    role: 'Communications Officer',
    specialization: ['Communication Protocols', 'Synchronization', 'Integration'],
    status: 'active',
    component: 'Message Center',
    enhancements: [
      'Message queuing system',
      'Priority message handling',
      'Communication protocol monitoring'
    ]
  },
  {
    id: 'quark',
    name: 'Quark',
    role: 'Business Operations',
    specialization: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics'],
    status: 'active',
    component: 'Analytics Dashboard',
    enhancements: [
      'Business metrics tracking',
      'Cost optimization recommendations',
      'Efficiency analysis reports'
    ]
  }
]

export default function CrewGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {crewMembers.map((member) => (
        <div
          key={member.id}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-2">
              {member.name}
            </h3>
            <div className="text-sm font-medium text-green-400 mb-2">
              {member.role}
            </div>
            <div className="text-sm text-yellow-400 mb-3">
              Component: {member.component}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-white mb-2">
              Enhancement Recommendations:
            </div>
            <ul className="space-y-1">
              {member.enhancements.map((enhancement, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  {enhancement}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                member.status === 'active' ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm text-gray-300 capitalize">
                {member.status}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              {member.specialization.length} specializations
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
