# 🖖 Hybrid Migration Guide: Vercel Frontend + AWS Backend

**Mission:** Deploy Next.js dashboard to Vercel, migrate backend to AWS  
**Status:** Ready for execution  
**Milestone Checkpoint:** `pre-hybrid-migration` (commit: `63322dd`)

---

## 📋 Overview

This guide documents the hybrid migration process that deploys:
- **Frontend:** Next.js Dashboard → Vercel
- **Backend:** n8n, MCP, Infrastructure → AWS

The migration includes automatic rollback capabilities and state tracking.

---

## 🚀 Quick Start

### Prerequisites

1. **Milestone Checkpoint Created** ✅
   - Tag: `pre-hybrid-migration`
   - Commit: `63322dd`
   - This is your rollback point

2. **Credentials Configured** (in `~/.zshrc`)
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_PROFILE`
   - `N8N_URL`
   - `MCP_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

3. **Tools Installed**
   - Vercel CLI (`npm install -g vercel`)
   - AWS CLI (`aws --version`)
   - Git
   - jq (for JSON parsing)

### Execute Migration

```bash
./scripts/hybrid-migration-vercel-aws.sh
```

The script will:
1. ✅ Verify milestone checkpoint exists
2. ✅ Save current state
3. ✅ Execute phases with checkpoints
4. ✅ Provide rollback on failure

---

## 📊 Migration Phases

### Phase 1: Vercel Frontend Deployment

**Duration:** 5-10 minutes  
**Status:** Automated

**Actions:**
1. Check/install Vercel CLI
2. Deploy Next.js dashboard to Vercel
3. Configure environment variables:
   - `NEXT_PUBLIC_N8N_URL`
   - `NEXT_PUBLIC_MCP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy with environment variables

**Checkpoint:** State saved after successful deployment

**Rollback:** `vercel rollback` to previous deployment

---

### Phase 2: AWS Backend Infrastructure

**Duration:** 2-4 hours (manual setup)  
**Status:** Foundation ready, manual configuration required

**Actions:**
1. Verify AWS credentials
2. Create infrastructure foundation
3. Set up for:
   - n8n deployment (ECS/Lambda)
   - MCP service (EC2/ECS)
   - CloudWatch monitoring
   - VPC networking

**Checkpoint:** State saved after foundation setup

**Rollback:** Terraform destroy or manual cleanup

**Next Steps (Manual):**
1. Create Terraform configuration for ECS/Fargate
2. Deploy n8n to AWS ECS/Lambda
3. Configure MCP service on EC2/ECS
4. Set up CloudWatch monitoring

---

### Phase 3: Integration Testing

**Duration:** 30-60 minutes  
**Status:** Automated testing, manual verification

**Actions:**
1. Test Vercel deployment accessibility
2. Verify API endpoints:
   - `/api/health`
   - `/api/mcp/status`
3. Test integration points:
   - Vercel → n8n
   - Vercel → MCP
   - n8n → Supabase
   - MCP → Supabase

**Checkpoint:** State saved after testing

**Rollback:** Full rollback if integration fails

---

## 🔄 Rollback Procedures

### Automatic Rollback

The script automatically rolls back on failure:
- Phase 1 failure: Git rollback only
- Phase 2 failure: Vercel + Git rollback
- Phase 3 failure: AWS + Vercel + Git rollback

### Manual Rollback

```bash
# Full rollback to milestone
./scripts/hybrid-migration-vercel-aws.sh --rollback

# Or use -r flag
./scripts/hybrid-migration-vercel-aws.sh -r
```

**What gets rolled back:**
1. ✅ Vercel deployment → Previous version
2. ✅ AWS infrastructure → Terraform destroy
3. ✅ Git repository → Milestone tag/commit

### Rollback Log

All rollback actions are logged to:
```
.hybrid-migration-rollback.log
```

---

## 📁 State Management

### State File

Location: `.hybrid-migration-state.json`

**Structure:**
```json
{
  "timestamp": "2025-11-28T15:30:00Z",
  "phase": "vercel_frontend",
  "status": "complete",
  "milestone_tag": "pre-hybrid-migration",
  "details": {
    "deployment_url": "https://...vercel.app"
  },
  "checkpoints": {
    "pre_migration": {
      "git_commit": "63322dd",
      "timestamp": "2025-11-28T15:20:00Z"
    }
  }
}
```

### Check Status

```bash
./scripts/hybrid-migration-vercel-aws.sh --status
```

Or:
```bash
./scripts/hybrid-migration-vercel-aws.sh -s
```

---

## 🛡️ Safety Features

### Checkpoints

Each phase creates a checkpoint:
- **Pre-migration:** Git commit/tag
- **Phase 1:** Vercel deployment URL
- **Phase 2:** AWS infrastructure state
- **Phase 3:** Integration test results

### Error Handling

- ✅ Automatic rollback on failure
- ✅ State preservation for recovery
- ✅ Detailed error logging
- ✅ Interactive confirmation between phases

### Verification

Before each phase:
- ✅ Credentials verified
- ✅ Prerequisites checked
- ✅ Previous phase status confirmed

---

## 📊 Expected Outcomes

### Phase 1 (Vercel)
- ✅ Dashboard deployed to Vercel
- ✅ Environment variables configured
- ✅ Live URL available
- ✅ Zero downtime deployment

### Phase 2 (AWS)
- ✅ AWS credentials verified
- ✅ Infrastructure foundation ready
- ✅ Ready for n8n/MCP deployment
- ⚠️ Manual configuration required

### Phase 3 (Integration)
- ✅ End-to-end flow tested
- ✅ All services accessible
- ✅ DDD architecture validated
- ✅ Monitoring configured

---

## 🔍 Troubleshooting

### Vercel Deployment Fails

**Symptoms:**
- Build errors
- Environment variable issues
- Deployment timeout

**Solutions:**
1. Check build logs: `vercel logs`
2. Verify environment variables: `vercel env ls`
3. Test locally: `vercel dev`
4. Rollback: `./scripts/hybrid-migration-vercel-aws.sh --rollback`

### AWS Credentials Invalid

**Symptoms:**
- `AWS credentials invalid` error
- Access denied errors

**Solutions:**
1. Verify credentials in `~/.zshrc`
2. Test AWS access: `aws sts get-caller-identity`
3. Check IAM permissions
4. Verify AWS_REGION and AWS_PROFILE

### Integration Tests Fail

**Symptoms:**
- API endpoints not accessible
- Connection timeouts
- CORS errors

**Solutions:**
1. Check Vercel deployment status
2. Verify environment variables
3. Test endpoints manually: `curl https://[url]/api/health`
4. Check n8n/MCP server status
5. Review CloudWatch logs (if AWS deployed)

---

## 📚 References

- **Migration Script:** `scripts/hybrid-migration-vercel-aws.sh`
- **State File:** `.hybrid-migration-state.json`
- **Rollback Log:** `.hybrid-migration-rollback.log`
- **Milestone Tag:** `pre-hybrid-migration`
- **Strategy Document:** `docs/VERCEL_AWS_DEPLOYMENT_STRATEGY.md`
- **Crew Analysis:** `docs/crew-coordination/vercel-aws-analysis-*.json`

---

## ✅ Post-Migration Checklist

After successful migration:

- [ ] Verify Vercel deployment is live
- [ ] Test all API endpoints
- [ ] Verify environment variables
- [ ] Check CloudWatch monitoring (if AWS deployed)
- [ ] Update documentation with new URLs
- [ ] Set up cost monitoring alerts
- [ ] Schedule quarterly architecture review
- [ ] Document any manual steps taken

---

## 🎖️ Crew Coordination

**Riker (Tactical):** Execution plan and coordination  
**La Forge (Infrastructure):** AWS setup and monitoring  
**Data (Technical):** Integration testing and validation  
**Quark (Business):** Cost monitoring and optimization

---

**Status:** ✅ Ready for execution  
**Milestone:** `pre-hybrid-migration` (63322dd)  
**Rollback:** Available at any time

