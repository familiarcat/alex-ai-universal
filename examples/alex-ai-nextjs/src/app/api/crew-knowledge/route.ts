import { NextRequest, NextResponse } from 'next/server'
import CrewKnowledgeCaptureSystem from '@/lib/crew-knowledge-capture'

// Crew Knowledge Capture API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      action, 
      crewMemberId, 
      interactionType, 
      content, 
      context 
    } = body

    const knowledgeSystem = new CrewKnowledgeCaptureSystem()

    switch (action) {
      case 'capture-interaction':
        if (!crewMemberId || !interactionType || !content || !context) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for interaction capture' },
            { status: 400 }
          )
        }

        await knowledgeSystem.captureInteraction(
          crewMemberId,
          interactionType,
          content,
          context
        )

        return NextResponse.json({
          success: true,
          message: 'Crew interaction captured successfully',
          timestamp: new Date().toISOString()
        })

      case 'get-knowledge-development':
        if (!crewMemberId) {
          return NextResponse.json(
            { success: false, error: 'crewMemberId is required' },
            { status: 400 }
          )
        }

        const development = await knowledgeSystem.getKnowledgeDevelopment(crewMemberId)
        
        return NextResponse.json({
          success: true,
          data: development,
          message: `Knowledge development data for ${crewMemberId}`
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Crew knowledge API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Get crew knowledge statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const crewMemberId = searchParams.get('crew_member_id')

    const knowledgeSystem = new CrewKnowledgeCaptureSystem()

    if (crewMemberId) {
      // Get specific crew member knowledge development
      const development = await knowledgeSystem.getKnowledgeDevelopment(crewMemberId)
      
      return NextResponse.json({
        success: true,
        data: development,
        message: `Knowledge development for ${crewMemberId}`
      })
    } else {
      // Get overall crew knowledge statistics
      const crewMembers = [
        'captain_picard', 'commander_data', 'commander_riker', 
        'lieutenant_geordi', 'lieutenant_worf', 'counselor_troi',
        'dr_crusher', 'lieutenant_uhura', 'quark'
      ]

      const allDevelopment = await Promise.all(
        crewMembers.map(id => knowledgeSystem.getKnowledgeDevelopment(id))
      )

      const summary = {
        total_crew_members: crewMembers.length,
        active_learners: allDevelopment.filter(d => d && d.total_interactions > 0).length,
        total_interactions: allDevelopment.reduce((sum, d) => sum + (d?.total_interactions || 0), 0),
        knowledge_domains: [...new Set(allDevelopment.flatMap(d => d?.expertise_areas || []))],
        avg_confidence: allDevelopment.reduce((sum, d) => sum + (d?.knowledge_contributions?.avg_confidence || 0), 0) / crewMembers.length,
        learning_trends: this.analyzeLearningTrends(allDevelopment)
      }

      return NextResponse.json({
        success: true,
        data: summary,
        message: 'Crew knowledge development overview'
      })
    }

  } catch (error: any) {
    console.error('Crew knowledge GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to analyze learning trends
function analyzeLearningTrends(developmentData: any[]): any {
  const trends = {
    most_active_learners: [],
    emerging_expertise: [],
    collaboration_patterns: [],
    knowledge_gaps: []
  }

  // Analyze most active learners
  const activeLearners = developmentData
    .filter(d => d && d.total_interactions > 0)
    .sort((a, b) => b.total_interactions - a.total_interactions)
    .slice(0, 3)

  trends.most_active_learners = activeLearners.map(d => ({
    crew_member: d.recent_activity[0]?.crew_member_id,
    interactions: d.total_interactions,
    avg_confidence: d.knowledge_contributions?.avg_confidence
  }))

  // Analyze emerging expertise areas
  const domainCounts = developmentData
    .flatMap(d => d?.expertise_areas || [])
    .reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1
      return acc
    }, {})

  trends.emerging_expertise = Object.entries(domainCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, crew_members: count }))

  return trends
}


