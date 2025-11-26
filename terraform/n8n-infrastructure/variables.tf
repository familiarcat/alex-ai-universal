# Terraform Variables for N8N Infrastructure
# Values are provided via terraform.tfvars or environment variables

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-2"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "alex-ai"
}

variable "n8n_domain" {
  description = "Domain name for n8n instance"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DNS"
  type        = string
}

variable "ssh_key_name" {
  description = "SSH key pair name for EC2 access"
  type        = string
  default     = "AlexKeyPair"
}

variable "instance_type" {
  description = "EC2 instance type for n8n"
  type        = string
  default     = "t3.micro"  # Optimized for cost - sufficient for n8n workloads
}

variable "n8n_version" {
  description = "N8N Docker image version (pinned to stable version for reliability)"
  type        = string
  default     = "1.120.4"
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed for SSH access (restrict to your IP)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Will be restricted to user's IP in production
}

variable "n8n_data_backup_retention_days" {
  description = "Number of days to retain n8n data backups"
  type        = number
  default     = 30
}

variable "n8n_api_key" {
  description = "N8N API key (sensitive)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "mcp_api_key" {
  description = "MCP API key (sensitive, defaults to n8n_api_key if not set)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key (sensitive)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "openrouter_api_key" {
  description = "OpenRouter API key (sensitive)"
  type        = string
  default     = ""
  sensitive   = true
}

