#!/bin/bash
# Check N8N nginx and SSL status on EC2 instance

INSTANCE_ID="i-0afdf313f61f22df0"
AWS_REGION="us-east-2"

echo "🔍 Checking N8N infrastructure status..."

# Check nginx status
echo ""
echo "📋 Checking nginx status..."
aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=["systemctl status nginx | head -10", "nginx -t 2>&1", "ls -la /etc/nginx/sites-enabled/"]' \
    --region "$AWS_REGION" \
    --output text \
    --query 'Command.CommandId' > /tmp/nginx-check-cmd.txt

CMD_ID=$(cat /tmp/nginx-check-cmd.txt)
echo "   Command ID: $CMD_ID"
echo "   Waiting for command to complete..."
sleep 5

echo ""
echo "📊 nginx Status:"
aws ssm get-command-invocation \
    --command-id "$CMD_ID" \
    --instance-id "$INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'StandardOutputContent' \
    --output text

echo ""
echo "📊 nginx Errors (if any):"
aws ssm get-command-invocation \
    --command-id "$CMD_ID" \
    --instance-id "$INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'StandardErrorContent' \
    --output text

# Check SSL certificates
echo ""
echo "🔐 Checking SSL certificates..."
aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=["ls -la /etc/letsencrypt/live/n8n.pbradygeorgen.com/ 2>&1 || echo \"SSL cert directory not found\"", "certbot certificates 2>&1 | head -20"]' \
    --region "$AWS_REGION" \
    --output text \
    --query 'Command.CommandId' > /tmp/ssl-check-cmd.txt

SSL_CMD_ID=$(cat /tmp/ssl-check-cmd.txt)
sleep 5

echo ""
echo "📊 SSL Certificate Status:"
aws ssm get-command-invocation \
    --command-id "$SSL_CMD_ID" \
    --instance-id "$INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'StandardOutputContent' \
    --output text

# Check Docker container
echo ""
echo "🐳 Checking Docker container..."
aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=["docker ps | grep n8n", "docker logs n8n_n8n_1 --tail 10 2>&1"]' \
    --region "$AWS_REGION" \
    --output text \
    --query 'Command.CommandId' > /tmp/docker-check-cmd.txt

DOCKER_CMD_ID=$(cat /tmp/docker-check-cmd.txt)
sleep 5

echo ""
echo "📊 Docker Container Status:"
aws ssm get-command-invocation \
    --command-id "$DOCKER_CMD_ID" \
    --instance-id "$INSTANCE_ID" \
    --region "$AWS_REGION" \
    --query 'StandardOutputContent' \
    --output text

echo ""
echo "✅ Status check complete"

