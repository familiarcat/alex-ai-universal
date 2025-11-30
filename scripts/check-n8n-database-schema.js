#!/usr/bin/env node

/**
 * 🔍 Check n8n Database Schema
 * 
 * Inspects the n8n database to understand webhook storage
 * and find why webhooks aren't registering.
 */

const { execSync } = require('child_process');

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 CHECKING N8N DATABASE SCHEMA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Get instance IP
const publicIP = execSync(
  `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
  { encoding: 'utf8', stdio: 'pipe' }
).trim();

const tempKeyPath = `${process.env.HOME}/.ssh/ec2-instance-connect-temp`;

// Inject key
execSync(
  `aws ec2-instance-connect send-ssh-public-key --instance-id ${INSTANCE_ID} --availability-zone ${AVAILABILITY_ZONE} --instance-os-user ${SSH_USER} --ssh-public-key file://${tempKeyPath}.pub --region ${REGION}`,
  { stdio: 'pipe' }
);

// Wait for key
setTimeout(() => {
  console.log('1️⃣  Checking database schema...\n');
  
  try {
    const schema = execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "sudo sqlite3 /home/ubuntu/.n8n/database.sqlite '.schema webhook_entity' 2>&1"`,
      { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
    ).trim();
    
    console.log('Webhook Entity Schema:');
    console.log(schema);
    console.log('');
  } catch (error) {
    console.log(`   ⚠️  Could not get schema: ${error.message}\n`);
  }

  console.log('2️⃣  Listing all tables...\n');
  try {
    const tables = execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "sudo sqlite3 /home/ubuntu/.n8n/database.sqlite '.tables' 2>&1"`,
      { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
    ).trim();
    
    console.log('Database Tables:');
    console.log(tables);
    console.log('');
  } catch (error) {
    console.log(`   ⚠️  Could not list tables: ${error.message}\n`);
  }

  console.log('3️⃣  Checking for webhook entries...\n');
  try {
    // Try different column names
    const queries = [
      "SELECT * FROM webhook_entity LIMIT 5;",
      "SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE '%webhook%';",
      "PRAGMA table_info(webhook_entity);"
    ];

    for (const query of queries) {
      try {
        const result = execSync(
          `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "sudo sqlite3 /home/ubuntu/.n8n/database.sqlite '${query}' 2>&1"`,
          { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
        ).trim();
        
        if (result && !result.includes('Error') && !result.includes('no such')) {
          console.log(`Query: ${query}`);
          console.log(result);
          console.log('');
        }
      } catch (e) {
        // Skip failed queries
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Could not query webhooks: ${error.message}\n`);
  }

  console.log('✅ Database check complete\n');
}, 2000);

