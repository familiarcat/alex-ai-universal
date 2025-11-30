/**
 * 🧪 Mock Webhook Server for Testing
 * 
 * Creates a local mock server that simulates n8n webhook responses.
 * Useful for offline testing and CI/CD environments.
 */

const http = require('http');
const url = require('url');

class MockWebhookServer {
  constructor(port = 5678) {
    this.port = port;
    this.server = null;
    this.routes = new Map();
    this.requestLog = [];
  }

  /**
   * Register a webhook route
   */
  registerRoute(path, method = 'POST', handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, handler);
  }

  /**
   * Start the mock server
   */
  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const method = req.method;
        const key = `${method}:${path}`;

        // Log request
        this.requestLog.push({
          method,
          path,
          timestamp: new Date().toISOString(),
          headers: req.headers
        });

        // Find handler
        const handler = this.routes.get(key);

        if (handler) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = body ? JSON.parse(body) : {};
              const response = handler(payload, req, res);
              
              if (response) {
                res.writeHead(response.status || 200, {
                  'Content-Type': 'application/json',
                  ...response.headers
                });
                res.end(JSON.stringify(response.body || {}));
              }
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } else {
          // Default 404 for unregistered webhooks
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            code: 404,
            message: `The requested webhook "${method} ${path}" is not registered.`
          }));
        }
      });

      this.server.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Stop the mock server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get request log
   */
  getRequestLog() {
    return this.requestLog;
  }

  /**
   * Clear request log
   */
  clearRequestLog() {
    this.requestLog = [];
  }
}

module.exports = MockWebhookServer;

