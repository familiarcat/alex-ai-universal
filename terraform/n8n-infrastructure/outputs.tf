# Terraform Outputs
# Display important information after terraform apply

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.n8n.id
}

output "instance_public_ip" {
  description = "Elastic IP address"
  value       = aws_eip.n8n.public_ip
}

output "instance_private_ip" {
  description = "Private IP address"
  value       = aws_instance.n8n.private_ip
}

output "n8n_url" {
  description = "N8N public URL"
  value       = "https://${var.n8n_domain}"
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i ~/.ssh/${var.ssh_key_name}.pem ubuntu@${aws_eip.n8n.public_ip}"
}

output "ssm_command" {
  description = "AWS SSM command to connect to instance (no SSH needed!)"
  value       = "aws ssm start-session --target ${aws_instance.n8n.id}"
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.n8n.id
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.n8n.name
}

output "backup_location" {
  description = "Location of automated backups on instance"
  value       = "/home/ubuntu/n8n-backups"
}

output "setup_instructions" {
  description = "Post-deployment setup instructions"
  value       = <<-EOT
  
  ╔════════════════════════════════════════════════════════════════════════╗
  ║                                                                        ║
  ║   ✅ N8N INFRASTRUCTURE DEPLOYED!                                     ║
  ║                                                                        ║
  ╚════════════════════════════════════════════════════════════════════════╝
  
  🎯 Instance ID: ${aws_instance.n8n.id}
  🌐 Public IP: ${aws_eip.n8n.public_ip}
  🔗 URL: https://${var.n8n_domain}
  
  📋 Next Steps:
  
  1. Wait 5 minutes for instance to finish initialization
  
  2. Obtain SSL certificate (ONE TIME):
     aws ssm send-command \
       --instance-ids ${aws_instance.n8n.id} \
       --document-name "AWS-RunShellScript" \
       --parameters 'commands=["certbot --nginx -d ${var.n8n_domain} --non-interactive --agree-tos --email your@email.com"]'
  
  3. Verify n8n is running:
     aws ssm start-session --target ${aws_instance.n8n.id}
     docker ps
     docker exec n8n env | grep WEBHOOK_URL
  
  4. Test webhook registration:
     curl https://${var.n8n_domain}/webhook/test
  
  5. Import workflows from git:
     node scripts/restore-workflows-whitelist.js
  
  ✅ All future updates: Just run 'terraform apply'!
  
  EOT
}

