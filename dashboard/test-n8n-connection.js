// test-n8n-connection.js
const https = require('https');
const http = require('http');

async function testN8nConnection() {
  console.log('🔍 Testing N8N Connection...');
  
  const N8N_URL = 'https://n8n.pbradygeorgen.com';
  const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA';
  
  console.log(`📍 N8N URL: ${N8N_URL}`);
  console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 20)}...`);
  
  try {
    // Test health endpoint
    console.log('\n🏥 Testing health endpoint...');
    const healthResponse = await makeRequest('GET', `${N8N_URL}/healthz`);
    console.log('✅ Health check passed:', healthResponse.statusCode);
    
    // Test API with authentication
    console.log('\n🔐 Testing authenticated API...');
    const apiResponse = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: {
        'Authorization': `Bearer ${N8N_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API authentication successful:', apiResponse.status);
    console.log(`📊 Found ${apiResponse.data.data?.length || 0} workflows`);
    
    // Test webhook endpoints
    console.log('\n🔗 Testing crew webhook endpoints...');
    const crewMembers = ['Picard', 'Data', 'Geordi', 'Worf', 'Troi', 'Riker', 'Crusher', 'La Forge', 'Spock'];
    
    for (const member of crewMembers) {
      try {
        const webhookUrl = `${N8N_URL}/webhook/${member.toLowerCase()}-agent`;
        const webhookResponse = await axios.post(webhookUrl, {
          test: true,
          crewMember: member,
          timestamp: new Date().toISOString()
        }, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ ${member} webhook: ${webhookResponse.status}`);
      } catch (error) {
        console.log(`❌ ${member} webhook: ${error.response?.status || 'Failed'}`);
      }
    }
    
    console.log('\n🎉 N8N connection test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ N8N connection test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    return false;
  }
}

testN8nConnection();
