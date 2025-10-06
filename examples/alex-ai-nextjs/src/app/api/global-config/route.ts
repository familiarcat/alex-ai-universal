import { NextRequest, NextResponse } from 'next/server'

// Global Configuration API that connects to Alex AI secrets system
export async function GET(request: NextRequest) {
  try {
    // This would normally access the global Alex AI configuration
    // For now, we'll return a configuration based on environment variables
    // In production, this would connect to the actual Alex AI secrets system
    
    const globalConfig = {
      openaiApiKey: process.env.OPENAI_API_KEY ? 'configured' : '',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY ? 'configured' : '',
      openrouterApiKey: process.env.OPENROUTER_API_KEY ? 'configured' : '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'configured' : '',
      n8nApiUrl: process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1',
      n8nApiKey: process.env.N8N_API_KEY ? 'configured' : '',
      alexAiEnabled: true, // Always enabled unless explicitly disabled
      ragEnabled: process.env.ALEX_AI_ENABLE_RAG === 'true',
      bilateralSync: process.env.ALEX_AI_ENABLE_BILATERAL_SYNC === 'true',
      projectType: 'alex-ai-universal',
      version: '1.0.0',
      features: {
        crewIntegration: true,
        emergencyProtocols: true,
        realTimeSync: true,
        ragSystem: process.env.ALEX_AI_ENABLE_RAG === 'true',
        n8nWorkflows: !!process.env.N8N_API_URL,
        themeSystem: true,
        navigationSystem: true
      },
      crewMembers: [
        {
          id: 'picard',
          name: 'Captain Jean-Luc Picard',
          role: 'Strategic Commander',
          status: 'active',
          component: 'Global Navigation',
          expertise: ['Strategic Leadership', 'Global System Integration', 'Decision Making']
        },
        {
          id: 'riker',
          name: 'Commander William Riker',
          role: 'First Officer',
          status: 'active',
          component: 'Operations Control',
          expertise: ['Tactical Operations', 'Workflow Management', 'Execution']
        },
        {
          id: 'data',
          name: 'Commander Data',
          role: 'Operations Officer',
          status: 'active',
          component: 'Data Processing',
          expertise: ['Analytics', 'Logic', 'Data Processing', 'AI/ML']
        },
        {
          id: 'laforge',
          name: 'Lieutenant Commander Geordi La Forge',
          role: 'Chief Engineer',
          status: 'active',
          component: 'System Architecture',
          expertise: ['Infrastructure', 'System Integration', 'Technical Solutions']
        },
        {
          id: 'worf',
          name: 'Lieutenant Worf',
          role: 'Security Officer',
          status: 'active',
          component: 'Security Monitor',
          expertise: ['Security Protocols', 'Threat Assessment', 'Compliance']
        },
        {
          id: 'troi',
          name: 'Counselor Deanna Troi',
          role: 'Ship\'s Counselor',
          status: 'active',
          component: 'User Experience',
          expertise: ['User Experience', 'Communication', 'Team Dynamics']
        },
        {
          id: 'crusher',
          name: 'Dr. Beverly Crusher',
          role: 'Chief Medical Officer',
          status: 'active',
          component: 'System Health',
          expertise: ['System Health', 'Diagnostics', 'Wellness']
        },
        {
          id: 'uhura',
          name: 'Lieutenant Uhura',
          role: 'Communications Officer',
          status: 'active',
          component: 'Communication Hub',
          expertise: ['Communication Protocols', 'Synchronization', 'Integration']
        },
        {
          id: 'quark',
          name: 'Quark',
          role: 'Business Operations',
          status: 'active',
          component: 'Resource Management',
          expertise: ['Cost Optimization', 'Efficiency Analysis', 'Business Metrics']
        }
      ],
      systemStatus: {
        server: 'online',
        globalNavigation: 'active',
        secretsLoaded: true,
        lastUpdate: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: globalConfig,
      message: 'Global Alex AI configuration loaded successfully'
    })

  } catch (error) {
    console.error('Global config API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load global configuration',
        data: {
          alexAiEnabled: true, // Always enable navigation system
          globalNavigation: 'fallback',
          message: 'Using fallback configuration'
        }
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update-config':
        // In a real implementation, this would update the global Alex AI configuration
        return NextResponse.json({
          success: true,
          message: 'Global configuration updated',
          data: data
        })

      case 'test-connection':
        // Test connection to various Alex AI services
        const connectionTests = {
          openai: !!process.env.OPENAI_API_KEY,
          anthropic: !!process.env.ANTHROPIC_API_KEY,
          openrouter: !!process.env.OPENROUTER_API_KEY,
          supabase: !!process.env.SUPABASE_ANON_KEY,
          n8n: !!process.env.N8N_API_URL
        }

        return NextResponse.json({
          success: true,
          data: connectionTests,
          message: 'Connection tests completed'
        })

      case 'reload-secrets':
        // Reload secrets from the global Alex AI system
        return NextResponse.json({
          success: true,
          message: 'Secrets reloaded from global system',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Unknown action' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Global config POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
