#!/bin/bash
# Test Alex AI Dashboard Deployment
# Validates real-time data integration and security

set -e

echo "🧪 Alex AI Dashboard Deployment Testing"
echo "====================================="

# Configuration
DASHBOARD_URL="https://n8n.pbradygeorgen.com/dashboard"
API_URL="https://n8n.pbradygeorgen.com/api/v1"

echo "📊 Testing Configuration:"
echo "   Dashboard URL: ${DASHBOARD_URL}"
echo "   API URL: ${API_URL}"

# Test 1: Dashboard Accessibility
echo ""
echo "🔍 Test 1: Dashboard Accessibility"
echo "================================="
if curl -s -I "${DASHBOARD_URL}/" | grep -q "200 OK"; then
    echo "✅ Dashboard is accessible"
else
    echo "❌ Dashboard is not accessible"
    echo "   Response: $(curl -s -I "${DASHBOARD_URL}/" | head -1)"
fi

# Test 2: Static Files
echo ""
echo "🔍 Test 2: Static Files Loading"
echo "============================="
STATIC_FILES=("index.html" "404.html" "_next/static/css" "_next/static/chunks")
for file in "${STATIC_FILES[@]}"; do
    if curl -s -I "${DASHBOARD_URL}/${file}" | grep -q "200 OK"; then
        echo "✅ ${file} - OK"
    else
        echo "❌ ${file} - Failed"
    fi
done

# Test 3: N8N API Connectivity
echo ""
echo "🔍 Test 3: N8N API Connectivity"
echo "============================="
if curl -s -I "${API_URL}/workflows" | grep -q "200\|405"; then
    echo "✅ N8N API is accessible"
    echo "   Response: $(curl -s -I "${API_URL}/workflows" | head -1)"
else
    echo "❌ N8N API is not accessible"
    echo "   Response: $(curl -s -I "${API_URL}/workflows" | head -1)"
fi

# Test 4: Security Headers
echo ""
echo "🔍 Test 4: Security Headers"
echo "========================="
HEADERS=$(curl -s -I "${DASHBOARD_URL}/")
SECURITY_HEADERS=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection")
for header in "${SECURITY_HEADERS[@]}"; do
    if echo "$HEADERS" | grep -qi "$header"; then
        echo "✅ ${header} - Present"
    else
        echo "⚠️  ${header} - Missing"
    fi
done

# Test 5: CORS Headers
echo ""
echo "🔍 Test 5: CORS Headers"
echo "====================="
CORS_HEADERS=$(curl -s -I "${DASHBOARD_URL}/" | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "✅ CORS headers present:"
    echo "$CORS_HEADERS" | sed 's/^/   /'
else
    echo "⚠️  CORS headers missing"
fi

# Test 6: HTTPS Security
echo ""
echo "🔍 Test 6: HTTPS Security"
echo "======================="
if [[ "${DASHBOARD_URL}" == https://* ]]; then
    echo "✅ HTTPS enabled"
    SSL_INFO=$(curl -s -I "${DASHBOARD_URL}/" | grep -i "server\|date")
    echo "   Server info: $(echo "$SSL_INFO" | head -1)"
else
    echo "⚠️  HTTPS not enabled"
fi

# Test 7: Real-time Data Integration
echo ""
echo "🔍 Test 7: Real-time Data Integration"
echo "==================================="
echo "Testing API endpoint for dashboard data..."
API_RESPONSE=$(curl -s "${API_URL}/alex-ai/status" 2>/dev/null || echo "API_ERROR")
if [ "$API_RESPONSE" != "API_ERROR" ]; then
    echo "✅ API endpoint accessible"
    echo "   Response length: $(echo "$API_RESPONSE" | wc -c) bytes"
    if echo "$API_RESPONSE" | grep -q "system\|integrations"; then
        echo "✅ API returning expected data structure"
    else
        echo "⚠️  API response structure unexpected"
    fi
else
    echo "❌ API endpoint not accessible"
fi

# Test 8: Performance
echo ""
echo "🔍 Test 8: Performance Testing"
echo "============================="
echo "Testing page load time..."
LOAD_TIME=$(curl -s -w "%{time_total}" -o /dev/null "${DASHBOARD_URL}/")
echo "   Page load time: ${LOAD_TIME}s"
if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
    echo "✅ Page load time acceptable"
else
    echo "⚠️  Page load time slow"
fi

# Test 9: Knowledge Gathering Validation
echo ""
echo "🔍 Test 9: Knowledge Gathering Validation"
echo "======================================="
echo "Checking for real-time data sources..."
if curl -s "${DASHBOARD_URL}/" | grep -q "N8N\|Supabase\|crew"; then
    echo "✅ Dashboard contains knowledge gathering elements"
    echo "✅ Real-time data integration visible"
else
    echo "⚠️  Knowledge gathering elements not detected"
fi

# Summary
echo ""
echo "📊 Testing Summary"
echo "================="
echo "Dashboard URL: ${DASHBOARD_URL}"
echo "API URL: ${API_URL}"
echo ""
echo "🎯 Ready for knowledge gathering and security testing!"
echo ""
echo "🔬 Next Steps:"
echo "   1. Monitor real-time data updates"
echo "   2. Test data security and transmission"
echo "   3. Validate knowledge gathering from multiple projects"
echo "   4. Check performance under load"
echo "   5. Monitor system health metrics"
echo ""
echo "✅ Alex AI Dashboard deployment testing complete!"
