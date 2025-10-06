'use client'

import { useState, useRef, useEffect } from 'react'
import { useAgentic } from '@/contexts/AgenticContext'
import { ContrastCard, ContrastText, ContrastButton } from './ContrastAware'

export default function ShipComputer() {
  const { 
    processRequest, 
    shipComputerResponses, 
    currentRequest, 
    supabaseConnection,
    generateShipResponse 
  } = useAgentic()
  
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResponse, setLastResponse] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [shipComputerResponses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const response = await processRequest(input.trim())
      const shipResponse = generateShipResponse(response)
      setLastResponse(shipResponse)
      setInput('')
    } catch (error) {
      console.error('Error processing request:', error)
      setLastResponse('"Computer error. Please try again, Captain."')
    } finally {
      setIsProcessing(false)
    }
  }

  const exampleRequests = [
    'Computer, analyze the contrast issues across all themes',
    'Computer, activate our test harness to fix our shields',
    'Computer, what is the status of our universal contrast system?',
    'Computer, optimize our CSS architecture for better performance',
    'Computer, run a security audit on our Supabase integration',
    'Computer, analyze user feedback and suggest improvements'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-theme-accent mb-2">
          🖥️ Ship's Computer
        </h2>
        <p className="text-theme-enhancements">
          Enhanced Agentic Architecture with Individual Crew Vector Data Access
        </p>
      </div>

      {/* Connection Status */}
      <ContrastCard variant="elevated" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${supabaseConnection.connected ? 'bg-theme-role' : 'bg-red-500'}`}></div>
            <ContrastText variant="accent">Supabase Vector Database</ContrastText>
          </div>
          <div className="text-sm text-theme-enhancements">
            {supabaseConnection.connected ? 'Connected' : 'Disconnected'} • 
            {supabaseConnection.totalVectors} vectors • 
            Last sync: {new Date(supabaseConnection.lastSync).toLocaleTimeString()}
          </div>
        </div>
      </ContrastCard>

      {/* Input Interface */}
      <ContrastCard variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-theme-accent font-medium mb-2">
              Computer Request
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Computer, analyze the contrast issues across all themes..."
              className="w-full contrast-input p-3 text-theme-accent rounded-lg resize-none"
              rows={3}
              disabled={isProcessing}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <ContrastButton
              type="submit"
              disabled={isProcessing || !input.trim()}
              variant="component"
              className="px-6 py-2"
            >
              {isProcessing ? '🔄 Processing...' : '🖖 Make It So'}
            </ContrastButton>
            
            {currentRequest && (
              <div className="text-sm text-theme-enhancements">
                Processing: "{currentRequest}"
              </div>
            )}
          </div>
        </form>
      </ContrastCard>

      {/* Example Requests */}
      <ContrastCard variant="elevated" className="p-6">
        <h3 className="text-lg font-bold text-theme-accent mb-4">
          Example Requests
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exampleRequests.map((example, index) => (
            <button
              key={index}
              onClick={() => setInput(example)}
              className="text-left p-3 contrast-button variant-subtle hover:scale-105 transition-all duration-200"
              disabled={isProcessing}
            >
              <ContrastText variant="accent" className="text-sm">
                {example}
              </ContrastText>
            </button>
          ))}
        </div>
      </ContrastCard>

      {/* Ship's Computer Response */}
      {lastResponse && (
        <ContrastCard variant="elevated" className="p-6">
          <h3 className="text-lg font-bold text-theme-accent mb-4">
            🖥️ Ship's Computer Response
          </h3>
          <div className="bg-theme-secondary/20 p-4 rounded-lg">
            <pre className="text-theme-enhancements whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {lastResponse}
            </pre>
          </div>
        </ContrastCard>
      )}

      {/* Response History */}
      {shipComputerResponses.length > 0 && (
        <ContrastCard variant="elevated" className="p-6">
          <h3 className="text-lg font-bold text-theme-accent mb-4">
            Response History
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {shipComputerResponses.map((response, index) => (
              <div key={index} className="border-l-4 border-theme-component pl-4">
                <div className="flex justify-between items-start mb-2">
                  <ContrastText variant="accent" className="font-medium">
                    "{response.request}"
                  </ContrastText>
                  <div className="text-xs text-theme-enhancements">
                    {new Date(response.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="text-sm text-theme-enhancements mb-2">
                  {response.unifiedResponse}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-theme-enhancements">
                  <span>Confidence: {response.confidence}%</span>
                  <span>Execution: {response.executionTime}ms</span>
                  <span>Crew: {response.crewContributions.length} members</span>
                </div>
              </div>
            ))}
          </div>
        </ContrastCard>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
