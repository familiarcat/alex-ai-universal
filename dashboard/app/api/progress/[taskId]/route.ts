/**
 * Progress API Route
 * 
 * Serves progress data from files for dashboard consumption
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // FIXED: Next.js 16 requires awaiting params
    const { taskId } = await params;
    const progressFile = path.join(
      process.cwd(),
      'reports',
      'progress',
      `${taskId}.json`
    );

    if (!fs.existsSync(progressFile)) {
      // Return graceful response for missing progress files
      // This is expected when a task hasn't started yet
      return NextResponse.json(
        { 
          taskId,
          current: 0,
          total: 1,
          percentage: 0,
          currentStep: null,
          steps: [],
          elapsed: '0',
          timestamp: new Date().toISOString(),
          status: 'pending',
          message: 'Progress tracking not yet started'
        },
        { status: 200 } // Return 200 with pending state instead of 404
      );
    }

    const progressData = JSON.parse(
      fs.readFileSync(progressFile, 'utf8')
    );

    return NextResponse.json(progressData);
  } catch (error: any) {
    console.error('Error reading progress:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

