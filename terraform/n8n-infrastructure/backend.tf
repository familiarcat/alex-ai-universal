# Terraform Backend Configuration
# Uses S3 for state storage and DynamoDB for state locking
# 
# This ensures:
# - State is persisted remotely (team collaboration)
# - State locking prevents concurrent modifications
# - State versioning for rollback capability
# - Encryption at rest and in transit

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "alex-ai-terraform-state"
    key            = "n8n-infrastructure/terraform.tfstate"
    region         = "us-east-2"
    encrypt        = true
    dynamodb_table = "alex-ai-terraform-locks"
    
    # Enable versioning for state file recovery
    # Set via S3 bucket configuration
  }
}

# Provider configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Alex AI Universal"
      ManagedBy   = "Terraform"
      Environment = var.environment
      Component   = "n8n-automation"
    }
  }
}

