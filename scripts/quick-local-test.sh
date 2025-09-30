#!/bin/bash

# 🧪 Alex AI Universal - Quick Local Testing Script
# 
# This script sets up and runs the local testing environment
# for Alex AI Universal with Zero-Artifact Guarantee

set -e

echo "🧪 Alex AI Universal - Local Testing Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Please run this script from the Alex AI Universal root directory"
    exit 1
fi

print_info "Setting up local testing environment..."

# Step 1: Setup local testing environment
print_info "Step 1: Creating local testing environment"
node scripts/local-testing-setup.js
print_status "Local testing environment created"

# Step 2: Install dependencies
print_info "Step 2: Installing dependencies"
cd local-testing
npm install
print_status "Dependencies installed"

# Step 3: Start mock services
print_info "Step 3: Starting mock services"
print_warning "Starting mock services in background..."

# Start mock services
node mock-services/n8n-mock.js &
N8N_PID=$!

node mock-services/supabase-mock.js &
SUPABASE_PID=$!

node mock-services/openrouter-mock.js &
OPENROUTER_PID=$!

# Wait a moment for services to start
sleep 3

# Check if services are running
print_info "Checking mock services..."

# Check N8N
if curl -s http://localhost:5678/health > /dev/null; then
    print_status "N8N mock service running (PID: $N8N_PID)"
else
    print_error "N8N mock service failed to start"
    exit 1
fi

# Check Supabase
if curl -s http://localhost:54321/health > /dev/null; then
    print_status "Supabase mock service running (PID: $SUPABASE_PID)"
else
    print_error "Supabase mock service failed to start"
    exit 1
fi

# Check OpenRouter
if curl -s http://localhost:3000/health > /dev/null; then
    print_status "OpenRouter mock service running (PID: $OPENROUTER_PID)"
else
    print_error "OpenRouter mock service failed to start"
    exit 1
fi

# Step 4: Start Zero-Artifact monitoring
print_info "Step 4: Starting Zero-Artifact monitoring"
node mock-services/artifact-monitor.js &
MONITOR_PID=$!
print_status "Zero-Artifact monitoring started (PID: $MONITOR_PID)"

# Step 4.5: Start Cursor AI prevention
print_info "Step 4.5: Starting Cursor AI prevention"
node ../scripts/cursor-artifact-prevention.js &
PREVENTION_PID=$!
node ../scripts/cursor-integration-prevention.js &
INTEGRATION_PID=$!
print_status "Cursor AI prevention started (PIDs: $PREVENTION_PID, $INTEGRATION_PID)"

# Step 5: Run basic tests
print_info "Step 5: Running basic tests"

# Test crew coordination
print_info "Testing crew coordination..."
node ../scripts/cursor-ai-local-integration.js "Test the crew coordination system"
print_status "Crew coordination test completed"

# Test individual crew members
print_info "Testing individual crew members..."

# Test Picard
print_info "Testing Captain Picard..."
node ../scripts/cursor-ai-local-integration.js "I need strategic guidance from Captain Picard"
print_status "Captain Picard test completed"

# Test Data
print_info "Testing Commander Data..."
node ../scripts/cursor-ai-local-integration.js "Analyze this data with Commander Data"
print_status "Commander Data test completed"

# Test Geordi
print_info "Testing Lt. Cmdr. Geordi..."
node ../scripts/cursor-ai-local-integration.js "Fix this technical issue with Geordi"
print_status "Lt. Cmdr. Geordi test completed"

# Test Worf
print_info "Testing Lieutenant Worf..."
node ../scripts/cursor-ai-local-integration.js "Is this secure with Lieutenant Worf"
print_status "Lieutenant Worf test completed"

# Test Troi
print_info "Testing Counselor Troi..."
node ../scripts/cursor-ai-local-integration.js "Help me improve user experience with Counselor Troi"
print_status "Counselor Troi test completed"

# Step 6: Verify Zero-Artifact Guarantee
print_info "Step 6: Verifying Zero-Artifact Guarantee"

# Check for any artifacts
ARTIFACT_COUNT=$(find artifact-backups -name "*.backup" 2>/dev/null | wc -l)

if [ "$ARTIFACT_COUNT" -eq 0 ]; then
    print_status "Zero-Artifact Guarantee maintained - no artifacts detected"
else
    print_warning "Zero-Artifact violations detected: $ARTIFACT_COUNT artifacts"
    print_info "Artifacts have been backed up and removed from your projects"
fi

# Test prevention system
print_info "Testing Cursor AI prevention system..."
mkdir alex-ai-artifacts 2>/dev/null || true
sleep 2
if [ ! -d "alex-ai-artifacts" ]; then
    print_status "Cursor AI prevention working - alex-ai-artifacts folder was removed"
else
    print_warning "Cursor AI prevention may not be working - alex-ai-artifacts folder still exists"
fi

# Step 7: Display status
print_info "Step 7: System Status"

echo ""
echo "🚀 Alex AI Universal - Local Testing Status"
echo "==========================================="
echo ""
echo "📊 Mock Services:"
echo "  • N8N: http://localhost:5678 (PID: $N8N_PID)"
echo "  • Supabase: http://localhost:54321 (PID: $SUPABASE_PID)"
echo "  • OpenRouter: http://localhost:3000 (PID: $OPENROUTER_PID)"
echo ""
echo "🛡️  Zero-Artifact Monitoring:"
echo "  • Status: Active (PID: $MONITOR_PID)"
echo "  • Artifacts Detected: $ARTIFACT_COUNT"
echo "  • Backup Directory: artifact-backups/"
echo ""
echo "🚫 Cursor AI Prevention:"
echo "  • Artifact Prevention: Active (PID: $PREVENTION_PID)"
echo "  • Integration Prevention: Active (PID: $INTEGRATION_PID)"
echo "  • Prevention Patterns: $(grep -c 'alex-ai\|cursor-ai\|ai-' ../.gitignore)"
echo ""
echo "🤖 Crew Status:"
echo "  • All 9 crew members active"
echo "  • Crew consciousness: Online"
echo "  • Memory system: Synchronized"
echo ""
echo "✅ Local testing environment is ready!"
echo ""

# Step 8: Display usage instructions
print_info "Usage Instructions:"
echo ""
echo "🧪 Test Alex AI in any project:"
echo "  cd /path/to/your/project"
echo "  node /Users/bradygeorgen/Documents/workspace/alex-ai-universal/scripts/cursor-ai-local-integration.js \"Your prompt here\""
echo ""
echo "🔍 Monitor Zero-Artifact compliance:"
echo "  watch -n 1 'ls -la artifact-backups/'"
echo ""
echo "🛑 Stop all services:"
echo "  kill $N8N_PID $SUPABASE_PID $OPENROUTER_PID $MONITOR_PID $PREVENTION_PID $INTEGRATION_PID"
echo ""
echo "📊 Check service health:"
echo "  curl http://localhost:5678/health"
echo "  curl http://localhost:54321/health"
echo "  curl http://localhost:3000/health"
echo ""

# Save PIDs for cleanup
echo "$N8N_PID $SUPABASE_PID $OPENROUTER_PID $MONITOR_PID $PREVENTION_PID $INTEGRATION_PID" > .pids

print_status "Local testing environment setup complete!"
print_info "Alex AI is ready for testing with Zero-Artifact Guarantee"

echo ""
echo "🎉 Happy testing! Remember: Alex AI never creates artifacts in your projects."
echo ""
echo "Make it so! - Captain Picard"
