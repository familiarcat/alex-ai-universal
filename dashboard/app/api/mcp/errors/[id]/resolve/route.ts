import { NextResponse } from 'next/server';

/**
 * Resolve Error API
 */

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { resolution } = await request.json();

    // TODO: Update error status in MCP monitoring service
    return NextResponse.json({
      success: true,
      message: 'Error resolved successfully'
    });
  } catch (error: any) {
    console.error('Error resolving error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to resolve error'
    }, { status: 500 });
  }
}

