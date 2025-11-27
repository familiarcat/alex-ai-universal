/**
 * 🖖 Custom Next.js Server with Socket.IO
 * 
 * Event-Driven WebSocket Server for Real-Time Sync
 * Replaces polling with efficient event-driven architecture
 * 
 * DDD-Compliant: Client => WebSocket => Live Server => n8n => Supabase
 * 
 * Implementation by: Lieutenant Commander La Forge (Infrastructure)
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { SocketServer } from './lib/socket-server-wrapper';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Use separate build directories for each port to avoid conflicts
// Only when explicitly needed (multi-server setup)
const distDir = process.env.USE_PORT_DISTDIR ? `.next-${port}` : '.next';

// Create Next.js app with custom distDir
const app = next({ 
  dev, 
  hostname, 
  port,
  ...(process.env.USE_PORT_DISTDIR ? {
    conf: {
      distDir: distDir
    }
  } : {})
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log(`✅ Next.js app prepared for port ${port}`);
  
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err: any) {
      // If it's a build-related error, return a helpful message
      if (err.code === 'ENOENT' || err.code === 'MODULE_NOT_FOUND') {
        console.warn(`⚠️  Build not ready yet for ${req.url}, waiting for compilation...`);
        res.statusCode = 503; // Service Unavailable
        res.setHeader('Retry-After', '5');
        res.end('Service temporarily unavailable - Next.js is still compiling. Please refresh in a few seconds.');
        return;
      }
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.IO server wrapper
  const socketServer = new SocketServer({
    httpServer,
    cors: {
      origin: '*', // In production, restrict to specific origins
      methods: ['GET', 'POST'],
    },
  });

  // Start server
  httpServer.listen(port, () => {
    console.log(`🚀 Next.js server ready on http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO server ready on /api/socket`);
    console.log(`🖖 Event-driven sync enabled (no polling)`);
    console.log(`📊 Connection type: WebSocket (event-driven)`);
  });
});

