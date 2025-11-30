/**
 * MCP API Client
 * HTTP client for remote MCP server
 * 
 * Similar architecture to N8NClient for consistency
 */

import * as https from 'https';
import * as http from 'http';

export interface MCPConfig {
  url: string;
  apiKey: string;
}

export class MCPClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: MCPConfig) {
    this.baseUrl = config.url.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
  }

  async request<T = any>(
    method: string,
    endpoint: string,
    body: any = null
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-MCP-API-KEY': this.apiKey,
          'Accept': 'application/json',
        },
      };

      if (body) {
        const bodyString = JSON.stringify(body);
        options.headers!['Content-Length'] = Buffer.byteLength(bodyString);
      }

      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
            }
          } catch (error) {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ raw: data } as T);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  // Workflow operations
  async executeWorkflow(workflow: any): Promise<any> {
    return this.request('POST', '/api/workflows/execute', workflow);
  }

  async listWorkflows(): Promise<any> {
    return this.request('GET', '/api/workflows');
  }

  // Memory operations
  async storeMemory(memoryData: any): Promise<any> {
    return this.request('POST', '/api/memory/store', memoryData);
  }

  async queryMemories(query: string, options: any = {}): Promise<any> {
    return this.request('POST', '/api/memory/query', { query, options });
  }

  // Context operations
  async storeContext(content: string, embeddings: number[] | null, metadata: any): Promise<any> {
    return this.request('POST', '/api/context/store', { content, embeddings, metadata });
  }

  async getContext(cacheKey: string): Promise<any> {
    return this.request('GET', `/api/context/${cacheKey}`);
  }

  // LLM operations
  async callLLM(prompt: string, options: any = {}): Promise<any> {
    return this.request('POST', '/api/llm/call', { prompt, options });
  }

  // Monitoring operations
  async getStats(): Promise<any> {
    return this.request('GET', '/api/monitoring/stats');
  }

  async getExecutionHistory(limit: number = 50): Promise<any> {
    return this.request('GET', `/api/monitoring/history?limit=${limit}`);
  }

  // Scheduler operations
  async scheduleWorkflow(workflowId: string, cron: string, parameters: any = {}): Promise<any> {
    return this.request('POST', '/api/scheduler/schedule', { workflowId, cron, parameters });
  }

  async getScheduledJobs(): Promise<any> {
    return this.request('GET', '/api/scheduler/jobs');
  }

  // Service status
  async getStatus(): Promise<any> {
    return this.request('GET', '/api/status');
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('GET', '/healthz');
  }
}

