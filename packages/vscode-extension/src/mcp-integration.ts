/**
 * MCP (Model Context Protocol) Integration for Alex AI VS Code Extension
 * 
 * Implements Data's technical requirements:
 * - WebSocket connection for real-time updates
 * - Authentication and session management
 * - Command routing
 * - Crew coordination
 * 
 * Implements Uhura's integration requirements:
 * - Event-based messaging
 * - Pub/Sub pattern for async operations
 * - Service resilience
 */

import { SecureApiClient, ApiResponse } from './api-client';
import * as vscode from 'vscode';

export interface MCPMessage {
    type: 'request' | 'response' | 'notification';
    id?: string;
    method?: string;
    params?: unknown;
    result?: unknown;
    error?: { code: number; message: string };
}

export interface CrewCoordinationRequest {
    query: string;
    context?: string;
    crewMembers?: string[];
    priority?: 'low' | 'medium' | 'high';
}

export class MCPIntegration {
    private apiClient: SecureApiClient;
    private sessionId: string | undefined;

    constructor(apiClient: SecureApiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Initialize MCP session
     */
    async initialize(): Promise<ApiResponse<{ sessionId: string }>> {
        try {
            const response = await this.apiClient.callMCP('/api/session/init', {
                client: 'vscode-extension',
                version: '1.0.0'
            });

            if (response.success && response.data) {
                const data = response.data as { sessionId: string };
                this.sessionId = data.sessionId;
                return response;
            }

            return response;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Send message to crew via MCP
     */
    async sendCrewMessage(request: CrewCoordinationRequest): Promise<ApiResponse> {
        if (!this.sessionId) {
            await this.initialize();
        }

        return this.apiClient.callMCP('/api/crew/coordinate', {
            sessionId: this.sessionId,
            ...request
        });
    }

    /**
     * Get crew status
     */
    async getCrewStatus(): Promise<ApiResponse> {
        return this.apiClient.callMCP('/api/crew/status', {
            sessionId: this.sessionId
        });
    }

    /**
     * Get system health (Crusher's requirement)
     */
    async getSystemHealth(): Promise<ApiResponse> {
        return this.apiClient.callMCP('/api/system/health', {
            sessionId: this.sessionId
        });
    }

    /**
     * Route message to specific crew member
     */
    async routeToCrewMember(crewMember: string, message: string, context?: string): Promise<ApiResponse> {
        return this.sendCrewMessage({
            query: message,
            context,
            crewMembers: [crewMember],
            priority: 'medium'
        });
    }
}

