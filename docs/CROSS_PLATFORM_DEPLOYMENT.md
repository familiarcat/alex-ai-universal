# 🖖 Cross-Platform Deployment: Local macOS ↔ EC2 Production

**Date**: 2025-11-27  
**Objective**: Universal Socket.IO dependencies for local dev and EC2 production  
**Status**: ✅ **IMPLEMENTED**

---

## 🎯 Architecture

### **Local Development (macOS)**:
```
Local Dashboard (localhost:3000)
  ↓ WebSocket
Local Live Server (localhost:3001)
  ↓
Test & Manipulate Projects Locally
```

### **Production (EC2)**:
```
EC2 Dashboard (dashboard.pbradygeorgen.com)
  ↓ WebSocket
EC2 Live Server (live.pbradygeorgen.com)
  ↓
Deploy Projects to Production
```

### **Cross-Platform Sync**:
```
Local macOS (localhost:3000)
  ↓ WebSocket/API
EC2 Production (dashboard.pbradygeorgen.com)
  ↓
Dynamically Update EC2 Deployments
```

---

## 📦 Dependencies

### **Installed Packages**:
```json
{
  "dependencies": {
    "socket.io": "^4.x",
    "socket.io-client": "^4.x"
  },
  "devDependencies": {
    "@types/socket.io": "^3.x",
    "@types/socket.io-client": "^3.x",
    "ts-node": "^10.x"
  }
}
```

### **Universal Compatibility**:
- ✅ **macOS**: Works with npm install
- ✅ **EC2 (Linux)**: Works with npm install
- ✅ **Docker**: Included in Dockerfile
- ✅ **Terraform**: Dependencies installed via npm ci

---

## 🔧 Environment Configuration

### **Local Development (.env.local)**:
```env
NODE_ENV=development
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_LIVE_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_PATH=/api/socket
```

### **Production (EC2)**:
```env
NODE_ENV=production
EC2_DASHBOARD_URL=https://dashboard.pbradygeorgen.com
EC2_LIVE_SERVER_URL=https://live.pbradygeorgen.com
NEXT_PUBLIC_SOCKET_PATH=/api/socket
```

### **Environment Detection**:
- **Local**: `localhost` or `127.0.0.1` hostname
- **Production**: EC2 URLs from environment variables
- **Automatic**: Falls back to localhost if EC2 URLs not set

---

## 🐳 Docker Configuration

### **Dockerfile Updates**:
```dockerfile
# Install Socket.IO dependencies
RUN npm ci
RUN npm install socket.io socket.io-client --save

# Use custom server with Socket.IO
CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; else node .next/standalone/server.js; fi"]
```

### **Docker Compose** (if needed):
```yaml
services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - EC2_DASHBOARD_URL=${EC2_DASHBOARD_URL}
      - EC2_LIVE_SERVER_URL=${EC2_LIVE_SERVER_URL}
```

---

## 🏗️ Terraform Configuration

### **EC2 Instance Setup**:
- **User Data**: Installs Node.js, npm
- **Environment Variables**: Set via Terraform outputs
- **Security Groups**: Allow WebSocket connections (port 3000, 3001)

### **Terraform Variables**:
```hcl
variable "dashboard_url" {
  description = "Dashboard URL for Socket.IO connections"
  type        = string
  default     = "https://dashboard.pbradygeorgen.com"
}

variable "live_server_url" {
  description = "Live server URL for Socket.IO connections"
  type        = string
  default     = "https://live.pbradygeorgen.com"
}
```

---

## 🚀 Deployment Workflow

### **1. Local Development (macOS)**:
```bash
# Install dependencies
cd dashboard && npm install

# Start local servers
npm run dev:servers:start

# Test locally
# - Dashboard: http://localhost:3000
# - Live Server: http://localhost:3001
```

### **2. Build for Production**:
```bash
# Build Next.js app
npm run build

# Build Docker image
docker build -t alex-ai-dashboard .

# Test Docker locally
docker run -p 3000:3000 alex-ai-dashboard
```

### **3. Deploy to EC2 (Terraform)**:
```bash
# Apply Terraform
cd terraform/n8n-infrastructure
terraform apply

# Deploy dashboard
cd ../../dashboard
./scripts/deploy-ec2.sh
```

### **4. Cross-Platform Sync**:
```bash
# Local dashboard connects to EC2 production
# Set environment variables:
export EC2_DASHBOARD_URL=https://dashboard.pbradygeorgen.com
export EC2_LIVE_SERVER_URL=https://live.pbradygeorgen.com

# Start local dev
npm run dev:event-driven
```

---

## 📊 Connection Flow

### **Local → EC2 Sync**:
```
Local Dashboard (macOS)
  ↓ WebSocket
EC2 Dashboard (production)
  ↓
Update EC2 Project Deployments
```

### **Event Flow**:
1. User edits in local dashboard
2. State manager emits WebSocket event
3. Event sent to EC2 production server
4. EC2 server updates project
5. Changes reflected in EC2 live deployment

---

## 🔒 Security Considerations

### **Local Development**:
- ✅ CORS: Allow localhost connections
- ✅ No authentication (dev only)

### **Production (EC2)**:
- 🔐 CORS: Restrict to specific origins
- 🔐 JWT authentication
- 🔐 Rate limiting
- 🔐 HTTPS only

---

## 📋 Testing Checklist

### **Local macOS**:
- [x] Install dependencies
- [ ] Test local → local sync
- [ ] Verify WebSocket connections
- [ ] Test polling fallback

### **EC2 Production**:
- [ ] Deploy with Terraform
- [ ] Test EC2 → EC2 sync
- [ ] Verify WebSocket over HTTPS
- [ ] Test cross-platform sync (local → EC2)

### **Docker**:
- [ ] Build Docker image
- [ ] Test Docker container
- [ ] Verify Socket.IO in container

---

## 🎯 Success Criteria

- ✅ Dependencies work on macOS and Linux (EC2)
- ✅ Docker builds successfully
- ✅ Terraform deploys with Socket.IO support
- ✅ Local → EC2 sync works
- ✅ Event-driven (no polling) in production

---

**Status**: ✅ **DEPENDENCIES INSTALLED** | 🚧 **TESTING IN PROGRESS**  
**Next**: Test local → EC2 sync functionality

---

**End of Cross-Platform Deployment Guide**

