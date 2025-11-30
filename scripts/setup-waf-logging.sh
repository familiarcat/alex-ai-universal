#!/usr/bin/env bash
set -euo pipefail

REGION="us-east-1"
SUFFIX=$(date +%s)
STREAM_NAME="n8n-waf-logs-${SUFFIX}"
BUCKET_NAME="n8n-waf-logs-${SUFFIX}"
ROLE_NAME="firehose-n8n-waf-role-${SUFFIX}"
POLICY_NAME="firehose-n8n-waf-policy-${SUFFIX}"
WAF_ARN="arn:aws:wafv2:us-east-1:860268930466:global/webacl/CreatedByALB-dba8dfe6-992b-495c-b861-174e96215bee/f1912b4f-5f9c-4c5a-ba09-3b07f89ccb0"
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
POLICY_FILE="${SCRIPT_DIR}/tmp-firehose-policy.json"
DEST_CONFIG_FILE="${SCRIPT_DIR}/tmp-firehose-dest.json"
BUCKET_POLICY_FILE="${SCRIPT_DIR}/tmp-bucket-policy.json"

aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}" >/dev/null

aws iam create-role --role-name "${ROLE_NAME}" --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"firehose.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null

cat <<POLICY > "${POLICY_FILE}"
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
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}",
        "arn:aws:s3:::${BUCKET_NAME}/*"
      ]
    }
  ]
}
POLICY

aws iam put-role-policy --role-name "${ROLE_NAME}" --policy-name "${POLICY_NAME}" --policy-document "file://${POLICY_FILE}" >/dev/null

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

cat <<DEST > "${DEST_CONFIG_FILE}"
{
  "RoleARN": "${ROLE_ARN}",
  "BucketARN": "arn:aws:s3:::${BUCKET_NAME}",
  "CompressionFormat": "GZIP"
}
DEST

cat <<BKT > "${BUCKET_POLICY_FILE}"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowFirehoseDelivery",
      "Effect": "Allow",
      "Principal": {"Service": "firehose.amazonaws.com"},
      "Action": ["s3:PutObject","s3:PutObjectAcl","s3:AbortMultipartUpload","s3:GetObject","s3:GetBucketLocation","s3:ListBucket","s3:ListBucketMultipartUploads"],
      "Resource": ["arn:aws:s3:::${BUCKET_NAME}", "arn:aws:s3:::${BUCKET_NAME}/*"],
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "${ACCOUNT_ID}"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:firehose:${REGION}:${ACCOUNT_ID}:deliverystream/${STREAM_NAME}"
        }
      }
    }
  ]
}
BKT

aws s3api put-bucket-policy --bucket "${BUCKET_NAME}" --policy "file://${BUCKET_POLICY_FILE}" >/dev/null

sleep 15

aws firehose create-delivery-stream --region "${REGION}" \
  --delivery-stream-name "${STREAM_NAME}" \
  --delivery-stream-type DirectPut \
  --s3-destination-configuration "file://${DEST_CONFIG_FILE}" >/dev/null

sleep 15

STREAM_ARN=$(aws firehose describe-delivery-stream --region "${REGION}" --delivery-stream-name "${STREAM_NAME}" --query 'DeliveryStreamDescription.DeliveryStreamARN' --output text)

aws wafv2 put-logging-configuration --region "${REGION}" \
  --logging-configuration '{"ResourceArn":"'"${WAF_ARN}"'","LogDestinationConfigs":["'"${STREAM_ARN}"'"]}' >/dev/null

printf "Logging enabled for %s\nS3 bucket: %s\nDelivery stream: %s\n" "${WAF_ARN}" "${BUCKET_NAME}" "${STREAM_NAME}"
