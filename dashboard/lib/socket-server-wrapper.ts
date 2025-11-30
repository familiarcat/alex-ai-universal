/**
 * 🖖 Socket.IO Server Wrapper for Next.js
 * 
 * Provides Socket.IO server functionality that can be imported
 * into a custom Next.js server or used standalone
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export interface SocketServerConfig {
  httpServer: HTTPServer;
  cors?: {
    origin: string | string[];
    methods: string[];
  };
}

export class SocketServer {
  private io: SocketIOServer;
  private updateQueues: Map<string, Array<any>> = new Map();
  private connectedClients: Map<string, any> = new Map();

  constructor(config: SocketServerConfig) {
    this.io = new SocketIOServer(config.httpServer, {
      path: '/api/socket',
      cors: config.cors || {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const clientId = socket.id;
      console.log(`🔌 Socket.IO client connected: ${clientId}`);

      // Track connected client
      this.connectedClients.set(clientId, {
        socketId: clientId,
        projectIds: new Set(),
        connectedAt: Date.now(),
      });

      // Handle project sync start
      socket.on('sync:start', (data: { projectId: string }) => {
        const { projectId } = data;
        const client = this.connectedClients.get(clientId);
        
        if (client) {
          client.projectIds.add(projectId);
          socket.join(`project:${projectId}`);
          console.log(`📡 Client ${clientId} syncing project: ${projectId}`);
          
          socket.emit('sync:started', { projectId, success: true });
        }
      });

      // Handle project sync stop
      socket.on('sync:stop', (data: { projectId: string }) => {
        const { projectId } = data;
        const client = this.connectedClients.get(clientId);
        
        if (client) {
          client.projectIds.delete(projectId);
          socket.leave(`project:${projectId}`);
          console.log(`🛑 Client ${clientId} stopped syncing project: ${projectId}`);
          
          socket.emit('sync:stopped', { projectId, success: true });
        }
      });

      // Handle project update (event-driven)
      socket.on('project:update', (update: {
        projectId: string;
        field: string;
        value: any;
        timestamp: number;
        source: 'dashboard' | 'live';
      }) => {
        console.log(`📡 Project update: ${update.projectId}.${update.field}`);
        
        // Add to update queue
        if (!this.updateQueues.has(update.projectId)) {
          this.updateQueues.set(update.projectId, []);
        }
        this.updateQueues.get(update.projectId)!.push({
          projectId: update.projectId,
          field: update.field,
          value: update.value,
          timestamp: update.timestamp,
        });

        // Broadcast to all clients in project room (except sender)
        socket.to(`project:${update.projectId}`).emit('project:updated', {
          ...update,
          timestamp: Date.now(),
        });

        // Send acknowledgment
        socket.emit('project:update:ack', {
          projectId: update.projectId,
          field: update.field,
          success: true,
          timestamp: Date.now(),
        });
      });

      // Handle ping/pong
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${clientId}`);
        this.connectedClients.delete(clientId);
      });

      // Send initial connection status
      socket.emit('connected', {
        socketId: clientId,
        timestamp: Date.now(),
        server: 'event-driven-sync',
      });
    });
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

