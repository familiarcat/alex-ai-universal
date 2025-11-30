# 🖖 Alex AI Dashboard Deployment Guide

## 🚀 Quick Deployment to N8N Server

Your Alex AI Dashboard is ready for deployment to `n8n.pbradygeorgen.com/dashboard`!

### 📦 Deployment Package
- **File**: `alex-ai-dashboard-n8n.tar.gz` (125KB)
- **Checksum**: `ec5728803f157f2dead74c1c330c8405d36d805ccc376e2be303f9d79b1fa098`
- **Target**: `https://n8n.pbradygeorgen.com/dashboard/`

## 🛠️ Deployment Methods

### Method 1: Manual Upload (Recommended)
1. **Download** the deployment package: `alex-ai-dashboard-n8n.tar.gz`
2. **Upload** to your N8N server via web interface or file manager
3. **Extract** to `/dashboard` directory
4. **Configure** web server to serve the files

### Method 2: SSH Deployment (If you have SSH access)
```bash
# Upload package
scp alex-ai-dashboard-n8n.tar.gz user@n8n.pbradygeorgen.com:/tmp/

# SSH and deploy
ssh user@n8n.pbradygeorgen.com
sudo mkdir -p /dashboard
cd /dashboard
sudo tar -xzf /tmp/alex-ai-dashboard-n8n.tar.gz
sudo chown -R www-data:www-data /dashboard
sudo chmod -R 755 /dashboard
```

### Method 3: Automated Script
```bash
# Run the automated deployment script
./scripts/auto-deploy-to-n8n.sh
```

## 🌐 Web Server Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name n8n.pbradygeorgen.com;
    
    location /dashboard/ {
        alias /dashboard/;
        index index.html;
        try_files $uri $uri/ /dashboard/index.html;
        
        # Enable CORS for API calls
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName n8n.pbradygeorgen.com
    
    Alias /dashboard /dashboard
    <Directory /dashboard>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable CORS
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
        Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Directory>
</VirtualHost>
```

## 🎨 Dashboard Features

### ✅ Deployed Features
- **LCRS Layout**: Left-Center-Right-Sidebar presentation format
- **Dark Mode**: Federation-themed dark interface with glowing elements
- **Real-time Data**: Live updates from N8N workflows and Supabase memories
- **N8N Integration**: Direct API calls to `n8n.pbradygeorgen.com/api/v1`
- **Supabase Integration**: Real-time memory records and system metrics
- **Responsive Design**: Adapts to all screen sizes
- **Auto-refresh**: Updates every 30 seconds with live data

### 🔗 Data Sources
- **N8N Workflows**: Crew workflows, execution status, active processes
- **Supabase Memories**: Recent crew memories, system logs, performance data
- **System Metrics**: Real-time health, uptime, memory usage, performance scores

## 🛡️ Security Features

### 🔒 Security Headers
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- CORS headers for API access

### 🔐 Data Security
- Encrypted HTTPS transmission
- API key authentication for N8N
- Supabase authentication for memory access
- Secure credential management

## 🧪 Testing & Validation

### 1. Basic Functionality Test
```bash
# Test dashboard accessibility
curl -I https://n8n.pbradygeorgen.com/dashboard/

# Test API endpoint
curl -I https://n8n.pbradygeorgen.com/api/v1/alex-ai/status
```

### 2. Real-time Data Test
- Visit `https://n8n.pbradygeorgen.com/dashboard/`
- Verify crew performance metrics are loading
- Check N8N integration status
- Validate Supabase memory records

### 3. Security Validation
- Test CORS headers
- Verify HTTPS encryption
- Check API authentication
- Validate data transmission security

## 🔧 Troubleshooting

### Common Issues
1. **404 Error**: Check web server configuration and file permissions
2. **CORS Issues**: Verify CORS headers in web server config
3. **API Errors**: Check N8N and Supabase API credentials
4. **Styling Issues**: Ensure static files are served correctly

### Debug Commands
```bash
# Check file permissions
ls -la /dashboard/

# Test web server configuration
nginx -t  # for nginx
apache2ctl configtest  # for apache

# Check logs
tail -f /var/log/nginx/error.log
tail -f /var/log/apache2/error.log
```

## 📊 Post-Deployment

### Monitoring
- Monitor dashboard performance
- Check real-time data updates
- Validate security of data transmission
- Test knowledge gathering from multiple projects

### Maintenance
- Regular security updates
- Performance monitoring
- Data backup verification
- API credential rotation

## 🎉 Success Indicators

✅ Dashboard accessible at `https://n8n.pbradygeorgen.com/dashboard/`  
✅ Real-time data loading from N8N workflows  
✅ Supabase memory integration working  
✅ Security headers properly configured  
✅ CORS allowing API access  
✅ Auto-refresh functioning every 30 seconds  

---

**🚀 Your Alex AI Dashboard is ready to showcase the knowledge gathering from multiple projects and validate the security of your data transmission!**
