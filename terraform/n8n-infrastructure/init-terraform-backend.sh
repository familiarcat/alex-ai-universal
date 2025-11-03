#!/bin/bash

################################################################################
#
# 🔧 INITIALIZE TERRAFORM BACKEND
#
# Creates S3 bucket and DynamoDB table for Terraform state management
# Run this ONCE before first 'terraform init'
#
################################################################################

set -e

BUCKET_NAME="alex-ai-terraform-state"
DYNAMODB_TABLE="alex-ai-terraform-locks"
REGION="us-east-2"

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║   🔧 TERRAFORM BACKEND INITIALIZATION                                 ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1: Creating S3 bucket for Terraform state..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if bucket already exists
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
  echo "Creating S3 bucket: $BUCKET_NAME"
  
  # Create bucket
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION"
  
  echo "✅ Bucket created"
  
  # Enable versioning
  aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled
  
  echo "✅ Versioning enabled"
  
  # Enable encryption
  aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
      "Rules": [{
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        },
        "BucketKeyEnabled": true
      }]
    }'
  
  echo "✅ Encryption enabled (AES256)"
  
  # Block public access
  aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
      "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  
  echo "✅ Public access blocked"
  
else
  echo "✅ Bucket already exists: $BUCKET_NAME"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 STEP 2: Creating DynamoDB table for state locking..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if table already exists
if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" --region "$REGION" 2>&1 | grep -q 'ResourceNotFoundException'; then
  echo "Creating DynamoDB table: $DYNAMODB_TABLE"
  
  aws dynamodb create-table \
    --table-name "$DYNAMODB_TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --tags Key=Project,Value=AlexAI Key=ManagedBy,Value=Terraform
  
  echo "⏳ Waiting for table to become active..."
  aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE" --region "$REGION"
  
  echo "✅ Table created and active"
else
  echo "✅ Table already exists: $DYNAMODB_TABLE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TERRAFORM BACKEND READY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   ✅ S3 bucket: s3://$BUCKET_NAME"
echo "   ✅ Versioning: Enabled"
echo "   ✅ Encryption: AES256"
echo "   ✅ Public access: Blocked"
echo "   ✅ DynamoDB table: $DYNAMODB_TABLE"
echo "   ✅ Billing: Pay-per-request (FREE for small usage)"
echo ""
echo "🎯 Next steps:"
echo "   1. cd terraform/n8n-infrastructure"
echo "   2. terraform init"
echo "   3. terraform plan"
echo "   4. terraform apply"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

