/**
 * 🖖 Socket.IO API Route Handler
 * 
 * Note: Next.js App Router doesn't support WebSocket directly
 * This is a placeholder - Socket.IO server should run separately
 * or use a custom server (server.ts)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Socket.IO server',
    note: 'Socket.IO requires a custom Next.js server. Use server.ts for full WebSocket support.',
    status: 'ready',
    endpoint: '/api/socket',
  });
}

