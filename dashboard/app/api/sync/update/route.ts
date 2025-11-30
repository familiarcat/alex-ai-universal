/**
 * API Route: Receive sync updates from dashboard
 * POST /api/sync/update
 * 
 * This endpoint receives updates from the dashboard server
 * and applies them to the live project instance.
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for updates (in production, use database)
const updateQueue: Array<{
  projectId: string;
  field: string;
  value: any;
  timestamp: number;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, field, value, timestamp } = body;

    // Validate required fields
    if (!projectId || !field || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add to update queue
    updateQueue.push({
      projectId,
      field,
      value,
      timestamp: timestamp || Date.now(),
    });

    // Keep only last 100 updates
    if (updateQueue.length > 100) {
      updateQueue.shift();
    }

    // In a real implementation, you would:
    // 1. Update the project state
    // 2. Persist to database via n8n => Supabase
    // 3. Broadcast to connected clients via WebSocket

    console.log(`📡 Sync update received: ${projectId}.${field} = ${value}`);

    return NextResponse.json({
      success: true,
      message: 'Update received',
      projectId,
      field,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('❌ Sync update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return recent updates
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const limit = parseInt(searchParams.get('limit') || '10');

  let updates = updateQueue;
  if (projectId) {
    updates = updateQueue.filter(u => u.projectId === projectId);
  }

  return NextResponse.json({
    success: true,
    updates: updates.slice(-limit),
    count: updates.length,
  });
}

