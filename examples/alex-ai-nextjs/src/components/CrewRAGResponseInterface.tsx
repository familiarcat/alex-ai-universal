'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface CrewMember {
  id: string
  name: string
  role: string
  expertise: string[]
  keywords: string[]
  responseStyle: string
  contextRequirements: string[]
}

interface CrewResponse {
  crewMember: string
  response: string
  ragContext: {
    query: string
    chunks: any[]
    relevance: number
    timestamp: string
  }
  localContext: boolean
}

export default function CrewRAGResponseInterface() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([])
  const [selectedCrewMember, setSelectedCrewMember] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [response, setResponse] = useState<CrewResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSelect, setAutoSelect] = useState<boolean>(false)
  const { theme } = useTheme()

  useEffect(() => {
    loadCrewMembers()
  }, [])

  const loadCrewMembers = async () => {
    try {
      const response = await fetch('/api/crew-response?action=crew-list')
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

  const handleQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    if (!autoSelect && !selectedCrewMember) {
      setError('Please select a crew member or enable auto-select')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const response = await fetch('/api/crew-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crewMember: autoSelect ? null : selectedCrewMember,
          query: query.trim(),
          autoSelect
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResponse(data.data)
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
      const response = await fetch(`/api/crew-response?action=analyze-relevance&query=${encodeURIComponent(testQuery)}`)
      const data = await response.json()
      return data.success ? data.data.crewMember : null
    } catch (err) {
      console.error('Failed to analyze query relevance:', err)
      return null
    }
  }

  const getCrewMemberInfo = (crewId: string): CrewMember | null => {
    return crewMembers.find(member => member.id === crewId) || null
  }

  return (
    <div className={`space-y-6 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-theme-accent mb-2">🖖 Crew RAG Response System</h2>
        <p className="text-theme-enhancements">Crew members now speak to the RAG system instead of local documentation</p>
      </div>

      {/* Auto-Select Option */}
      <div className="contrast-card variant-elevated">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoSelect}
              onChange={(e) => setAutoSelect(e.target.checked)}
              className="rounded border-theme-component"
            />
            <span className="text-theme-role font-medium">Auto-select crew member based on query relevance</span>
          </label>
        </div>
      </div>

      {/* Crew Member Selection */}
      {!autoSelect && (
        <div className="contrast-card variant-elevated">
          <h3 className="text-xl font-bold mb-4 text-theme-accent">👥 Select Crew Member</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-role mb-2">
              Crew Member
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
          </div>
          
          {selectedCrewMember && (
            <div className="p-4 bg-theme-component/10 rounded-lg">
              <div className="text-sm">
                <div className="mb-2">
                  <strong className="text-theme-accent">Expertise:</strong>
                  <div className="mt-1">
                    {getCrewMemberInfo(selectedCrewMember)?.expertise.map((exp, i) => (
                      <span key={i} className="inline-block bg-theme-component/20 px-2 py-1 rounded text-xs mr-2 mb-1">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-2">
                  <strong className="text-theme-accent">Response Style:</strong>
                  <div className="text-theme-enhancements mt-1">
                    {getCrewMemberInfo(selectedCrewMember)?.responseStyle}
                  </div>
                </div>
                
                <div>
                  <strong className="text-theme-accent">Context Requirements:</strong>
                  <div className="mt-1">
                    {getCrewMemberInfo(selectedCrewMember)?.contextRequirements.map((req, i) => (
                      <span key={i} className="inline-block bg-theme-role/20 px-2 py-1 rounded text-xs mr-2 mb-1">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query Interface */}
      <div className="contrast-card variant-elevated">
        <h3 className="text-xl font-bold mb-4 text-theme-accent">💬 Ask the Crew</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-role mb-2">
              Your Question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about our project, system, or any technical topic..."
              className="w-full p-3 rounded-lg border border-theme-component bg-theme-background text-theme-text"
              rows={4}
            />
          </div>

          <button
            onClick={handleQuery}
            disabled={loading || !query.trim()}
            className="w-full bg-theme-accent hover:bg-theme-accent/80 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? '🔄 Generating Response...' : '🖖 Ask the Crew'}
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

      {/* Response Display */}
      {response && (
        <div className="contrast-card variant-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-theme-accent">
              {response.crewMember} Response
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                response.localContext 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {response.localContext ? '📄 Local Context' : '🔍 RAG System'}
              </div>
              <div className="text-xs text-theme-enhancements">
                {new Date(response.ragContext.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="mb-4 p-4 bg-theme-component/10 rounded-lg">
            <div className="text-sm">
              <strong className="text-theme-accent">RAG Context:</strong>
              <div className="mt-2 text-theme-enhancements">
                <div>Query: {response.ragContext.query}</div>
                <div>Relevance Score: {response.ragContext.relevance} chunks</div>
                <div>Source: {response.localContext ? 'Local Documentation' : 'Vector RAG System'}</div>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-theme-text leading-relaxed">
              {response.response}
            </div>
          </div>

          {response.ragContext.chunks.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-theme-accent mb-3">📚 RAG Context Sources</h4>
              <div className="space-y-3">
                {response.ragContext.chunks.slice(0, 3).map((chunk, index) => (
                  <div key={chunk.id} className="border border-theme-component/30 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-theme-accent">
                        Source {index + 1}
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
                    
                    <div className="text-sm text-theme-text">
                      {chunk.content.substring(0, 200)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Examples */}
      <div className="contrast-card variant-elevated">
        <h3 className="text-xl font-bold mb-4 text-theme-accent">💡 Example Queries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-theme-role mb-2">Strategic Planning</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "What's our strategic approach for the navigation system?"</li>
              <li>• "How should we coordinate our development efforts?"</li>
              <li>• "What are our long-term objectives?"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-theme-role mb-2">Technical Implementation</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "How should we architect the system integration?"</li>
              <li>• "What are the technical challenges we need to solve?"</li>
              <li>• "How can we optimize performance?"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-theme-role mb-2">Security & Compliance</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "What security measures should we implement?"</li>
              <li>• "How do we ensure compliance with protocols?"</li>
              <li>• "What are the potential vulnerabilities?"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-theme-role mb-2">User Experience</h4>
            <ul className="text-sm text-theme-enhancements space-y-1">
              <li>• "How can we improve the user experience?"</li>
              <li>• "What communication strategies should we use?"</li>
              <li>• "How do we ensure intuitive interfaces?"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


