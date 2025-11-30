#!/bin/bash

################################################################################
#
# N8N EC2 Instance User Data Script
# 
# This script runs on instance FIRST BOOT to:
# - Install Docker
# - Install SSM agent (for remote automation)
# - Configure nginx reverse proxy
# - Set up n8n with correct WEBHOOK_URL
# - Configure automated backups
# - Set up CloudWatch monitoring
#
################################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 N8N Infrastructure Setup (Terraform-managed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update system
echo "📦 Updating system packages..."
apt-get update -y
apt-get upgrade -y

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Installing Docker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

echo "✅ Docker installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Installing SSM Agent..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install SSM agent (for AWS Systems Manager access)
snap install amazon-ssm-agent --classic
systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

echo "✅ SSM Agent installed and running"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Installing nginx reverse proxy..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Configure nginx for n8n
cat > /etc/nginx/sites-available/n8n << 'NGINX_CONFIG'
server {
    listen 80;
    server_name ${n8n_domain};

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${n8n_domain};

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/${n8n_domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${n8n_domain}/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to n8n
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running workflows
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINX_CONFIG

# Enable nginx site
ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/n8n
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Note: SSL certificate will be obtained after first boot
# Manual step: certbot --nginx -d ${n8n_domain}

echo "✅ nginx configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Creating n8n environment configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create n8n configuration directory
mkdir -p /opt/n8n
mkdir -p /home/ubuntu/.n8n

# Create permanent environment file
cat > /opt/n8n/.env << 'N8N_ENV'
# N8N Webhook Configuration (CRITICAL for webhook registration!)
WEBHOOK_URL=https://${n8n_domain}
N8N_PROTOCOL=https
N8N_HOST=${n8n_domain}
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://${n8n_domain}
WEBHOOK_TUNNEL_URL=

# Database persistence
N8N_USER_FOLDER=/home/node/.n8n

# Execution settings
EXECUTIONS_MODE=regular
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Timezone
GENERIC_TIMEZONE=America/New_York

# Performance
N8N_PAYLOAD_SIZE_MAX=16
N8N_ENV
N8N_METRICS=true
N8N_DIAGNOSTICS_ENABLED=true
N8N_ENV'

chown -R ubuntu:ubuntu /home/ubuntu/.n8n
chmod 644 /opt/n8n/.env

echo "✅ n8n environment configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Starting n8n Docker container..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start n8n with environment file
docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  --env-file /opt/n8n/.env \
  -v /home/ubuntu/.n8n:/home/node/.n8n \
  n8nio/n8n:${n8n_version}

echo "✅ n8n container started"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ Setting up automated backups..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create backup script
cat > /usr/local/bin/backup-n8n.sh << 'BACKUP_SCRIPT'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/n8n-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup n8n data directory
tar -czf "$BACKUP_DIR/n8n-data-$TIMESTAMP.tar.gz" /home/ubuntu/.n8n

# Backup n8n environment
cp /opt/n8n/.env "$BACKUP_DIR/n8n-env-$TIMESTAMP.env"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "n8n-data-*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "n8n-env-*.env" -mtime +30 -delete

echo "✅ Backup complete: $TIMESTAMP"
BACKUP_SCRIPT

chmod +x /usr/local/bin/backup-n8n.sh

# Add daily backup cron job
echo "0 2 * * * /usr/local/bin/backup-n8n.sh >> /var/log/n8n-backup.log 2>&1" | crontab -u ubuntu -

echo "✅ Daily backups configured (2 AM)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Installing CloudWatch monitoring..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install CloudWatch agent
wget https://s3.${aws_region}.amazonaws.com/amazoncloudwatch-agent-${aws_region}/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'CLOUDWATCH_CONFIG'
{
  "metrics": {
    "namespace": "AlexAI/N8N",
    "metrics_collected": {
      "cpu": {
        "measurement": [{"name": "cpu_usage_idle", "rename": "CPU_IDLE", "unit": "Percent"}],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [{"name": "used_percent", "rename": "DISK_USED", "unit": "Percent"}],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": [{"name": "mem_used_percent", "rename": "MEM_USED", "unit": "Percent"}],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/n8n-backup.log",
            "log_group_name": "/aws/ec2/${project_name}-n8n",
            "log_stream_name": "backup"
          }
        ]
      }
    }
  }
}
CLOUDWATCH_CONFIG

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

echo "✅ CloudWatch agent configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Instance configured with:"
echo "   ✅ Docker installed"
echo "   ✅ SSM agent running (for aws ssm commands)"
echo "   ✅ nginx reverse proxy configured"
echo "   ✅ n8n running with WEBHOOK_URL set"
echo "   ✅ Daily automated backups (2 AM)"
echo "   ✅ CloudWatch monitoring active"
echo ""
echo "🌐 n8n will be available at: https://${n8n_domain}"
echo ""
echo "📋 Next steps:"
echo "   1. Obtain SSL certificate: certbot --nginx -d ${n8n_domain}"
echo "   2. Verify n8n is running: docker ps"
echo "   3. Check WEBHOOK_URL: docker exec n8n env | grep WEBHOOK_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

