'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

function readEnv(key) {
  const value = process.env[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return undefined;
}

function readFileIfExists(filePath) {
  if (!filePath) return undefined;
  const resolved = filePath.startsWith('~')
    ? path.join(os.homedir(), filePath.slice(1))
    : path.resolve(filePath);
  if (fs.existsSync(resolved)) {
    return fs.readFileSync(resolved, 'utf8');
  }
  return undefined;
}

function main() {
  const creds = loadCrewCredentials();

  const defaults = {
    N8N_SSH_HOST: 'n8n.pbradygeorgen.com',
    N8N_SSH_USER: 'ubuntu',
    N8N_SSH_KEY_FILE: '~/.ssh/n8n.pem',
    N8N_REMOTE_PATH: '/home/ubuntu/alex-ai-universal',
  };

  const sshKeyFile = readEnv('N8N_SSH_KEY_FILE') || defaults.N8N_SSH_KEY_FILE;

  const secrets = {
    SUPABASE_URL: creds.supabase.url,
    SUPABASE_SERVICE_ROLE_KEY: creds.supabase.serviceKey,
    SUPABASE_ANON_KEY: readEnv('SUPABASE_ANON_KEY'),
    SUPABASE_API_KEY: readEnv('SUPABASE_API_KEY'),
    N8N_URL: creds.n8n.baseUrl,
    N8N_OWNER_API_KEY: creds.n8n.ownerApiKey,
    N8N_API_KEY: creds.n8n.apiKey,
    AWS_ACCESS_KEY_ID: readEnv('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: readEnv('AWS_SECRET_ACCESS_KEY'),
    AWS_REGION: readEnv('AWS_REGION'),
    N8N_SSH_HOST: readEnv('N8N_SSH_HOST') || defaults.N8N_SSH_HOST,
    N8N_SSH_USER: readEnv('N8N_SSH_USER') || defaults.N8N_SSH_USER,
    N8N_SSH_KEY: readEnv('N8N_SSH_KEY') || readFileIfExists(sshKeyFile),
    N8N_REMOTE_PATH: readEnv('N8N_REMOTE_PATH') || defaults.N8N_REMOTE_PATH,
    ALEX_AI_PARAMETER_NAMESPACE: readEnv('ALEX_AI_PARAMETER_NAMESPACE'),
  };

const trimmed = Object.fromEntries(
  Object.entries(secrets).filter(([, value]) => value !== undefined && value !== ''),
);

const key = process.argv[2];

if (key) {
  const value = trimmed[key];
  if (value !== undefined) {
    process.stdout.write(value);
  }
  return;
}

  console.log(JSON.stringify(trimmed, null, 2));
}

main();

