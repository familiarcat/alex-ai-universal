#!/usr/bin/env bash

##############################################################################
# Check UI/UX Analysis Status
# 
# Monitors the UI/UX analysis script and notifies when complete
##############################################################################

ANALYSIS_PID=$(ps aux | grep "analyze-dashboard-ui-ux" | grep -v grep | awk '{print $2}' | head -1)

if [ -z "$ANALYSIS_PID" ]; then
  echo "✅ UI/UX Analysis appears to be complete (process not found)"
  echo ""
  echo "📋 Check for analysis results:"
  echo "   - Look for '✅ UI/UX ANALYSIS COMPLETE' in output"
  echo "   - Check RAG system for stored analysis"
  echo "   - Review crew recommendations"
  echo ""
  exit 0
else
  echo "🔄 UI/UX Analysis still running (PID: $ANALYSIS_PID)"
  echo ""
  echo "⏳ Analysis in progress..."
  echo "   - Comparing with Squarespace and Wix"
  echo "   - Getting crew recommendations (Troi, Data, La Forge, Riker)"
  echo ""
  echo "📋 This may take 2-3 minutes for complete analysis"
  exit 1
fi

