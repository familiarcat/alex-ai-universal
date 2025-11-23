#!/usr/bin/env bash

##############################################################################
# Get OpenRouter API Key Helper
# 
# Guides you through getting an OpenRouter API key and adding it to ~/.zshrc
# Can also use Provisioning API to automate key creation
# 
# Crew: Chief O'Brien ("Let's just get the damn key and finish this")
##############################################################################

echo "🔑 Get OpenRouter API Key"
echo "================================="
echo ""

# Check if we have a provisioning key for automation
PROVISIONING_KEY=$(grep "export OPENROUTER_PROVISIONING_KEY" "$HOME/.zshrc" 2>/dev/null | cut -d'"' -f2 | head -1 | tr -d ' ')

if [ -n "$PROVISIONING_KEY" ]; then
  echo "✅ Found OPENROUTER_PROVISIONING_KEY in ~/.zshrc"
  echo ""
  echo "🤖 Attempting automated key creation..."
  echo ""
  
  # Try to create/get key via Provisioning API
  node -e "
    const https = require('https');
    const key = '$PROVISIONING_KEY';
    
    // First, list existing keys
    const listReq = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/keys',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const keys = JSON.parse(data);
          if (keys.data && keys.data.length > 0) {
            const latest = keys.data[0];
            console.log('✅ Found existing API key:');
            console.log('   Name: ' + (latest.name || 'Unnamed'));
            console.log('   Key: ' + latest.id);
            console.log('');
            console.log('💡 Add to ~/.zshrc:');
            console.log('   export OPENROUTER_API_KEY=\"' + latest.id + '\"');
            process.exit(0);
          } else {
            // Create new key
            const createReq = https.request({
              hostname: 'openrouter.ai',
              path: '/api/v1/keys',
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json'
              }
            }, (createRes) => {
              let createData = '';
              createRes.on('data', c => createData += c);
              createRes.on('end', () => {
                if (createRes.statusCode === 200 || createRes.statusCode === 201) {
                  const newKey = JSON.parse(createData);
                  console.log('✅ Created new API key:');
                  console.log('   Key: ' + newKey.id);
                  console.log('');
                  console.log('💡 Add to ~/.zshrc:');
                  console.log('   export OPENROUTER_API_KEY=\"' + newKey.id + '\"');
                } else {
                  console.log('⚠️  Could not create key automatically');
                  console.log('   Status: ' + createRes.statusCode);
                  console.log('   Response: ' + createData.substring(0, 200));
                  process.exit(1);
                }
              });
            });
            createReq.on('error', () => process.exit(1));
            createReq.write(JSON.stringify({ name: 'Alex AI - Auto-generated' }));
            createReq.end();
          }
        } else {
          console.log('⚠️  Provisioning key may be invalid');
          console.log('   Status: ' + res.statusCode);
          process.exit(1);
        }
      });
    });
    listReq.on('error', () => process.exit(1));
    listReq.end();
  " 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Automated key retrieval successful!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Copy the key shown above"
    echo "   2. Add to ~/.zshrc: export OPENROUTER_API_KEY=\"...\""
    echo "   3. Run: source ~/.zshrc"
    echo "   4. Verify: node scripts/verify-openrouter-key.js"
    exit 0
  else
    echo "⚠️  Automated retrieval failed, falling back to manual process..."
    echo ""
  fi
fi

# Manual process
echo "📋 MANUAL STEPS TO GET API KEY:"
echo ""
echo "1. Opening OpenRouter Keys page in browser..."
echo "   URL: https://openrouter.ai/keys"
echo ""

# Open in browser
open "https://openrouter.ai/keys" 2>/dev/null || xdg-open "https://openrouter.ai/keys" 2>/dev/null || echo "Please open: https://openrouter.ai/keys"

sleep 1

echo "2. On the page:"
echo "   - If you have an existing key: Click 'Show' to reveal it"
echo "   - If you need a new key: Click 'Create Key' button"
echo ""
echo "3. Copy the API key (starts with sk-or-v1-...)"
echo ""
echo "4. Add to ~/.zshrc:"
echo ""
echo "   export OPENROUTER_API_KEY=\"paste-key-here\""
echo ""
echo "5. Save ~/.zshrc and run:"
echo "   source ~/.zshrc"
echo ""
echo "6. Verify the key works:"
echo "   node scripts/verify-openrouter-key.js"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 OPTIONAL: Enable Automated Key Management"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To enable automated key creation/rotation:"
echo ""
echo "1. Visit: https://openrouter.ai/docs/features/provisioning-api-keys"
echo "2. Create a Provisioning API Key (separate from regular API key)"
echo "3. Add to ~/.zshrc:"
echo "   export OPENROUTER_PROVISIONING_KEY=\"provisioning-key-here\""
echo "4. Run this script again - it will automatically create/manage keys"
echo ""
echo "⏱️  Total time: 2 minutes"
echo ""
echo "🖖 Standing by for your API key..."

