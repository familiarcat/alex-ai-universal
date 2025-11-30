/**
 * N8N API Client
 * Low-level HTTP client for N8N API
 * 
 * Extracted from scripts/n8n-cli-tools.js
 * Reviewed by: Lieutenant Uhura (API Integration)
 */

import * as https from 'https';
import * as http from 'http';

export interface N8NConfig {
  url: string;
  apiKey: string;
}

export class N8NClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: N8NConfig) {
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
          'X-N8N-API-KEY': this.apiKey,
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
  async listWorkflows(): Promise<any> {
    return this.request('GET', '/api/v1/workflows');
  }

  async getWorkflow(id: string): Promise<any> {
    return this.request('GET', `/api/v1/workflows/${id}`);
  }

  async createWorkflow(workflowData: any): Promise<any> {
    return this.request('POST', '/api/v1/workflows', workflowData);
  }

  async updateWorkflow(id: string, workflowData: any): Promise<any> {
    return this.request('PATCH', `/api/v1/workflows/${id}`, workflowData);
  }

  async activateWorkflow(id: string): Promise<any> {
    return this.request('PATCH', `/api/v1/workflows/${id}`, { active: true });
  }

  async deactivateWorkflow(id: string): Promise<any> {
    return this.request('PATCH', `/api/v1/workflows/${id}`, { active: false });
  }

  async deleteWorkflow(id: string): Promise<any> {
    return this.request('DELETE', `/api/v1/workflows/${id}`);
  }

  // Execution operations
  async executeWorkflow(id: string, data: any): Promise<any> {
    return this.request('POST', `/api/v1/workflows/${id}/execute`, data);
  }

  async getExecutions(workflowId: string): Promise<any> {
    return this.request('GET', `/api/v1/executions?workflowId=${workflowId}`);
  }

  // Webhook operations
  async callWebhook(url: string, payload: any): Promise<any> {
    const webhookUrl = new URL(url);
    const isHttps = webhookUrl.protocol === 'https:';
    const httpClient = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const options: http.RequestOptions = {
        hostname: webhookUrl.hostname,
        port: webhookUrl.port || (isHttps ? 443 : 80),
        path: webhookUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = httpClient.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve({ success: true, raw: data });
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(payload));
      req.end();
    });
  }
}

