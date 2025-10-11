'use client'

import { useEffect } from 'react'
import ShipComputer from '@/components/ShipComputer'
import EnhancedCrewGrid from '@/components/EnhancedCrewGrid'
import { ContrastText, ContrastCard } from '@/components/ContrastAware'

export default function AgenticSystem() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-accent mb-4">
          🖖 Enhanced Agentic Architecture
        </h1>
        <p className="text-xl text-theme-enhancements mb-2">
          Ship's Computer with Individual Crew Vector Data Access
        </p>
        <p className="text-lg text-theme-enhancements">
          Each crew member can independently access Supabase vector data while maintaining unified coordination
        </p>
      </div>

      {/* System Overview */}
      <ContrastCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold text-theme-accent mb-4">
          🚀 System Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🖥️</div>
            <h3 className="text-lg font-bold text-theme-accent mb-2">Ship's Computer</h3>
            <p className="text-theme-enhancements text-sm">
              Central coordinator with Majel Barrett voice, synthesizing crew contributions into unified responses
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-theme-accent mb-2">Crew Agents</h3>
            <p className="text-theme-enhancements text-sm">
              Individual AI agents with specialized knowledge and independent vector data access
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🗄️</div>
            <h3 className="text-lg font-bold text-theme-accent mb-2">Vector Database</h3>
            <p className="text-theme-enhancements text-sm">
              Supabase RAG system providing contextual knowledge and historical mission data
            </p>
          </div>
        </div>
      </ContrastCard>

      {/* Ship's Computer Interface */}
      <ShipComputer />

      {/* Enhanced Crew Grid */}
      <EnhancedCrewGrid />

      {/* System Benefits */}
      <ContrastCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold text-theme-accent mb-4">
          🎯 Enhanced Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-theme-accent mb-3">Parallel Processing</h3>
            <ul className="space-y-2 text-theme-enhancements">
              <li>• Multiple crew members accessing vector data simultaneously</li>
              <li>• Specialized queries relevant to each member's expertise</li>
              <li>• Rapid synthesis of insights through Ship's Computer</li>
              <li>• Contextual memory providing historical context</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-accent mb-3">Unified Coordination</h3>
            <ul className="space-y-2 text-theme-enhancements">
              <li>• Centralized response generation in Ship's Computer voice</li>
              <li>• Confidence scoring based on crew contributions</li>
              <li>• Execution time tracking for performance optimization</li>
              <li>• Mission objective alignment across all crew members</li>
            </ul>
          </div>
        </div>
      </ContrastCard>

      {/* Example Interactions */}
      <ContrastCard variant="elevated" className="p-6">
        <h2 className="text-2xl font-bold text-theme-accent mb-4">
          💬 Example Interactions
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-theme-component pl-4">
            <div className="font-medium text-theme-accent mb-1">
              "Computer, analyze the contrast issues across all themes"
            </div>
            <div className="text-sm text-theme-enhancements">
              Commander Data queries WCAG standards, Geordi analyzes CSS architecture, 
              Dr. Crusher checks system health, and Ship's Computer synthesizes a unified solution.
            </div>
          </div>
          <div className="border-l-4 border-theme-component pl-4">
            <div className="font-medium text-theme-accent mb-1">
              "Computer, activate our test harness to fix our shields"
            </div>
            <div className="text-sm text-theme-enhancements">
              Worf assesses security protocols, Geordi checks infrastructure, 
              Data processes test results, and Ship's Computer coordinates the repair operation.
            </div>
          </div>
          <div className="border-l-4 border-theme-component pl-4">
            <div className="font-medium text-theme-accent mb-1">
              "Computer, what is the status of our universal contrast system?"
            </div>
            <div className="text-sm text-theme-enhancements">
              All crew members report their specialized areas, Ship's Computer 
              provides a comprehensive status update with confidence levels.
            </div>
          </div>
        </div>
      </ContrastCard>
    </div>
  )
}




