#!/bin/bash

# Deploy Lightweight Monitoring Stack
# Lt. Cmdr. La Forge - Infrastructure Monitoring
# 
# Deploys Grafana + Prometheus on same EC2 instance as n8n
# Total cost: $0 (open-source, uses existing infrastructure)

set -e

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🛠️  LA FORGE: Deploying Monitoring Stack                            ║"
echo "║   Grafana + Prometheus on EC2 (Lightweight, $0 cost)                  ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Load AWS credentials
source ~/.zshrc

INSTANCE_IP="3.150.192.186"
SSH_KEY="$HOME/.ssh/AlexKeyPair.pem"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Monitoring Stack Components:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. Prometheus (Metrics Collection)"
echo "     • Scrapes n8n metrics, node metrics, nginx metrics"
echo "     • Stores time-series data"
echo "     • Port: 9090"
echo ""
echo "  2. Grafana (Visualization)"
echo "     • Beautiful dashboards"
echo "     • Real-time charts"
echo "     • Alert management"
echo "     • Port: 3001"
echo ""
echo "  3. Node Exporter (System Metrics)"
echo "     • CPU, memory, disk, network"
echo "     • Port: 9100"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create docker-compose file for monitoring stack
cat > /tmp/monitoring-docker-compose.yml << 'COMPOSE'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - /opt/monitoring/prometheus/config:/etc/prometheus
      - /opt/monitoring/prometheus/data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=WorfSecurePassword2025!
      - GF_SERVER_ROOT_URL=https://monitoring.pbradygeorgen.com
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - /opt/monitoring/grafana/data:/var/lib/grafana
      - /opt/monitoring/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - monitoring
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: always
    ports:
      - "9100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
COMPOSE

echo "✅ Created docker-compose.yml for monitoring stack"
echo ""

# Create Prometheus config
cat > /tmp/prometheus.yml << 'PROM_CONFIG'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'alex-ai-production'
    environment: 'production'

# Scrape configurations
scrape_configs:
  # n8n application metrics (if exposed)
  - job_name: 'n8n'
    static_configs:
      - targets: ['host.docker.internal:5678']
    metrics_path: '/metrics'
    
  # System metrics (node-exporter)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
    
  # nginx metrics (if exposed)
  - job_name: 'nginx'
    static_configs:
      - targets: ['host.docker.internal:9113']
    
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

# Alerting rules
rule_files:
  - '/etc/prometheus/alerts.yml'

# Alert manager (optional, for future)
# alerting:
#   alertmanagers:
#     - static_configs:
#         - targets: ['alertmanager:9093']
PROM_CONFIG

echo "✅ Created prometheus.yml configuration"
echo ""

# Create alert rules
cat > /tmp/prometheus-alerts.yml << 'ALERTS'
groups:
  - name: alex_ai_alerts
    interval: 30s
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          crew: la_forge
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for 5 minutes"
      
      # High memory usage
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
          crew: la_forge
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85%"
      
      # Disk space low
      - alert: LowDiskSpace
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 80
        for: 5m
        labels:
          severity: critical
          crew: la_forge
        annotations:
          summary: "Low disk space"
          description: "Disk usage is above 80%"
      
      # n8n down (if metrics available)
      - alert: N8NDown
        expr: up{job="n8n"} == 0
        for: 2m
        labels:
          severity: critical
          crew: obrien
        annotations:
          summary: "n8n is down"
          description: "n8n has been unreachable for 2 minutes"
ALERTS

echo "✅ Created alert rules"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Deploying monitoring stack to EC2..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Upload files to EC2
echo "📁 Uploading configuration files..."

scp -i "$SSH_KEY" \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  /tmp/monitoring-docker-compose.yml \
  /tmp/prometheus.yml \
  /tmp/prometheus-alerts.yml \
  ubuntu@$INSTANCE_IP:/tmp/

echo "✅ Files uploaded"
echo ""

# Deploy on EC2
ssh -i "$SSH_KEY" \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  ubuntu@$INSTANCE_IP << 'REMOTE_SCRIPT'

echo "🛠️  Setting up monitoring directories..."

sudo mkdir -p /opt/monitoring/prometheus/config
sudo mkdir -p /opt/monitoring/prometheus/data
sudo mkdir -p /opt/monitoring/grafana/data
sudo mkdir -p /opt/monitoring/grafana/provisioning

echo "✅ Directories created"

echo ""
echo "📋 Moving configuration files..."

sudo mv /tmp/prometheus.yml /opt/monitoring/prometheus/config/
sudo mv /tmp/prometheus-alerts.yml /opt/monitoring/prometheus/config/alerts.yml
sudo mv /tmp/monitoring-docker-compose.yml /opt/monitoring/docker-compose.yml

echo "✅ Configuration files in place"

echo ""
echo "🔧 Setting permissions..."

sudo chown -R 65534:65534 /opt/monitoring/prometheus/data  # nobody:nobody for Prometheus
sudo chown -R 472:472 /opt/monitoring/grafana/data        # grafana user

echo "✅ Permissions set"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Starting monitoring stack..."

cd /opt/monitoring

# Install docker-compose if needed
if ! command -v docker-compose &> /dev/null; then
  echo "📦 Installing docker-compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

docker-compose up -d

echo ""
echo "⏳ Waiting 30 seconds for services to start..."
sleep 30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Monitoring Stack Status:"

docker-compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 MONITORING ENDPOINTS:"
echo ""
echo "   Prometheus: http://3.150.192.186:9090"
echo "   Grafana:    http://3.150.192.186:3001"
echo "              (admin / WorfSecurePassword2025!)"
echo ""
echo "🛠️  La Forge: 'Monitoring stack deployed. System health now visible!'"

REMOTE_SCRIPT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MONITORING DEPLOYMENT COMPLETE"
echo ""
echo "🎯 Next: Access Grafana and configure dashboards"
echo "   URL: http://3.150.192.186:3001"
echo "   Login: admin / WorfSecurePassword2025!"

