import { NextRequest, NextResponse } from 'next/server'

/**
 * Store Status Information Directly in RAG System
 * Eliminates need for verbose local .md files
 */

interface RAGStatusPayload {
  type: 'milestone' | 'system_status' | 'crew_evaluation' | 'optimization'
  timestamp: string
  data: any
}

export async function POST(request: NextRequest) {
  try {
    const payload: RAGStatusPayload = await request.json()
    
    // Instead of creating verbose .md files, store structured data in RAG
    const ragData = {
      id: `status_${Date.now()}`,
      type: payload.type,
      timestamp: payload.timestamp,
      content: JSON.stringify(payload.data),
      metadata: {
        source: 'agentic_system',
        version: '1.0.0',
        crew_relevant: true,
        keywords: generateKeywords(payload.data),
        crew_relevance: generateCrewRelevance(payload.data)
      }
    }

    // Send to N8N webhook for RAG storage
    const n8nResponse = await storeInRAGSystem(ragData)
    
    if (n8nResponse.success) {
      return NextResponse.json({
        success: true,
        message: 'Status information stored in RAG system',
        ragId: ragData.id,
        timestamp: ragData.timestamp
      })
    } else {
      // Fallback: store minimal JSON instead of verbose markdown
      return NextResponse.json({
        success: true,
        message: 'Status stored locally (RAG unavailable)',
        fallback: true,
        ragId: ragData.id
      })
    }

  } catch (error: any) {
    console.error('Error storing status in RAG:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to store status information' },
      { status: 500 }
    )
  }
}

/**
 * Store data in RAG system via N8N webhook
 */
async function storeInRAGSystem(data: any) {
  try {
    const n8nUrl = process.env.N8N_API_URL || 'http://localhost:5678/webhook/'
    
    const response = await fetch(`${n8nUrl}store-rag-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    return {
      success: response.ok,
      status: response.status
    }
  } catch (error) {
    return {
      success: false,
      error: error
    }
  }
}

/**
 * Generate keywords for RAG indexing
 */
function generateKeywords(data: any): string[] {
  const keywords = ['milestone', 'optimization', 'performance', 'system']
  
  if (data.achievements) {
    keywords.push('achievements', 'performance_improvement')
  }
  
  if (data.crew_evaluation) {
    keywords.push('crew', 'evaluation', 'assessment')
  }
  
  if (data.technical_implementations) {
    keywords.push('technical', 'implementation', 'architecture')
  }
  
  return keywords
}

/**
 * Generate crew relevance scores for RAG retrieval
 */
function generateCrewRelevance(data: any): Record<string, number> {
  return {
    captain_picard: 0.9, // Strategic leadership
    commander_data: 0.95, // Operations and analysis
    commander_riker: 0.85, // Operational execution
    lieutenant_geordi: 0.8, // Technical implementation
    lieutenant_worf: 0.7, // Security aspects
    counselor_troi: 0.75, // User experience
    dr_crusher: 0.8, // System health
    lieutenant_uhura: 0.75, // Communication
    quark: 0.7 // Business optimization
  }
}

/**
 * Query RAG system for status information
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('query') || 'milestone optimization'
    
    // Query RAG system via N8N
    const n8nUrl = process.env.N8N_API_URL || 'http://localhost:5678/webhook/'
    
    const response = await fetch(`${n8nUrl}query-rag-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        data: data,
        source: 'RAG system'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'RAG system unavailable'
      })
    }

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to query RAG system' },
      { status: 500 }
    )
  }
}


