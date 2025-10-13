import { NextRequest, NextResponse } from 'next/server'
import { LCARSAccessRetrievalSystem } from '@/lib/lcars-access-retrieval-system'

// Initialize LCARS system
const lcars = new LCARSAccessRetrievalSystem()

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  const projectId = url.searchParams.get('projectId')

  try {
    switch (action) {
      case 'status':
        const status = lcars.getSystemStatus()
        return NextResponse.json({
          success: true,
          data: status
        })

      case 'projects':
        const projects = lcars.getAllProjects()
        return NextResponse.json({
          success: true,
          data: projects
        })

      case 'project':
        if (!projectId) {
          return NextResponse.json(
            { success: false, error: 'projectId is required' },
            { status: 400 }
          )
        }
        const project = lcars.getProject(projectId)
        if (!project) {
          return NextResponse.json(
            { success: false, error: 'Project not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          data: project
        })

      case 'updates':
        if (!projectId) {
          return NextResponse.json(
            { success: false, error: 'projectId is required' },
            { status: 400 }
          )
        }
        const updates = lcars.getProjectUpdates(projectId)
        return NextResponse.json({
          success: true,
          data: updates
        })

      case 'library-computer-models':
        const libraryComputer = lcars.getLibraryComputer()
        const models = libraryComputer.getAvailableModels()
        return NextResponse.json({
          success: true,
          data: models
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('LCARS API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create-project':
        const { name, description, crewMembers } = body
        if (!name || !description || !crewMembers) {
          return NextResponse.json(
            { success: false, error: 'name, description, and crewMembers are required' },
            { status: 400 }
          )
        }
        const project = await lcars.createPreviewProject(name, description, crewMembers)
        return NextResponse.json({
          success: true,
          data: project,
          message: 'Project created successfully'
        })

      case 'request-crew-assistance':
        const { projectId, crewMemberId, request, context } = body
        if (!projectId || !crewMemberId || !request) {
          return NextResponse.json(
            { success: false, error: 'projectId, crewMemberId, and request are required' },
            { status: 400 }
          )
        }
        const assistance = await lcars.requestCrewAssistance(
          projectId,
          crewMemberId,
          request,
          context
        )
        return NextResponse.json({
          success: true,
          data: assistance,
          message: 'Crew assistance request processed'
        })

      case 'apply-live-update':
        const { projectId: updateProjectId, update } = body
        if (!updateProjectId || !update) {
          return NextResponse.json(
            { success: false, error: 'projectId and update are required' },
            { status: 400 }
          )
        }
        const liveUpdate = await lcars.applyLiveUpdate(updateProjectId, update)
        return NextResponse.json({
          success: true,
          data: liveUpdate,
          message: 'Live update applied'
        })

      case 'approve-update':
        const { projectId: approveProjectId, updateIndex, approvingCrewMember } = body
        if (!approveProjectId || updateIndex === undefined || !approvingCrewMember) {
          return NextResponse.json(
            { success: false, error: 'projectId, updateIndex, and approvingCrewMember are required' },
            { status: 400 }
          )
        }
        await lcars.approveLiveUpdate(approveProjectId, updateIndex, approvingCrewMember)
        return NextResponse.json({
          success: true,
          message: 'Update approved'
        })

      case 'publish-project':
        const { projectId: publishProjectId, config } = body
        if (!publishProjectId || !config) {
          return NextResponse.json(
            { success: false, error: 'projectId and config are required' },
            { status: 400 }
          )
        }
        const publishResult = await lcars.publishProject(publishProjectId, config)
        return NextResponse.json({
          success: publishResult.success,
          data: publishResult,
          message: publishResult.success ? 'Project published successfully' : 'Publishing failed'
        })

      case 'analyze-prompt':
        const { crewMemberId: analyzeCrewId, prompt, analysisContext } = body
        if (!analyzeCrewId || !prompt) {
          return NextResponse.json(
            { success: false, error: 'crewMemberId and prompt are required' },
            { status: 400 }
          )
        }
        const libraryComputer = lcars.getLibraryComputer()
        const analysis = await libraryComputer.analyzePrompt(
          prompt,
          analyzeCrewId,
          analysisContext
        )
        return NextResponse.json({
          success: true,
          data: analysis,
          message: 'Prompt analyzed'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('LCARS API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}



