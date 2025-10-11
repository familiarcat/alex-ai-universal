import { NextRequest, NextResponse } from 'next/server'
import CrewRAGQuery from '@/lib/crew-rag-query'

// Crew RAG Query API endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, crewMember, query, keywords, milestoneId, limit } = body

    const ragQuery = new CrewRAGQuery()

    switch (action) {
      case 'query-crew-member':
        if (!crewMember || !query) {
          return NextResponse.json(
            { success: false, error: 'crewMember and query are required' },
            { status: 400 }
          )
        }

        const results = await ragQuery.queryForCrewMember(
          crewMember, 
          query, 
          limit || 5
        )
        
        return NextResponse.json({
          success: true,
          data: results,
          message: `Query results for ${crewMember}`
        })

      case 'get-milestone':
        if (!milestoneId) {
          return NextResponse.json(
            { success: false, error: 'milestoneId is required' },
            { status: 400 }
          )
        }

        const milestone = await ragQuery.getMilestoneInformation(milestoneId)
        
        return NextResponse.json({
          success: true,
          data: milestone,
          message: `Milestone information for ${milestoneId}`
        })

      case 'get-crew-documents':
        if (!crewMember) {
          return NextResponse.json(
            { success: false, error: 'crewMember is required' },
            { status: 400 }
          )
        }

        const crewDocs = await ragQuery.getCrewRelevantDocuments(
          crewMember, 
          limit || 10
        )
        
        return NextResponse.json({
          success: true,
          data: crewDocs,
          message: `Crew documents for ${crewMember}`
        })

      case 'search-keywords':
        if (!keywords || !Array.isArray(keywords)) {
          return NextResponse.json(
            { success: false, error: 'keywords array is required' },
            { status: 400 }
          )
        }

        const keywordResults = await ragQuery.searchByKeywords(
          keywords, 
          limit || 10
        )
        
        return NextResponse.json({
          success: true,
          data: keywordResults,
          message: `Keyword search results for ${keywords.join(', ')}`
        })

      case 'analyze-query-relevance':
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'query is required' },
            { status: 400 }
          )
        }

        const relevance = ragQuery.analyzeQueryRelevance(query)
        
        return NextResponse.json({
          success: true,
          data: relevance,
          message: 'Query relevance analysis completed'
        })

      case 'get-documentation-stats':
        const stats = await ragQuery.getDocumentationStats()
        
        return NextResponse.json({
          success: true,
          data: stats,
          message: 'Documentation statistics retrieved'
        })

      case 'get-crew-info':
        if (!crewMember) {
          return NextResponse.json(
            { success: false, error: 'crewMember is required' },
            { status: 400 }
          )
        }

        const crewInfo = ragQuery.getCrewMemberInfo(crewMember)
        
        if (!crewInfo) {
          return NextResponse.json(
            { success: false, error: `Crew member ${crewMember} not found` },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          success: true,
          data: crewInfo,
          message: `Crew member information for ${crewMember}`
        })

      case 'get-all-crew':
        const allCrew = ragQuery.getAllCrewMembers()
        
        return NextResponse.json({
          success: true,
          data: allCrew,
          message: 'All crew members retrieved'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Crew RAG query error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const crewMember = url.searchParams.get('crewMember')
    const query = url.searchParams.get('query')
    const limit = parseInt(url.searchParams.get('limit') || '5')

    const ragQuery = new CrewRAGQuery()

    switch (action) {
      case 'stats':
        try {
          const stats = await ragQuery.getDocumentationStats()
          return NextResponse.json({
            success: true,
            data: stats,
            message: 'Documentation statistics'
          })
        } catch (error: any) {
          // Return mock stats if Supabase is not available
          return NextResponse.json({
            success: true,
            data: {
              totalDocuments: 9,
              documentChunks: 45,
              crewRelevant: 9,
              lastUpdated: new Date().toISOString()
            },
            message: 'Documentation statistics (mock data)'
          })
        }

      case 'crew-list':
        const allCrew = ragQuery.getAllCrewMembers()
        return NextResponse.json({
          success: true,
          data: allCrew,
          message: 'All crew members'
        })

      case 'crew-info':
        if (!crewMember) {
          return NextResponse.json(
            { success: false, error: 'crewMember parameter required' },
            { status: 400 }
          )
        }

        const crewInfo = ragQuery.getCrewMemberInfo(crewMember)
        if (!crewInfo) {
          return NextResponse.json(
            { success: false, error: `Crew member ${crewMember} not found` },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: crewInfo,
          message: `Crew member information for ${crewMember}`
        })

      case 'analyze-relevance':
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'query parameter required' },
            { status: 400 }
          )
        }

        const relevance = ragQuery.analyzeQueryRelevance(query)
        return NextResponse.json({
          success: true,
          data: relevance,
          message: 'Query relevance analysis'
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            availableActions: [
              'stats',
              'crew-list', 
              'crew-info',
              'analyze-relevance'
            ],
            availablePostActions: [
              'query-crew-member',
              'get-milestone',
              'get-crew-documents',
              'search-keywords',
              'analyze-query-relevance',
              'get-documentation-stats',
              'get-crew-info',
              'get-all-crew'
            ],
            crewMembers: ragQuery.getAllCrewMembers().map(member => ({
              id: member.id,
              name: member.name,
              role: member.role
            }))
          },
          message: 'Crew RAG Query API - Available actions and crew members'
        })
    }

  } catch (error: any) {
    console.error('Crew RAG query GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}


