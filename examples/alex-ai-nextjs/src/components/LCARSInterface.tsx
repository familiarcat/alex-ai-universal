'use client'

import React, { useState, useEffect } from 'react'

interface LCARSStatus {
  status: string
  libraryComputer: any
  activeProjects: number
  totalUpdates: number
  websocketConnections: number
  timestamp: string
}

interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'preview' | 'published'
  crewMembers: string[]
  createdAt: string
  updatedAt: string
  previewUrl?: string
  publishedUrl?: string
}

interface LLMModel {
  id: string
  name: string
  provider: string
  contextWindow: number
  costPer1kTokens: number
  specialties: string[]
  performanceRating: number
}

export default function LCARSInterface() {
  const [status, setStatus] = useState<LCARSStatus | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [models, setModels] = useState<LLMModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'library-computer' | 'projects'>('overview')

  // Fetch LCARS status
  useEffect(() => {
    fetchStatus()
    fetchProjects()
    fetchModels()
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStatus()
      fetchProjects()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/lcars?action=status')
      const data = await response.json()
      if (data.success) {
        setStatus(data.data)
      }
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/lcars?action=projects')
      const data = await response.json()
      if (data.success) {
        setProjects(data.data)
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err)
    }
  }

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/lcars?action=library-computer-models')
      const data = await response.json()
      if (data.success) {
        setModels(data.data)
      }
    } catch (err: any) {
      console.error('Error fetching models:', err)
    }
  }

  const createTestProject = async () => {
    try {
      const response = await fetch('/api/lcars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-project',
          name: 'Test Project',
          description: 'A test project for LCARS system',
          crewMembers: ['captain_picard', 'commander_data', 'lieutenant_geordi']
        })
      })
      const data = await response.json()
      if (data.success) {
        await fetchProjects()
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-primary">
        <div className="text-theme-accent text-xl">🖖 Initializing LCARS System...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-primary">
        <div className="contrast-card variant-outlined border-red-500/50 bg-red-500/10 p-6">
          <div className="text-red-400 font-medium">❌ LCARS Error</div>
          <div className="text-red-300 text-sm mt-2">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-primary p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-theme-accent mb-2">
          🖖 LCARS - Library Computer Access/Retrieval System
        </h1>
        <p className="text-theme-enhancements text-lg">
          AI Crew Intelligence Coordination & LLM Optimization Platform
        </p>
      </div>

      {/* Status Bar */}
      {status && (
        <div className="contrast-card variant-elevated mb-6 p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-theme-role text-sm">System Status</div>
              <div className="text-theme-accent text-xl font-bold">
                {status.status === 'operational' ? '✅ Operational' : '⚠️ ' + status.status}
              </div>
            </div>
            <div>
              <div className="text-theme-role text-sm">Library Computer</div>
              <div className="text-theme-accent text-xl font-bold">
                {status.libraryComputer.ragIntegration === 'active' ? '✅ Active' : '⚠️ Offline'}
              </div>
            </div>
            <div>
              <div className="text-theme-role text-sm">Active Projects</div>
              <div className="text-theme-accent text-xl font-bold">{status.activeProjects}</div>
            </div>
            <div>
              <div className="text-theme-role text-sm">Live Updates</div>
              <div className="text-theme-accent text-xl font-bold">{status.totalUpdates}</div>
            </div>
            <div>
              <div className="text-theme-role text-sm">Available Models</div>
              <div className="text-theme-accent text-xl font-bold">
                {status.libraryComputer.availableModels}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-theme-component text-theme-primary'
              : 'bg-theme-secondary text-theme-accent hover:bg-theme-component/20'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('library-computer')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'library-computer'
              ? 'bg-theme-component text-theme-primary'
              : 'bg-theme-secondary text-theme-accent hover:bg-theme-component/20'
          }`}
        >
          🧠 Library Computer
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'projects'
              ? 'bg-theme-component text-theme-primary'
              : 'bg-theme-secondary text-theme-accent hover:bg-theme-component/20'
          }`}
        >
          🚀 Projects
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="contrast-card variant-elevated">
            <h2 className="text-2xl font-bold text-theme-accent mb-4">System Architecture</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-theme-component pl-4">
                <h3 className="text-xl font-bold text-theme-accent">Library Computer (LC)</h3>
                <p className="text-theme-enhancements mt-2">
                  The analytical brain that integrates with the RAG database for intelligent data
                  analysis, crew coordination, and optimal LLM selection through Open Router.
                </p>
                <div className="mt-3 flex gap-3">
                  <span className="px-3 py-1 bg-theme-component/20 text-theme-accent rounded text-sm">
                    Prompt Analysis
                  </span>
                  <span className="px-3 py-1 bg-theme-component/20 text-theme-accent rounded text-sm">
                    LLM Optimization
                  </span>
                  <span className="px-3 py-1 bg-theme-component/20 text-theme-accent rounded text-sm">
                    Performance Tracking
                  </span>
                </div>
              </div>
              <div className="border-l-4 border-theme-secondary pl-4">
                <h3 className="text-xl font-bold text-theme-accent">
                  Access & Retrieval System (ARS)
                </h3>
                <p className="text-theme-enhancements mt-2">
                  The intuitive UI/UX layer providing real-time website preview, crew interaction
                  interfaces, and dynamic publishing capabilities.
                </p>
                <div className="mt-3 flex gap-3">
                  <span className="px-3 py-1 bg-theme-secondary/20 text-theme-accent rounded text-sm">
                    Live Preview
                  </span>
                  <span className="px-3 py-1 bg-theme-secondary/20 text-theme-accent rounded text-sm">
                    Crew UI
                  </span>
                  <span className="px-3 py-1 bg-theme-secondary/20 text-theme-accent rounded text-sm">
                    Publishing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'library-computer' && (
        <div className="space-y-6">
          <div className="contrast-card variant-elevated">
            <h2 className="text-2xl font-bold text-theme-accent mb-4">Available LLM Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="border border-theme-component rounded-lg p-4 hover:bg-theme-secondary/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-theme-accent">{model.name}</h3>
                      <p className="text-theme-enhancements text-sm">{model.provider}</p>
                    </div>
                    <div className="text-theme-accent font-bold">
                      {model.performanceRating}/10
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-role">Context Window:</span>
                      <span className="text-theme-accent">
                        {(model.contextWindow / 1000).toFixed(0)}K tokens
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-role">Cost:</span>
                      <span className="text-theme-accent">${model.costPer1kTokens}/1K</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-theme-role mb-1">Specialties:</div>
                      <div className="flex flex-wrap gap-1">
                        {model.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 bg-theme-component/20 text-theme-accent rounded text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-theme-accent">Active Projects</h2>
            <button
              onClick={createTestProject}
              className="px-4 py-2 bg-theme-component hover:bg-theme-component/80 text-theme-primary font-medium rounded-lg transition-colors"
            >
              + Create Test Project
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="contrast-card variant-elevated text-center py-12">
              <div className="text-theme-enhancements text-lg">No active projects</div>
              <p className="text-theme-role text-sm mt-2">
                Create a test project to get started with LCARS
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="contrast-card variant-elevated hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-theme-accent">{project.name}</h3>
                      <p className="text-theme-enhancements text-sm mt-1">
                        {project.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        project.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : project.status === 'preview'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-theme-role">Crew Members:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.crewMembers.map((member) => (
                          <span
                            key={member}
                            className="px-2 py-1 bg-theme-component/20 text-theme-accent rounded text-xs"
                          >
                            {member.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    {project.previewUrl && (
                      <div>
                        <span className="text-theme-role">Preview:</span>
                        <a
                          href={project.previewUrl}
                          className="text-theme-accent hover:underline ml-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.previewUrl}
                        </a>
                      </div>
                    )}
                    {project.publishedUrl && (
                      <div>
                        <span className="text-theme-role">Published:</span>
                        <a
                          href={project.publishedUrl}
                          className="text-theme-accent hover:underline ml-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.publishedUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

