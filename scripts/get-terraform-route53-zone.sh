#!/bin/bash

# Get Route53 Zone ID from Terraform state or variables

# Try to get from Terraform state
if [ -f "terraform/n8n-infrastructure/terraform.tfstate" ]; then
    ZONE_ID=$(terraform -chdir=terraform/n8n-infrastructure output -raw route53_zone_id 2>/dev/null || echo "")
    if [ -n "$ZONE_ID" ]; then
        echo "$ZONE_ID"
        exit 0
    fi
fi

# Try to get from terraform.tfvars
if [ -f "terraform/n8n-infrastructure/terraform.tfvars" ]; then
    ZONE_ID=$(grep -E '^route53_zone_id\s*=' terraform/n8n-infrastructure/terraform.tfvars | cut -d'"' -f2 | head -1)
    if [ -n "$ZONE_ID" ]; then
        echo "$ZONE_ID"
        exit 0
    fi
fi

# Try to get from environment
if [ -n "$AWS_ROUTE53_ZONE_ID" ]; then
    echo "$AWS_ROUTE53_ZONE_ID"
    exit 0
fi

# Try to get from ~/.zshrc
if [ -f ~/.zshrc ]; then
    ZONE_ID=$(grep -E '^export AWS_ROUTE53_ZONE_ID=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' | head -1)
    if [ -n "$ZONE_ID" ]; then
        echo "$ZONE_ID"
        exit 0
    fi
fi

exit 1

