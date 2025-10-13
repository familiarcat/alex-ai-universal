import { NextRequest, NextResponse } from 'next/server'
import CrewKnowledgeCaptureSystem from '@/lib/crew-knowledge-capture'

// Test endpoint to demonstrate crew knowledge capture
export async function POST(request: NextRequest) {
  try {
    const knowledgeSystem = new CrewKnowledgeCaptureSystem()

    // Simulate crew member interactions from different projects
    const testInteractions = [
      {
        crewMemberId: 'captain_picard',
        interactionType: 'question' as const,
        content: 'How should we approach the architecture for a scalable web application that needs to handle high traffic?',
        context: {
          domain: 'architecture',
          expertiseArea: 'Strategic Leadership',
          knowledgeLevel: 'advanced' as const,
          confidenceScore: 0.8,
          projectContext: 'web_application'
        }
      },
      {
        crewMemberId: 'commander_data',
        interactionType: 'answer' as const,
        content: 'Based on my analysis, implementing a microservices architecture with load balancing and caching would provide optimal scalability. The data suggests horizontal scaling is more effective than vertical scaling for this use case.',
        context: {
          domain: 'data',
          expertiseArea: 'Analytics',
          knowledgeLevel: 'expert' as const,
          confidenceScore: 0.9,
          projectContext: 'web_application'
        }
      },
      {
        crewMemberId: 'lieutenant_worf',
        interactionType: 'recommendation' as const,
        content: 'Security should be implemented at multiple layers: API authentication, database encryption, and network-level protection. I recommend implementing OAuth 2.0 with JWT tokens and rate limiting.',
        context: {
          domain: 'security',
          expertiseArea: 'Security',
          knowledgeLevel: 'expert' as const,
          confidenceScore: 0.95,
          projectContext: 'web_application'
        }
      },
      {
        crewMemberId: 'lieutenant_geordi',
        interactionType: 'analysis' as const,
        content: 'The current infrastructure can handle the expected load, but we need to implement auto-scaling and monitoring. Docker containers with Kubernetes orchestration would provide the flexibility we need.',
        context: {
          domain: 'devops',
          expertiseArea: 'Infrastructure',
          knowledgeLevel: 'advanced' as const,
          confidenceScore: 0.85,
          projectContext: 'web_application'
        }
      },
      {
        crewMemberId: 'counselor_troi',
        interactionType: 'learning' as const,
        content: 'I\'ve been studying the team dynamics and notice that clear communication channels and regular check-ins improve collaboration effectiveness. The psychological safety of team members directly correlates with innovation.',
        context: {
          domain: 'psychology',
          expertiseArea: 'Psychology',
          knowledgeLevel: 'advanced' as const,
          confidenceScore: 0.8,
          projectContext: 'team_management'
        }
      }
    ]

    // Capture all test interactions
    for (const interaction of testInteractions) {
      await knowledgeSystem.captureInteraction(
        interaction.crewMemberId,
        interaction.interactionType,
        interaction.content,
        interaction.context
      )
    }

    // Get knowledge development summaries
    const knowledgeSummaries = await Promise.all([
      knowledgeSystem.getKnowledgeDevelopment('captain_picard'),
      knowledgeSystem.getKnowledgeDevelopment('commander_data'),
      knowledgeSystem.getKnowledgeDevelopment('lieutenant_worf')
    ])

    return NextResponse.json({
      success: true,
      message: 'Crew knowledge capture test completed',
      data: {
        interactions_captured: testInteractions.length,
        crew_knowledge_summaries: knowledgeSummaries.map((summary, index) => ({
          crew_member: ['captain_picard', 'commander_data', 'lieutenant_worf'][index],
          summary: summary
        })),
        prime_directive_compliance: {
          data_sanitization: 'All project-specific details removed',
          intellectual_growth_tracking: 'Crew learning patterns captured',
          secure_data_protection: 'No sensitive information stored',
          knowledge_development: 'Focus on expertise growth and learning'
        }
      }
    })

  } catch (error: any) {
    console.error('Knowledge capture test error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Get knowledge development overview
export async function GET(request: NextRequest) {
  try {
    const knowledgeSystem = new CrewKnowledgeCaptureSystem()

    const crewMembers = [
      'captain_picard', 'commander_data', 'commander_riker', 
      'lieutenant_geordi', 'lieutenant_worf', 'counselor_troi',
      'dr_crusher', 'lieutenant_uhura', 'quark'
    ]

    const knowledgeOverview = await Promise.all(
      crewMembers.map(async (crewId) => {
        const development = await knowledgeSystem.getKnowledgeDevelopment(crewId)
        return {
          crew_member: crewId,
          total_interactions: development?.total_interactions || 0,
          expertise_areas: development?.expertise_areas || [],
          recent_activity: development?.recent_activity?.length || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      message: 'Crew knowledge development overview',
      data: {
        total_crew_members: crewMembers.length,
        knowledge_overview: knowledgeOverview,
        prime_directive_status: {
          intellectual_growth_tracking: 'Active',
          secure_data_protection: 'Enforced',
          knowledge_development: 'Continuous',
          project_ambiguity: 'Maintained'
        }
      }
    })

  } catch (error: any) {
    console.error('Knowledge overview error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


