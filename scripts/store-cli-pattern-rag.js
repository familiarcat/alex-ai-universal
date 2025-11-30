#!/usr/bin/env node
/**
 * Store CLI Update Pattern in RAG
 * 
 * Stores CLI management patterns for crew learning
 */

const fs = require('fs');

async function storePattern() {
  const pattern = {
    content: `CLI Update Pattern: Supabase CLI Management

Update Strategy:
- SYSTEMIC FAILURE: Auto-update immediately if script fails due to missing CLI features
  Example: supabase db push fails because CLI version too old (v2.33.9 missing db query feature)
  Action: brew upgrade supabase/tap/supabase automatically
  
- VERSION WARNING: Warn if CLI is outdated but still functional
  Example: "New version available: v2.62.10 (currently v2.33.9)"
  Action: Display warning but continue execution
  
- RAG MEMORY: Store all CLI update decisions for pattern recognition
  Pattern: Test required features before use, auto-update if missing, warn if outdated

Implementation:
- scripts/cli-version-checker.js: Centralized CLI management
- All automation scripts check CLI before use
- Auto-update on systemic failure, warn on version mismatch
- Store patterns in RAG via n8n webhook

CLI Update History:
- 2025-11-27: Supabase CLI attempted update from v2.33.9 → v2.62.10
  Blocked by: Outdated Command Line Tools (Xcode 26.0 required)
  Workaround: Migration executed via supabase db push (works with v2.33.9)
  Pattern: CLI version may be outdated but features still work - test before updating

Best Practices:
1. Always test required features, not just version numbers
2. Auto-update only on systemic failure (missing features)
3. Warn on version mismatch but continue if features work
4. Store all decisions in RAG for pattern recognition
5. Document CLI update patterns for crew learning`,
    metadata: {
      category: 'automation',
      type: 'cli-management',
      crew_member: 'La Forge',
      pattern_type: 'systemic_failure_auto_update',
      cli_name: 'supabase',
      version_range: '2.33.9 → 2.62.10'
    },
    summary: 'CLI update pattern: auto-update on missing features, warn on version mismatch, store in RAG'
  };

  // Try to store via n8n
  const n8nUrl = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
  
  try {
    const response = await fetch(`${n8nUrl}/webhook/knowledge-ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pattern),
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      console.log('✅ CLI update pattern stored in RAG');
      return true;
    } else {
      console.log('⚠️  RAG storage returned:', response.status);
      // Fallback: save locally
      fs.writeFileSync('reports/cli-update-pattern.json', JSON.stringify(pattern, null, 2));
      console.log('   Pattern saved locally: reports/cli-update-pattern.json');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Could not store in RAG (non-blocking):', error.message);
    // Fallback: save locally
    fs.writeFileSync('reports/cli-update-pattern.json', JSON.stringify(pattern, null, 2));
    console.log('   Pattern saved locally: reports/cli-update-pattern.json');
    return false;
  }
}

storePattern().then(success => {
  process.exit(success ? 0 : 0); // Always exit 0 - non-blocking
});

