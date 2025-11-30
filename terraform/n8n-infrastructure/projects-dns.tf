# Projects DNS Configuration
# Adds Route53 DNS record for projects.pbradygeorgen.com
# This will serve the unified dashboard and project management system

# Route 53 DNS Record for Projects Dashboard
resource "aws_route53_record" "projects" {
  zone_id = var.route53_zone_id
  name    = "projects.pbradygeorgen.com"
  type    = "A"
  ttl     = 300
  records = [aws_eip.n8n.public_ip] # Use same Elastic IP as n8n and mcp
}

# Output Projects domain
output "projects_domain" {
  description = "Projects dashboard domain name"
  value       = "projects.pbradygeorgen.com"
}

output "projects_url" {
  description = "Projects dashboard URL"
  value       = "https://projects.pbradygeorgen.com"
}

