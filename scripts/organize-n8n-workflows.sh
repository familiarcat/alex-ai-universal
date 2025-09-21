#!/bin/bash
# 🖖 N8N Workflow Organization Batch Rename Script
# 
# This script implements the comprehensive workflow organization schema
# for the Alex AI N8N workflow ecosystem

echo "🖖 Starting N8N Workflow Organization..."
echo "========================================"
echo ""

# Phase 1: Crew Member Workflows
echo "📋 Phase 1: Renaming Crew Member Workflows..."
echo "----------------------------------------------"

echo "🔄 Renaming Captain Jean-Luc Picard..."
node scripts/rename-n8n-workflows.js pattern "Crew - Captain Jean-Luc Picard" "CREW - Captain Jean-Luc Picard - Strategic Leadership - OpenRouter - Production"

echo "🔄 Renaming Commander William Riker..."
node scripts/rename-n8n-workflows.js pattern "Crew - Commander William Riker" "CREW - Commander William Riker - Tactical Execution - OpenRouter - Production"

echo "🔄 Renaming Commander Data..."
node scripts/rename-n8n-workflows.js pattern "Crew - Commander Data" "CREW - Commander Data - Android Analytics - OpenRouter - Production"

echo "🔄 Renaming Lieutenant Commander Geordi La Forge..."
node scripts/rename-n8n-workflows.js pattern "Crew - Lieutenant Commander Geordi La Forge" "CREW - Lieutenant Commander Geordi La Forge - Infrastructure - OpenRouter - Production"

echo "🔄 Renaming Lieutenant Uhura..."
node scripts/rename-n8n-workflows.js pattern "Crew - Lieutenant Uhura" "CREW - Lieutenant Uhura - Communications & I/O - OpenRouter - Production"

echo "🔄 Renaming Lieutenant Worf..."
node scripts/rename-n8n-workflows.js pattern "Crew - Lieutenant Worf" "CREW - Lieutenant Worf - Security & Compliance - OpenRouter - Production"

echo "🔄 Renaming Counselor Deanna Troi..."
node scripts/rename-n8n-workflows.js pattern "Crew - Counselor Deanna Troi" "CREW - Counselor Deanna Troi - User Experience - OpenRouter - Production"

echo "🔄 Renaming Dr. Beverly Crusher..."
node scripts/rename-n8n-workflows.js pattern "Crew - Dr. Beverly Crusher" "CREW - Dr. Beverly Crusher - Health & Diagnostics - OpenRouter - Production"

echo "✅ Crew Member Workflows Renamed!"
echo ""

# Phase 2: System Workflows
echo "📋 Phase 2: Renaming System Workflows..."
echo "----------------------------------------"

echo "🔄 Renaming Federation Concise Agency..."
node scripts/rename-n8n-workflows.js pattern "System - Federation Concise" "SYSTEM - Federation Crew Coordination - OpenRouter - Production"

echo "🔄 Renaming Federation Crew..."
node scripts/rename-n8n-workflows.js pattern "System - Federation Crew" "SYSTEM - OpenRouter Agent Coordination - OpenRouter - Production"

echo "🔄 Renaming AlexAI Optimized Crew..."
node scripts/rename-n8n-workflows.js pattern "System - AlexAI Optimized" "SYSTEM - Mission Control - OpenRouter - Production"

echo "🔄 Renaming Enhanced Federation Crew..."
node scripts/rename-n8n-workflows.js pattern "System - Enhanced Federation" "SYSTEM - Enhanced Mission Control - OpenRouter - Production"

echo "✅ System Workflows Renamed!"
echo ""

# Phase 3: Coordination Workflows
echo "📋 Phase 3: Renaming Coordination Workflows..."
echo "----------------------------------------------"

echo "🔄 Renaming Observation Lounge..."
node scripts/rename-n8n-workflows.js pattern "Observation Lounge" "COORDINATION - Observation Lounge - OpenRouter - Production"

echo "🔄 Renaming LLM Democratic Collaboration..."
node scripts/rename-n8n-workflows.js pattern "LLM_Democratic" "COORDINATION - Democratic Collaboration - OpenRouter - Production"

echo "✅ Coordination Workflows Renamed!"
echo ""

# Phase 4: Anti-Hallucination Workflows
echo "📋 Phase 4: Renaming Anti-Hallucination Workflows..."
echo "----------------------------------------------------"

echo "🔄 Renaming Anti-Hallucination HTTP Handler..."
node scripts/rename-n8n-workflows.js pattern "Anti-Hallucination Crew Workflow (HTTP)" "ANTI-HALLUCINATION - HTTP Handler - OpenRouter - Production"

echo "🔄 Renaming Anti-Hallucination Crew Detection..."
node scripts/rename-n8n-workflows.js pattern "Anti-Hallucination Crew Workflow" "ANTI-HALLUCINATION - Crew Detection - OpenRouter - Production"

echo "✅ Anti-Hallucination Workflows Renamed!"
echo ""

# Phase 5: Project Workflows
echo "📋 Phase 5: Renaming Project Workflows..."
echo "------------------------------------------"

echo "🔄 Renaming Alex AI Job Opportunities Production..."
node scripts/rename-n8n-workflows.js pattern "Alex AI Job Opportunities - Production" "PROJECT - Alex AI - Job Opportunities - Production"

echo "🔄 Renaming Alex AI Job Opportunities Live Data..."
node scripts/rename-n8n-workflows.js pattern "Alex AI Job Opportunities - Live Data" "PROJECT - Alex AI - Job Opportunities Live - Production"

echo "🔄 Renaming Alex AI Resume Analysis..."
node scripts/rename-n8n-workflows.js pattern "Alex AI Resume Analysis" "PROJECT - Alex AI - Resume Analysis - Production"

echo "🔄 Renaming Alex AI MCP Request Handler..."
node scripts/rename-n8n-workflows.js pattern "Alex AI MCP Request Handler" "PROJECT - Alex AI - MCP Integration - Production"

echo "🔄 Renaming Alex AI Contacts..."
node scripts/rename-n8n-workflows.js pattern "Alex AI Contacts" "PROJECT - Alex AI - Contact Management - Production"

echo "🔄 Renaming Alex AI Unified Crew Integration..."
node scripts/rename-n8n-workflows.js pattern "Alex AI - Unified Crew Integration" "PROJECT - Alex AI - Crew Integration - Production"

echo "🔄 Renaming Alex AI Enhanced MCP..."
node scripts/rename-n8n-workflows.js pattern "Alex AI - Enhanced MCP" "PROJECT - Alex AI - MCP Enhancement - Production"

echo "✅ Project Workflows Renamed!"
echo ""

# Phase 6: Utility Workflows
echo "📋 Phase 6: Renaming Utility Workflows..."
echo "------------------------------------------"

echo "🔄 Renaming Enhanced Unified AI Controller..."
node scripts/rename-n8n-workflows.js pattern "Enhanced Unified AI Controller" "UTILITY - AI Controller - OpenRouter - Production"

echo "🔄 Renaming Crew Management System..."
node scripts/rename-n8n-workflows.js pattern "Crew Management System" "UTILITY - Crew Management - OpenRouter - Production"

echo "🔄 Renaming My Sub-workflow..."
node scripts/rename-n8n-workflows.js pattern "My Sub-workflow" "UTILITY - Generic Sub-workflow - OpenRouter - Production"

echo "✅ Utility Workflows Renamed!"
echo ""

# Final Summary
echo "🎉 N8N Workflow Organization Complete!"
echo "======================================"
echo ""
echo "📋 Final Workflow List:"
echo "----------------------"
node scripts/rename-n8n-workflows.js list
echo ""
echo "✅ All 27 workflows have been organized with the new naming schema!"
echo "🖖 The Alex AI N8N workflow ecosystem is now properly categorized and organized!"
