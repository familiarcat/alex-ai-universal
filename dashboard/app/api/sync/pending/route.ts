/**
 * API Route: Get pending sync updates
 * GET /api/sync/pending
 * 
 * This endpoint returns updates that need to be synced
 * from the dashboard to the live server.
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory store for pending updates (in production, use database)
const pendingUpdates: Array<{
  projectId: string;
  field: string;
  value: any;
  timestamp: number;
  synced: boolean;
}> = [];

export async function GET(request: NextRequest) {
  try {
    // Get unsynced updates
    const unsynced = pendingUpdates
      .filter(u => !u.synced)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 50); // Limit to 50 updates per request

    // Mark as synced
    unsynced.forEach(u => {
      u.synced = true;
    });

    return NextResponse.json(unsynced.map(u => ({
      projectId: u.projectId,
      field: u.field,
      value: u.value,
      timestamp: u.timestamp,
      source: 'dashboard' as const,
    })));
  } catch (error) {
    console.error('❌ Get pending updates error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Add a pending update (called from dashboard when content changes)
 */
export function addPendingUpdate(update: {
  projectId: string;
  field: string;
  value: any;
}) {
  pendingUpdates.push({
    ...update,
    timestamp: Date.now(),
    synced: false,
  });

  // Keep only last 1000 updates
  if (pendingUpdates.length > 1000) {
    pendingUpdates.shift();
  }
}

