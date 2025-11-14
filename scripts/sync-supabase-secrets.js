'use strict';

/**
 * Push Supabase secrets from ~/.zshrc into AWS SSM Parameter Store.
 *
 * Relies on the AWS CLI being configured with credentials that can write to
 * the desired namespace (default: /alex-ai/supabase/*).
 *
 * Examples:
 *   node scripts/sync-supabase-secrets.js            # live push
 *   node scripts/sync-supabase-secrets.js --dry-run # show intended commands
 */

const { spawnSync } = require('child_process');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const DRY_RUN = process.argv.includes('--dry-run');
const namespace = process.env.ALEX_AI_PARAMETER_NAMESPACE || '/alex-ai/supabase';

function discoverSecrets() {
  const env = process.env;
  const { supabase } = loadCrewCredentials();

  const entries = [
    ['SUPABASE_URL', env.SUPABASE_URL || supabase.url],
    ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY || supabase.serviceKey],
    ['SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY],
    ['SUPABASE_API_KEY', env.SUPABASE_API_KEY],
    ['OPENAI_API_KEY', env.OPENAI_API_KEY],
  ];

  return entries.filter(([, value]) => Boolean(value));
}

function putParameter(name, value) {
  const parameterName = `${namespace}/${name.toLowerCase().replace(/_/g, '-')}`;
  const args = [
    'ssm',
    'put-parameter',
    '--name',
    parameterName,
    '--type',
    'SecureString',
    '--value',
    value,
    '--overwrite',
  ];

  if (DRY_RUN) {
    console.log(`[dry-run] aws ${args.join(' ')}`);
    return;
  }

  const result = spawnSync('aws', args, { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    const message = result.error ? result.error.message : `exit code ${result.status}`;
    throw new Error(`Failed to push ${parameterName}: ${message}`);
  }
}

function main() {
  const secrets = discoverSecrets();

  if (secrets.length === 0) {
    console.error('No Supabase secrets discovered; aborting.');
    process.exit(1);
  }

  secrets.forEach(([name, value]) => {
    putParameter(name, value);
  });

  console.log(
    DRY_RUN
      ? 'Dry run complete. Inspect commands above before executing without --dry-run.'
      : 'Supabase secrets synced to AWS Parameter Store.',
  );
}

main();

