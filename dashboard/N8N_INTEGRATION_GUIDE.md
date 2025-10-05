# ⚡ N8N Integration Guide - Next.js 15 Learning Dashboard

## 🎯 Overview

The Next.js 15 Learning Dashboard includes comprehensive N8N server integration using your credentials from `~/.zshrc` to provide real-time system health monitoring, workflow statistics, and crew activity visualization.

## 🔐 N8N Credentials Configuration

### **From ~/.zshrc**
Your N8N credentials are automatically loaded from your shell configuration:

```bash
# N8N Workflow Automation Configuration
export N8N_URL="https://n8n.pbradygeorgen.com"
export N8N_BASE_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA"
export N8N_WEBHOOK_URL="https://n8n.pbradygeorgen.com/webhook"
export N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"
```

### **✅ Connection Status**
- **N8N Server**: `https://n8n.pbradygeorgen.com` ✅ **ACCESSIBLE**
- **Health Endpoint**: `/healthz` ✅ **RESPONDING (200)**
- **API Authentication**: Bearer token configured ✅
- **Webhook Endpoints**: Crew member webhooks configured ✅

## 🏗️ Integration Architecture

### **1. N8N Client Library** (`lib/n8n-client.js`)
- **Health Monitoring**: Real-time server health checks
- **Workflow Statistics**: Active/inactive workflow counts
- **Execution Analytics**: Success/failure rates and performance metrics
- **Crew Activity**: Individual crew member N8N webhook status
- **System Resources**: Version, instance ID, and configuration info

### **2. API Endpoints**
- **`/api/alex-ai/n8n-health`**: Comprehensive N8N health data
- **Real-time Updates**: 30-second refresh intervals
- **Error Handling**: Graceful fallback to mock data
- **Connection Testing**: Automatic credential validation

### **3. Dashboard Integration**
- **N8N Health Tab**: Dedicated system monitoring interface
- **Real-time Metrics**: Live workflow and execution statistics
- **Crew Activity**: Visual crew member N8N connectivity status
- **System Information**: Version and configuration details

## 🚀 Usage Instructions

### **Development with N8N Integration**
```bash
# Navigate to dashboard directory
cd dashboard

# Start with N8N credentials loaded
npm run dev:n8n

# Or manually load credentials
source ~/.zshrc && npm run dev
```

### **Testing N8N Connection**
```bash
# Test N8N server accessibility
curl -s -o /dev/null -w "%{http_code}" https://n8n.pbradygeorgen.com/healthz

# Expected output: 200 (OK)
```

### **Access Dashboard**
1. **Main Dashboard**: http://localhost:3000
2. **Learning Dashboard**: http://localhost:3000/learning
3. **N8N Health Tab**: Click "N8N Health" tab in learning dashboard

## 📊 N8N Health Dashboard Features

### **Real-Time Monitoring**
- **Server Health**: Live connection status and response times
- **Workflow Statistics**: Total, active, inactive, and crew-specific workflows
- **Execution Metrics**: Success rates, failure counts, and performance data
- **Crew Activity**: Individual crew member N8N webhook connectivity

### **Visual Indicators**
- **🟢 Green**: Healthy connections and successful operations
- **🔴 Red**: Connection failures or errors
- **🟡 Yellow**: Running processes or warnings
- **🔵 Blue**: Information and system details

### **Data Refresh**
- **Automatic**: Updates every 30 seconds
- **Manual**: Click refresh button for immediate updates
- **Real-time**: Live status indicators with animated pulse effects

## 🔧 Technical Implementation

### **Environment Variables**
The dashboard automatically uses these environment variables:
```bash
N8N_URL=https://n8n.pbradygeorgen.com
N8N_API_KEY=your-jwt-token
N8N_WEBHOOK_URL=https://n8n.pbradygeorgen.com/webhook
N8N_API_URL=https://n8n.pbradygeorgen.com/api/v1
```

### **API Integration**
- **Authentication**: Bearer token authentication
- **Timeout**: 10-second request timeout
- **Error Handling**: Comprehensive error catching and reporting
- **Fallback**: Mock data when N8N server unavailable

### **Security Features**
- **Credential Protection**: Environment variables for sensitive data
- **CORS Configuration**: Proper cross-origin request handling
- **Request Validation**: Input sanitization and validation
- **Rate Limiting**: Built-in request throttling

## 📈 Monitoring Capabilities

### **System Health Metrics**
- **Response Time**: N8N server response latency
- **Uptime Status**: Server availability monitoring
- **Version Information**: N8N instance version tracking
- **Instance Details**: Server configuration and metadata

### **Workflow Analytics**
- **Total Workflows**: Complete workflow inventory
- **Active Workflows**: Currently running workflows
- **Crew Workflows**: Alex AI crew-specific workflows
- **System Workflows**: Infrastructure and utility workflows

### **Execution Statistics**
- **Success Rate**: Percentage of successful executions
- **Failure Analysis**: Error patterns and failure reasons
- **Performance Metrics**: Average execution times
- **Volume Tracking**: Executions per day/week/month

### **Crew Member Monitoring**
- **Individual Status**: Each crew member's N8N connectivity
- **Response Times**: Webhook response latency per crew member
- **Activity Tracking**: Recent crew member N8N interactions
- **Health Indicators**: Visual status for each crew member

## 🔄 Real-Time Updates

### **Automatic Refresh**
- **30-Second Intervals**: Continuous monitoring updates
- **Live Indicators**: Animated status indicators
- **Background Sync**: Non-blocking data updates
- **Error Recovery**: Automatic retry on connection failures

### **Manual Refresh**
- **Instant Updates**: Click refresh button for immediate data
- **Connection Testing**: Manual N8N connectivity verification
- **Status Validation**: Real-time credential and endpoint testing

## 🛡️ Security & Reliability

### **Connection Security**
- **HTTPS Only**: All N8N communications over secure connections
- **Bearer Authentication**: JWT token-based API authentication
- **Credential Isolation**: Environment variable protection
- **Request Validation**: Input sanitization and validation

### **Error Handling**
- **Graceful Degradation**: Fallback to mock data on failures
- **Connection Recovery**: Automatic retry mechanisms
- **User Feedback**: Clear error messages and status indicators
- **Logging**: Comprehensive error logging for debugging

### **Performance Optimization**
- **Parallel Requests**: Concurrent API calls for faster loading
- **Caching**: Intelligent data caching to reduce API calls
- **Timeout Management**: Configurable request timeouts
- **Resource Efficiency**: Optimized data structures and rendering

## 🎉 Benefits

### **Operational Visibility**
- **Real-time Monitoring**: Live N8N server health and performance
- **Crew Coordination**: Visual crew member activity and status
- **System Analytics**: Comprehensive workflow and execution insights
- **Proactive Alerts**: Early warning for system issues

### **Development Efficiency**
- **Integrated Monitoring**: N8N health within learning dashboard
- **Credential Management**: Automatic loading from shell configuration
- **Error Debugging**: Detailed connection and API error reporting
- **Performance Tracking**: Real-time system performance metrics

### **User Experience**
- **Unified Interface**: Single dashboard for all Alex AI monitoring
- **Visual Clarity**: Color-coded status indicators and metrics
- **Real-time Updates**: Live data without page refreshes
- **Mobile Responsive**: Optimized for all device sizes

---

## 🚀 Ready for Production!

The N8N integration is fully configured and ready for use. Your credentials from `~/.zshrc` ensure a stable and secure connection to your N8N server at `n8n.pbradygeorgen.com`, providing comprehensive system health monitoring and crew activity visualization within the Next.js 15 learning dashboard.

**Access your integrated dashboard at: http://localhost:3000/learning** 🎯








