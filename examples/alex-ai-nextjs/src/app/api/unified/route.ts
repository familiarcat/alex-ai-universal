import { NextRequest, NextResponse } from 'next/server'

// Unified API endpoint that bridges Next.js with demo project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'dashboard'
    const demoProjectUrl = process.env.DEMO_PROJECT_URL || 'http://localhost:3001'

    switch (action) {
      case 'dashboard':
        return await getDashboardData(demoProjectUrl)
      case 'crew-status':
        return await getCrewStatus(demoProjectUrl)
      case 'system-health':
        return await getSystemHealth(demoProjectUrl)
      case 'live-preview':
        return await getLivePreview(demoProjectUrl)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Unified API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    const demoProjectUrl = process.env.DEMO_PROJECT_URL || 'http://localhost:3001'

    switch (action) {
      case 'update-config':
        return await updateConfig(demoProjectUrl, data)
      case 'trigger-action':
        return await triggerAction(demoProjectUrl, data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Unified API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Helper functions
async function getDashboardData(demoProjectUrl: string) {
  try {
    const response = await fetch(`${demoProjectUrl}/api/dashboard`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Demo project responded with ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: {
        crewMembers: data.crewMembers || [],
        systemStatus: data.systemStatus || {
          server: 'offline',
          connections: 0,
          lastUpdate: new Date().toISOString()
        },
        theme: data.theme || 'star-trek',
        config: data.config || {}
      }
    })
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    
    // Return fallback data when demo project is unavailable
    return NextResponse.json({
      success: false,
      data: {
        crewMembers: [
          {
            id: 'picard',
            name: 'Captain Jean-Luc Picard',
            role: 'Strategic Commander',
            status: 'active',
            component: 'Unified Dashboard',
            expertise: ['Strategic Leadership', 'System Integration']
          }
        ],
        systemStatus: {
          server: 'offline',
          connections: 0,
          lastUpdate: new Date().toISOString()
        },
        theme: 'star-trek',
        config: {}
      },
      error: 'Demo project unavailable - using fallback data'
    })
  }
}

async function getCrewStatus(demoProjectUrl: string) {
  try {
    const response = await fetch(`${demoProjectUrl}/api/crew-status`)
    
    if (!response.ok) {
      throw new Error(`Demo project responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch crew status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Demo project unavailable' 
    })
  }
}

async function getSystemHealth(demoProjectUrl: string) {
  try {
    const response = await fetch(`${demoProjectUrl}/api/health`)
    
    if (!response.ok) {
      throw new Error(`Demo project responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to fetch system health:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Demo project unavailable' 
    })
  }
}

async function getLivePreview(demoProjectUrl: string) {
  try {
    const response = await fetch(`${demoProjectUrl}/live`)
    
    if (!response.ok) {
      throw new Error(`Demo project responded with ${response.status}`)
    }

    const html = await response.text()
    return NextResponse.json({ 
      success: true, 
      data: { html, url: `${demoProjectUrl}/live` } 
    })
  } catch (error) {
    console.error('Failed to fetch live preview:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Demo project unavailable' 
    })
  }
}

async function updateConfig(demoProjectUrl: string, configData: any) {
  try {
    const response = await fetch(`${demoProjectUrl}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    })

    if (!response.ok) {
      throw new Error(`Demo project responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to update config:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Demo project unavailable' 
    })
  }
}

async function triggerAction(demoProjectUrl: string, actionData: any) {
  try {
    const response = await fetch(`${demoProjectUrl}/api/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actionData),
    })

    if (!response.ok) {
      throw new Error(`Demo project responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to trigger action:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Demo project unavailable' 
    })
  }
}
