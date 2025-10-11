import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Populate RAG system with sample crew data
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase credentials not found' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Sample crew documentation data
    const crewDocuments = [
      {
        id: 'doc-1',
        title: 'Captain Picard - Strategic Leadership Protocol',
        content: 'Captain Jean-Luc Picard is the commanding officer of the Enterprise, responsible for strategic decision-making and crew coordination. His leadership style emphasizes diplomacy, ethical decision-making, and long-term planning. Key responsibilities include mission planning, resource allocation, and maintaining crew morale.',
        crew_member: 'captain_picard',
        expertise: ['Strategic Leadership', 'System Integration', 'Decision Making'],
        keywords: ['strategic', 'leadership', 'command', 'decision', 'mission', 'planning', 'coordination'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-2',
        title: 'Commander Data - Technical Operations Manual',
        content: 'Commander Data serves as the Operations Officer, specializing in data analysis, logical processing, and AI/ML operations. His expertise includes performance metrics analysis, system optimization, and automated decision support. Data processes complex information with precision and provides analytical insights for crew decisions.',
        crew_member: 'commander_data',
        expertise: ['Analytics', 'Logic', 'Data Processing', 'AI/ML'],
        keywords: ['data', 'analysis', 'logic', 'processing', 'analytics', 'metrics', 'performance'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-3',
        title: 'Commander Riker - Tactical Operations Guide',
        content: 'Commander William Riker is the First Officer, responsible for tactical operations and workflow management. His expertise includes execution planning, operational coordination, and tactical decision-making. Riker ensures mission objectives are met through effective team management and resource coordination.',
        crew_member: 'commander_riker',
        expertise: ['Tactical Operations', 'Workflow Management', 'Execution'],
        keywords: ['operations', 'tactical', 'execution', 'workflow', 'management', 'coordination'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-4',
        title: 'Lieutenant La Forge - Engineering Systems',
        content: 'Lieutenant Commander Geordi La Forge is the Chief Engineer, responsible for infrastructure management and technical solutions. His expertise includes system architecture, technical implementation, and engineering problem-solving. La Forge ensures all technical systems operate efficiently and provides innovative solutions to complex engineering challenges.',
        crew_member: 'lieutenant_geordi',
        expertise: ['Infrastructure', 'System Integration', 'Technical Solutions'],
        keywords: ['engineering', 'technical', 'infrastructure', 'system', 'architecture', 'implementation'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-5',
        title: 'Lieutenant Worf - Security Protocols',
        content: 'Lieutenant Worf serves as the Security Officer, responsible for system security and threat assessment. His expertise includes security protocols, threat analysis, and defensive strategies. Worf ensures crew safety and system integrity through vigilant monitoring and proactive security measures.',
        crew_member: 'lieutenant_worf',
        expertise: ['Security', 'Threat Assessment', 'Defensive Strategies'],
        keywords: ['security', 'threat', 'defense', 'protection', 'safety', 'monitoring'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-6',
        title: 'Counselor Troi - Crew Psychology and Support',
        content: 'Counselor Deanna Troi provides psychological support and crew welfare services. Her expertise includes emotional intelligence, conflict resolution, and crew morale management. Troi helps maintain crew cohesion and provides guidance for interpersonal relationships and stress management.',
        crew_member: 'counselor_troi',
        expertise: ['Psychology', 'Conflict Resolution', 'Crew Welfare'],
        keywords: ['psychology', 'support', 'welfare', 'morale', 'conflict', 'resolution'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-7',
        title: 'Dr. Crusher - Medical Operations',
        content: 'Dr. Beverly Crusher is the Chief Medical Officer, responsible for crew health and medical operations. Her expertise includes medical diagnosis, treatment protocols, and health monitoring. Dr. Crusher ensures crew physical and mental health through comprehensive medical care and preventive measures.',
        crew_member: 'dr_crusher',
        expertise: ['Medical Operations', 'Health Monitoring', 'Treatment Protocols'],
        keywords: ['medical', 'health', 'treatment', 'diagnosis', 'care', 'monitoring'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-8',
        title: 'Lieutenant Uhura - Communications Systems',
        content: 'Lieutenant Uhura manages communications systems and external coordination. Her expertise includes communication protocols, language processing, and information relay. Uhura ensures effective communication between crew members and external entities, maintaining clear channels for mission-critical information.',
        crew_member: 'lieutenant_uhura',
        expertise: ['Communications', 'Language Processing', 'Information Relay'],
        keywords: ['communications', 'language', 'relay', 'coordination', 'protocols', 'information'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      },
      {
        id: 'doc-9',
        title: 'Quark - Business Operations and Resources',
        content: 'Quark handles business operations and resource management for the crew. His expertise includes resource allocation, cost optimization, and business strategy. Quark ensures efficient use of resources and provides business insights for operational decisions and long-term sustainability.',
        crew_member: 'quark',
        expertise: ['Business Operations', 'Resource Management', 'Cost Optimization'],
        keywords: ['business', 'resources', 'cost', 'optimization', 'strategy', 'allocation'],
        document_type: 'crew_profile',
        created_at: new Date().toISOString()
      }
    ]

    // Insert documents into Supabase
    const { data, error } = await supabase
      .from('crew_documents')
      .upsert(crewDocuments, { onConflict: 'id' })

    if (error) {
      console.error('Error inserting crew documents:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Create document chunks for vector search
    const documentChunks = []
    for (const doc of crewDocuments) {
      // Split content into chunks
      const words = doc.content.split(' ')
      const chunkSize = 50
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ')
        documentChunks.push({
          id: `${doc.id}-chunk-${Math.floor(i / chunkSize)}`,
          document_id: doc.id,
          content: chunk,
          crew_member: doc.crew_member,
          chunk_index: Math.floor(i / chunkSize),
          created_at: new Date().toISOString()
        })
      }
    }

    // Insert document chunks
    const { error: chunkError } = await supabase
      .from('document_chunks')
      .upsert(documentChunks, { onConflict: 'id' })

    if (chunkError) {
      console.error('Error inserting document chunks:', chunkError)
      return NextResponse.json(
        { success: false, error: chunkError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'RAG system populated with crew data',
      data: {
        documents: crewDocuments.length,
        chunks: documentChunks.length,
        crew_members: crewDocuments.map(doc => doc.crew_member)
      }
    })

  } catch (error: any) {
    console.error('Error populating RAG system:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Get RAG system statistics
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase credentials not found' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get document count
    const { count: docCount } = await supabase
      .from('crew_documents')
      .select('*', { count: 'exact', head: true })

    // Get chunk count
    const { count: chunkCount } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })

    // Get unique crew members
    const { data: crewData } = await supabase
      .from('crew_documents')
      .select('crew_member')
      .distinct()

    return NextResponse.json({
      success: true,
      data: {
        totalDocuments: docCount || 0,
        documentChunks: chunkCount || 0,
        crewRelevant: crewData?.length || 0,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error getting RAG statistics:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
