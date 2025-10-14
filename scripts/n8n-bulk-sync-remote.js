#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { N8NClient, importWorkflow } = require('./n8n-cli-tools.js');

async function main() {
  const dir = path.join(process.cwd(), 'exported-workflows');
  if (!fs.existsSync(dir)) {
    console.error('❌ exported-workflows directory not found. Run: npm run n8n:export');
    process.exit(1);
  }

  const n8nUrl = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
  const n8nKey = process.env.N8N_API_KEY;
  if (!n8nKey) {
    console.error('❌ N8N_API_KEY is required');
    process.exit(1);
  }

  const client = new N8NClient(n8nUrl, n8nKey);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const imported = [];

  for (const f of files) {
    const full = path.join(dir, f);
    const { workflow } = await importWorkflow(client, full);
    imported.push({ id: workflow.id, name: workflow.name });
    console.log(`✅ Synced: ${workflow.name} (${workflow.id})`);
  }

  // Persist imported list for activation step
  const listPath = path.join(process.cwd(), 'exported-workflows', 'imported-list.json');
  fs.writeFileSync(listPath, JSON.stringify(imported, null, 2));
  console.log(`📄 Imported list: ${listPath}`);

  // Attempt activation via AWS EC2 Instance Connect + SSH (optional)
  if (process.env.AWS_REGION && process.env.AWS_DEFAULT_REGION || true) {
    try {
      const instanceId = process.env.N8N_EC2_INSTANCE_ID || 'i-0afdf313f61f22df0';
      const az = process.env.N8N_EC2_AZ || 'us-east-2b';
      const pubKeyPath = fs.existsSync(path.join(process.env.HOME, '.ssh', 'id_rsa.pub'))
        ? path.join(process.env.HOME, '.ssh', 'id_rsa.pub')
        : path.join(process.env.HOME, '.ssh', 'id_ed25519.pub');
      const privKeyPath = pubKeyPath.replace(/\.pub$/, '');

      // Send temporary key
      execSync(`aws ec2-instance-connect send-ssh-public-key --instance-id ${instanceId} --availability-zone ${az} --instance-os-user ubuntu --ssh-public-key "$(cat ${pubKeyPath})"`, { stdio: 'inherit' });

      // Get public IP
      const ip = execSync(`aws ec2 describe-instances --instance-ids ${instanceId} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`).toString().trim();

      // Build remote activation shell
      const ids = imported.map(w => w.id).join(' ');
      const remote = `set -e; cname=\"$(docker ps --format '{{.Names}} {{.Image}}' | awk '/n8n/ {print $1; exit}')\"; if [ -z \"$cname\" ]; then echo 'No n8n container found'; exit 1; fi; for id in ${ids}; do echo Activating $id; docker exec \"$cname\" n8n update:workflow --id $id --active=true || true; done; docker restart \"$cname\" >/dev/null; echo 'Activation done.'`;

      // Run activation
      execSync(`ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${privKeyPath} ubuntu@${ip} "${remote}"`, { stdio: 'inherit' });
      console.log('🟢 Remote activation attempted');
    } catch (e) {
      console.warn('⚠️  Remote activation skipped/fallback:', e.message);
    }
  }

  console.log('🎯 Bulk sync complete.');
}

if (require.main === module) {
  main().catch(err => { console.error('❌', err.message); process.exit(1); });
}


