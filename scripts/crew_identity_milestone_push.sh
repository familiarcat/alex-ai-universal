#!/bin/bash
# Crew Identity Milestone Push Script
# This script creates a milestone push for all crew identity milestone changes

echo "🖖 Alex AI Universal - Crew Identity Milestone Push"
echo "=================================================="

# Set variables
MILESTONE_NAME="Crew Identity Milestone Integration - N8N Framework Distribution Complete"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MESSAGE="feat: Crew Identity Milestone Integration - N8N Framework Distribution

- Created 9 crew member identity milestone memories
- Integrated self-referential analysis for each crew member
- Prepared N8N framework distribution system
- Established Supabase memory trust integration
- Enhanced crew coordination capabilities

Crew Members Integrated:
- Captain Jean-Luc Picard (Strategic Leadership)
- Commander Data (Analytics & AI/ML)
- Commander William Riker (Tactical Execution)
- Lieutenant Commander Geordi La Forge (Engineering)
- Lieutenant Worf (Security & Testing)
- Dr. Beverly Crusher (Medical & Performance)
- Counselor Deanna Troi (Empathy & UX)
- Lieutenant Uhura (Communications & Automation)
- Quark (Business Analysis & ROI)

Self-Referential Capabilities:
- Bidirectional learning between personal and global memories
- 1536-dimensional vector embeddings for semantic search
- N8N framework distribution to all crew members
- Supabase memory trust integration
- Enhanced crew coordination and collaboration

Milestone: $MILESTONE_NAME
Timestamp: $TIMESTAMP"

echo "📊 Preparing milestone push..."
echo "Milestone: $MILESTONE_NAME"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Initializing..."
    git init
    echo "✅ Git repository initialized"
fi

# Add all changes
echo "📁 Adding all changes to git..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "⚠️ No changes to commit"
else
    echo "✅ Changes staged for commit"
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Check if commit was successful
if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully"
    
    # Check if we have a remote repository
    if git remote -v | grep -q origin; then
        echo "🚀 Pushing to remote repository..."
        git push origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed to remote repository"
        else
            echo "⚠️ Push to remote failed, but changes are committed locally"
        fi
    else
        echo "⚠️ No remote repository configured, changes committed locally"
    fi
    
    echo ""
    echo "🎯 Milestone Push Summary:"
    echo "  • Milestone: $MILESTONE_NAME"
    echo "  • Files Modified: $(git diff --cached --name-only | wc -l)"
    echo "  • Commit Hash: $(git rev-parse HEAD)"
    echo "  • Timestamp: $TIMESTAMP"
    echo ""
    echo "🖖 Crew Identity Milestone Push Complete!"
    
else
    echo "❌ Commit failed"
    exit 1
fi
