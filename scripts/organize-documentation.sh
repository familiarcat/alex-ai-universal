#!/bin/bash

###############################################################################
# Documentation Organization Script
# Moves root-level markdown files to organized structure
# 
# Reviewed by: Lt. Cmdr. La Forge (Organization) & Commander Data (Classification)
###############################################################################

set -e

PROJECT_ROOT="/Users/bradygeorgen/Documents/workspace/alex-ai-universal"
cd "$PROJECT_ROOT"

echo "🖖 Alex AI - Documentation Organization Script"
echo "=============================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track moves
MOVED_COUNT=0

echo "📊 Analyzing root directory..."
ROOT_MD_COUNT=$(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ')
echo "Found $ROOT_MD_COUNT markdown files at root"
echo ""

# Function to move file
move_file() {
    local FILE=$1
    local DEST=$2
    
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✅${NC} Moving: $FILE → $DEST"
        mv "$FILE" "$DEST"
        ((MOVED_COUNT++))
    fi
}

# 1. KEEP AT ROOT (Essential files)
echo "📌 Files to KEEP at root:"
echo "  ✅ README.md (project overview)"
echo "  ✅ CHANGELOG.md (version history)"
echo "  ✅ CONTRIBUTING.md (contributor guide)"
echo "  ✅ QUICK_START.md (quick reference)"
echo "  ✅ START_HERE_NEXT_SESSION.md (current session guide)"
echo ""

# 2. MOVE MILESTONES
echo "📁 Organizing MILESTONES..."
move_file "MILESTONE_DDD_ARCHITECTURE_COMPLETE_2025_10_13.md" "docs/archive/milestones/"
move_file "MILESTONE_FULL_SYSTEM_ENGAGEMENT_2025_10_13.md" "docs/archive/milestones/"
move_file "MILESTONE_IMPLEMENTATION_QUEUE_COMPLETE_2025_10_13.md" "docs/archive/milestones/"
move_file "MILESTONE_MULTI_PROJECT_ARCHITECTURE_2025_10_13.md" "docs/archive/milestones/"
move_file "MILESTONE_NEXTJS_ARCHITECTURE_2025_10_13.md" "docs/archive/milestones/"
move_file "MILESTONE_RAG_SYSTEM_VALIDATION_2025_01_19.md" "docs/archive/milestones/"
move_file "MILESTONE_READY_FOR_NEXT_PHASE_2025_01_19.md" "docs/archive/milestones/"
move_file "MILESTONE_THEME_GALLERY_COMPLETE_2025_10_13.md" "docs/archive/milestones/"
move_file "MILESTONE_UNIVERSAL_THEME_SYSTEM_2025_10_13.md" "docs/archive/milestones/"
move_file "CURRENT_MILESTONE.md" "docs/archive/milestones/"
echo ""

# 3. MOVE SESSION REPORTS
echo "📁 Organizing SESSION REPORTS..."
move_file "SESSION_SUMMARY_2025_10_13.md" "docs/archive/sessions/"
move_file "FINAL_SESSION_REPORT_2025_10_13.md" "docs/archive/sessions/"
move_file "GIT_COMMIT_SUMMARY.md" "docs/archive/sessions/"
echo ""

# 4. MOVE CREW DOCUMENTATION
echo "📁 Organizing CREW DOCUMENTS..."
move_file "CREW_CODE_REVIEW_NEXTJS_INTEGRATION.md" "docs/archive/crew-meetings/"
move_file "CREW_CONSENSUS_DDD_REFACTORING.md" "docs/archive/crew-meetings/"
move_file "CREW_GUIDED_PROJECT_ONBOARDING_DESIGN.md" "docs/archive/crew-meetings/"
move_file "CREW_PARALLEL_DDD_ASSIGNMENT.md" "docs/archive/crew-meetings/"
move_file "CREW_SUB_AGENT_ARCHITECTURE_ANALYSIS.md" "docs/archive/crew-meetings/"
move_file "CREW_VIBE_CODING_ANALYSIS.md" "docs/archive/crew-meetings/"
move_file "OBSERVATION_LOUNGE_MEETING_TRANSCRIPT.md" "docs/archive/crew-meetings/"
move_file "OBSERVATION_LOUNGE_MULTI_PROJECT_ARCHITECTURE_2025_10_13.md" "docs/archive/crew-meetings/"
move_file "QUARK_TROI_THEME_UX_BUSINESS_ANALYSIS.md" "docs/archive/crew-meetings/"
echo ""

# 5. MOVE PLANNING DOCUMENTS
echo "📁 Organizing PLANNING DOCUMENTS..."
move_file "NEXT_STEPS_NEXTJS_INTEGRATION.md" "docs/archive/planning/"
move_file "REAL_IMPLEMENTATION_NEXTJS_15_PLAN.md" "docs/archive/planning/"
move_file "FUTURE_GIT_HOOK_RAG_INTEGRATION.md" "docs/archive/planning/"
move_file "PROJECT_STRUCTURE_OPTIMIZED_2025_01_19.md" "docs/archive/planning/"
move_file "HONEST_ASSESSMENT_PLACEHOLDER_VS_REAL.md" "docs/archive/planning/"
move_file "ANTI_HALLUCINATION_EVENT_UI_DEBUGGING_2025_10_13.md" "docs/archive/planning/"
move_file "CLEANUP_EXECUTION_GUIDE.md" "docs/archive/planning/"
echo ""

# 6. MOVE ACTIVE ARCHITECTURE DOCS TO PROPER LOCATION
echo "📁 Organizing ACTIVE ARCHITECTURE..."
move_file "DDD_ARCHITECTURE_GUIDE.md" "docs/active/architecture/"
move_file "DDD_MIGRATION_COMPLETE.md" "docs/active/architecture/"
move_file "AUTONOMOUS_CREW_CAPABILITIES.md" "docs/active/architecture/"
echo ""

# 7. MOVE GUIDES TO PROPER LOCATION
echo "📁 Organizing GUIDES..."
move_file "RAG_INTEGRATION_GUIDE.md" "docs/active/guides/"
move_file "N8N_RAG_DEPLOYMENT_STEPS.md" "docs/active/guides/"
echo ""

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Organization Complete!${NC}"
echo "Moved $MOVED_COUNT files"
echo ""
echo "📊 New Structure:"
echo "  docs/active/         - Current documentation"
echo "  docs/archive/        - Historical (RAG-ready for pruning)"
echo "  ROOT/                - Only essential files"
echo ""
echo "🔮 Next Step:"
echo "  Run: node scripts/verify-rag-and-prune.js"
echo "  (After RAG ingestion completes)"
echo ""
echo "🖖 Root directory: CLEAN!"

