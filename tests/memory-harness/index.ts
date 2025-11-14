#!/usr/bin/env ts-node

import axios from 'axios';
import crypto from 'crypto';

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

async function sendMemory(payload: MemoryPayload) {
  const url = process.env.MEMORY_WEBHOOK_URL || `${process.env.N8N_URL}/webhook/crew-memory-storage`;
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

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    for (const result of results) {
      const record = await fetchMemoryRecord(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, result.id);
      if (!record) {
        throw new Error(`Memory ${result.id} not found in Supabase`);
      }
      console.log(`Verified memory ${result.id} for crew ${record.crew_member}`);
    }
  }

  console.log(`Harness complete. Inserted ${results.length} memories.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

