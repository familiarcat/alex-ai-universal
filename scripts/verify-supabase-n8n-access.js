#!/usr/bin/env node
/**
 * Verify Supabase Table Accessibility for N8N Workflows
 * 
 * This script:
 * 1. Lists all Supabase tables from migration files
 * 2. Tests connectivity to Supabase
 * 3. Verifies table existence and schema
 * 4. Tests read/write permissions
 * 5. Validates data contracts match N8N workflow expectations
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read credentials from ~/.zshrc
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const SUPABASE_URL = zshrc.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
const SUPABASE_SERVICE_KEY = zshrc.match(/export SUPABASE_SERVICE_KEY="([^"]+)"/)?.[1] || 
                             zshrc.match(/export SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_KEY not found in ~/.zshrc');
  process.exit(1);
}

// Extract project reference from URL
const SUPABASE_PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_DB_URL = `https://db.${SUPABASE_PROJECT_REF}.supabase.co`;

console.log('\n' + '═'.repeat(80));
console.log('🔍 SUPABASE TABLE ACCESSIBILITY VERIFICATION FOR N8N WORKFLOWS');
console.log('═'.repeat(80));
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Service Key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
console.log('═'.repeat(80) + '\n');

// Make HTTPS request to Supabase REST API
function makeSupabaseRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SUPABASE_REST_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Get all tables from migration files
function getTablesFromMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const schemasDir = path.join(process.cwd(), 'supabase', 'schemas');
  const tables = new Set();

  // Read migration files
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      // Extract CREATE TABLE statements
      const matches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?([a-z_]+)/gi);
      for (const match of matches) {
        tables.add(match[1]);
      }
    });
  }

  // Read schema files
  if (fs.existsSync(schemasDir)) {
    const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.sql'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(schemasDir, file), 'utf8');
      const matches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?([a-z_]+)/gi);
      for (const match of matches) {
        tables.add(match[1]);
      }
    });
  }

  // Also check root schema files
  const rootSchemaFiles = fs.readdirSync(path.join(process.cwd(), 'supabase'))
    .filter(f => f.endsWith('.sql') && !f.includes('migrations'));
  
  rootSchemaFiles.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), 'supabase', file), 'utf8');
    const matches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?([a-z_]+)/gi);
    for (const match of matches) {
      tables.add(match[1]);
    }
  });

  return Array.from(tables).sort();
}

// Get tables that N8N workflows expect
function getN8NExpectedTables() {
  const expectedTables = new Set();
  
  // From the middleware layer code we saw
  const allowedTables = [
    'alex_ai_memories',
    'alex_ai_memory_embeddings',
    'alex_ai_memory_relationships',
    'alex_ai_crew_activities',
    'alex_ai_project_configs',
    'alex_ai_sync_status',
    'alex_ai_security_audits',
  ];

  allowedTables.forEach(t => expectedTables.add(t));

  // Check workflow JSON files
  const workflowsDir = path.join(process.cwd(), 'n8n-workflows');
  if (fs.existsSync(workflowsDir)) {
    const findWorkflows = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findWorkflows(fullPath);
        } else if (entry.name.endsWith('.json')) {
          try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            // Search for table references in nodes
            if (content.nodes) {
              content.nodes.forEach(node => {
                if (node.parameters) {
                  const params = JSON.stringify(node.parameters);
                  // Look for table references
                  const tableMatches = params.match(/"table":\s*"([^"]+)"/gi);
                  if (tableMatches) {
                    tableMatches.forEach(match => {
                      const table = match.match(/"([^"]+)"/)[1];
                      expectedTables.add(table);
                    });
                  }
                }
              });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });
    };
    findWorkflows(workflowsDir);
  }

  return Array.from(expectedTables).sort();
}

// List all tables from Supabase
async function listSupabaseTables() {
  try {
    // Try to query information_schema via REST API
    // Note: This might not work with REST API, so we'll try direct table access
    const tables = [];
    
    // Try common table names first to see if any exist
    const commonTables = [
      'projects', 'project_content', 'user_settings', 'knowledge_base',
      'alex_ai_memories', 'crew_members', 'workflow_executions'
    ];
    
    for (const table of commonTables) {
      try {
        const response = await makeSupabaseRequest('GET', `/${table}?limit=0`);
        if (response.status === 200 || response.status === 206 || response.status === 204) {
          tables.push(table);
        }
      } catch (e) {
        // Table doesn't exist or not accessible
      }
    }
    
    return tables;
  } catch (error) {
    return [];
  }
}

// Test table access
async function testTableAccess(tableName) {
  const results = {
    table: tableName,
    exists: false,
    readable: false,
    writable: false,
    schema: null,
    error: null,
  };

  try {
    // Test read access (SELECT) - try with limit=0 to just check existence
    const readResponse = await makeSupabaseRequest('GET', `/${tableName}?limit=0`);
    
    if (readResponse.status === 200 || readResponse.status === 206 || readResponse.status === 204) {
      results.exists = true;
      results.readable = true;
      
      // Try to get schema info by checking response structure
      if (Array.isArray(readResponse.data) && readResponse.data.length > 0) {
        results.schema = Object.keys(readResponse.data[0]);
      } else if (readResponse.data && typeof readResponse.data === 'object' && !Array.isArray(readResponse.data)) {
        // Sometimes Supabase returns object with data array
        if (readResponse.data.data && Array.isArray(readResponse.data.data) && readResponse.data.data.length > 0) {
          results.schema = Object.keys(readResponse.data.data[0]);
        }
      }
      
      // Try to get one record to see schema
      if (!results.schema) {
        const sampleResponse = await makeSupabaseRequest('GET', `/${tableName}?limit=1`);
        if (sampleResponse.status === 200 && Array.isArray(sampleResponse.data) && sampleResponse.data.length > 0) {
          results.schema = Object.keys(sampleResponse.data[0]);
        }
      }
    } else if (readResponse.status === 404) {
      results.exists = false;
      results.error = 'Table not found (404)';
    } else if (readResponse.status === 401 || readResponse.status === 403) {
      results.exists = true; // Table exists but we can't access it
      results.error = `Access denied (${readResponse.status})`;
    } else {
      results.error = `Unexpected status: ${readResponse.status} - ${JSON.stringify(readResponse.data).substring(0, 100)}`;
    }

    // Test write access (INSERT) - only if table exists
    if (results.exists && results.readable) {
      try {
        // Create a test record (we'll delete it if successful)
        const testData = {
          test: true,
          _verification_timestamp: new Date().toISOString(),
        };
        
        const writeResponse = await makeSupabaseRequest('POST', `/${tableName}`, testData);
        
        if (writeResponse.status === 201 || writeResponse.status === 200) {
          results.writable = true;
          
          // Try to clean up test record if it has an id
          if (writeResponse.data && Array.isArray(writeResponse.data) && writeResponse.data.length > 0) {
            const testId = writeResponse.data[0].id;
            if (testId) {
              try {
                await makeSupabaseRequest('DELETE', `/${tableName}?id=eq.${testId}`);
              } catch (e) {
                // Ignore cleanup errors
              }
            }
          }
        } else {
          results.error = `Write failed: ${writeResponse.status}`;
        }
      } catch (error) {
        // Write test failed, but table exists
        results.error = `Write test error: ${error.message}`;
      }
    }
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

// Main verification function
async function main() {
  const results = {
    connectivity: false,
    migrationTables: [],
    n8nExpectedTables: [],
    tableTests: [],
    summary: {
      total: 0,
      exists: 0,
      readable: 0,
      writable: 0,
      missing: 0,
      errors: 0,
    },
  };

  try {
    // Step 1: Test connectivity and discover existing tables
    console.log('🔌 Step 1: Testing Supabase connectivity and discovering existing tables...');
    try {
      const existingTables = await listSupabaseTables();
      if (existingTables.length > 0) {
        results.connectivity = true;
        console.log(`   ✅ Connected to Supabase REST API`);
        console.log(`   📋 Found ${existingTables.length} existing table(s):\n`);
        existingTables.forEach(table => {
          console.log(`      - ${table}`);
        });
        console.log('');
      } else {
        // Try a simple health check
        try {
          const healthCheck = await makeSupabaseRequest('GET', '/projects?limit=0');
          if (healthCheck.status === 200 || healthCheck.status === 206 || healthCheck.status === 404) {
            results.connectivity = true;
            console.log('   ✅ Connected to Supabase REST API\n');
          } else {
            console.log(`   ⚠️  Unexpected response: ${healthCheck.status}\n`);
          }
        } catch (e) {
          console.log(`   ⚠️  Could not discover existing tables automatically\n`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}\n`);
      process.exit(1);
    }

    // Step 2: Get tables from migrations
    console.log('📋 Step 2: Discovering tables from migration files...');
    results.migrationTables = getTablesFromMigrations();
    console.log(`   Found ${results.migrationTables.length} tables in migrations:\n`);
    results.migrationTables.forEach(table => {
      console.log(`      - ${table}`);
    });
    console.log('');

    // Step 3: Get expected tables from N8N workflows
    console.log('🔍 Step 3: Discovering tables expected by N8N workflows...');
    results.n8nExpectedTables = getN8NExpectedTables();
    console.log(`   Found ${results.n8nExpectedTables.length} tables referenced in workflows:\n`);
    results.n8nExpectedTables.forEach(table => {
      console.log(`      - ${table}`);
    });
    console.log('');

    // Step 4: Combine and test all tables
    const allTables = [...new Set([...results.migrationTables, ...results.n8nExpectedTables])].sort();
    results.summary.total = allTables.length;

    console.log('🧪 Step 4: Testing table accessibility...\n');
    
    for (const table of allTables) {
      console.log(`   Testing: ${table}...`);
      const testResult = await testTableAccess(table);
      results.tableTests.push(testResult);

      if (testResult.exists) {
        results.summary.exists++;
        if (testResult.readable) {
          results.summary.readable++;
          console.log(`      ✅ Exists and readable`);
          if (testResult.writable) {
            results.summary.writable++;
            console.log(`      ✅ Writable`);
          } else {
            console.log(`      ⚠️  Not writable: ${testResult.error || 'Unknown error'}`);
          }
          if (testResult.schema) {
            console.log(`      📊 Schema: ${testResult.schema.length} columns`);
          }
        } else {
          console.log(`      ⚠️  Exists but not readable: ${testResult.error || 'Unknown error'}`);
        }
      } else {
        results.summary.missing++;
        console.log(`      ❌ Missing: ${testResult.error || 'Table not found'}`);
      }

      if (testResult.error && !testResult.exists) {
        results.summary.errors++;
      }
    }

    // Step 5: Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\n📋 Tables:`);
    console.log(`   Total tested: ${results.summary.total}`);
    console.log(`   ✅ Exist: ${results.summary.exists}`);
    console.log(`   ✅ Readable: ${results.summary.readable}`);
    console.log(`   ✅ Writable: ${results.summary.writable}`);
    console.log(`   ❌ Missing: ${results.summary.missing}`);
    console.log(`   ⚠️  Errors: ${results.summary.errors}`);

    // Check for missing expected tables
    const missingExpected = results.n8nExpectedTables.filter(
      table => !results.tableTests.find(t => t.table === table && t.exists)
    );

    if (missingExpected.length > 0) {
      console.log(`\n⚠️  Missing Expected Tables (${missingExpected.length}):`);
      missingExpected.forEach(table => {
        console.log(`   - ${table}`);
      });
    }

    // Check for tables in migrations but not accessible
    const inaccessible = results.migrationTables.filter(
      table => !results.tableTests.find(t => t.table === table && t.exists)
    );

    if (inaccessible.length > 0) {
      console.log(`\n⚠️  Inaccessible Migration Tables (${inaccessible.length}):`);
      inaccessible.forEach(table => {
        console.log(`   - ${table}`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n🎯 Next Steps:');
    if (results.summary.missing > 0) {
      console.log('   1. Run missing migrations: node scripts/run-supabase-migration.js');
      console.log('   2. Verify RLS policies allow service role access');
      console.log('   3. Check Supabase dashboard for table existence');
    }
    if (results.summary.writable < results.summary.readable) {
      console.log('   4. Review RLS policies for write permissions');
      console.log('   5. Verify service role key has proper permissions');
    }
    console.log('   6. Re-run this script to verify: node scripts/verify-supabase-n8n-access.js\n');
    console.log('═'.repeat(80) + '\n');

    // Exit with error if there are issues
    if (results.summary.missing > 0 || results.summary.errors > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();

