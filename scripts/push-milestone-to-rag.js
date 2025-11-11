#!/usr/bin/env node

/**
 * 📚 Push Milestone to RAG Memory
 *
 * Reads the latest milestone markdown file (or a file passed as an argument)
 * and sends a structured summary to the Knowledge Ingest webhook so the crew
 * can recall progress without digging through git history.
 *
 * Usage:
 *   node scripts/push-milestone-to-rag.js                # auto-detect latest milestone
 *   node scripts/push-milestone-to-rag.js MILESTONE_v2.4.0_AUTOMATED_CREW_WEBHOOK_REGISTRATION.md
 */

'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const WORKSPACE_ROOT = process.cwd();
const MILESTONE_PREFIX = 'MILESTONE_v';
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'validation-results');
const WEBHOOK_PATH = process.env.N8N_MILESTONE_WEBHOOK || 'knowledge-ingest';

const creds = loadCrewCredentials();
const N8N_BASE_URL = creds.n8n.baseUrl;
const WEBHOOK_URL = `${N8N_BASE_URL}/webhook/${WEBHOOK_PATH}`;

function printInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function printSuccess(message) {
  console.log(`✅ ${message}`);
}

function printError(message) {
  console.error(`❌ ${message}`);
}

function findLatestMilestone() {
  const files = fs.readdirSync(WORKSPACE_ROOT)
    .filter((name) => name.startsWith(MILESTONE_PREFIX) && name.endsWith('.md'))
    .map((name) => ({
      name,
      fullPath: path.join(WORKSPACE_ROOT, name),
      mtime: fs.statSync(path.join(WORKSPACE_ROOT, name)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    return null;
  }

  return files[0];
}

function extractSections(markdown) {
  const lines = markdown.split('\n');
  const title = lines.find((line) => line.startsWith('#')) || 'Milestone Update';

  const sections = {};
  let currentHeading = 'overview';
  sections[currentHeading] = [];

  lines.forEach((line) => {
    const headingMatch = line.match(/^#{2,}\s+(.*)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim().toLowerCase();
      sections[currentHeading] = [];
    } else {
      sections[currentHeading].push(line);
    }
  });

  const overview = sections['overview']?.join('\n').trim() || '';
  const deliverables = sections['key deliverables']?.join('\n').trim() || '';
  const status = sections['current status']?.join('\n').trim() || '';
  const nextSteps = sections['next steps']?.join('\n').trim() || '';

  return {
    title: title.replace(/^#\s+/, '').trim(),
    overview,
    deliverables,
    status,
    nextSteps,
  };
}

async function pushToWebhook(payload) {
  return axios.post(WEBHOOK_URL, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });
}

function writeReport(report) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const filePath = path.join(OUTPUT_DIR, `milestone-ingest-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  return filePath;
}

async function main() {
  const targetFile = process.argv[2];
  let milestoneFile;

  if (targetFile) {
    const fullPath = path.isAbsolute(targetFile) ? targetFile : path.join(WORKSPACE_ROOT, targetFile);
    if (!fs.existsSync(fullPath)) {
      printError(`Milestone file not found: ${fullPath}`);
      process.exit(1);
    }
    milestoneFile = { name: path.basename(fullPath), fullPath };
  } else {
    milestoneFile = findLatestMilestone();
    if (!milestoneFile) {
      printError('No milestone files found. Expected files starting with "MILESTONE_v".');
      process.exit(1);
    }
  }

  printInfo(`Using milestone file: ${milestoneFile.name}`);
  const content = fs.readFileSync(milestoneFile.fullPath, 'utf8');
  const sections = extractSections(content);

  const summary = {
    title: sections.title,
    overview: sections.overview || sections.deliverables || content.slice(0, 500),
    deliverables: sections.deliverables,
    status: sections.status,
    nextSteps: sections.nextSteps,
    sourceFile: milestoneFile.name,
    timestamp: new Date().toISOString(),
  };

  printInfo('Sending milestone summary to knowledge ingest webhook...');
  let response;
  try {
    response = await pushToWebhook({
      source: 'milestone',
      milestone: summary,
    });
  } catch (error) {
    const status = error.response?.status ?? 'ERR';
    printError(`Webhook call failed (HTTP ${status}): ${error.message}`);
    const reportPath = writeReport({
      success: false,
      error: error.message,
      status,
      milestone: summary,
    });
    printInfo(`Failure details saved to ${reportPath}`);
    process.exit(1);
  }

  printSuccess('Milestone successfully ingested into RAG system.');
  const reportPath = writeReport({
    success: true,
    status: response.status,
    milestone: summary,
  });
  printInfo(`Ingestion report saved to ${reportPath}`);
}

main().catch((error) => {
  printError(`Fatal error: ${error.message || error}`);
  process.exit(1);
});

