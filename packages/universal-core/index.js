/**
 * Minimal universal core used by the CLI and editor integrations.
 * Restores crew-based coordination by loading the real crew profiles and
 * generating structured Observation Lounge style responses.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_WEBHOOK_TIMEOUT_MS = Number(process.env.ALEX_AI_WEBHOOK_TIMEOUT_MS || 20000);
const DEFAULT_WEBHOOK_THROTTLE_MS = Number(process.env.ALEX_AI_WEBHOOK_THROTTLE_MS || 250);
const MAX_CREW_WEBHOOKS = Number(process.env.ALEX_AI_MAX_CREW_WEBHOOKS || 4);

const LOAD_CREW_CREDENTIALS_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'scripts',
  'utils',
  'load-crew-credentials.js'
);

let loadCrewCredentials = null;
try {
  const credentialModule = require(LOAD_CREW_CREDENTIALS_PATH);
  if (typeof credentialModule === 'function') {
    loadCrewCredentials = credentialModule;
  } else if (credentialModule && typeof credentialModule.loadCrewCredentials === 'function') {
    loadCrewCredentials = credentialModule.loadCrewCredentials;
  }
} catch (error) {
  if (process.env.ALEX_AI_DEBUG === 'true') {
    console.warn(`⚠️  Unable to load crew credentials helper: ${error.message}`);
  }
}

function debugLog(...args) {
  if (process.env.ALEX_AI_DEBUG === 'true') {
    console.log('[alex-ai:cli]', ...args);
  }
}

function delay(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CREW_DIRECTORY = path.resolve(__dirname, '..', '..', 'crew-members');
const keywordBoosts = {
  captain_picard: ['strategic', 'decision', 'ethics', 'vision', 'leadership', 'plan', 'architecture'],
  commander_data: ['data', 'analytics', 'ai', 'ml', 'algorithm', 'logic', 'pattern'],
  geordi_la_forge: ['infrastructure', 'integration', 'api', 'typescript', 'node', 'performance'],
  commander_riker: ['tactical', 'workflow', 'execution', 'implement', 'coordinate'],
  lieutenant_worf: ['security', 'compliance', 'test', 'risk', 'quality', 'validation'],
  counselor_troi: ['ux', 'user', 'experience', 'accessibility', 'empathy', 'design'],
  dr_crusher: ['health', 'diagnostic', 'monitor', 'optimize', 'performance', 'bottleneck'],
  lieutenant_uhura: ['communication', 'documentation', 'io', 'message', 'handoff'],
  quark: ['business', 'roi', 'budget', 'cost', 'value', 'profit', 'revenue'],
  chief_obrien: ['simple', 'quick', 'fix', 'practical', 'pragmatic', 'over-engineer', 'complex', 'hydration', 'cookie', 'ssr']
};

let crewCache = null;

function loadCrewProfiles() {
  if (crewCache) {
    return crewCache;
  }

  const members = [];
  const files = fs.existsSync(CREW_DIRECTORY) ? fs.readdirSync(CREW_DIRECTORY) : [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = fs.readFileSync(path.join(CREW_DIRECTORY, file), 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        members.push(parsed);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to load crew profile ${file}: ${error.message}`);
    }
  }

  const map = new Map();
  members.forEach(member => map.set(member.id, member));
  crewCache = { members, map };
  return crewCache;
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

let cachedCredentials = null;
let cachedCredentialTimestamp = 0;

function getCrewCredentials() {
  if (!loadCrewCredentials) return null;
  const now = Date.now();
  if (cachedCredentials && now - cachedCredentialTimestamp < 60000) {
    return cachedCredentials;
  }
  try {
    const credentials = loadCrewCredentials();
    cachedCredentials = credentials;
    cachedCredentialTimestamp = now;
    return credentials;
  } catch (error) {
    debugLog(`Failed to load crew credentials: ${error.message}`);
    return null;
  }
}

function normalizeWebhookUrl(baseUrl, webhookPath) {
  if (!webhookPath) return null;
  if (webhookPath.startsWith('http://') || webhookPath.startsWith('https://')) {
    return webhookPath;
  }
  const sanitizedBase = (baseUrl || '').replace(/\/$/, '');
  if (webhookPath.startsWith('/')) {
    return `${sanitizedBase}${webhookPath}`;
  }
  return `${sanitizedBase}/${webhookPath}`;
}

async function postWebhookJson(url, payload, timeoutMs = DEFAULT_WEBHOOK_TIMEOUT_MS) {
  if (typeof globalThis.fetch !== 'function') {
    throw new Error('fetch is not available in this Node.js runtime (Node 18+ required).');
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer =
    controller && Number.isFinite(timeoutMs) && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    });

    const rawText = await response.text();
    let data = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = rawText;
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers ? Object.fromEntries(response.headers.entries()) : {}
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function stringifyForSummary(value, fallback = '') {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    return value.trim();
  }
  try {
    const serialized = JSON.stringify(value);
    return serialized.length > 600 ? `${serialized.slice(0, 597)}…` : serialized;
  } catch (error) {
    return fallback || String(value);
  }
}

function summarizeCrewPayload(payload, success, statusCode) {
  if (!success) {
    if (payload && typeof payload === 'object') {
      const message =
        payload.error ||
        payload.message ||
        payload.status ||
        stringifyForSummary(payload, '');
      return message || `Request failed with status ${statusCode}`;
    }
    if (typeof payload === 'string') {
      return payload;
    }
    return `Request failed with status ${statusCode}`;
  }

  if (!payload) {
    return 'Received empty response payload.';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  const preferredFields = [
    'summary',
    'status',
    'message',
    'result',
    'analysis',
    'content',
    'response'
  ];

  for (const field of preferredFields) {
    if (typeof payload[field] === 'string') {
      return payload[field];
    }
    if (payload[field] && typeof payload[field] === 'object') {
      return stringifyForSummary(payload[field]);
    }
  }

  if (payload.data) {
    if (typeof payload.data === 'string') {
      return payload.data;
    }
    if (payload.data.summary || payload.data.message) {
      return stringifyForSummary(payload.data.summary || payload.data.message);
    }
  }

  return stringifyForSummary(payload, 'Received structured response.');
}

async function gatherLiveCrewReports(assignments, crewMap, message) {
  const diagnostics = [];
  const reports = [];

  const credentials = getCrewCredentials();
  if (!credentials || !credentials.n8n || !credentials.n8n.baseUrl) {
    diagnostics.push('Live crew telemetry unavailable (missing N8N credentials).');
    return { reports, diagnostics };
  }

  const webhookBase = (
    process.env.N8N_WEBHOOK_BASE ||
    `${credentials.n8n.baseUrl.replace(/\/$/, '')}/webhook`
  ).replace(/\/$/, '');

  const requestId = crypto.randomUUID();
  const maxCrew = Number.isFinite(MAX_CREW_WEBHOOKS) && MAX_CREW_WEBHOOKS > 0 ? MAX_CREW_WEBHOOKS : 4;

  for (const assignment of assignments.slice(0, maxCrew)) {
    const crew = crewMap.get(assignment.crewMemberId);
    if (!crew) continue;

    const n8nConfig = crew.integrations && crew.integrations.n8n;
    const webhookPath =
      (n8nConfig && n8nConfig.webhookPath) ||
      `/webhook/${String(crew.id).replace(/_/g, '-')}`;
    const url = normalizeWebhookUrl(webhookBase, webhookPath.replace(/^\/webhook\//, ''));
    if (!url) {
      diagnostics.push(`Missing webhook path for ${crew.name}.`);
      continue;
    }

    const payload = {
      request_id: requestId,
      crew_member: crew.id,
      crew_name: crew.name,
      role: crew.role,
      priority: 'user_request',
      timestamp: new Date().toISOString(),
      query: message,
      source: 'alex-ai-npx-cli',
      context: {
        matchedKeywords: assignment.matchedKeywords,
        score: assignment.score
      }
    };

    try {
      debugLog(`POST ${url}`);
      const response = await postWebhookJson(url, payload);
      const summary = summarizeCrewPayload(response.data, response.ok, response.status);
      reports.push({
        crewId: crew.id,
        crewName: crew.name,
        role: crew.role,
        success: response.ok,
        status: response.status,
        summary,
        receivedAt: new Date().toISOString(),
        payload: response.data
      });

      if (!response.ok) {
        diagnostics.push(
          `${crew.name} webhook responded with status ${response.status}: ${summary}`
        );
      }
    } catch (error) {
      diagnostics.push(`${crew.name} webhook error: ${error.message}`);
      reports.push({
        crewId: crew.id,
        crewName: crew.name,
        role: crew.role,
        success: false,
        status: 'error',
        summary: error.message,
        receivedAt: new Date().toISOString(),
        payload: null
      });
    }

    await delay(DEFAULT_WEBHOOK_THROTTLE_MS);
  }

  return { reports, diagnostics };
}

function scoreCrewMember(crew, lowerQuery) {
  let score = 0;
  const matched = new Set();

  normalizeArray(crew.specialization).forEach(spec => {
    if (typeof spec === 'string' && lowerQuery.includes(spec.toLowerCase())) {
      score += 3;
      matched.add(spec);
    }
  });

  normalizeArray(crew.capabilities).forEach(capability => {
    if (typeof capability !== 'string') return;
    const normalized = capability.replace(/_/g, ' ').toLowerCase();
    if (lowerQuery.includes(normalized) || lowerQuery.includes(capability.toLowerCase())) {
      score += 2;
      matched.add(capability);
    }
  });

  normalizeArray(crew.typicalUseCases).forEach(useCase => {
    if (typeof useCase === 'string' && lowerQuery.includes(useCase.toLowerCase())) {
      score += 4;
      matched.add(useCase);
    }
  });

  const boosts = keywordBoosts[crew.id] || [];
  boosts.forEach(keyword => {
    if (lowerQuery.includes(keyword)) {
      score += 1;
      matched.add(keyword);
    }
  });

  if (crew.role && lowerQuery.includes(String(crew.role).toLowerCase())) {
    score += 1;
    matched.add(crew.role);
  }

  return {
    score,
    matchedKeywords: Array.from(matched)
  };
}

function generateReason(crew, keywords) {
  if (!keywords || keywords.length === 0) return 'General expertise match';
  const preview = keywords.slice(0, 3).join(', ');
  return keywords.length > 3 ? `Matched: ${preview}…` : `Matched: ${preview}`;
}

function assignCrew(message, crewMembers) {
  const lowerQuery = message.toLowerCase();
  const assignments = [];

  crewMembers.forEach(crew => {
    const { score, matchedKeywords } = scoreCrewMember(crew, lowerQuery);
    if (score > 0) {
      assignments.push({
        crewMemberId: crew.id,
        score,
        matchedKeywords,
        reason: generateReason(crew, matchedKeywords)
      });
    }
  });

  assignments.sort((a, b) => b.score - a.score);

  if (assignments.length === 0) {
    assignments.push({
      crewMemberId: 'captain_picard',
      score: 0,
      matchedKeywords: [],
      reason: 'No direct match detected — routing to Captain Picard for strategic guidance'
    });
  }

  return assignments;
}

function shortName(fullName) {
  if (!fullName) return 'the crew';
  const segments = String(fullName).split(' ');
  return segments[0] || fullName;
}

function chooseFocus(crew) {
  const useCases = normalizeArray(crew.typicalUseCases);
  if (useCases.length > 0) return useCases[0];
  const specialization = normalizeArray(crew.specialization);
  if (specialization.length > 0) return specialization[0];
  return crew.role || 'their speciality';
}

function buildActionPlan(assignments, crewMap, message) {
  const actions = [];
  const top = crewMap.get(assignments[0].crewMemberId);
  if (top) {
    actions.push(`Clarify mission goals and success criteria so ${shortName(top.name)} can chart the strategic course forward.`);
  } else {
    actions.push('Clarify mission goals and success criteria so the crew can chart the strategic course forward.');
  }

  if (assignments[1]) {
    const second = crewMap.get(assignments[1].crewMemberId);
    if (second) {
      actions.push(`Delegate hands-on planning to ${shortName(second.name)}; focus on ${chooseFocus(second).toLowerCase()} while keeping communication flowing.`);
    }
  }

  if (assignments[2]) {
    const third = crewMap.get(assignments[2].crewMemberId);
    if (third) {
      actions.push(`Loop ${shortName(third.name)} in early to monitor ${chooseFocus(third).toLowerCase()} and flag risks before they escalate.`);
    }
  }

  if (actions.length < 3) {
    actions.push('Capture any open questions and confirm ownership for follow-up within the hour.');
  }
  if (actions.length < 3) {
    actions.push('Schedule a quick observation lounge sync once the first pass is ready to review findings.');
  }

  return actions.slice(0, 3);
}

function buildCrewBriefing(message, assignments, crewMap, crewReports = [], diagnostics = []) {
  const lines = [];
  lines.push('## Observation Lounge Coordination');
  lines.push('');
  lines.push(`> ${message}`);
  lines.push('');

  const leadAssignment = assignments[0];
  const leadCrew = crewMap.get(leadAssignment.crewMemberId);
  if (leadCrew) {
    lines.push(`**Mission Lead:** ${leadCrew.name} (${leadCrew.role})`);
    lines.push(leadAssignment.reason || 'Primary crew lead selected for strategic guidance.');
    lines.push('');
  }

  lines.push('### Crew Briefing');
  assignments.slice(0, 3).forEach((assignment, index) => {
    const crew = crewMap.get(assignment.crewMemberId);
    if (!crew) return;
    const heading = `${index + 1}. **${crew.name} — ${crew.role}**`;
    lines.push(heading);
    const matchLine = assignment.matchedKeywords.length > 0
      ? `   - Keyword match: ${assignment.matchedKeywords.join(', ')}`
      : '   - Applying core expertise';
    lines.push(matchLine);
    const focusAreas = normalizeArray(crew.typicalUseCases).slice(0, 2);
    if (focusAreas.length > 0) {
      lines.push(`   - Focus areas: ${focusAreas.join('; ')}`);
    }
    const guideline = normalizeArray(crew.aiConfiguration?.guidelines).find(Boolean);
    if (guideline) {
      lines.push(`   - Guidance: ${guideline}`);
    } else if (crew.personality?.responseStyle) {
      lines.push(`   - Perspective: ${crew.personality.responseStyle}`);
    }
    const catchphrase = normalizeArray(crew.personality?.catchphrases).find(Boolean);
    if (catchphrase) {
      lines.push(`   - Reminder: "${catchphrase}"`);
    }
    lines.push('');
  });

  lines.push('### Recommended Next Steps');
  const actions = buildActionPlan(assignments, crewMap, message);
  actions.forEach((action, idx) => {
    lines.push(`${idx + 1}. ${action}`);
  });
  lines.push('');
  lines.push('_Crew coordination complete. Request deeper analysis or implementation support at any time._');

  if (crewReports.length > 0 || diagnostics.length > 0) {
    lines.push('');
    lines.push('### Live Crew Responses');
    if (crewReports.length === 0) {
      lines.push('- No live responses available.');
    } else {
      crewReports.forEach((report) => {
        const header = `- **${report.crewName} — ${report.role || 'Crew Specialist'}**`;
        lines.push(header);
        if (report.success) {
          lines.push(`  - ${report.summary || 'Response received.'}`);
        } else {
          lines.push(`  - ⚠️ ${report.summary || 'No response received.'}`);
        }
        if (report.payload && typeof report.payload === 'object' && report.payload.recommendations) {
          const recs = Array.isArray(report.payload.recommendations)
            ? report.payload.recommendations
            : [report.payload.recommendations];
          recs.slice(0, 3).forEach((rec) => {
            if (rec) {
              lines.push(`    • ${typeof rec === 'string' ? rec : stringifyForSummary(rec)}`);
            }
          });
        }
      });
    }

    diagnostics.forEach((messageText) => {
      lines.push(`> ⚠️ ${messageText}`);
    });
  }

  return lines.join('\n');
}

function buildRAGInsights(assignments, crewMap, crewReports = []) {
  const reportMap = new Map(crewReports.map((report) => [report.crewId, report]));
  return assignments.slice(0, 3).map(assignment => {
    const crew = crewMap.get(assignment.crewMemberId);
    if (!crew) return `Crew member ${assignment.crewMemberId} is on standby.`;
    const focus = chooseFocus(crew);
    const report = reportMap.get(assignment.crewMemberId);
    const summarySuffix = report
      ? ` Current telemetry: ${report.summary}`
      : '';
    return `${crew.name} is prepared to handle ${focus.toLowerCase()} — ${assignment.reason}.${summarySuffix}`;
  });
}

function formatCrewForResponse(assignments, crewMap) {
  return assignments.slice(0, 3).map(assignment => {
    const crew = crewMap.get(assignment.crewMemberId);
    if (!crew) {
      return {
        id: assignment.crewMemberId,
        name: assignment.crewMemberId,
        role: 'Crew Specialist',
        score: assignment.score,
        matchedKeywords: assignment.matchedKeywords
      };
    }
    return {
      id: crew.id,
      name: crew.name,
      role: crew.role,
      score: assignment.score,
      matchedKeywords: assignment.matchedKeywords,
      specialization: normalizeArray(crew.specialization),
      capabilities: normalizeArray(crew.capabilities)
    };
  });
}

function buildWorkflowResults(assignments, crewMap, crewReports = []) {
  const reportMap = new Map(crewReports.map((report) => [report.crewId, report]));
  return assignments.slice(0, 3).map(assignment => {
    const crew = crewMap.get(assignment.crewMemberId);
    const report = reportMap.get(assignment.crewMemberId);
    if (!crew) {
      return {
        crewMember: assignment.crewMemberId,
        matchedKeywords: assignment.matchedKeywords,
        score: assignment.score,
        success: report ? report.success : false,
        responseSummary: report ? report.summary : null,
        responseStatus: report ? report.status : null,
        receivedAt: report ? report.receivedAt : null
      };
    }
    return {
      crewMember: crew.name,
      matchedKeywords: assignment.matchedKeywords,
      score: assignment.score,
      workflowId: crew.integrations?.n8n?.workflowId || null,
      webhookPath: crew.integrations?.n8n?.webhookPath || null,
      reason: assignment.reason,
      success: report ? report.success : true,
      responseSummary: report ? report.summary : null,
      responseStatus: report ? report.status : null,
      receivedAt: report ? report.receivedAt : null
    };
  });
}

function createCore() {
  const core = {
    async initialize() {
      loadCrewProfiles();
    },

    async processMessage(message) {
      if (!message || typeof message !== 'string') {
        return {
          success: false,
          message: 'Please provide a valid prompt for the crew.',
          coordinatedResponse: '',
          crewMembers: [],
          ragInsights: [],
          n8nWorkflowResults: [],
          crossPlatformSync: { platformsSynced: 0, memoriesShared: 0, crewConsciousnessUpdated: false }
        };
      }

      await core.initialize();
      const { members, map } = crewCache;
      const assignments = assignCrew(message, members);
      const { reports, diagnostics } = await gatherLiveCrewReports(assignments, map, message);
      const responseText = buildCrewBriefing(message, assignments, map, reports, diagnostics);
      const workflowResults = buildWorkflowResults(assignments, map, reports);

      if (diagnostics.length > 0) {
        workflowResults.push({
          crewMember: 'system',
          matchedKeywords: [],
          score: 0,
          workflowId: null,
          webhookPath: null,
          reason: 'Diagnostics',
          success: false,
          responseSummary: diagnostics.join(' | '),
          responseStatus: 'diagnostic',
          receivedAt: new Date().toISOString()
        });
      }

      return {
        success: true,
        message: responseText,
        coordinatedResponse: responseText,
        crewMembers: formatCrewForResponse(assignments, map),
        ragInsights: buildRAGInsights(assignments, map, reports),
        n8nWorkflowResults: workflowResults,
        crossPlatformSync: {
          platformsSynced: 1,
          memoriesShared: 0,
          crewConsciousnessUpdated: false
        },
        diagnostics
      };
    },

    async queryCrewMember(id) {
      await core.initialize();
      return crewCache.map.get(id) || null;
    }
  };

  return core;
}

function createCommands(core) {
  return {
    chat: async (message) => core.processMessage(message),
    status: async () => {
      await core.initialize();
      const members = crewCache ? crewCache.members : [];
      const roster = members.map(member => `${member.name} (${member.role})`).join(', ');
      const coordinatedResponse = `Crew operational. Active roster: ${roster || 'No crew profiles found.'}`;
      return {
        success: true,
        message: coordinatedResponse,
        coordinatedResponse,
        crewMembers: formatCrewForResponse(
          members.slice(0, 5).map(member => ({
            crewMemberId: member.id,
            score: 0,
            matchedKeywords: [],
            reason: 'Status check'
          })),
          crewCache.map
        ),
        ragInsights: [],
        n8nWorkflowResults: [],
        crossPlatformSync: {
          platformsSynced: 1,
          memoriesShared: 0,
          crewConsciousnessUpdated: false
        }
      };
    }
  };
}

function createVSCodeExtension(_vscode) {
  const core = createCore();
  const commands = createCommands(core);
  return { core, commands };
}

function createNPXExtension() {
  const core = createCore();
  const commands = createCommands(core);
  return { core, commands };
}

module.exports = { createVSCodeExtension, createNPXExtension };
