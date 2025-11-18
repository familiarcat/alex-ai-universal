/**
 * Codebase Changes API
 * 
 * Returns recent codebase changes for polling fallback
 * 
 * Reviewed by: Lt. Uhura (API) & Commander Data (Efficiency)
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory change log (in production, use Redis or database)
const changeLog: Array<{
  event: string;
  filePath: string;
  timestamp: string;
  hash?: string;
}> = [];

// Maximum changes to keep in memory
const MAX_CHANGES = 100;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get('since');
    const limit = parseInt(searchParams.get('limit') || '50');

    let changes = changeLog;

    // Filter by timestamp if provided
    if (since) {
      const sinceDate = new Date(since);
      changes = changeLog.filter(change => 
        new Date(change.timestamp) > sinceDate
      );
    }

    // Limit results
    changes = changes.slice(-limit);

    return NextResponse.json({
      success: true,
      changes,
      count: changes.length,
      lastChange: changeLog.length > 0 ? changeLog[changeLog.length - 1].timestamp : null
    });
  } catch (error: any) {
    console.error('Codebase changes API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, filePath, timestamp, hash } = body;

    // Add to change log
    changeLog.push({
      event,
      filePath,
      timestamp: timestamp || new Date().toISOString(),
      hash
    });

    // Keep only recent changes
    if (changeLog.length > MAX_CHANGES) {
      changeLog.shift();
    }

    return NextResponse.json({
      success: true,
      message: 'Change logged'
    });
  } catch (error: any) {
    console.error('Codebase changes API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

