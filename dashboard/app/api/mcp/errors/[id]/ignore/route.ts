import { NextResponse } from 'next/server';

/**
 * Ignore Error API
 */

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Update error status in MCP monitoring service
    return NextResponse.json({
      success: true,
      message: 'Error ignored successfully'
    });
  } catch (error: any) {
    console.error('Error ignoring error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to ignore error'
    }, { status: 500 });
  }
}

