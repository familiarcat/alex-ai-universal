/**
 * RAG (Retrieval-Augmented Generation) Integration for Alex AI VS Code Extension
 * 
 * Implements Data's technical requirements:
 * - Vector database queries
 * - Document retrieval
 * - Context augmentation
 * 
 * Integrates with Supabase for RAG storage
 */

import { SecureApiClient, ApiResponse } from './api-client';
import { ContextGatherer, FileContext } from './context-gatherer';

export interface RAGQuery {
    query: string;
    context?: string;
    limit?: number;
    threshold?: number;
}

export interface RAGResult {
    content: string;
    metadata?: Record<string, unknown>;
    similarity?: number;
}

export class RAGIntegration {
    private apiClient: SecureApiClient;

    constructor(apiClient: SecureApiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Query RAG system for relevant context
     */
    async queryRAG(request: RAGQuery): Promise<ApiResponse<RAGResult[]>> {
        try {
            const response = await this.apiClient.callSupabase(
                '/rest/v1/rpc/query_rag',
                {
                    query_text: request.query,
                    context: request.context || '',
                    limit: request.limit || 5,
                    similarity_threshold: request.threshold || 0.7
                },
                'POST'
            );

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data as RAGResult[]
                };
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
     * Store context in RAG system
     */
    async storeContext(context: FileContext | string, metadata?: Record<string, unknown>): Promise<ApiResponse> {
        const content = typeof context === 'string' ? context : context.content;
        const contextMetadata = typeof context === 'string' 
            ? metadata 
            : { ...metadata, path: context.path, language: context.language };

        return this.apiClient.callSupabase(
            '/rest/v1/rpc/store_rag',
            {
                content,
                metadata: contextMetadata || {}
            },
            'POST'
        );
    }

    /**
     * Augment prompt with RAG context
     */
    async augmentPrompt(prompt: string, workspaceContext?: string): Promise<string> {
        const ragQuery: RAGQuery = {
            query: prompt,
            context: workspaceContext,
            limit: 3,
            threshold: 0.7
        };

        const response = await this.queryRAG(ragQuery);

        if (response.success && response.data && response.data.length > 0) {
            const ragContext = response.data
                .map(result => result.content)
                .join('\n\n');

            return `Relevant Context from Knowledge Base:\n${ragContext}\n\nUser Query: ${prompt}`;
        }

        return prompt;
    }
}

