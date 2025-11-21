# MCP DNS Configuration
# Adds Route53 DNS record for mcp.pbradygeorgen.com

# Route 53 DNS Record for MCP
resource "aws_route53_record" "mcp" {
  zone_id = var.route53_zone_id
  name    = "mcp.pbradygeorgen.com"
  type    = "A"
  ttl     = 300
  records = [aws_eip.n8n.public_ip] # Use same Elastic IP as n8n

  tags = {
    Name = "${var.project_name}-mcp-dns"
  }
}

# Output MCP domain
output "mcp_domain" {
  description = "MCP server domain name"
  value       = "mcp.pbradygeorgen.com"
}

output "mcp_url" {
  description = "MCP server URL"
  value       = "https://mcp.pbradygeorgen.com"
}

