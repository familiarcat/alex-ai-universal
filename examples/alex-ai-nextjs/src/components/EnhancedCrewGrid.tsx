'use client'

import { useState } from 'react'
import { useAgentic, CrewMember } from '@/contexts/AgenticContext'
import { ContrastCard, ContrastText, ContrastButton } from './ContrastAware'

export default function EnhancedCrewGrid() {
  const { crewMembers, queryVectorData, updateCrewStatus } = useAgentic()
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null)
  const [vectorQuery, setVectorQuery] = useState('')
  const [queryResults, setQueryResults] = useState<any[]>([])

  const handleVectorQuery = async (member: CrewMember) => {
    if (!vectorQuery.trim()) return
    
    try {
      const result = await queryVectorData(member.id, vectorQuery)
      setQueryResults(result.results)
    } catch (error) {
      console.error('Error querying vector data:', error)
    }
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-theme-accent mb-2">
          👥 Enhanced Crew Status
        </h2>
        <p className="text-theme-enhancements">
          Individual Vector Data Access & Specialized Knowledge
        </p>
      </div>

      {/* Crew Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crewMembers.map((member) => (
          <ContrastCard
            key={member.id}
            variant="elevated"
            className="hover:scale-105 transition-all duration-300 cursor-pointer"
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
              <div className="text-xs text-theme-enhancements opacity-75">
                Last active: {member.lastActivity}
              </div>
            </div>

            {/* Current Task */}
            {member.currentTask && (
              <div className="mb-4">
                <div className="text-xs font-medium text-theme-enhancements mb-1">Current Task:</div>
                <div className="text-sm text-theme-accent bg-theme-secondary/20 rounded p-2">
                  {member.currentTask}
                </div>
              </div>
            )}

            {/* Vector Data Access Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-theme-enhancements">Vector Data Access</span>
                <div className={`w-2 h-2 rounded-full ${member.vectorDataAccess.canQuery ? 'bg-theme-role' : 'bg-red-500'}`}></div>
              </div>
              <div className="text-xs text-theme-enhancements opacity-75">
                Last query: {member.vectorDataAccess.lastQuery}
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-4">
              <div className="text-xs font-medium text-theme-enhancements mb-2">Specializations:</div>
              <div className="flex flex-wrap gap-1">
                {member.specialization.slice(0, 2).map((spec, index) => (
                  <span
                    key={index}
                    className="text-xs bg-theme-component/20 text-theme-component px-2 py-1 rounded"
                  >
                    {spec}
                  </span>
                ))}
                {member.specialization.length > 2 && (
                  <span className="text-xs text-theme-enhancements opacity-75">
                    +{member.specialization.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-t border-theme-accent/10 pt-4">
              <div className="text-xs font-medium text-theme-enhancements mb-2">Performance</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-theme-accent">{member.performance.tasksCompleted}</div>
                  <div className="text-xs text-theme-enhancements opacity-75">Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-theme-role">{member.performance.successRate}%</div>
                  <div className="text-xs text-theme-enhancements opacity-75">Success</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-theme-component">{member.performance.responseTime}ms</div>
                  <div className="text-xs text-theme-enhancements opacity-75">Response</div>
                </div>
              </div>
            </div>
          </ContrastCard>
        ))}
      </div>

      {/* Crew Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ContrastCard variant="elevated" className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-theme-accent">{selectedMember.name}</h3>
                <div className="text-theme-role font-medium">{selectedMember.role}</div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-theme-enhancements hover:text-theme-accent text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Member Info */}
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h4 className="text-lg font-bold text-theme-accent mb-3">Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-theme-enhancements">Current Status:</span>
                      <span className="text-theme-accent capitalize">{selectedMember.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-enhancements">Last Activity:</span>
                      <span className="text-theme-accent">{selectedMember.lastActivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-enhancements">Current Task:</span>
                      <span className="text-theme-accent">{selectedMember.currentTask || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h4 className="text-lg font-bold text-theme-accent mb-3">Specializations</h4>
                  <div className="space-y-2">
                    {selectedMember.specialization.map((spec, index) => (
                      <div key={index} className="bg-theme-component/20 text-theme-component px-3 py-2 rounded">
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialized Knowledge */}
                <div>
                  <h4 className="text-lg font-bold text-theme-accent mb-3">Specialized Knowledge</h4>
                  <div className="space-y-2">
                    {selectedMember.vectorDataAccess.specializedKnowledge.map((knowledge, index) => (
                      <div key={index} className="text-sm text-theme-enhancements bg-theme-secondary/20 px-3 py-2 rounded">
                        {knowledge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Vector Data Access */}
              <div className="space-y-6">
                {/* Vector Data Access */}
                <div>
                  <h4 className="text-lg font-bold text-theme-accent mb-3">Vector Data Access</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-theme-accent font-medium mb-2">
                        Query Vector Database
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={vectorQuery}
                          onChange={(e) => setVectorQuery(e.target.value)}
                          placeholder="Enter your query..."
                          className="flex-1 contrast-input px-3 py-2 text-theme-accent"
                        />
                        <ContrastButton
                          onClick={() => handleVectorQuery(selectedMember)}
                          variant="component"
                          disabled={!vectorQuery.trim()}
                        >
                          Query
                        </ContrastButton>
                      </div>
                    </div>

                    {/* Query History */}
                    <div>
                      <h5 className="text-theme-accent font-medium mb-2">Recent Queries</h5>
                      <div className="space-y-1">
                        {selectedMember.vectorDataAccess.queryHistory.map((query, index) => (
                          <div key={index} className="text-sm text-theme-enhancements bg-theme-secondary/20 px-3 py-2 rounded">
                            {query}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Query Results */}
                    {queryResults.length > 0 && (
                      <div>
                        <h5 className="text-theme-accent font-medium mb-2">Query Results</h5>
                        <div className="space-y-2">
                          {queryResults.map((result, index) => (
                            <div key={index} className="bg-theme-component/20 text-theme-component px-3 py-2 rounded">
                              <div className="font-medium">{result.title}</div>
                              <div className="text-xs opacity-75">
                                Relevance: {Math.round(result.relevance * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <h4 className="text-lg font-bold text-theme-accent mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-theme-accent">
                        {selectedMember.performance.tasksCompleted}
                      </div>
                      <div className="text-theme-enhancements text-sm">Tasks Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-theme-role">
                        {selectedMember.performance.successRate}%
                      </div>
                      <div className="text-theme-enhancements text-sm">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-theme-component">
                        {selectedMember.performance.responseTime}ms
                      </div>
                      <div className="text-theme-enhancements text-sm">Response Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ContrastCard>
        </div>
      )}
    </div>
  )
}




