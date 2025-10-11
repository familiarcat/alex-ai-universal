#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Alex AI N8N & Supabase Integration...\n');

let fixCount = 0;

// 1. Update UNIVERSAL_INTEGRATION_DEMO.js
try {
  const demoPath = './UNIVERSAL_INTEGRATION_DEMO.js';
  let demoContent = fs.readFileSync(demoPath, 'utf8');
  
  const originalContent = demoContent;
  
  // Fix crew members array
  demoContent = demoContent.replace(
    /members: \[\s*'Captain Picard',\s*'Commander Data',\s*'Commander La Forge',\s*'Lieutenant Commander Worf',\s*'Counselor Troi',\s*'Quark'\s*\]/,
    `members: [
          'Captain Picard',
          'Commander Riker',
          'Commander Data',
          'Commander La Forge',
          'Lieutenant Worf',
          'Counselor Troi',
          'Dr. Crusher',
          'Lieutenant Uhura',
          'Quark'
        ]`
  );
  
  // Fix knowledge base
  demoContent = demoContent.replace(
    /knowledgeBase: \[[^\]]+\]/,
    `knowledgeBase: [
          'strategic-planning',
          'tactical-execution',
          'technical-architecture',
          'engineering-optimization',
          'security-protocols',
          'user-experience-design',
          'system-health-diagnostics',
          'communications-integration',
          'cost-efficiency-analysis'
        ]`
  );
  
  if (demoContent !== originalContent) {
    fs.writeFileSync(demoPath, demoContent);
    console.log('✅ Fixed crew members (6 → 9) in UNIVERSAL_INTEGRATION_DEMO.js');
    fixCount++;
  }
} catch (error) {
  console.log('⚠️  Could not update UNIVERSAL_INTEGRATION_DEMO.js:', error.message);
}

// 2. Update demo index.js
try {
  const indexPath = './examples/demo-project/index.js';
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  const originalIndex = indexContent;
  
  // Fix database recommendation
  indexContent = indexContent.replace(
    /database:\s*['"]PostgreSQL \+ Redis['"]/g,
    `database: 'Supabase (PostgreSQL + pgvector) + Redis'`
  );
  
  // Add storage and RAG if not present
  if (!indexContent.includes('storage:')) {
    indexContent = indexContent.replace(
      /(database: '[^']+'),/,
      `$1,\n    storage: 'Supabase Storage',\n    rag: 'Supabase Vector Store (pgvector)',\n    workflows: 'n8n.pbradygeorgen.com',`
    );
  }
  
  if (indexContent !== originalIndex) {
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Fixed database recommendation to Supabase in demo/index.js');
    fixCount++;
  }
} catch (error) {
  console.log('⚠️  Could not update demo/index.js:', error.message);
}

// 3. Create .env template if missing
if (!fs.existsSync('.env')) {
  const envTemplate = `# Supabase Configuration (UPDATE WITH YOUR CREDENTIALS)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# N8N Configuration
N8N_WEBHOOK_URL=https://n8n.pbradygeorgen.com/webhook
N8N_API_URL=https://n8n.pbradygeorgen.com/api/v1
N8N_API_KEY=your-n8n-api-key

# Crew Configuration
CREW_ENABLED=true
CREW_MEMBER_COUNT=9

# Feature Flags
USE_LIVE_N8N=true
USE_LIVE_SUPABASE=true
`;
  fs.writeFileSync('.env', envTemplate);
  console.log('✅ Created .env template');
  console.log('   📝 IMPORTANT: Update .env with your actual credentials!');
  fixCount++;
} else {
  console.log('ℹ️  .env already exists (not overwriting)');
}

// 4. Create .env.example for reference
const envExample = `# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# N8N Configuration
N8N_WEBHOOK_URL=https://n8n.pbradygeorgen.com/webhook
N8N_API_URL=https://n8n.pbradygeorgen.com/api/v1
N8N_API_KEY=your-n8n-api-key

# Crew Configuration
CREW_MEMBER_COUNT=9
`;
fs.writeFileSync('.env.example', envExample);
console.log('✅ Created .env.example for reference');

console.log('\n' + '='.repeat(60));
console.log('🎉 Integration fix complete!');
console.log('='.repeat(60));
console.log(`\n📊 Fixes applied: ${fixCount}`);
console.log('\n📋 Next steps:\n');
console.log('1. 🔑 Update .env with your Supabase and N8N credentials');
console.log('2. 🧪 Test: npm run demo');
console.log('3. ✅ Verify:');
console.log('   - All 9 crew members appear');
console.log('   - Database shows "Supabase" not "PostgreSQL"');
console.log('   - N8N workflows reference n8n.pbradygeorgen.com');
console.log('\n4. 🔗 Get credentials:');
console.log('   - Supabase: https://supabase.com/dashboard → Your Project → Settings → API');
console.log('   - N8N: https://n8n.pbradygeorgen.com → Settings → API\n');

