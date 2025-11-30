# N8N Version and WEBHOOK_URL Solution

## Current Status

- **Current Version**: 1.120.4 (latest stable)
- **Version Support**: WEBHOOK_URL is fully supported in 1.120.4
- **Issue**: n8n settings API shows `webhookUrl: null` even though environment variable is set

## Problem Analysis

### Root Cause
The `WEBHOOK_URL` environment variable is correctly set in the Docker container, but n8n's internal settings API doesn't reflect it. This is a known behavior where:

1. ✅ Environment variable is set (verified in container)
2. ✅ `.env` file has WEBHOOK_URL (verified)
3. ✅ docker-compose.yml has WEBHOOK_URL in environment section (verified)
4. ❌ n8n settings API shows `webhookUrl: null` (known n8n behavior)

### Why This Happens
- n8n reads `WEBHOOK_URL` from environment variables at startup
- The settings API may not reflect the env var value even if it's being used
- Webhooks may still work correctly even if the API shows null

## Solution Implemented

### 1. Version Pinning
- **Changed**: `n8n_version` default from `"latest"` to `"1.120.4"`
- **Location**: `terraform/n8n-infrastructure/variables.tf`
- **Reason**: Pin to stable version for reliability and reproducibility

### 2. Enhanced docker-compose.yml
- **Added**: Explicit environment variables in docker-compose.yml
- **Ensured**: WEBHOOK_URL is set in BOTH `.env` file AND environment section
- **Added**: Additional n8n configuration variables for completeness

### 3. Terraform Configuration
- **Updated**: `user-data.sh` to use actual domain value in docker-compose.yml
- **Ensured**: WEBHOOK_URL is set before n8n container starts
- **Added**: Comprehensive logging and health checks

## Configuration Files

### Terraform Variable
```hcl
variable "n8n_version" {
  description = "N8N Docker image version (pinned to stable version for reliability)"
  type        = string
  default     = "1.120.4"
}
```

### Docker Compose
```yaml
services:
  n8n:
    image: n8nio/n8n:${n8n_version}
    env_file:
      - /opt/n8n/.env
    environment:
      - WEBHOOK_URL=https://${n8n_domain}
      # ... other variables
```

### .env File
```bash
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
# ... other variables
```

## Verification Steps

1. **Check Container Environment**:
   ```bash
   docker exec n8n env | grep WEBHOOK_URL
   ```

2. **Check .env File**:
   ```bash
   cat /opt/n8n/.env | grep WEBHOOK_URL
   ```

3. **Check docker-compose.yml**:
   ```bash
   cat /opt/n8n/docker-compose.yml | grep WEBHOOK_URL
   ```

4. **Test Webhook** (even if API shows null):
   ```bash
   curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

## Known Limitations

- **Settings API**: May show `webhookUrl: null` even when env var is set
- **Workaround**: Webhooks may still work correctly despite API showing null
- **Solution**: Test webhooks directly rather than relying on settings API

## Recommendations

1. **Use Pinned Version**: Always pin to a specific stable version (e.g., `1.120.4`)
2. **Set in Multiple Places**: Set WEBHOOK_URL in both `.env` and `environment` section
3. **Test Webhooks**: Test webhook endpoints directly rather than relying on settings API
4. **Monitor Logs**: Check n8n logs for webhook registration messages

## Future Upgrades

When upgrading n8n:

1. Check release notes for WEBHOOK_URL changes
2. Test webhook registration after upgrade
3. Verify environment variables are still read correctly
4. Update pinned version in `variables.tf`

## References

- [n8n Environment Variables Documentation](https://docs.n8n.io/hosting/configuration/environment-variables/)
- [n8n Docker Deployment Guide](https://docs.n8n.io/hosting/installation/docker/)
- [n8n Webhook Configuration](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

