'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface CrewMember {
  id: string
  name: string
  role: string
  expertise: string[]
  keywords: string[]
}

interface QueryResult {
  chunks: Array<{
    id: string
    content: string
    metadata: {
      crew_relevance: Record<string, number>
      keywords: string[]
      section?: string
    }
    similarity: number
  }>
  totalResults: number
  crewMember: string
  query: string
  timestamp: string
}

interface DocumentationStats {
  totalDocuments: number
  totalChunks: number
  crewRelevantDocuments: number
  lastUpdated: string
}

export default function CrewRAGInterface() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([])
  const [selectedCrewMember, setSelectedCrewMember] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null)
  const [stats, setStats] = useState<DocumentationStats | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    loadCrewMembers()
    loadStats()
  }, [])

  const loadCrewMembers = async () => {
    try {
      const response = await fetch('/api/crew-rag-query?action=crew-list')
      const data = await response.json()
      
      if (data.success) {
        setCrewMembers(data.data)
        if (data.data.length > 0) {
          setSelectedCrewMember(data.data[0].id)
        }
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/crew-rag-query?action=stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleQuery = async () => {
    if (!selectedCrewMember || !query.trim()) {
      setError('Please select a crew member and enter a query')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/crew-rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'query-crew-member',
          crewMember: selectedCrewMember,
          query: query.trim(),
          limit: 5
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setQueryResults(data.data)
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const analyzeQueryRelevance = async (testQuery: string) => {
    try {
      const response = await fetch('/api/crew-rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze-query-relevance',
          query: testQuery
        })
      })

      const data = await response.json()
      return data.success ? data.data : []
    } catch (err) {
      console.error('Failed to analyze query relevance:', err)
      return []
    }
  }

  const getCrewMemberInfo = (crewId: string): CrewMember | null => {
    return crewMembers.find(member => member.id === crewId) || null
  }

  return (
    <div className={`space-y-6 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-theme-accent mb-2">🖖 Crew RAG Query Interface</h2>
        <p className="text-theme-enhancements">Query documentation using crew member expertise</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="contrast-card variant-elevated">
          <h3 className="text-xl font-bold mb-4 text-theme-accent">📊 Documentation Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-role">{stats.totalDocuments}</div>
              <div className="text-theme-enhancements">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-accent">{stats.totalChunks}</div>
              <div className="text-theme-enhancements">Document Chunks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-component">{stats.crewRelevantDocuments}</div>
              <div className="text-theme-enhancements">Crew Relevant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-enhancements">
                {new Date(stats.lastUpdated).toLocaleDateString()}
              </div>
              <div className="text-theme-enhancements">Last Updated</div>
            </div>
          </div>
        </div>
      )}

      {/* Query Interface */}
      <div className="contrast-card variant-elevated">
        <h3 className="text-xl font-bold mb-4 text-theme-accent">🔍 Query Documentation</h3>
        
        <div className="space-y-4">
          {/* Crew Member Selection */}
          <div>
            <label className="block text-sm font-medium text-theme-role mb-2">
              Select Crew Member
            </label>
            <select
              value={selectedCrewMember}
              onChange={(e) => setSelectedCrewMember(e.target.value)}
              className="w-full p-3 rounded-lg border border-theme-component bg-theme-background text-theme-text"
            >
              {crewMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
            
            {selectedCrewMember && (
              <div className="mt-2 p-3 bg-theme-component/10 rounded-lg">
                <div className="text-sm">
                  <strong className="text-theme-accent">Expertise:</strong>
                  <div className="mt-1">
                    {getCrewMemberInfo(selectedCrewMember)?.expertise.map((exp, i) => (
                      <span key={i} className="inline-block bg-theme-component/20 px-2 py-1 rounded text-xs mr-2 mb-1">
                        {exp}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2">
                    <strong className="text-theme-accent">Keywords:</strong>
                    <div className="mt-1">
                      {getCrewMemberInfo(selectedCrewMember)?.keywords.map((keyword, i) => (
                        <span key={i} className="inline-block bg-theme-role/20 px-2 py-1 rounded text-xs mr-2 mb-1">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium text-theme-role mb-2">
              Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question related to this crew member's expertise..."
              className="w-full p-3 rounded-lg border border-theme-component bg-theme-background text-theme-text"
              rows={3}
            />
          </div>

          {/* Query Button */}
          <button
            onClick={handleQuery}
            disabled={loading || !selectedCrewMember || !query.trim()}
            className="w-full bg-theme-accent hover:bg-theme-accent/80 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? '🔄 Querying...' : '🔍 Query Documentation'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <div className="text-red-400 font-medium">❌ Error</div>
          <div className="text-red-300 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Query Results */}
      {queryResults && (
        <div className="contrast-card variant-elevated">
          <h3 className="text-xl font-bold mb-4 text-theme-accent">
            📋 Query Results for {queryResults.crewMember}
          </h3>
          
          <div className="mb-4 p-3 bg-theme-component/10 rounded-lg">
            <div className="text-sm text-theme-enhancements">
              <strong>Query:</strong> {queryResults.query}
            </div>
            <div className="text-sm text-theme-enhancements">
              <strong>Results:</strong> {queryResults.totalResults} chunks found
            </div>
            <div className="text-sm text-theme-enhancements">
              <strong>Timestamp:</strong> {new Date(queryResults.timestamp).toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            {queryResults.chunks.map((chunk, index) => (
              <div key={chunk.id} className="border border-theme-component/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-theme-accent">
                    Chunk {index + 1}
                  </div>
                  <div className="text-sm text-theme-enhancements">
                    Relevance: {(chunk.similarity * 100).toFixed(1)}%
                  </div>
                </div>
                
                {chunk.metadata.section && (
                  <div className="text-sm text-theme-role mb-2">
                    <strong>Section:</strong> {chunk.metadata.section}
                  </div>
                )}
                
                <div className="text-theme-text mb-3">
                  {chunk.content}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {chunk.metadata.keywords?.map((keyword, i) => (
                    <span key={i} className="bg-theme-component/20 px-2 py-1 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Query Examples */}
      <div className="contrast-card variant-elevated">
        <h3 className="text-xl font-bold mb-4 text-theme-accent">💡 Quick Query Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-theme-role mb-2">Captain Picard</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "Strategic planning for navigation system"</li>
              <li>• "Decision making process for architecture"</li>
              <li>• "Leadership coordination strategies"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-theme-role mb-2">Commander Data</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "Data analysis and performance metrics"</li>
              <li>• "Logical system optimization"</li>
              <li>• "Analytics and processing workflows"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-theme-role mb-2">Lieutenant Geordi</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "Technical architecture and infrastructure"</li>
              <li>• "System integration challenges"</li>
              <li>• "Engineering implementation details"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-theme-role mb-2">Lieutenant Worf</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "Security protocols and compliance"</li>
              <li>• "Threat assessment and vulnerability"</li>
              <li>• "Protection and audit procedures"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


