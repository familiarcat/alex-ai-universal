/**
 * N8N WebSocket Client for Real-time Updates
 * 
 * Provides real-time communication with N8N server for live updates,
 * execution monitoring, and system status changes.
 */

import { N8NExecution, N8NHealthStatus } from './n8n-client'

export interface WebSocketMessage {
  type: 'execution_update' | 'health_update' | 'workflow_update' | 'system_alert' | 'ping' | 'pong'
  data: any
  timestamp: string
  source: 'n8n' | 'client'
}

export interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void

export class N8NWebSocketClient {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private isConnecting: boolean = false
  private reconnectAttempts: number = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map()
  private isConnected: boolean = false

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: process.env.NEXT_PUBLIC_N8N_WS_URL || 'wss://n8n.pbradygeorgen.com/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    }
  }

  /**
   * Connect to N8N WebSocket server
   */
  async connect(): Promise<boolean> {
    if (this.isConnecting || this.isConnected) {
      return this.isConnected
    }

    return new Promise((resolve) => {
      try {
        this.isConnecting = true
        console.log('🔌 Connecting to N8N WebSocket...')

        // Add authentication token if available
        const token = process.env.NEXT_PUBLIC_N8N_WS_TOKEN
        const url = token ? `${this.config.url}?token=${token}` : this.config.url

        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('✅ N8N WebSocket connected')
          this.isConnected = true
          this.isConnecting = false
          this.reconnectAttempts = 0
          
          // Start heartbeat
          this.startHeartbeat()
          
          // Emit connection event
          this.emit('connection', { type: 'connected', data: {}, timestamp: new Date().toISOString(), source: 'client' })
          
          resolve(true)
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 N8N WebSocket disconnected:', event.code, event.reason)
          this.isConnected = false
          this.isConnecting = false
          this.stopHeartbeat()
          
          // Emit disconnection event
          this.emit('connection', { 
            type: 'disconnected', 
            data: { code: event.code, reason: event.reason }, 
            timestamp: new Date().toISOString(), 
            source: 'client' 
          })
          
          // Attempt reconnection if not intentional
          if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
          
          resolve(false)
        }

        this.ws.onerror = (error) => {
          console.error('❌ N8N WebSocket error:', error)
          this.isConnected = false
          this.isConnecting = false
          resolve(false)
        }

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        this.isConnecting = false
        resolve(false)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('🔌 Disconnecting from N8N WebSocket...')
    
    this.stopHeartbeat()
    this.clearReconnectTimer()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.isConnected = false
    this.isConnecting = false
  }

  /**
   * Send message to N8N server
   */
  send(message: Partial<WebSocketMessage>): boolean {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot send message: WebSocket not connected')
      return false
    }

    try {
      const fullMessage: WebSocketMessage = {
        type: 'ping',
        data: {},
        timestamp: new Date().toISOString(),
        source: 'client',
        ...message,
      }

      this.ws.send(JSON.stringify(fullMessage))
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }

  /**
   * Subscribe to specific message types
   */
  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  /**
   * Unsubscribe from message types
   */
  off(eventType: string, handler?: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) return

    if (handler) {
      const handlers = this.eventHandlers.get(eventType)!
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.eventHandlers.delete(eventType)
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean
    isConnecting: boolean
    reconnectAttempts: number
    url: string
  } {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      url: this.config.url,
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Emit to specific handlers
    this.emit(message.type, message)
    
    // Emit to general handlers
    this.emit('message', message)

    // Handle pong responses
    if (message.type === 'pong') {
      console.log('🏓 Received pong from N8N server')
    }
  }

  /**
   * Emit events to registered handlers
   */
  private emit(eventType: string, message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(eventType) || []
    handlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error(`Error in WebSocket event handler for ${eventType}:`, error)
      }
    })
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping', data: {} })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`🔄 Scheduling N8N WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

/**
 * Singleton WebSocket client instance
 */
export const n8nWebSocket = new N8NWebSocketClient()

/**
 * WebSocket event types for type safety
 */
export const WebSocketEvents = {
  CONNECTION: 'connection',
  MESSAGE: 'message',
  EXECUTION_UPDATE: 'execution_update',
  HEALTH_UPDATE: 'health_update',
  WORKFLOW_UPDATE: 'workflow_update',
  SYSTEM_ALERT: 'system_alert',
  PING: 'ping',
  PONG: 'pong',
} as const

/**
 * Utility functions for WebSocket integration
 */
export const WebSocketUtils = {
  /**
   * Create execution update message
   */
  createExecutionUpdate: (execution: N8NExecution): WebSocketMessage => ({
    type: 'execution_update',
    data: execution,
    timestamp: new Date().toISOString(),
    source: 'n8n',
  }),

  /**
   * Create health update message
   */
  createHealthUpdate: (health: N8NHealthStatus): WebSocketMessage => ({
    type: 'health_update',
    data: health,
    timestamp: new Date().toISOString(),
    source: 'n8n',
  }),

  /**
   * Create system alert message
   */
  createSystemAlert: (alert: {
    level: 'info' | 'warning' | 'error' | 'critical'
    message: string
    source: string
    metadata?: any
  }): WebSocketMessage => ({
    type: 'system_alert',
    data: alert,
    timestamp: new Date().toISOString(),
    source: 'n8n',
  }),

  /**
   * Check if message is from N8N server
   */
  isFromServer: (message: WebSocketMessage): boolean => {
    return message.source === 'n8n'
  },

  /**
   * Check if message is from client
   */
  isFromClient: (message: WebSocketMessage): boolean => {
    return message.source === 'client'
  },

  /**
   * Get message age in milliseconds
   */
  getMessageAge: (message: WebSocketMessage): number => {
    return Date.now() - new Date(message.timestamp).getTime()
  },

  /**
   * Check if message is recent (less than specified age)
   */
  isRecentMessage: (message: WebSocketMessage, maxAgeMs: number = 60000): boolean => {
    return WebSocketUtils.getMessageAge(message) <= maxAgeMs
  },
}

export default n8nWebSocket




