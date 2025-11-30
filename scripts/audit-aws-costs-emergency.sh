#!/usr/bin/env bash
set -euo pipefail

# 🚨 EMERGENCY: AWS Cost Audit Script
# This script audits and optionally disables expensive AWS resources
# Run with --dry-run first to see what would be deleted

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN=${1:-"--dry-run"}

echo "🚨 AWS Cost Emergency Audit"
echo "============================"
echo ""
echo "⚠️  This script will audit AWS resources that may be causing cost spikes."
echo ""

if [ "$DRY_RUN" != "--execute" ]; then
  echo "🔍 DRY RUN MODE - No resources will be modified"
  echo "   Run with --execute to actually delete resources"
  echo ""
fi

# Check AWS CLI availability
if ! command -v aws >/dev/null 2>&1; then
  echo "❌ AWS CLI not found. Please install it first."
  exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "❌ AWS credentials not configured. Run 'aws configure' first."
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
REGION=${AWS_REGION:-us-east-1}

echo "📊 Account ID: $ACCOUNT_ID"
echo "🌍 Region: $REGION"
echo ""

# 1. Check Kinesis Firehose Delivery Streams
echo "1️⃣  Checking Kinesis Firehose Delivery Streams..."
echo "   (Cost: \$0.029/GB ingested + S3 storage + PUT requests)"
echo ""

FIREHOSE_STREAMS=$(aws firehose list-delivery-streams --region "$REGION" --query 'DeliveryStreamNames' --output text 2>/dev/null || echo "")

if [ -z "$FIREHOSE_STREAMS" ] || [ "$FIREHOSE_STREAMS" == "None" ]; then
  echo "   ✅ No Firehose streams found"
else
  echo "   ⚠️  Found Firehose streams:"
  for stream in $FIREHOSE_STREAMS; do
    STATUS=$(aws firehose describe-delivery-stream --region "$REGION" --delivery-stream-name "$stream" --query 'DeliveryStreamDescription.DeliveryStreamStatus' --output text 2>/dev/null || echo "UNKNOWN")
    echo "      - $stream (Status: $STATUS)"
    
    if [ "$DRY_RUN" == "--execute" ]; then
      echo "      🗑️  Deleting stream..."
      aws firehose delete-delivery-stream --region "$REGION" --delivery-stream-name "$stream" --allow-force-delete 2>/dev/null || echo "      ⚠️  Failed to delete (may be in use)"
    fi
  done
fi
echo ""

# 2. Check WAF Logging Configurations
echo "2️⃣  Checking WAF Logging Configurations..."
echo "   (Cost: Logging charges + Firehose/S3 ingestion costs)"
echo ""

WAF_LOGS_REGIONAL=$(aws wafv2 list-logging-configurations --scope REGIONAL --region "$REGION" --query 'LoggingConfigurations[*].[ResourceArn,LogDestinationConfigs[0]]' --output text 2>/dev/null || echo "")
WAF_LOGS_CLOUDFRONT=$(aws wafv2 list-logging-configurations --scope CLOUDFRONT --region "$REGION" --query 'LoggingConfigurations[*].[ResourceArn,LogDestinationConfigs[0]]' --output text 2>/dev/null || echo "")

if [ -z "$WAF_LOGS_REGIONAL" ] && [ -z "$WAF_LOGS_CLOUDFRONT" ]; then
  echo "   ✅ No WAF logging configurations found"
else
  echo "   ⚠️  Found WAF logging configurations:"
  if [ -n "$WAF_LOGS_REGIONAL" ]; then
    echo "      REGIONAL:"
    echo "$WAF_LOGS_REGIONAL" | while IFS=$'\t' read -r arn dest; do
      echo "      - Resource: $arn"
      echo "        Destination: $dest"
      
      if [ "$DRY_RUN" == "--execute" ]; then
        echo "      🗑️  Deleting WAF logging configuration..."
        aws wafv2 delete-logging-configuration --resource-arn "$arn" --scope REGIONAL --region "$REGION" 2>/dev/null || echo "      ⚠️  Failed to delete"
      fi
    done
  fi
  if [ -n "$WAF_LOGS_CLOUDFRONT" ]; then
    echo "      CLOUDFRONT:"
    echo "$WAF_LOGS_CLOUDFRONT" | while IFS=$'\t' read -r arn dest; do
      echo "      - Resource: $arn"
      echo "        Destination: $dest"
      
      if [ "$DRY_RUN" == "--execute" ]; then
        echo "      🗑️  Deleting WAF logging configuration..."
        aws wafv2 delete-logging-configuration --resource-arn "$arn" --scope CLOUDFRONT --region "$REGION" 2>/dev/null || echo "      ⚠️  Failed to delete"
      fi
    done
  fi
fi
echo ""

# 3. Check S3 Buckets Created by Firehose Scripts
echo "3️⃣  Checking S3 Buckets (aws-waf-logs-* pattern)..."
echo "   (Cost: Storage + PUT requests)"
echo ""

S3_BUCKETS=$(aws s3 ls 2>/dev/null | grep -E "aws-waf-logs|firehose-n8n" | awk '{print $3}' || echo "")

if [ -z "$S3_BUCKETS" ]; then
  echo "   ✅ No suspect S3 buckets found"
else
  echo "   ⚠️  Found S3 buckets:"
  for bucket in $S3_BUCKETS; do
    SIZE=$(aws s3 ls s3://"$bucket" --recursive --summarize --region "$REGION" 2>/dev/null | grep "Total Size" | awk '{print $3, $4}' || echo "Unknown")
    OBJECT_COUNT=$(aws s3 ls s3://"$bucket" --recursive --region "$REGION" 2>/dev/null | wc -l || echo "Unknown")
    echo "      - $bucket (Size: $SIZE, Objects: $OBJECT_COUNT)"
    
    if [ "$DRY_RUN" == "--execute" ]; then
      echo "      🗑️  Emptying and deleting bucket..."
      aws s3 rm s3://"$bucket" --recursive --region "$REGION" 2>/dev/null || true
      aws s3 rb s3://"$bucket" --region "$REGION" 2>/dev/null || echo "      ⚠️  Failed to delete (may not be empty)"
    fi
  done
fi
echo ""

# 4. Check CloudWatch Log Groups
echo "4️⃣  Checking CloudWatch Log Groups..."
echo "   (Cost: \$0.50/GB ingested, \$0.03/GB stored)"
echo ""

LOG_GROUPS=$(aws logs describe-log-groups --region "$REGION" --query 'logGroups[?contains(logGroupName, `n8n`) || contains(logGroupName, `AlexAI`) || contains(logGroupName, `firehose`)].[logGroupName,storedBytes]' --output text 2>/dev/null || echo "")

if [ -z "$LOG_GROUPS" ]; then
  echo "   ✅ No relevant CloudWatch log groups found"
else
  echo "   ⚠️  Found CloudWatch log groups:"
  echo "$LOG_GROUPS" | while IFS=$'\t' read -r name size; do
    SIZE_GB=$(echo "scale=2; $size / 1024 / 1024 / 1024" | bc 2>/dev/null || echo "Unknown")
    echo "      - $name (Size: ${SIZE_GB}GB)"
  done
  echo ""
  echo "   💡 Review retention policies:"
  echo "      aws logs describe-log-groups --log-group-name-prefix n8n --query 'logGroups[*].[logGroupName,retentionInDays]'"
fi
echo ""

# 5. Check CloudFront Invalidations (last 30 days)
echo "5️⃣  Checking CloudFront Invalidations (last 30 days)..."
echo "   (Cost: \$0.005 per path after first 1,000/month)"
echo ""

DISTRIBUTION_IDS=$(aws cloudfront list-distributions --query 'DistributionList.Items[*].Id' --output text 2>/dev/null || echo "")

if [ -z "$DISTRIBUTION_IDS" ]; then
  echo "   ✅ No CloudFront distributions found"
else
  for dist_id in $DISTRIBUTION_IDS; do
    echo "   📊 Distribution: $dist_id"
    INVALIDATIONS=$(aws cloudfront list-invalidations --distribution-id "$dist_id" --max-items 10 --query 'InvalidationList.Items[*].[Id,Status,CreateTime,InvalidationBatch.Paths.Quantity]' --output text 2>/dev/null || echo "")
    
    if [ -z "$INVALIDATIONS" ]; then
      echo "      ✅ No recent invalidations"
    else
      echo "      ⚠️  Recent invalidations:"
      echo "$INVALIDATIONS" | while IFS=$'\t' read -r id status time qty; do
        echo "      - $id ($status) - $qty paths at $time"
      done
    fi
  done
fi
echo ""

# 6. Cost Summary (requires Cost Explorer API)
echo "6️⃣  Attempting Cost Summary (last 30 days)..."
echo ""

START_DATE=$(date -u -v-30d +%Y-%m-%d 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%d 2>/dev/null || echo "2025-10-14")
END_DATE=$(date -u +%Y-%m-%d)

COST_DATA=$(aws ce get-cost-and-usage \
  --time-period Start="$START_DATE",End="$END_DATE" \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE \
  --query 'ResultsByTime[0].Groups[*].[Keys[0],Metrics.BlendedCost.Amount]' \
  --output text 2>/dev/null || echo "")

if [ -z "$COST_DATA" ]; then
  echo "   ⚠️  Could not retrieve cost data (may require Cost Explorer permissions)"
else
  echo "   📊 Top Services by Cost (last 30 days):"
  echo "$COST_DATA" | sort -t$'\t' -k2 -rn | head -10 | while IFS=$'\t' read -r service cost; do
    printf "      - %-30s \$%s\n" "$service" "$cost"
  done
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$DRY_RUN" == "--execute" ]; then
  echo "✅ AUDIT COMPLETE - Resources have been deleted"
else
  echo "✅ DRY RUN COMPLETE - Review above output"
  echo ""
  echo "⚠️  To actually delete resources, run:"
  echo "   $0 --execute"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "   1. Review AWS Cost Explorer dashboard manually"
echo "   2. Check EC2 instances for running processes"
echo "   3. Review CloudWatch alarms and budgets"
echo "   4. Set up AWS Budget alerts (\$50/month threshold)"
echo ""

