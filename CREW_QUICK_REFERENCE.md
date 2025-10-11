# 🖖 Alex AI Crew Quick Reference

Fast access to crew member information and workflows.

## Quick Commands

```bash
# Sync crew roster from n8n
npm run crew:roster

# Alternative commands (all do the same thing)
npm run crew:list
npm run crew:sync
```

## Direct Workflow Links

### 👥 Command Crew
- [Captain Picard](https://n8n.pbradygeorgen.com/workflow/BdNHOluRYUw2JxGW) - Strategic Leadership
- [Commander Data](https://n8n.pbradygeorgen.com/workflow/gIwrQHHArgrVARjL) - Android Analytics  
- [Commander Riker](https://n8n.pbradygeorgen.com/workflow/Imn7p6pVgi6SRvnF) - Tactical Execution

### 🔧 Engineering & Operations
- [Lt. Cmdr. La Forge](https://n8n.pbradygeorgen.com/workflow/e0UEwyVcXJqeePdj) - Infrastructure
- [Lieutenant Worf](https://n8n.pbradygeorgen.com/workflow/GhSB8EpZWXLU78LM) - Security
- [Dr. Crusher](https://n8n.pbradygeorgen.com/workflow/SXAMupVWdOxZybF6) - Health & Diagnostics

### 🎨 Design & Communications
- [Counselor Troi](https://n8n.pbradygeorgen.com/workflow/QJnN7ks2KsQTENDc) - User Experience
- [Lieutenant Uhura](https://n8n.pbradygeorgen.com/workflow/36KPle5mPiMaazG6) - Communications

### 💰 Business Intelligence
- [Quark](https://n8n.pbradygeorgen.com/workflow/L6K4bzSKlGC36ABL) - Budget Optimization

### 🧠 LCARS System (Ship's Computer)
- [LCARS Library Computer](https://n8n.pbradygeorgen.com/workflow/UgP1oSoOELyXJUTa) - LLM Optimization
- [LCARS Access & Retrieval](https://n8n.pbradygeorgen.com/workflow/oiKW42kyYR2AGj1D) - Real-time Preview

## API Quick Reference

### Check Crew Status
```bash
source ~/.zshrc && curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "https://n8n.pbradygeorgen.com/api/v1/workflows" | \
  jq '[.data[] | select(.name | test("CREW -|Quark|LCARS")) | select(.active == true)] | length'
```

### List Active Crew
```bash
source ~/.zshrc && curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "https://n8n.pbradygeorgen.com/api/v1/workflows" | \
  jq -r '.data[] | select(.name | test("CREW -|Quark|LCARS")) | select(.active == true) | .name'
```

### Get Specific Workflow
```bash
source ~/.zshrc && curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "https://n8n.pbradygeorgen.com/api/v1/workflows/BdNHOluRYUw2JxGW"
```

## Crew Specializations

| Crew Member | Primary Role | Secondary Roles |
|-------------|--------------|-----------------|
| **Picard** | Strategy, Leadership | Decision-making, Stakeholder comms |
| **Data** | Data Analysis | Pattern recognition, Optimization |
| **Riker** | Tactical Execution | Code implementation, Operations |
| **La Forge** | Infrastructure | DevOps, CI/CD, System architecture |
| **Worf** | Security | Auth, Compliance, Vulnerability scanning |
| **Troi** | UX/UI Design | User research, Accessibility |
| **Crusher** | Diagnostics | Health monitoring, Error diagnosis |
| **Uhura** | Communications | API integration, Data translation |
| **Quark** | Business Intelligence | Cost analysis, ROI tracking |
| **LCARS LC** | LLM Optimization | Prompt analysis, Cost optimization |
| **LCARS ARS** | Real-time Preview | Collaborative updates, Publishing |

## Roster Files

- **Detailed Documentation:** [`CREW_ROSTER.md`](./CREW_ROSTER.md)
- **JSON Data:** [`crew-roster.json`](./crew-roster.json)
- **Sync Script:** [`scripts/sync-crew-roster.sh`](./scripts/sync-crew-roster.sh)

## Integration Points

- **n8n Dashboard:** https://n8n.pbradygeorgen.com/workflows
- **Supabase RAG:** https://rpkkkbufdwxmjaerbhbn.supabase.co
- **GitHub Repo:** https://github.com/familiarcat/alex-ai-universal

---

🖖 **Live long and prosper!**

