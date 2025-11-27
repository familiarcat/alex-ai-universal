#!/usr/bin/env bash
# Milestone Push with Timeout Wrapper
# Wraps the milestone push process with timeout protection

set -euo pipefail

TIMEOUT=${MILESTONE_TIMEOUT:-60}  # Default 60 seconds
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🖖 Milestone Push with Timeout Protection"
echo "=========================================="
echo "Timeout: ${TIMEOUT}s"
echo ""

# Run the automated milestone push with timeout
timeout "${TIMEOUT}" node "${SCRIPT_DIR}/automated-milestone-push-with-timeout.js" "$@" || {
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 124 ]; then
    echo ""
    echo "❌ Milestone push timed out after ${TIMEOUT} seconds"
    echo "   This may indicate:"
    echo "   - Network connectivity issues"
    echo "   - Git authentication problems"
    echo "   - Remote repository unavailable"
    echo ""
    echo "💡 Try:"
    echo "   - Check your internet connection"
    echo "   - Verify git credentials"
    echo "   - Increase timeout: MILESTONE_TIMEOUT=120 npm run milestone:push"
    exit 1
  else
    exit $EXIT_CODE
  fi
}

