import { NextRequest, NextResponse } from 'next/server'

// N8N Proxy API to handle CORS issues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    const apiKey = process.env.NEXT_PUBLIC_N8N_API_KEY || process.env.N8N_API_KEY

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint parameter is required' },
        { status: 400 }
      )
    }

    const n8nBaseUrl = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'https://n8n.pbradygeorgen.com'
    const fullUrl = `${n8nBaseUrl}${endpoint}`

    console.log(`🔗 Proxying N8N request to: ${fullUrl}`)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.error(`N8N API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { 
          success: false, 
          error: `N8N API error: ${response.status}`,
          details: response.statusText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data,
      source: 'n8n-proxy'
    })

  } catch (error: any) {
    console.error('N8N Proxy error:', error)
    
    // Return mock data if N8N is unavailable
    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'N8N server unavailable',
        mockData: {
          workflows: [
            { id: '1', name: 'Crew Coordination', active: true },
            { id: '2', name: 'Memory Sync', active: true },
            { id: '3', name: 'Health Monitoring', active: false }
          ],
          health: {
            status: 'offline',
            message: 'Running in offline mode'
          }
        }
      })
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    const apiKey = process.env.NEXT_PUBLIC_N8N_API_KEY || process.env.N8N_API_KEY
    const body = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint parameter is required' },
        { status: 400 }
      )
    }

    const n8nBaseUrl = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'https://n8n.pbradygeorgen.com'
    const fullUrl = `${n8nBaseUrl}${endpoint}`

    console.log(`🔗 Proxying N8N POST request to: ${fullUrl}`)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.error(`N8N API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { 
          success: false, 
          error: `N8N API error: ${response.status}`,
          details: response.statusText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data,
      source: 'n8n-proxy'
    })

  } catch (error: any) {
    console.error('N8N Proxy error:', error)
    
    // Return mock data if N8N is unavailable
    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      return NextResponse.json({
        success: false,
        error: 'N8N server unavailable',
        mockData: {
          execution: {
            id: 'mock-execution',
            status: 'success',
            message: 'Mock execution completed'
          }
        }
      })
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
