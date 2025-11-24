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
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const progressFile = path.join(
      process.cwd(),
      'reports',
      'progress',
      `${taskId}.json`
    );

    if (!fs.existsSync(progressFile)) {
      return NextResponse.json(
        { error: 'Progress file not found' },
        { status: 404 }
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

