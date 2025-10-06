'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Enhanced Agentic Architecture Types
export interface CrewMember {
  id: string
  name: string
  role: string
  specialization: string[]
  status: 'active' | 'busy' | 'inactive' | 'offline'
  lastActivity: string
  currentTask?: string
  performance: {
    tasksCompleted: number
    successRate: number
    responseTime: number
  }
  vectorDataAccess: {
    canQuery: boolean
    lastQuery: string
    queryHistory: string[]
    specializedKnowledge: string[]
  }
}

export interface ShipComputerResponse {
  timestamp: string
  request: string
  crewContributions: {
    memberId: string
    contribution: string
    confidence: number
    vectorDataUsed: string[]
  }[]
  unifiedResponse: string
  confidence: number
  executionTime: number
}

export interface VectorQuery {
  id: string
  crewMemberId: string
  query: string
  results: any[]
  timestamp: string
  relevanceScore: number
}

// Enhanced Agentic Context
interface AgenticContextType {
  // Crew Management
  crewMembers: CrewMember[]
  activeCrew: CrewMember[]
  
  // Ship's Computer
  shipComputerResponses: ShipComputerResponse[]
  currentRequest: string
  
  // Vector Data Access
  vectorQueries: VectorQuery[]
  supabaseConnection: {
    connected: boolean
    lastSync: string
    totalVectors: number
  }
  
  // Agentic Functions
  processRequest: (request: string) => Promise<ShipComputerResponse>
  queryVectorData: (crewMemberId: string, query: string) => Promise<VectorQuery>
  updateCrewStatus: (memberId: string, status: CrewMember['status']) => void
  getCrewSpecialization: (specialization: string) => CrewMember[]
  
  // Ship's Computer Voice
  generateShipResponse: (response: ShipComputerResponse) => string
}

const AgenticContext = createContext<AgenticContextType | undefined>(undefined)

// Enhanced Crew Members with Vector Data Access
const enhancedCrewMembers: CrewMember[] = [
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
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'strategic planning best practices',
      queryHistory: [
        'strategic planning best practices',
        'mission objective prioritization',
        'decision making frameworks'
      ],
      specializedKnowledge: [
        'Strategic planning methodologies',
        'Mission objective prioritization',
        'Decision making frameworks',
        'Leadership principles',
        'Risk assessment strategies'
      ]
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
    },
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'WCAG contrast ratio calculations',
      queryHistory: [
        'WCAG contrast ratio calculations',
        'accessibility compliance standards',
        'data processing optimization'
      ],
      specializedKnowledge: [
        'WCAG accessibility standards',
        'Contrast ratio calculations',
        'Data processing algorithms',
        'AI/ML model optimization',
        'Analytics frameworks'
      ]
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
    },
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'CSS architecture best practices',
      queryHistory: [
        'CSS architecture best practices',
        'system integration patterns',
        'infrastructure optimization'
      ],
      specializedKnowledge: [
        'CSS architecture patterns',
        'System integration methodologies',
        'Infrastructure optimization',
        'Technical solution design',
        'Performance optimization'
      ]
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
    },
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'system health monitoring protocols',
      queryHistory: [
        'system health monitoring protocols',
        'diagnostic procedures',
        'wellness optimization'
      ],
      specializedKnowledge: [
        'System health monitoring',
        'Diagnostic procedures',
        'Wellness optimization',
        'Performance metrics',
        'Health compliance standards'
      ]
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
    },
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'security protocol compliance',
      queryHistory: [
        'security protocol compliance',
        'threat assessment methodologies',
        'compliance frameworks'
      ],
      specializedKnowledge: [
        'Security protocol design',
        'Threat assessment methodologies',
        'Compliance frameworks',
        'Risk mitigation strategies',
        'Security monitoring systems'
      ]
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
    },
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'user experience optimization',
      queryHistory: [
        'user experience optimization',
        'communication effectiveness',
        'team dynamics analysis'
      ],
      specializedKnowledge: [
        'User experience design',
        'Communication strategies',
        'Team dynamics optimization',
        'Feedback analysis',
        'Interface design principles'
      ]
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
    },
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'communication protocol optimization',
      queryHistory: [
        'communication protocol optimization',
        'synchronization strategies',
        'integration patterns'
      ],
      specializedKnowledge: [
        'Communication protocol design',
        'Synchronization strategies',
        'Integration patterns',
        'Data flow optimization',
        'Protocol compliance'
      ]
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
    },
    vectorDataAccess: {
      canQuery: true,
      lastQuery: 'resource allocation optimization',
      queryHistory: [
        'resource allocation optimization',
        'efficiency analysis methods',
        'business metrics tracking'
      ],
      specializedKnowledge: [
        'Resource allocation strategies',
        'Efficiency analysis methods',
        'Business metrics tracking',
        'Cost optimization techniques',
        'Performance measurement'
      ]
    }
  }
]

export function AgenticProvider({ children }: { children: ReactNode }) {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(enhancedCrewMembers)
  const [shipComputerResponses, setShipComputerResponses] = useState<ShipComputerResponse[]>([])
  const [currentRequest, setCurrentRequest] = useState<string>('')
  const [vectorQueries, setVectorQueries] = useState<VectorQuery[]>([])
  const [supabaseConnection, setSupabaseConnection] = useState({
    connected: true,
    lastSync: new Date().toISOString(),
    totalVectors: 1250
  })

  const activeCrew = crewMembers.filter(member => member.status === 'active')

  // Process a request through the enhanced agentic system
  const processRequest = async (request: string): Promise<ShipComputerResponse> => {
    const startTime = Date.now()
    setCurrentRequest(request)

    // Simulate crew member vector data queries
    const crewContributions = await Promise.all(
      activeCrew.map(async (member) => {
        const relevantQuery = generateRelevantQuery(member, request)
        const vectorQuery = await queryVectorData(member.id, relevantQuery)
        
        return {
          memberId: member.id,
          contribution: generateContribution(member, request, vectorQuery),
          confidence: calculateConfidence(member, vectorQuery),
          vectorDataUsed: vectorQuery.results.map(r => r.title || r.id)
        }
      })
    )

    // Generate unified Ship's Computer response
    const unifiedResponse = generateUnifiedResponse(request, crewContributions)
    const confidence = calculateOverallConfidence(crewContributions)
    const executionTime = Date.now() - startTime

    const response: ShipComputerResponse = {
      timestamp: new Date().toISOString(),
      request,
      crewContributions,
      unifiedResponse,
      confidence,
      executionTime
    }

    setShipComputerResponses(prev => [response, ...prev.slice(0, 9)]) // Keep last 10
    return response
  }

  // Query vector data for a specific crew member
  const queryVectorData = async (crewMemberId: string, query: string): Promise<VectorQuery> => {
    const member = crewMembers.find(m => m.id === crewMemberId)
    if (!member) {
      throw new Error(`Crew member ${crewMemberId} not found`)
    }

    // Simulate vector data query
    const results = simulateVectorQuery(query, member.specialization)
    const relevanceScore = calculateRelevanceScore(query, member.specialization)

    const vectorQuery: VectorQuery = {
      id: `query_${Date.now()}_${crewMemberId}`,
      crewMemberId,
      query,
      results,
      timestamp: new Date().toISOString(),
      relevanceScore
    }

    setVectorQueries(prev => [vectorQuery, ...prev.slice(0, 49)]) // Keep last 50
    return vectorQuery
  }

  // Update crew member status
  const updateCrewStatus = (memberId: string, status: CrewMember['status']) => {
    setCrewMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, status, lastActivity: 'Just now' }
          : member
      )
    )
  }

  // Get crew members by specialization
  const getCrewSpecialization = (specialization: string): CrewMember[] => {
    return crewMembers.filter(member => 
      member.specialization.some(spec => 
        spec.toLowerCase().includes(specialization.toLowerCase())
      )
    )
  }

  // Generate Ship's Computer response in Majel Barrett voice
  const generateShipResponse = (response: ShipComputerResponse): string => {
    const { request, crewContributions, unifiedResponse, confidence, executionTime } = response
    
    let shipResponse = `"Acknowledged, Captain. I have processed your request: "${request}"\n\n`
    
    if (crewContributions.length > 0) {
      shipResponse += `"All crew members have contributed their specialized knowledge to this mission:\n`
      crewContributions.forEach(contrib => {
        const member = crewMembers.find(m => m.id === contrib.memberId)
        if (member) {
          shipResponse += `"${member.name} reports: ${contrib.contribution}"\n`
        }
      })
      shipResponse += `\n"`
    }
    
    shipResponse += `"${unifiedResponse}"\n\n`
    shipResponse += `"Mission confidence level: ${confidence}%\n`
    shipResponse += `"Execution time: ${executionTime}ms\n`
    shipResponse += `"All systems nominal, Captain."`
    
    return shipResponse
  }

  // Helper functions
  const generateRelevantQuery = (member: CrewMember, request: string): string => {
    const relevantSpecialization = member.specialization.find(spec => 
      request.toLowerCase().includes(spec.toLowerCase().split(' ')[0])
    )
    return relevantSpecialization || member.specialization[0]
  }

  const generateContribution = (member: CrewMember, request: string, vectorQuery: VectorQuery): string => {
    const specialization = member.specialization[0]
    return `Based on ${specialization} expertise, I recommend ${vectorQuery.results.length} relevant solutions with ${vectorQuery.relevanceScore}% relevance.`
  }

  const calculateConfidence = (member: CrewMember, vectorQuery: VectorQuery): number => {
    return Math.min(100, (member.performance.successRate + vectorQuery.relevanceScore) / 2)
  }

  const generateUnifiedResponse = (request: string, contributions: any[]): string => {
    const avgConfidence = contributions.reduce((sum, c) => sum + c.confidence, 0) / contributions.length
    return `All crew members have successfully analyzed your request. The mission objective has been achieved with ${avgConfidence.toFixed(1)}% confidence. All systems are ready for deployment.`
  }

  const calculateOverallConfidence = (contributions: any[]): number => {
    return Math.round(contributions.reduce((sum, c) => sum + c.confidence, 0) / contributions.length)
  }

  const simulateVectorQuery = (query: string, specializations: string[]): any[] => {
    // Simulate vector database results
    return [
      { id: '1', title: `${specializations[0]} Best Practices`, relevance: 0.95 },
      { id: '2', title: `${specializations[1]} Optimization`, relevance: 0.87 },
      { id: '3', title: `${specializations[2]} Framework`, relevance: 0.82 }
    ]
  }

  const calculateRelevanceScore = (query: string, specializations: string[]): number => {
    const matches = specializations.filter(spec => 
      query.toLowerCase().includes(spec.toLowerCase().split(' ')[0])
    ).length
    return Math.round((matches / specializations.length) * 100)
  }

  const value: AgenticContextType = {
    crewMembers,
    activeCrew,
    shipComputerResponses,
    currentRequest,
    vectorQueries,
    supabaseConnection,
    processRequest,
    queryVectorData,
    updateCrewStatus,
    getCrewSpecialization,
    generateShipResponse
  }

  return (
    <AgenticContext.Provider value={value}>
      {children}
    </AgenticContext.Provider>
  )
}

export function useAgentic() {
  const context = useContext(AgenticContext)
  if (context === undefined) {
    throw new Error('useAgentic must be used within an AgenticProvider')
  }
  return context
}


