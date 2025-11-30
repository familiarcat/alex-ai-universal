#!/usr/bin/env bash
set -euo pipefail

REGION="us-east-1"
SUFFIX=$(date +%s)
STREAM_NAME="aws-waf-logs-n8n-${SUFFIX}"
BUCKET_NAME="aws-waf-logs-n8n-${SUFFIX}"
ROLE_NAME="firehose-n8n-waf-role-${SUFFIX}"
POLICY_NAME="firehose-n8n-waf-policy-${SUFFIX}"
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
WAF_ARN="arn:aws:wafv2:us-east-1:860268930466:global/webacl/CreatedByALB-dba8dfe6-992b-495c-b861-174e96215bee/f1912b4f-5f9c-4c5a-ba09-3b07f89ccdb0"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
POLICY_FILE="${SCRIPT_DIR}/tmp-firehose-policy.json"
DEST_FILE="${SCRIPT_DIR}/tmp-firehose-dest.json"
BUCKET_POLICY_FILE="${SCRIPT_DIR}/tmp-bucket-policy.json"

printf '🔧 Using suffix %s\n' "$SUFFIX"

printf '🪣 Creating S3 bucket %s...\n' "$BUCKET_NAME"
aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" >/dev/null

printf '👤 Creating IAM role %s...\n' "$ROLE_NAME"
aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"firehose.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null

cat <<POLICY > "$POLICY_FILE"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}",
        "arn:aws:s3:::${BUCKET_NAME}/*"
      ]
    }
  ]
}
POLICY

aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name "$POLICY_NAME}" --policy-document "file://${POLICY_FILE}" >/dev/null || true
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name "$POLICY_NAME" --policy-document "file://${POLICY_FILE}" >/dev/null
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

printf '⏱️  Waiting for IAM role propagation...\n'
sleep 20

cat <<DEST > "$DEST_FILE"
{
  "RoleARN": "${ROLE_ARN}",
  "BucketARN": "arn:aws:s3:::${BUCKET_NAME}",
  "BufferingHints": {"IntervalInSeconds": 300, "SizeInMBs": 5},
  "CompressionFormat": "GZIP"
}
DEST

cat <<BKT > "$BUCKET_POLICY_FILE"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowFirehoseDelivery",
      "Effect": "Allow",
      "Principal": {"Service": "firehose.amazonaws.com"},
      "Action": ["s3:PutObject","s3:PutObjectAcl","s3:AbortMultipartUpload"],
      "Resource": ["arn:aws:s3:::${BUCKET_NAME}/*"],
      "Condition": {
        "StringEquals": {"aws:SourceAccount": "${ACCOUNT_ID}"},
        "ArnLike": {"aws:SourceArn": "arn:aws:firehose:${REGION}:${ACCOUNT_ID}:deliverystream/${STREAM_NAME}"}
      }
    }
  ]
}
BKT

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "file://${BUCKET_POLICY_FILE}" >/dev/null

printf '🔥 Creating Firehose delivery stream %s...\n' "$STREAM_NAME"
aws firehose create-delivery-stream \
  --region "$REGION" \
  --delivery-stream-name "$STREAM_NAME" \
  --delivery-stream-type DirectPut \
  --extended-s3-destination-configuration "file://${DEST_FILE}" >/dev/null

printf '⏳ Waiting for Firehose stream to become ACTIVE...\n'
for i in {1..30}; do
  STATUS=$(aws firehose describe-delivery-stream --region "$REGION" --delivery-stream-name "$STREAM_NAME" --query 'DeliveryStreamDescription.DeliveryStreamStatus' --output text || true)
  if [[ "$STATUS" == "ACTIVE" ]]; then
    break
  fi
  printf '  • current status: %s (retrying in 10s)\n' "$STATUS"
  sleep 10
  if [[ $i -eq 30 ]]; then
    echo "Firehose stream failed to become ACTIVE" >&2
    exit 1
  fi
done

STREAM_ARN=$(aws firehose describe-delivery-stream --region "$REGION" --delivery-stream-name "$STREAM_NAME" --query 'DeliveryStreamDescription.DeliveryStreamARN' --output text)
printf '✅ Firehose stream ARN: %s\n' "$STREAM_ARN"

printf '🛡️  Enabling WAF logging...\n'
aws wafv2 put-logging-configuration --region "$REGION" \
  --logging-configuration '{"ResourceArn":"'"${WAF_ARN}"'","LogDestinationConfigs":["'"${STREAM_ARN}"'"]}'

printf '\n🎉 WAF logging configured.\n  Logs bucket: %s\n  Firehose stream: %s\n' "$BUCKET_NAME" "$STREAM_NAME"
