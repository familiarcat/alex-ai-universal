# Cost Optimization Templates

## EC2 Instance Optimization
- Use t3.micro for development: `instance_type = "t3.micro"`
- Use t3.small for staging: `instance_type = "t3.small"`
- Use t3.medium for production: `instance_type = "t3.medium"`

## EBS Volume Optimization
- Start with 20GB for development
- Use gp3 for better price/performance
- Monitor usage and resize as needed

## CloudWatch Optimization
- Set log retention to 7 days for development
- Use 14 days for staging
- Use 30 days for production only

## Cost Monitoring
- Run cost analysis before every deployment
- Set up cost alerts in AWS Budgets
- Review costs monthly
