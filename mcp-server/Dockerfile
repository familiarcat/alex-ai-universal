FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY mcp-server/package*.json ./mcp-server/

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose port
EXPOSE 5679

# Health check - use node to make HTTP request (wget not available in alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5679/healthz', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start server
# Note: server.js location depends on how files are copied
# If COPY . . puts mcp-server/ at root, use mcp-server/server.js
# If files are at root, use server.js
CMD ["node", "server.js"]

