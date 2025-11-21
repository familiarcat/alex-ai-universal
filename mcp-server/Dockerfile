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

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5679/healthz || exit 1

# Start server
CMD ["node", "mcp-server/server.js"]

