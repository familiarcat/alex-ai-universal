/**
 * Health check endpoint
 * GET /api/health
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: Date.now(),
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  });
}
