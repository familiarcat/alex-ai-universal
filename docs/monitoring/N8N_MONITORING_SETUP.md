# N8N Monitoring Setup Instructions

## Overview

This setup implements the crew's recommendations for cost-effective N8N monitoring and automated restart.

**Cost:** ~$0.40/month  
**ROI:** Prevents $50-500+ per downtime incident

---

## Setup Steps

### Step 1: Create SNS Topic for Alerts

```bash
aws sns create-topic --name n8n-alerts --region us-east-2
aws sns subscribe --topic-arn arn:aws:sns:us-east-2:ACCOUNT_ID:n8n-alerts \
  --protocol email --notification-endpoint your-email@example.com
```

### Step 2: Create Lambda Function for Auto-Restart

1. Create Lambda function: `n8n-auto-restart`
2. Runtime: Node.js 18.x
3. Paste code from: `scripts/lambda/n8n-auto-restart.js`
4. Set environment variables:
   - `N8N_INSTANCE_ID`: i-008e2d124532fb313
   - `AWS_REGION`: us-east-2
5. Attach IAM role with SSM permissions:
   - `ssm:SendCommand`
   - `ssm:GetCommandInvocation`

### Step 3: Set Up CloudWatch Metric

1. Create EventBridge rule to run every minute:
   ```bash
   aws events put-rule --name n8n-health-check \
     --schedule-expression "rate(1 minute)" \
     --state ENABLED
   ```

2. Add Lambda target to run metric script:
   ```bash
   aws events put-targets --rule n8n-health-check \
     --targets "Id"="1","Arn"="arn:aws:lambda:us-east-2:ACCOUNT_ID:function:send-n8n-health-metric"
   ```

### Step 4: Create CloudWatch Alarm

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name n8n-health-check-failed \
  --alarm-description "N8N health check failed" \
  --metric-name N8NHealthCheck \
  --namespace "AlexAI/N8N" \
  --statistic Minimum \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --alarm-actions \
    arn:aws:sns:us-east-2:ACCOUNT_ID:n8n-alerts \
    arn:aws:lambda:us-east-2:ACCOUNT_ID:function:n8n-auto-restart
```

### Step 5: Test Setup

```bash
# Test health check
node scripts/check-n8n-health.js

# Test manual restart
./scripts/restart-n8n-server.sh

# Verify CloudWatch metric
aws cloudwatch get-metric-statistics \
  --namespace "AlexAI/N8N" \
  --metric-name N8NHealthCheck \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Minimum
```

---

## Cost Breakdown

- **CloudWatch Metrics:** $0.10/month (10 custom metrics)
- **Lambda Invocations:** $0.20/month (1M requests)
- **SNS Notifications:** $0.10/month (100 notifications)
- **Total:** $0.40/month

**ROI:** Prevents hours of downtime = $50-500+ per incident

---

## Manual Restart

If automated restart fails, use manual restart:

```bash
./scripts/restart-n8n-server.sh
```

Or via SSH:
```bash
ssh ubuntu@n8n.pbradygeorgen.com
pm2 restart n8n
```

---

## Monitoring Dashboard

Access CloudWatch dashboard to monitor:
- N8N health check status
- Restart events
- Instance health

---

**Status:** Ready for implementation
