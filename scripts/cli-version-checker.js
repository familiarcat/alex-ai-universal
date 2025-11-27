#!/usr/bin/env node
/**
 * CLI Version Checker and Auto-Updater
 * 
 * Checks for outdated CLIs and updates them if needed
 * 
 * Update Strategy:
 * - SYSTEMIC FAILURE: Auto-update if script fails due to missing CLI features
 * - VERSION WARNING: Warn if CLI is outdated but still functional
 * - RAG MEMORY: Store all CLI update patterns in RAG for future reference
 * 
 * Crew: La Forge (Infrastructure) + Data (Pattern Recognition)
 */

const { execSync } = require('child_process');
const fs = require('fs');

const CLI_CONFIGS = {
  supabase: {
    checkCommand: 'supabase --version',
    updateCommand: 'brew upgrade supabase/tap/supabase',
    installCommand: 'brew install supabase/tap/supabase',
    versionPattern: /(\d+\.\d+\.\d+)/,
    criticalFeatures: ['db push', 'db query', 'db execute'], // Features that must work
    name: 'Supabase CLI'
  },
  // Add more CLIs as needed
  // terraform: { ... },
  // docker: { ... },
};

/**
 * Check if CLI is installed and get version
 */
function checkCLIVersion(cliName) {
  const config = CLI_CONFIGS[cliName];
  if (!config) {
    return { installed: false, error: 'Unknown CLI' };
  }

  try {
    const output = execSync(config.checkCommand, { encoding: 'utf8', stdio: 'pipe' });
    const versionMatch = output.match(config.versionPattern);
    const version = versionMatch ? versionMatch[1] : 'unknown';
    return { installed: true, version, output };
  } catch (error) {
    return { installed: false, error: error.message };
  }
}

/**
 * Update CLI if needed
 */
function updateCLI(cliName, reason = 'systemic_failure') {
  const config = CLI_CONFIGS[cliName];
  if (!config) {
    throw new Error(`Unknown CLI: ${cliName}`);
  }

  console.log(`🔄 Updating ${config.name}...`);
  
  try {
    if (reason === 'systemic_failure') {
      // Auto-update for systemic failures
      console.log(`   Reason: Systemic failure - updating automatically`);
      execSync(config.updateCommand, { stdio: 'inherit' });
    } else {
      // Warn for version updates
      console.log(`   Reason: Version update recommended`);
      console.log(`   Run: ${config.updateCommand}`);
    }
    
    // Verify update
    const check = checkCLIVersion(cliName);
    if (check.installed) {
      console.log(`✅ ${config.name} updated to version ${check.version}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to update ${config.name}:`, error.message);
    return false;
  }
}

/**
 * Check and handle CLI version
 */
function ensureCLIVersion(cliName, requiredFeatures = []) {
  const config = CLI_CONFIGS[cliName];
  if (!config) {
    throw new Error(`Unknown CLI: ${cliName}`);
  }

  const check = checkCLIVersion(cliName);
  
  if (!check.installed) {
    console.log(`⚠️  ${config.name} not installed`);
    console.log(`   Installing...`);
    try {
      execSync(config.installCommand, { stdio: 'inherit' });
      const verify = checkCLIVersion(cliName);
      if (verify.installed) {
        console.log(`✅ ${config.name} installed: ${verify.version}`);
        return { success: true, action: 'installed', version: verify.version };
      }
    } catch (error) {
      console.error(`❌ Failed to install ${config.name}:`, error.message);
      return { success: false, action: 'install_failed', error: error.message };
    }
  }

  // Check if required features work
  if (requiredFeatures.length > 0) {
    for (const feature of requiredFeatures) {
      try {
        // Test feature availability
        execSync(`supabase ${feature} --help`, { encoding: 'utf8', stdio: 'pipe', timeout: 5000 });
      } catch (error) {
        // Feature doesn't work - systemic failure
        console.log(`⚠️  Feature '${feature}' not available - updating CLI...`);
        const updated = updateCLI(cliName, 'systemic_failure');
        if (updated) {
          return { success: true, action: 'updated_systemic', version: checkCLIVersion(cliName).version };
        }
        return { success: false, action: 'update_failed', error: `Feature ${feature} unavailable` };
      }
    }
  }

  // Check for version warnings (non-critical)
  const versionWarning = checkVersionWarning(cliName, check.version);
  if (versionWarning) {
    console.log(`⚠️  ${versionWarning}`);
    return { success: true, action: 'version_warning', version: check.version, warning: versionWarning };
  }

  return { success: true, action: 'ok', version: check.version };
}

/**
 * Check if version needs warning (non-critical updates)
 */
function checkVersionWarning(cliName, currentVersion) {
  // This would check against latest version from API or package manager
  // For now, we'll rely on CLI's own version warnings
  return null; // Implement version comparison if needed
}

/**
 * Store CLI update pattern in RAG
 */
async function storeCLIUpdatePattern(cliName, action, reason, version) {
  const pattern = {
    cli: cliName,
    action,
    reason,
    version,
    timestamp: new Date().toISOString(),
    pattern: {
      systemic_failure: 'Auto-update CLI if script fails due to missing features',
      version_warning: 'Warn if CLI is outdated but still functional',
      install: 'Install CLI if not present'
    }
  };

  // Store in RAG via n8n
  try {
    const n8nUrl = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
    const response = await fetch(`${n8nUrl}/webhook/knowledge-ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `CLI Update Pattern: ${cliName} - ${action} - ${reason}`,
        metadata: {
          category: 'automation',
          type: 'cli-management',
          pattern: pattern.pattern,
          crew_member: 'La Forge'
        },
        summary: `Automated ${action} for ${cliName} CLI (${version}) due to ${reason}`
      })
    });

    if (response.ok) {
      console.log(`✅ CLI update pattern stored in RAG`);
    }
  } catch (error) {
    // Non-blocking - RAG storage failure doesn't break the script
    console.log(`⚠️  Could not store in RAG (non-blocking):`, error.message);
  }
}

// Main execution
if (require.main === module) {
  const cliName = process.argv[2] || 'supabase';
  const reason = process.argv[3] || 'systemic_failure';
  
  console.log(`🔍 Checking ${CLI_CONFIGS[cliName]?.name || cliName}...\n`);
  
  const result = ensureCLIVersion(cliName, CLI_CONFIGS[cliName]?.criticalFeatures || []);
  
  if (result.success) {
    console.log(`\n✅ ${CLI_CONFIGS[cliName]?.name || cliName} ready: ${result.version}`);
    
    // Store pattern in RAG
    storeCLIUpdatePattern(cliName, result.action, reason, result.version).catch(() => {});
  } else {
    console.log(`\n❌ ${CLI_CONFIGS[cliName]?.name || cliName} check failed`);
    process.exit(1);
  }
}

module.exports = { checkCLIVersion, updateCLI, ensureCLIVersion, storeCLIUpdatePattern };

