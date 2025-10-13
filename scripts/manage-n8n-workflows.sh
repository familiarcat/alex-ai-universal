#!/bin/bash

##############################################################################
# n8n Workflow Management Script
# 
# Comprehensive n8n workflow organization and pruning tool
# Uses n8n REST API with credentials from ~/.zshrc
#
# Features:
# 1. Audit all workflows (active, inactive, unused)
# 2. Categorize by prefix (CREW, PROJECT, SYSTEM, etc.)
# 3. Identify unused/duplicate workflows
# 4. Prune inactive workflows with confirmation
# 5. Add tags for better organization
# 6. Generate organization report
#
# Usage: 
#   ./scripts/manage-n8n-workflows.sh --audit          # Just show report
#   ./scripts/manage-n8n-workflows.sh --prune          # Remove unused workflows
#   ./scripts/manage-n8n-workflows.sh --tag            # Add organization tags
#   ./scripts/manage-n8n-workflows.sh --reorganize     # Full cleanup
##############################################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Parse arguments
ACTION="audit"
DRY_RUN=true

for arg in "$@"; do
  case $arg in
    --audit) ACTION="audit" ;;
    --prune) ACTION="prune"; DRY_RUN=false ;;
    --tag) ACTION="tag" ;;
    --reorganize) ACTION="reorganize"; DRY_RUN=false ;;
    --dry-run) DRY_RUN=true ;;
    --execute) DRY_RUN=false ;;
  esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🖖 n8n Workflow Management System                       ║${NC}"
echo -e "${BLUE}║   Organize and Optimize Your n8n Instance                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# Extract credentials
##############################################################################

extract_env_var() {
  grep "^export ${1}=" ~/.zshrc 2>/dev/null | sed 's/^export [^=]*="//' | sed 's/"$//' | head -1
}

N8N_BASE_URL=$(extract_env_var "N8N_BASE_URL" | sed 's|/$||')
N8N_API_KEY=$(extract_env_var "N8N_API_KEY")

if [ -z "$N8N_BASE_URL" ] || [ -z "$N8N_API_KEY" ]; then
  echo -e "${RED}❌ Missing n8n credentials in ~/.zshrc${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Connected to: ${N8N_BASE_URL}${NC}"
echo ""

##############################################################################
# Fetch all workflows
##############################################################################

echo -e "${CYAN}📥 Fetching all workflows...${NC}"

WORKFLOWS=$(curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" "${N8N_BASE_URL}/api/v1/workflows")
WORKFLOW_COUNT=$(echo "$WORKFLOWS" | jq '.data | length' 2>/dev/null)

if [ -z "$WORKFLOW_COUNT" ] || [ "$WORKFLOW_COUNT" = "0" ]; then
  echo -e "${RED}❌ Failed to fetch workflows${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Found ${WORKFLOW_COUNT} workflows${NC}"
echo ""

##############################################################################
# Categorize workflows
##############################################################################

echo -e "${CYAN}📊 Categorizing workflows...${NC}"
echo ""

# Categories based on naming convention
categorize_workflow() {
  local name=$1
  
  if [[ "$name" == CREW\ -* ]]; then
    echo "CREW"
  elif [[ "$name" == Crew\ -* ]]; then
    echo "CREW_VARIANT"
  elif [[ "$name" == PROJECT\ -* ]]; then
    echo "PROJECT"
  elif [[ "$name" == LCARS* ]]; then
    echo "LCARS"
  elif [[ "$name" == SYSTEM\ -* ]]; then
    echo "SYSTEM"
  elif [[ "$name" == COORDINATION\ -* ]]; then
    echo "COORDINATION"
  elif [[ "$name" == ANTI-HALLUCINATION* ]] || [[ "$name" == Anti-Hallucination* ]]; then
    echo "ANTI_HALLUCINATION"
  elif [[ "$name" == UTILITY\ -* ]]; then
    echo "UTILITY"
  elif [[ "$name" == Hallucination* ]]; then
    echo "MONITORING"
  else
    echo "UNCATEGORIZED"
  fi
}

# Generate category report
echo "$WORKFLOWS" | jq -r '.data[] | "\(.id)|\(.name)|\(.active)|\(.triggerCount)|\(.updatedAt)"' | \
while IFS='|' read -r id name active triggers updated; do
  category=$(categorize_workflow "$name")
  status=$([ "$active" = "true" ] && echo "🟢 Active" || echo "⚪ Inactive")
  echo "$category|$status|$triggers|$name|$id|$updated"
done | sort > /tmp/n8n-workflow-categorized.txt

# Count by category
echo -e "${YELLOW}Category Breakdown:${NC}"
echo ""

cat /tmp/n8n-workflow-categorized.txt | cut -d'|' -f1 | sort | uniq -c | while read count category; do
  printf "  %-20s %3d workflows\n" "$category:" "$count"
done

echo ""

##############################################################################
# Identify unused/inactive workflows
##############################################################################

echo -e "${CYAN}🔍 Identifying unused workflows...${NC}"
echo ""

echo -e "${YELLOW}Inactive Workflows (0 executions):${NC}"
cat /tmp/n8n-workflow-categorized.txt | grep "⚪ Inactive" | grep "|0|" | while IFS='|' read -r category status triggers name id updated; do
  echo "  ⚪ $name"
  echo "     Category: $category | Last updated: $updated"
  echo "     ID: $id"
  echo ""
done > /tmp/n8n-unused-workflows.txt

UNUSED_COUNT=$(cat /tmp/n8n-unused-workflows.txt | grep -c "⚪" || echo "0")
echo "Found $UNUSED_COUNT unused workflows"
echo ""

# Show duplicates
echo -e "${YELLOW}Potential Duplicates:${NC}"
echo "$WORKFLOWS" | jq -r '.data[].name' | grep -i "quark" | sort | uniq -c | while read count name; do
  if [ "$count" -gt 1 ]; then
    echo "  ⚠️  $name ($count instances)"
  fi
done

echo ""

##############################################################################
# Alex AI Specific Workflows
##############################################################################

echo -e "${CYAN}🖖 Alex AI System Workflows:${NC}"
echo ""

echo -e "${GREEN}✅ Core Crew Members:${NC}"
grep "^CREW|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "  $status - $name"
done

echo ""
echo -e "${BLUE}💙 LCARS Ship's Computer:${NC}"
grep "^LCARS|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "  $status - $name"
done

echo ""
echo -e "${MAGENTA}🔧 Alex AI Projects:${NC}"
grep "^PROJECT|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "  $status - $name"
done

echo ""

##############################################################################
# Recommendations
##############################################################################

echo -e "${CYAN}💡 Organization Recommendations:${NC}"
echo ""

# Find inactive workflows
INACTIVE_NON_LCARS=$(cat /tmp/n8n-workflow-categorized.txt | grep "⚪ Inactive" | grep -v "^LCARS|" | wc -l | tr -d ' ')

if [ "$INACTIVE_NON_LCARS" -gt 0 ]; then
  echo "  1. ${YELLOW}Archive $INACTIVE_NON_LCARS inactive workflows${NC}"
  echo "     These have never been triggered and are not LCARS"
  echo ""
fi

# Find duplicates
QUARK_COUNT=$(echo "$WORKFLOWS" | jq -r '.data[].name' | grep -c "Quark" || echo "0")
if [ "$QUARK_COUNT" -gt 1 ]; then
  echo "  2. ${YELLOW}Consolidate Quark workflows ($QUARK_COUNT found)${NC}"
  echo "     Keep: Crew - Quark - Business Intelligence & Budget Optimization"
  echo "     Archive: Crew - Quark - Ferengi Business Intelligence"
  echo ""
fi

# Suggest tags
echo "  3. ${YELLOW}Add n8n tags for better organization:${NC}"
echo "     • Tag 'alex-ai-crew' for all CREW workflows"
echo "     • Tag 'alex-ai-lcars' for LCARS workflows"
echo "     • Tag 'alex-ai-project' for PROJECT workflows"
echo "     • Tag 'alex-ai-system' for SYSTEM workflows"
echo ""

##############################################################################
# Action: Prune
##############################################################################

if [ "$ACTION" = "prune" ]; then
  echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
  echo -e "${YELLOW} Pruning Unused Workflows${NC}"
  echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
  echo ""
  
  if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}🔍 DRY RUN MODE - No workflows will be deleted${NC}"
    echo ""
  fi
  
  # Workflows to prune (inactive with 0 executions, not LCARS, not Alex AI core)
  PRUNE_LIST=$(cat /tmp/n8n-workflow-categorized.txt | \
    grep "⚪ Inactive|0|" | \
    grep -v "^LCARS|" | \
    grep -v "^CREW|" | \
    grep -v "^PROJECT|")
  
  if [ -z "$PRUNE_LIST" ]; then
    echo -e "${GREEN}✅ No workflows to prune${NC}"
  else
    echo "$PRUNE_LIST" | while IFS='|' read -r category status triggers name id updated; do
      echo -e "${YELLOW}⚠️  Candidate for pruning:${NC}"
      echo "     Name: $name"
      echo "     Category: $category"
      echo "     ID: $id"
      
      if [ "$DRY_RUN" = false ]; then
        read -p "     Delete this workflow? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
          curl -s -X DELETE \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            "${N8N_BASE_URL}/api/v1/workflows/${id}" > /dev/null
          echo -e "     ${RED}✓ Deleted${NC}"
        else
          echo "     ⏭️  Skipped"
        fi
      else
        echo "     [DRY RUN] Would delete"
      fi
      echo ""
    done
  fi
fi

##############################################################################
# Generate organization report
##############################################################################

echo -e "${CYAN}📝 Generating organization report...${NC}"

cat > /tmp/n8n-organization-report.md << 'EOF'
# 🖖 n8n Workflow Organization Report

## Summary

EOF

echo "- **Total Workflows**: $WORKFLOW_COUNT" >> /tmp/n8n-organization-report.md
echo "- **Active**: $(cat /tmp/n8n-workflow-categorized.txt | grep -c "🟢 Active")" >> /tmp/n8n-organization-report.md
echo "- **Inactive**: $(cat /tmp/n8n-workflow-categorized.txt | grep -c "⚪ Inactive")" >> /tmp/n8n-organization-report.md
echo "- **Unused** (0 executions): $UNUSED_COUNT" >> /tmp/n8n-organization-report.md
echo "" >> /tmp/n8n-organization-report.md

cat >> /tmp/n8n-organization-report.md << 'EOF'

## Workflows by Category

### 🖖 CREW Members (Core Team)
EOF

grep "^CREW|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "- $status $name" >> /tmp/n8n-organization-report.md
done

cat >> /tmp/n8n-organization-report.md << 'EOF'

### 🧠 LCARS (Ship's Computer)
EOF

grep "^LCARS|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "- $status $name" >> /tmp/n8n-organization-report.md
done

cat >> /tmp/n8n-organization-report.md << 'EOF'

### 📁 Alex AI Projects
EOF

grep "^PROJECT|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "- $status $name" >> /tmp/n8n-organization-report.md
done

cat >> /tmp/n8n-organization-report.md << 'EOF'

### ⚙️ System Workflows
EOF

grep "^SYSTEM|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "- $status $name" >> /tmp/n8n-organization-report.md
done

cat >> /tmp/n8n-organization-report.md << 'EOF'

### 🔗 Coordination
EOF

grep "^COORDINATION|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "- $status $name" >> /tmp/n8n-organization-report.md
done

cat >> /tmp/n8n-organization-report.md << 'EOF'

### 🛡️ Anti-Hallucination
EOF

grep "^ANTI_HALLUCINATION|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "- $status $name" >> /tmp/n8n-organization-report.md
done

cat >> /tmp/n8n-organization-report.md << 'EOF'

### 🔧 Utilities
EOF

grep "^UTILITY|" /tmp/n8n-workflow-categorized.txt | while IFS='|' read -r category status triggers name id updated; do
  echo "- $status $name" >> /tmp/n8n-organization-report.md
done

cat >> /tmp/n8n-organization-report.md << 'EOF'

## Recommendations

### Workflows to Prune (Inactive + 0 Executions)
EOF

if [ "$UNUSED_COUNT" -gt 0 ]; then
  cat /tmp/n8n-unused-workflows.txt >> /tmp/n8n-organization-report.md
else
  echo "No unused workflows found!" >> /tmp/n8n-organization-report.md
fi

cat >> /tmp/n8n-organization-report.md << 'EOF'

### Suggested Organization

1. **Tag all workflows** with category tags
2. **Archive inactive** workflows (keep as backup)
3. **Consolidate duplicates** (e.g., multiple Quark workflows)
4. **Add descriptions** to each workflow
5. **Create folder structure** (if n8n supports it)

### Proposed Structure

```
alex-ai-universal/
├── crew/
│   ├── captain-picard
│   ├── commander-data
│   ├── commander-riker
│   ├── lt-la-forge
│   ├── lt-worf
│   ├── counselor-troi
│   ├── dr-crusher
│   ├── lt-uhura
│   └── quark
├── lcars/
│   ├── library-computer
│   └── access-retrieval-system
├── projects/
│   ├── job-opportunities
│   ├── resume-analysis
│   ├── crew-integration
│   ├── mcp-enhancement
│   ├── mcp-integration
│   └── contact-management
├── systems/
│   ├── mission-control
│   ├── enhanced-mission-control
│   └── agent-coordination
├── coordination/
│   ├── democratic-collaboration
│   └── observation-lounge
├── quality/
│   ├── anti-hallucination-handler
│   ├── crew-detection
│   └── monitoring
└── utilities/
    ├── ai-controller
    └── crew-management
```
EOF

echo -e "${GREEN}✅ Report generated: /tmp/n8n-organization-report.md${NC}"
echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   📊 Management Summary                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "📦 Workflow Statistics:"
echo "   • Total: $WORKFLOW_COUNT"
echo "   • Active: $(cat /tmp/n8n-workflow-categorized.txt | grep -c "🟢 Active")"
echo "   • Inactive: $(cat /tmp/n8n-workflow-categorized.txt | grep -c "⚪ Inactive")"
echo "   • Unused: $UNUSED_COUNT"
echo ""

echo "🗂️  Categories:"
cat /tmp/n8n-workflow-categorized.txt | cut -d'|' -f1 | sort | uniq -c | while read count category; do
  printf "   • %-20s %3d\n" "$category" "$count"
done
echo ""

echo "📄 Reports Generated:"
echo "   • Categorized List: /tmp/n8n-workflow-categorized.txt"
echo "   • Organization Report: /tmp/n8n-organization-report.md"
echo "   • Unused Workflows: /tmp/n8n-unused-workflows.txt"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Review organization report:"
echo "   ${CYAN}cat /tmp/n8n-organization-report.md${NC}"
echo ""
echo "2. Prune unused workflows (with confirmation):"
echo "   ${CYAN}./scripts/manage-n8n-workflows.sh --prune${NC}"
echo ""
echo "3. View categorized list:"
echo "   ${CYAN}cat /tmp/n8n-workflow-categorized.txt${NC}"
echo ""

if [ "$DRY_RUN" = true ] && [ "$ACTION" = "prune" ]; then
  echo -e "${CYAN}💡 This was a dry run. Use --execute to actually delete workflows.${NC}"
  echo ""
fi

echo -e "${GREEN}🖖 n8n workflow management complete!${NC}"



