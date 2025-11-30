#!/bin/bash
################################################################################
# Fix N8N Connectivity Issues
# 
# Diagnoses and fixes common N8N connectivity problems:
# 1. Security group rules
# 2. Nginx reverse proxy status
# 3. SSL certificate configuration
# 4. N8N container status
# 5. Port accessibility
################################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
INSTANCE_ID="i-0afdf313f61f22df0"
AWS_REGION="us-east-2"
N8N_DOMAIN="n8n.pbradygeorgen.com"
EXPECTED_SG_NAME="alex-ai-n8n-sg"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}║   🔧 N8N CONNECTIVITY DIAGNOSTICS AND FIX                              ║${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}\n"

################################################################################
# STEP 1: Check Security Group
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔒 STEP 1: Checking Security Group Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Get current security groups
CURRENT_SG=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text)

CURRENT_SG_NAME=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupName' \
    --output text)

echo "   Current Security Group: $CURRENT_SG_NAME ($CURRENT_SG)"

# Check if ports 80, 443, 22 are open
SG_RULES=$(aws ec2 describe-security-groups \
    --group-ids "$CURRENT_SG" \
    --region "$AWS_REGION" \
    --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpProtocol]' \
    --output text)

HAS_HTTP=false
HAS_HTTPS=false
HAS_SSH=false

while IFS=$'\t' read -r from_port to_port protocol; do
    if [ "$from_port" = "80" ] && [ "$protocol" = "tcp" ]; then
        HAS_HTTP=true
    fi
    if [ "$from_port" = "443" ] && [ "$protocol" = "tcp" ]; then
        HAS_HTTPS=true
    fi
    if [ "$from_port" = "22" ] && [ "$protocol" = "tcp" ]; then
        HAS_SSH=true
    fi
done <<< "$SG_RULES"

if [ "$HAS_HTTP" = true ]; then
    echo -e "   ${GREEN}✅ Port 80 (HTTP) is open${NC}"
else
    echo -e "   ${RED}❌ Port 80 (HTTP) is NOT open${NC}"
fi

if [ "$HAS_HTTPS" = true ]; then
    echo -e "   ${GREEN}✅ Port 443 (HTTPS) is open${NC}"
else
    echo -e "   ${RED}❌ Port 443 (HTTPS) is NOT open${NC}"
fi

if [ "$HAS_SSH" = true ]; then
    echo -e "   ${GREEN}✅ Port 22 (SSH) is open${NC}"
else
    echo -e "   ${YELLOW}⚠️  Port 22 (SSH) is NOT open (may use SSM instead)${NC}"
fi

# Add missing rules if needed
if [ "$HAS_HTTP" = false ] || [ "$HAS_HTTPS" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Adding missing security group rules...${NC}"
    
    if [ "$HAS_HTTP" = false ]; then
        aws ec2 authorize-security-group-ingress \
            --group-id "$CURRENT_SG" \
            --protocol tcp \
            --port 80 \
            --cidr 0.0.0.0/0 \
            --region "$AWS_REGION" \
            --output text >/dev/null 2>&1 || echo "   (Port 80 rule may already exist)"
        echo -e "   ${GREEN}✅ Added port 80 rule${NC}"
    fi
    
    if [ "$HAS_HTTPS" = false ]; then
        aws ec2 authorize-security-group-ingress \
            --group-id "$CURRENT_SG" \
            --protocol tcp \
            --port 443 \
            --cidr 0.0.0.0/0 \
            --region "$AWS_REGION" \
            --output text >/dev/null 2>&1 || echo "   (Port 443 rule may already exist)"
        echo -e "   ${GREEN}✅ Added port 443 rule${NC}"
    fi
fi

echo ""

################################################################################
# STEP 2: Check Instance Services via SSH
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 STEP 2: Checking Instance Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Get instance public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "   Instance IP: $PUBLIC_IP"
echo "   Attempting SSH connection..."

# Try to check services via SSH (if SSH key is available)
if [ -f "$HOME/.ssh/id_rsa" ] || [ -f "$HOME/.ssh/id_ed25519" ]; then
    SSH_KEY=""
    if [ -f "$HOME/.ssh/id_rsa" ]; then
        SSH_KEY="$HOME/.ssh/id_rsa"
    elif [ -f "$HOME/.ssh/id_ed25519" ]; then
        SSH_KEY="$HOME/.ssh/id_ed25519"
    fi
    
    if [ -n "$SSH_KEY" ]; then
        echo "   Using SSH key: $SSH_KEY"
        
        # Check nginx status
        NGINX_STATUS=$(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$SSH_KEY" "ubuntu@$PUBLIC_IP" "systemctl is-active nginx" 2>/dev/null || echo "unknown")
        if [ "$NGINX_STATUS" = "active" ]; then
            echo -e "   ${GREEN}✅ Nginx is running${NC}"
        else
            echo -e "   ${RED}❌ Nginx is NOT running (status: $NGINX_STATUS)${NC}"
        fi
        
        # Check docker status
        DOCKER_STATUS=$(ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "ubuntu@$PUBLIC_IP" "docker ps | grep n8n" 2>/dev/null || echo "")
        if [ -n "$DOCKER_STATUS" ]; then
            echo -e "   ${GREEN}✅ N8N container is running${NC}"
            echo "   Container info: $(echo "$DOCKER_STATUS" | awk '{print $1, $2}')"
        else
            echo -e "   ${RED}❌ N8N container is NOT running${NC}"
        fi
        
        # Check if nginx is listening on ports
        LISTENING_PORTS=$(ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "ubuntu@$PUBLIC_IP" "sudo netstat -tlnp | grep nginx | awk '{print \$4}'" 2>/dev/null || echo "")
        if echo "$LISTENING_PORTS" | grep -q ":80\|:443"; then
            echo -e "   ${GREEN}✅ Nginx is listening on ports 80/443${NC}"
        else
            echo -e "   ${YELLOW}⚠️  Nginx may not be listening on expected ports${NC}"
        fi
        
        # Check SSL certificate
        SSL_CERT=$(ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "ubuntu@$PUBLIC_IP" "sudo certbot certificates 2>/dev/null | grep -A 5 '$N8N_DOMAIN'" 2>/dev/null || echo "")
        if [ -n "$SSL_CERT" ]; then
            echo -e "   ${GREEN}✅ SSL certificate found for $N8N_DOMAIN${NC}"
        else
            echo -e "   ${YELLOW}⚠️  SSL certificate may not be configured${NC}"
            echo "   You may need to run: certbot --nginx -d $N8N_DOMAIN"
        fi
    fi
else
    echo -e "   ${YELLOW}⚠️  No SSH key found, skipping direct service checks${NC}"
    echo "   Use AWS SSM instead: aws ssm start-session --target $INSTANCE_ID"
fi

echo ""

################################################################################
# STEP 3: Test Connectivity
################################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 STEP 3: Testing Connectivity${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test HTTP
echo "   Testing HTTP connection to $PUBLIC_IP:80..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$PUBLIC_IP" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "   ${GREEN}✅ HTTP connection successful (HTTP $HTTP_CODE)${NC}"
else
    echo -e "   ${RED}❌ HTTP connection failed (HTTP $HTTP_CODE)${NC}"
fi

# Test HTTPS
echo "   Testing HTTPS connection to $N8N_DOMAIN:443..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://$N8N_DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ]; then
    echo -e "   ${GREEN}✅ HTTPS connection successful (HTTP $HTTPS_CODE)${NC}"
else
    echo -e "   ${RED}❌ HTTPS connection failed (HTTP $HTTPS_CODE)${NC}"
fi

# Test direct IP HTTPS
echo "   Testing HTTPS connection to $PUBLIC_IP:443..."
HTTPS_IP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 -k "https://$PUBLIC_IP" 2>/dev/null || echo "000")
if [ "$HTTPS_IP_CODE" = "200" ] || [ "$HTTPS_IP_CODE" = "301" ] || [ "$HTTPS_IP_CODE" = "302" ]; then
    echo -e "   ${GREEN}✅ HTTPS (direct IP) connection successful (HTTP $HTTPS_IP_CODE)${NC}"
else
    echo -e "   ${YELLOW}⚠️  HTTPS (direct IP) connection failed (HTTP $HTTPS_IP_CODE)${NC}"
    echo "   This is expected if SSL is domain-based only"
fi

echo ""

################################################################################
# SUMMARY AND RECOMMENDATIONS
################################################################################

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}║   📋 DIAGNOSTICS COMPLETE                                               ║${NC}"
echo -e "${CYAN}║                                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Next Steps:${NC}"
echo "   1. If security group rules were added, wait 30 seconds for propagation"
echo "   2. If nginx is not running, start it:"
echo "      ssh ubuntu@$PUBLIC_IP 'sudo systemctl start nginx'"
echo "   3. If SSL certificate is missing, obtain it:"
echo "      ssh ubuntu@$PUBLIC_IP 'sudo certbot --nginx -d $N8N_DOMAIN --non-interactive --agree-tos'"
echo "   4. If N8N container is not running, restart it:"
echo "      bash scripts/n8n-restart-remote-docker.sh"
echo "   5. Test again: curl -I https://$N8N_DOMAIN"
echo ""

