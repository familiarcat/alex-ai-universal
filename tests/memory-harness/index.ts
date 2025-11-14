#!/usr/bin/env ts-node

import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type MemoryPayload = {
  crewMember: string;
  knowledgeType: string;
  priority: string;
  title: string;
  summary: string;
  detailedAnalysis: string;
  keyFindings: string[];
  conclusions: string[];
  recommendations: string[];
  tags: string[];
};

type HarnessResult = {
  id: string;
  crew_member: string;
  title: string;
};

function generateMemoryPayload(index: number, crew: string): MemoryPayload {
  return {
    crewMember: crew,
    knowledgeType: 'technical_analysis',
    priority: 'medium',
    title: `Harness Memory ${index} by ${crew}`,
    summary: `Automated harness memory ${index} stored by ${crew}.`,
    detailedAnalysis: `Harness run entry #${index}. Crew member ${crew} analyzed workflow stability and found results consistent.`,
    keyFindings: ['Stable execution', 'No regressions detected'],
    conclusions: ['System ready for next iteration'],
    recommendations: ['Continue monitoring'],
    tags: ['harness', 'automated', 'memory'],
  };
}

function resolveWebhookUrl() {
  const trimmedOverride = process.env.MEMORY_WEBHOOK_URL?.trim();
  if (trimmedOverride && /^https?:\/\//i.test(trimmedOverride)) {
    return trimmedOverride;
  }

  const baseCandidate = process.env.N8N_URL?.trim();
  const sanitizedBase =
    baseCandidate && /^https?:\/\//i.test(baseCandidate)
      ? baseCandidate.replace(/\/$/, '')
      : 'https://n8n.pbradygeorgen.com';

  return `${sanitizedBase}/webhook/crew-memory-storage`;
}

async function sendMemory(payload: MemoryPayload) {
  const url = resolveWebhookUrl();
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      `Memory harness requires a valid webhook URL; received "${url}". Set MEMORY_WEBHOOK_URL or N8N_URL secrets.`
    );
  }
  const response = await axios.post(url, { body: payload });
  return response.data;
}

async function fetchMemoryRecord(supabaseUrl: string, supabaseKey: string, id: string) {
  const response = await axios.get(`${supabaseUrl}/rest/v1/crew_memories?id=eq.${id}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });
  return response.data?.[0];
}

async function main() {
  const count = Number(process.env.HARNESS_COUNT || 5);
  const crews = ['picard', 'riker', 'data', 'la_forge', 'worf', 'troi', 'crusher', 'uhura', 'quark', 'chief_obrien'];
  const results: HarnessResult[] = [];
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const supabaseUrlIsValid = (() => {
    if (!supabaseUrl) return false;
    try {
      new URL(supabaseUrl);
      return !supabaseUrl.startsWith('***');
    } catch {
      return false;
    }
  })();

  for (let i = 0; i < count; i++) {
    const crew = crews[i % crews.length];
    const payload = generateMemoryPayload(i + 1, crew);
    const report = await sendMemory(payload);
    const memoryId = report?.memory_id || report?.memory?.id;
    if (!memoryId) {
      throw new Error(`No memory ID returned for payload ${i + 1}`);
    }
    results.push({ id: memoryId, crew_member: crew, title: payload.title });
  }

  if (supabaseUrlIsValid && supabaseKey) {
    for (const result of results) {
      const record = await fetchMemoryRecord(supabaseUrl!, supabaseKey, result.id);
      if (!record) {
        throw new Error(`Memory ${result.id} not found in Supabase`);
      }
      console.log(`Verified memory ${result.id} for crew ${record.crew_member}`);
    }
  } else {
    console.warn(
      'Skipping Supabase verification because SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are missing or masked.'
    );
  }

  console.log(`Harness complete. Inserted ${results.length} memories.`);

  const outputPath = path.join(__dirname, 'output.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ memoryIds: results.map((result) => result.id) }, null, 2),
    'utf8'
  );
  console.log(`Memory IDs written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

