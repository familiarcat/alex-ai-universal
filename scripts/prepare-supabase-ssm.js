'use strict';

/**
 * Helper script to surface Supabase secrets from the local ~/.zshrc.
 *
 * Usage:
 *   node scripts/prepare-supabase-ssm.js
 *
 * This prints a JSON payload with the discovered values and suggested
 * AWS SSM Parameter Store commands so they can be promoted into the
 * n8n production environment without copying secrets by hand.
 */

const { loadCrewCredentials } = require('./utils/load-crew-credentials');

function main() {
  const supabaseEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'SUPABASE_API_KEY',
  ];

  const resolved = {};

  supabaseEnvVars.forEach((name) => {
    if (process.env[name]) {
      resolved[name] = process.env[name];
    }
  });

  const { supabase } = loadCrewCredentials();
  if (!resolved.SUPABASE_URL && supabase.url) resolved.SUPABASE_URL = supabase.url;
  if (!resolved.SUPABASE_SERVICE_ROLE_KEY && supabase.serviceKey) {
    resolved.SUPABASE_SERVICE_ROLE_KEY = supabase.serviceKey;
  }

  if (Object.keys(resolved).length === 0) {
    console.error('No Supabase credentials found in the current environment.');
    process.exit(1);
  }

  const parameterBase =
    process.env.ALEX_AI_PARAMETER_NAMESPACE || '/alex-ai/supabase';

  const commands = Object.entries(resolved).map(([name, value]) => {
    const parameterName = `${parameterBase}/${name.toLowerCase().replace(/_/g, '-')}`;
    return {
      parameterName,
      command: [
        'aws',
        'ssm',
        'put-parameter',
        '--name',
        parameterName,
        '--type',
        'SecureString',
        '--value',
        value,
        '--overwrite',
      ],
    };
  });

  console.log(
    JSON.stringify(
      {
        namespace: parameterBase,
        variables: resolved,
        commands: commands.map((entry) => ({
          name: entry.parameterName,
          command: entry.command.join(' '),
        })),
      },
      null,
      2,
    ),
  );
}

main();

