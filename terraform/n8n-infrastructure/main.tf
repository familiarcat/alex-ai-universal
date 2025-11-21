# Alex AI N8N Infrastructure
# Complete Infrastructure as Code for n8n automation server
# 
# Components:
# - EC2 instance with SSM agent (for remote automation)
# - Elastic IP (permanent public IP)
# - Route 53 DNS (n8n.pbradygeorgen.com)
# - Security Groups (restricted access)
# - IAM roles (SSM + CloudWatch)
# - CloudWatch monitoring
# - Automated backups

# Data sources
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu)
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# IAM Role for EC2 (SSM + CloudWatch)
resource "aws_iam_role" "n8n_instance_role" {
  name = "${var.project_name}-n8n-instance-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name = "${var.project_name}-n8n-instance-role"
  }
}

# Attach SSM managed policy
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.n8n_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch Agent policy
resource "aws_iam_role_policy_attachment" "cloudwatch_policy" {
  role       = aws_iam_role.n8n_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "n8n_profile" {
  name = "${var.project_name}-n8n-instance-profile"
  role = aws_iam_role.n8n_instance_role.name
  
  tags = {
    Name = "${var.project_name}-n8n-instance-profile"
  }
}

# Security Group
resource "aws_security_group" "n8n" {
  name        = "${var.project_name}-n8n-sg"
  description = "Security group for n8n automation server"
  vpc_id      = data.aws_vpc.default.id
  
  # HTTPS (for n8n web UI via nginx reverse proxy)
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # HTTP (for Let's Encrypt challenges and redirect)
  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # SSH (restricted to allowed IPs)
  ingress {
    description = "SSH from allowed IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr
  }
  
  # All outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-n8n-sg"
  }
}

# Elastic IP
resource "aws_eip" "n8n" {
  domain = "vpc"
  
  tags = {
    Name = "${var.project_name}-n8n-eip"
  }
}

# EC2 Instance
resource "aws_instance" "n8n" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.ssh_key_name
  
  vpc_security_group_ids = [aws_security_group.n8n.id]
  iam_instance_profile   = aws_iam_instance_profile.n8n_profile.name
  
  # Enable detailed monitoring
  monitoring = true
  
  # User data script for initial setup (includes MCP)
  user_data = templatefile("${path.module}/user-data-with-mcp.sh", {
    n8n_domain     = var.n8n_domain
    n8n_version    = var.n8n_version
    supabase_url   = var.supabase_url
    aws_region     = var.aws_region
    project_name   = var.project_name
  })
  
  # Root volume configuration
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    encrypted             = true
    delete_on_termination = false # Preserve data on instance termination
    
    tags = {
      Name = "${var.project_name}-n8n-root-volume"
    }
  }
  
  tags = {
    Name = "${var.project_name}-n8n-server"
    Role = "n8n-automation"
  }
  
  # Ensure IAM profile is created before instance
  depends_on = [
    aws_iam_role_policy_attachment.ssm_policy,
    aws_iam_role_policy_attachment.cloudwatch_policy
  ]
}

# Associate Elastic IP with instance
resource "aws_eip_association" "n8n" {
  instance_id   = aws_instance.n8n.id
  allocation_id = aws_eip.n8n.id
}

# Route 53 DNS Record
resource "aws_route53_record" "n8n" {
  zone_id = var.route53_zone_id
  name    = var.n8n_domain
  type    = "A"
  ttl     = 300
  records = [aws_eip.n8n.public_ip]
}

# CloudWatch Log Group for n8n
resource "aws_cloudwatch_log_group" "n8n" {
  name              = "/aws/ec2/${var.project_name}-n8n"
  retention_in_days = 30
  
  tags = {
    Name = "${var.project_name}-n8n-logs"
  }
}

# CloudWatch Alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "n8n_cpu_high" {
  alarm_name          = "${var.project_name}-n8n-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors n8n instance CPU utilization"
  
  dimensions = {
    InstanceId = aws_instance.n8n.id
  }
  
  tags = {
    Name = "${var.project_name}-n8n-cpu-alarm"
  }
}

resource "aws_cloudwatch_metric_alarm" "n8n_status_check" {
  alarm_name          = "${var.project_name}-n8n-status-check"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Maximum"
  threshold           = "0"
  alarm_description   = "This metric monitors n8n instance status checks"
  
  dimensions = {
    InstanceId = aws_instance.n8n.id
  }
  
  tags = {
    Name = "${var.project_name}-n8n-status-alarm"
  }
}

