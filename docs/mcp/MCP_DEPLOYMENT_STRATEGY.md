# MCP Deployment Strategy

**Date:** January 20, 2025  
**Status:** ✅ Recommendation Complete  
**Decision:** Deploy to `mcp.pbradygeorgen.com` subdomain

## 🎯 Deployment Options Analyzed

### Option 1: mcp.pbradygeorgen.com (Subdomain) ⭐ **RECOMMENDED**

**Rating:** 9/10

**Pros:**
- ✅ Professional subdomain structure
- ✅ Clean URL: `https://mcp.pbradygeorgen.com`
- ✅ Same infrastructure as n8n (no additional cost)
- ✅ Easy nginx reverse proxy configuration
- ✅ Consistent with `n8n.pbradygeorgen.com` pattern
- ✅ Separate SSL certificate (Let's Encrypt)
- ✅ Clear separation of concerns

**Cons:**
- ⚠️ Requires DNS configuration (Route53)
- ⚠️ Requires nginx configuration

**Cost:** $0/month (reuses existing EC2 infrastructure)

**Setup Complexity:** Medium (DNS + nginx config)

### Option 2: n8n.pbradygeorgen.com/mcp (Path Routing)

**Rating:** 8/10

**Pros:**
- ✅ Simpler nginx configuration
- ✅ Same infrastructure (no additional cost)
- ✅ No DNS changes needed

**Cons:**
- ⚠️ Less clean URL structure
- ⚠️ Potential path conflicts
- ⚠️ Less professional appearance

**Cost:** $0/month

**Setup Complexity:** Easy (nginx path routing only)

### Option 3: n8n.pbradygeorgen.com:5679 (Port Access)

**Rating:** 7/10

**Pros:**
- ✅ Simplest setup (direct port access)
- ✅ No nginx configuration needed
- ✅ Same infrastructure

**Cons:**
- ⚠️ Requires port exposure
- ⚠️ Less professional (exposed port)
- ⚠️ May have firewall issues
- ⚠️ Not HTTPS by default

**Cost:** $0/month

**Setup Complexity:** Easy (port exposure only)

### Option 4: Vercel (Free Platform)

**Rating:** 6/10

**Pros:**
- ✅ Free hosting
- ✅ Easy deployment (Vercel CLI)
- ✅ Automatic scaling
- ✅ Managed infrastructure

**Cons:**
- ⚠️ Serverless cold starts (bad for workflows)
- ⚠️ Different infrastructure from n8n
- ⚠️ Execution time limits
- ⚠️ Harder to debug and monitor
- ⚠️ May not work well with long-running workflows

**Cost:** $0/month (free tier)

**Setup Complexity:** Easy (but different platform)

### Option 5: Separate EC2 Instance

**Rating:** 5/10

**Pros:**
- ✅ Dedicated resources
- ✅ Complete isolation
- ✅ Better scalability

**Cons:**
- ⚠️ Additional $20-30/month cost
- ⚠️ More complex setup
- ⚠️ Separate maintenance
- ⚠️ Unnecessary for current needs

**Cost:** $20-30/month

**Setup Complexity:** High (full EC2 setup)

## 🖖 Crew Recommendation

### ✅ PRIMARY RECOMMENDATION: mcp.pbradygeorgen.com

**Captain Picard:** "Clear separation of concerns, professional URL structure, cost-effective."

**Commander Data:** "Best technical solution: clean DNS routing, nginx reverse proxy, SSL via Let's Encrypt."

**Chief O'Brien:** "Simple solution: reuse existing infrastructure, easy nginx config, no additional costs."

**Quark:** "Zero additional cost, maximum value. Best ROI."

## 📋 Implementation Plan

### Step 1: DNS Configuration (Route53)

```bash
# Add A record in Route53
mcp.pbradygeorgen.com → [EC2 Elastic IP]
```

### Step 2: Nginx Configuration

```nginx
# /etc/nginx/sites-available/mcp
server {
    listen 80;
    server_name mcp.pbradygeorgen.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mcp.pbradygeorgen.com;

    ssl_certificate /etc/letsencrypt/live/mcp.pbradygeorgen.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.pbradygeorgen.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5679;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

### Step 3: SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d mcp.pbradygeorgen.com
```

### Step 4: Update Docker Compose

```yaml
# Add to existing docker-compose.yml
services:
  mcp-server:
    ports:
      - "5679:5679"
    environment:
      - MCP_PORT=5679
      - MCP_API_KEY=${N8N_API_KEY}
```

### Step 5: Update Client Configuration

```javascript
// Update unified-service-accessor.js
const mcpConfig = {
  baseUrl: 'https://mcp.pbradygeorgen.com',
  apiKey: process.env.N8N_API_KEY
};
```

## 🎯 Benefits of Subdomain Approach

1. **Professional:** Clean, memorable URL
2. **Cost-Effective:** Zero additional infrastructure cost
3. **Consistent:** Matches n8n.pbradygeorgen.com pattern
4. **Scalable:** Easy to add more services (e.g., api.pbradygeorgen.com)
5. **Maintainable:** Single EC2 instance, shared infrastructure
6. **Secure:** HTTPS via Let's Encrypt, same security as n8n

## 📊 Comparison Matrix

| Option | Cost | Setup | Scalability | Performance | Rating |
|--------|------|-------|-------------|-------------|--------|
| mcp.pbradygeorgen.com | $0 | Medium | Medium | High | 9/10 |
| n8n.pbradygeorgen.com/mcp | $0 | Easy | Medium | High | 8/10 |
| n8n.pbradygeorgen.com:5679 | $0 | Easy | Medium | High | 7/10 |
| Vercel | $0 | Easy | High | Medium | 6/10 |
| Separate EC2 | $20-30 | High | High | High | 5/10 |

## ✅ Final Decision

**Deploy to:** `mcp.pbradygeorgen.com`  
**Infrastructure:** Same EC2 instance as n8n  
**Port:** 5679 (internal), 443 (external via nginx)  
**Cost:** $0/month  
**Timeline:** 1-2 hours setup

---

**Status:** ✅ Recommendation Complete  
**Next Action:** Implement DNS and nginx configuration

